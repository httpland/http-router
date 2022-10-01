// Copyright 2022-latest the httpland authors. All rights reserved. MIT license.

import { AssertionError, duplicateBy, isTruthy } from "./deps.ts";

export function joinUrlPath(...paths: readonly string[]): string {
  return paths.filter(isTruthy).join("/").replaceAll(/\/+/g, "/");
}

export function assertDuplicateBy<T>(
  value: Iterable<T>,
  selector: (el: T, prev: T) => boolean,
): asserts value {
  const duplications = duplicateBy(value, selector);

  if (duplications.length) {
    throw new AssertionError(
      {
        actual: duplications,
        expect: "No duplication",
      },
      `Assertion is fail.

  Actual duplications:
    ${Deno.inspect(duplications)}
  Expected:
    No duplication
`,
    );
  }
}

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
