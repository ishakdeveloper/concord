FROM elixir:1.16-alpine AS builder

# Install build dependencies
RUN apk add --no-cache build-base git

WORKDIR /app

# Copy mix files
COPY mix.exs mix.lock ./

# Install hex and rebar
RUN mix local.hex --force && \
    mix local.rebar --force

# Install dependencies
RUN mix deps.get --only prod && \
    mix deps.compile

# Copy application code
COPY . .

# Compile the application
ENV MIX_ENV=prod
RUN mix compile && \
    mix release

# Production image
FROM alpine:3.19

RUN apk add --no-cache libstdc++ ncurses-libs

WORKDIR /app

# Copy the release from the builder
COPY --from=builder /app/_build/prod/rel/ws ./

ENV PORT=8080
ENV MIX_ENV=prod

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

EXPOSE 8080
CMD ["bin/ws", "start"] 