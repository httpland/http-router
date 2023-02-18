// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
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

/** Expand first argument of any function. */
export type With<
  T,
  // deno-lint-ignore no-explicit-any
  F extends (...args: any) => any,
> = F extends (...args: [infer First, ...infer Rest]) => infer R
  ? (...args: readonly [First & T, ...Rest]) => R
  : never;

const DefaultDescriptor: PropertyDescriptor = { writable: true };

export function toPropertyDescriptor(value: unknown): PropertyDescriptor {
  return { ...DefaultDescriptor, value };
}
