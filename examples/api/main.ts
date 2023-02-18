import { type Handler, ParamsContext, Router } from "http-router/mod.ts";
import db from "./db.json" assert { type: "json" };
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import cors from "https://deno.land/x/http_cors@1.0.0-beta.1/mod.ts";
import logger from "https://deno.land/x/http_log@1.0.0-beta.2/mod.ts";

const handleUsers: Handler = () => {
  return Response.json(db.users);
};

const handleUser: Handler<ParamsContext<{ id: string }>> = (request) => {
  const id = request.params.id;
  const user = db.users.find((user) => user.id === id);

  if (user) return Response.json(user);

  return new Response(null, { status: 404 });
};

const router = new Router()
  .all(logger())
  .all("/api/*", cors())
  .get("/api/users", handleUsers)
  .get("/api/users/:id", handleUser);

serve(router.handler, {
  onError: (error) => {
    console.error(error);
    return Response.error();
  },
});
