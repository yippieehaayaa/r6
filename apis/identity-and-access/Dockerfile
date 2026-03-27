FROM node:22-slim AS base
WORKDIR /app
RUN npm install -g turbo

FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo prune @r6/identity-and-access --docker

FROM base AS installer
WORKDIR /app

COPY --from=builder /app/out/json/ .
RUN npm ci

COPY --from=builder /app/out/full/ .

# DATABASE_URL is required for `prisma generate` inside @r6/db-identity-and-access build.
# Pass a dummy value at build time — it is never used at runtime.
ARG DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
ENV DATABASE_URL=${DATABASE_URL}

RUN turbo build --filter=@r6/identity-and-access...

FROM gcr.io/distroless/nodejs22-debian12 AS runner
WORKDIR /app

# API compiled output
COPY --from=installer /app/apis/identity-and-access/dist ./apis/identity-and-access/dist
COPY --from=installer /app/apis/identity-and-access/package.json ./apis/identity-and-access/package.json

# node_modules (includes workspace symlinks for @r6/* packages)
COPY --from=installer /app/node_modules ./node_modules

# Workspace package build artifacts (symlink targets for @r6/* runtime imports)
COPY --from=installer /app/dbs/identity-and-access/build ./dbs/identity-and-access/build
COPY --from=installer /app/dbs/identity-and-access/package.json ./dbs/identity-and-access/package.json

COPY --from=installer /app/dbs/redis/dist ./dbs/redis/dist
COPY --from=installer /app/dbs/redis/package.json ./dbs/redis/package.json

COPY --from=installer /app/packages/schemas/dist ./packages/schemas/dist
COPY --from=installer /app/packages/schemas/package.json ./packages/schemas/package.json

COPY --from=installer /app/packages/bcrypt/dist ./packages/bcrypt/dist
COPY --from=installer /app/packages/bcrypt/package.json ./packages/bcrypt/package.json

COPY --from=installer /app/packages/crypto/dist ./packages/crypto/dist
COPY --from=installer /app/packages/crypto/package.json ./packages/crypto/package.json

WORKDIR /app/apis/identity-and-access

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

USER nonroot

CMD ["dist/index.js"]
