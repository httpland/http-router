import { createRouter } from "./router.ts";
import { describe, expect, fn, it } from "./dev_deps.ts";
import { Status, STATUS_TEXT } from "./deps.ts";

const describeTests = describe("createRouter");

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
