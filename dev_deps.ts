export * from "https://deno.land/std@0.151.0/testing/bdd.ts";
import {
  defineExpect,
  jestMatcherMap,
  jestModifierMap,
  MatchResult,
} from "https://deno.land/x/unitest@v1.0.0-beta.82/mod.ts";
export { fn } from "https://deno.land/x/unitest@v1.0.0-beta.82/mod.ts";

export const expect = defineExpect({
  matcherMap: {
    ...jestMatcherMap,
    toEqualResponse,
  },
  modifierMap: jestModifierMap,
});

function toEqualResponse(actual: Response, expected: Response): MatchResult {
  if (actual.status !== expected.status) {
    return {
      pass: false,
      expected: expected.status,
      resultActual: actual.status,
      expectedHint: "Expected status:",
      actualHint: "Actual status:",
    };
  }

  if (actual.statusText !== expected.statusText) {
    return {
      pass: false,
      expected: expected.statusText,
      resultActual: actual.statusText,
      expectedHint: "Expected statusText:",
      actualHint: "Actual statusText:",
    };
  }

  if (actual.url !== expected.url) {
    return {
      pass: false,
      expected: expected.url,
      resultActual: actual.url,
      expectedHint: "Expected url:",
      actualHint: "Actual url:",
    };
  }

  if (actual.bodyUsed !== expected.bodyUsed) {
    return {
      pass: false,
      expected: expected.bodyUsed,
      resultActual: actual.bodyUsed,
      expectedHint: "Expected bodyUsed:",
      actualHint: "Actual bodyUsed:",
    };
  }

  if (actual.redirected !== expected.redirected) {
    return {
      pass: false,
      expected: expected.redirected,
      resultActual: actual.redirected,
      expectedHint: "Expected redirected:",
      actualHint: "Actual redirected:",
    };
  }

  if (!equalHeaders(actual.headers, expected.headers)) {
    return {
      pass: false,
      expected: expected.headers,
      resultActual: actual.headers,
      expectedHint: "Expected headers:",
      actualHint: "Actual headers:",
    };
  }

  return {
    pass: true,
    expected,
  };
}

function equalHeaders(a: Headers, b: Headers): boolean {
  const header = [...a, ...b];
  for (const [key, value] of header) {
    if (!a.has(key) || !b.has(key)) {
      return false;
    }
    if (a.get(key) !== value || b.get(key) !== value) {
      return false;
    }
  }

  return true;
}
