import { createRouter } from "./router.ts";
import {
  createRouteMap as createRenoMap,
  createRouter as createReno,
  forMethod,
} from "https://deno.land/x/reno@v2.0.53/reno/mod.ts";

const router = createRouter({
  "/endpoint": () => new Response("Hello"),
  "/endpoint2/:id": {
    POST: (_req, params) =>
      Promise.resolve(
        new Response(JSON.stringify(params), {
          headers: { "Content-Type": "application/json" },
        }),
      ),
  },
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
