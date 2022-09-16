import { createRouter } from "../mod.ts";
import { serve } from "https://deno.land/std@0.156.0/http/mod.ts";
import { withCompress } from "https://deno.land/x/http_compress@1.0.0/mod.ts";

const handler = createRouter({
  "/": {
    GET: () => fetch("https://api.publicapis.org/entries"),
  },
});

serve(withCompress(handler));
