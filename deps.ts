// Copyright 2022-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

export {
  isFunction,
  isString,
  isTruthy,
} from "https://deno.land/x/isx@1.0.0-beta.21/mod.ts";
export {
  Status,
  STATUS_TEXT,
} from "https://deno.land/std@0.155.0/http/http_status.ts";
export {
  partition,
} from "https://deno.land/std@0.155.0/collections/partition.ts";
export { mapValues } from "https://deno.land/std@0.155.0/collections/map_values.ts";
export { groupBy } from "https://deno.land/std@0.155.0/collections/group_by.ts";
export { distinctBy } from "https://deno.land/std@0.155.0/collections/distinct_by.ts";

export function isEmptyObject(value: unknown): value is Record<never, never> {
  return !Object.getOwnPropertyNames(value).length &&
    !Object.getOwnPropertySymbols(value).length;
}

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
