// Copyright 2022-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import { Handler, HttpMethod } from "./deps.ts";

/** Pair of `URLPattern` and {@link URLRouteHandler} . */
export type URLPatternRoute = readonly [
  pattern: URLPatternInit | URLPattern,
  handler: URLRouteHandler,
];

/** `URLPattern` pattern matching definition. */
export type URLPatternRoutes =
  | readonly URLPatternRoute[]
  | Iterable<URLPatternRoute>;

/** URL pathname pattern matching definition. */
export interface PathnameRoutes {
  /** Pair of pathname and {@link URLRouteHandler}. */
  readonly [k: string]: URLRouteHandler;
}

/** Handler for URL routes. */
export interface URLRouteHandler {
  /** Handler with context. */
  (
    request: Request,
    context: URLRouteHandlerContext,
  ): Promise<Response> | Response;
}

/** Handler for HTTP method routes. */
export interface MethodRouteHandler<M extends HttpMethod = HttpMethod> {
  /** Handler with bound HTTP methods. */
  (request: Request & { readonly method: M }): Promise<Response> | Response;
}

/** URL pattern matching definition. */
export type URLRoutes =
  | URLPatternRoutes
  | PathnameRoutes;

/** URL route handler context. */
export interface URLRouteHandlerContext {
  /** URL pattern. */
  readonly pattern: URLPattern;

  /** Pattern matching result. */
  readonly result: URLPatternResult;

  /** URL matched parameters.
   * Alias for `result.pathname.groups`. */
  readonly params: URLPatternResult["pathname"]["groups"];
}

/** HTTP method matched pattern definition. */
export type HttpMethodRoutes = {
  readonly [k in HttpMethod]?: MethodRouteHandler<k>;
};

/** Router options. */
export interface RouterOptions {
  /** The handler to invoke when route handlers throw an error. */
  readonly onError?: (error: unknown) => Promise<Response> | Response;

  /** Call on before the execution of each handler.
   * The request can be changed or return early response.
   *
   * ```ts
   * import { URLRouter } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   * import { assertEquals } from "https://deno.land/std@$VERSION/testing/asserts.ts";
   * import { preflightResponse } from "https://deno.land/x/cors_protocol@$VERSION/mod.ts";
   *
   * const handler = URLRouter({
   *   "/": () => new Response(),
   * }, {
   *   beforeEach: (request) => {
   *     const preflightRes = preflightResponse(request, {});
   *     return preflightRes;
   *   },
   * });
   * ```
   */
  readonly beforeEach?: BeforeEach;

  /** Call on after the execution of each handler.
   * The response of the handler can be changed.
   *
   * ```ts
   * import { URLRouter } from "https://deno.land/x/http_router@$VERSION/mod.ts";
   * import { assertEquals } from "https://deno.land/std@$VERSION/testing/asserts.ts";
   *
   * const handler = URLRouter({
   *   "/": () => new Response(),
   * }, {
   *   afterEach: (response) => {
   *     response.headers.set("x-router", "http-router");
   *     return response;
   *   },
   * });
   *
   * assertEquals(
   *   (await handler(new Request("http://localhost"))).headers.get("x-router"),
   *   "http-router",
   * );
   * ```
   */
  readonly afterEach?: AfterEach;
}

/** Request transformer call on before handle. */
export interface BeforeEach {
  (
    request: Request,
  ): Promise<void | Request | Response> | void | Request | Response;
}

/** Response transformer call on after handle. */
export interface AfterEach {
  (response: Response): Promise<Response | void> | Response | void;
}

/** HTTP method router options. */
export interface MethodRouterOptions extends RouterOptions {
  /** If a `GET` handler is defined, it will be used to generate a response to the `HEAD` request.
   *
   * This feature is based on RFC 9110, 9.1
   * > All general-purpose servers MUST support the methods GET and HEAD.
   * @default true
   */
  readonly withHead?: boolean;
}

/** `URLRouter` constructor. */
export interface URLRouterConstructor {
  /** HTTP request URL pattern matching definition. */
  (routes: URLRoutes, options?: RouterOptions): Handler;
}

/** `MethodRouter` constructor. */
export interface MethodRouterConstructor {
  /** HTTP request method pattern matching definition. */
  (routes: HttpMethodRoutes, options?: MethodRouterOptions): Handler;
}
