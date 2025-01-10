FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build if needed
RUN bun run build

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

# Expose the correct port
EXPOSE 8080

# Start the server
CMD ["bun", "run", "start"] 