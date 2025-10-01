"""
Celery configuration for PlantTexts background tasks

This handles:
- Daily care reminder checks
- SMS message sending
- Background AI message generation
- Scheduled maintenance tasks
"""

from celery import Celery
from .config import settings

# Create Celery instance
celery_app = Celery(
    "planttexts",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=[
        "app.tasks.care_reminders",
        "app.tasks.sms_tasks",
    ]
)

# Celery configuration
celery_app.conf.update(
    # Task routing
    task_routes={
        "app.tasks.care_reminders.*": {"queue": "care_reminders"},
        "app.tasks.sms_tasks.*": {"queue": "sms"},
    },
    
    # Timezone settings
    timezone="UTC",
    enable_utc=True,
    
    # Task settings
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    
    # Result backend settings
    result_expires=3600,  # 1 hour
    
    # Worker settings
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    
    # Beat schedule for periodic tasks
    beat_schedule={
        "check-care-reminders": {
            "task": "app.tasks.care_reminders.check_all_plants_daily",
            "schedule": 60.0 * 60.0 * 24.0,  # Every 24 hours
            "options": {"queue": "care_reminders"}
        },
        "cleanup-old-tasks": {
            "task": "app.tasks.maintenance.cleanup_old_results",
            "schedule": 60.0 * 60.0 * 6.0,  # Every 6 hours
            "options": {"queue": "maintenance"}
        }
    },
)

# Import tasks to register them
try:
    from app.tasks import care_reminders, sms_tasks
except ImportError:
    # Tasks not created yet, that's okay
    pass
