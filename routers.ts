// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import type {
  Handling,
  MethodPathRoutable,
  MethodRoutable,
  PathUseable,
  Useable,
} from "./types.ts";
import {
  chain,
  concatPath,
  isFunction,
  isString,
  type Middleware,
  partition,
} from "./deps.ts";
import { assert, Method } from "./utils.ts";

export interface Route {
  readonly path: string;
  readonly methods: readonly string[];
  readonly handler: Middleware;
}

/** Router options. */
export interface Options {
  /** Root path. */
  readonly root?: string;
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
  implements
    MethodPathRoutable,
    MethodRoutable,
    Useable,
    PathUseable,
    Handling {
  #routes: Route[] = [];
  #root: string | undefined;

  constructor(options?: Options) {
    this.#root = options?.root;
  }

  /** Register routers as middleware.
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * const apiRouter = new Router({ root: "/api" });
   * const usersRouter = new Router();
   * const productsRouter = new Router();
   *
   * apiRouter.use(usersRouter, productsRouter);
   * ```
   */
  use(...routers: readonly Router[]): this;
  /** Register middleware with path scope.
   * @param path URL path.
   * @param middleware
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   * import logger from "https://deno.land/x/http_log@$VERSION/mod.ts";
   *
   * const router = new Router();
   * router.use("/api", logger());
   * ```
   */
  use(path: string, ...middleware: readonly Middleware[]): this;
  /** Register middleware to all scope.
   * @param middleware
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   * import logger from "https://deno.land/x/http_log@$VERSION/mod.ts";
   *
   * const router = new Router();
   * router.use(logger());
   * ```
   */
  use(...middleware: readonly Middleware[]): this;
  use(
    pathOrMiddlewareOrRouter: string | Middleware | Router,
    ...middlewareOrRouters: readonly (Middleware | Router)[]
  ): this {
    const is = isString(pathOrMiddlewareOrRouter);
    const path = is ? pathOrMiddlewareOrRouter : "*";
    const list = is
      ? middlewareOrRouters
      : [pathOrMiddlewareOrRouter, ...middlewareOrRouters];

    const [middles, routes] = partition(list, isFunction) as [
      Middleware[],
      Router[],
    ];

    const middlewareRoutes = middles.map((middle) => ({
      path,
      methods: [],
      handler: middle,
    }));

    this.#routes = this.#routes.concat(middlewareRoutes).concat(
      routes.map(({ routes }) => routes).flat(),
    );

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
   * new Router().get("/api/*", (request, next) => next(request))
   * ```
   */
  get(path: string, handler: Middleware): this;
  /** Register handler that matched on HTTP request URL and HTTP request method of `GET`.
   * @param path Path or pattern
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
  get(pathOrHandler: string | Middleware, handler?: Middleware): this {
    this.#register(pathOrHandler, handler, Method.Get);

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
   * new Router().head("/api/*", (request, next) => next(request))
   * ```
   */
  head(path: string, handler: Middleware): this;
  /** Register handler that matched on HTTP request method of `HEAD`.
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().head((request, next) => new Response("Hello"));
   * ```
   */
  head(handler: Middleware): this;
  head(pathOrHandler: string | Middleware, handler?: Middleware): this {
    this.#register(pathOrHandler, handler, Method.Head);

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
   * new Router().post("/api/*", (request, next) => next(request))
   * ```
   */
  post(path: string, handler: Middleware): this;
  /** Register handler that matched on HTTP request method of `POST`.
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().post((request, next) => new Response("Hello"));
   * ```
   */
  post(handler: Middleware): this;
  post(pathOrHandler: string | Middleware, handler?: Middleware): this {
    this.#register(pathOrHandler, handler, Method.Post);

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
   * new Router().put("/api/*", (request, next) => next(request))
   * ```
   */
  put(path: string, handler: Middleware): this;
  /** Register handler that matched on HTTP request method of `PUT`.
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().put((request, next) => new Response("Hello"));
   * ```
   */
  put(handler: Middleware): this;
  put(pathOrHandler: string | Middleware, handler?: Middleware): this {
    this.#register(pathOrHandler, handler, Method.Put);

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
   * new Router().delete("/api/*", (request, next) => next(request))
   * ```
   */
  delete(path: string, handler: Middleware): this;
  /** Register handler that matched on HTTP request method of `DELETE`.
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().delete((request, next) => new Response("Hello"));
   * ```
   */
  delete(handler: Middleware): this;
  delete(pathOrHandler: string | Middleware, handler?: Middleware): this {
    this.#register(pathOrHandler, handler, Method.Delete);

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
   * new Router().patch("/api/*", (request, next) => next(request))
   * ```
   */
  patch(path: string, handler: Middleware): this;
  /** Register handler that matched on HTTP request method of `PATCH`.
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().patch((request, next) => new Response("Hello"));
   * ```
   */
  patch(handler: Middleware): this;
  patch(pathOrHandler: string | Middleware, handler?: Middleware): this {
    this.#register(pathOrHandler, handler, Method.Patch);

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
   * new Router().options("/api/*", (request, next) => next(request))
   * ```
   */
  options(path: string, handler: Middleware): this;
  /** Register handler that matched on HTTP request method of `OPTIONS`.
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().options((request, next) => new Response("Hello"));
   * ```
   */
  options(handler: Middleware): this;
  options(pathOrHandler: string | Middleware, handler?: Middleware): this {
    this.#register(pathOrHandler, handler, Method.Options);

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
   * new Router().trace("/api/*", (request, next) => next(request))
   * ```
   */
  trace(path: string, handler: Middleware): this;
  /** Register handler that matched on HTTP request method of `TRACE`.
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().trace((request, next) => new Response("Hello"));
   * ```
   */
  trace(handler: Middleware): this;
  trace(pathOrHandler: string | Middleware, handler?: Middleware): this {
    this.#register(pathOrHandler, handler, Method.Trace);

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
   * new Router().connect("/api/*", (request, next) => next(request))
   * ```
   */
  connect(path: string, handler: Middleware): this;
  /** Register handler that matched on HTTP request method of `CONNECT`.
   * @param handler HTTP handler
   *
   * @example
   * ```ts
   * import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   *
   * new Router().connect((request, next) => new Response("Hello"));
   * ```
   */
  connect(handler: Middleware): this;
  connect(pathOrHandler: string | Middleware, handler?: Middleware): this {
    this.#register(pathOrHandler, handler, Method.Connect);

    return this;
  }

  /** All registered routes.
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
  get routes(): readonly Route[] {
    const root = this.root;

    if (!isString(root)) return this.#routes;

    return this.#routes.map((route) => ({
      ...route,
      path: concatPath(root, route.path),
    }));
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
  handler = (request: Request) => {
    return chain(
      request,
      new Response(null, { status: 404 }),
      ...this.handlers,
    );
  };

  get handlers(): readonly Middleware[] {
    const handlers = this.routes.map(routeToMiddleware);

    return handlers;
  }

  get root(): string | undefined {
    return this.#root;
  }

  /**
   * @throws {Error} If path or pattern is invalid.
   */
  #register(
    pathOrHandler: string | Middleware,
    handler: Middleware | undefined,
    method: string | readonly string[],
  ): void {
    const is = isString(pathOrHandler);
    const _handler = is ? handler : pathOrHandler;

    assert(_handler);

    const methods = isString(method) ? [method] : method;
    const path = is ? pathOrHandler : "*";
    const route: Route = { handler: _handler, methods, path };

    this.#routes.push(route);
  }
}

function routeToMiddleware(route: Route): Middleware {
  const pattern = new URLPattern({ pathname: route.path });

  function matchMethod(method: string): boolean {
    return !route.methods.length || route.methods.includes(method);
  }

  return (request, next) => {
    if (!matchMethod(request.method)) return next(request);

    const result = pattern.test(request.url);

    if (!result) return next(request);

    return route.handler(request, next);
  };
}
