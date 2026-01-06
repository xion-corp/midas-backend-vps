# ============================================
# Stage 1: Dependencies (All deps for build)
# ============================================
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev for build)
RUN npm ci

# ============================================
# Stage 2: Build
# ============================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy all dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy package files
COPY package*.json ./

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ============================================
# Stage 3: Production (Only production deps)
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/main"]
