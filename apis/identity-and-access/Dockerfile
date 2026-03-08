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
RUN turbo build --filter=@r6/identity-and-access...

FROM gcr.io/distroless/nodejs22-debian12 AS runner
WORKDIR /app

COPY --from=installer /app/apis/identity-and-access/dist ./dist
COPY --from=installer /app/apis/identity-and-access/package.json ./package.json
COPY --from=installer /app/node_modules ./node_modules

COPY --from=installer /app/dbs/identity-and-access ./dbs/identity-and-access
COPY --from=installer /app/dbs/identity-and-access/generated ./dbs/identity-and-access/build/generated∆
COPY --from=installer /app/packages/bcrypt ./packages/bcrypt
COPY --from=installer /app/packages/crypto ./packages/crypto

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

CMD ["dist/index.js"]