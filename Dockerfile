# ── Stage 1: Build Angular App ──────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (layer cache optimization)
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy source and build for production
COPY . .
RUN npm run build -- --configuration production

# ── Stage 2: Serve with Nginx ────────────────────────────────────────
FROM nginx:1.25-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular app from builder stage
COPY --from=builder /app/dist/parkease-frontend/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
