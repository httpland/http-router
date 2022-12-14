import {
  equalsURLPattern,
  inspect,
  inspectURLPattern,
  intersectBy,
  nest,
  validateURLRoutes,
} from "./utils.ts";
import { describe, expect, Fn, it } from "./dev_deps.ts";

const handler = () => new Response();

Deno.test("inspect should pass", () => {
  const value = [new URLPattern({})];
  expect(inspect(value)).toBe(Deno.inspect(value));
});

Deno.test("inspectURLPattern should pass", () => {
  expect(inspectURLPattern(new URLPattern({}))).toBe(
    String.raw`URLPattern {
  protocol: "*",
  username: "*",
  password: "*",
  hostname: "*",
  port: "*",
  pathname: "*",
  search: "*",
  hash: "*"
}`,
  );
});

Deno.test("validateURLRoutes should pass", () => {
  const table: Fn<typeof validateURLRoutes>[] = [
    [{}, true],
    [{ "/": handler }, true],
    [[[
      {},
      handler,
    ]], true],
    [[[
      { pathname: "", hash: "" },
      handler,
    ], [{ pathname: "" }, handler]], true],

    [{ "?": handler }, new AggregateError([])],
    [[[
      { pathname: "" },
      handler,
    ], [{ pathname: "" }, handler]], new TypeError()],
  ];

  table.forEach(([routes, expected]) => {
    expect(validateURLRoutes(routes)).toEqual(expected);
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

describe("nest", () => {
  it("should pass", () => {
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
        "/api//": handler,
      }],
      ["", { "/a": handler, "/a//": handler }, {
        "/a": handler,
        "/a//": handler,
      }],
    ];
    table.forEach(([root, routes, expected]) => {
      expect(nest(root, routes)).toEqual(expected);
    });
  });

  it("should preference first pattern", () => {
    const handler = () => new Response();
    const handler2 = () => new Response();

    const table: Fn<typeof nest>[] = [
      ["", { "": handler, "/": handler2 }, { "": handler, "/": handler2 }],
      ["/", { "": handler, "/": handler2 }, { "/": handler }],
      ["/", { "/": handler, "//": handler2 }, { "/": handler, "//": handler2 }],
      ["/", { "/a": handler, "///a": handler2 }, {
        "/a": handler,
        "///a": handler2,
      }],
      ["/", {
        "/a": handler,
        "///a": handler2,
        "//a": handler2,
        "////a": handler2,
      }, {
        "/a": handler,
        "///a": handler2,
        "//a": handler2,
        "////a": handler2,
      }],
      ["//", { "": handler, "/": handler2 }, { "//": handler }],
      ["/", { "/a": handler, "a": handler2 }, { "/a": handler }],
    ];
    table.forEach(([root, routes, expected]) => {
      expect(nest(root, routes)).toEqual(expected);
    });
  });
});
