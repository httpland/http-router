import { joinUrlPath } from "./utils.ts";
import { describe, expect, it } from "./dev_deps.ts";

describe("joinUrlPath", () => {
  it("should return non duplicated slash path", () => {
    const table: [string[], string][] = [
      [[""], ""],
      [["////"], "/"],
      [["//aaa//"], "/aaa/"],
      [[" "], " "],
      [["", "", ""], ""],
      [["/", ""], "/"],
      [["/", "/"], "/"],
      [["////", ""], "/"],
      [["/abc", "/abc/"], "/abc/abc/"],
      [["//abc//", "abc"], "/abc/abc"],
      [["abc", "abc"], "abc/abc"],
      [["abc", "abc", "abc"], "abc/abc/abc"],
      [["/abc/", "/abc/", "/abc/"], "/abc/abc/abc/"],
    ];

    table.forEach(([paths, result]) =>
      expect(joinUrlPath(...paths)).toBe(result)
    );
  });
});
