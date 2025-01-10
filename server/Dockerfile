FROM oven/bun:1 as builder
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build with correct target
RUN bun build src/index.ts --target bun --outdir ./dist

# Production image
FROM oven/bun:1-slim
WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Create uploads directory
RUN mkdir -p uploads && chmod 777 uploads

# Expose the correct port
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=20s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start the server
CMD ["bun", "dist/index.js"] 