// Copyright 2022-latest the httpland authors. All rights reserved. MIT license.

import {
  AssertionError,
  isIterable,
  isTruthy,
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
 * @throws `AggregateError`
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
  const context = Object.entries(routes).map(([pathname, handler]) => {
    const normalizedPath = joinPath(root, pathname);
    return { handler, pathname, normalizedPath };
  });
  const normalizedPaths = context.map(lens("normalizedPath"));
  const duplications = intersectBy(normalizedPaths, Object.is);
  const errors = duplications.reduce((acc, cur) => {
    const pathnames = context.filter(({ normalizedPath }) =>
      Object.is(cur, normalizedPath)
    ).map(lens("pathname"));

    return [...acc, pathnames];
  }, [] as string[][]).map(assertionErrorFrom);

  if (errors.length) {
    throw AggregateError(errors, "Invalid pathname in routes.");
  }

  const entries = context.map(({ handler, normalizedPath }) =>
    [normalizedPath, handler] as const
  );

  return Object.fromEntries(entries);
}

/** Securely concatenate URL paths.
 * The concatenation is free of duplicate slashes.
 * Empty segments are ignored.
 *
 * Behaves strictly according to the meaning of "concatenation".
 * Do nothing about anything other than the concatenation, e.g., head and tail slashes.
 */
export function joinPath(...paths: readonly string[]): string {
  const [head, ...tail] = paths.filter(isTruthy);

  if (!head) return "";

  return tail.reduce((acc, cur) => {
    return acc.replaceAll(/\/+$/g, "") + "/" + cur.replaceAll(/^\/+/g, "");
  }, head);
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

function assertionErrorFrom(pathnames: string[]): AssertionError {
  return new AssertionError({
    actual: pathnames,
    expect: "No same meaning pathname",
  }, `Same meaning pathname. [${pathnames.join(", ")}]`);
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
export function isEmpty(value: {}): boolean {
  const members = isIterable(value) ? Array.from(value) : Object.keys(value);

  return !members.length;
}

function lens<U extends keyof T, T>(prop: U): (value: T) => T[U] {
  return (value) => value[prop];
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
