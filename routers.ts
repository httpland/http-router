// Copyright 2022-latest the httpland authors. All rights reserved. MIT license.

import {
  ContextualHandler,
  HttpMethodRoutes,
  MatchedURLContext,
  MethodRouterConstructor,
  PathnameRoutes,
  URLPatternRoute,
  URLRouterConstructor,
  URLRoutes,
} from "./types.ts";
import {
  Handler,
  isIterable,
  mapKeys,
  safeResponse,
  Status,
  STATUS_TEXT,
} from "./deps.ts";
import {
  assertDuplicateBy,
  assertHasMember,
  equalsURLPattern,
  joinUrlPath,
} from "./utils.ts";

interface PatternMatchingCache {
  [k: string]: Readonly<{
    handler: ContextualHandler<MatchedURLContext>;
    context: MatchedURLContext;
  }>;
}

/** HTTP request url router.
 * {@link URLRouter} provides routing between HTTP request URLs and handlers.
 * Request URL are matched with the `URLPatten API`.
 *
 * @throws TypeError
 * @throws AssertionError
 *
 * ```ts
 * import { URLRouter } from "https://deno.land/x/http_router@$VERSION/mod.ts";
 * import { serve } from "https://deno.land/std@$VERSION/http/mod.ts";
 *
 * const handler = URLRouter({
 *   "/api/students/:name": (request, context) => {
 *     const greeting = `Hello! ${context.params.name!}`;
 *     return new Response(greeting);
 *   },
 *   "/api/status": () => new Response("OK"),
 * });
 *
 * await serve(handler);
 * ```
 */
export const URLRouter: URLRouterConstructor = (routes: URLRoutes, options) => {
  assertHasMember(routes);

  const iterable = urlPatternRouteFrom(routes);
  const entries = Array.from(iterable).map(([pattern, handler]) =>
    [new URLPattern(pattern), handler] as const
  );
  const url = entries.map(([urlPattern]) => urlPattern);

  assertDuplicateBy(url, equalsURLPattern);

  const status = Status.NotFound;
  const response = new Response(null, {
    status,
    statusText: STATUS_TEXT[status],
  });
  const cache: PatternMatchingCache = {};
  const handler: Handler = (request) => {
    const url = request.url;
    const cached = cache[url];

    if (cached) {
      return cached.handler(request, cached.context);
    }

    for (const [pattern, handler] of entries) {
      const result = pattern.exec(url);

      if (!result) continue;

      const context: MatchedURLContext = {
        pattern,
        result,
        params: result.pathname.groups,
      };
      const response = handler(request, context);

      cache[url] = {
        handler,
        context,
      };

      return response;
    }

    return response;
  };

  return (request) => safeResponse(() => handler(request), options?.onError);
};

/** HTTP request method router.
 * {@link MethodRouter} provides routing between HTTP request methods and handlers.
 *
 * @throws TypeError
 * @throws AssertionError
 *
 * ```ts
 * import { MethodRouter } from "https://deno.land/x/http_router@$VERSION/mod.ts";
 * import { serve } from "https://deno.land/std@$VERSION/http/mod.ts";
 *
 * const handler = MethodRouter({
 *   GET: () => new Response("From GET"),
 *   POST: async (request) => {
 *     const data = await request.json();
 *     return new Response("Received data!");
 *   },
 * });
 *
 * await serve(handler);
 * ```
 */
export const MethodRouter: MethodRouterConstructor = (
  routes,
  { withHead = true, onError } = {},
) => {
  assertHasMember(routes);

  if (withHead) {
    routes = mapHttpHead(routes);
  }

  const allow = Object.keys(routes).sort().join(",");
  const status = Status.MethodNotAllowed;
  const errResponse = new Response(null, {
    status: Status.MethodNotAllowed,
    statusText: STATUS_TEXT[status],
    headers: { allow },
  });
  const handler: Handler = (request) => {
    const handler = routes[request.method as keyof HttpMethodRoutes];

    return handler?.(request) ?? errResponse;
  };

  return (request) => safeResponse(() => handler(request), onError);
};

/** Nested URL pathname convertor.
 * It provides a hierarchy of routing tables.
 * You can define a tree structure with a depth of 1. To nest more, combine this.
 *
 * ```ts
 * import {
 *   nest,
 *   URLRouter,
 * } from "https://deno.land/x/http_router@$VERSION/mod.ts";
 *
 * const routeHandler = () => new Response();
 * const api = nest("/api", {
 *   ...nest("v1", {
 *     users: routeHandler,
 *     products: routeHandler,
 *   }),
 * });
 * const handler = URLRouter({ ...api, "/": routeHandler });
 * ```
 */
export function nest(root: string, routes: PathnameRoutes): PathnameRoutes {
  return mapKeys(routes, (key) => joinUrlPath(root, key));
}

function mapHttpHead(routes: HttpMethodRoutes): HttpMethodRoutes {
  if (!("GET" in routes) || "HEAD" in routes) return routes;

  return {
    ...routes,
    HEAD: toEmptyResponseHandler(routes.GET!),
  };
}

function urlPatternRouteFrom(routes: URLRoutes): Iterable<URLPatternRoute> {
  return isIterable(routes)
    ? routes
    : Object.entries(routes).map(([pathname, handler]) =>
      [{ pathname }, handler] as const
    );
}

function toEmptyResponseHandler(handler: Handler): Handler {
  return async (req) => {
    const res = await handler(req);

    return new Response(null, res);
  };
}
