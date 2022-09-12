// Copyright 2022-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

export {
  isFunction,
  isString,
} from "https://deno.land/x/isx@1.0.0-beta.21/mod.ts";
export {
  Status,
  STATUS_TEXT,
} from "https://deno.land/std@0.155.0/http/http_status.ts";
export { join } from "https://deno.land/std@0.155.0/path/posix.ts";

export function isEmptyObject(value: unknown): value is Record<never, never> {
  return !Object.getOwnPropertyNames(value).length &&
    !Object.getOwnPropertySymbols(value).length;
}
