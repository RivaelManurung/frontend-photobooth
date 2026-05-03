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
FROM node:20-alpine

WORKDIR /app

# Install express for serving static files
RUN npm install express

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Create a simple express server
RUN echo "const express = require('express'); \
const path = require('path'); \
const app = express(); \
const port = process.env.PORT || 8080; \
app.use(express.static(path.join(__dirname, 'dist'))); \
app.use((req, res) => { \
  res.sendFile(path.join(__dirname, 'dist', 'index.html')); \
}); \
app.listen(port, '0.0.0.0', () => { \
  console.log('🚀 Admin Frontend is running on port ' + port); \
});" > server.js

# Start the server
CMD ["node", "server.js"]
