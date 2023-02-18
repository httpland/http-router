import { Router } from "./router.ts";
import {
  assertEquals,
  assertSpyCalls,
  assertThrows,
  describe,
  equalsResponse,
  type HttpMethod,
  it,
  spy,
} from "./_dev_deps.ts";
import type { Handler } from "./deps.ts";
import { assert } from "./utils.ts";

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

  it("should register route via all method", () => {
    const handler = () => Response.json("");

    assertEquals(new Router().all(handler).routes, [{
      methods: [],
      pattern: new URLPattern({}),
      handler,
    }]);
  });

  it("should throw error when avoid type checking", () => {
    assertThrows(() => new Router().all("/", undefined as unknown as Handler));
  });

  it("should provide route context", async () => {
    const init = new Response();

    const fn = spy();
    const router = new Router().get("/:id", (request) => {
      fn();
      assertEquals(request.params, { id: "100" });

      const result = new URLPattern({ pathname: "/:id" }).exec(request.url);
      assertEquals(request.match, result);

      return init;
    });

    const response = await router.handler(new Request("http://test/100"));

    assertSpyCalls(fn, 1);
    assert(equalsResponse(response, init));
  });

  it("should call next handler when the next is called", async () => {
    const init = new Response("ok");
    const fn = spy();

    const router = new Router()
      .all((req, next) => {
        fn();
        return next(req);
      })
      .get("/match", () => init);

    const response = await router.handler(new Request("http://test/match"));

    assertSpyCalls(fn, 1);
    assert(equalsResponse(response, init));
  });

  it("should bind another router", () => {
    const handler = () => Response.json("");

    const userRouter = new Router().all(handler);
    const apiRouter = new Router().use(userRouter);

    assertEquals(apiRouter.routes, [{
      methods: [],
      pattern: new URLPattern({}),
      handler,
    }]);
  });

  it("should add base prefix", () => {
    const handler = () => Response.json("");

    const router = new Router({ base: "/api" }).get("/users", handler);

    assertEquals(router.routes, [{
      methods: ["GET"],
      pattern: new URLPattern({ pathname: "/api/users" }),
      handler,
    }]);
  });
});
