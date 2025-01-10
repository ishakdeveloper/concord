# syntax = docker/dockerfile:1

# Adjust BUN_VERSION as desired
ARG BUN_VERSION=1.1.38
FROM oven/bun:${BUN_VERSION}-slim AS base

LABEL fly_launch_runtime="Bun"

# Bun app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential pkg-config python-is-python3

# Copy application code first
COPY server/ ./

# Install dependencies
RUN bun install

# Build application
RUN bun run build

# Final stage for app image
FROM base

WORKDIR /app

# Copy built application
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

# Start the server by default, this can be overwritten at runtime
EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD [ "bun", "./dist/index.js" ]
