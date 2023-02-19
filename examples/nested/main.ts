import { type Handler, ParamsContext, Router } from "http-router/mod.ts";
import db from "./db.json" assert { type: "json" };
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import cors from "https://deno.land/x/http_cors@1.0.0-beta.1/mod.ts";
import logger from "https://deno.land/x/http_log@1.0.0-beta.2/mod.ts";

const handleUsers: Handler = () => Response.json(db.users);

function handleUser(this: ParamsContext<"id">) {
  const id = this.params.id;
  const user = db.users.find((user) => user.id === id);

  if (user) return Response.json(user);

  return new Response(null, { status: 404 });
}

const userRouter = new Router()
  .get("/:id", handleUser);

const usersRouter = new Router({ base: "/users" })
  .get("/", handleUsers)
  .use(userRouter);

const apiRouter = new Router({ base: "/api" })
  .all(cors())
  .use(usersRouter);

const router = new Router()
  .all(logger())
  .use(apiRouter);

serve(router.handler, {
  onError: (error) => {
    console.error(error);
    return Response.error();
  },
});
