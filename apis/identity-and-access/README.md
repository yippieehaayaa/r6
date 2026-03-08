# @r6/identity-and-access

Identity and Access Management (IAM) API built with [Hono](https://hono.dev/) on Node.js. Provides JWT-based authentication, session management, and fine-grained role/permission control for the r6 platform.

---

## Features

- **Authentication** — Register, login, logout, and token refresh
- **RS256 JWT** — Asymmetric key signing; access tokens include roles and permissions
- **Token Rotation** — Refresh tokens are rotated on every use
- **JWKS Endpoint** — Public key exposed for downstream service verification
- **Role-Based Access Control (RBAC)** — Assign roles to identities; attach policies to roles
- **Fine-Grained Permissions** — `{service}:{resource}:{action}` format with wildcard (`*`) support
- **Security Middleware** — CORS, secure headers, and request logging on all routes
- **OpenAPI** — Request/response validation via `@hono/zod-openapi` and Zod schemas

---

## Getting Started

### Install dependencies

```bash
npm install
```

### Configure environment

Create a `.env` file in this directory:

```env
PORT=3000

# RS256 Key Pair
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----\n"

# JWT Claims
JWT_ISSUER=https://auth.example.com
JWT_AUDIENCE=api.example.com
JWT_ACCESS_TTL_MS=900000

# Hashing
HASH_SECRET=<64-character hex string>
```

> **Newline encoding** — PEM files must have real newlines replaced with `\n` (literal backslash-n) when stored in `.env`. Use:
> ```bash
> awk 'NF {ORS="\\n"; print}' private.pem
> ```
> On AWS, store the full multi-line PEM in Secrets Manager — ECS/Lambda preserve newlines automatically.

### Generate an RS256 key pair

```bash
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```

### Generate a `HASH_SECRET`

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

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

> **Required** — This API will not start without a running PostgreSQL instance and a migrated database. The database layer is managed by the [`@r6/db-identity-and-access`](../../dbs/identity-and-access) package in this monorepo.

### Provider

**PostgreSQL** via [Prisma ORM](https://www.prisma.io/) (`prisma-client-js`).

### Setup

1. **Configure the database package** — Create a `.env` file in `dbs/identity-and-access/` with your connection string:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/iam_db"
   HASH_SECRET=<same 64-char hex secret as in the API .env>
   ```

2. **Run migrations** — From `dbs/identity-and-access/`:

   ```bash
   npm run db:migrate
   ```

3. **Seed the database** (optional) — Populates default roles and policies:

   ```bash
   npm run db:seed
   ```

### Schema

The database contains the following tables:

| Table | Description |
|-------|-------------|
| `identities` | User/service/admin accounts with credentials and status |
| `sessions` | Refresh tokens and API keys with expiry and revocation tracking |
| `roles` | Named roles that can be assigned to identities |
| `policies` | Permission sets (allow/deny) that are attached to roles |
| `password_histories` | Audit trail of password changes per identity |
| `email_histories` | Audit trail of email changes per identity |
| `ip_addresses` | IP addresses associated with identities |

#### Key relationships

```
Identity ──< sessions        (one-to-many)
Identity >──< roles          (many-to-many)
Role     >──< policies       (many-to-many)
Identity ──< password_histories
Identity ──< email_histories
Identity ──< ip_addresses
```

#### Enums

| Enum | Values |
|------|--------|
| `IdentityKind` | `USER`, `SERVICE`, `ADMIN` |
| `IdentityStatus` | `ACTIVE`, `INACTIVE`, `SUSPENDED`, `PENDING_VERIFICATION` |
| `PolicyEffect` | `ALLOW`, `DENY` |
| `TokenKind` | `REFRESH`, `API_KEY` |

---

## API Reference

Base URL: `http://localhost:3000`

### Main

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | No | Health check — returns `200 OK` |
| `GET` | `/me` | Bearer | Returns the decoded JWT payload for the authenticated caller |

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | No | Create a new identity (username, email, password) |
| `POST` | `/auth/login` | No | Authenticate and receive `accessToken` + `refreshToken` |
| `POST` | `/auth/refresh` | No | Rotate refresh token and receive a new access token |
| `POST` | `/auth/logout` | No | Revoke a refresh token / session |

#### `POST /auth/register`

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "P@ssw0rd!"
}
```

#### `POST /auth/login`

```json
{ "username": "johndoe", "password": "P@ssw0rd!" }
```

Response:

```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<uuid>",
  "expiresIn": 900000,
  "tokenType": "Bearer"
}
```

#### `POST /auth/refresh`

```json
{ "refreshToken": "<uuid>" }
```

#### `POST /auth/logout`

```json
{ "refreshToken": "<uuid>" }
```

### Well-Known

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/.well-known/jwks.json` | No | Returns the RS256 public key as a JWK Set (cached 1 hour) |

---

## Access Token Structure

Tokens are signed with **RS256**. The payload includes:

```json
{
  "sub": "<identity UUID>",
  "roles": ["admin"],
  "permissions": ["api:events:*", "iam:users:read"],
  "iss": "https://auth.example.com",
  "aud": "api.example.com",
  "iat": 1700000000,
  "exp": 1700000900
}
```

Default TTL: **15 minutes** (`JWT_ACCESS_TTL_MS=900000`).

---

## Permission Model

Permissions follow the `{service}:{resource}:{action}` format:

| Permission | Meaning |
|-----------|---------|
| `api:events:read` | Read events in the `api` service |
| `api:events:*` | All actions on events |
| `iam:*:*` | Full access to the `iam` service |

Wildcards (`*`) match any value in that segment.

---

## Schemas

### Identity

| Field | Constraints |
|-------|------------|
| `username` | 3–32 chars, alphanumeric + `_` `-`, must start with a letter |
| `password` | 8+ chars, must include uppercase, lowercase, number, and special character |
| `email` | Optional, valid email format |
| `kind` | `USER` \| `SERVICE` \| `ADMIN` |

### Session

| Field | Constraints |
|-------|------------|
| `kind` | `REFRESH` \| `API_KEY` |
| `ttlMs` | 60,000 ms – 2,592,000,000 ms (60 s – 30 days) |

---

## Environment Variables

### API (`apis/identity-and-access/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP server port |
| `JWT_PRIVATE_KEY` | — | RS256 private key (newlines as `\n`) |
| `JWT_PUBLIC_KEY` | — | RS256 public key (newlines as `\n`) |
| `JWT_ISSUER` | — | JWT `iss` claim (e.g. `https://auth.example.com`) |
| `JWT_AUDIENCE` | — | JWT `aud` claim (e.g. `api.example.com`) |
| `JWT_ACCESS_TTL_MS` | `900000` | Access token TTL in milliseconds |
| `HASH_SECRET` | — | 64-char hex secret for hashing refresh tokens (must match the DB package) |

### Database (`dbs/identity-and-access/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | — | PostgreSQL connection string (e.g. `postgresql://user:pass@localhost:5432/iam_db`) |
| `HASH_SECRET` | — | Same 64-char hex secret as set in the API `.env` |

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with hot-reload via `tsx watch` |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled output |
| `npm run check` | Lint and format with Biome |
| `npm run lint` | Lint only |
| `npm run format` | Format only |

---

## Stack

- **[Hono](https://hono.dev/)** — Web framework
- **[jose](https://github.com/panva/jose)** — RS256 JWT signing and verification
- **[Zod](https://zod.dev/)** — Schema validation
- **[@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi)** — OpenAPI integration
- **[@r6/db-identity-and-access](../../dbs/identity-and-access)** — Prisma database models
- **[@r6/bcrypt](../../packages/bcrypt)** — Password hashing
