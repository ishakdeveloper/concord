# Use Node.js base image
FROM node:21-alpine AS builder

# Install pnpm and curl
RUN apk add --no-cache curl && \
    corepack enable && \
    corepack prepare pnpm@8.15.4 --activate

WORKDIR /app

# Copy package files
COPY package.json ./
COPY . .

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Build the Next.js app
RUN pnpm build

# Production image
FROM node:21-alpine AS runner

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/node_modules ./node_modules

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Add healthcheck using the service URL
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f "${NEXT_PUBLIC_URL:-http://localhost:8080}/api/health" || exit 1

EXPOSE 8080

# Start Next.js
CMD ["node_modules/.bin/next", "start", "-p", "8080"]
