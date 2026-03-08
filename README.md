# r6

**r6** is named after **Rosario** — the town I consider my hometown. It is a personal monorepo that I use to learn new things, solidify concepts from throughout my career, and push the boundaries of what I know. This project has no finish line. As long as I am growing as an engineer, r6 will keep growing with me. My career is my hobby, and this repository is where that shows.

r6 also serves as my **living portfolio**. Every API, application, database layer, and shared package here represents deliberate practice — decisions I made, patterns I chose, and things I built from scratch. If you are evaluating me as a potential hire, this project is the most honest representation of what I am capable of.

---

## Table of Contents

- [Monorepo Structure](#monorepo-structure)
- [Workspace Overview](#workspace-overview)
- [APIs](#apis)
  - [@r6/identity-and-access](#r6identity-and-access)
  - [@r6/qr-api](#r6qr-api)
- [Apps](#apps)
  - [@r6/me](#r6me)
- [Databases](#databases)
  - [@r6/db-identity-and-access](#r6db-identity-and-access)
- [Packages](#packages)
  - [@r6/bcrypt](#r6bcrypt)
  - [@r6/crypto](#r6crypto)
  - [@r6/typescript-config](#r6typescript-config)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Development Commands](#development-commands)
- [Docker](#docker)
- [API Client](#api-client)
- [About the Author](#about-the-author)

---

## Monorepo Structure

The repository is managed with [Turborepo](https://turborepo.dev) and [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces). Every workspace is 100% [TypeScript](https://www.typescriptlang.org/).

```
r6/
├── apis/                         # Back-end HTTP services
│   ├── identity-and-access/      # Authentication, authorization, RBAC/ABAC
│   └── qr-api/                   # QR code generation service (WIP)
├── apps/                         # Front-end applications
│   └── me/                       # Personal web application (TanStack Start)
├── dbs/                          # Database packages (Prisma clients + models)
│   └── identity-and-access/      # Prisma + PostgreSQL for the IAM domain
└── packages/                     # Shared internal libraries
    ├── bcrypt/                   # Password hashing and verification
    ├── crypto/                   # HMAC and SHA-256 utilities
    └── typescript-config/        # Shared tsconfig presets
```

---

## Workspace Overview

| Package | Path | Description |
|---|---|---|
| `@r6/identity-and-access` | `apis/identity-and-access` | Identity and access management REST API |
| `@r6/qr-api` | `apis/qr-api` | QR code generation API (scaffold) |
| `@r6/me` | `apps/me` | Personal web application built with TanStack Start |
| `@r6/db-identity-and-access` | `dbs/identity-and-access` | Prisma client and model layer for the IAM database |
| `@r6/bcrypt` | `packages/bcrypt` | bcrypt password hashing and verification utilities |
| `@r6/crypto` | `packages/crypto` | Node.js HMAC and SHA-256 hashing utilities |
| `@r6/typescript-config` | `packages/typescript-config` | Shared `tsconfig.json` presets for the monorepo |

---

## APIs

### @r6/identity-and-access

The identity and access management API is the backbone of the r6 project's auth layer. It handles user registration, login and logout, JWT-based authentication (RS256), refresh token rotation, role-based access control (RBAC), and attribute/policy-based access control (ABAC). It exposes a JWKS endpoint so that other services can verify tokens independently without calling this service.

**Technology:** [Hono](https://hono.dev) · [hono/node-server](https://github.com/honojs/node-server) · [jose](https://github.com/panva/jose) · [Zod](https://zod.dev) · [TypeScript](https://www.typescriptlang.org)

#### Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | None | Health check |
| `GET` | `/me` | Bearer JWT | Returns decoded JWT payload for the caller |
| `POST` | `/auth/register` | None | Create a new identity (user or service) |
| `POST` | `/auth/login` | None | Verify credentials and issue access + refresh tokens |
| `POST` | `/auth/refresh` | None | Rotate a refresh token and issue a new access token |
| `POST` | `/auth/logout` | None | Revoke a refresh token |
| `GET` | `/.well-known/jwks.json` | None | Public RS256 key set for token verification |

#### Authentication Design

- Access tokens are **RS256-signed JWTs** issued by `jose`, carrying `sub`, `roles`, `permissions`, `iss`, `aud`, `iat`, and `exp` claims.
- Access token TTL defaults to **15 minutes** (`JWT_ACCESS_TTL_MS=900000`).
- Refresh tokens are **opaque UUIDs** stored as sessions in PostgreSQL with a 7-day TTL.
- Token rotation is implemented with **refresh token family tracking** — if a revoked token is replayed, the entire family is revoked to detect theft.
- The `authMiddleware` validates the `Authorization: Bearer <token>` header and rejects malformed or expired tokens before the request reaches any route handler.

#### Security Middleware

- `cors()` — Cross-origin resource sharing
- `secureHeaders()` — Sets security-relevant HTTP response headers
- `logger()` — Request logging

#### Environment Variables

```
PORT=3000
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
JWT_ISSUER="https://auth.example.com"
JWT_AUDIENCE="api.example.com"
JWT_ACCESS_TTL_MS=900000
HASH_SECRET="<64-char hex string>"
```

---

### @r6/qr-api

A Hono-based API service scaffolded for QR code generation. This service is currently in its earliest stage and will grow to provide QR code creation and management capabilities.

**Technology:** [Hono](https://hono.dev) · [hono/node-server](https://github.com/honojs/node-server) · [TypeScript](https://www.typescriptlang.org)

> **Status:** Work in progress — the scaffold is in place and the service will expand as this area of the project develops.

---

## Apps

### @r6/me

The primary front-end application for the r6 project. Built with TanStack Start for full-stack React with server-side rendering, file-based routing, and deep integration with the TanStack ecosystem. Styled with Tailwind CSS v4.

**Technology:** [TanStack Start](https://tanstack.com/start) · [React 19](https://react.dev) · [TanStack Router](https://tanstack.com/router) · [TanStack Query](https://tanstack.com/query) · [TanStack Form](https://tanstack.com/form) · [TanStack Table](https://tanstack.com/table) · [Tailwind CSS v4](https://tailwindcss.com) · [Vite](https://vitejs.dev) · [Vitest](https://vitest.dev) · [TypeScript](https://www.typescriptlang.org)

#### Features

- **SSR + file-based routing** powered by TanStack Start and TanStack Router — routes are auto-generated from the `src/routes/` directory
- **Server state management** with TanStack Query — all async data fetching, caching, and synchronisation
- **Form handling** with TanStack Form — type-safe form state and validation
- **Data grids** with TanStack Table — full-featured headless table primitives
- **Utility-first styling** with Tailwind CSS v4 via the official Vite plugin
- **End-to-end type safety** from the router context (`QueryClient`) through to route components
- **Development tooling** — TanStack Devtools panel with Router and Query sub-panels in development
- **Testing** with Vitest + Testing Library (DOM and React)

#### Application Shell

The root route (`__root.tsx`) establishes the HTML document shell, injects global styles, mounts `TanStackQueryProvider`, and renders all devtools panels in development. Scroll restoration and intent-based preloading are enabled at the router level.

---

## Databases

### @r6/db-identity-and-access

The database package for the identity and access management domain. It encapsulates all Prisma client configuration, data models, and domain-specific query logic. Consuming APIs import typed model functions rather than writing raw Prisma queries, keeping the data layer behind a clean interface.

**Technology:** [Prisma 6](https://www.prisma.io) · [PostgreSQL](https://www.postgresql.org) · [@prisma/adapter-pg](https://www.prisma.io/docs/orm/overview/databases/postgresql) · [TypeScript](https://www.typescriptlang.org) · [tsup](https://tsup.egoist.dev)

#### Database Schema

##### Identity

The central entity representing a user, service account, or admin.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `username` | String (unique) | Login identifier |
| `email` | String (unique, optional) | Contact email |
| `hash` | String | bcrypt password hash |
| `salt` | String | bcrypt salt |
| `failedLoginAttempts` | Int | Brute-force counter |
| `lockedUntil` | DateTime | Account lockout expiry |
| `changePassword` | Boolean | Forces password change on next login |
| `kind` | Enum | `USER` · `SERVICE` · `ADMIN` |
| `status` | Enum | `ACTIVE` · `INACTIVE` · `SUSPENDED` · `PENDING_VERIFICATION` |

Related tables: `PasswordHistory`, `EmailHistory`, `IpAddress`

##### Role

Named roles that can be assigned to identities. Roles carry policies.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | String (unique) | Role identifier |
| `description` | String | Human-readable description |

##### Policy

Fine-grained access policies attached to roles.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | String (unique) | Policy identifier |
| `effect` | Enum | `ALLOW` or `DENY` |
| `permissions` | String[] | Permission strings in `service:resource:action` format with wildcard support (`*`) |
| `audience` | String[] | Target services this policy applies to |
| `conditions` | JSON | Optional conditional logic |

Permission matching supports wildcards at any segment, e.g. `iam:*:read` or `*:*:*`.

##### Session

Tracks refresh tokens and API keys.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `token` | String (unique) | Opaque token value (UUID) |
| `kind` | Enum | `REFRESH` · `API_KEY` |
| `family` | String | Token family for theft detection |
| `audience` | String[] | Target audience |
| `ipAddress` | String | Originating IP |
| `userAgent` | String | Originating user agent |
| `expiresAt` | DateTime | Token expiry |
| `revokedAt` | DateTime | Revocation timestamp |

#### Exported Model Functions

| Export | Functions |
|---|---|
| `account` | `createIdentity`, `verifyIdentity`, `getIdentityById`, `updateIdentity`, `listIdentities`, `deleteIdentity`, `changePassword`, `changeEmail` |
| `session` | `createSession`, `getValidSession`, `rotateSession`, `revokeSession`, `revokeAllSessions`, `revokeSessionFamily` |
| `role` | `createRole`, `getRoleById`, `updateRole`, `deleteRole`, `listRoles`, `assignRoleToIdentity`, `removeRoleFromIdentity`, `assignPolicyToRole`, `removePolicyFromRole` |
| `policy` | `createPolicy`, `getPolicyById`, `updatePolicy`, `deletePolicy`, `listPolicies`, `matchesPermission`, `evaluateAccess` |

#### Environment Variables

```
DATABASE_URL="postgresql://user:password@localhost:5432/iam?schema=public"
```

---

## Packages

### @r6/bcrypt

A thin, typed wrapper around the `bcrypt` library. Provides password encryption and verification utilities used by the identity and access management database layer.

**Technology:** [bcrypt](https://github.com/kelektiv/node.bcrypt.js) · [TypeScript](https://www.typescriptlang.org) · [tsup](https://tsup.egoist.dev)

#### API

```typescript
import { encryptPassword, verifyPassword, generateSalt, generateHash } from "@r6/bcrypt";

// Hash a password
const { salt, hash } = await encryptPassword("plaintext");

// Verify a password against a stored hash
const valid = await verifyPassword("plaintext", hash);
```

Ships as dual CJS + ESM with type declarations.

---

### @r6/crypto

Node.js cryptographic utilities built on the native `node:crypto` module. No external runtime dependencies. Provides HMAC-SHA256 signing and timing-safe verification for token integrity checks.

**Technology:** Node.js `node:crypto` · [TypeScript](https://www.typescriptlang.org) · [tsup](https://tsup.egoist.dev)

#### API

```typescript
import { sha256, hmac, verifyHmac } from "@r6/crypto";

// One-way SHA-256 hash
const digest = sha256("value");

// HMAC-SHA256 (requires HASH_SECRET env var)
const signature = hmac("value");

// Timing-safe HMAC verification (prevents timing attacks)
const isValid = verifyHmac("value", signature);
```

`verifyHmac` uses `timingSafeEqual` internally to prevent timing-based side-channel attacks.

Ships as dual CJS + ESM with type declarations.

---

### @r6/typescript-config

Shared TypeScript configuration presets consumed by every workspace in the monorepo.

| Config | Used by |
|---|---|
| `base.json` | Foundation — ES2022 target, NodeNext module resolution, strict mode |
| `node.json` | Node.js APIs and back-end services |
| `react-app.json` | React front-end applications |
| `react-library.json` | Shared React component libraries |
| `vue-app.json` | Vue front-end applications |

---

## Tech Stack

| Category | Technology |
|---|---|
| Monorepo tooling | [Turborepo](https://turborepo.dev), [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces) |
| Language | [TypeScript 5.9](https://www.typescriptlang.org) |
| Back-end framework | [Hono](https://hono.dev), [@hono/node-server](https://github.com/honojs/node-server) |
| Front-end framework | [React 19](https://react.dev), [TanStack Start](https://tanstack.com/start) |
| Routing | [TanStack Router](https://tanstack.com/router) |
| Server state | [TanStack Query](https://tanstack.com/query) |
| Forms | [TanStack Form](https://tanstack.com/form) |
| Tables | [TanStack Table](https://tanstack.com/table) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Build tooling | [Vite](https://vitejs.dev), [tsup](https://tsup.egoist.dev) |
| Authentication | [jose](https://github.com/panva/jose) (RS256 JWT) |
| Validation | [Zod](https://zod.dev) |
| ORM | [Prisma 6](https://www.prisma.io) |
| Database | [PostgreSQL](https://www.postgresql.org) |
| Password hashing | [bcrypt](https://github.com/kelektiv/node.bcrypt.js) |
| Linting / formatting | [Biome](https://biomejs.dev) |
| Dependency management | [syncpack](https://github.com/JamieMason/syncpack) |
| Testing | [Vitest](https://vitest.dev), [Testing Library](https://testing-library.com) |
| Containerisation | [Docker](https://www.docker.com) (distroless and Alpine images) |
| API client | [Bruno](https://www.usebruno.com) |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) >= 18
- npm >= 11 (`npm@11.3.0` is the configured package manager)
- A running [PostgreSQL](https://www.postgresql.org) instance for the IAM database

### Installation

```bash
git clone https://github.com/<username>/r6.git
cd r6
npm install
```

### Environment Setup

Each service that requires environment variables ships with a `.env.sample` file. Copy and populate it before running:

```bash
# Identity and Access API
cp apis/identity-and-access/.env.sample apis/identity-and-access/.env

# Identity and Access Database
cp dbs/identity-and-access/.env.sample dbs/identity-and-access/.env
```

Run database migrations for the IAM database:

```bash
cd dbs/identity-and-access
npx prisma migrate dev
```

---

## Development Commands

All commands are run from the **root** of the repository.

### Turborepo tasks

| Command | Description |
|---|---|
| `npm run dev` | Start all workspaces in development mode (persistent, no cache) |
| `npm run build` | Build all workspaces in dependency order |
| `npm run lint` | Run Biome lint across all workspaces |
| `npm run check-types` | Run TypeScript type checking across all workspaces |
| `npm run format` | Run Biome formatter across all workspaces |
| `npm run check` | Run Biome check (lint + format) across all workspaces |

To run a command against a single workspace, use Turborepo's `--filter` flag:

```bash
# Develop only the IAM API
npx turbo dev --filter=@r6/identity-and-access

# Build only the me app
npx turbo build --filter=@r6/me
```

### Dependency management (syncpack)

| Command | Description |
|---|---|
| `npm run deps:audit` | Lint for mismatched dependency versions |
| `npm run deps:fix` | Auto-fix version mismatches |
| `npm run deps:format` | Format `package.json` files consistently |
| `npm run deps:update` | Update all dependencies |

---

## Docker

Each deployable service ships with a multi-stage `Dockerfile` that uses Turborepo's `prune` command to produce a minimal Docker context containing only the files needed for that service.

### @r6/identity-and-access

```bash
# Build
docker build -f apis/identity-and-access/Dockerfile -t r6-identity-and-access .

# Run
docker run -p 3000:3000 --env-file apis/identity-and-access/.env r6-identity-and-access
```

The production image is based on `gcr.io/distroless/nodejs22-debian12` for a minimal attack surface.

### @r6/me

```bash
# Build
docker build -f apps/me/Dockerfile -t r6-me .

# Run
docker run -p 3000:3000 r6-me
```

The production image is based on `node:22-alpine` and runs under a non-root system user.

---

## API Client

HTTP request collections for all implemented APIs are maintained in the `api-client/` directory using [Bruno](https://www.usebruno.com) — a Git-friendly, offline-first API client.

```
api-client/
└── identity-and-access/
    ├── Auth/          # Register, Login, Logout, Refresh
    ├── Main/          # Health Check, Me
    └── Well-Known/    # JWKS
```

To use the collections, open Bruno and import the relevant folder. A `local` environment is pre-configured pointing to `http://localhost:3000`.

---

## About the Author

I am **Joshua Dave E. Oropilla**, a software engineer based in the Philippines. r6 is named after Rosario — the town I consider my hometown — and represents everything I continue to learn and build. My career has always been my hobby: I genuinely enjoy the craft of software engineering, and r6 is where that passion takes shape in code.

This project will never be finished. Every new technology I explore, every pattern I want to validate, and every idea I want to turn into working software will find a home here. If you are a hiring manager or fellow engineer reading this, I hope r6 gives you a clear and honest picture of where I am today and where I am headed.

**Contact:** joshdave0915@gmail.com

---

## License

[MIT](LICENSE)
