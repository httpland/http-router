// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  chain,
  concatPath,
  isFunction,
  isString,
  Method,
  type ParseUrlParams,
} from "./deps.ts";
import type {
  Handler,
  MethodPathRouting,
  MethodPatternRouting,
  MethodRouting,
  Middleware,
  Params,
} from "./types.ts";
import { assert, matchMethod } from "./utils.ts";

/** Context of `params`. */
export interface ParamsContext<T extends string = string> {
  /** URL path parameters. */
  readonly params: Params<T>;
}

/** Context of `matchResult`. */
export interface MatchResultContext {
  /** URL pattern matching result. */
  readonly matchResult: URLPatternResult;
}

export interface RouteContext<T extends string = string>
  extends ParamsContext<T>, MatchResultContext {}

export interface Route<GlobalContext = unknown> {
  /** Match with HTTP methods.
   * Empty matching that it matches all method.
   */
  readonly methods: readonly string[];

  /** Match with URL pattern. */
  readonly pattern: URLPattern;

  /** Whether the pattern is absolute or not.
   * The absolute pattern must not be nested. */
  readonly isAbsolute: boolean;

  /** The routing handler.
   * {@link RouteContext}-dependent middleware */
  readonly handler: Middleware<GlobalContext & RouteContext>;
}

export interface Handling<GlobalContext = unknown> {
  /** Get composite handler. */
  readonly handler: Handler<GlobalContext>;
}

export interface RouterLike<GlobalContext = unknown> {
  /** All route. */
  readonly routes: readonly Route<GlobalContext>[];
}

/** HTTP router builder.
 *
 * @example
 * ```ts
 * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
 * const router = new Router().get("/api/greet", () => Response.json({ hello: "world" }));
 *
 * const response = await router.handler(new Request("http://localhost"));
 * ```
 */
export class Router<GlobalContext = unknown>
  implements
    MethodRouting,
    MethodPathRouting,
    MethodPatternRouting,
    Handling<GlobalContext>,
    RouterLike<GlobalContext> {
  #routes: Route<GlobalContext>[] = [];

  /** Use the different routers.
   *
   * @example
   * ```ts
   * import { Router, type Handler } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * declare const handler: Handler;
   *
   * const userRouter = new Router().get("/:id", handler);
   * const usersRouter = new Router().route("/users", userRouter);
   * const apiRouter = new Router().route("/api", userRouter);
   * ```
   */
  route(
    base: string,
    ...routers: readonly RouterLike<GlobalContext>[]
  ): this;
  route(...routers: readonly RouterLike<GlobalContext>[]): this;
  route(
    baseOrRouter: string | RouterLike<GlobalContext>,
    ...routers: readonly RouterLike[]
  ): this {
    const is = isString(baseOrRouter);
    const pathname = is ? baseOrRouter : undefined;
    const $routers = is ? routers : [baseOrRouter, ...routers];

    this.#routes = this.#routes.concat(
      $routers.map((router) =>
        router.routes.map((route) =>
          isString(pathname) ? concatPrefix(route, pathname) : route
        )
      ).flat(),
    );

    return this;
  }

  /** Register handler that matched on HTTP request URL.
   * @param pattern URL pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router, type Handler } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * declare const handler: Handler;
   * new Router().all({ hostname: "{*.}?example.com" }, handler)
   * ```
   */
  all<Path extends string>(
    pattern: Readonly<URLPatternInit> & { readonly pathname?: Path },
    handler: Middleware<GlobalContext & RouteContext<ParseUrlParams<Path>>>,
  ): this;
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
    handler: Middleware<GlobalContext & RouteContext<ParseUrlParams<Path>>>,
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
  all(handler: Middleware<GlobalContext & RouteContext>): this;
  all(
    that: string | Middleware<GlobalContext & RouteContext> | URLPatternInit,
    handler?: Middleware<GlobalContext & RouteContext>,
  ): this {
    this.#register(that, handler);

    return this;
  }

  /** Register handler that matched on HTTP request URL and HTTP method of `GET`.
   * @param pattern URL pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router, type Handler } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * declare const handler: Handler;
   * new Router().get({ hostname: "{*.}?example.com" }, handler)
   * ```
   */
  get<Path extends string>(
    pattern: Readonly<URLPatternInit> & { readonly pathname?: Path },
    handler: Middleware<GlobalContext & RouteContext<ParseUrlParams<Path>>>,
  ): this;
  /** Register handler that matched on HTTP request URL and HTTP request method of `GET`.
   * @param path Path or pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().get("/:id", function (request) {
   *   return Response.json(this.params.id)
   * })
   * ```
   */
  get<Path extends string>(
    path: Path,
    handler: Middleware<GlobalContext & RouteContext<ParseUrlParams<Path>>>,
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
  get(handler: Middleware<GlobalContext & RouteContext>): this;
  get(
    that: string | Middleware<GlobalContext & RouteContext> | URLPatternInit,
    handler?: Middleware<GlobalContext & RouteContext>,
  ): this {
    this.#register(that, handler, Method.Get);

    return this;
  }

  /** Register handler that matched on HTTP request URL and HTTP method of `HEAD`.
   * @param pattern URL pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router, type Handler } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * declare const handler: Handler;
   * new Router().head({ hostname: "{*.}?example.com" }, handler)
   * ```
   */
  head<Path extends string>(
    pattern: Readonly<URLPatternInit> & { readonly pathname?: Path },
    handler: Middleware<GlobalContext & RouteContext<ParseUrlParams<Path>>>,
  ): this;
  /** Register handler that matched on HTTP request URL and HTTP request method of `HEAD`.
   * @param path Path or pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().head("/:id", function (request) {
   *   return Response.json(this.params.id)
   * })
   * ```
   */
  head<Path extends string>(
    path: Path,
    handler: Middleware<GlobalContext & RouteContext<ParseUrlParams<Path>>>,
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
  head(handler: Middleware<GlobalContext & RouteContext>): this;
  head(
    that: string | Middleware<GlobalContext & RouteContext> | URLPatternInit,
    handler?: Middleware<GlobalContext & RouteContext>,
  ): this {
    this.#register(that, handler, Method.Head);

    return this;
  }

  /** Register handler that matched on HTTP request URL and HTTP method of `POST`.
   * @param pattern URL pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router, type Handler } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * declare const handler: Handler;
   * new Router().post({ hostname: "{*.}?example.com" }, handler)
   * ```
   */
  post<Path extends string>(
    pattern: Readonly<URLPatternInit> & { readonly pathname?: Path },
    handler: Middleware<GlobalContext & RouteContext<ParseUrlParams<Path>>>,
  ): this;
  /** Register handler that matched on HTTP request URL and HTTP request method of `POST`.
   * @param path Path or pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().post("/:id", function (request) {
   *   return Response.json(this.params.id)
   * })
   * ```
   */
  post<Path extends string>(
    path: Path,
    handler: Middleware<GlobalContext & RouteContext<ParseUrlParams<Path>>>,
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
  post(handler: Middleware<GlobalContext & RouteContext>): this;
  post(
    that: string | Middleware<GlobalContext & RouteContext> | URLPatternInit,
    handler?: Middleware<GlobalContext & RouteContext>,
  ): this {
    this.#register(that, handler, Method.Post);

    return this;
  }

  /** Register handler that matched on HTTP request URL and HTTP method of `PUT`.
   * @param pattern URL pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router, type Handler } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * declare const handler: Handler;
   * new Router().put({ hostname: "{*.}?example.com" }, handler)
   * ```
   */
  put<Path extends string>(
    pattern: Readonly<URLPatternInit> & { readonly pathname?: Path },
    handler: Middleware<GlobalContext & RouteContext<ParseUrlParams<Path>>>,
  ): this;
  /** Register handler that matched on HTTP request URL and HTTP request method of `PUT`.
   * @param path Path or pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().put("/:id", function (request) {
   *   return Response.json(this.params.id)
   * })
   * ```
   */
  put<Path extends string>(
    path: Path,
    handler: Middleware<GlobalContext & RouteContext<ParseUrlParams<Path>>>,
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
  put(handler: Middleware<GlobalContext & RouteContext>): this;
  put(
    that: string | Middleware<GlobalContext & RouteContext> | URLPatternInit,
    handler?: Middleware<GlobalContext & RouteContext>,
  ): this {
    this.#register(that, handler, Method.Put);

    return this;
  }

  /** Register handler that matched on HTTP request URL and HTTP method of `DELETE`.
   * @param pattern URL pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router, type Handler } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * declare const handler: Handler;
   * new Router().delete({ hostname: "{*.}?example.com" }, handler)
   * ```
   */
  delete<Path extends string>(
    pattern: Readonly<URLPatternInit> & { readonly pathname?: Path },
    handler: Middleware<GlobalContext & RouteContext<ParseUrlParams<Path>>>,
  ): this;
  /** Register handler that matched on HTTP request URL and HTTP request method of `DELETE`.
   * @param path Path or pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().delete("/:id", function (request) {
   *   return Response.json(this.params.id)
   * })
   * ```
   */
  delete<Path extends string>(
    path: Path,
    handler: Middleware<GlobalContext & RouteContext<ParseUrlParams<Path>>>,
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
  delete(handler: Middleware<GlobalContext & RouteContext>): this;
  delete(
    that: string | Middleware<GlobalContext & RouteContext> | URLPatternInit,
    handler?: Middleware<GlobalContext & RouteContext>,
  ): this {
    this.#register(that, handler, Method.Delete);

    return this;
  }

  /** Register handler that matched on HTTP request URL and HTTP method of `PATCH`.
   * @param pattern URL pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router, type Handler } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * declare const handler: Handler;
   * new Router().patch({ hostname: "{*.}?example.com" }, handler)
   * ```
   */
  patch<Path extends string>(
    pattern: Readonly<URLPatternInit> & { readonly pathname?: Path },
    handler: Middleware<GlobalContext & RouteContext<ParseUrlParams<Path>>>,
  ): this;
  /** Register handler that matched on HTTP request URL and HTTP request method of `PATCH`.
   * @param path Path or pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().patch("/:id", function (request) {
   *   return Response.json(this.params.id)
   * })
   * ```
   */
  patch<Path extends string>(
    path: Path,
    handler: Middleware<GlobalContext & RouteContext<ParseUrlParams<Path>>>,
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
  patch(handler: Middleware<GlobalContext & RouteContext>): this;
  patch(
    that: string | Middleware<GlobalContext & RouteContext> | URLPatternInit,
    handler?: Middleware<GlobalContext & RouteContext>,
  ): this {
    this.#register(that, handler, Method.Patch);

    return this;
  }

  /** Register handler that matched on HTTP request URL and HTTP method of `OPTIONS`.
   * @param pattern URL pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router, type Handler } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * declare const handler: Handler;
   * new Router().options({ hostname: "{*.}?example.com" }, handler)
   * ```
   */
  options<Path extends string>(
    pattern: Readonly<URLPatternInit> & { readonly pathname?: Path },
    handler: Middleware<GlobalContext & RouteContext<ParseUrlParams<Path>>>,
  ): this;
  /** Register handler that matched on HTTP request URL and HTTP request method of `OPTIONS`.
   * @param path Path or pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().options("/:id", function (request) {
   *   return Response.json(this.params.id)
   * })
   * ```
   */
  options<Path extends string>(
    path: Path,
    handler: Middleware<GlobalContext & RouteContext<ParseUrlParams<Path>>>,
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
  options(handler: Middleware<GlobalContext & RouteContext>): this;
  options(
    that: string | Middleware<GlobalContext & RouteContext> | URLPatternInit,
    handler?: Middleware<GlobalContext & RouteContext>,
  ): this {
    this.#register(that, handler, Method.Options);

    return this;
  }

  /** Register handler that matched on HTTP request URL and HTTP method of `TRACE`.
   * @param pattern URL pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router, type Handler } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * declare const handler: Handler;
   * new Router().trace({ hostname: "{*.}?example.com" }, handler)
   * ```
   */
  trace<Path extends string>(
    pattern: Readonly<URLPatternInit> & { readonly pathname?: Path },
    handler: Middleware<GlobalContext & RouteContext<ParseUrlParams<Path>>>,
  ): this;
  /** Register handler that matched on HTTP request URL and HTTP request method of `TRACE`.
   * @param path Path or pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().trace("/:id", function (request) {
   *   return Response.json(this.params.id)
   * })
   * ```
   */
  trace<Path extends string>(
    path: Path,
    handler: Middleware<GlobalContext & RouteContext<ParseUrlParams<Path>>>,
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
  trace(handler: Middleware<GlobalContext & RouteContext>): this;
  trace(
    that: string | Middleware<GlobalContext & RouteContext> | URLPatternInit,
    handler?: Middleware<GlobalContext & RouteContext>,
  ): this {
    this.#register(that, handler, Method.Trace);

    return this;
  }

  /** Register handler that matched on HTTP request URL and HTTP method of `CONNECT`.
   * @param pattern URL pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router, type Handler } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * declare const handler: Handler;
   * new Router().connect({ hostname: "{*.}?example.com" }, handler)
   * ```
   */
  connect<Path extends string>(
    pattern: Readonly<URLPatternInit> & { readonly pathname?: Path },
    handler: Middleware<GlobalContext & RouteContext<ParseUrlParams<Path>>>,
  ): this;
  /** Register handler that matched on HTTP request URL and HTTP request method of `CONNECT`.
   * @param path Path or pattern
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().connect("/:id", function (request) {
   *   return Response.json(this.params.id)
   * })
   * ```
   */
  connect<Path extends string>(
    path: Path,
    handler: Middleware<GlobalContext & RouteContext<ParseUrlParams<Path>>>,
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
  connect(handler: Middleware<GlobalContext & RouteContext>): this;
  connect(
    that: string | Middleware<GlobalContext & RouteContext> | URLPatternInit,
    handler?: Middleware<GlobalContext & RouteContext>,
  ): this {
    this.#register(that, handler, Method.Connect);

    return this;
  }

  /** Get composed handler.
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
  get handler(): Handler<GlobalContext> {
    const routes = this.routes;
    const initResponse = new Response(null, { status: 404 });

    return function (request: Request): Promise<Response> {
      const middleware = routes.map((route) => routeToMiddleware(route, this));

      return Promise.resolve(chain(request, initResponse, ...middleware));
    };
  }

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
  get routes(): readonly Route<GlobalContext>[] {
    return this.#routes;
  }

  /** Add route.
   *
   * @throws {Error} If path or pattern is invalid.
   */
  #register(
    that: string | Middleware<GlobalContext & RouteContext> | URLPatternInit,
    handler: Middleware<GlobalContext & RouteContext> | undefined,
    method?: string,
  ): void {
    const is = isFunction(that);
    const middleware = is ? that : handler;

    assert(middleware);

    const init: URLPatternInit = is
      ? {}
      : isString(that)
      ? { pathname: that }
      : that;
    const pattern = new URLPattern(init);
    const isRelative = is || isString(that);
    const methods = isString(method) ? [method] : [];

    this.#routes.push({
      methods,
      handler: middleware,
      pattern,
      isAbsolute: !isRelative,
    });
  }
}

function routeToMiddleware<Context>(
  route: Route<Context>,
  ctx: Context,
) {
  const pattern = new URLPattern(route.pattern);

  const middleware: Middleware = (request, next) => {
    if (!matchMethod(route.methods, request.method)) return next(request);

    const matchResult = pattern.exec(request.url);

    if (!matchResult) return next(request);

    const context: Context & RouteContext = {
      ...ctx,
      matchResult,
      params: matchResult.pathname.groups,
    };

    return route.handler.call(context, request, next);
  };

  return middleware;
}

function concatPrefix<C>(
  route: Route<C>,
  prefix: string,
): Route<C> {
  if (route.isAbsolute) return route;

  const pathname = concatPath(prefix, route.pattern.pathname);
  const init = { ...route.pattern, pathname };
  const pattern = new URLPattern(init);

  return { ...route, pattern };
}
