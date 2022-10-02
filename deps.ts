// Copyright 2022-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

export {
  isIterable,
  isTruthy,
} from "https://deno.land/x/isx@1.0.0-beta.21/mod.ts";
export {
  Status,
  STATUS_TEXT,
} from "https://deno.land/std@0.157.0/http/http_status.ts";
export { mapKeys } from "https://deno.land/std@0.157.0/collections/map_keys.ts";
export {
  type HttpHandler as Handler,
  type HttpMethod,
  safeResponse,
} from "https://deno.land/x/http_utils@1.0.0-beta.3/mod.ts";
export { AssertionError } from "https://deno.land/x/assertion@1.0.0-beta.1/mod.ts";

export function duplicateBy<T>(
  value: Iterable<T>,
  selector: (el: T, prev: T) => boolean,
): T[] {
  const selectedValues: T[] = [];
  const ret: T[] = [];

  for (const element of value) {
    const has = selectedValues.some((v) => selector(element, v));

    if (has) {
      ret.push(element);
    } else {
      selectedValues.push(element);
    }
  }

  return ret;
}
