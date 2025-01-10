# Build stage
FROM oven/bun:1 AS build

WORKDIR /app

# Copy root workspace files first
COPY package.json .
COPY pnpm-workspace.yaml .
COPY bun.lockb .

# Copy server package files
COPY package.json server/
COPY src server/src
COPY tsconfig.json server/

# Install dependencies
WORKDIR /app/server
RUN bun install --no-save

ENV NODE_ENV=production

# Build and compile to binary
RUN bun build \
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
COPY .env.* ./

ENV NODE_ENV=production

# Create a non-root user
USER nonroot:nonroot

EXPOSE 3001

CMD ["./server"] 