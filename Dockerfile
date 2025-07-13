# Multi-stage build for OntoSeed production deployment
# Stage A: circom-builder - glibc-based for circom binary compatibility
FROM node:18-bookworm-slim AS circom-builder

# Install system dependencies for circom and snarkjs
RUN apt-get update && apt-get install -y \
    curl \
    bash \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install only circom-related dependencies
COPY package*.json ./
RUN npm ci --only=production=false

# Copy circuit files and build script
COPY circuits/ ./circuits/
COPY scripts/build-circuit.sh ./scripts/
RUN chmod +x ./scripts/build-circuit.sh

# Build circuits and generate keys (this is the heavy, cacheable step)
RUN ./scripts/build-circuit.sh

# Stage B: builder - Alpine for Next.js build
FROM node:18-alpine AS builder

# Install system dependencies for native modules
RUN apk add --no-cache python3 make g++ curl bash

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production=false

# Copy source code and build configurations
COPY . .

# Copy circuit artifacts from circom-builder
COPY --from=circom-builder /app/build ./build

# Build Next.js and TypeScript (skip circom build since we copied artifacts)
RUN npm run build:next && npm run build:lib

# Install production dependencies for runtime
RUN npm ci --only=production && npm cache clean --force

# Stage C: runner - minimal Alpine runtime
FROM node:18-alpine AS runner

# Install runtime dependencies
RUN apk add --no-cache python3 py3-pip curl \
    && PIP_BREAK_SYSTEM_PACKAGES=1 pip3 install --no-cache-dir pyshacl

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application and production dependencies
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/src/ontology ./src/ontology
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Create data directory with proper permissions
RUN mkdir -p ./data && chown nextjs:nodejs ./data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/validate || exit 1

# Start the application
CMD ["npm", "start"]