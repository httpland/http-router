// Copyright 2022-latest the httpland authors. All rights reserved. MIT license.

import {
  HttpMethodRoutes,
  MethodRouterConstructor,
  URLPatternRoute,
  URLRouteHandler,
  URLRouteHandlerContext,
  URLRouterConstructor,
  URLRoutes,
} from "./types.ts";
import { Handler, safeResponse, Status, STATUS_TEXT } from "./deps.ts";
import {
  assertHasMember,
  assertNotDuplicateBy,
  equalsURLPattern,
} from "./utils.ts";

interface PatternMatchingCache {
  [k: string]: Readonly<{
    handler: URLRouteHandler;
    context: URLRouteHandlerContext;
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

  assertNotDuplicateBy(url, equalsURLPattern);

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

      const context: URLRouteHandlerContext = {
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

function mapHttpHead(routes: HttpMethodRoutes): HttpMethodRoutes {
  if (!("GET" in routes) || "HEAD" in routes) return routes;

  return {
    ...routes,
    HEAD: toEmptyResponseHandler(routes.GET!),
  };
}

function urlPatternRouteFrom(routes: URLRoutes): Iterable<URLPatternRoute> {
  return Array.isArray(routes)
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
