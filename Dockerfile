# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
# Pastikan VITE_API_URL sudah sesuai (bisa diatur via Railway Environment Variables)
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create a custom nginx config to handle SPA routing and Railway's PORT
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Railway provides the PORT environment variable. Nginx needs to listen on it.
# We use a script to replace the port 80 with $PORT at runtime.
CMD sed -i "s/listen 80;/listen ${PORT:-80};/" /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'
