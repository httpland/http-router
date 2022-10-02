// Copyright 2022-latest the httpland authors. All rights reserved. MIT license.

import { AssertionError, isIterable, isTruthy, mapKeys } from "./deps.ts";
import { PathnameRoutes } from "./types.ts";

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
export function nest(root: string, routes: PathnameRoutes): PathnameRoutes {
  return mapKeys(routes, (key) => joinUrlPath(root, key));
}

export function joinUrlPath(...paths: readonly string[]): string {
  return paths.filter(isTruthy).join("/").replaceAll(/\/+/g, "/");
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

/** Assert the value is no duplicates. */
export function assertNotDuplicateBy<T>(
  value: Iterable<T>,
  selector: (current: T, prev: T) => boolean,
): asserts value {
  const intersections = intersectBy(value, selector);

  if (intersections.length) {
    throw new AssertionError(
      {
        actual: intersections,
        expect: "No duplication",
      },
      `Assertion is fail.

  Actual duplications:
    ${Deno.inspect(intersections)}
  Expected:
    No duplication
`,
    );
  }
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

// deno-lint-ignore ban-types
export function assertHasMember(value: {}): asserts value {
  if (isEmpty(value)) {
    throw new AssertionError({
      actual: Deno.inspect(value),
      expect: "One or more members.",
    });
  }
}

// deno-lint-ignore ban-types
function isEmpty(value: {}): boolean {
  const members = isIterable(value) ? Array.from(value) : Object.keys(value);

  return !members.length;
}
