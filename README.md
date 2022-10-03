# http-router

[![deno land](http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno)](https://deno.land/x/http_router)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/http_router/mod.ts)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/httpland/http-router)](https://github.com/httpland/http-router/releases)
[![codecov](https://codecov.io/gh/httpland/http-router/branch/main/graph/badge.svg?token=nan4NUrx1V)](https://codecov.io/gh/httpland/http-router)
[![GitHub](https://img.shields.io/github/license/httpland/http-router)](https://github.com/httpland/http-router/blob/main/LICENSE)

[![test](https://github.com/httpland/http-router/actions/workflows/test.yaml/badge.svg)](https://github.com/httpland/http-router/actions/workflows/test.yaml)
[![NPM](https://nodei.co/npm/@httpland/http-router.png?mini=true)](https://nodei.co/npm/@httpland/http-router/)

HTTP request router for standard `Request` and `Response`.

## Features

- Based on
  [URL pattern API](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API)
- Web standard API compliant
- Declarative
- Functional programing pattern matching style
- Automatically `HEAD` request handler
- Nested route pathname
- Tiny

## Packages

The package supports multiple platforms.

- deno.land/x - `https://deno.land/x/http_router/mod.ts`
- npm - `@httpland/http-router`

## URL router

`URLRouter` provides routing between URLs and handlers.

It accepts the `URLPattern API` as is. This means that various url patterns can
be matched.

```ts
import { URLRouter } from "https://deno.land/x/http_router@$VERSION/mod.ts";
import { serve } from "https://deno.land/std@$VERSION/http/mod.ts";

const handler = URLRouter([
  [{ pathname: "/" }, () => new Response("Home")],
  [
    { password: "admin", pathname: "/admin" },
    (request, context) => new Response("Hello admin!"),
  ],
]);

await serve(handler);
```

It accepts a set of `URLPatternInit` and handlers wrapped by `Iterable` object.

In other words, it is not limited to arrays.

```ts
import { URLRouter } from "https://deno.land/x/http_router@$VERSION/mod.ts";

const handler = URLRouter(
  new Map([
    [{ pathname: "/" }, () => new Response("Home")],
  ]),
);
```

### Pathname routes

URLPattern routes are the most expressive, but somewhat verbose. URL pattern
matching is usually done using `pathname`.

URLRouter supports URL pattern matching with `pathname` as a first class.

```ts
import { URLRouter } from "https://deno.land/x/http_router@$VERSION/mod.ts";

const handler = URLRouter({
  "/api/students/:name": (request, context) => {
    const greeting = `Hello! ${context.params.name!}`;
    return new Response(greeting);
  },
  "/api/status": () => new Response("OK"),
});
```

same as:

```ts
import { URLRouter } from "https://deno.land/x/http_router@$VERSION/mod.ts";

const handler = URLRouter(
  [
    [
      { pathname: "/api/students/:name" },
      (request, context) => {
        const greeting = `Hello! ${context.params.name!}`;
        return new Response(greeting);
      },
    ],
    [{ pathname: "/api/status" }, () => new Response("OK")],
  ],
);
```

### URL Route handler context

The URL route handler receives the following context.

| Name    | Description                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------------- |
| pattern | `URLPattern`<br>URL pattern.                                                                            |
| result  | `URLPatternResult`<br> Pattern matching result.                                                         |
| params  | `URLPatternResult["pathname"]["groups"]`<br>URL matched parameters. Alias for `result.pathname.groups`. |

### URL match pattern

URL patterns can be defined using the
[URL pattern API](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API).

- Literal strings which will be matched exactly.
- Wildcards (`/posts/*`) that match any character.
- Named groups (`/books/:id`) which extract a part of the matched URL.
- Non-capturing groups (`/books{/old}?`) which make parts of a pattern optional
  or be matched multiple times.
- RegExp groups (`/books/(\\d+)`) which make arbitrarily complex regex matches
  with a few limitations.

### Nested route pathname

`nest` is nested URL pathname convertor. It provides a hierarchy of routing
tables.

Hierarchical definitions are converted to flat definitions.

You can define a tree structure with a depth of 1. To nest more, combine it.

Example of a routing table matching the following URL:

- /
- /api/v1/users
- /api/v1/products
- /api/v2/users
- /api/v2/products

```ts
import {
  nest,
  URLRouter,
} from "https://deno.land/x/http_router@$VERSION/mod.ts";

const routeHandler = () => new Response();
const v2 = nest("v2", {
  users: routeHandler,
  products: routeHandler,
});
const api = nest("/api", {
  ...nest("v1", {
    users: routeHandler,
    products: routeHandler,
  }),
  ...v2,
});
const handler = URLRouter({ ...api, "/": routeHandler });
```

#### Joining path segment

Path segments are joined without overlapping slashes.

```ts
import { nest } from "https://deno.land/x/http_router@$VERSION/mod.ts";
import { assertEquals } from "https://deno.land/std@$VERSION/testing/asserts.ts";

const routeHandler = () => new Response();
assertEquals(
  nest("api/", {
    "/hello": routeHandler,
  }),
  {
    "api/hello": routeHandler,
  },
);
```

#### Error pattern

The routing table defined in nest may have duplicate url patterns in some cases.

As seen in [Joining path segment](#joining-path-segment), segment slashes are
safely handled. This results in the following definitions being identical

- branch
- `/`branch
- `//`branch ...

These are converted to the following pathname:

`[root]/branch`

In this case, the routing table is ambiguous. `nest` will throw an error if it
finds an ambiguous routing table.

This eliminates ambiguous patterns and protects you from unexpected behavior.

`AggregateError` will inform you of the details of the error.

## HTTP request method router

`MethodRouter` provides routing between HTTP request methods and handlers.

```ts
import { MethodRouter } from "https://deno.land/x/http_router@$VERSION/mod.ts";
import { serve } from "https://deno.land/std@$VERSION/http/mod.ts";

const handler = MethodRouter({
  GET: () => new Response("From GET"),
  POST: async (request) => {
    const data = await request.json();
    return new Response("Received data!");
  },
});

await serve(handler);
```

### HEAD request handler

By default, if a `GET` request handler is defined, a `HEAD` request handler is
automatically added.

This feature is based on RFC 9110, 9.1

> All general-purpose servers MUST support the methods GET and HEAD.

```ts
import { MethodRouter } from "https://deno.land/x/http_router@$VERSION/mod.ts";
import { serve } from "https://deno.land/std@$VERSION/http/mod.ts";
import { assertEquals } from "https://deno.land/std@$VERSION/testing/asserts.ts";

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

assertEquals(response.body, null);
assertEquals(response.headers.get("content-length"), "12");
```

This can be disabled by setting `withHead` to `false`.

```ts
import { MethodRouter } from "https://deno.land/x/http_router@$VERSION/mod.ts";

const handler = MethodRouter({}, { withHead: false });
```

## Detect error in router

If your defined handler throws an error internally, it will be supplemented and
safely return a `Response`.

Here is the default response on error.

```http
HTTP/1.1 500 Internal Server Error
```

`onError` is called when an error is thrown internally by the handler. You may
customize the error response.

```ts
import { URLRouter } from "https://deno.land/x/http_router@$VERSION/mod.ts";

const handler = URLRouter({
  "/": () => {
    throw Error("oops");
  },
}, {
  onError: (error) => {
    console.error(error);
    return new Response("Something wrong :(", {
      status: 500,
    });
  },
});
```

## Spec

In addition to user-defined responses, routers may return the following
responses:

| Status | Headers | Condition                                                   |
| ------ | ------- | ----------------------------------------------------------- |
| 404    |         | `URLRouter`<br>If not all url pattern match.                |
| 405    | `allow` | `MethodRouter`<br>If HTTP method handler is not defined.    |
| 500    |         | `URLRouter`, `MethodRouter`<br>If an internal error occurs. |

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

Benchmark results can be found
[here](https://github.com/httpland/http-router/actions/runs/3043238906/jobs/4902286626#step:4:60).

## Related

- [Term definition](https://github.com/httpland/http-router/wiki/Term-definition)

### Recipes

- [router + compress](./_exmaples/../_examples/compress.ts)

## License

Copyright © 2022-present [httpland](https://github.com/httpland).

Released under the [MIT](./LICENSE) license
