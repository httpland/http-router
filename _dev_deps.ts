export * from "https://deno.land/std@0.177.0/testing/bdd.ts";
export { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
export {
  assertSpyCalls,
  spy,
} from "https://deno.land/std@0.177.0/testing/mock.ts";
import {
  defineExpect,
  jestMatcherMap,
  jestModifierMap,
  MatchResult,
} from "https://deno.land/x/unitest@v1.0.0-beta.82/mod.ts";
export {
  anyFunction,
  fn,
} from "https://deno.land/x/unitest@v1.0.0-beta.82/mod.ts";
import {
  equalsResponse,
} from "https://deno.land/x/http_utils@1.0.0-beta.2/mod.ts";
export { type HttpMethod } from "https://deno.land/x/http_utils@1.0.0-beta.6/requests.ts";

// deno-lint-ignore no-explicit-any
export type Fn<F extends (...args: any) => any> = [
  ...Parameters<F>,
  ReturnType<F>,
];

export const expect = defineExpect({
  matcherMap: {
    ...jestMatcherMap,
    toEqualResponse,
  },
  modifierMap: jestModifierMap,
});

function toEqualResponse(actual: Response, expected: Response): MatchResult {
  return {
    pass: equalsResponse(actual, expected),
    expected,
  };
}
