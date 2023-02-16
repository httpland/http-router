import { assertThrows, describe, it } from "./_dev_deps.ts";
import { assert } from "./utils.ts";

describe("assert", () => {
  it("should not throw error when the input is truthy", () => {
    assert(" ");
    assert("0");
  });

  it("should throw error when the input is falsy", () => {
    assertThrows(() => assert(0));
    assertThrows(() => assert(""));
  });
});
