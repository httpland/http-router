// Copyright 2022-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  concatPath,
  head,
  isIterable,
  isOk,
  partition,
  prop,
  Result,
  unsafe,
} from "./deps.ts";
import {
  PathnameRoutes,
  URLPatternRoute,
  URLRouteHandler,
  URLRoutes,
} from "./types.ts";

/** Nested URL pathname convertor.
 * It provides a hierarchy of routing tables.
 * You can define a tree structure with a depth of 1. To nest more, combine this.
 *
 * ```ts
 * import {
 *   nest,
 *   URLRouter,
 * } from "https://deno.land/x/http_router@$VERSION/mod.ts";
 *
 * const routeHandler = () => new Response();
 * const api = nest("/api", {
 *   ...nest("v1", {
 *     users: routeHandler,
 *     products: routeHandler,
 *   }),
 * });
 * const handler = URLRouter({ ...api, "/": routeHandler });
 * ```
 */
export function nest(
  root: string,
  routes: PathnameRoutes,
): PathnameRoutes {
  return Object.entries(routes).reduceRight((acc, [path, handler]) => {
    return { ...acc, [concatPath(root, path)]: handler };
  }, {} as PathnameRoutes);
}

/** Returns all elements in the given value that produce a intersect value using the given selector. */
export function intersectBy<T>(
  value: Iterable<T>,
  selector: (current: T, prev: T) => boolean,
): T[] {
  const selectedValues: T[] = [];
  const ret: T[] = [];

  for (const element of value) {
    const has = selectedValues.some((v) => selector(element, v));

    if (has) {
      if (!ret.find((v) => selector(element, v))) {
        ret.push(element);
      }
    } else {
      selectedValues.push(element);
    }
  }

  return ret;
}

/** Check `URLPattern` object equality. */
export function equalsURLPattern(left: URLPattern, right: URLPattern): boolean {
  const props: readonly (keyof URLPattern)[] = [
    "exec",
    "hash",
    "hostname",
    "password",
    "pathname",
    "port",
    "protocol",
    "search",
    "test",
    "username",
  ] as const;

  return props.every((prop) => equalsProp(prop, left, right));
}

function equalsProp<T extends PropertyKey, U extends { [k in T]: unknown }>(
  prop: T,
  left: U,
  right: U,
): boolean {
  return left[prop] === right[prop];
}

/** Validate {@link URLRoutes}.
 *
 * ```ts
 * import {
 *   URLRouter,
 *   URLRoutes,
 *   validateURLRoutes,
 * } from "https://deno.land/x/http_router@$VERSION/mod.ts";
 *
 * const routes: URLRoutes = {
 *   "?": () => new Response(),
 * };
 * const result = validateURLRoutes(routes);
 *
 * if (result !== true) {
 *   // do something
 * }
 *
 * const handler = URLRouter(routes);
 * ```
 */
export function validateURLRoutes(
  routes: URLRoutes,
): true | AggregateError | TypeError {
  const iterable = urlPatternRouteFrom(routes);
  const entries = Array.from(iterable).map(route2URLPatternRoute);
  const [okResults, errorResults] = partition(entries, isOk);

  if (errorResults.length) {
    const errors = errorResults.map(prop("value"));

    return AggregateError(errors, "Invalid URL pattern.");
  }

  const urlPatterns = okResults.map(prop("value")).map<URLPattern>(head);
  const intersections = intersectBy(urlPatterns, equalsURLPattern);

  if (intersections.length) {
    return new TypeError(
      `Duplicate same meaning routes. ${inspect(intersections)}`,
    );
  }

  return true;
}

export function urlPatternRouteFrom(
  routes: URLRoutes,
): Iterable<URLPatternRoute> {
  return isIterable(routes)
    ? routes
    : Object.entries(routes).map(([pathname, handler]) =>
      [{ pathname }, handler] as const
    );
}

export function route2URLPatternRoute(
  route: URLPatternRoute,
): Result<[URLPattern, URLRouteHandler], TypeError> {
  return unsafe(
    () => [new URLPattern(route[0]), route[1]],
  );
}

export function inspectURLPattern(value: URLPattern): string {
  const {
    hash,
    hostname,
    protocol,
    username,
    password,
    port,
    pathname,
    search,
  } = value;

  return `URLPattern {
  protocol: "${protocol}",
  username: "${username}",
  password: "${password}",
  hostname: "${hostname}",
  port: "${port}",
  pathname: "${pathname}",
  search: "${search}",
  hash: "${hash}"
}`;
}

export function inspect(value: URLPattern[]): string {
  return `[
  ${value.map(inspectURLPattern).join(", \n  ")}
]`;
}

/** Whether the value is `Response` or not. */
export function isResponse(value: unknown): value is Response {
  return value instanceof Response;
}
