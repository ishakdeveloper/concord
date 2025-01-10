FROM elixir:1.17-alpine

# Install build dependencies
RUN apk add --no-cache build-base git curl

WORKDIR /app

# Copy mix files
COPY mix.exs mix.lock ./
COPY config config

# Install dependencies
RUN mix do deps.get, deps.compile

# Copy source code
COPY lib lib

# Compile the release
RUN mix do compile

ENV PORT=8080
ENV MIX_ENV=prod

# Add healthcheck using the service URL
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f "${URL:-http://localhost:8080}/health" || exit 1

CMD ["mix", "run", "--no-halt"] 