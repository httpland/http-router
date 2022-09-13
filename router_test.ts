import { createRouter, normalizeRoutes, RouteHandler } from "./router.ts";
import { anyFunction, describe, expect, fn, it } from "./dev_deps.ts";
import { Status, STATUS_TEXT } from "./deps.ts";

const handler: RouteHandler = () => new Response();

const describeTests = describe("createRouter");
describe("normalizeRoutes", () => {
  it("should return route info", () => {
    const table: [
      ...Parameters<typeof normalizeRoutes>,
      { route: string; handler: unknown; method?: string }[],
    ][] = [
      [{ "/": handler }, [{ route: "/", handler }]],
      [{ "": {} }, []],
      [{ "/": {} }, []],
      [{ "/": {}, "": {}, "a": { "a": {} } }, []],
      [{ "": handler }, [{ route: "", handler: anyFunction() }]],
      [{ "/": { "/api": handler } }, [{ route: "/api", handler }]],
      [{ "/": { "/api": { "/hello": handler } } }, [{
        route: "/api/hello",
        handler,
      }]],
      [{ "GET": { "/": handler } }, [{
        route: "GET/",
        handler,
      }]],
      [{ "": { "": { "": { "/": handler } } } }, [{
        route: "/",
        handler,
      }]],
      [{ "GET": { "/": handler } }, [{
        route: "GET/",
        handler,
      }]],
      [{ "/": { GET: handler } }, [{
        route: "/",
        handler: anyFunction(),
        method: "GET",
      }]],
      [{ "/": { GET: handler, HEAD: handler } }, [
        { route: "/", handler: anyFunction(), method: "GET" },
        { route: "/", handler: anyFunction(), method: "HEAD" },
      ]],
      [{ "/": { GET: handler, HEAD: handler, "/api": handler } }, [
        { route: "/", handler: anyFunction(), method: "GET" },
        { route: "/", handler: anyFunction(), method: "HEAD" },
        { route: "/api", handler: anyFunction() },
      ]],
      [{ "/": { "/api": { "/hello": handler } } }, [
        { route: "/api/hello", handler: anyFunction() },
      ]],
      [{ "/api": { "/hello": { "/hello2": handler } } }, [
        { route: "/api/hello/hello2", handler: anyFunction() },
      ]],
      [{ "/api": { "/hello": { "/hello2": { GET: handler } } } }, [
        { route: "/api/hello/hello2", handler: anyFunction(), method: "GET" },
      ]],
      [
        { "/api": { "/hello": { GET: handler, POST: handler, "/": handler } } },
        [
          { route: "/api/hello", handler: anyFunction(), method: "GET" },
          { route: "/api/hello", handler: anyFunction(), method: "POST" },
          { route: "/api/hello/", handler: anyFunction() },
        ],
      ],
      [
        {
          "/api": { "GET": handler },
          "/graphql": handler,
          "/hello": { GET: handler },
        },
        [
          { route: "/graphql", handler: anyFunction() },
          { route: "/api", handler: anyFunction(), method: "GET" },
          { route: "/hello", handler: anyFunction(), method: "GET" },
        ],
      ],
      [
        {
          "/api": {
            "/api2": handler,
            "/api3": { GET: handler, PATCH: handler },
          },
          "/graphql": handler,
          "/hello": { GET: handler, "/hello2": { "/hello3": handler } },
        },
        [
          { route: "/graphql", handler: anyFunction() },
          { route: "/api/api2", handler: anyFunction() },
          { route: "/api/api3", handler: anyFunction(), method: "GET" },
          { route: "/api/api3", handler: anyFunction(), method: "PATCH" },
          { route: "/hello", handler: anyFunction(), method: "GET" },
          { route: "/hello/hello2/hello3", handler: anyFunction() },
        ],
      ],
      [{ "": { "": { "": { GET: handler } } } }, [{
        route: "",
        method: "GET",
        handler: anyFunction(),
      }]],
      [{ "": { "": { "/": handler } } }, [{
        route: "/",
        handler: anyFunction(),
      }]],
      [{ "": { "": { "/": { GET: handler } } } }, [{
        route: "/",
        handler: anyFunction(),
        method: "GET",
      }]],
      [{ "": { "": { "/": { GET: handler } } }, "/": { GET: handler } }, [{
        route: "/",
        handler: anyFunction(),
        method: "GET",
      }, {
        route: "/",
        handler: anyFunction(),
        method: "GET",
      }]],
      [{
        "/": {
          GET: handler,
          HEAD: handler,
          POST: handler,
          PUT: handler,
          PATCH: handler,
          DELETE: handler,
          CONNECT: handler,
          OPTIONS: handler,
          TRACE: handler,
          ORIGIN: handler,
        },
      }, [
        { method: "GET", handler: anyFunction(), route: "/" },
        { method: "HEAD", handler: anyFunction(), route: "/" },
        { method: "POST", handler: anyFunction(), route: "/" },
        { method: "PUT", handler: anyFunction(), route: "/" },
        { method: "PATCH", handler: anyFunction(), route: "/" },
        { method: "DELETE", handler: anyFunction(), route: "/" },
        { method: "CONNECT", handler: anyFunction(), route: "/" },
        { method: "OPTIONS", handler: anyFunction(), route: "/" },
        { method: "TRACE", handler: anyFunction(), route: "/" },
        { handler: anyFunction(), route: "/ORIGIN" },
      ]],
      [{
        "/": {
          GET: {},
        },
      }, []],

      [{
        "/api": {
          GET: handler,

          "/hello": {
            POST: handler,

            "hello2": {
              PUT: handler,
            },

            "hello3": {
              PATCH: handler,
            },
          },
        },
        "/graphql": {
          HEAD: { "/": handler },
        },
      }, [
        { method: "GET", handler: anyFunction(), route: "/api" },
        { method: "POST", handler: anyFunction(), route: "/api/hello" },
        { method: "PUT", handler: anyFunction(), route: "/api/hello/hello2" },
        { method: "PATCH", handler: anyFunction(), route: "/api/hello/hello3" },
        { handler: anyFunction(), route: "/graphql/HEAD/" },
      ]],
    ];

    table.forEach(([routes, result]) => {
      expect(normalizeRoutes(routes)).toEqual(result);
    });
  });
});
it(
  describeTests,
  "should return 404 when url path does not match",
  async () => {
    const router = createRouter({});
    const res = await router(new Request("http://localhost/"));

    expect(res).toEqualResponse(
      new Response(null, {
        status: Status.NotFound,
        statusText: STATUS_TEXT[Status.NotFound],
      }),
    );
  },
);

it(
  describeTests,
  `should return 404 when the handler is not defined`,
  async () => {
    const router = createRouter({
      "/": {},
    });
    const res = await router(
      new Request("http://localhost/"),
    );

    expect(res).toEqualResponse(
      new Response(null, {
        status: Status.NotFound,
        statusText: STATUS_TEXT[Status.NotFound],
      }),
    );
  },
);

it(
  describeTests,
  "should return 405 when method is not exists",
  async () => {
    const router = createRouter({
      "/": {
        "GET": () => new Response("hello"),
        "HEAD": () => new Response("hello"),
      },
    });
    const res = await router(
      new Request("http://localhost/", { method: "POST" }),
    );

    expect(res).toEqualResponse(
      new Response(null, {
        status: Status.MethodNotAllowed,
        statusText: STATUS_TEXT[Status.MethodNotAllowed],
        headers: {
          allow: "GET,HEAD",
        },
      }),
    );
  },
);

it(
  describeTests,
  "should return 500 when router handler has exception",
  async () => {
    const router = createRouter({
      "/": () => {
        throw Error("Unknown error");
      },
    });
    const res = await router(
      new Request("http://localhost/"),
    );

    expect(res).toEqualResponse(
      new Response(null, {
        status: Status.InternalServerError,
        statusText: STATUS_TEXT[Status.InternalServerError],
      }),
    );
  },
);

it(
  describeTests,
  "should return 200 when url path match",
  async () => {
    const mock = fn();
    const router = createRouter({
      "/": (_, ctx) => {
        mock(ctx);

        return new Response("Hello");
      },
    });
    const res = await router(
      new Request("http://localhost/"),
    );

    expect(mock).toHaveBeenCalledWith({
      route: "/",
      params: {},
      pattern: new URLPattern({ pathname: "/" }),
    });
    expect(res).toEqualResponse(
      new Response("Hello", {
        status: Status.OK,
      }),
    );
  },
);

it(
  describeTests,
  "should pass params when url patten include",
  async () => {
    const mock = fn();
    const router = createRouter({
      "/api/:id": (_, ctx) => {
        mock(ctx);

        return new Response(null);
      },
    });
    const res = await router(
      new Request("http://localhost/api/test"),
    );

    expect(mock).toHaveBeenCalledWith({
      params: { id: "test" },
      route: "/api/test",
      pattern: new URLPattern({ pathname: "/api/:id" }),
    });
    expect(res).toEqualResponse(
      new Response(null, {
        status: Status.OK,
      }),
    );
  },
);

it(
  describeTests,
  "should throw error when the route path is invalid",
  () => {
    expect(() =>
      createRouter({
        "https://api/:id": () => new Response(),
      })
    ).toThrow();
  },
);

it(
  describeTests,
  "should match order by priority of registration",
  () => {
    const mock1 = fn();
    const mock2 = fn();
    const router = createRouter({
      "/api/:id": (_, ctx) => {
        mock1(ctx);
        return new Response();
      },
      "/api/:name": (_, ctx) => {
        mock2(ctx);
        return new Response();
      },
    });

    router(new Request("http://localhost/api/test"));

    expect(mock1).toHaveBeenCalled();
    expect(mock2).not.toHaveBeenCalled();
  },
);

it(
  describeTests,
  "should support HEAD method automatically when GET method handler is exists",
  async () => {
    const router = createRouter({
      "/": {
        GET: () => new Response("Hello world"),
      },
    });

    const res = await router(
      new Request("http://localhost/", { method: "HEAD" }),
    );

    expect(res).toEqualResponse(
      new Response(null, {
        headers: {
          "content-type": "text/plain;charset=UTF-8",
        },
      }),
    );
  },
);

it(
  describeTests,
  "should use defined head handler",
  async () => {
    const router = createRouter({
      "/": {
        HEAD: () =>
          new Response(null, {
            status: Status.BadRequest,
          }),
      },
    });

    const res = await router(
      new Request("http://localhost/", { method: "HEAD" }),
    );

    expect(res).toEqualResponse(
      new Response(null, {
        status: Status.BadRequest,
      }),
    );
  },
);

it(
  describeTests,
  "should return 405 with allow header when method is not exists",
  async () => {
    const router = createRouter({
      "/": {
        "GET": () => new Response("hello"),
      },
    });
    const res = await router(
      new Request("http://localhost/", { method: "POST" }),
    );

    expect(res).toEqualResponse(
      new Response(null, {
        status: Status.MethodNotAllowed,
        statusText: STATUS_TEXT[Status.MethodNotAllowed],
        headers: {
          allow: "GET,HEAD",
        },
      }),
    );
  },
);

it(
  describeTests,
  `should disable adding head handler automatically when "withHead" is false`,
  async () => {
    const router = createRouter({
      "/": {
        "GET": () => new Response("hello"),
      },
    }, { withHead: false });
    const res = await router(
      new Request("http://localhost/", { method: "HEAD" }),
    );

    expect(res).toEqualResponse(
      new Response(null, {
        status: Status.MethodNotAllowed,
        statusText: STATUS_TEXT[Status.MethodNotAllowed],
        headers: {
          allow: "GET",
        },
      }),
    );
  },
);

it(
  describeTests,
  `should return 500 when head handler using get handler throws error`,
  async () => {
    const router = createRouter({
      "/": {
        "GET": () => {
          throw Error();
        },
      },
    });
    const res = await router(
      new Request("http://localhost/", { method: "HEAD" }),
    );

    expect(res).toEqualResponse(
      new Response(null, {
        status: Status.InternalServerError,
        statusText: STATUS_TEXT[Status.InternalServerError],
      }),
    );
  },
);

it(
  describeTests,
  `should return 200 when basePath is joined`,
  async () => {
    const router = createRouter({
      "/hello": () => new Response(null),
    }, {
      basePath: "/api",
    });
    const res = await router(
      new Request("http://localhost/api/hello"),
    );

    expect(res).toEqualResponse(
      new Response(null, { status: Status.OK }),
    );
  },
);

it(
  describeTests,
  `should return 200 when basePath is dirty`,
  async () => {
    const router = createRouter({
      "/hello": () => new Response(null),
    }, {
      basePath: "/api///",
    });
    const res = await router(
      new Request("http://localhost/api/hello"),
    );

    expect(res).toEqualResponse(
      new Response(null, { status: Status.OK }),
    );
  },
);

it(
  describeTests,
  `should return simple nested route`,
  async () => {
    const router = createRouter({
      "/api": {
        "/hello": () => new Response(),
      },
    });
    const res = await router(
      new Request("http://localhost/api/hello"),
    );

    expect(res).toEqualResponse(
      new Response(null, { status: Status.OK }),
    );
  },
);

it(
  describeTests,
  `should return simple nested route with POST method`,
  async () => {
    const router = createRouter({
      "/api": {
        "/hello": {
          POST: () => new Response(),
        },
      },
    });
    const res = await router(
      new Request("http://localhost/api/hello", { method: "POST" }),
    );

    expect(res).toEqualResponse(
      new Response(null, { status: Status.OK }),
    );
  },
);

it(
  describeTests,
  `should return success when the nested route leaf is not method handler`,
  async () => {
    const router = createRouter({
      "/api": {
        GET: {
          "/hello": () => new Response(),
        },
      },
    });
    const res = await router(
      new Request("http://localhost/api/GET/hello"),
    );

    expect(res).toEqualResponse(
      new Response(null, { status: Status.OK }),
    );
  },
);

it(
  describeTests,
  `should return 404 when the nested route is empty`,
  async () => {
    const router = createRouter({
      "/api": {
        "/hello": {},
      },
    });
    const res = await router(
      new Request("http://localhost/api/hello"),
    );

    expect(res).toEqualResponse(
      new Response(null, {
        status: Status.NotFound,
        statusText: STATUS_TEXT[Status.NotFound],
      }),
    );
  },
);

it(
  describeTests,
  `should return head response when the nested route of GET method is exists`,
  async () => {
    const router = createRouter({
      "/api": {
        "/hello": {
          GET: () => new Response(),
        },
      },
    });
    const res = await router(
      new Request("http://localhost/api/hello", { method: "HEAD" }),
    );

    expect(res).toEqualResponse(
      new Response(null, { status: Status.OK }),
    );
  },
);

it(
  describeTests,
  `should return 405 response when the nested routes does not define the method`,
  async () => {
    const router = createRouter({
      "/api": {
        "/hello": {
          GET: () => new Response(),
        },
      },
    });
    const res = await router(
      new Request("http://localhost/api/hello", { method: "POST" }),
    );

    expect(res).toEqualResponse(
      new Response(null, {
        status: Status.MethodNotAllowed,
        statusText: STATUS_TEXT[Status.MethodNotAllowed],
        headers: { allow: "GET,HEAD" },
      }),
    );
  },
);

it(
  describeTests,
  `should throw when the route is deprecated`,
  () => {
    expect(() =>
      createRouter({
        "/": {
          "/api": () => new Response(),
        },
        "/api": () => new Response(),
      })
    ).toThrow(`One or more errors were detected in the routing table.`);
  },
);

it(
  describeTests,
  `should throw when the route and method is deprecated`,
  () => {
    expect(() =>
      createRouter({
        "/": {
          "/api": {
            GET: () => new Response(),
          },
        },
        "/api": {
          GET: () => new Response(),
        },
      })
    ).toThrow();
  },
);

it(
  describeTests,
  `should throw multiple error when the route and method is deprecated`,
  () => {
    expect(() =>
      createRouter({
        "/": {
          "/api": {
            GET: () => new Response(),
            POST: () => new Response(),
          },
        },
        "/api": {
          GET: () => new Response(),
          POST: () => new Response(),
        },
      })
    ).toThrow();
  },
);
