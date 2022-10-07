// Copyright 2022-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  HttpMethodRoutes,
  MethodRouterConstructor,
  URLRouteHandler,
  URLRouteHandlerContext,
  URLRouterConstructor,
  URLRoutes,
} from "./types.ts";
import {
  Handler,
  isOk,
  prop,
  safeResponse,
  Status,
  STATUS_TEXT,
} from "./deps.ts";
import { route2URLPatternRoute, urlPatternRouteFrom } from "./utils.ts";

interface MatchedCache {
  readonly handler: URLRouteHandler;
  readonly context: URLRouteHandlerContext;
}

type URLCache = { readonly matched: true } & MatchedCache | {
  readonly matched: false;
  readonly handler: Handler;
};

/** HTTP request url router.
 * {@link URLRouter} provides routing between HTTP request URLs and handlers.
 * Request URL are matched with the `URLPatten API`.
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
  const iterable = urlPatternRouteFrom(routes);
  const entries = Array.from(iterable).map(route2URLPatternRoute).filter(isOk)
    .map(prop("value"));
  const cache: { [k: string]: URLCache } = {};

  function query(url: string): URLCache {
    const cached = cache[url];

    if (cached) return cached;

    for (const [pattern, handler] of entries) {
      const result = pattern.exec(url);

      if (!result) continue;

      const context: URLRouteHandlerContext = {
        pattern,
        result,
        params: result.pathname.groups,
      };
      const data: URLCache = { handler, context, matched: true };
      cache[url] = data;

      return data;
    }

    const data: URLCache = { handler: handleNotFound, matched: false };
    cache[url] = data;

    return data;
  }

  return (request) =>
    safeResponse(() => {
      const result = query(request.url);

      if (result.matched) return result.handler(request, result.context);

      return result.handler(request);
    }, options?.onError);
};

/** HTTP request method router.
 * {@link MethodRouter} provides routing between HTTP request methods and handlers.
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

function toEmptyResponseHandler(handler: Handler): Handler {
  return async (req) => {
    const res = await handler(req);

    return new Response(null, res);
  };
}

function handleNotFound(): Response {
  const status = Status.NotFound;
  return new Response(null, {
    status,
    statusText: STATUS_TEXT[status],
  });
}
