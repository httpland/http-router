// Copyright 2022-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

export {
  isIterable,
  isTruthy,
} from "https://deno.land/x/isx@1.0.0-beta.22/mod.ts";
export {
  Status,
  STATUS_TEXT,
} from "https://deno.land/std@0.157.0/http/http_status.ts";
export { partition } from "https://deno.land/std@0.157.0/collections/partition.ts";
export { mapKeys } from "https://deno.land/std@0.157.0/collections/map_keys.ts";
export {
  type HttpHandler as Handler,
  type HttpMethod,
  safeResponse,
} from "https://deno.land/x/http_utils@1.0.0-beta.3/mod.ts";
export { AssertionError } from "https://deno.land/x/assertion@1.0.0-beta.1/mod.ts";
export {
  isOk,
  Result,
  unsafe,
} from "https://deno.land/x/result_js@1.0.0/mod.ts";
