# http-router

[![deno land](http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno)](https://deno.land/x/http_router)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/http_router/mod.ts)
![npm](https://img.shields.io/npm/v/@httpland/http-router)
![GitHub](https://img.shields.io/github/license/httpland/http-router)

HTTP request router for standard `Request` and `Response`.

- URL pattern matching
- Tiny, lean

## Usage

core:

- `createRouter` - Create HTTP request router.

types:

- `Method` - HTTP request method.
- `RouteHandler` - A handler for HTTP route requests.
- `Routes` - HTTP request routes.
- `Router` - HTTP request router API.

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

## Performance

Benchmark script with comparison to several popular routers is available. Run it
with `deno bench --unstable`.

## License

Copyright © 2022-present [httpland](https://github.com/httpland).

Released under the [MIT](./LICENSE) license
