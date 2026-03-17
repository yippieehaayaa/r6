# @r6/qr-api

Production-oriented Express 5 API for dynamic QR code generation and premium
NFT-like business card rendering.

## Features

- Dynamic QR creation with mutable target URLs
- Branded QR output with centered logo support
- QR export in PNG, SVG, and PDF
- Luxurious NFT-inspired business card rendering
- Business card export in high-resolution image and PDF
- Shared Zod contracts from `@r6/schemas` (`dynamic-qr` domain)

## Endpoints

- `GET /` health check
- `POST /v1/qr-codes` create a dynamic QR metadata record
- `GET /v1/qr-codes/:id` fetch QR metadata
- `PATCH /v1/qr-codes/:id/target` update dynamic QR target URL
- `GET /v1/qr-codes/:id/asset?format=PNG|SVG|PDF&sizePx=...&margin=...`
- `GET /v1/qr-codes/:id/resolve` resolve dynamic target
- `GET /r/:id` short redirect resolver
- `POST /v1/business-cards` create premium card metadata
- `GET /v1/business-cards/:id` fetch card metadata
- `GET /v1/business-cards/:id/image?format=PNG|WEBP`
- `GET /v1/business-cards/:id/pdf?includeBleed=true|false`

## Quick Start

```bash
npm install
npm run build -w packages/schemas
npm run dev -w apis/qr-api
```

## Environment Variables

Copy `.env.sample` to `.env` and adjust as needed.

- `PORT` default `3000`
- `PUBLIC_BASE_URL` default `http://localhost:<PORT>`
- `LOGO_MAX_BYTES` max accepted logo size (bytes)
- `REMOTE_LOGO_TIMEOUT_MS` timeout for remote logo download
- `STORE_MAX_RECORDS` in-memory max for QR/card records
- `ASSET_CACHE_SECONDS` cache-control max-age for export responses
