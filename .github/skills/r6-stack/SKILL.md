---
name: r6-stack
description: "Development guide for the r6 monorepo. Use when: adding a new API endpoint or microservice feature, creating a React page or route, wiring up TanStack Query hooks, building TanStack Table data tables, adding shared Zod schemas to @r6/schemas, tracing auth/permission guards, or working with Turborepo tasks. Covers Express 5 + Zod + Prisma backend, React + TanStack Router/Query/Table + Axios frontend, and npm workspaces + Turborepo monorepo conventions."
argument-hint: "Describe the feature or task (e.g. 'add product list endpoint', 'create users page with table')"
---

# r6 Stack — Development Guide

## Stack Overview

| Layer | Technology |
|---|---|
| Monorepo | npm workspaces + Turborepo (`turbo run build/dev/lint`) |
| Backend | Express 5, TypeScript, Zod (validation), Prisma (ORM), jose (JWT) |
| Frontend | React 19, TanStack Router (file-based), TanStack Query v5, TanStack Table v8, Axios |
| Shared | `@r6/schemas` (Zod schemas + inferred types), `@r6/bcrypt`, `@r6/crypto` |
| Tooling | Biome (lint + format), TypeScript strict mode, tabs + double quotes |

## Workspace Layout

```
apis/          Express microservices   (@r6/identity-and-access, @r6/inventory-and-catalog, @r6/api-gateway)
apps/          React frontend          (@r6/r6-app)
dbs/           Prisma packages         (@r6/db-identity-and-access, @r6/db-inventory-and-catalog)
packages/      Shared utilities        (@r6/schemas, @r6/bcrypt, @r6/crypto)
```

Package names follow the `@r6/<name>` convention. Run all tasks from the workspace root via `turbo`.

---

## Common Tasks

### 1. Add a new API endpoint

Follow the [backend patterns](./references/backend.md):

1. **Schema** — Add Zod schema to `packages/schemas/src/<domain>/` and export from the domain index. If input/output is service-internal only, define it in the API's `*.validator.ts`.
2. **Repository** — Add a typed Prisma call in the `dbs/<service>/src/` package.
3. **Service** — Add a thin facade function in `apis/<service>/src/modules/<feature>/<feature>.service.ts` that delegates to the repository.
4. **Controller** — Create `async (req, res, next) => { try { … } catch(err) { next(err) } }` in `controller/<verb>.ts`. Parse body via `validate(schema)` middleware or inline Zod parse.
5. **Route** — Register the handler in the feature router with appropriate auth guards (`authMiddleware()`, `requirePermission("service:resource:action")`).
6. **Root router** — Mount the feature router in `routes/index.ts` if it's new.

### 2. Add a new frontend page

Follow the [frontend patterns](./references/frontend.md):

1. **Route file** — Create `apps/r6-app/src/routes/<path>.tsx` with `export const Route = createFileRoute("/<path>")({ component: MyPage })`.
2. **Feature folder** — Create `src/features/<domain>/<feature>/page.tsx` for the page component.
3. **API client** — Add `src/api/<domain>/queries/<name>.ts` or `mutations/<name>.ts`. Export both the raw `*Fn` and the `use*Query`/`use*Mutation` hook. Re-export from `src/api/<domain>/index.ts`.
4. **Table** (if listing data) — Build `<Feature>Table` using `ColumnDef[]` + `<DataTable>`. Pass server-side pagination through `PaginationState`.
5. **Auth guard** — Use `useAuth()` → `hasPermission("service:resource:action")` to gate actions.

### 3. Add a shared schema

1. Define the Zod schema in `packages/schemas/src/<domain>/<entity>.schema.ts`.
2. Export inferred TypeScript types: `export type MyType = z.infer<typeof MyTypeSchema>`.
3. Re-export from the domain index, then from `packages/schemas/src/index.ts`.
4. Use `@r6/schemas` as a dependency in any api or app package that needs cross-service types.

---

## Key Conventions

- **Error format** — `{ error: { message, code, details? } }`. Use `AppError(status, code, message)` in IAM or `DomainError` in Inventory. ZodErrors are caught by the shared `errorHandler` middleware.
- **Pagination** — Cursor-free, page/limit. API returns `{ data[], page, limit, total }`. Frontend maps `pageIndex + 1 → page`.
- **Permissions** — Strings follow `service:resource:action` (e.g., `iam:identity:create`). Wildcards supported. ADMIN identities bypass all permission checks.
- **Auth flow** — Access token in `Authorization: Bearer …`. Refresh token in HttpOnly cookie. 401 on a non-auth/refresh request triggers silent refresh via Axios interceptor.
- **Zod validation at API boundary** — Always parse responses with Zod after Axios calls (e.g., `LoginResponseSchema.parse(data)`). Never trust raw `unknown` responses.
- **Soft deletes** — Use `deletedAt` timestamps. Restore endpoints revert them. Join table rows are NOT cleaned up on soft-delete.
- **Biome** — `biome check --write .` cleans both lint and format. Tabs for indentation, double quotes for JS strings.

---

## Reference Files

- [Backend patterns](./references/backend.md) — Express app setup, routes, controllers, middleware, guards, error handling
- [Frontend patterns](./references/frontend.md) — Axios instances, TanStack Query hooks, TanStack Router, TanStack Table + Virtual
- [Monorepo conventions](./references/monorepo.md) — Turborepo tasks, workspace package setup, build pipeline, adding a new package/service
