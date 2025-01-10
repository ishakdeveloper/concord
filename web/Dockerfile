# Use Node.js base image
FROM node:21-alpine AS builder

# Install pnpm and curl
RUN apk add --no-cache curl && \
    corepack enable && \
    corepack prepare pnpm@8.15.4 --activate

WORKDIR /app

# Copy package files first
COPY package.json ./

# Install dependencies
RUN pnpm install --prod

# Copy source files
COPY . .

# Build the Next.js app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_SHARP_PATH=/app/node_modules/sharp

# Build with specific settings
RUN NODE_ENV=production pnpm build

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

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=180s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

EXPOSE 8080

# Start Next.js
CMD ["node", "server.js"]
