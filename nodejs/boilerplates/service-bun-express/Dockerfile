# Multi-stage Dockerfile 
# Stage 1: Build stage
FROM oven/bun:latest AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies including dev dependencies for building
RUN bun install --frozen-lockfile

# Copy source code and configuration files
COPY . .

# Full check and build the application
RUN bun type-check
RUN bun lint
RUN bun test
RUN bun run build

# Stage 2: Production stage
FROM oven/bun:latest AS production

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install only production dependencies
RUN bun install --frozen-lockfile --production && \
    bun pm cache rm

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist


# Change ownership to bun user (the existing user in bun image)
RUN chown -R bun:bun /app

# Switch to non-root user
USER bun

# Expose the port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD bun run --bun -e "fetch('http://localhost:3000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Start the application
CMD ["bun", "run", "start"]