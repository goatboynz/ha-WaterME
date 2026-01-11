ARG BUILD_FROM
FROM $BUILD_FROM

# Install requirements for add-on
RUN \
  apk add --no-cache \
    python3 \
    py3-pip

# Copy root filesystem
COPY rootfs /

# Fix permissions for S6 run script
RUN chmod a+x /etc/services.d/waterme/run
