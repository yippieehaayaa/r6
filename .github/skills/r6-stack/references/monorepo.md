# Monorepo Conventions — npm Workspaces + Turborepo

## Package Manager

**npm 11** (`npm@11.3.0`). Do NOT use pnpm or yarn.

```bash
npm install                  # install all workspaces
npm install <pkg> -w @r6/app # add dep to a specific workspace
```

## Turborepo Tasks

All tasks are run from the **workspace root**:

```bash
turbo run build        # build all packages (respects ^build dependency order)
turbo run dev          # start all dev servers in parallel (persistent, no cache)
turbo run lint         # biome lint across all packages
turbo run check-types  # tsc --noEmit across all packages
turbo run check        # lint + format
turbo run format       # biome format
```

Tasks are defined in `turbo.json`. `build` depends on `^build` (upstream packages build first). `dev` is persistent and not cached.

## Workspace Layout & Package Naming

| Folder | Scope | Naming convention |
|---|---|---|
| `apis/<name>/` | Express microservice | `@r6/<name>` |
| `apps/<name>/` | Frontend application | `@r6/<name>` |
| `dbs/<name>/` | Prisma DB package | `@r6/db-<name>` |
| `packages/<name>/` | Shared utility | `@r6/<name>` |

## Adding a New Shared Package

1. Create `packages/<name>/` with:
   - `package.json` — name `@r6/<name>`, scripts `build`/`check`/`lint`/`format`
   - `tsconfig.json` — extends `@r6/typescript-config/node.json`
   - `biome.json` — extends root biome config
   - `tsup.config.ts` — bundles to `build/` (CJS + ESM)
   - `src/index.ts` — public API exports

2. Add to `workspaces` in root `package.json` (already covered by `packages/*` glob).

3. Reference in a consuming package:
   ```json
   { "dependencies": { "@r6/<name>": "*" } }
   ```

## Adding a New Microservice

1. Copy structure from `apis/identity-and-access/` or `apis/inventory-and-catalog/`.
2. Update `package.json` name to `@r6/<service-name>`.
3. Create `src/app.ts`, `src/index.ts`, `src/config.ts`, `src/routes/index.ts`.
4. Add a `Dockerfile` following the existing pattern (multi-stage: build → production).
5. Add a `dbs/<service-name>/` package if it needs its own database with Prisma.
6. Expose via `apis/api-gateway/src/` by adding a proxy route.

## TypeScript Config Inheritance

```json
// In any package tsconfig.json
{ "extends": "@r6/typescript-config/node.json" }   // for Node/API packages
{ "extends": "@r6/typescript-config/react-app.json" } // for React apps
```

All packages use strict TypeScript: `strict: true`, `noUnusedLocals`, `noUnusedParameters`.

## Biome Config

Each package has its own `biome.json`. Key settings project-wide:
- `indentStyle: "tab"`
- `quoteStyle: "double"` (JavaScript)
- `organizeImports: "on"`
- `linter.rules.recommended: true`

Run `biome check --write .` to fix lint + format in one pass.

## Build Outputs

| Package type | Output dir | Command |
|---|---|---|
| Express API | `dist/` | `tsc` |
| Shared package | `build/` | `tsup` |
| React app | `.output/` or `dist/` | `vite build` |
| DB package | `build/` | `tsup` |

The `turbo.json` `outputs` field covers `dist/**`, `build/**`, `.output/**`, `.tanstack/**`.

## Environment Variables

Each service reads env vars via a local `src/config.ts` that uses Zod to validate and export `env`. Never access `process.env` directly outside `config.ts`.

```typescript
// src/config.ts pattern
import { z } from "zod";
const EnvSchema = z.object({
  PORT:        z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  CORS_ORIGIN: z.string(),
});
export const env = EnvSchema.parse(process.env);
```

Frontend uses Vite's `import.meta.env` (prefix `VITE_`), also validated in `src/config.ts`.

## API Gateway

`apis/api-gateway/` proxies requests to downstream microservices using `http-proxy-middleware`. Add new service routes there when adding a microservice. The frontend `env.API_URL` points to the gateway.

## Database Packages (`dbs/`)

Each database package exports typed Prisma client functions. Microservices import from these packages (e.g., `@r6/db-identity-and-access`) rather than using Prisma directly.

```bash
# Run from the dbs package directory
npm run db:generate   # prisma generate
npm run db:migrate    # prisma migrate dev
npm run db:seed       # prisma db seed
```
