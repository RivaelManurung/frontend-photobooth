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

# Create a very simple and robust nginx config
RUN echo 'worker_processes 1; \
daemon off; \
events { worker_connections 1024; } \
http { \
    include /etc/nginx/mime.types; \
    sendfile on; \
    server { \
        listen ${PORT}; \
        root /usr/share/nginx/html; \
        index index.html; \
        location / { \
            try_files $uri $uri/ /index.html; \
        } \
    } \
}' > /etc/nginx/nginx.conf.template

# We use a custom CMD to ensure envsubst runs correctly on our custom config
CMD ["/bin/sh", "-c", "envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx -c /etc/nginx/nginx.conf"]
