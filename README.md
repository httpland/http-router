<div align="center">

# http-router

<img src="https://raw.githubusercontent.com/httpland/http-router/main/_medias/logo.svg" width="180px" height="180px" alt="logo">

HTTP router for standard `Request` and `Response`.

[![deno land](http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno)](https://deno.land/x/http_router)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/http_router/mod.ts)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/httpland/http-router)](https://github.com/httpland/http-router/releases)
[![codecov](https://codecov.io/gh/httpland/http-router/branch/main/graph/badge.svg?token=nan4NUrx1V)](https://codecov.io/gh/httpland/http-router)
[![GitHub](https://img.shields.io/github/license/httpland/http-router)](https://github.com/httpland/http-router/blob/main/LICENSE)

[![test](https://github.com/httpland/http-router/actions/workflows/test.yaml/badge.svg)](https://github.com/httpland/http-router/actions/workflows/test.yaml)
[![NPM](https://nodei.co/npm/@httpland/http-router.png?mini=true)](https://nodei.co/npm/@httpland/http-router/)

</div>

---

## What

Provides a router for routing HTTP requests.

The following three concepts are used to handle HTTP requests and responses.

- [Middleware](#middleware)
- [Router](#router)
- [Context](#context)

## Packages

The package supports multiple platforms.

- deno.land/x - `https://deno.land/x/http_router/mod.ts`
- npm - `@httpland/http-router`

## Quick start

```ts
import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
import logger from "https://deno.land/x/http_log@$VERSION/mod.ts";
import auth from "https://deno.land/x/http_auth@$VERSION/mod.ts";
import Basic from "https://deno.land/x/http_auth@$VERSION/basic.ts";
import etag from "https://deno.land/x/http_etag@$VERSION/mod.ts";
import { serve } from "https://deno.land/std@$VERSION/http/server.ts";

const router = new Router()
  .all(logger())
  .all(etag())
  .all("/admin*", auth(new Basic({ "<use-id>": "<password>" })))
  .get("/admin", () => new Response("hello admin"))
  .get("/greet/:name", function () {
    const name = this.params.name;

    return new Response(`Hello ${name}`);
  });

serve(router.handler);
```

## Handler

Before getting into the middleware, it helps to know about the `Handler`.

The `Handler` API is the core of HTTP handling.

```ts
interface Handler {
  (request: Request): Response | Promise<Response>;
}
```

`Handler` is defined with standard `Request` and `Response`. Also, it must
always return a `Response`.

This feature makes it easy to test and has no other dependencies.

```ts
type User = { id: string; name: string };
declare const db: { users: User[] };

export function handleUser(request: Request): Response {
  return Response.json(db.users);
}
```

## Middleware

Middleware is a handler that adds a chaining mechanism to handler. That is, all
`Middleware` is a `Handler`.

```ts
import { type Handler } from "https://deno.land/x/http_router@$VERSION/mod.ts";

interface Middleware {
  (request: Request, next: Handler): Response | Promise<Response>;
}
```

`Middleware` is a self-contained API with a chaining mechanism.

`Middleware` allows for **complete control** of the next handler via `next`.

This feature allows any upstream(`Request`) or downstream(`Response`) can be
accessed and modified.

### Upstream and downstream

Upstream refers to the period between when the middleware itself is invoked and
when the next handler is resolved.

Downstream refers to the period between the resolution of the next handler and
its return.

Upstream and downstream are expressed in code as follows:

```ts
import { type Middleware } from "https://deno.land/x/http_router@$VERSION/mod.ts";

const middleware: Middleware = async (request, next) => {
  // upstream
  const response = await next(request);
  // downstream
  return response;
};
```

### Handle Upstream

You can intervene in upstream and change the `Request` object, or **not** call
`next`.

This allows filter/guard of the handler.

For example, the HTTP Authentication:

```ts
import { type Middleware } from "https://deno.land/x/http_router@$VERSION/mod.ts";

declare const checkToken: (authorization: unknown) => boolean;

const auth: Middleware = async (request, next) => {
  const authorization = request.headers.get("authorization");

  if (checkToken(authorization)) {
    return next(request);
  }

  return new Response(null, {
    status: 401,
    headers: { "www-authenticate": "<auth-scheme>" },
  });
};
```

[http-auth](https://github.com/httpland/http-auth) provides the HTTP
Authentication middleware.

### Handle Downstream

You can intervene in the downstream and modify the `Response` object.

Example of adding the `x-server` header:

```ts
import { type Middleware } from "https://deno.land/x/http_router@$VERSION/mod.ts";

const serverInfo: Middleware = async (request, next) => {
  const response = await next(request);

  response.headers.set("x-server", "deno");

  return response;
};
```

## Router

Router routes HTTP requests. Routing supports HTTP request method and
`URLPattern` as the first class.

Specify middleware as the routing destination.

```ts
import {
  type Handler,
  type Middleware,
  Router,
} from "https://deno.land/x/http_router@$VERSION/mod.ts";

declare const handler: Handler;
declare const middleware: Middleware;

const router = new Router()
  .all(middleware)
  .all("/api*", handler)
  .get("/api/users/:id", handler);
```

All syntaxes of
[URLPattern API](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern)
are available.

### Respond to request

The purpose of router is to compose any handler and answer HTTP requests.

`handler` is a handler composed from handlers.

```ts
import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
import { serve } from "https://deno.land/std/http/mod.ts";

declare const router: Router;

serve(router.handler);
```

Router has no methods like `serve` or `listen` to handle HTTP connections.

In fact, this is unnecessary. You can use `Deno.serve` or `std/http`.

Router uses only the web standard API and can be used in other environments such
as Web worker.

### Execution Order

Handlers and middleware are executed in the order they are added.

The middleware executes upstream in the order in which they are added. Then,
downstream is executed in the **reverse order** of addition.

Some middleware, such as HTTP Authentication, uses an upstream filter.

Middleware that does not call `next` will not **call** subsequent middleware.

Therefore, add at the beginning the middleware that must be called.

```ts
import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
import logger from "https://deno.land/x/http_log@$VERSION/mod.ts";
import auth from "https://deno.land/x/http_auth@$VERSION/mod.ts";
import Basic from "https://deno.land/x/http_auth@$VERSION/basic.ts";
import etag from "https://deno.land/x/http_etag@$VERSION/mod.ts";

const router = new Router()
  .all(logger())
  .all(etag())
  .all("/admin*", auth(new Basic({ "<use-id>": "<password>" })))
  .get("/admin", () => new Response("hello admin"));
```

## Context

Context is a dependency.

In HTTP, the core context is the `Request` object.

The `Request` object is treated as a first-class context because it is
universal.

Therefore, the middleware accepts a `Request` object as its first argument. API.

Other contexts can be accessed via `this`.

### Route context

Router provides `URLPattern` matching results.

| Name   | Type                     |
| ------ | ------------------------ |
| match  | `URLPatternResult`       |
| params | `Record<string, string>` |

`params` is a shortcut for `match.pathname.group`.

`params` parses the URL Path at the type level and guarantees type safety.

```ts
import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";

const router = new Router().get("/:id", function () {
  const id = this.params.id; // type safe
  // this.params.any is type error
  const matched = this.match;

  return new Response(id);
});
```

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

## License

Copyright © 2023-present [httpland](https://github.com/httpland).

Released under the [MIT](./LICENSE) license
