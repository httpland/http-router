// Copyright 2022-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import { concatPath } from "./deps.ts";
import { PathnameRoutes } from "./types.ts";

/** Nested URL pathname convertor.
 * It provides a hierarchy of routing tables.
 * You can define a tree structure with a depth of 1. To nest more, combine this.
 *
 * @deprecated This module will delete next major release.
 *
 * ```ts
 * import {
 *   nest,
 *   URLRouter,
 * } from "https://deno.land/x/http_router@$VERSION/mod.ts";
 *
 * const routeHandler = () => new Response();
 * const api = nest("/api", {
 *   ...nest("v1", {
 *     users: routeHandler,
 *     products: routeHandler,
 *   }),
 * });
 * const handler = URLRouter({ ...api, "/": routeHandler });
 * ```
 */
export function nest(
  root: string,
  routes: PathnameRoutes,
): PathnameRoutes {
  return Object.entries(routes).reduceRight((acc, [path, handler]) => {
    return { ...acc, [concatPath(root, path)]: handler };
  }, {} as PathnameRoutes);
}

export function assert(
  input: unknown,
  message = "Assertion failed",
): asserts input {
  if (!input) {
    throw new Error(message);
  }
}

/** HTTP request method enum. */
export const enum Method {
  Get = "GET",
  Head = "HEAD",
  Post = "POST",
  Put = "PUT",
  Delete = "DELETE",
  Connect = "CONNECT",
  Options = "OPTIONS",
  Trace = "TRACE",
  Patch = "PATCH",
}
