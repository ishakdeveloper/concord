# syntax = docker/dockerfile:1

FROM oven/bun:1.1.38-slim AS base
WORKDIR /app

FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential pkg-config python-is-python3

# Copy package files
COPY package.json ./

# Install dependencies
RUN bun install

# Copy application code
COPY . .

# Build the application
RUN bun run build

# Final stage
FROM base

# Copy built application
COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json

ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080
CMD ["bun", "dist/index.js"]
