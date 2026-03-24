import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  splitting: true,
  sourcemap: process.env.NODE_ENV !== "production",
  clean: true,
  minify: process.env.NODE_ENV === "production",
  treeshake: {
    preset: "recommended",
  },
  outDir: "build",
  skipNodeModulesBundle: true,
  metafile: true,
  esbuildOptions(options) {
    options.conditions = ["module"];
    options.chunkNames = "_chunks/[name]-[hash]";
    options.assetNames = "_assets/[name]-[hash]";
  },
});
