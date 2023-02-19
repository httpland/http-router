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

export function matchMethod(
  candidates: readonly string[],
  method: string,
): boolean;
export function matchMethod(candidate: string, method: string): boolean;
export function matchMethod(
  candidates: string | readonly string[],
  method: string,
): boolean {
  const list = toList(candidates);

  if (!list.length) return true;

  return list.includes(method);
}

export function toList<T>(input: T): T extends readonly unknown[] ? T : [T] {
  // deno-lint-ignore no-explicit-any
  return Array.isArray(input) ? input as any : [input];
}

// deno-lint-ignore no-explicit-any
export interface This<T, F extends (...args: any) => any> {
  (this: T, ...args: Parameters<F>): ReturnType<F>;
}
