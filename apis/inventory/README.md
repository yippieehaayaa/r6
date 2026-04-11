# @r6/identity-and-access

Identity and Access Management API for the r6 platform, built with Express 5 on Node.js.

This service handles:

- authentication (`login`, `refresh`, `logout`)
- tenant management
- identity lifecycle
- role and policy management
- JWT public key publishing (`/.well-known/jwks.json`)

---

## Features

- Tenant-scoped IAM with platform-level `ADMIN` support
- JWT access tokens (`RS256`) + rotating refresh tokens
- Device-bound refresh token validation (user-agent + IP fingerprint)
- Redis-backed access-token denylist for logout revocation
- Role-based and permission-based guards (`service:resource:action`)
- Zod validation for request payloads via `@r6/schemas/identity-and-access`
- Prisma-backed data layer via `@r6/db-identity-and-access`

---

## Getting Started

### Install dependencies

```bash
npm install
```

### Configure environment

Create `.env` in this directory:

```env
PORT=3000
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n<base64>\n-----END PRIVATE KEY-----"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n<base64>\n-----END PUBLIC KEY-----"
JWT_ISSUER="https://auth.example.com"
JWT_AUDIENCE="api.example.com"
JWT_REFRESH_TTL_MS=86400000
HASH_SECRET="change_me_to_a_64_char_hex_string"
REDIS_URL="redis://localhost:6379"
CORS_ORIGIN="http://localhost:5173"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/identity_and_access"
```

`DATABASE_URL` is required by `@r6/db-identity-and-access` (Prisma + pg adapter).

### Run in development

```bash
npm run dev
```

### Run in production

```bash
npm run build
npm run start
```

---

## Security Model

- Access tokens include `kind`, `tenantSlug`, `roles`, and flattened `permissions`
- Access tokens are verified with issuer/audience/algorithm checks
- Revoked access tokens are blocked via Redis by JTI
- Refresh tokens are stateful (stored and revocable in DB)
- Refresh flow rotates token JTI on each successful refresh
- Refresh flow rejects device mismatch using HMAC fingerprint

---

## Authorization Guards

Applied after `authMiddleware()`:

- `requireAdmin()` - only `kind === "ADMIN"`
- `requireAdminOrTenantOwner()` - admin or tenant owner for target tenant
- `requireSelfOrAdminOrTenantOwner()` - self, tenant owner, or admin
- `requireTenantScope()` - non-admin must match route `tenantSlug`
- `requirePermission("service:resource:action")` - wildcard-supported permission check

---

## API Reference

Base URL: `http://localhost:3000`

### Health

| Method | Path | Notes |
|---|---|---|
| `GET` | `/` | Health check (`200 OK`) |

### Auth

| Method | Path | Notes |
|---|---|---|
| `POST` | `/auth/login` | Accepts username or email + password; sets refresh cookie; returns access token |
| `POST` | `/auth/refresh` | Requires `refreshToken` cookie; rotates refresh token; returns new access token |
| `POST` | `/auth/logout` | Requires bearer access token; revokes access + refresh tokens |

### Well-known

| Method | Path | Notes |
|---|---|---|
| `GET` | `/.well-known/jwks.json` | Publishes public JWK key set |

### Me

| Method | Path | Notes |
|---|---|---|
| `GET` | `/me` | Get current identity from JWT subject |
| `PATCH` | `/me/password` | Change current identity password |

### Tenants

| Method | Path | Notes |
|---|---|---|
| `POST` | `/tenants` | Create tenant (`ADMIN`) |
| `GET` | `/tenants` | List tenants (`ADMIN`), query: `page`, `limit`, `isActive` |
| `GET` | `/tenants/:tenantSlug` | Get tenant (`ADMIN` or tenant owner) |
| `PATCH` | `/tenants/:tenantSlug` | Update tenant (`ADMIN` or tenant owner) |
| `DELETE` | `/tenants/:tenantSlug` | Soft-delete tenant (`ADMIN`) |
| `POST` | `/tenants/:tenantSlug/restore` | Restore tenant (`ADMIN`) |

### Identities (tenant scoped)

| Method | Path | Notes |
|---|---|---|
| `POST` | `/tenants/:tenantSlug/identities` | Create identity; needs `iam:identity:create` |
| `GET` | `/tenants/:tenantSlug/identities` | List identities |
| `GET` | `/tenants/:tenantSlug/identities/:id` | Get identity (self/admin/tenant-owner) |
| `PATCH` | `/tenants/:tenantSlug/identities/:id` | Update identity (self/admin/tenant-owner) |
| `DELETE` | `/tenants/:tenantSlug/identities/:id` | Soft-delete identity |
| `POST` | `/tenants/:tenantSlug/identities/:id/restore` | Restore identity (`ADMIN`) |
| `POST` | `/tenants/:tenantSlug/identities/:id/roles` | Assign single role |
| `DELETE` | `/tenants/:tenantSlug/identities/:id/roles/:roleId` | Remove single role |
| `PUT` | `/tenants/:tenantSlug/identities/:id/roles` | Replace role set |

### Roles (tenant scoped, admin-guarded)

| Method | Path | Notes |
|---|---|---|
| `POST` | `/tenants/:tenantSlug/roles` | Create role |
| `GET` | `/tenants/:tenantSlug/roles` | List roles |
| `GET` | `/tenants/:tenantSlug/roles/:id` | Get role (with policies) |
| `PATCH` | `/tenants/:tenantSlug/roles/:id` | Update role |
| `DELETE` | `/tenants/:tenantSlug/roles/:id` | Soft-delete role |
| `POST` | `/tenants/:tenantSlug/roles/:id/restore` | Restore role |
| `POST` | `/tenants/:tenantSlug/roles/:id/policies` | Attach one policy |
| `DELETE` | `/tenants/:tenantSlug/roles/:id/policies/:policyId` | Detach one policy |
| `PUT` | `/tenants/:tenantSlug/roles/:id/policies` | Replace policy set |

### Policies (tenant scoped, admin-guarded)

| Method | Path | Notes |
|---|---|---|
| `POST` | `/tenants/:tenantSlug/policies` | Create policy |
| `GET` | `/tenants/:tenantSlug/policies` | List policies |
| `GET` | `/tenants/:tenantSlug/policies/:id` | Get policy |
| `PATCH` | `/tenants/:tenantSlug/policies/:id` | Update policy |
| `DELETE` | `/tenants/:tenantSlug/policies/:id` | Soft-delete policy |
| `POST` | `/tenants/:tenantSlug/policies/:id/restore` | Restore policy |

---

## Request Validation and Types

This API uses `@r6/schemas/identity-and-access` for Zod validation:

- tenant schemas
- identity schemas (including password change schema)
- role schemas (including policy assignment schema)
- policy schemas (including permission and audience constraints)
- IAM enums (`IdentityKind`, `IdentityStatus`, `PolicyEffect`)

---

## Related Packages

- `@r6/db-identity-and-access` - persistence and IAM use-cases (Prisma + PostgreSQL)
- `@r6/schemas/identity-and-access` - shared Zod schemas and types
- `@r6/redis` - access token denylist storage
- `@r6/crypto` and `@r6/bcrypt` - crypto and password utilities

---

## License

MIT. See `LICENSE`.
# @r6/inventory-and-catalog

Inventory & Catalog API built with [Express 5](https://expressjs.com/) on Node.js. Manages the full product catalog, per-warehouse stock levels, procurement workflows, selling seasons, and analytics for the r6 platform.

---

## Features

- **Catalog Management** — Products with a `DRAFT → ACTIVE → DISCONTINUED` lifecycle, multi-option variants (price, dimensions, weight, images), brands, and hierarchical categories with tree lookup
- **Inventory Tracking** — Per-warehouse stock levels with reservations, manual adjustments, warehouse-to-warehouse transfers, damage recording, and a full append-only movement ledger
- **Procurement** — Purchase orders with a `DRAFT → SENT → CONFIRMED → RECEIVED` lifecycle, supplier management, and per-variant line items; receiving a PO automatically credits stock via `RECEIPT` movements
- **Seasons** — Named selling seasons with ISO date ranges, a denormalized year index, and slug-based lookup
- **Analytics** — Read-only computed metrics covering GMV, dead stock, seasonal demand, supplier fill rate, brand/product/warehouse performance breakdowns
- **Zod Validation** — All request bodies and query parameters validated via the shared [`@r6/schemas`](#shared-schemas----r6schemas) package
- **MongoDB** — [Prisma ORM](https://www.prisma.io/) with a multi-file schema; `StockMovement` is append-only (no `updatedAt`)
- **Security** — `helmet` for secure headers, `trust proxy` enabled, `x-powered-by` disabled, global error handler middleware

---

## Getting Started

### Install dependencies

```bash
npm install
```

### Configure environment

Create a `.env` file in this directory (see `.env.sample` for the template):

```env
PORT=3000
DATABASE_URL=mongodb://localhost:27017/inventory-and-catalog
```

> `DATABASE_URL` is consumed directly by Prisma and is not validated at application startup — it must be set before running any `db:*` commands.

### Run in development

```bash
npm run dev
```

### Run in production

```bash
npm run build
npm start
```

---

## Database

> **Required** — This API will not function without a running MongoDB instance. The Prisma client is generated locally in `generated/client/` from the multi-file schema in `prisma/schema/`.

### Provider

**MongoDB** via [Prisma ORM](https://www.prisma.io/). Binary targets include native, `debian-openssl-3.0.x`, `linux-musl-arm64-openssl-3.0.x`, and `linux-arm64-openssl-3.0.x` for Docker compatibility.

### Setup

1. Start a local MongoDB instance or point `DATABASE_URL` at a remote cluster.

2. Push the schema and regenerate the Prisma client:

   ```bash
   npm run db:push      # sync schema to the database (no migration history)
   npm run db:generate  # regenerate the Prisma client from the schema
   ```

3. (Optional) Seed with sample data:

   ```bash
   npm run db:seed        # seed incrementally
   npm run db:seed:fresh  # wipe all collections and reseed from scratch
   ```

4. Inspect data in the browser:

   ```bash
   npm run db:studio
   ```

### Schema overview

The schema is split across multiple files in `prisma/schema/`:

| Model | File | Description |
|---|---|---|
| `Category` | `catalog.prisma` | Hierarchical categories — self-referential `parentId`, `sortOrder`, soft-delete |
| `Brand` | `catalog.prisma` | Product brands with optional `logoUrl`, soft-delete |
| `Product` | `catalog.prisma` | SKU, slug, `status` lifecycle, free-form `tags[]`, JSON `metadata`, linked to category and brand |
| `ProductVariant` | `catalog.prisma` | Per-product variants — pricing (`price`, `costPrice`, `compareAtPrice`), dimensions, weight, embedded `images[]` |
| `Warehouse` | `inventory.prisma` | Physical/logical storage locations with embedded address, soft-delete |
| `InventoryItem` | `inventory.prisma` | Per-variant × per-warehouse quantity on hand, quantity reserved, reorder threshold |
| `StockMovement` | `inventory.prisma` | Append-only movement ledger; `createdAt` only — no `updatedAt` |
| `Supplier` | `supply.prisma` | Procurement suppliers with contact fields and embedded address, soft-delete |
| `PurchaseOrder` | `supply.prisma` | Supply orders — `orderNumber`, `status`, `expectedAt`, linked to supplier and warehouse |
| `PurchaseOrderItem` | `supply.prisma` | Line items — `quantityOrdered`, `quantityReceived`, `unitCost`; composite unique on `[purchaseOrderId, variantId]` |
| `Season` | `seasons.prisma` | Named selling seasons — `startDate`, `endDate`, denormalized `year` integer, soft-delete |

### Embedded types

| Type | Fields |
|---|---|
| `ImageEmbed` | `url`, `altText?`, `isPrimary`, `sortOrder` |
| `AddressEmbed` | `street`, `line2?`, `city`, `state`, `country`, `postal?` |

### Enums

| Enum | Values |
|---|---|
| `ProductStatus` | `DRAFT`, `ACTIVE`, `DISCONTINUED`, `ARCHIVED` |
| `MovementType` | `RECEIPT`, `SALE`, `ADJUSTMENT`, `TRANSFER_IN`, `TRANSFER_OUT`, `RETURN`, `DAMAGE`, `RESERVATION`, `RESERVATION_RELEASE` |
| `PurchaseOrderStatus` | `DRAFT`, `SENT`, `CONFIRMED`, `PARTIALLY_RECEIVED`, `RECEIVED`, `CANCELLED` |
| `DimensionUnit` | `CM`, `MM`, `IN`, `FT`, `M` |
| `WeightUnit` | `G`, `KG`, `LB`, `OZ` |

---

## API Reference

Base URL: `http://localhost:3000`

### Health Check

| Method | Path | Response |
|---|---|---|
| `GET` | `/` | `200 OK` |

---

### Catalog — `/catalog`

#### Categories

| Method | Path | Query / Notes |
|---|---|---|
| `GET` | `/catalog/categories` | `page`, `limit`, `search`, `parentId`, `isActive` |
| `GET` | `/catalog/categories/:id` | Get by ID |
| `GET` | `/catalog/categories/:id/tree` | Full subtree rooted at `id` |
| `POST` | `/catalog/categories` | Create |
| `PATCH` | `/catalog/categories/:id` | Update |
| `DELETE` | `/catalog/categories/:id` | Soft-delete |

#### Brands

| Method | Path | Query / Notes |
|---|---|---|
| `GET` | `/catalog/brands` | `page`, `limit`, `search`, `isActive` |
| `GET` | `/catalog/brands/:id` | Get by ID |
| `POST` | `/catalog/brands` | Create |
| `PATCH` | `/catalog/brands/:id` | Update |
| `DELETE` | `/catalog/brands/:id` | Delete |

#### Products

| Method | Path | Query / Notes |
|---|---|---|
| `GET` | `/catalog/products` | `page`, `limit`, `search`, `categoryId`, `brandId`, `status`, `tags` |
| `GET` | `/catalog/products/:id` | Get by ID |
| `GET` | `/catalog/products/slug/:slug` | Get by slug |
| `POST` | `/catalog/products` | Create (status defaults to `DRAFT`) |
| `PATCH` | `/catalog/products/:id` | Update |
| `POST` | `/catalog/products/:id/publish` | Lifecycle: `DRAFT → ACTIVE` |
| `POST` | `/catalog/products/:id/discontinue` | Lifecycle: `→ DISCONTINUED` |

#### Variants

| Method | Path | Query / Notes |
|---|---|---|
| `GET` | `/catalog/products/:id/variants` | List variants for a product |
| `GET` | `/catalog/products/:id/variants/:variantId` | Get variant by ID |
| `POST` | `/catalog/products/:id/variants` | Add variant |
| `PATCH` | `/catalog/products/:id/variants/:variantId` | Update variant |
| `DELETE` | `/catalog/products/:id/variants/:variantId` | Delete variant |

---

### Inventory — `/inventory`

#### Warehouses

| Method | Path | Query / Notes |
|---|---|---|
| `GET` | `/inventory/warehouses` | `page`, `limit`, `search`, `isActive` |
| `GET` | `/inventory/warehouses/:id` | Get by ID |
| `POST` | `/inventory/warehouses` | Create |
| `PATCH` | `/inventory/warehouses/:id` | Update |
| `DELETE` | `/inventory/warehouses/:id` | Soft-delete |

#### Stock Queries

| Method | Path | Query / Notes |
|---|---|---|
| `GET` | `/inventory/stock/:variantId/:warehouseId` | Stock level for a specific variant + warehouse |
| `GET` | `/inventory/stock/product/:productId` | All stock for a product across all warehouses |
| `GET` | `/inventory/low-stock` | Low-stock items; optional `warehouseId` filter |

#### Stock Mutations

Each mutation creates one or more `StockMovement` records.

| Method | Path | Movement Type(s) | Body |
|---|---|---|---|
| `POST` | `/inventory/stock/reserve` | `RESERVATION` | `variantId`, `warehouseId`, `quantity` |
| `POST` | `/inventory/stock/release` | `RESERVATION_RELEASE` | `variantId`, `warehouseId`, `quantity` |
| `POST` | `/inventory/stock/commit-sale` | `SALE` | `variantId`, `warehouseId`, `quantity` |
| `POST` | `/inventory/stock/adjust` | `ADJUSTMENT` | `variantId`, `warehouseId`, `delta`, `notes?` |
| `POST` | `/inventory/stock/transfer` | `TRANSFER_OUT` + `TRANSFER_IN` | `variantId`, `fromWarehouseId`, `toWarehouseId`, `quantity` |
| `POST` | `/inventory/stock/record-damage` | `DAMAGE` | `variantId`, `warehouseId`, `quantity`, `notes?` |

#### Movement History

| Method | Path | Query / Notes |
|---|---|---|
| `GET` | `/inventory/movements/:variantId` | `page`, `limit`, `type`, `warehouseId`, `from`, `to` |

---

### Procurement — `/procurement`

#### Suppliers

| Method | Path | Query / Notes |
|---|---|---|
| `GET` | `/procurement/suppliers` | `page`, `limit`, `search`, `isActive` |
| `GET` | `/procurement/suppliers/:id` | Get by ID |
| `POST` | `/procurement/suppliers` | Create |
| `PATCH` | `/procurement/suppliers/:id` | Update |
| `DELETE` | `/procurement/suppliers/:id` | Soft-delete |

#### Purchase Orders

| Method | Path | Query / Notes |
|---|---|---|
| `GET` | `/procurement/orders` | `page`, `limit`, `supplierId`, `warehouseId`, `status`, `from`, `to` |
| `GET` | `/procurement/orders/:id` | Get by ID |
| `POST` | `/procurement/orders` | Create (status starts as `DRAFT`) |
| `PATCH` | `/procurement/orders/:id` | Update |
| `DELETE` | `/procurement/orders/:id` | Soft-delete |

#### Purchase Order Lifecycle

| Method | Path | Transition |
|---|---|---|
| `POST` | `/procurement/orders/:id/send` | `DRAFT → SENT` |
| `POST` | `/procurement/orders/:id/confirm` | `SENT → CONFIRMED` |
| `POST` | `/procurement/orders/:id/cancel` | `→ CANCELLED` |
| `POST` | `/procurement/orders/:id/receive` | Receives items, credits stock via `RECEIPT` movements; status → `PARTIALLY_RECEIVED` or `RECEIVED` |

#### Purchase Order Items

| Method | Path | Notes |
|---|---|---|
| `POST` | `/procurement/orders/:id/items` | Add line item (`variantId`, `quantityOrdered`, `unitCost`) |
| `PATCH` | `/procurement/orders/:id/items/:variantId` | Update quantities / unit cost |
| `DELETE` | `/procurement/orders/:id/items/:variantId` | Remove line item |

---

### Seasons — `/seasons`

| Method | Path | Query / Notes |
|---|---|---|
| `GET` | `/seasons` | `page`, `limit`, `search`, `isActive`, `year` |
| `GET` | `/seasons/:id` | Get by ID |
| `GET` | `/seasons/slug/:slug` | Get by slug |
| `POST` | `/seasons` | Create |
| `PATCH` | `/seasons/:id` | Update |
| `DELETE` | `/seasons/:id` | Soft-delete |

---

### Analytics — `/analytics`

All analytics endpoints are read-only (`GET`).

#### Overview

| Path | Parameters |
|---|---|
| `/analytics/overview/gmv` | `from?`, `to?` |
| `/analytics/overview/dead-stock` | `threshold?` |
| `/analytics/overview/seasonal-demand/:seasonId` | `limit`, `year` |
| `/analytics/overview/pre-season-health/:seasonId` | — |
| `/analytics/overview/supplier-fill-rate/:supplierId` | `from?`, `to?` |
| `/analytics/overview/daily-sales` | `date?` |

#### Brand Analytics

| Path | Parameters |
|---|---|
| `/analytics/brands/top-selling` | `limit`, `from?`, `to?`, `seasonId?` |
| `/analytics/brands/:id/revenue` | `from?`, `to?` |
| `/analytics/brands/:id/sales-by-month` | `year` |
| `/analytics/brands/:id/seasonal-sales` | `year?`, `isActive?` |
| `/analytics/brands/:id/stock-health` | — |
| `/analytics/brands/:id/top-products` | `limit`, `from?`, `to?` |
| `/analytics/brands/:id/warehouse-distribution` | — |

#### Product Analytics

| Path | Parameters |
|---|---|
| `/analytics/products/top-selling` | `limit`, `from?`, `to?`, `warehouseId?` |
| `/analytics/products/:id/turnover` | `from` (required), `to` (required) |
| `/analytics/products/:id/return-rate` | `from?`, `to?` |
| `/analytics/products/:id/seasonal-sales` | `year?`, `isActive?` |
| `/analytics/products/:id/variant-split` | — |
| `/analytics/products/:id/sales-by-warehouse` | — |

#### Warehouse Analytics

| Path | Parameters |
|---|---|
| `/analytics/warehouses/compare-seasonal-demand` | `seasonId` (required) |
| `/analytics/warehouses/:id/top-products` | `limit`, `seasonId?` |
| `/analytics/warehouses/:id/inventory-value` | — |
| `/analytics/warehouses/:id/throughput` | `from?`, `to?` |
| `/analytics/warehouses/:id/utilization` | — |
| `/analytics/warehouses/:id/low-stock-by-brand` | `brandId` (required) |
| `/analytics/warehouses/:id/sales-by-brand` | `from?`, `to?` |
| `/analytics/warehouses/:id/sales-by-season` | `year?`, `isActive?` |

---

## Shared Schemas — `@r6/schemas`

Request and response types are defined in the [`@r6/schemas`](../../packages/schemas) workspace package and shared across services and consumers. The inventory-and-catalog domain schemas live at `packages/schemas/src/inventory-and-catalog/`.

### Validation pattern

Each controller imports the relevant Zod schema from `@r6/schemas` and uses it to parse the incoming request body or query string before the data reaches a service or repository. Invalid requests are rejected before any database call is made.

### Schema file structure

Every domain follows the same five-file pattern:

| File | Purpose |
|---|---|
| `base-schemas.ts` | Full Zod model schema — shape mirrors the database document |
| `create-schemas.ts` | Strict create-input schema (omits `id`, timestamps, readonly fields) |
| `update-schemas.ts` | `.partial()` of the create schema — used for `PATCH` endpoints |
| `query-schemas.ts` | Discriminated-union lookup schema (by `id`, `slug`, `sku`, etc.) |
| `response-schemas.ts` | API response schema — alias of the base schema |

### Shared primitives

The root `base-schemas.ts` exports primitives composed into all domain schemas:

| Export | Description |
|---|---|
| `PriceSchema` | `z.number().nonnegative().finite()` |
| `AddressEmbedSchema` | `country` required; `line2`, `street`, `city`, `state`, `postal` optional |
| `TimestampsSchema` | `{ createdAt: string, updatedAt: string }` |
| `SoftDeleteSchema` | `{ deletedAt?: string }` |

### Domain summary

| Domain | Models | Enums |
|---|---|---|
| **Catalog** | `Category`, `Brand`, `Product`, `ProductVariant` | `ProductStatus`, `DimensionUnit`, `WeightUnit` |
| **Inventory** | `Warehouse`, `InventoryItem`, `StockMovement` | `MovementType` |
| **Seasons** | `Season` | — |
| **Supply** | `Supplier`, `PurchaseOrder`, `PurchaseOrderItem` | `PurchaseOrderStatus` |

---

## Project Structure

```
apis/inventory-and-catalog/
├── prisma/
│   ├── schema/
│   │   ├── schema.prisma       # datasource + generator config
│   │   ├── catalog.prisma      # Category, Brand, Product, ProductVariant
│   │   ├── inventory.prisma    # Warehouse, InventoryItem, StockMovement
│   │   ├── supply.prisma       # Supplier, PurchaseOrder, PurchaseOrderItem
│   │   ├── seasons.prisma      # Season
│   │   ├── enums.prisma        # All enum definitions
│   │   └── types.prisma        # Embedded types (ImageEmbed, AddressEmbed)
│   └── seed/                   # Seed scripts per domain
├── generated/
│   └── client/                 # Auto-generated Prisma client (do not edit)
└── src/
    ├── app.ts                  # Express app setup (middleware, routes)
    ├── config.ts               # Env var validation (Zod + dotenv)
    ├── index.ts                # HTTP server entry point
    ├── routes/
    │   └── index.ts            # Route registration
    ├── modules/
    │   ├── catalog/            # catalog.controller, service, repository, validator, errors
    │   ├── inventory/          # inventory.controller, service, repositories, validator, errors
    │   ├── procurement/        # procurement.controller, service, repositories, validator, errors
    │   ├── seasons/            # seasons.controller, service, repository, validator, errors
    │   └── analytics/          # analytics.controller, four analytics services
    ├── models/                 # Prisma result type helpers
    ├── shared/
    │   ├── errors/             # Domain error classes
    │   ├── events/             # Event handlers registered at startup
    │   └── middleware/         # Global error handler
    └── utils/                  # asyncHandler, currency helpers, Prisma client singleton
```
