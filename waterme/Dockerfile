ARG BUILD_FROM

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Final Add-on Image
FROM $BUILD_FROM

# Install Python and dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip

COPY backend/requirements.txt /tmp/
RUN pip3 install --no-cache-dir -r /tmp/requirements.txt

# Copy backend code
COPY backend /app/backend

# Copy built frontend assets to /www
COPY --from=frontend-build /app/dist /www

# Copy rootfs (S6 services)
COPY rootfs /

# Fix permissions for S6 run script
RUN chmod a+x /etc/services.d/waterme/run

# Set workdir
WORKDIR /app
