// Copyright 2022-latest the httpland authors. All rights reserved. MIT license.

import {
  distinctBy,
  duplicateBy,
  groupBy,
  HttpMethod,
  isFunction,
  isString,
  isTruthy,
  mapValues,
  partition,
  safeResponse,
  Status,
  STATUS_TEXT,
} from "./deps.ts";
import { isHttpMethod, joinUrlPath } from "./utils.ts";
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
    | MethodHandlers
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

  /** Whether enable debug or not.
   *
   * - `true` - Details of the internal error will be included in the response.
   * - `false` - The response contains nothing.
   * @default false
   */
  debug?: boolean;
}

/** Map for HTTP method and {@link RouteHandler}.
 *
 * @deprecated rename to {@link MethodHandlers}
 */
export type MethodRouteHandlers = { [k in HttpMethod]?: RouteHandler };

/** Map for HTTP method and {@link RouteHandler}. */
export type MethodHandlers = MethodRouteHandlers;

function methods(
  methodHandlers: Readonly<MethodHandlers>,
): RouteHandler {
  return (req, params) => {
    const routeHandler = methodHandlers[req.method as HttpMethod];
    if (routeHandler) {
      return routeHandler(req, params);
    }

    const allows = Object.keys(methodHandlers);

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
  { withHead = true, basePath, debug = false }: Options = {},
): Router {
  const routeInfos = normalizeRoutes(routes);
  const [valid, errors] = validateRouteInfos(routeInfos);

  if (!valid) {
    throw new AggregateError(
      errors,
      `One or more errors were detected in the routing table.`,
    );
  }

  routes = groupRouteInfo(routeInfos);
  const entries = Object.entries(routes).map(
    createResolvedHandlerEntry(withHead),
  ).map(createJoinedBasePathEntry(basePath));

  const result = toUrlPatternEntries(entries);

  if (!result[0]) {
    throw new AggregateError(
      result[1],
      `One or more errors has occurred.`,
    );
  }

  const routeMap = new Map<URLPattern, RouteHandler>(result[1]);
  const cache: Record<
    string,
    { handler: RouteHandler; context: RouteHandlerContext }
  > = {};

  return async (req) => {
    const cached = cache[req.url];

    if (cached) {
      return await safeResponse(
        () => cached.handler(req, cached.context),
        debug,
      );
    }

    for (const [pattern, handler] of routeMap) {
      const result = pattern.exec(req.url);
      if (!result) continue;

      const context: RouteHandlerContext = {
        params: result.pathname.groups,
        route: result.pathname.input,
        pattern,
      };
      cache[req.url] = {
        handler,
        context,
      };

      return await safeResponse(() => handler(req, context), debug);
    }

    return new Response(null, {
      status: Status.NotFound,
      statusText: STATUS_TEXT[Status.NotFound],
    });
  };
}

interface RouteInfo {
  readonly route: string;
  readonly handler: RouteHandler;
  readonly method?: HttpMethod;
}

export function normalizeRoutes(routes: Routes): RouteInfo[] {
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

type ValidationResult = [valid: true] | [
  valid: false,
  errors: [RouterError, ...RouterError[]],
];

export function validateRouteInfos(
  routeInfos: Iterable<RouteInfo>,
): ValidationResult {
  const [validInfos, invalidInfos] = partition(
    Array.from(routeInfos),
    ({ route }) => !!route,
  );
  const [withMethodHandlers, rawHandlers] = partition(
    validInfos,
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

  const uniqueRoutes = distinctBy(rawHandlers, ({ route }) => route);

  const groupByRouteMethodHandlers = groupBy(
    withMethodHandlers,
    ({ route }) => route,
  ) as Record<string, RouteInfo[]>;

  const allAndMethodsSet = uniqueRoutes.map((routeInfo) => {
    if (Object.hasOwn(groupByRouteMethodHandlers, routeInfo.route)) {
      return [
        routeInfo,
        distinctBy(
          groupByRouteMethodHandlers[routeInfo.route] ?? [],
          ({ method }) => method,
        ),
      ] as const;
    }

    return;
  }).filter(isTruthy) as [RouteInfo, RouteInfo[]][];

  const duplicatedMethods = allAndMethodsSet.map(([left, rights]) =>
    new RouterError(
      joinStr(
        [
          `A catch-all handler and a method handler exist in the same route.`,
          left.route,
          ">:",
          joinStr(
            [
              strMethod(joinStr(rights.map(({ method }) => method!), ",")),
              left.route,
            ],
          ),
        ],
        " ",
      ),
    )
  );

  const emptyRouteErrors: RouterError[] = invalidInfos.map(({ method }) =>
    new RouterError(joinStr([`Empty route exists.`, strMethod(method)], " "))
  );

  const duplicated = duplicatedWithRoute.concat(duplicatedWithMethodAndRoute);

  const duplicatedRouteErrors = duplicated.map(({ method, route }) => {
    return new RouterError(
      joinStr(
        ["Duplicated routes exist.", joinStr([strMethod(method), route])],
        " ",
      ),
    );
  });

  const errors = emptyRouteErrors.concat(duplicatedRouteErrors).concat(
    duplicatedMethods,
  );

  if (errors.length) {
    return [false, errors as [RouterError, ...RouterError[]]];
  }
  return [true];
}

function joinStr(characters: Iterable<string>, separator = ""): string {
  return Array.from(characters).filter(isTruthy).join(separator);
}

function strMethod(method: string | undefined): string {
  return method ? `[${method}]` : "";
}

export function groupRouteInfo(
  routeInfo: Iterable<RouteInfo>,
): Record<string, RouteHandler | MethodHandlers> {
  const [withMethodHandlers, rawHandlers] = partition(
    Array.from(routeInfo),
    ({ method }) => !!method,
  );

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

  const methodHandlers: Record<string, MethodHandlers> = mapValues(
    routeGroup,
    (routeInfos) =>
      routeInfos.reduce((acc, cur) => {
        if (cur.method) {
          acc[cur.method] = cur.handler;
        }
        return acc;
      }, {} as MethodHandlers) ?? {},
  );

  return { ...routeHandlers, ...methodHandlers };
}

type RouteEntry = readonly [
  route: string,
  handler: RouteHandler | MethodHandlers,
];

function resolveHandlerLike(
  handlerLike: RouteHandler | MethodHandlers,
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

function createJoinedBasePathEntry(basePath: Options["basePath"]) {
  function createEntry(
    [route, handler]: [route: string, handler: RouteHandler],
  ): [route: string, handler: RouteHandler] {
    const pathname = isString(basePath) ? joinUrlPath(basePath, route) : route;
    return [
      pathname,
      handler,
    ];
  }

  return createEntry;
}

function toUrlPatternEntries(
  entries: [route: string, handler: RouteHandler][],
): [valid: true, data: [pattern: URLPattern, handler: RouteHandler][]] | [
  valid: false,
  errors: RouterError[],
] {
  const result: [pattern: URLPattern, handler: RouteHandler][] = [];
  const errors: RouterError[] = [];
  entries.forEach(([pathname, handler]) => {
    try {
      const pattern = new URLPattern({ pathname });
      result.push([pattern, handler]);
    } catch (e) {
      const error = new RouterError(`Fail to create URLPattern instance.`, {
        cause: e,
      });
      errors.push(error);
    }
  });

  if (errors.length) {
    return [false, errors];
  }

  return [true, result];
}

function withHeadHandler(
  methodRouteHandler: Readonly<MethodHandlers>,
): MethodHandlers {
  if (methodRouteHandler.HEAD || !methodRouteHandler.GET) {
    return methodRouteHandler;
  }

  const headHandler: RouteHandler = async (req: Request, params) => {
    try {
      const res = await methodRouteHandler.GET!(req, params);
      return new Response(null, res.clone());
    } catch {
      return new Response(null, {
        status: Status.InternalServerError,
        statusText: STATUS_TEXT[Status.InternalServerError],
      });
    }
  };

  return { ...methodRouteHandler, HEAD: headHandler };
}
