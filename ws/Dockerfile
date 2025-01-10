FROM elixir:1.17-alpine

# Install build dependencies
RUN apk add --no-cache build-base git

WORKDIR /app

# Copy mix.exs first
COPY mix.exs ./

# Create empty mix.lock if it doesn't exist
RUN touch mix.lock

# Copy config files
COPY config config

# Install hex package manager and rebar
RUN mix local.hex --force && \
    mix local.rebar --force

# Install dependencies
RUN mix deps.get

# Copy application code
COPY . .

# Compile the project
RUN MIX_ENV=prod mix compile

EXPOSE 8080

ENV PORT=8080
ENV MIX_ENV=prod

CMD ["mix", "run", "--no-halt"] 