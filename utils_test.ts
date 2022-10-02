import {
  assertNotDuplicateBy,
  equalsURLPattern,
  intersectBy,
  joinUrlPath,
  nest,
} from "./utils.ts";
import { describe, expect, Fn, it } from "./dev_deps.ts";

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

Deno.test("equalsURLPattern should pass", () => {
  const table: Fn<typeof equalsURLPattern>[] = [
    [new URLPattern({}), new URLPattern({}), true],
    [new URLPattern({ pathname: "*" }), new URLPattern({}), true],
    [
      new URLPattern({ pathname: "/abc" }),
      new URLPattern({ pathname: "/abc" }),
      true,
    ],
    [
      new URLPattern({
        port: "8000",
        password: "admin",
        hostname: "localhost",
      }),
      new URLPattern({
        port: "8000",
        password: "admin",
        hostname: "localhost",
      }),
      true,
    ],

    [
      new URLPattern({ pathname: "*" }),
      new URLPattern({ pathname: "" }),
      false,
    ],
    [
      new URLPattern({ hash: "*" }),
      new URLPattern({ hash: "" }),
      false,
    ],
    [
      new URLPattern({ hostname: "*" }),
      new URLPattern({ hostname: "" }),
      false,
    ],
    [
      new URLPattern({ password: "*" }),
      new URLPattern({ password: "" }),
      false,
    ],
    [
      new URLPattern({ port: "*" }),
      new URLPattern({ port: "" }),
      false,
    ],
    [
      new URLPattern({ protocol: "*" }),
      new URLPattern({ protocol: "" }),
      false,
    ],
    [
      new URLPattern({ search: "*" }),
      new URLPattern({ search: "" }),
      false,
    ],
    [
      new URLPattern({ username: "*" }),
      new URLPattern({ username: "" }),
      false,
    ],
    [new URLPattern({ pathname: "" }), new URLPattern({}), false],
  ];

  table.forEach(([left, right, expected]) => {
    expect(equalsURLPattern(left, right)).toBe(expected);
  });
});

describe("assertNotDuplicateBy", () => {
  it("should return undefined when the selector return false or the value is empty", () => {
    expect(assertNotDuplicateBy([], () => true)).toBeUndefined();
    expect(assertNotDuplicateBy([1, 1], () => false)).toBeUndefined();
  });

  it("should throw error when the selector return true", () => {
    expect(() => assertNotDuplicateBy([1, 2, 1, 2], Object.is)).toThrow();
  });
});

Deno.test("intersectBy should pass", () => {
  const table: Fn<typeof intersectBy>[] = [
    [[], () => false, []],
    [[1], () => false, []],
    [[1, 1], () => false, []],
    [[1, 1], () => true, [1]],
    [[0, 1, 2], () => true, [1]],
    [[1, 2, 3], () => true, [2]],
    [[1, 1, 1], Object.is, [1]],
    [[1, 2, 1, 2], Object.is, [1, 2]],
    [["", 1, 2, 3, "a", "b", "1", 3, 3, 1, 3, "A", "a", false], Object.is, [
      3,
      1,
      "a",
    ]],
  ];

  table.forEach(([value, selector, expected]) => {
    expect(intersectBy(value, selector)).toEqual(expected);
  });
});

Deno.test("nest should pass", () => {
  const handler = () => new Response();

  const table: Fn<typeof nest>[] = [
    ["", {}, {}],
    ["/", {}, {}],
    ["/", { "/": handler }, { "/": handler }],
    ["/api", { "hello": handler }, { "/api/hello": handler }],
    ["/api", { "hello": handler, "": handler }, {
      "/api/hello": handler,
      "/api": handler,
    }],
    ["/api/", { "/hello/": handler, "//": handler }, {
      "/api/hello/": handler,
      "/api/": handler,
    }],
    ["/api", { "//": handler, "/": handler }, {
      "/api/": handler,
    }],
  ];
  table.forEach(([root, routes, expected]) => {
    expect(nest(root, routes)).toEqual(expected);
  });
});
