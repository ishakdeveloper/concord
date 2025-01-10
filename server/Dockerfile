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

# Expose the correct port
EXPOSE 8080

# Start the server
CMD ["bun", "dist/index.js"] 