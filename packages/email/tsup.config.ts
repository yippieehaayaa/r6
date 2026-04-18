import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: true,
  sourcemap: process.env.NODE_ENV !== "production",
  clean: true,
  minify: process.env.NODE_ENV === "production",
  treeshake: {
    preset: "recommended",
  },
  outDir: "dist",
  target: "es2020",
  platform: "node",
  skipNodeModulesBundle: true,
  metafile: true,
  esbuildOptions(options) {
    options.conditions = ["module"];
    options.chunkNames = "_chunks/[name]-[hash]";
    options.assetNames = "_assets/[name]-[hash]";
    options.target = "es2020";
    options.bundle = true;
    options.logLevel = "info";
    options.mainFields = ["module", "main"];
    options.legalComments = "none";
    options.ignoreAnnotations = true;
    options.minifyIdentifiers = true;
    options.minifySyntax = true;
    options.minifyWhitespace = true;
    options.treeShaking = true;
  },
});
