# http-router

[![deno land](http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno)](https://deno.land/x/http_router)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/http_router/mod.ts)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/httpland/http-router)](https://github.com/httpland/http-router/releases)
[![codecov](https://codecov.io/gh/httpland/http-router/branch/main/graph/badge.svg?token=nan4NUrx1V)](https://codecov.io/gh/httpland/http-router)
[![GitHub](https://img.shields.io/github/license/httpland/http-router)](https://github.com/httpland/http-router/blob/main/LICENSE)

[![test](https://github.com/httpland/http-router/actions/workflows/test.yaml/badge.svg)](https://github.com/httpland/http-router/actions/workflows/test.yaml)
[![NPM](https://nodei.co/npm/@httpland/http-router.png?mini=true)](https://nodei.co/npm/@httpland/http-router/)

HTTP request router for standard `Request` and `Response`.

- Based on
  [URL pattern API](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API)
- Tiny, lean
- Automatically `HEAD` request handler

## Packages

The package supports multiple platforms.

- deno.land/x - `https://deno.land/x/http_router/mod.ts`
- npm - `@httpland/http-router`

## HTTP router

Create HTTP request router with URL pattern and method handler map.

```ts
import { createRouter } from "https://deno.land/x/http_router@$VERSION/mod.ts";
import { serve } from "https://deno.land/std@$VERSION/http/mod.ts";
const router = createRouter({
  "/api/students/:name": {
    GET: (req, ctx) => {
      const greeting = `Hello! ${ctx.params.name!}`;
      return new Response(greeting);
    },
  },
  "/api/status": () => new Response("OK"), // Any HTTP request method
});
await serve(router);
```

## Route handler context

The route handler receives the following context.

| Name    | Description                                                      |
| ------- | ---------------------------------------------------------------- |
| params  | `{ readonly [k in string]?: string }`<br>URL matched parameters. |
| route   | `string`<br> Route pathname.                                     |
| pattern | `URLPattern`<br>URL pattern.                                     |

## Nested route

Nested route is supported.

The nested root is a flat route syntax sugar. Nesting can be as deep as desired.

```ts
import { createRouter } from "https://deno.land/x/http_router@$VERSION/mod.ts";
createRouter({
  "/api": {
    "status": () => new Response("OK"),
    "hello": {
      GET: () => new Response("world!"),
    },
  },
});
```

This matches the following pattern:

- /api/status
- [GET] /api/hello
- [HEAD] /api/hello (if [withHead](#head-request-handler) is not `false`)

### Joining path segment

Path segments are joined without overlapping slashes.

The result is the same with or without slashes between path segments.

```ts
import { createRouter } from "https://deno.land/x/http_router@$VERSION/mod.ts";
createRouter({
  "/api": {
    "status": () => new Response("OK"),
    "/status": () => new Response("OK"),
  },
  "/api/status": () => new Response("OK"),
});
```

They all represent the same URL pattern.

## Throwing error

Routers may throw an error during initialization.

If an error is detected in the user-defined routing table, an error is thrown.

Error in the routing table:

- Duplicate route
- Duplicate route and HTTP method pairs

These prevent you from writing multiple routing tables with the same meaning and
protect you from unexpected bugs.

Throwing error patterns:

```ts
import { createRouter } from "https://deno.land/x/http_router@$VERSION/mod.ts";
createRouter({
  "/api": {
    "status": () => new Response("OK"),
    "/status": () => new Response("OK"),
  },
  "/api/status": () => new Response("OK"),
}); // duplicate /api/status
createRouter({
  "/api": {
    "status": {
      GET: () => new Response("OK"),
    },
  },
  "/api/status": {
    GET: () => new Response("OK"),
  },
}); // duplicate [GET] /api/status
```

router detects as many errors as possible and throws errors. In this case, it
throws `AggregateError`, which has `RouterError` as a child.

## URL match pattern

URL patterns can be defined using the
[URL pattern API](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API).

- Literal strings which will be matched exactly.
- Wildcards (`/posts/*`) that match any character.
- Named groups (`/books/:id`) which extract a part of the matched URL.
- Non-capturing groups (`/books{/old}?`) which make parts of a pattern optional
  or be matched multiple times.
- RegExp groups (`/books/(\\d+)`) which make arbitrarily complex regex matches
  with a few limitations.

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

## Handle base path

Change the router base path.

Just as you could use baseURL or base tags on the Web, you can change the
`basePath` of your router.

```ts
import { createRouter } from "https://deno.land/x/http_router@$VERSION/mod.ts";
import { assertEquals } from "https://deno.land/std@$VERSION/testing/asserts.ts";
const api = createRouter({
  "/hello": () => new Response("world"),
}, { basePath: "/api" });

const res = await api(new Request("http://localhost/api/hello"));
assertEquals(res.ok, true);
```

The `basePath` and route path are merged without overlapping slashes.

## Spec

In addition to user-defined responses, routers may return the following
responses:

| Status | Headers | Condition                             |
| ------ | :-----: | ------------------------------------- |
| 404    |    -    | If not all route paths match.         |
| 405    | `allow` | If no HTTP method handler is defined. |
| 500    |    -    | If an internal error occurs.          |

## API

All APIs can be found in the
[deno doc](https://doc.deno.land/https/deno.land/x/http_router/mod.ts).

## Performance

version 1.2 or later

Caches URL matching results internally. This speeds up the response time for
requests that have already been matched by `^20X`.

### Benchmark

Benchmark script with comparison to several popular routers is available.

```bash
deno task bench
```

## License

Copyright © 2022-present [httpland](https://github.com/httpland).

Released under the [MIT](./LICENSE) license
