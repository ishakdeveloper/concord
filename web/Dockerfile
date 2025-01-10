# Use Node.js LTS
FROM node:21-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate

# Copy workspace files
COPY package.json pnpm-workspace.yaml ./
COPY web/package.json web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate

# Copy files
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/web/node_modules ./web/node_modules
COPY . .

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build Next.js
WORKDIR /app/web
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app/web

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set environment variables
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy necessary files
COPY --from=builder /app/web/public ./public
COPY --from=builder /app/web/.next/static ./.next/static
COPY --from=builder /app/web/.next/types ./.next/types
COPY --from=builder /app/web/node_modules ./node_modules
COPY --from=builder /app/web/package.json ./package.json
COPY --from=builder /app/web/.next/BUILD_ID ./.next/BUILD_ID

# Set the correct permission for prerender cache
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["pnpm", "start"]
