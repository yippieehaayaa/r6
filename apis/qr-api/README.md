# @r6/qr-api

Production-oriented Express 5 API for dynamic QR generation and premium NFT-like
business card rendering, with MongoDB persistence through Prisma.

## Highlights

- Dynamic QR records with mutable target URLs and branded center-logo support
- QR exports: `PNG`, `SVG`, `PDF`
- Premium business card rendering with luxurious visual treatment
- Business card exports: high-quality image (`PNG`/`WEBP`) and print-ready `PDF`
- Shared request/response contracts from `@r6/schemas`
- MongoDB persistence via Prisma (`DynamicQr`, `BusinessCard`)
- Liveness/readiness endpoints for deployment probes

## Endpoints

- `GET /` basic service status
- `GET /health` liveness probe
- `GET /ready` readiness probe (checks MongoDB ping)
- `POST /v1/qr-codes` create a dynamic QR record
- `GET /v1/qr-codes/:id` fetch QR metadata
- `PATCH /v1/qr-codes/:id/target` update dynamic QR target URL
- `GET /v1/qr-codes/:id/asset?format=PNG|SVG|PDF&sizePx=...&margin=...`
- `GET /v1/qr-codes/:id/resolve` resolve dynamic target
- `GET /r/:id` short redirect resolver
- `POST /v1/business-cards` create premium card metadata
- `GET /v1/business-cards/:id` fetch card metadata
- `GET /v1/business-cards/:id/image?format=PNG|WEBP`
- `GET /v1/business-cards/:id/pdf?includeBleed=true|false`

## Environment

Copy `.env.sample` to `.env` and set values.

- `NODE_ENV` (`development` | `test` | `production`)
- `PORT` (default `3000`)
- `DATABASE_URL` (`mongodb://...` or `mongodb+srv://...`)
- `PUBLIC_BASE_URL` (default `http://localhost:<PORT>`)
- `LOGO_MAX_BYTES` (default `2500000`)
- `REMOTE_LOGO_TIMEOUT_MS` (default `5000`)
- `REQUEST_BODY_LIMIT` (default `2mb`)
- `ASSET_CACHE_SECONDS` (default `3600`)

## Run

```bash
npm install
npm run build -w packages/schemas
cp apis/qr-api/.env.sample apis/qr-api/.env
npm run db:generate -w apis/qr-api
npm run db:push -w apis/qr-api
npm run dev -w apis/qr-api
```

## Prisma Notes

- Prisma schema is split under `apis/qr-api/prisma/schema/`
- For MongoDB, schema deployment uses `prisma db push` (not SQL migrations)
- Prisma client generation: `npm run db:generate -w apis/qr-api`

## Production Notes

- Graceful shutdown disconnects Prisma on `SIGINT`/`SIGTERM`
- Request validation is enforced at route boundaries with shared Zod schemas
- Errors are centralized in middleware with consistent JSON contract
- Architecture is modular: routes → controllers → services → repositories
