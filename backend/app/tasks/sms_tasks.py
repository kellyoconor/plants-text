"""
SMS tasks for PlantTexts

These tasks handle:
- Sending care reminder SMS messages
- Processing incoming SMS responses
- Managing SMS delivery and retries
"""

from celery import current_app
from datetime import datetime, timedelta
from typing import Optional
import logging

from ..core.celery_app import celery_app
from ..core.config import settings

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, max_retries=3)
def send_care_reminder_sms(
    self, 
    user_phone: str, 
    plant_name: str, 
    care_type: str, 
    message: str,
    urgency: str = "medium"
):
    """
    Send a care reminder SMS to a user
    
    Args:
        user_phone: User's phone number
        plant_name: Name of the plant
        care_type: Type of care needed (watering, fertilizing, etc.)
        message: The personalized message to send
        urgency: Urgency level (low, medium, high, critical)
    """
    try:
        # For now, just log the message (we'll add Twilio integration next)
        logger.info(f"SMS to {user_phone}: {message}")
        
        # TODO: Add Twilio integration here
        # twilio_client = get_twilio_client()
        # twilio_client.messages.create(
        #     body=message,
        #     from_=settings.twilio_phone_number,
        #     to=user_phone
        # )
        
        # Simulate SMS sending for now
        result = {
            "status": "sent",
            "phone": user_phone,
            "plant_name": plant_name,
            "care_type": care_type,
            "message": message,
            "urgency": urgency,
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info(f"SMS sent successfully to {user_phone} for {plant_name}")
        return result
        
    except Exception as exc:
        logger.error(f"Error sending SMS to {user_phone}: {str(exc)}")
        
        # Retry with exponential backoff, but don't retry forever
        if self.request.retries < self.max_retries:
            # Wait longer for each retry: 1min, 2min, 4min
            countdown = 60 * (2 ** self.request.retries)
            logger.info(f"Retrying SMS to {user_phone} in {countdown} seconds")
            raise self.retry(exc=exc, countdown=countdown)
        else:
            # Max retries reached, log failure
            logger.error(f"Failed to send SMS to {user_phone} after {self.max_retries} retries")
            return {
                "status": "failed",
                "phone": user_phone,
                "error": str(exc),
                "retries": self.request.retries
            }

@celery_app.task(bind=True, max_retries=2)
def send_thank_you_sms(self, user_phone: str, plant_name: str, care_type: str):
    """
    Send a thank you message after user completes care action
    
    Args:
        user_phone: User's phone number
        plant_name: Name of the plant
        care_type: Type of care that was completed
    """
    try:
        # Generate thank you message (will be AI-powered later)
        thank_you_messages = {
            "watering": f"Thanks for the water! I'm feeling refreshed! 💧 - {plant_name}",
            "fertilizing": f"Mmm, nutrients! Thanks for the fertilizer! 🌱 - {plant_name}",
            "repotting": f"A new home! Thanks for the fresh soil! 🏠 - {plant_name}"
        }
        
        message = thank_you_messages.get(care_type, f"Thanks for taking care of me! 💚 - {plant_name}")
        
        # For now, just log (will add Twilio integration)
        logger.info(f"Thank you SMS to {user_phone}: {message}")
        
        # TODO: Add Twilio integration
        
        return {
            "status": "sent",
            "phone": user_phone,
            "plant_name": plant_name,
            "care_type": care_type,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as exc:
        logger.error(f"Error sending thank you SMS to {user_phone}: {str(exc)}")
        raise self.retry(exc=exc, countdown=30)

@celery_app.task
def process_incoming_sms(phone_number: str, message_body: str):
    """
    Process incoming SMS messages from users
    
    Args:
        phone_number: User's phone number
        message_body: Content of the SMS message
    """
    try:
        logger.info(f"Processing SMS from {phone_number}: {message_body}")
        
        # Parse the message for care actions
        message_lower = message_body.lower().strip()
        
        # Look for care action keywords
        care_actions = {
            "watered": "watering",
            "fertilized": "fertilizing", 
            "repotted": "repotting",
            "misted": "misting"
        }
        
        detected_action = None
        for keyword, action in care_actions.items():
            if keyword in message_lower:
                detected_action = action
                break
        
        if detected_action:
            # Extract plant name (simple approach for now)
            plant_name = "your plant"  # TODO: Improve plant name extraction
            
            # TODO: Record the care action in database
            # record_care_action(phone_number, plant_name, detected_action)
            
            # Send thank you message
            send_thank_you_sms.delay(phone_number, plant_name, detected_action)
            
            return {
                "status": "processed",
                "phone": phone_number,
                "action_detected": detected_action,
                "plant_name": plant_name
            }
        else:
            # Didn't recognize the message
            logger.info(f"No care action detected in message from {phone_number}")
            return {
                "status": "no_action_detected",
                "phone": phone_number,
                "message": message_body
            }
            
    except Exception as exc:
        logger.error(f"Error processing SMS from {phone_number}: {str(exc)}")
        return {
            "status": "error",
            "phone": phone_number,
            "error": str(exc)
        }

# Utility tasks
@celery_app.task
def cleanup_old_sms_logs():
    """Clean up old SMS logs and results"""
    try:
        # TODO: Implement cleanup of old SMS logs
        logger.info("SMS log cleanup completed")
        return {"status": "completed", "timestamp": datetime.now().isoformat()}
    except Exception as exc:
        logger.error(f"Error during SMS cleanup: {str(exc)}")
        return {"status": "error", "error": str(exc)}
