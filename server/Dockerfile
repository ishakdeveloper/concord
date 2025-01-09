# Build stage
FROM oven/bun:1 AS build

WORKDIR /app

# Cache packages
COPY package.json package.json
COPY pnpm-workspace.yaml pnpm-workspace.yaml

# Create empty lockfile if it doesn't exist
RUN touch bun.lockb

# Copy package files
COPY server/package.json ./server/package.json

# Install dependencies
RUN cd server && bun install --no-save

# Copy source code
COPY server ./server

ENV NODE_ENV=production

# Build and compile to binary
RUN cd server && bun build \
    --compile \
    --minify-whitespace \
    --minify-syntax \
    --target bun \
    --outfile server \
    ./src/index.ts

# Production stage
FROM gcr.io/distroless/base

WORKDIR /app

# Copy the compiled binary
COPY --from=build /app/server/server ./server

# Copy environment files if needed
COPY server/.env.* ./

ENV NODE_ENV=production

# Create a non-root user
USER nonroot:nonroot

EXPOSE 3001

CMD ["./server"] 