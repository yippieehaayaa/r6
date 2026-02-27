FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g turbo

# ----------------------------------------------------------------------
# Stage 1: Prune the workspace to just what `@r6/me` needs
# ----------------------------------------------------------------------
FROM base AS builder
# Set working directory
WORKDIR /app
COPY . .
# Generate a partial monorepo with a pruned lockfile for the target workspace.
RUN turbo prune @r6/me --docker

# ----------------------------------------------------------------------
# Stage 2: Install dependencies and build
# ----------------------------------------------------------------------
FROM base AS installer
WORKDIR /app

# First install dependencies (as they change less often)
# Copy the pruned lockfile and package.json's from the out/json directory
COPY --from=builder /app/out/json/ .

# Install dependencies
RUN npm ci

# Copy the actual source code from out/full
COPY --from=builder /app/out/full/ .

# Build the project using turbo
RUN turbo build --filter=@r6/me...

# ----------------------------------------------------------------------
# Stage 3: Runner
# ----------------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 reactstart
USER reactstart

# Copy only the necessary files for the built app to run
COPY --from=installer --chown=reactstart:nodejs /app/apps/me/package.json ./package.json

# Copy the built standalone output
# Depending on the output, we might need actual node_modules.
# TanStack Start / Vite builds typically bundle everything for the server.
COPY --from=installer --chown=reactstart:nodejs /app/apps/me/.output ./.output
COPY --from=installer --chown=reactstart:nodejs /app/node_modules ./node_modules
COPY --from=installer --chown=reactstart:nodejs /app/apps/me/node_modules ./apps/me/node_modules

# Expose the correct port
EXPOSE 3000
ENV PORT=3000
ENV HOST=0.0.0.0
ENV NODE_ENV=production

# Start the application
CMD ["npm", "run", "start"]
