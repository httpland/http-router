// Copyright 2022-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

export function assert(
  expr: unknown,
  message = "Assertion failed",
): asserts expr {
  if (!expr) {
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
