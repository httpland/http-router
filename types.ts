// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import { Handler } from "./deps.ts";

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
