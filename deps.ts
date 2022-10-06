// Copyright 2022-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

export { isIterable } from "https://deno.land/x/isx@1.0.0-beta.22/mod.ts";
export {
  Status,
  STATUS_TEXT,
} from "https://deno.land/std@0.157.0/http/http_status.ts";
export {
  type HttpHandler as Handler,
  type HttpMethod,
  safeResponse,
} from "https://deno.land/x/http_utils@1.0.0-beta.3/mod.ts";
export {
  isOk,
  Result,
  unsafe,
} from "https://deno.land/x/result_js@1.0.0/mod.ts";
export { concatPath } from "https://deno.land/x/url_concat@1.0.0-beta.1/mod.ts";
export { head, prop } from "https://deno.land/x/prelude_js@1.0.0-beta.3/mod.ts";

export function partition<T, U extends T>(
  array: readonly T[],
  predicate: (el: T) => el is U,
): [U[], Exclude<T, U>[]] {
  const matches: Array<U> = [];
  const rest: Array<Exclude<T, U>> = [];

  for (const element of array) {
    if (predicate(element)) {
      matches.push(element);
    } else {
      rest.push(element as Exclude<T, U>);
    }
  }

  return [matches, rest];
}
