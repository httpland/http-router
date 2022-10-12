// Copyright 2022-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  HttpMethodRoutes,
  MethodRouterConstructor,
  RouterOptions,
  URLPatternRoute,
  URLRouteHandler,
  URLRouteHandlerContext,
  URLRouterConstructor,
  URLRoutes,
} from "./types.ts";
import {
  Handler,
  HttpMethod,
  isIterable,
  isOk,
  isResponse,
  LRUMap,
  partition,
  prop,
  Result,
  Status,
  STATUS_TEXT,
  unsafe,
} from "./deps.ts";

interface MatchedCache {
  readonly handler: URLRouteHandler;
  readonly context: URLRouteHandlerContext;
}

type URLCache = { readonly matched: true } & MatchedCache | {
  readonly matched: false;
  readonly handler: Handler;
};

const MAX_SIZE = 100_0;

/** HTTP request url router.
 * {@link URLRouter} provides routing between HTTP request URLs and handlers.
 * Request URL are matched with the `URLPatten API`.
 *
 * @throws {AggregateError} If the routes contain invalid route.
 *
 * @example
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
  const cache = new LRUMap<string, URLCache>(MAX_SIZE);
  const iterable = urlPatternRouteFrom(routes);
  const [oks, errs] = partition(
    Array.from(iterable).map(route2URLPatternRoute),
    isOk,
  );

  if (errs.length) {
    const errors = errs.map(prop("value"));

    throw AggregateError(errors, "Invalid routes.");
  }

  const entries = oks.map(prop("value"));

  function query(url: string): URLCache {
    const cached = cache.has(url);

    if (cached) return cache.get(url)!;

    for (const [pattern, handler] of entries) {
      const result = pattern.exec(url);

      if (!result) continue;

      const context: URLRouteHandlerContext = {
        pattern,
        result,
        params: result.pathname.groups,
      };
      const data: URLCache = { handler, context, matched: true };
      cache.set(url, data);

      return data;
    }

    const data: URLCache = { handler: handleNotFound, matched: false };
    cache.set(url, data);

    return data;
  }
  const handler: Handler = async (request) => {
    const result = query(request.url);

    if (!result.matched) return result.handler(request);

    return await process(
      request,
      (request) => result.handler(request, result.context),
      options,
    );
  };

  return handler;
};

async function process(
  request: Request,
  handle: (request: Request) => Promise<Response> | Response,
  options?: RouterOptions,
): Promise<Response> {
  const maybeRequest = await options?.beforeEach?.(request.clone()) ??
    request;
  const response = isResponse(maybeRequest)
    ? maybeRequest
    : await handle(maybeRequest);

  return await options?.afterEach?.(response.clone()) ?? response;
}

/** HTTP request method router.
 * {@link MethodRouter} provides routing between HTTP request methods and handlers.
 *
 * @example
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
  { withHead = true, beforeEach, afterEach } = {},
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
  const handler: Handler = async (request) => {
    const handler = routes[request.method as HttpMethod];

    if (!handler) return errResponse;

    return await process(request, (request) => handler(request as never), {
      beforeEach,
      afterEach,
    });
  };

  return handler;
};

function mapHttpHead(routes: HttpMethodRoutes): HttpMethodRoutes {
  if (!("GET" in routes) || "HEAD" in routes) return routes;

  return {
    ...routes,
    HEAD: toEmptyResponseHandler(routes.GET! as Handler),
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

function urlPatternRouteFrom(
  routes: URLRoutes,
): Iterable<URLPatternRoute> {
  return isIterable(routes)
    ? routes
    : Object.entries(routes).map(([pathname, handler]) =>
      [{ pathname }, handler] as const
    );
}

function route2URLPatternRoute(
  route: URLPatternRoute,
): Result<[URLPattern, URLRouteHandler], TypeError> {
  return unsafe(
    () => [new URLPattern(route[0]), route[1]],
  );
}
