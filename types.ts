// Copyright 2022-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import { Handler, HttpMethod } from "./deps.ts";

/** Router with URL pathname. */
export interface PathnameRoutes {
  readonly [k: string]: ContextualHandler<MatchedURLContext>;
}

/** Route with {@link URLPattern}. */
export type URLPatternRoute = readonly [
  pattern: URLPatternInit | URLPattern,
  handler: ContextualHandler<MatchedURLContext>,
];

/** URL matched pattern definition. */
export type URLRoutes =
  | PathnameRoutes
  | readonly URLPatternRoute[]
  | Iterable<URLPatternRoute>;

/** Context about matched URL. */
export interface MatchedURLContext {
  /** URL matched parameters.  */
  readonly params: { readonly [k in string]?: string };

  /** Pattern matching result. */
  readonly result: URLPatternResult;

  /** URL pattern. */
  readonly pattern: URLPattern;
}

/** Contextual HTTP handler. */
export interface ContextualHandler<C> {
  /** Handler with context. */
  (request: Request, context: C): Promise<Response> | Response;
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
