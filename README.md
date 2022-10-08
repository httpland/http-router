<div align="center">

# http-router

<img src="https://raw.githubusercontent.com/httpland/http-router/main/_medias/logo.svg" width="180px" height="180px" alt="logo">

HTTP request router for standard `Request` and `Response`.

[![deno land](http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno)](https://deno.land/x/http_router)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/http_router/mod.ts)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/httpland/http-router)](https://github.com/httpland/http-router/releases)
[![codecov](https://codecov.io/gh/httpland/http-router/branch/main/graph/badge.svg?token=nan4NUrx1V)](https://codecov.io/gh/httpland/http-router)
[![GitHub](https://img.shields.io/github/license/httpland/http-router)](https://github.com/httpland/http-router/blob/main/LICENSE)

[![test](https://github.com/httpland/http-router/actions/workflows/test.yaml/badge.svg)](https://github.com/httpland/http-router/actions/workflows/test.yaml)
[![NPM](https://nodei.co/npm/@httpland/http-router.png?mini=true)](https://nodei.co/npm/@httpland/http-router/)

</div>

---

## Features

- Based on
  [URL pattern API](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API)
- Web standard API compliant
- Declarative
- Functional programing pattern matching style
- Automatically `HEAD` request handler
- Nested route pathname
- Tiny
- Universal

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

### Check routes validity

The router **never throws** an error. If the route is invalid, it will be
eliminated just.

To make sure that URLRoutes are valid in advance, you can use the validate
function.

For example, `?` as pathname is an invalid pattern.

```ts
import {
  URLRouter,
  URLRoutes,
  validateURLRoutes,
} from "https://deno.land/x/http_router@$VERSION/mod.ts";

const routes: URLRoutes = {
  "?": () => new Response(),
};
const result = validateURLRoutes(routes);

if (result !== true) {
  // do something
}

const handler = URLRouter(routes);
```

The validate function returns `true` in case of success, or an object
representing the contents of the `Error` in case of failure.

Invalid route means the following:

- Invalid `URLPattern`
- Duplicate `URLPattern`

You are completely free to do this or not.

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

#### Concatenate path segment

Path segments are concatenated with slashes.

```ts
import { nest } from "https://deno.land/x/http_router@$VERSION/mod.ts";
import { assertEquals } from "https://deno.land/std@$VERSION/testing/asserts.ts";

const routeHandler = () => new Response();
assertEquals(
  nest("/api", {
    "/hello": routeHandler,
    "status/": routeHandler,
  }),
  {
    "/api/hello": routeHandler,
    "/api/status/": routeHandler,
  },
);
```

#### Ambiguous pattern

The routing table defined in nest may have duplicate url patterns in some cases.

As seen in [Concatenate path segment](#concatenate-path-segment), segment
slashes are safely handled. This results in the following definitions being
identical

- branch
- `/`branch

These are converted to the following pathname:

`[root]/branch`

In this case, the routing table is ambiguous.

Route with the same pattern always take precedence **first** declared route.

This is because pattern matching is done from top to bottom.

### Pattern matching performance

Pattern matching is done from top to bottom. The computational complexity is
usually `O(n)`.

Pattern matching is done on URLs, so they are safely cached.

Already matched URL patterns have `O(1)` complexity.

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

## Hook on matched handler

The router provides hooks for cross-cutting interests.

## Before each

Provides a hook to be called before the handler is invoked.

You can skip the actual handler call on a particular request by passing a
`Response` object.

The handler call is skipped and the `afterEach` hook described below is called.

Example of handling a preflight request that is of transversal interest:

```ts
import { URLRouter } from "https://deno.land/x/http_router@$VERSION/mod.ts";
import { assertEquals } from "https://deno.land/std@$VERSION/testing/asserts.ts";
import { preflightResponse } from "https://deno.land/x/cors_protocol@$VERSION/mod.ts";

const handler = URLRouter({
  "/": () => new Response(),
}, {
  beforeEach: (request) => {
    const preflightRes = preflightResponse(request, {});
    return preflightRes;
  },
});
```

### After each

Provides a hook that is called after each matching handler is called.

With this hook, you can monitor the handler's call and modify the resulting
response.

To modify the response, a response object must be returned to the hook.

```ts
import { URLRouter } from "https://deno.land/x/http_router@$VERSION/mod.ts";
import { assertEquals } from "https://deno.land/std@$VERSION/testing/asserts.ts";

const handler = URLRouter({
  "/": () => new Response(),
}, {
  afterEach: (response) => {
    response.headers.set("x-router", "http-router");
    return response;
  },
});

assertEquals(
  (await handler(new Request("http://localhost"))).headers.get("x-router"),
  "http-router",
);
assertEquals(
  (await handler(
    new Request("http://localhost/unknown"),
  )).headers.get("x-router"),
  null,
);
```

## Spec

In addition to user-defined responses, routers may return the following
responses:

| Status | Headers | Condition                                                |
| ------ | ------- | -------------------------------------------------------- |
| 404    |         | `URLRouter`<br>If not all url pattern match.             |
| 405    | `allow` | `MethodRouter`<br>If HTTP method handler is not defined. |

## API

All APIs can be found in the
[deno doc](https://doc.deno.land/https/deno.land/x/http_router/mod.ts).

## Benchmark

Benchmark script with comparison to several popular routers is available.

```bash
deno task bench
```

Benchmark results can be found
[here](https://github.com/httpland/http-router/actions/runs/3043238906/jobs/4902286626#step:4:60).

## Related

More detailed references:

- [Term definition](https://github.com/httpland/http-router/wiki/Term-definition)
- [Developer's Guide](https://github.com/httpland/http-router/wiki/Developer's-Guide)

### Recipes

#### URLRouter + MethodRouter

URLRouter and MethodRouter are independent, but will often be used together.

```ts
import {
  MethodRouter as $,
  URLRouter,
  URLRoutes,
} from "https://deno.land/x/http_router@$VERSION/mod.ts";

const routeHandler = () => new Response();
const routes: URLRoutes = {
  "/": $({
    GET: routeHandler,
  }),
  "/api/status/?": routeHandler,
  "/api/users/:id/?": (request, { params }) => {
    // params.id!
    return $({
      POST: routeHandler,
    })(request);
  },
};
const handler = URLRouter(routes);
```

#### Others

- [router + compress](./_exmaples/../_examples/compress.ts)

## License

Copyright © 2022-present [httpland](https://github.com/httpland).

Released under the [MIT](./LICENSE) license
