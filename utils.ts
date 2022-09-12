import { isTruthy } from "./deps.ts";

export function joinUrlPath(...paths: readonly string[]): string {
  return paths.filter(isTruthy).join("/").replaceAll(/\/+/g, "/");
}
