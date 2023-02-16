import { build, emptyDir } from "https://deno.land/x/dnt@0.33.1/mod.ts";
import { join } from "https://deno.land/std@0.177.0/path/mod.ts";
import { makeOptions } from "./meta.ts";

async function buildPkg(version: string): Promise<void> {
  await emptyDir("./npm");
  const pkg = makeOptions(version);
  await Deno.copyFile("LICENSE", join(pkg.outDir, "LICENSE"));
  Deno.copyFile(
    join(".", "README.md"),
    join(pkg.outDir, "README.md"),
  );
  await build(pkg);
}

if (import.meta.main) {
  const version = Deno.args[0];
  if (!version) {
    console.error("argument is required");
    Deno.exit(1);
  }
  await buildPkg(version);
}
