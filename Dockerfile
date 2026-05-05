# ============================================================
# Build Stage
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (layer caching)
COPY package*.json ./

# Install all dependencies (needed for build)
RUN npm ci

# Copy source code
COPY . .

# Pass build-time environment variables for Vite
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the Vite app
RUN npm run build

# ============================================================
# Production Stage
# ============================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install only express (lightweight static server)
RUN npm install --save express

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Write the Express server file properly (avoid shell escaping issues)
COPY <<'EOF' server.js
const express = require('express');
const path = require('path');

const app = express();

// Railway injects PORT automatically — fallback to 8080
const PORT = process.env.PORT || 8080;

// Serve static files from Vite build output
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1d',
  etag: true,
}));

// SPA fallback: serve index.html for all unmatched routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Admin Frontend is running on port ${PORT}`);
});
EOF

# Tell Railway/Docker what port this container listens on
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
