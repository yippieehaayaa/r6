FROM node:22-slim AS base
WORKDIR /app
RUN npm install -g turbo@2.8.13

FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo prune @r6/me-react --docker

FROM base AS installer
WORKDIR /app

COPY --from=builder /app/out/json/ .
RUN npm install --no-audit --no-fund

COPY --from=builder /app/out/full/ .
RUN turbo run build --filter=@r6/me-react...

FROM nginx:1.27-alpine AS runner
WORKDIR /usr/share/nginx/html

COPY --from=installer /app/apps/me-react/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=installer /app/apps/me-react/dist/ ./

EXPOSE 80
