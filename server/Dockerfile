FROM oven/bun:1 as builder

WORKDIR /app

# Copy package files for the server
COPY server/package.json server/
COPY server/bun.lockb server/
COPY server/tsconfig.json server/

# Copy source code
COPY server/src server/src

# Install dependencies
WORKDIR /app/server
RUN bun install --frozen-lockfile

# Build the application
RUN bun build ./src/index.ts --target bun --outfile server

# Production image
FROM oven/bun:1-slim

WORKDIR /app

# Copy the built application
COPY --from=builder /app/server/server .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 bunjs
USER bunjs

EXPOSE 3001

CMD ["./server"] 