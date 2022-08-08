# http-router

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
import {
  serve,
  Status,
  STATUS_TEXT,
} from "https://deno.land/std@$VERSION/http/mod.ts";

const router = createRouter({
  "/api/students/:name": {
    GET: (req, params) => {
      const greeting = `Hello! ${params.name!}`;
      return new Response(greeting);
    },
  },
  "/api/status": () => new Response(STATUS_TEXT[Status.OK]), // Any HTTP request method
});

await serve(router);
```

## Performance

Benchmark script with comparison to several popular routers is available. Run it
with `deno bench --unstable`.

## License

Copyright © 2022-present [TomokiMiyauci](https://github.com/TomokiMiyauci).

Released under the [MIT](./LICENSE) license
