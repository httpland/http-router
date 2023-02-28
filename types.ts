// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

/** HTTP request handler. */
export interface Handler<Context = unknown> {
  (this: Context, request: Request): Promise<Response> | Response;
}

/** HTTP middleware. */
export interface Middleware<Context = unknown> {
  (
    this: Context,
    request: Request,
    next: Handler,
  ): Promise<Response> | Response;
}

/** HTTP method routing API. */
export interface MethodRouting {
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

/** HTTP method and path routing API. */
export interface MethodPathRouting {
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

/** HTTP method and URL pattern routing API. */
export interface MethodPatternRouting {
  /** HTTP request `GET` and URL pattern matching API.
   * @param pattern URL pattern
   * @param handler HTTP handler
   */
  readonly get: (pattern: URLPatternInit, handler: Handler) => this;

  /** HTTP request `HEAD` and URL pattern matching API.
   * @param path URL path
   * @param handler HTTP handler
   */
  readonly head: (pattern: URLPatternInit, handler: Handler) => this;

  /** HTTP request `POST` and URL path matching API.
   * @param path URL path
   * @param handler HTTP handler
   */
  readonly post: (pattern: URLPatternInit, handler: Handler) => this;

  /** HTTP request `PUT` and URL path matching API.
   * @param path URL path
   * @param handler HTTP handler
   */
  readonly put: (pattern: URLPatternInit, handler: Handler) => this;

  /** HTTP request `DELETE` and URL path matching API.
   * @param path URL path
   * @param handler HTTP handler
   */
  readonly delete: (pattern: URLPatternInit, handler: Handler) => this;

  /** HTTP request `PATCH` and URL path matching API.
   * @param path URL path
   * @param handler HTTP handler
   */
  readonly patch: (pattern: URLPatternInit, handler: Handler) => this;

  /** HTTP request `OPTIONS` and URL path matching API.
   * @param path URL path
   * @param handler HTTP handler
   */
  readonly options: (pattern: URLPatternInit, handler: Handler) => this;

  /** HTTP request `CONNECT` and URL path matching API.
   * @param path URL path
   * @param handler HTTP handler
   */
  readonly connect: (pattern: URLPatternInit, handler: Handler) => this;

  /** HTTP request `TRACE` and URL path matching API.
   * @param path URL path
   * @param handler HTTP handler
   */
  readonly trace: (pattern: URLPatternInit, handler: Handler) => this;
}

export type Params<T extends PropertyKey> = {
  readonly [k in T]: string;
};
