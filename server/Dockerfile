FROM oven/bun:1-slim

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun build src/index.ts --target bun --outdir ./dist

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Add healthcheck using the service URL
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f "${URL:-http://localhost:8080}/health" || exit 1

EXPOSE 8080
CMD ["bun", "dist/index.js"] 