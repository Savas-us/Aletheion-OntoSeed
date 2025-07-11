# Multi-stage build for OntoSeed production deployment
FROM node:18-alpine AS builder

# Install system dependencies for native modules and glibc compatibility
RUN apk add --no-cache python3 make g++ curl bash gcompat

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production=false

# Copy source code and build configurations
COPY . .

# Build the application (includes build:lib & build:circom)
RUN npm run build

# Install production dependencies for runtime
RUN npm ci --only=production && npm cache clean --force

# Production stage
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