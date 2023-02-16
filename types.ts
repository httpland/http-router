// Copyright 2022-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import { Handler, HttpMethod } from "./deps.ts";

/** Pair of `URLPattern` and {@link URLRouteHandler}.
 * @deprecated This module will delete next major release.
 */
export type URLPatternRoute = readonly [
  pattern: URLPatternInit | URLPattern,
  handler: URLRouteHandler,
];

/** `URLPattern` pattern matching definition.
 * @deprecated This module will delete next major release.
 */
export type URLPatternRoutes =
  | readonly URLPatternRoute[]
  | Iterable<URLPatternRoute>;

/** URL pathname pattern matching definition.
 * @deprecated This module will delete next major release.
 */
export interface PathnameRoutes {
  /** Pair of pathname and {@link URLRouteHandler}. */
  readonly [k: string]: URLRouteHandler;
}

/** Handler for URL routes.
 * @deprecated This module will delete next major release.
 */
export interface URLRouteHandler {
  /** Handler with context. */
  (
    request: Request,
    context: URLRouteHandlerContext,
  ): Promise<Response> | Response;
}

/** Handler for HTTP method routes.
 * @deprecated This module will delete next major release.
 */
export interface MethodRouteHandler<M extends HttpMethod = HttpMethod> {
  /** Handler with bound HTTP methods. */
  (request: Request & { readonly method: M }): Promise<Response> | Response;
}

/** URL pattern matching definition.
 * @deprecated This module will delete next major release.
 */
export type URLRoutes =
  | URLPatternRoutes
  | PathnameRoutes;

/** URL route handler context.
 * @deprecated This module will delete next major release.
 */
export interface URLRouteHandlerContext {
  /** URL pattern. */
  readonly pattern: URLPattern;

  /** Pattern matching result. */
  readonly result: URLPatternResult;

  /** URL matched parameters.
   * Alias for `result.pathname.groups`. */
  readonly params: URLPatternResult["pathname"]["groups"];
}

/** HTTP method matched pattern definition.
 * @deprecated This module will delete next major release.
 */
export type HttpMethodRoutes = {
  readonly [k in HttpMethod]?: MethodRouteHandler<k>;
};

/** Router options.
 * @deprecated This module will delete next major release.
 */
export interface RouterOptions {
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

/** Request transformer call on before handle.
 * @deprecated This module will delete next major release.
 */
export interface BeforeEach {
  (
    request: Request,
  ): Promise<void | Request | Response> | void | Request | Response;
}

/** Response transformer call on after handle.
 * @deprecated This module will delete next major release.
 */
export interface AfterEach {
  (response: Response): Promise<Response | void> | Response | void;
}

/** HTTP method router options.
 * @deprecated This module will delete next major release.
 */
export interface MethodRouterOptions extends RouterOptions {
  /** If a `GET` handler is defined, it will be used to generate a response to the `HEAD` request.
   *
   * This feature is based on RFC 9110, 9.1
   * > All general-purpose servers MUST support the methods GET and HEAD.
   * @default true
   */
  readonly withHead?: boolean;
}

/** `URLRouter` constructor.
 * @deprecated This module will delete next major release.
 */
export interface URLRouterConstructor {
  /** HTTP request URL pattern matching definition. */
  (routes: URLRoutes, options?: RouterOptions): Handler;
}

/** `MethodRouter` constructor.
 * @deprecated This module will delete next major release.
 */
export interface MethodRouterConstructor {
  /** HTTP request method pattern matching definition. */
  (routes: HttpMethodRoutes, options?: MethodRouterOptions): Handler;
}

/** HTTP request method routing API. */
export interface MethodRoutable {
  /** HTTP request `GET` matching API.
   * @param handler HTTP handler
   */
  readonly get: (handler: Handler) => this;

  /** HTTP request `HEAD` matching API.
   * @param handler HTTP handler
   */
  readonly head: (handler: Handler) => this;

  /** HTTP request `POST` matching API.
   * @param handler HTTP handler
   */
  readonly post: (handler: Handler) => this;

  /** HTTP request `PUT` matching API.
   * @param handler HTTP handler
   */
  readonly put: (handler: Handler) => this;

  /** HTTP request `DELETE` matching API.
   * @param handler HTTP handler
   */
  readonly delete: (handler: Handler) => this;

  /** HTTP request `PATCH` matching API.
   * @param handler HTTP handler
   */
  readonly patch: (handler: Handler) => this;

  /** HTTP request `OPTIONS` matching API.
   * @param handler HTTP handler
   */
  readonly options: (handler: Handler) => this;

  /** HTTP request `CONNECT` matching API.
   * @param handler HTTP handler
   */
  readonly connect: (handler: Handler) => this;

  /** HTTP request `TRACE` matching API.
   * @param handler HTTP handler
   */
  readonly trace: (handler: Handler) => this;
}

export interface MethodPathRoutable {
  /** HTTP request `GET` and URL path matching API.
   * @param path URL path
   * @param handler HTTP handler
   */
  readonly get: (path: string, handler: Handler) => this;

  /** HTTP request `HEAD` and URL path matching API.
   * @param path URL path
   * @param handler HTTP handler
   */
  readonly head: (path: string, handler: Handler) => this;

  /** HTTP request `POST` and URL path matching API.
   * @param path URL path
   * @param handler HTTP handler
   */
  readonly post: (path: string, handler: Handler) => this;

  /** HTTP request `PUT` and URL path matching API.
   * @param path URL path
   * @param handler HTTP handler
   */
  readonly put: (path: string, handler: Handler) => this;

  /** HTTP request `DELETE` and URL path matching API.
   * @param path URL path
   * @param handler HTTP handler
   */
  readonly delete: (path: string, handler: Handler) => this;

  /** HTTP request `PATCH` and URL path matching API.
   * @param path URL path
   * @param handler HTTP handler
   */
  readonly patch: (path: string, handler: Handler) => this;

  /** HTTP request `OPTIONS` and URL path matching API.
   * @param path URL path
   * @param handler HTTP handler
   */
  readonly options: (path: string, handler: Handler) => this;

  /** HTTP request `CONNECT` and URL path matching API.
   * @param path URL path
   * @param handler HTTP handler
   */
  readonly connect: (path: string, handler: Handler) => this;

  /** HTTP request `TRACE` and URL path matching API.
   * @param path URL path
   * @param handler HTTP handler
   */
  readonly trace: (path: string, handler: Handler) => this;
}

export interface PathUseable {
  readonly use: (path: string, ...handlers: readonly Handler[]) => this;
}

export interface Handling {
  readonly handler: Handler;
}

export interface Useable {
  readonly use: (...handlers: readonly Handler[]) => this;
}
