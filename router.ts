// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  chain,
  concatPath,
  isString,
  mapValues,
  type Middleware,
  type ParseUrlParams,
} from "./deps.ts";
import type {
  Handling,
  MethodPathRouting,
  MethodRouting,
  Routing,
} from "./types.ts";
import {
  assert,
  matchMethod,
  Method,
  toPropertyDescriptor,
  type With,
} from "./utils.ts";

export interface ParamsContext<Context = unknown> {
  /** URL path parameters. */
  readonly params: Context;
}

interface URLMatch {
  readonly match: URLPatternResult;
}

interface RequestMethod<Method extends string = string> {
  readonly method: Method;
}

/** Context for built-in routing. */
export interface RouteContext<Path extends string = string>
  extends ParamsContext<ParseUrlParams<Path>>, URLMatch {}

export interface MethodsPatternRoute {
  readonly methods: readonly string[];
  readonly pattern: URLPatternInit;

  readonly handler: With<RouteContext, Middleware>;
}

export interface RouterOptions {
  /** Base URL path. */
  readonly base: string;
}

interface RouterLike {
  readonly routes: readonly MethodsPatternRoute[];
}

/** HTTP router builder.
 *
 * @example
 * ```ts
 * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
 * const router = new Router().get("/api/greet", () => Response.json(`{ hello: "world" }`));
 *
 * const response = await router.handler(new Request("http://localhost"));
 * ```
 */
export class Router
  implements MethodRouting, MethodPathRouting, Routing, Handling {
  #routes: MethodsPatternRoute[] = [];
  #base: string | undefined;

  constructor(options?: RouterOptions) {
    this.#base = options?.base;
  }

  /** Register routes from router
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   * const router = new Router();
   *
   * ```
   */
  use(...routers: readonly RouterLike[]): this {
    this.#routes = [
      ...this.#routes,
      ...routers.map((router) => router.routes).flat(),
    ];

    return this;
  }

  /** Register handler that matched on HTTP request URL.
   * @param path Path or pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   * import cors from "https://deno.land/x/http_cors@$VERSION/mod.ts";
   *
   * const users = [{ id: "0", name: "Tom" }, { id: "1", name: "Bob" }];
   * const router = new Router().all("/api/*", cors()).get(
   *   "/api/users",
   *   () => Response.json(users),
   * );
   * ```
   */
  all<Path extends string>(
    path: Path,
    handler: With<RouteContext<Path>, Middleware>,
  ): this;
  /** Register handler that matched on HTTP request URL.
   * @param path Path or pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   * import logger from "https://deno.land/x/http_log@$VERSION/mod.ts";
   *
   * const router = new Router().all(logger())
   * ```
   */
  all(handler: Middleware): this;
  all(
    pathOrHandler: Middleware | string,
    handler?: With<RouteContext, Middleware>,
  ): this {
    this.#register(pathOrHandler, handler);

    return this;
  }

  /** Register handler that matched on HTTP request URL and HTTP request method of `GET`.
   * @param path Path or pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().get("/:id", (request) => Response.json(request.params.id))
   * ```
   */
  get<Path extends string>(
    path: Path,
    handler: With<
      & RouteContext<Path>
      & RequestMethod<Method.Get>
      & ParamsContext<ParseUrlParams<Path>>,
      Middleware
    >,
  ): this;
  /** Register handler that matched on HTTP request URL and HTTP request method of `GET`.
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().get((request, next) => new Response("Hello"))
   * ```
   */
  get(handler: Middleware): this;
  get(
    pathOrHandler: string | Middleware,
    handler?: With<RouteContext & RequestMethod<never>, Middleware>,
  ): this {
    this.#register(
      pathOrHandler,
      handler as With<RouteContext, Middleware>,
      Method.Get,
    );

    return this;
  }

  /** Register handler that matched on HTTP request URL and HTTP request method of `HEAD`.
   * @param path Path or pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().head("/:id", (request) => Response.json(request.params.id))
   * ```
   */
  head<Path extends string>(
    path: Path,
    handler: With<RouteContext<Path> & RequestMethod<Method.Head>, Middleware>,
  ): this;
  /** Register handler that matched on HTTP request URL and HTTP request method of `HEAD`.
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().head((request, next) => new Response("Hello"))
   * ```
   */
  head(handler: Middleware): this;
  head(
    pathOrHandler: string | Middleware,
    handler?: With<RouteContext & RequestMethod<never>, Middleware>,
  ): this {
    this.#register(
      pathOrHandler,
      handler as With<RouteContext, Middleware>,
      Method.Head,
    );

    return this;
  }

  /** Register handler that matched on HTTP request URL and HTTP request method of `POST`.
   * @param path Path or pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().post("/:id", (request) => Response.json(request.params.id))
   * ```
   */
  post<Path extends string>(
    path: Path,
    handler: With<RouteContext<Path> & RequestMethod<Method.Post>, Middleware>,
  ): this;
  /** Register handler that matched on HTTP request URL and HTTP request method of `POST`.
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().post((request, next) => new Response("Hello"))
   * ```
   */
  post(handler: Middleware): this;
  post(
    pathOrHandler: string | Middleware,
    handler?: With<RouteContext & RequestMethod<never>, Middleware>,
  ): this {
    this.#register(
      pathOrHandler,
      handler as With<RouteContext, Middleware>,
      Method.Post,
    );

    return this;
  }

  /** Register handler that matched on HTTP request URL and HTTP request method of `PUT`.
   * @param path Path or pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().put("/:id", (request) => Response.json(request.params.id))
   * ```
   */
  put<Path extends string>(
    path: Path,
    handler: With<RouteContext<Path> & RequestMethod<Method.Put>, Middleware>,
  ): this;
  /** Register handler that matched on HTTP request URL and HTTP request method of `PUT`.
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().put((request, next) => new Response("Hello"))
   * ```
   */
  put(handler: Middleware): this;
  put(
    pathOrHandler: string | Middleware,
    handler?: With<RouteContext & RequestMethod<never>, Middleware>,
  ): this {
    this.#register(
      pathOrHandler,
      handler as With<RouteContext, Middleware>,
      Method.Put,
    );

    return this;
  }

  /** Register handler that matched on HTTP request URL and HTTP request method of `DELETE`.
   * @param path Path or pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().delete("/:id", (request) => Response.json(request.params.id))
   * ```
   */
  delete<Path extends string>(
    path: Path,
    handler: With<
      RouteContext<Path> & RequestMethod<Method.Delete>,
      Middleware
    >,
  ): this;
  /** Register handler that matched on HTTP request URL and HTTP request method of `DELETE`.
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().delete((request, next) => new Response("Hello"))
   * ```
   */
  delete(handler: Middleware): this;
  delete(
    pathOrHandler: string | Middleware,
    handler?: With<RouteContext & RequestMethod<never>, Middleware>,
  ): this {
    this.#register(
      pathOrHandler,
      handler as With<RouteContext, Middleware>,
      Method.Delete,
    );

    return this;
  }

  /** Register handler that matched on HTTP request URL and HTTP request method of `PATCH`.
   * @param path Path or pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().patch("/:id", (request) => Response.json(request.params.id))
   * ```
   */
  patch<Path extends string>(
    path: Path,
    handler: With<
      RouteContext<Path> & RequestMethod<Method.Patch>,
      Middleware
    >,
  ): this;
  /** Register handler that matched on HTTP request URL and HTTP request method of `PATCH`.
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().patch((request, next) => new Response("Hello"))
   * ```
   */
  patch(handler: Middleware): this;
  patch(
    pathOrHandler: string | Middleware,
    handler?: With<RouteContext & RequestMethod<never>, Middleware>,
  ): this {
    this.#register(
      pathOrHandler,
      handler as With<RouteContext, Middleware>,
      Method.Patch,
    );

    return this;
  }

  /** Register handler that matched on HTTP request URL and HTTP request method of `OPTIONS`.
   * @param path Path or pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().options("/:id", (request) => Response.json(request.params.id))
   * ```
   */
  options<Path extends string>(
    path: Path,
    handler: With<
      RouteContext<Path> & RequestMethod<Method.Options>,
      Middleware
    >,
  ): this;
  /** Register handler that matched on HTTP request URL and HTTP request method of `OPTIONS`.
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().options((request, next) => new Response("Hello"))
   * ```
   */
  options(handler: Middleware): this;
  options(
    pathOrHandler: string | Middleware,
    handler?: With<RouteContext & RequestMethod<never>, Middleware>,
  ): this {
    this.#register(
      pathOrHandler,
      handler as With<RouteContext, Middleware>,
      Method.Options,
    );

    return this;
  }

  /** Register handler that matched on HTTP request URL and HTTP request method of `TRACE`.
   * @param path Path or pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().trace("/:id", (request) => Response.json(request.params.id))
   * ```
   */
  trace<Path extends string>(
    path: Path,
    handler: With<
      RouteContext<Path> & RequestMethod<Method.Trace>,
      Middleware
    >,
  ): this;
  /** Register handler that matched on HTTP request URL and HTTP request method of `TRACE`.
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().trace((request, next) => new Response("Hello"))
   * ```
   */
  trace(handler: Middleware): this;
  trace(
    pathOrHandler: string | Middleware,
    handler?: With<RouteContext & RequestMethod<never>, Middleware>,
  ): this {
    this.#register(
      pathOrHandler,
      handler as With<RouteContext, Middleware>,
      Method.Trace,
    );

    return this;
  }

  /** Register handler that matched on HTTP request URL and HTTP request method of `CONNECT`.
   * @param path Path or pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().connect("/:id", (request) => Response.json(request.params.id))
   * ```
   */
  connect<Path extends string>(
    path: Path,
    handler: With<
      RouteContext<Path> & RequestMethod<Method.Connect>,
      Middleware
    >,
  ): this;
  /** Register handler that matched on HTTP request URL and HTTP request method of `CONNECT`.
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().connect((request, next) => new Response("Hello"))
   * ```
   */
  connect(handler: Middleware): this;
  connect(
    pathOrHandler: string | Middleware,
    handler?: With<RouteContext & RequestMethod<never>, Middleware>,
  ): this {
    this.#register(
      pathOrHandler,
      handler as With<RouteContext, Middleware>,
      Method.Connect,
    );

    return this;
  }

  /**
   * @param request
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   * import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
   *
   * const router = new Router();
   * router.get("/", () => new Response("hello"));
   * const response = await router.handler(new Request("http://localhost"));
   * assertEquals(await response.text(), "hello");
   * ```
   */
  handler = (request: Request): Promise<Response> => {
    const initResponse = new Response(null, { status: 404 });

    return Promise.resolve(chain(request, initResponse, ...this.middleware));
  };

  /** Registered all routes.
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   * import { assertEquals } from "https://deno.land/std@$VERSION/testing/asserts.ts"
   *
   * const router = new Router();
   * assertEquals(router.routes.length, 0);
   * router.get(() => new Response("hello"));
   * assertEquals(router.routes.length, 1);
   * ```
   */
  get routes(): readonly MethodsPatternRoute[] {
    const base = this.base;

    if (!isString(base)) return this.#routes;

    return this.#routes.map((route) => concatPrefix(route, base));
  }

  /** Registered all middleware. */
  get middleware(): readonly Middleware[] {
    return this.routes.map(routeToMiddleware);
  }

  /** Relative base path. */
  get base(): string | undefined {
    return this.#base;
  }

  /** Add route.
   *
   * @throws {Error} If path or pattern is invalid.
   */
  #register(
    pathOrHandler: string | Middleware,
    handler: With<RouteContext, Middleware> | undefined,
    method?: string,
  ): void {
    const is = isString(pathOrHandler);
    const pathname = is ? pathOrHandler : undefined;
    const pattern: URLPatternInit = { pathname };
    const middleware = is ? handler : pathOrHandler;

    assert(middleware);

    const methods = isString(method) ? [method] : [];

    this.#routes.push({ methods, handler: middleware, pattern });
  }
}

function routeToMiddleware(route: MethodsPatternRoute): Middleware {
  const pattern = new URLPattern(route.pattern);

  const middleware: Middleware = (request, next) => {
    if (!matchMethod(route.methods, request.method)) return next(request);

    const result = pattern.exec(request.url);

    if (!result) return next(request);

    const context = {
      match: result,
      params: result.pathname.groups,
    };

    const properties = mapValues(context, toPropertyDescriptor);
    const responseWithContext = Object.defineProperties(
      request.clone(),
      properties,
    ) as
      & Request
      & RouteContext;

    return route.handler(responseWithContext, next);
  };

  return middleware;
}

function concatPrefix(
  route: MethodsPatternRoute,
  prefix: string,
): MethodsPatternRoute {
  const path = concatPath(prefix, route.pattern.pathname ?? "");
  const pathname = path ? path : undefined;
  const pattern: URLPatternInit = { ...route.pattern, pathname };

  return { ...route, pattern };
}
