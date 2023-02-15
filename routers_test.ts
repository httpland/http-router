import { MethodRouter, URLRouter } from "./routers.ts";
import { describe, expect, fn, it } from "./_dev_deps.ts";
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
    "should throw error when route handler has exception",
    async () => {
      const router = URLRouter({
        "/": () => {
          throw Error("Unknown error");
        },
      });
      try {
        await router(new Request("http://localhost/"));
      } catch (e) {
        expect(e).toEqual(new Error("Unknown error"));
      }
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
    "should match order by priority of registration",
    async () => {
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

      await router(new Request("http://localhost/api/test"));

      expect(mock1).toHaveBeenCalled();
      expect(mock2).not.toHaveBeenCalled();
    },
  );

  it(
    `should throw error when the path is invalid`,
    () => {
      expect(
        () =>
          URLRouter({
            "+": handler,
          }),
      ).toThrow(`Invalid routes.`);
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
    `should call before each on before handler call`,
    async () => {
      const mock = fn();

      const router = URLRouter({
        "/": () => {
          mock(2);
          return new Response();
        },
      }, {
        beforeEach: () => {
          mock(1);
        },
      });

      const req = new Request("http://localhost");
      await router(req);

      expect(mock).toHaveBeenNthCalledWith(1, 1);
      expect(mock).toHaveBeenNthCalledWith(2, 2);
    },
  );

  it(
    `should customize request on before each`,
    async () => {
      const mock = fn();

      const router = URLRouter({
        "/": (req) => {
          mock(req.headers.get("x-custom"));
          return new Response();
        },
      }, {
        beforeEach: (req) => {
          req.headers.set("x-custom", "test");
          return req;
        },
      });

      await router(new Request("http://localhost"));

      expect(mock).toHaveBeenCalledWith("test");
    },
  );

  it(
    `should return from before each response`,
    async () => {
      const mock = fn();

      const router = URLRouter({
        "/": () => {
          mock();
          return new Response();
        },
      }, {
        beforeEach: (req) => {
          if (req.method === "OPTIONS") return new Response("beforeEach");
          return;
        },
      });

      const res = await router(
        new Request("http://localhost", { method: "OPTIONS" }),
      );
      expect(res).toEqualResponse(new Response("beforeEach"));
      expect(mock).not.toHaveBeenCalled();
    },
  );

  it(
    `should call after each on before response`,
    async () => {
      const mock = fn();
      const router = URLRouter({
        "/": () => new Response(null),
      }, {
        afterEach: (res) => {
          mock(res);
        },
      });

      await router(new Request("http://localhost"));

      expect(mock).toHaveBeenCalled();
    },
  );

  it(
    `should not call after each when not match pattern`,
    async () => {
      const mock = fn();
      const router = URLRouter({
        "/": () => new Response(null),
      }, {
        afterEach: (res) => {
          mock(res);
        },
      });

      await router(new Request("http://localhost/unknown"));

      expect(mock).not.toHaveBeenCalled();
    },
  );

  it(
    `should override response with after each hook`,
    async () => {
      const router = URLRouter({
        "/": () => new Response(null),
      }, {
        afterEach: (res) => {
          res.headers.append("x-test", "test");
          return res;
        },
      });

      const result = await router(new Request("http://localhost"));
      expect(result).toEqualResponse(
        new Response(null, {
          status: Status.OK,
          headers: {
            "x-test": "test",
          },
        }),
      );
    },
  );

  it(
    `should not override response whenever return response`,
    async () => {
      const router = URLRouter({
        "/": () => new Response(null),
      }, {
        afterEach: (res) => {
          res.headers.append("x-test", "test");
        },
      });

      const result = await router(new Request("http://localhost"));
      expect(result).toEqualResponse(
        new Response(null, {
          status: Status.OK,
        }),
      );
    },
  );

  it(
    `should call before each then after each`,
    async () => {
      const mock = fn();
      const router = URLRouter({
        "/": () => {
          mock(2);
          return new Response(null);
        },
      }, {
        beforeEach: () => {
          mock(1);
          return new Response("");
        },
        afterEach: (res) => {
          mock(3);
          res.headers.append("x-test", "test");
        },
      });

      await router(new Request("http://localhost"));

      expect(mock).toHaveBeenCalledTimes(2);
      expect(mock).toHaveBeenNthCalledWith(1, 1);
      expect(mock).toHaveBeenNthCalledWith(2, 3);
    },
  );

  it("should pass example", async () => {
    const handler = URLRouter({
      "/": () => new Response(),
    }, {
      afterEach: (response) => {
        response.headers.set("x-router", "http-router");

        return response;
      },
    });

    expect(
      (await handler(new Request("http://localhost"))).headers.get("x-router"),
    ).toBe("http-router");
    expect(
      (await handler(new Request("http://localhost/unknown"))).headers.get(
        "x-router",
      ),
    ).toBeNull();
  });
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

  it(
    `should call before each on before handler call`,
    async () => {
      const mock = fn();

      const router = MethodRouter({
        GET: () => {
          mock(2);
          return new Response();
        },
      }, {
        beforeEach: () => {
          mock(1);
        },
      });

      const req = new Request("http://localhost");
      await router(req);

      expect(mock).toHaveBeenNthCalledWith(1, 1);
      expect(mock).toHaveBeenNthCalledWith(2, 2);
    },
  );

  it(
    `should customize request on before each`,
    async () => {
      const mock = fn();

      const router = MethodRouter({
        GET: (req) => {
          mock(req.headers.get("x-custom"));
          return new Response();
        },
      }, {
        beforeEach: (req) => {
          req.headers.set("x-custom", "test");
          return req;
        },
      });

      await router(new Request("http://localhost"));

      expect(mock).toHaveBeenCalledWith("test");
    },
  );

  it(
    `should return from before each response`,
    async () => {
      const mock = fn();

      const router = MethodRouter({
        GET: () => {
          mock();
          return new Response();
        },
      }, {
        beforeEach: (req) => {
          if (req.method === "GET") return new Response("beforeEach");
          return;
        },
      });

      const res = await router(
        new Request("http://localhost"),
      );
      expect(res).toEqualResponse(new Response("beforeEach"));
      expect(mock).not.toHaveBeenCalled();
    },
  );

  it(
    `should call after each on before response`,
    async () => {
      const mock = fn();
      const router = MethodRouter({
        GET: () => new Response(null),
      }, {
        afterEach: (res) => {
          mock(res);
        },
      });

      await router(new Request("http://localhost"));

      expect(mock).toHaveBeenCalled();
    },
  );

  it(
    `should not call after each when not match pattern`,
    async () => {
      const mock = fn();
      const router = MethodRouter({
        GET: () => new Response(null),
      }, {
        afterEach: (res) => {
          mock(res);
        },
      });

      await router(new Request("http://localhost", { method: "POST" }));

      expect(mock).not.toHaveBeenCalled();
    },
  );

  it(
    `should override response with after each hook`,
    async () => {
      const router = MethodRouter({
        GET: () => new Response(null),
      }, {
        afterEach: (res) => {
          res.headers.append("x-test", "test");
          return res;
        },
      });

      const result = await router(new Request("http://localhost"));
      expect(result).toEqualResponse(
        new Response(null, {
          status: Status.OK,
          headers: {
            "x-test": "test",
          },
        }),
      );
    },
  );

  it(
    `should call before each then after each`,
    async () => {
      const mock = fn();
      const router = MethodRouter({
        GET: () => {
          mock(2);
          return new Response(null);
        },
      }, {
        beforeEach: () => {
          mock(1);
          return new Response("");
        },
        afterEach: (res) => {
          mock(3);
          res.headers.append("x-test", "test");
        },
      });

      await router(new Request("http://localhost"));

      expect(mock).toHaveBeenCalledTimes(2);
      expect(mock).toHaveBeenNthCalledWith(1, 1);
      expect(mock).toHaveBeenNthCalledWith(2, 3);
    },
  );

  it(
    `should not override response whenever return response`,
    async () => {
      const router = MethodRouter({
        GET: () => new Response(null),
      }, {
        afterEach: (res) => {
          res.headers.append("x-test", "test");
        },
      });

      const result = await router(new Request("http://localhost"));
      expect(result).toEqualResponse(
        new Response(null, {
          status: Status.OK,
        }),
      );
    },
  );
});
