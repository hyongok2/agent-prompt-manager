#!/bin/sh

# Replace API_URL placeholder with actual value from environment
if [ ! -z "$API_URL" ]; then
  echo "Setting API_URL to: $API_URL"
  sed -i "s|__API_URL__|$API_URL|g" /usr/share/nginx/html/config.js
else
  echo "Warning: API_URL not set, using default"
fi

# Start nginx
exec nginx -g 'daemon off;'
