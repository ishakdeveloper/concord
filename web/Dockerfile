# Use Node.js base image
FROM node:21-alpine AS builder

# Install pnpm and curl
RUN apk add --no-cache curl && \
    corepack enable && \
    corepack prepare pnpm@8.15.4 --activate

WORKDIR /app

# Copy package files first
COPY package.json ./

# Clean install dependencies without lockfile
RUN rm -rf node_modules && \
    NODE_ENV=production HUSKY=0 pnpm install --prod --no-frozen-lockfile

# Copy source files (excluding node_modules)
COPY . .

# Build with specific settings
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application
RUN HUSKY=0 pnpm build

# Production image
FROM node:21-alpine AS runner

WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
ENV HUSKY=0

# Switch to non-root user
USER nextjs

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=180s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

EXPOSE 8080

# Start Next.js using the standard next start command
CMD ["pnpm", "start"]
