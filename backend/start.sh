#!/bin/bash
set -e

# Set default port if not provided
export PORT=${PORT:-8000}

echo "Starting application on port $PORT"

# Start the application
exec gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:$PORT \
    --timeout 120 \
    --keep-alive 2 \
    --max-requests 1000 \
    --max-requests-jitter 50
