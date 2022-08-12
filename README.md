# http-router

[![deno land](http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno)](https://deno.land/x/http_router)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/http_router/mod.ts)
![GitHub release (latest SemVer including pre-releases)](https://img.shields.io/github/v/release/httpland/http-router?include_prereleases)
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
    GET: (req, { params }) => {
      const greeting = `Hello! ${params.name!}`;
      return new Response(greeting);
    },
  },
  "/api/status": () => new Response("OK"), // Any HTTP request method
});
await serve(router);
```

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

## API

All APIs can be found in the
[deno doc](https://doc.deno.land/https/deno.land/x/http_router/mod.ts).

## Performance

Benchmark script with comparison to several popular routers is available.

```bash
deno bench --unstable
```

## License

Copyright © 2022-present [httpland](https://github.com/httpland).

Released under the [MIT](./LICENSE) license
