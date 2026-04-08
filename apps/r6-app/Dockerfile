FROM node:22-slim AS base
WORKDIR /app
RUN npm install -g turbo

FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo prune @r6/r6-app --docker

FROM base AS installer
WORKDIR /app

COPY --from=builder /app/out/json/ .
RUN npm ci

COPY --from=builder /app/out/full/ .

ARG VITE_API_URL=http://localhost:4000
ENV VITE_API_URL=${VITE_API_URL}

RUN turbo build --filter=@r6/r6-app...

FROM nginx:alpine AS runner

COPY --from=installer /app/apps/r6-app/dist /usr/share/nginx/html
COPY apps/r6-app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
