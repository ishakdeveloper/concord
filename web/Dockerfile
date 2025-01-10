# Use Node.js base image
FROM node:21-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml ./
COPY . .

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Build the Next.js app
RUN cd web && pnpm build

# Production image
FROM node:21-alpine AS runner

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/web/.next ./.next
COPY --from=builder /app/web/public ./public
COPY --from=builder /app/web/package.json ./package.json
COPY --from=builder /app/web/next.config.js ./next.config.js
COPY --from=builder /app/node_modules ./node_modules

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

# Start Next.js
CMD ["node_modules/.bin/next", "start"]
