// Copyright 2022-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import { Handler, HttpMethod } from "./deps.ts";

/** Router with URL pathname. */
export interface PathnameRoutes {
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

/** Route with {@link URLPattern}. */
export type URLPatternRoute = readonly [
  pattern: URLPatternInit | URLPattern,
  handler: URLRouteHandler,
];

/** URL pattern matching definition. */
export type URLRoutes =
  | PathnameRoutes
  | readonly URLPatternRoute[]
  | Iterable<URLPatternRoute>;

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
  readonly [k in HttpMethod]?: Handler;
};

/** Router options. */
export interface RouterOptions {
  /** The handler to invoke when route handlers throw an error. */
  readonly onError?: (error: unknown) => Promise<Response> | Response;
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
