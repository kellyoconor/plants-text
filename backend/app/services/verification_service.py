"""
Phone verification service for PlantTexts

Handles:
- Sending welcome messages with verification requests
- Processing verification responses
- Sending contact cards after verification
"""

from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from ..core.database import SessionLocal
from ..models.plants import User, UserPlant
from ..tasks.sms_tasks import send_care_reminder_sms
import logging

logger = logging.getLogger(__name__)

class VerificationService:
    """Service for handling phone verification flow"""
    
    def __init__(self, db: Session = None):
        self.db = db or SessionLocal()
    
    def send_welcome_message(self, user_id: int) -> Dict[str, Any]:
        """
        Send welcome message to new user with verification request
        
        Args:
            user_id: The user ID to send welcome message to
            
        Returns:
            Dict with status and message details
        """
        try:
            # Get user and their first plant
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                return {"status": "error", "message": "User not found"}
            
            # Get user's first plant
            first_plant = self.db.query(UserPlant).filter(
                UserPlant.user_id == user_id,
                UserPlant.is_active == True
            ).first()
            
            if not first_plant:
                return {"status": "error", "message": "No plants found for user"}
            
            # Create personalized welcome message
            plant_name = first_plant.nickname or first_plant.plant_catalog.name
            plant_personality = first_plant.personality_type.name if first_plant.personality_type else "friendly"
            
            welcome_message = self._create_welcome_message(plant_name, plant_personality)
            
            # Send the welcome message
            result = send_care_reminder_sms.delay(
                user_phone=user.phone,
                plant_name=plant_name,
                care_type="welcome",
                message=welcome_message,
                urgency="low"
            )
            
            logger.info(f"Welcome message sent to user {user_id} for plant {plant_name}")
            
            return {
                "status": "sent",
                "user_id": user_id,
                "plant_name": plant_name,
                "message": welcome_message,
                "task_id": result.id,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error sending welcome message to user {user_id}: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def _create_welcome_message(self, plant_name: str, personality: str) -> str:
        """Create personalized welcome message based on plant personality"""
        
        # Personality-based welcome messages
        welcome_templates = {
            "sarcastic": f"Hey there! I'm {plant_name} 🌱\n\nI'm your new plant buddy, and I'm here to remind you when I need water (which is probably more often than you think).\n\nReply 'YES' to confirm you got this message, and I'll start sending you care reminders! 💚\n\n(Don't worry, I'm not as needy as I sound... mostly)",
            "dramatic": f"🌟 Hello! I'm {plant_name} 🌟\n\nI'm SO excited to be your new plant companion! I promise to be the most dramatic plant you've ever met (in the best way).\n\nReply 'YES' to confirm you received this message, and I'll start sending you my fabulous care reminders! ✨\n\nCan't wait to grow together! 🌿",
            "chill": f"Hey! I'm {plant_name} 🌿\n\nNice to meet you! I'm pretty easygoing, but I do need some care every now and then.\n\nReply 'YES' to confirm you got this, and I'll send you gentle reminders when I need attention! 😊\n\nLooking forward to being your plant buddy! 💚",
            "high-maintenance": f"Hello darling! I'm {plant_name} 💎\n\nI'm your new high-maintenance plant friend, and I have very specific needs. But don't worry, I'll guide you through everything!\n\nReply 'YES' to confirm you received this message, and I'll start sending you my detailed care instructions! ✨\n\nI promise to make you a better plant parent! 🌱",
            "friendly": f"Hi! I'm {plant_name} 🌱\n\nI'm so happy to be your new plant buddy! I'm here to help you take care of me and grow together.\n\nReply 'YES' to confirm you got this message, and I'll start sending you friendly care reminders! 💚\n\nLet's make this plant-parenting journey amazing! 🌿",
            "wise": f"Greetings! I am {plant_name} 🌿\n\nI have been growing for many seasons, and I'm here to share my wisdom with you. Together, we'll create a beautiful growing relationship.\n\nReply 'YES' to confirm you received this message, and I'll begin sending you my thoughtful care guidance! 🌱\n\nMay we grow in harmony together! ✨",
            "playful": f"Hey hey! I'm {plant_name} 🌱\n\nI'm your new plant pal, and I'm super excited to be here! I love to play and grow, and I'll make sure you know when I need some TLC!\n\nReply 'YES' to confirm you got this message, and I'll start sending you fun care reminders! 🎉\n\nLet's have a blast growing together! 💚"
        }
        
        # Default to friendly if personality not found
        return welcome_templates.get(personality.lower(), welcome_templates["friendly"])
    
    def verify_phone(self, phone_number: str) -> Dict[str, Any]:
        """
        Mark user's phone as verified when they respond to welcome message
        
        Args:
            phone_number: The phone number to verify
            
        Returns:
            Dict with verification status
        """
        try:
            # Find user by phone number
            user = self.db.query(User).filter(User.phone == phone_number).first()
            if not user:
                return {"status": "error", "message": "User not found"}
            
            # Mark phone as verified
            user.phone_verified = True
            user.verified_at = datetime.now()
            self.db.commit()
            
            logger.info(f"Phone verified for user {user.id} ({phone_number})")
            
            # Send contact card after verification
            self._send_contact_card(user.id)
            
            return {
                "status": "verified",
                "user_id": user.id,
                "phone": phone_number,
                "verified_at": user.verified_at.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error verifying phone {phone_number}: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def _send_contact_card(self, user_id: int):
        """Send contact card after phone verification"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                return
            
            # Create contact card message
            contact_message = self._create_contact_card_message()
            
            # Send contact card
            send_care_reminder_sms.delay(
                user_phone=user.phone,
                plant_name="PlantTexts Team",
                care_type="contact_card",
                message=contact_message,
                urgency="low"
            )
            
            logger.info(f"Contact card sent to user {user_id}")
            
        except Exception as e:
            logger.error(f"Error sending contact card to user {user_id}: {str(e)}")
    
    def _create_contact_card_message(self) -> str:
        """Create contact card message with app information"""
        return """📱 PlantTexts Contact Card

🌱 PlantTexts - Your Plant Care Companion
📞 +1 (555) PLANT-01
🌐 https://plants-text-production.up.railway.app
📧 hello@planttexts.com

💚 Thanks for joining our plant family! 
🌿 We'll send you personalized care reminders from your plants.

Need help? Just reply to any message!
Happy growing! 🌱✨"""
    
    def is_user_verified(self, user_id: int) -> bool:
        """Check if user's phone is verified"""
        user = self.db.query(User).filter(User.id == user_id).first()
        return user.phone_verified if user else False
