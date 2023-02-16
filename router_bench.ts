import { Router } from "./routers.ts";
import {
  createRouteMap as createRenoMap,
  createRouter as createReno,
  forMethod,
} from "https://deno.land/x/reno@v2.0.53/reno/mod.ts";

const router = new Router();
router
  .get("/endpoint", () => new Response("Hello"))
  .post("/endpoint2/:id", () => Response.json("hello"));

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
  await router.handler(new Request("http://localhost/endpoint"));
});

Deno.bench("GET reno", { group: "get" }, async () => {
  await reno(new Request("http://localhost/endpoint"));
});

Deno.bench("POST http_router", { group: "post" }, async () => {
  await router.handler(
    new Request("http://localhost/endpoint2/123123123", { method: "POST" }),
  );
});

Deno.bench("POST reno", { group: "post" }, async () => {
  await reno(
    new Request("http://localhost/endpoint2/123123123", { method: "POST" }),
  );
});
