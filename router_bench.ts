import { MethodRouter as $, URLRouter } from "./routers.ts";
import {
  createRouteMap as createRenoMap,
  createRouter as createReno,
  forMethod,
} from "https://deno.land/x/reno@v2.0.53/reno/mod.ts";

const router = URLRouter({
  "/endpoint": () => new Response("Hello"),
  "/endpoint2/:id": (req, { params }) =>
    $({
      POST: (_) =>
        Promise.resolve(
          new Response(JSON.stringify(params), {
            headers: { "Content-Type": "application/json" },
          }),
        ),
    })(req),
});

const reno = createReno(createRenoMap([
  ["/endpoint", () => new Response("Hello")],
  [
    /\/endpoint2\/?(\d+\w+)/,
    forMethod([
      ["POST", (req) =>
        Promise.resolve(
          new Response(JSON.stringify({ id: req.routeParams[0] }), {
            headers: { "Content-Type": "application/json" },
          }),
        )],
    ]),
  ],
]));

Deno.bench("GET http_router", { group: "get" }, async () => {
  await router(new Request("http://localhost/endpoint"));
});

Deno.bench("GET reno", { group: "get" }, async () => {
  await reno(new Request("http://localhost/endpoint"));
});

Deno.bench("POST http_router", { group: "post" }, async () => {
  await router(
    new Request("http://localhost/endpoint2/123123123", { method: "POST" }),
  );
});

Deno.bench("POST reno", { group: "post" }, async () => {
  await reno(
    new Request("http://localhost/endpoint2/123123123", { method: "POST" }),
  );
});

const cachedRouter = URLRouter({
  "/": () => new Response(),
});
const req = new Request("http://localhost");

Deno.bench("Enable cache matching", { group: "cache" }, async () => {
  await cachedRouter(req);
});

import * as prev from "https://deno.land/x/http_router@1.1.0/mod.ts";

const nonCachedRouter = prev.createRouter({
  "/": () => new Response(),
});

Deno.bench(
  "Disable cache matching",
  { group: "cache" },
  async () => {
    await nonCachedRouter(req);
  },
);
