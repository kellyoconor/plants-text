"""
Care reminder tasks for PlantTexts

These tasks run in the background to:
- Check which plants need care
- Generate personalized reminder messages
- Schedule SMS delivery
"""

from celery import current_app
from datetime import datetime, timedelta
from typing import List, Dict
import logging

from ..core.celery_app import celery_app
from ..core.database import SessionLocal
from ..models.plants import User, UserPlant
from ..services.care_scheduler import CareScheduleEngine
from .sms_tasks import send_care_reminder_sms

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, max_retries=3)
def check_all_plants_daily(self):
    """
    Daily task to check all plants and send care reminders
    
    This runs every 24 hours and:
    1. Gets all active users
    2. Checks their plants for due care
    3. Generates personalized messages
    4. Schedules SMS delivery
    """
    try:
        db = SessionLocal()
        
        # Get all active users
        active_users = db.query(User).filter(User.is_active == True).all()
        
        total_reminders = 0
        total_users = len(active_users)
        
        logger.info(f"Checking care reminders for {total_users} active users")
        
        for user in active_users:
            try:
                # Process each user's plants directly (avoid recursive Celery calls)
                result = check_user_plants_for_care(user.id)
                if result.get("sms_scheduled", 0) > 0:
                    total_reminders += result["sms_scheduled"]
                
            except Exception as e:
                logger.error(f"Error processing user {user.id}: {str(e)}")
                continue
        
        db.close()
        
        logger.info(f"Scheduled care checks for {total_reminders} users")
        return {
            "status": "completed",
            "users_processed": total_users,
            "reminder_tasks_scheduled": total_reminders,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as exc:
        logger.error(f"Daily care check failed: {str(exc)}")
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))

@celery_app.task(bind=True, max_retries=3)
def check_user_plants_for_care(self, user_id: int):
    """
    Check a specific user's plants for care reminders
    
    Args:
        user_id: The user ID to check plants for
    """
    try:
        db = SessionLocal()
        
        # Get user and their plants
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.warning(f"User {user_id} not found")
            return {"status": "user_not_found"}
        
        user_plants = db.query(UserPlant).filter(
            UserPlant.user_id == user_id,
            UserPlant.is_active == True
        ).all()
        
        if not user_plants:
            logger.info(f"No active plants for user {user_id}")
            return {"status": "no_plants"}
        
        # Initialize care scheduler
        scheduler = CareScheduleEngine()
        
        # Convert plants to scheduler format
        plant_data = []
        for plant in user_plants:
            plant_data.append({
                "id": plant.id,
                "nickname": plant.nickname,
                "common_name": plant.plant_catalog.name,
                "last_watered": plant.last_watered or datetime.now() - timedelta(days=30),
                "created_at": plant.created_at,
                "last_fertilized": plant.last_fertilized
            })
        
        # Get due reminders
        due_reminders = scheduler.get_due_reminders(plant_data)
        
        # Filter for reminders that should be sent now
        reminders_to_send = []
        for reminder in due_reminders:
            # Only send if urgency is medium or higher
            if reminder.urgency in ["medium", "high", "critical"]:
                reminders_to_send.append(reminder)
        
        # Schedule SMS for each reminder
        sms_tasks_scheduled = 0
        for reminder in reminders_to_send:
            try:
                # Schedule SMS delivery
                send_care_reminder_sms.delay(
                    user_phone=user.phone,
                    plant_name=reminder.plant_name,
                    care_type=reminder.care_type,
                    message=reminder.message,
                    urgency=reminder.urgency
                )
                sms_tasks_scheduled += 1
                
            except Exception as e:
                logger.error(f"Error scheduling SMS for user {user_id}, plant {reminder.plant_name}: {str(e)}")
                continue
        
        db.close()
        
        result = {
            "status": "completed",
            "user_id": user_id,
            "plants_checked": len(user_plants),
            "reminders_found": len(due_reminders),
            "sms_scheduled": sms_tasks_scheduled,
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info(f"User {user_id}: {len(due_reminders)} reminders, {sms_tasks_scheduled} SMS scheduled")
        return result
        
    except Exception as exc:
        logger.error(f"Error checking plants for user {user_id}: {str(exc)}")
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))

@celery_app.task(bind=True)
def generate_personalized_message(self, plant_context: Dict, message_type: str = "care_reminder"):
    """
    Generate a personalized message for a plant using AI
    
    Args:
        plant_context: Context about the plant (personality, care status, etc.)
        message_type: Type of message to generate
    
    Returns:
        Generated message string
    """
    try:
        # This will be implemented when we add OpenAI integration
        # For now, return a basic message
        
        plant_name = plant_context.get("plant_name", "Your plant")
        care_type = plant_context.get("care_type", "care")
        
        # Basic message generation (will be replaced with AI)
        if message_type == "care_reminder":
            return f"{plant_name} needs {care_type}! 🌱"
        elif message_type == "thank_you":
            return f"Thanks for taking care of me! - {plant_name} 💚"
        else:
            return f"Hello from {plant_name}! 🌿"
            
    except Exception as exc:
        logger.error(f"Error generating message: {str(exc)}")
        return f"Your plant needs some attention! 🌱"

# Test task for development
@celery_app.task
def test_task(message: str = "Hello from Celery!"):
    """Simple test task to verify Celery is working"""
    logger.info(f"Test task executed: {message}")
    return {
        "message": message,
        "timestamp": datetime.now().isoformat(),
        "status": "success"
    }
