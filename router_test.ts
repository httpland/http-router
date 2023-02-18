import { Router } from "./router.ts";
import {
  assertEquals,
  assertSpyCalls,
  describe,
  type HttpMethod,
  it,
  spy,
} from "./_dev_deps.ts";

const method: Lowercase<HttpMethod>[] = [
  "get",
  "head",
  "post",
  "connect",
  "delete",
  "options",
  "patch",
  "put",
  "trace",
];

function methodTest(method: Lowercase<HttpMethod>) {
  const upperMethod = method.toUpperCase();

  describe(upperMethod, () => {
    it("should register method", () => {
      const handler = () => new Response("hello");
      const router = new Router()[method](handler);

      assertEquals(router.routes, [{
        methods: [upperMethod],
        pattern: new URLPattern({}),
        handler,
      }]);
    });

    it("should change root path", () => {
      const handler = () => new Response("hello");
      const router = new Router({ base: "/api" })[method](handler);

      assertEquals(router.routes, [{
        methods: [upperMethod],
        pattern: new URLPattern({ pathname: "/api/*" }),
        handler,
      }]);
    });
  });
}

describe("Router", () => {
  method.forEach(methodTest);

  it("should call matched handlers", async () => {
    const fn = spy();
    const router = new Router();
    router.get((request, next) => {
      fn();
      return next(request);
    }).get(() => new Response());

    const response = await router.handler(new Request("http://localhost"));

    assertEquals(await response.text(), "");
    assertEquals(response.ok, true);

    assertSpyCalls(fn, 1);
  });
});
