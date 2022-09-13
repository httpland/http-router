// Copyright 2022-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  duplicateBy,
  groupBy,
  isFunction,
  isString,
  mapValues,
  partition,
  Status,
  STATUS_TEXT,
} from "./deps.ts";
import { joinUrlPath } from "./utils.ts";
import { HttpMethod } from "./types.ts";
import { HttpMethods } from "./constants.ts";
import { RouterError } from "./errors.ts";

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
  readonly [k: string]:
    | RouteHandler
    | MethodRouteHandlers
    | Routes;
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
export type MethodRouteHandlers = { [k in HttpMethod]?: RouteHandler };

function methods(
  methodRouteHandlers: Readonly<MethodRouteHandlers>,
): RouteHandler {
  return (req, params) => {
    const routeHandler = methodRouteHandlers[req.method as HttpMethod];
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
 * @throws AggregateError
 * - If the routing table is invalid.
 */
export function createRouter(
  routes: Routes,
  { withHead = true, basePath }: Options = {},
): Router {
  const routeInfos = getRouteInfo(routes);
  const result = groupRouteInfo(routeInfos);

  if (!result.valid) {
    throw new AggregateError(
      result.errors,
      `One or more errors were detected in the routing table.`,
    );
  }

  const entries = Object.entries(result.data).map(
    createResolvedHandlerEntry(withHead),
  ).map(
    createUrlPatternHandlerEntry(basePath),
  );

  const routeMap = new Map<URLPattern, RouteHandler>(entries);

  return (req) => resolveRequest(routeMap, req);
}

interface RouteInfo {
  readonly route: string;
  readonly handler: RouteHandler;
  readonly method?: HttpMethod;
}

export function getRouteInfo(routes: Routes): RouteInfo[] {
  function run(routes: Routes, parentKey = ""): RouteInfo[] {
    const [flatRoutes, nestedRoutes] = partition(
      Object.entries(routes),
      ([, handlerLike]) => isFunction(handlerLike),
    ) as [
      [route: string, handler: RouteHandler][],
      [key: string, routes: Routes][],
    ];

    const result = flatRoutes.map(([key, handler]) => {
      if (isHttpMethod(key)) {
        return <RouteInfo> {
          method: key,
          handler,
          route: parentKey,
        };
      }
      return <RouteInfo> {
        handler,
        route: joinUrlPath(parentKey, key),
      };
    });

    const nestedResults = nestedRoutes.map(([key, routes]) =>
      run(routes, joinUrlPath(parentKey, key))
    );

    return [result, nestedResults].flat(2);
  }

  return run(routes);
}

type GroupedResult = {
  errors: [RouterError, ...RouterError[]];

  valid: false;
} | { valid: true; data: Record<string, RouteHandler | MethodRouteHandlers> };

export function groupRouteInfo(
  routeInfo: Iterable<RouteInfo>,
): GroupedResult {
  const [withMethodHandlers, rawHandlers] = partition(
    Array.from(routeInfo),
    ({ method }) => !!method,
  );

  const duplicatedWithRoute = duplicateBy(
    rawHandlers,
    ({ route }, prev) => route === prev.route,
  );
  const duplicatedWithMethodAndRoute = duplicateBy(
    withMethodHandlers,
    ({ method, route }, prev) => route === prev.route && method === prev.method,
  );

  const duplicated = duplicatedWithRoute.concat(duplicatedWithMethodAndRoute);

  if (duplicated.length) {
    const errors = duplicated.map(({ method, route }) => {
      const methodStr = method ? `[${method}] ` : "";
      return new RouterError(`Duplicated routes. ${methodStr}${route}`);
    }) as [RouterError, ...RouterError[]];

    return {
      valid: false,
      errors,
    };
  }

  const routeGroup = groupBy(
    withMethodHandlers,
    ({ route }) => route,
  ) as Record<string, RouteInfo[]>;
  const groupedRouteInfo = groupBy(rawHandlers, ({ route }) => route) as Record<
    string,
    RouteInfo[]
  >;

  const routeHandlers: Record<string, RouteHandler> = mapValues(
    groupedRouteInfo,
    (value) => value.reduce((_, cur) => cur).handler,
  );

  const methodRouteHandlers: Record<string, MethodRouteHandlers> = mapValues(
    routeGroup,
    (routeInfos) =>
      routeInfos.reduce((acc, cur) => {
        if (cur.method) {
          acc[cur.method] = cur.handler;
        }
        return acc;
      }, {} as MethodRouteHandlers) ?? {},
  );

  return {
    valid: true,
    data: { ...routeHandlers, ...methodRouteHandlers },
  };
}

function isHttpMethod(value: string): value is HttpMethod {
  return (HttpMethods as string[]).includes(value);
}

type RouteEntry = readonly [
  route: string,
  handler: RouteHandler | MethodRouteHandlers,
];

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
    const pathname = isString(basePath) ? joinUrlPath(basePath, route) : route;
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
