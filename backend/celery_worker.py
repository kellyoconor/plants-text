#!/usr/bin/env python3
"""
Celery worker startup script for PlantTexts

Usage:
    python celery_worker.py

This starts a Celery worker that processes background tasks for:
- Care reminders
- SMS sending
- AI message generation
"""

import os
import sys

# Add the app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.core.celery_app import celery_app

if __name__ == '__main__':
    # Start the Celery worker
    celery_app.start()
