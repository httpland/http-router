// Copyright 2022-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import { HttpMethods } from "./constants.ts";
import { HttpMethod, isTruthy } from "./deps.ts";

export function joinUrlPath(...paths: readonly string[]): string {
  return paths.filter(isTruthy).join("/").replaceAll(/\/+/g, "/");
}

export function isHttpMethod(value: string): value is HttpMethod {
  return (HttpMethods as string[]).includes(value);
}
