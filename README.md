# http-router

[![deno land](http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno)](https://deno.land/x/http_router)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/http_router/mod.ts)
[![npm](https://img.shields.io/npm/v/@httpland/http-router)](https://www.npmjs.com/package/@httpland/http-router)
[![GitHub](https://img.shields.io/github/license/httpland/http-router)](https://github.com/httpland/http-router/blob/main/LICENSE)

HTTP request router for standard `Request` and `Response`.

- URL pattern matching
- Tiny, lean

## HTTP router

Create HTTP request router with URL pattern and method handler map.

```ts
import { createRouter } from "https://deno.land/x/http_router@$VERSION/mod.ts";
import { serve } from "https://deno.land/std@$VERSION/http/mod.ts";
const router = createRouter({
  "/api/students/:name": {
    GET: (req, params) => {
      const greeting = `Hello! ${params.name!}`;
      return new Response(greeting);
    },
  },
  "/api/status": () => new Response("OK"), // Any HTTP request method
});
await serve(router);
```

## HEAD request handler

By default, if a `GET` request handler is defined, a `HEAD` request handler is
automatically added.

This feature is based on RFC 9110, 9.1

> All general-purpose servers MUST support the methods GET and HEAD.

```ts
import { createRouter } from "https://deno.land/x/http_router@$VERSION/mod.ts";
import { serve } from "https://deno.land/std@$VERSION/http/mod.ts";
import { assertEquals } from "https://deno.land/std@$VERSION/testing/asserts.ts";
const router = createRouter({
  "/": {
    GET: (req) => {
      const body = `Hello! world`;
      return new Response(body, {
        headers: {
          "content-length": new Blob([body]).size.toString(),
        },
      });
    },
  },
});

const req = new Request("http://localhost", { method: "HEAD" });
const res = await router(req);
assertEquals(res.body, null);
assertEquals(res.headers.get("content-length"), "12");
```

This can be disabled by setting `withHead` to `false`.

```ts
import { createRouter } from "https://deno.land/x/http_router@$VERSION/mod.ts";
createRouter({}, { withHead: false });
```

## Performance

Benchmark script with comparison to several popular routers is available. Run it
with `deno bench --unstable`.

## License

Copyright © 2022-present [httpland](https://github.com/httpland).

Released under the [MIT](./LICENSE) license
