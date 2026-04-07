FROM node:22-slim AS base
WORKDIR /app
RUN npm install -g turbo

FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo prune @r6/inventory-and-catalog --docker

FROM base AS installer
WORKDIR /app

COPY --from=builder /app/out/json/ .
RUN npm ci

COPY --from=builder /app/out/full/ .
RUN cd apis/inventory-and-catalog && npx prisma generate
RUN turbo build --filter=@r6/inventory-and-catalog...

FROM gcr.io/distroless/nodejs22-debian12 AS runner
WORKDIR /app

COPY --from=installer /app/apis/inventory-and-catalog/dist ./dist
COPY --from=installer /app/apis/inventory-and-catalog/package.json ./package.json
COPY --from=installer /app/node_modules ./node_modules

COPY --from=installer /app/apis/inventory-and-catalog/generated ./generated

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

USER nonroot

CMD ["dist/index.js"]
