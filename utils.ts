// Copyright 2022-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import { isTruthy } from "./deps.ts";

export function joinUrlPath(...paths: readonly string[]): string {
  return paths.filter(isTruthy).join("/").replaceAll(/\/+/g, "/");
}
