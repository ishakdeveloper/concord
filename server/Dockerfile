FROM oven/bun:1-slim

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package file first
COPY package.json ./

# Clean install dependencies and skip husky
RUN rm -rf node_modules && \
    HUSKY=0 NODE_ENV=production bun install --production --no-install-scripts

# Copy source files (excluding node_modules)
COPY . .

# Build the application
RUN bun build src/index.ts --target bun --outdir ./dist

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
ENV HUSKY=0

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f "${URL:-http://localhost:8080}/health" || exit 1

EXPOSE 8080
CMD ["bun", "dist/index.js"] 