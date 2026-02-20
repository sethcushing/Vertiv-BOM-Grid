# Multi-stage Dockerfile for BOM Convergence Grid Application
# Optimized for Koyeb deployment

# ============================================
# Stage 1: Build Frontend
# ============================================
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files
COPY frontend/package.json frontend/yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile --production=false

# Copy frontend source
COPY frontend/ ./

# Build production frontend
ENV REACT_APP_BACKEND_URL=""
RUN yarn build

# ============================================
# Stage 2: Production Image
# ============================================
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Install additional production dependencies
RUN pip install --no-cache-dir gunicorn uvicorn[standard]

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/frontend/build ./static

# Create startup script
RUN echo '#!/bin/bash\n\
echo "Starting BOM Convergence Grid Application..."\n\
echo "MongoDB URL: ${MONGO_URL:0:20}..."\n\
echo "Port: ${PORT:-8000}"\n\
cd /app/backend && exec uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}\n\
' > /app/start.sh && chmod +x /app/start.sh

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/api/health || exit 1

# Start the application
CMD ["/app/start.sh"]
