// Copyright 2022-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  isEmptyObject,
  isFunction,
  isString,
  join,
  Status,
  STATUS_TEXT,
} from "./deps.ts";

/** HTTP request method. */
export type Method =
  /** RFC 9110, 9.3.1 */
  | "GET"
  /** RFC 9110, 9.3.2 */
  | "HEAD"
  /** RFC 9110, 9.3.3 */
  | "POST"
  /** RFC 9110, 9.3.4 */
  | "PUT"
  /** RFC 9110, 9.3.5 */
  | "DELETE"
  /** RFC 9110, 9.3.6 */
  | "CONNECT"
  /** RFC 9110, 9.3.7 */
  | "OPTIONS"
  /** RFC 9110, 9.3.8 */
  | "TRACE"
  /** RFC 5789 */
  | "PATCH"
  // deno-lint-ignore ban-types
  | ({} & string);

/** HTTP request router API. */
export interface Router {
  (req: Request): Response | Promise<Response>;
}

/**
 * A handler for HTTP route requests. Consumes a request and connection information
 * and returns a response.
 *
 * If a handler throws, the server calling the handler will assume the impact
 * of the error is isolated to the individual request. It will catch the error
 * and close the underlying connection.
 */
export type RouteHandler = (
  req: Request,
  ctx: Readonly<RouteHandlerContext>,
) => Promise<Response> | Response;

/** The {@link RouteHandler} context. */
export interface RouteHandlerContext {
  /** URL matched parameters.  */
  readonly params: { readonly [k in string]?: string };

  /** Route pathname. */
  readonly route: string;

  /** URL pattern. */
  readonly pattern: URLPattern;
}

/** HTTP router routes. */
export interface Routes {
  readonly [k: string]: RouteHandler | MethodRouteHandlers;
}

/** Create router options. */
export interface Options {
  /** If a `GET` handler is defined, it will be used to generate a response to the `HEAD` request.
   *
   * This feature is based on RFC 9110, 9.1
   * > All general-purpose servers MUST support the methods GET and HEAD.
   * @default true
   */
  withHead?: boolean;

  /** Change the router base path.
   * The `basePath` and route path are merged without overlapping slashes.
   * ```ts
   * import { createRouter } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   * import { assertEquals } from "https://deno.land/std@$VERSION/testing/asserts.ts";
   * const api = createRouter({
   *   "/hello": () => new Response("world"),
   * }, { basePath: "/api" });
   *
   * const res = await api(new Request("http://localhost/api/hello"));
   * assertEquals(res.ok, true);
   * ```
   */
  basePath?: string;
}

/** Map for HTTP method and {@link RouteHandler} */
export type MethodRouteHandlers = { [k in Method]?: RouteHandler };

function methods(
  methodRouteHandlers: Readonly<MethodRouteHandlers>,
): RouteHandler {
  return (req, params) => {
    const routeHandler = methodRouteHandlers[req.method];
    if (routeHandler) {
      return routeHandler(req, params);
    }

    const allows = Object.keys(methodRouteHandlers);

    return new Response(null, {
      status: Status.MethodNotAllowed,
      statusText: STATUS_TEXT[Status.MethodNotAllowed],
      headers: {
        allow: allows.join(","),
      },
    });
  };
}

/** Create HTTP request router.
 *
 * ```ts
 * import { createRouter } from "https://deno.land/x/http_router@$VERSION/mod.ts";
 * import { serve } from "https://deno.land/std@$VERSION/http/mod.ts";
 * const router = createRouter({
 *   "/api/students/:name": {
 *     GET: (req, ctx) => {
 *       const greeting = `Hello! ${ctx.params.name!}`;
 *       return new Response(greeting);
 *     },
 *   },
 *   "/api/status": () => new Response("OK"), // Any HTTP request method
 * });
 * await serve(router);
 * ```
 * @throws TypeError
 * - The given route path is invalid url path.
 */
export function createRouter(
  routes: Routes,
  { withHead = true, basePath }: Options = {},
): Router {
  const entries = Object.entries(routes).filter(isValidRouteEntry).map(
    createResolvedHandlerEntry(withHead),
  ).map(createUrlPatternHandlerEntry(basePath));

  const routeMap = new Map<URLPattern, RouteHandler>(entries);

  return (req) => resolveRequest(routeMap, req);
}

type RouteEntry = readonly [
  route: string,
  handler: RouteHandler | MethodRouteHandlers,
];

function isValidRouteEntry(
  [_, handler]: RouteEntry,
): boolean {
  return isFunction(handler) || !isEmptyObject(handler);
}

function resolveHandlerLike(
  handlerLike: RouteHandler | MethodRouteHandlers,
  withHead: Options["withHead"],
): RouteHandler {
  if (isFunction(handlerLike)) {
    return handlerLike;
  }
  const methodHandler = withHead ? withHeadHandler(handlerLike) : handlerLike;

  return methods(methodHandler);
}

function createResolvedHandlerEntry(withHead: Options["withHead"]) {
  function createEntry(
    [route, handlerLike]: RouteEntry,
  ): [route: string, handler: RouteHandler] {
    const handler = resolveHandlerLike(handlerLike, withHead);

    return [route, handler];
  }

  return createEntry;
}

function createUrlPatternHandlerEntry(basePath: Options["basePath"]) {
  function createEntry(
    [route, handler]: [route: string, handler: RouteHandler],
  ): [pattern: URLPattern, handler: RouteHandler] {
    const pathname = isString(basePath) ? join(basePath, route) : route;
    return [
      new URLPattern({ pathname }),
      handler,
    ];
  }

  return createEntry;
}

async function resolveRequest(
  routeMap: Iterable<[pattern: URLPattern, routeHandler: RouteHandler]>,
  req: Request,
): Promise<Response> {
  for (const [pattern, handler] of routeMap) {
    const result = pattern.exec(req.url);
    if (!result) continue;

    const ctx: RouteHandlerContext = {
      params: result.pathname.groups,
      route: result.pathname.input,
      pattern,
    };

    try {
      return await handler(req, ctx);
    } catch {
      return new Response(null, ResponseInit500);
    }
  }

  return new Response(null, {
    status: Status.NotFound,
    statusText: STATUS_TEXT[Status.NotFound],
  });
}

function withHeadHandler(
  methodRouteHandler: Readonly<MethodRouteHandlers>,
): MethodRouteHandlers {
  if (methodRouteHandler.HEAD || !methodRouteHandler.GET) {
    return methodRouteHandler;
  }

  const headHandler: RouteHandler = async (req: Request, params) => {
    try {
      const res = await methodRouteHandler.GET!(req, params);
      return new Response(null, res.clone());
    } catch {
      return new Response(null, ResponseInit500);
    }
  };

  return { ...methodRouteHandler, HEAD: headHandler };
}

const ResponseInit500: ResponseInit = {
  status: Status.InternalServerError,
  statusText: STATUS_TEXT[Status.InternalServerError],
};
