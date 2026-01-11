# =============================================================================
# ANTEC Backend Dockerfile
# Multi-stage build for production-ready Node.js application
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Dependencies
# -----------------------------------------------------------------------------
FROM node:20-alpine AS deps

# Install necessary build tools for native dependencies (bcrypt)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including dev for potential build steps)
RUN npm ci --legacy-peer-deps || npm install

# -----------------------------------------------------------------------------
# Stage 2: Production
# -----------------------------------------------------------------------------
FROM node:20-alpine AS production

# Add labels for better maintainability
LABEL maintainer="Antik Mondal"
LABEL description="ANTEC Terminal Portfolio Backend API"
LABEL version="1.0.0"

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install only production dependencies
RUN npm ci --only=production --legacy-peer-deps || npm install --only=production

# Copy application source code
COPY --chown=nodejs:nodejs src ./src

# Set environment variables
ENV NODE_ENV=production

# Expose the application port (documentation only - Render injects its own PORT)
EXPOSE 3001

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://localhost:3001/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Start the application
CMD ["node", "src/index.js"]
