# Stage 1: Build production React assets
FROM node:20-alpine AS builder

WORKDIR /app

# Install npm dependencies
COPY package*.json ./
RUN npm ci || npm install

# Build the production bundle
COPY . .
RUN npm run build

# Stage 2: High-performance Nginx production web server
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/

# Copy built artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose web port
EXPOSE 80

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
