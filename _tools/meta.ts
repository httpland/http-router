import { BuildOptions } from "https://deno.land/x/dnt@0.33.1/mod.ts";

export const makeOptions = (version: string): BuildOptions => ({
  test: false,
  shims: {
    undici: true,
    custom: [{
      module: "urlpattern-polyfill",
      globalNames: ["URLPattern"],
    }],
  },
  compilerOptions: {
    lib: ["esnext", "dom"],
  },
  typeCheck: false,
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  package: {
    name: "@httpland/http-router",
    version,
    description: "HTTP router for standard Request and Response",
    keywords: [
      "http",
      "router",
      "route",
      "routes",
      "handler",
      "pattern-matching",
      "request",
      "response",
    ],
    license: "MIT",
    homepage: "https://github.com/httpland/http-router",
    repository: {
      type: "git",
      url: "git+https://github.com/httpland/http-router.git",
    },
    bugs: {
      url: "https://github.com/httpland/http-router/issues",
    },
    sideEffects: false,
    type: "module",
    publishConfig: {
      access: "public",
    },
    dependencies: {
      // ^5.0.6 will occur type error
      "urlpattern-polyfill": "5.0.5",
    },
  },
  packageManager: "pnpm",
});
