FROM elixir:1.16-alpine AS builder

# Install build dependencies
RUN apk add --no-cache build-base git wget

WORKDIR /app

# Copy mix files
COPY mix.exs mix.lock ./

# Install hex and rebar
RUN mix local.hex --force && \
    mix local.rebar --force

# Install dependencies
RUN mix deps.get --only prod

# Copy config files
COPY config config

# Copy lib files
COPY lib lib

# Copy priv files
COPY priv priv

# Compile the release
RUN mix do compile, release

# Start a new build stage
FROM alpine:3.19

RUN apk add --no-cache libstdc++ ncurses-libs wget

WORKDIR /app

# Copy the release from the builder
COPY --from=builder /app/_build/prod/rel/ws ./

ENV PORT=8080
ENV MIX_ENV=prod

# Add health check with increased initial grace period
HEALTHCHECK --interval=30s --timeout=20s --start-period=120s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

EXPOSE 8080
CMD ["bin/ws", "start"] 