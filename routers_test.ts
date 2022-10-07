import { MethodRouter, URLRouter } from "./routers.ts";
import { anyFunction, describe, expect, fn, it } from "./dev_deps.ts";
import { Status, STATUS_TEXT } from "./deps.ts";

const handler = () => new Response();

describe("URLRouter", () => {
  it(
    "should return 404 when the matching is fail",
    async () => {
      const router = URLRouter({
        "/": handler,
      });
      const res = await router(
        new Request("http://localhost/a"),
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
    "should return 500 when route handler has exception",
    async () => {
      const router = URLRouter({
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
    "should return 200 when url path match",
    async () => {
      const mock = fn();
      const router = URLRouter({
        "/": (_, ctx) => {
          mock(ctx);

          return new Response("Hello");
        },
      });
      const res = await router(
        new Request("http://localhost/"),
      );

      expect(mock).toHaveBeenCalledWith({
        result: new URLPattern({ "pathname": "/" }).exec("http://localhost/"),
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
    "should return 200 when async response",
    async () => {
      const router = URLRouter({
        "/": () => Promise.resolve(new Response()),
      });
      const res = await router(
        new Request("http://localhost/"),
      );

      expect(res).toEqualResponse(
        new Response(null, {
          status: Status.OK,
        }),
      );
    },
  );

  it(
    "should return 500 when promise is rejected",
    async () => {
      const router = URLRouter({
        "/": () => Promise.reject(new Response()),
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
    "should pass params when url patten include",
    async () => {
      const mock = fn();
      const router = URLRouter({
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
        result: new URLPattern({ pathname: "/api/:id" }).exec(
          "http://localhost/api/test",
        ),
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
    "should not throw error when the route path is invalid",
    () => {
      expect(
        URLRouter({
          "https://api/:id": () => new Response(),
        }),
      ).toEqual(anyFunction());
    },
  );

  it(
    "should match order by priority of registration",
    () => {
      const mock1 = fn();
      const mock2 = fn();
      const router = URLRouter({
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
    `should not throw error when the path is invalid`,
    () => {
      expect(
        URLRouter({
          "+": handler,
        }),
      ).toEqual(anyFunction());
    },
  );

  it(`should call cached handler`, async () => {
    const mock = fn();
    const router = URLRouter({
      "/api": handler,
      "/api2": handler,
      "/api3": handler,
      "/": () => {
        mock();
        return new Response();
      },
    });

    await router(new Request("http://localhost"));
    const result = await router(new Request("http://localhost"));
    expect(result.ok).toBeTruthy();
    expect(mock).toHaveBeenCalledTimes(2);
  });

  it(
    `should catch error and return custom response`,
    async () => {
      const mock = fn();

      const router = URLRouter({
        "/": () => {
          throw "test";
        },
      }, {
        onError: (error) => {
          mock(error);

          return new Response("custom error");
        },
      });

      const result = await router(new Request("http://localhost"));
      expect(mock).toHaveBeenCalledWith("test");
      expect(result).toEqualResponse(
        new Response("custom error", {
          status: Status.OK,
          headers: {
            "content-type": "text/plain;charset=UTF-8",
          },
        }),
      );
    },
  );

  it(
    `should match when the URLPattern routes`,
    async () => {
      const router = URLRouter([
        [{ password: "admin", username: "admin" }, handler],
      ]);

      const result = await router(new Request("https://admin:admin@localhost"));
      expect(result).toEqualResponse(
        new Response(null, {
          status: 200,
        }),
      );
    },
  );

  it(
    `should match when the iterable URLPattern routes`,
    async () => {
      const router = URLRouter(
        new Map([
          [{ password: "admin", username: "admin" }, handler],
        ]),
      );

      const result = await router(new Request("https://admin:admin@localhost"));
      expect(result).toEqualResponse(
        new Response(null, {
          status: 200,
        }),
      );
    },
  );

  it(
    `should return default error response when throw error in onError`,
    async () => {
      const router = URLRouter({
        "/": () => {
          throw "test";
        },
      }, {
        onError: (error) => {
          throw error;
        },
      });

      const result = await router(new Request("http://localhost"));
      expect(result).toEqualResponse(
        new Response(null, {
          status: Status.InternalServerError,
          statusText: STATUS_TEXT[Status.InternalServerError],
        }),
      );
    },
  );
});

describe("MethodRouter", () => {
  it(
    "should return 405 when method is not exists",
    async () => {
      const router = MethodRouter({
        "GET": handler,
        "HEAD": handler,
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
    "should support HEAD method automatically when GET method handler is exists",
    async () => {
      const router = MethodRouter({
        GET: () => new Response("Hello world"),
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
    "should use defined head handler",
    async () => {
      const router = MethodRouter({
        HEAD: () =>
          new Response(null, {
            status: Status.BadRequest,
          }),
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
    `should disable adding head handler automatically when "withHead" is false`,
    async () => {
      const router = MethodRouter({
        "GET": () => new Response("hello"),
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
    `should return headers of allow sorted by asc `,
    async () => {
      const router = MethodRouter({
        GET: handler,
        DELETE: handler,
        POST: handler,
        HEAD: handler,
        PUT: handler,
      });
      const res = await router(
        new Request("http://localhost/", { method: "PATCH" }),
      );

      expect(res).toEqualResponse(
        new Response(null, {
          status: Status.MethodNotAllowed,
          statusText: STATUS_TEXT[Status.MethodNotAllowed],
          headers: {
            allow: "DELETE,GET,HEAD,POST,PUT",
          },
        }),
      );
    },
  );

  it(
    `should catch error and return custom response`,
    async () => {
      const mock = fn();

      const router = MethodRouter({
        GET: () => {
          throw "test";
        },
      }, {
        onError: (error) => {
          mock(error);

          return new Response("custom error");
        },
      });

      const result = await router(new Request("http://localhost"));
      expect(mock).toHaveBeenCalledWith("test");
      expect(result).toEqualResponse(
        new Response("custom error", {
          status: Status.OK,
          headers: {
            "content-type": "text/plain;charset=UTF-8",
          },
        }),
      );
    },
  );

  it(
    `should return default error response when throw error in onError`,
    async () => {
      const router = URLRouter({
        "/": () => {
          throw "test";
        },
      }, {
        onError: (error) => {
          throw error;
        },
      });

      const result = await router(new Request("http://localhost"));
      expect(result).toEqualResponse(
        new Response(null, {
          status: Status.InternalServerError,
          statusText: STATUS_TEXT[Status.InternalServerError],
        }),
      );
    },
  );

  it("should empty body when HEAD response", async () => {
    const handler = MethodRouter({
      GET: () => {
        const body = `Hello! world`;
        return new Response(body, {
          headers: {
            "content-length": new Blob([body]).size.toString(),
          },
        });
      },
    });
    const request = new Request("http://localhost", { method: "HEAD" });
    const response = await handler(request);

    expect(response.body).toBe(null);
    expect(response.headers.get("content-length")).toBe("12");
  });
});
