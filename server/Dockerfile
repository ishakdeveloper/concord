FROM oven/bun:1-slim as builder

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml ./
COPY server/package.json ./server/

# Install only server dependencies
WORKDIR /app/server
RUN NODE_ENV=production bun install --production --no-git-checks

# Copy server source
COPY server/ ./

# Build the application
RUN bun build src/index.ts --target bun --outdir ./dist

# Production image
FROM oven/bun:1-slim

WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy built files and dependencies
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f "${URL:-http://localhost:8080}/health" || exit 1

EXPOSE 8080
CMD ["bun", "dist/index.js"] 