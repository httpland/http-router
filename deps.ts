// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

export { isString } from "https://deno.land/x/isx@1.0.0-beta.24/mod.ts";
export { concatPath } from "https://deno.land/x/url_concat@1.0.0-beta.1/mod.ts";
export { chain } from "https://deno.land/x/chain_handler@1.1.0/mod.ts";

type ParamKeyName<NameWithPattern> = NameWithPattern extends
  `${infer Name}{${infer _}` ? Name
  : NameWithPattern;

type ParamKey<Component> = Component extends `:${infer NameWithPattern}`
  ? ParamKeyName<NameWithPattern>
  : never;

export type ParseUrlParams<Path> = Path extends
  `${infer Component}/${infer Rest}`
  ? ParamKey<Component> | ParseUrlParams<Rest>
  : ParamKey<Path>;
