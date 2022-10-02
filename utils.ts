// Copyright 2022-latest the httpland authors. All rights reserved. MIT license.

import { AssertionError, isTruthy } from "./deps.ts";

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
  const descriptors = Object.getOwnPropertyDescriptors(value);

  if (!Object.keys(descriptors).length) {
    throw new AssertionError({
      actual: Deno.inspect(value),
      expect: "One or more members.",
    });
  }
}
