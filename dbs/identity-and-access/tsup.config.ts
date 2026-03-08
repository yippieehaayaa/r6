import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/client.ts",
    "src/errors.ts",
    "src/models/account.ts",
    "src/models/policy.ts",
    "src/models/role.ts",
    "src/models/session.ts",
  ],
  format: ["esm", "cjs"],
  // splitting: false is the critical fix —
  // shared _chunks/ is what caused tsup to inline Prisma's CJS runtime
  // into ESM chunks where require("fs") has no CJS context to run in.
  // With splitting off, each entry gets its own clean ESM + CJS output pair.
  splitting: false,
  dts: false,
  sourcemap: process.env.NODE_ENV !== "production",
  clean: true,
  minify: process.env.NODE_ENV === "production",
  outDir: "build",
  // skipNodeModulesBundle skips everything in node_modules.
  // generated/client is NOT in node_modules so we mark it explicitly.
  skipNodeModulesBundle: true,
  external: ["../generated/client/index.js"],
  esbuildOptions(options) {
    options.chunkNames = "_chunks/[name]-[hash]";
  },
});
