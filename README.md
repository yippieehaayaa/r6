# r6

**r6** is named after **Rosario** — the town I consider my hometown. It is a personal monorepo that I use to learn new things, solidify concepts from throughout my career, and push the boundaries of what I know. This project has no finish line. As long as I am growing as an engineer, r6 will keep growing with me. My career is my hobby, and this repository is where that shows.

r6 also serves as my **living portfolio**. Every API, application, database layer, and shared package here represents deliberate practice — decisions I made, patterns I chose, and things I built from scratch. If you are evaluating me as a potential hire, this project is the most honest representation of what I am capable of.

---

## Table of Contents

- [Monorepo Structure](#monorepo-structure)
- [Workspace Overview](#workspace-overview)
- [APIs](#apis)
  - [@r6/identity-and-access](#r6identity-and-access)
  - [@r6/inventory-and-catalog](#r6inventory-and-catalog)
  - [@r6/qr-api](#r6qr-api)
- [Apps](#apps)
  - [@r6/me](#r6me)
- [Databases](#databases)
  - [@r6/db-identity-and-access](#r6db-identity-and-access)
- [Packages](#packages)
  - [@r6/bcrypt](#r6bcrypt)
  - [@r6/crypto](#r6crypto)
  - [@r6/schemas](#r6schemas)
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
│   ├── inventory-and-catalog/    # Inventory management and product catalog API
│   └── qr-api/                   # QR code generation service (WIP)
├── apps/                         # Front-end applications
│   └── me/                       # Personal web application (Angular 21 + SSR)
├── dbs/                          # Database packages (Prisma clients + models)
│   └── identity-and-access/      # Prisma + PostgreSQL for the IAM domain
└── packages/                     # Shared internal libraries
    ├── bcrypt/                   # Password hashing and verification
    ├── crypto/                   # HMAC and SHA-256 utilities
    ├── schemas/                  # Shared Zod validation schemas
    └── typescript-config/        # Shared tsconfig presets
```

---

## Workspace Overview

| Package | Path | Description |
|---|---|---|
| `@r6/identity-and-access` | `apis/identity-and-access` | Identity and access management REST API |
| `@r6/inventory-and-catalog` | `apis/inventory-and-catalog` | Inventory management and product catalog REST API |
| `@r6/qr-api` | `apis/qr-api` | QR code generation API (scaffold) |
| `@r6/me` | `apps/me` | Personal web application built with Angular 21 + SSR |
| `@r6/db-identity-and-access` | `dbs/identity-and-access` | Prisma client and model layer for the IAM database |
| `@r6/bcrypt` | `packages/bcrypt` | bcrypt password hashing and verification utilities |
| `@r6/crypto` | `packages/crypto` | Node.js HMAC and SHA-256 hashing utilities |
| `@r6/schemas` | `packages/schemas` | Shared Zod validation schemas for the inventory-and-catalog domain |
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

### @r6/inventory-and-catalog

A full-featured inventory management and product catalog REST API. Handles products, variants, categories, brands, seasons, warehouses, stock operations, procurement workflows, and analytics. The data layer is powered by MongoDB via Prisma; all request and response validation is delegated to the shared `@r6/schemas` package.

**Technology:** [Express 5](https://expressjs.com) · [Prisma 6](https://www.prisma.io) · [MongoDB](https://www.mongodb.com) · [Zod](https://zod.dev) via [`@r6/schemas`](#r6schemas) · [helmet](https://helmetjs.github.io) · [TypeScript](https://www.typescriptlang.org)

#### Architecture

Layered module pattern per domain: `controller → service → repository → Prisma`

Modules: `catalog`, `inventory`, `procurement`, `seasons`, `analytics`

#### Routes

##### Health Check

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Health check — returns HTTP 200 |

##### Catalog — `/catalog`

| Method | Path | Description |
|---|---|---|
| `GET` | `/catalog/categories` | List categories (paginated; filters: `search`, `parentId`, `isActive`) |
| `GET` | `/catalog/categories/:id` | Get category by ID |
| `GET` | `/catalog/categories/:id/tree` | Get full subtree rooted at category |
| `POST` | `/catalog/categories` | Create category |
| `PATCH` | `/catalog/categories/:id` | Update category |
| `DELETE` | `/catalog/categories/:id` | Soft-delete category |
| `GET` | `/catalog/brands` | List brands (paginated; filters: `search`, `isActive`) |
| `GET` | `/catalog/brands/:id` | Get brand by ID |
| `POST` | `/catalog/brands` | Create brand |
| `PATCH` | `/catalog/brands/:id` | Update brand |
| `DELETE` | `/catalog/brands/:id` | Soft-delete brand |
| `GET` | `/catalog/products` | List products (paginated; filters: `search`, `categoryId`, `brandId`, `status`, `tags`) |
| `GET` | `/catalog/products/slug/:slug` | Get product by slug |
| `GET` | `/catalog/products/:id` | Get product by ID |
| `POST` | `/catalog/products` | Create product |
| `PATCH` | `/catalog/products/:id` | Update product |
| `POST` | `/catalog/products/:id/publish` | Transition product → `ACTIVE` |
| `POST` | `/catalog/products/:id/discontinue` | Transition product → `DISCONTINUED` |
| `POST` | `/catalog/products/:id/archive` | Transition product → `ARCHIVED` |
| `DELETE` | `/catalog/products/:id` | Soft-delete product |
| `GET` | `/catalog/products/:productId/variants` | List variants for a product (paginated; filters: `search`, `isActive`) |
| `GET` | `/catalog/variants/:id` | Get variant by ID |
| `POST` | `/catalog/products/:productId/variants` | Create variant under product |
| `PATCH` | `/catalog/variants/:id` | Update variant |
| `DELETE` | `/catalog/variants/:id` | Soft-delete variant |

##### Inventory — `/inventory`

| Method | Path | Description |
|---|---|---|
| `GET` | `/inventory/warehouses` | List warehouses (paginated; filters: `search`, `isActive`) |
| `GET` | `/inventory/warehouses/:id` | Get warehouse by ID |
| `POST` | `/inventory/warehouses` | Create warehouse |
| `PATCH` | `/inventory/warehouses/:id` | Update warehouse |
| `DELETE` | `/inventory/warehouses/:id` | Soft-delete warehouse |
| `GET` | `/inventory/stock/:variantId/:warehouseId` | Get current stock for a variant in a warehouse |
| `GET` | `/inventory/stock/product/:productId` | Get stock across all variants and warehouses for a product |
| `GET` | `/inventory/low-stock` | Get all items at or below reorder point (filter: `warehouseId`) |
| `POST` | `/inventory/stock/reserve` | Reserve stock — creates `RESERVATION` movement |
| `POST` | `/inventory/stock/release` | Release reservation — creates `RESERVATION_RELEASE` movement |
| `POST` | `/inventory/stock/commit-sale` | Commit a sale, reducing on-hand stock — creates `SALE` movement |
| `POST` | `/inventory/stock/adjust` | Manual stock adjustment — creates `ADJUSTMENT` movement |
| `POST` | `/inventory/stock/transfer` | Transfer stock between warehouses — creates `TRANSFER_OUT` + `TRANSFER_IN` |
| `POST` | `/inventory/stock/record-damage` | Record damaged or lost stock — creates `DAMAGE` movement |
| `GET` | `/inventory/movements/:variantId` | List movement history for a variant (paginated; filters: `type`, `warehouseId`, `from`, `to`) |

##### Procurement — `/procurement`

| Method | Path | Description |
|---|---|---|
| `GET` | `/procurement/suppliers` | List suppliers (paginated; filters: `search`, `isActive`) |
| `GET` | `/procurement/suppliers/:id` | Get supplier by ID |
| `POST` | `/procurement/suppliers` | Create supplier |
| `PATCH` | `/procurement/suppliers/:id` | Update supplier |
| `DELETE` | `/procurement/suppliers/:id` | Soft-delete supplier |
| `GET` | `/procurement/orders` | List purchase orders (paginated; filters: `supplierId`, `warehouseId`, `status`, `from`, `to`) |
| `GET` | `/procurement/orders/:id` | Get purchase order by ID |
| `POST` | `/procurement/orders` | Create purchase order |
| `PATCH` | `/procurement/orders/:id` | Update purchase order |
| `DELETE` | `/procurement/orders/:id` | Soft-delete purchase order |
| `POST` | `/procurement/orders/:id/send` | Transition order → `SENT` |
| `POST` | `/procurement/orders/:id/confirm` | Transition order → `CONFIRMED` |
| `POST` | `/procurement/orders/:id/cancel` | Transition order → `CANCELLED` |
| `POST` | `/procurement/orders/:id/receive` | Receive items — credits stock via `RECEIPT` movements; transitions order → `RECEIVED` or `PARTIALLY_RECEIVED` |
| `POST` | `/procurement/orders/:id/items` | Add line item to order |
| `PATCH` | `/procurement/orders/:id/items/:variantId` | Update line item quantity or cost |
| `DELETE` | `/procurement/orders/:id/items/:variantId` | Remove line item |

##### Seasons — `/seasons`

| Method | Path | Description |
|---|---|---|
| `GET` | `/seasons` | List seasons (paginated; filters: `search`, `isActive`, `year`) |
| `GET` | `/seasons/slug/:slug` | Get season by slug |
| `GET` | `/seasons/:id` | Get season by ID |
| `POST` | `/seasons` | Create season |
| `PATCH` | `/seasons/:id` | Update season |
| `DELETE` | `/seasons/:id` | Soft-delete season |

##### Analytics — `/analytics`

| Method | Path | Description |
|---|---|---|
| `GET` | `/analytics/overview/gmv` | Gross Merchandise Value (filter: `from`, `to`) |
| `GET` | `/analytics/overview/dead-stock` | Dead stock report (filter: `threshold`) |
| `GET` | `/analytics/overview/seasonal-demand/:seasonId` | Top-N demand for a season (filter: `limit`, `year`) |
| `GET` | `/analytics/overview/pre-season-health/:seasonId` | Inventory health before a season starts |
| `GET` | `/analytics/overview/supplier-fill-rate/:supplierId` | Supplier fill rate (filter: `from`, `to`) |
| `GET` | `/analytics/overview/daily-sales` | Daily sales report (filter: `date`) |
| `GET` | `/analytics/brands/top-selling` | Top-N selling brands (filter: `limit`, `from`, `to`, `seasonId`) |
| `GET` | `/analytics/brands/:id/revenue` | Revenue for a brand (filter: `from`, `to`) |
| `GET` | `/analytics/brands/:id/sales-by-month` | Monthly sales breakdown for a brand (filter: `year`) |
| `GET` | `/analytics/brands/:id/seasonal-sales` | Sales performance per season for a brand (filter: `year`, `isActive`) |
| `GET` | `/analytics/brands/:id/stock-health` | Stock health summary for a brand |
| `GET` | `/analytics/brands/:id/top-products` | Top-N products for a brand (filter: `limit`, `from`, `to`) |
| `GET` | `/analytics/brands/:id/warehouse-distribution` | Stock distribution across warehouses for a brand |
| `GET` | `/analytics/products/top-selling` | Top-N selling product variants (filter: `limit`, `from`, `to`, `warehouseId`) |
| `GET` | `/analytics/products/:id/turnover` | Stock turnover for a product (`from` + `to` required) |
| `GET` | `/analytics/products/:id/return-rate` | Return rate for a product (filter: `from`, `to`) |
| `GET` | `/analytics/products/:id/seasonal-sales` | Sales per season for a product (filter: `year`, `isActive`) |
| `GET` | `/analytics/products/:id/variant-split` | Sales split across variants for a product |
| `GET` | `/analytics/products/:id/sales-by-warehouse` | Product sales broken down by warehouse |
| `GET` | `/analytics/warehouses/compare-seasonal-demand` | Cross-warehouse demand comparison for a season (query: `seasonId`) |
| `GET` | `/analytics/warehouses/:id/top-products` | Top-N products in a warehouse (filter: `limit`, `seasonId`) |
| `GET` | `/analytics/warehouses/:id/inventory-value` | Total inventory value for a warehouse |
| `GET` | `/analytics/warehouses/:id/throughput` | Throughput (in/out volume) for a warehouse (filter: `from`, `to`) |
| `GET` | `/analytics/warehouses/:id/utilization` | Stock utilization for a warehouse |
| `GET` | `/analytics/warehouses/:id/low-stock-by-brand` | Low-stock items filtered by brand (query: `brandId`) |
| `GET` | `/analytics/warehouses/:id/sales-by-brand` | Sales by brand for a warehouse (filter: `from`, `to`) |
| `GET` | `/analytics/warehouses/:id/sales-by-season` | Sales per season for a warehouse (filter: `year`, `isActive`) |

#### Database Schema

The API uses MongoDB with Prisma's multi-file schema.

| Model | Collection | Key Fields |
|---|---|---|
| `Category` | `categories` | `name`, `slug` (unique), `parentId` (self-referential), `isActive`, `sortOrder`; soft-delete |
| `Brand` | `brands` | `name` (unique), `slug` (unique), `logoUrl`, `isActive`; soft-delete |
| `Product` | `products` | `sku` (unique), `slug` (unique), `status` (`ProductStatus`), `tags[]`, `metadata` (JSON), FK: `categoryId`, `brandId`; soft-delete |
| `ProductVariant` | `product_variants` | `sku` (unique), pricing fields, dimension and weight fields, `images` (embedded array), `isActive`; soft-delete |
| `Warehouse` | `warehouses` | `name` (unique), `code` (unique), `address` (embedded), `isActive`; soft-delete |
| `InventoryItem` | `inventory_items` | Composite unique `[variantId, warehouseId]`; `quantityOnHand`, `quantityReserved`, `reorderPoint`, `reorderQuantity` |
| `StockMovement` | `stock_movements` | `type` (`MovementType`), `quantity` (±), `referenceId`, `referenceType`, `performedBy`; append-only |
| `Supplier` | `suppliers` | `name` (unique), `code` (unique), contact fields, `address` (embedded), `isActive`; soft-delete |
| `PurchaseOrder` | `purchase_orders` | `orderNumber` (unique), `status` (`PurchaseOrderStatus`), `expectedAt`, FK: `supplierId`, `warehouseId`; soft-delete |
| `PurchaseOrderItem` | `purchase_order_items` | Composite unique `[purchaseOrderId, variantId]`; `quantityOrdered`, `quantityReceived`, `unitCost` |
| `Season` | `seasons` | `name`, `slug` (unique), `startDate`, `endDate`, `year` (denormalised), `isActive`; soft-delete |

**Embedded types:** `ImageEmbed` (`url`, `altText`, `isPrimary`, `sortOrder`) · `AddressEmbed` (`street`, `city`, `state`, `country`, `postal`, `line2`)

**Enums:** `ProductStatus` (`DRAFT`, `ACTIVE`, `DISCONTINUED`, `ARCHIVED`) · `MovementType` (`RECEIPT`, `SALE`, `ADJUSTMENT`, `TRANSFER_IN`, `TRANSFER_OUT`, `RETURN`, `DAMAGE`, `RESERVATION`, `RESERVATION_RELEASE`) · `PurchaseOrderStatus` (`DRAFT`, `SENT`, `CONFIRMED`, `PARTIALLY_RECEIVED`, `RECEIVED`, `CANCELLED`)

#### Middleware Stack

1. `helmet()` — security headers
2. `morgan('dev')` — HTTP request logging
3. `express.json()` — JSON body parser
4. `express.urlencoded({ extended: true })` — form body parser
5. `errorHandler` — global error handler

#### Environment Variables

```
PORT=3000
DATABASE_URL="mongodb://user:password@localhost:27017/inventory?authSource=admin"
```

---

## Apps

### @r6/me

The primary front-end application for the r6 project. Built with Angular 21 using the modern standalone component API and server-side rendering powered by `@angular/ssr`. Styled with Tailwind CSS v4.

**Technology:** [Angular 21](https://angular.dev) · [@angular/ssr](https://angular.dev/guide/ssr) · [Express 5](https://expressjs.com) · [Tailwind CSS v4](https://tailwindcss.com) · [Vitest](https://vitest.dev) · [TypeScript](https://www.typescriptlang.org)

#### Features

- **Server-side rendering** via `@angular/ssr` and Express 5 — the SSR server entry (`src/server.ts`) handles all requests and serves the hydrated application
- **Client hydration with event replay** — `provideClientHydration(withEventReplay())` ensures a seamless SSR-to-client handoff with no interaction loss
- **Angular Signals** — reactive state using Angular's native signals primitive
- **Standalone component API** — no `NgModule` declarations; all components are self-contained
- **Angular Router** — client-side navigation configured via `provideRouter()`

> **Status:** Work in progress — SSR is fully configured and the application shell is in place. Feature routing and views are actively being developed.

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

### @r6/schemas

The single source of truth for all request and response shapes in the monorepo. Every create, update, query, and response schema for the inventory-and-catalog domain is defined here and consumed by the API at its validation layer. TypeScript types are inferred directly from Zod schemas with `z.infer<>` — no duplication between runtime validation and static type definitions.

**Technology:** [Zod](https://zod.dev) · [TypeScript](https://www.typescriptlang.org) · [tsup](https://tsup.egoist.dev)

#### Exported Schema Groups

| Group | Contents |
|---|---|
| Base | `PriceSchema`, `AddressEmbedSchema`, `TimestampsSchema`, `SoftDeleteSchema` |
| Catalog | Create/update/query/response schemas for categories, brands, products, and variants; `ProductStatusSchema`, `DimensionUnitSchema`, `WeightUnitSchema` |
| Inventory | Create/update/query/response schemas for warehouses, stock operations, and movements; `MovementTypeSchema` |
| Supply | Create/update/query/response schemas for suppliers, purchase orders, and order items; `PurchaseOrderStatusSchema` |
| Seasons | Create/update/query/response schemas for seasons |

Ships as dual CJS + ESM with TypeScript declaration files. Sub-path exports per domain (`@r6/schemas/inventory-and-catalog`) are also available.

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
| Back-end framework | [Hono](https://hono.dev) · [@hono/node-server](https://github.com/honojs/node-server) · [Express 5](https://expressjs.com) |
| Front-end framework | [Angular 21](https://angular.dev) |
| Routing | [Angular Router](https://angular.dev/guide/routing) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Build tooling | [tsup](https://tsup.egoist.dev) |
| Authentication | [jose](https://github.com/panva/jose) (RS256 JWT) |
| Validation | [Zod](https://zod.dev) via [`@r6/schemas`](#r6schemas) |
| ORM | [Prisma 6](https://www.prisma.io) |
| Database | [PostgreSQL](https://www.postgresql.org) · [MongoDB](https://www.mongodb.com) |
| Password hashing | [bcrypt](https://github.com/kelektiv/node.bcrypt.js) |
| Linting / formatting | [Biome](https://biomejs.dev) |
| Dependency management | [syncpack](https://github.com/JamieMason/syncpack) |
| Testing | [Vitest](https://vitest.dev), [Angular Testing Library](https://testing-library.com/docs/angular-testing-library/intro/) |
| Containerisation | [Docker](https://www.docker.com) (distroless and Alpine images) |
| API client | [Bruno](https://www.usebruno.com) |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) >= 18
- npm >= 11 (`npm@11.3.0` is the configured package manager)
- A running [PostgreSQL](https://www.postgresql.org) instance for the IAM database
- A running [MongoDB](https://www.mongodb.com) instance for the inventory-and-catalog API

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

# Inventory and Catalog API
cp apis/inventory-and-catalog/.env.sample apis/inventory-and-catalog/.env
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

### @r6/inventory-and-catalog

```bash
# Build
docker build -f apis/inventory-and-catalog/Dockerfile -t r6-inventory-and-catalog .

# Run
docker run -p 3000:3000 --env-file apis/inventory-and-catalog/.env r6-inventory-and-catalog
```

The production image uses a minimal Alpine-based Node.js image and runs under a non-root system user.

---

## API Client

HTTP request collections for all implemented APIs are maintained in the `api-client/` directory using [Bruno](https://www.usebruno.com) — a Git-friendly, offline-first API client.

```
api-client/
├── identity-and-access/
│   ├── Auth/          # Register, Login, Logout, Refresh
│   ├── Main/          # Health Check, Me
│   └── Well-Known/    # JWKS
└── inventory-and-catalog/
    ├── Catalog/       # Brands, Categories, Products, Variants
    ├── Inventory/     # Stock, Warehouses, Movements
    ├── Procurement/   # Suppliers, Purchase Orders, Order Items
    ├── Seasons/       # Season management
    └── Analytics/     # Brands, Products, Warehouses, Overview
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
