# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create a custom nginx config
RUN echo 'worker_processes 1; \
events { worker_connections 1024; } \
http { \
    include /etc/nginx/mime.types; \
    server { \
        listen 80; \
        server_name localhost; \
        root /usr/share/nginx/html; \
        index index.html; \
        location / { \
            try_files $uri $uri/ /index.html; \
        } \
    } \
}' > /etc/nginx/nginx.conf

# Use a shell script to replace the port 80 with the Railway PORT and start nginx
CMD ["/bin/sh", "-c", "sed -i \"s/listen 80;/listen ${PORT:-80};/\" /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]
