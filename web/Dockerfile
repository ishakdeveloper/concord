# Use Node.js base image
FROM node:21-alpine AS builder

# Install pnpm and curl
RUN apk add --no-cache curl && \
    corepack enable && \
    corepack prepare pnpm@8.15.4 --activate

WORKDIR /app

# Copy package files first
COPY package.json pnpm-lock.yaml ./

# Install dependencies with specific flags for production
RUN pnpm install --frozen-lockfile --prod

# Copy source files
COPY . .

# Build the Next.js app with specific environment
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN pnpm build

# Production image
FROM node:21-alpine AS runner

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# Add healthcheck with increased timeouts
HEALTHCHECK --interval=30s --timeout=30s --start-period=180s --retries=3 \
  CMD curl -f "${NEXT_PUBLIC_URL:-http://localhost:8080}/api/health" || exit 1

EXPOSE 8080

# Start Next.js with optimized flags
CMD ["node", "server.js"]
