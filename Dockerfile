# Stage 1: Build frontend
FROM node:16-alpine AS frontend-build
WORKDIR /build
COPY web/package*.json ./web/
RUN cd web && npm install --legacy-peer-deps
COPY web/ ./web/
COPY simple-mind-map/ ./simple-mind-map/
COPY copy.js ./
RUN cd web && npm run build

# Stage 2: Runtime
FROM python:3.11-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends nginx supervisor redis-server && \
    rm -rf /var/lib/apt/lists/*

# Copy frontend build output
COPY --from=frontend-build /build/index.html /app/
COPY --from=frontend-build /build/dist /app/dist/

# Copy and install backend
COPY server/requirements.txt /app/server/requirements.txt
RUN pip install --no-cache-dir -r /app/server/requirements.txt

COPY server/app /app/server/app

# Copy config files
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY redis.conf /etc/redis/redis.conf

# Create data directories
RUN mkdir -p /app/data /app/data/redis

WORKDIR /app/server

ENV DATA_DIR=/app/data

EXPOSE 8080
VOLUME /app/data

CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
