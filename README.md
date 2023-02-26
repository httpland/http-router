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

### Route with URLPattern

All features of URLPattern are available.

```ts
import {
  type Handler,
  Router,
} from "https://deno.land/x/http_router@$VERSION/mod.ts";

declare const handler: Handler;

new Router()
  .get({ username: ":username", password: ":password" }, function () {
    const username = this.match.username.groups["username"];
    const password = this.match.password.groups["password"];

    // check as Basic Authentication

    return new Response(null, { status: 401 });
  })
  .post({ hostname: "{*.}?example.com" }, handler);
```

### Route with URL

URL is a superset of URLPattern and can be used as is.

```ts
import {
  type Handler,
  Router,
} from "https://deno.land/x/http_router@$VERSION/mod.ts";

declare const handler: Handler;

new Router()
  .get(new URL("https://external.test"), handler);
```

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

### Nested routing

Router support nested route.

```ts
import {
  type Handler,
  Router,
} from "https://deno.land/x/http_router@$VERSION/mod.ts";

declare const handler: Handler;
const idRouter = new Router()
  .get("/:id", handler);

const usersRouter = new Router()
  .get("/", handler)
  .route(idRouter);

const apiRouter = new Router()
  .all(handler)
  .route("/users", usersRouter);

const router = new Router()
  .all(handler)
  .route("/api", apiRouter);
```

## Context

Context is a dependency.

Context keeps middleware simple.

There is a way for passing contexts between middleware and routers in a
type-safe and declarative.

### Context and middleware

When referring to a context, the middleware does the following.

For example, suppose you want to refer to `ConnInfo` in `std/http`.

```ts
import { type Handler } from "https://deno.land/x/http_router@$VERSION/mod.ts";
import { type ConnInfo } from "https://deno.land/std/http/mod.ts";

type Context = {
  readonly connInfo: ConnInfo;
};

function handler(this: Context): Response {
  return Response.json(this.connInfo);
}
```

Or, with types and function expression:

```ts
import {
  type Handler,
  type Middleware,
} from "https://deno.land/x/http_router@$VERSION/mod.ts";
import { type ConnInfo } from "https://deno.land/std/http/mod.ts";

type Context = {
  readonly connInfo: ConnInfo;
};

const middleware: Middleware<Context> = function (request, next) {
  return Response.json(this.connInfo);
};
declare const handler: Handler<Context>;
```

Contexts are referenced via `this`, using the JavaScript context mechanism as
is.

Note that you **can't** use the arrow function.

### Context and router

Declare to the router that you want to use the context.

```ts
import {
  type Middleware,
  Router,
} from "https://deno.land/x/http_router@$VERSION/mod.ts";
import { type ConnInfo } from "https://deno.land/std/http/mod.ts";

type Context = {
  readonly connInfo: ConnInfo;
};

const router = new Router<Context>();
```

You can reference the context type-safely throughout the router.

```ts
import {
  type Middleware,
  Router,
} from "https://deno.land/x/http_router@$VERSION/mod.ts";
import { type ConnInfo } from "https://deno.land/std/http/mod.ts";

type Context = {
  readonly connInfo: ConnInfo;
};

declare const router: Router<Context>;
declare const middleware: Middleware<Context>;

router
  .get("/", middleware)
  .post("/:id", function () {
    return Response.json(this.connInfo);
  });
```

#### Context and handler

If creating a handler from a router with a context declared, the context is
needed to invoke the handler.

```ts
import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";

declare const router: Router<{ readonly deps: readonly string[] }>;

const handler = router.handler;

// handler(new Request("test:")) this is type error
handler.call({ deps: [] }, new Request("test:"));
```

All of this can be done type-safely.

A practical example:

```ts
import {
  type Middleware,
  Router,
} from "https://deno.land/x/http_router@$VERSION/mod.ts";
import { type ConnInfo, serve } from "https://deno.land/std/http/mod.ts";

type Context = {
  readonly connInfo: ConnInfo;
};

const router = new Router<Context>();
router.get("/", function () {
  return Response.json(this.connInfo);
});

serve((request, connInfo) => router.handler.call({ connInfo }, request));
```

### First-class context

In HTTP, the `Request` object is also a context.

However, the `Request` object need not be declared as a context.

The `Request` object is treated as a first-class context because it is common.

Therefore, the middleware accepts a `Request` object as its first argument.

The router also treats the route context as a first-class context.

#### Route context

Router provides the result of match using the URLPattern API.

| Name   | Type                     |
| ------ | ------------------------ |
| match  | `URLPatternResult`       |
| params | `Record<string, string>` |

`match` is the return value of `URLPattern.#exec`.

`params` is a shortcut for `match.pathname.group`.

Also, `params` parses the URL Path at the type level to ensure type safety.

```ts
import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";

const router = new Router()
  .get("/:id", function () {
    const id = this.params.id; // type safe
    // this.params.any is type error
    const matched = this.match;

    return new Response(id);
  });
```

### Context and scope

Context have the concept of scope.

- Global
- Local

#### Global context

Global context is a context on which the entire router depends.

A `Request` object corresponds to a global context.

If multiple middleware depend on the context, it may be better to define it as a
global context.

Global context requires a type declaration to the router.

#### Local context

A local context is a context that can only be referenced by the routing
middleware.

The Route context corresponds to the local context.

Currently, there is no mechanism for injecting local context, but this may be
added in the future.

### Mutability

The router does not do anything with the context.

If you define types of the context so that it can be changed.

```ts
import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";

new Router<{ mutable: string[]; readonly immutable: readonly string[] }>()
  .get("/", function () {
    this.mutable.push("Mutate!");
    this.mutable = [];

    return new Response();
  });
```

In general, immutability removes unwanted bugs.

Context changes should be done with care.

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
