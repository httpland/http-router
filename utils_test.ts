import { nest } from "./utils.ts";
import { describe, expect, Fn, it } from "./_dev_deps.ts";

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
