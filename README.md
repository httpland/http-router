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

## Packages

The package supports multiple platforms.

- deno.land/x - `https://deno.land/x/http_router/mod.ts`
- npm - `@httpland/http-router`

## Router

`Router` is a router that can match HTTP request methods and HTTP request URL
paths.

Since the Web convention is to use HTTP method and URL path to identify
resources, this should satisfy most people's needs.

It registers a handler from the method corresponding to the HTTP request method,
and can also use the dynamic paths available in the
[URLPattern API](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern).

```ts
import { Router } from "https://deno.land/x/http_router@$VERSION/mod.ts";
import { serve } from "https://deno.land/std@$VERSION/http/mod.ts";
import logger from "https://deno.land/x/http_log@$VERSION/mod.ts";
import cors from "https://deno.land/x/http_cors@$VERSION/mod.ts";

const router = new Router();

router
  .use(logger())
  .use("/api/*", cors())
  .get(
    "/api/users",
    (request) =>
      Response.json([{ id: "0", name: "Alice" }, { id: "1", name: "Bob" }]),
  );

serve(router.handler);
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

## Related

More detailed references:

- [Term definition](https://github.com/httpland/http-router/wiki/Term-definition)
- [Developer's Guide](https://github.com/httpland/http-router/wiki/Developer's-Guide)

## License

Copyright © 2023-present [httpland](https://github.com/httpland).

Released under the [MIT](./LICENSE) license
