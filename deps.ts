// Copyright 2022-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

export {
  isFunction,
  isIterable,
  isString,
} from "https://deno.land/x/isx@1.0.0-beta.24/mod.ts";
export {
  Status,
  STATUS_TEXT,
} from "https://deno.land/std@0.177.0/http/http_status.ts";
export {
  type HttpHandler as Handler,
  type HttpMethod,
  isResponse,
} from "https://deno.land/x/http_utils@1.0.0-beta.4/mod.ts";
export {
  isOk,
  Result,
  unsafe,
} from "https://deno.land/x/result_js@1.0.0/mod.ts";
export { concatPath } from "https://deno.land/x/url_concat@1.0.0-beta.1/mod.ts";
export {
  prop,
  toLowerCase,
} from "https://deno.land/x/prelude_js@1.0.0-beta.3/mod.ts";
export { LRUMap } from "https://deno.land/x/lru_map@1.0.0-beta.1/mod.ts";
export {
  chain,
  type ChainableHandler,
  type OptionalHandler,
  type Responsive,
} from "https://deno.land/x/chain_handler@1.1.0/mod.ts";
export {
  type Middleware,
} from "https://deno.land/x/http_middleware@1.0.0-beta.1/mod.ts";
export {
  partition,
} from "https://deno.land/std@0.177.0/collections/partition.ts";
