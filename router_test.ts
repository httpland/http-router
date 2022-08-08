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
    const router = createRouter({
      "/": (_, params) => {
        expect(params).toEqual({});

        return new Response("Hello");
      },
    });
    const res = await router(
      new Request("http://localhost/"),
    );

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
    const router = createRouter({
      "/api/:id": (_, params) => {
        expect(params).toEqual({ id: "test" });
        return new Response(null);
      },
    });
    const res = await router(
      new Request("http://localhost/api/test"),
    );

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
      "/api/:id": (_, params) => {
        mock1(params);
        return new Response();
      },
      "/api/:name": (_, params) => {
        mock2(params);
        return new Response();
      },
    });

    router(new Request("http://localhost/api/test"));

    expect(mock1).toHaveBeenCalledWith({ id: "test" });
    expect(mock2).not.toHaveBeenCalled();
  },
);
