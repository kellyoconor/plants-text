"""
SMS Processing Service

Handles parsing and processing of incoming SMS messages:
- User lookup by phone number
- Plant name extraction from messages
- Care action detection and recording
"""

import re
from datetime import datetime
from typing import Optional, Tuple, List, Dict
from sqlalchemy.orm import Session

from ..core.database import SessionLocal
from ..models.plants import User, UserPlant, CareHistory
from ..services.care_scheduler import CareScheduleEngine
from ..services.verification_service import VerificationService

class SMSProcessor:
    """Service for processing incoming SMS messages"""
    
    def __init__(self):
        self.care_actions = {
            "watered": "watering",
            "fertilized": "fertilizing", 
            "repotted": "repotting",
            "misted": "misting",
            "pruned": "pruning"
        }
    
    def find_user_by_phone(self, phone_number: str) -> Optional[User]:
        """
        Find user by phone number
        
        Args:
            phone_number: Phone number in any format (+1234567890, 123-456-7890, etc.)
            
        Returns:
            User object or None if not found
        """
        db = SessionLocal()
        try:
            # Clean phone number - remove all non-digits
            clean_phone = re.sub(r'\D', '', phone_number)
            
            # Try exact match first
            user = db.query(User).filter(User.phone == phone_number).first()
            if user:
                return user
            
            # Try with cleaned number
            user = db.query(User).filter(User.phone == clean_phone).first()
            if user:
                return user
            
            # Try with +1 prefix
            if len(clean_phone) == 10:
                user = db.query(User).filter(User.phone == f"+1{clean_phone}").first()
                if user:
                    return user
            
            # Try without +1 prefix
            if clean_phone.startswith('1') and len(clean_phone) == 11:
                user = db.query(User).filter(User.phone == clean_phone[1:]).first()
                if user:
                    return user
            
            return None
            
        finally:
            db.close()
    
    def get_user_plants(self, user: User) -> List[UserPlant]:
        """
        Get all active plants for a user
        
        Args:
            user: User object
            
        Returns:
            List of UserPlant objects
        """
        db = SessionLocal()
        try:
            plants = db.query(UserPlant).filter(
                UserPlant.user_id == user.id,
                UserPlant.is_active == True
            ).all()
            return plants
        finally:
            db.close()
    
    def extract_plant_name(self, message: str, user_plants: List[UserPlant]) -> Optional[str]:
        """
        Extract plant name from SMS message
        
        Args:
            message: SMS message text
            user_plants: List of user's plants
            
        Returns:
            Plant nickname if found, None otherwise
        """
        message_lower = message.lower().strip()
        
        # Look for exact nickname matches first
        for plant in user_plants:
            nickname_lower = plant.nickname.lower()
            
            # Exact match
            if nickname_lower in message_lower:
                return plant.nickname
        
        # Look for plant type matches
        for plant in user_plants:
            plant_type_lower = plant.plant_catalog.name.lower()
            
            # Check if plant type is mentioned
            if plant_type_lower in message_lower:
                return plant.nickname
        
        # Look for partial matches (fuzzy matching)
        for plant in user_plants:
            nickname_lower = plant.nickname.lower()
            
            # Check if any word in the message matches part of the nickname
            message_words = message_lower.split()
            nickname_words = nickname_lower.split()
            
            for msg_word in message_words:
                for nick_word in nickname_words:
                    if len(msg_word) >= 3 and len(nick_word) >= 3:
                        if msg_word in nick_word or nick_word in msg_word:
                            return plant.nickname
        
        return None
    
    def detect_care_action(self, message: str) -> Optional[str]:
        """
        Detect care action from SMS message
        
        Args:
            message: SMS message text
            
        Returns:
            Care action type or None if not detected
        """
        message_lower = message.lower().strip()
        
        # Look for care action keywords
        for keyword, action in self.care_actions.items():
            if keyword in message_lower:
                return action
        
        # Look for variations
        care_variations = {
            "water": "watering",
            "fed": "fertilizing",
            "feed": "fertilizing",
            "repot": "repotting",
            "mist": "misting",
            "spray": "misting",
            "trim": "pruning",
            "cut": "pruning"
        }
        
        for keyword, action in care_variations.items():
            if keyword in message_lower:
                return action
        
        return None
    
    def record_care_action(self, user: User, plant_nickname: str, care_type: str) -> bool:
        """
        Record care action in database
        
        Args:
            user: User object
            plant_nickname: Name of the plant
            care_type: Type of care performed
            
        Returns:
            True if successful, False otherwise
        """
        db = SessionLocal()
        try:
            # Find the plant
            plant = db.query(UserPlant).filter(
                UserPlant.user_id == user.id,
                UserPlant.nickname == plant_nickname,
                UserPlant.is_active == True
            ).first()
            
            if not plant:
                return False
            
            # Update plant's last care date
            now = datetime.now()
            if care_type == "watering":
                plant.last_watered = now
            elif care_type == "fertilizing":
                plant.last_fertilized = now
            
            # Create care history record
            care_history = CareHistory(
                user_plant_id=plant.id,
                task_type=care_type,
                completed_at=now,
                method="sms",
                notes=f"Recorded via SMS response"
            )
            
            db.add(care_history)
            db.commit()
            
            return True
            
        except Exception as e:
            db.rollback()
            print(f"Error recording care action: {str(e)}")
            return False
        finally:
            db.close()
    
    def process_sms_message(self, phone_number: str, message_body: str) -> Dict:
        """
        Process complete SMS message
        
        Args:
            phone_number: User's phone number
            message_body: SMS message content
            
        Returns:
            Processing result dictionary
        """
        # Find user
        user = self.find_user_by_phone(phone_number)
        if not user:
            return {
                "status": "user_not_found",
                "phone": phone_number,
                "message": "User not found for this phone number"
            }
        
        # Check if this is a verification response
        if not user.phone_verified:
            # This is likely a verification response
            verification_service = VerificationService()
            verification_result = verification_service.verify_phone(phone_number)
            
            if verification_result["status"] == "verified":
                return {
                    "status": "phone_verified",
                    "phone": phone_number,
                    "user_id": user.id,
                    "message": "Phone number verified! You'll now receive care reminders from your plants.",
                    "contact_card_sent": True
                }
            else:
                return {
                    "status": "verification_failed",
                    "phone": phone_number,
                    "user_id": user.id,
                    "message": "Verification failed. Please try again."
                }
        
        # Get user's plants
        user_plants = self.get_user_plants(user)
        if not user_plants:
            return {
                "status": "no_plants",
                "phone": phone_number,
                "user_id": user.id,
                "message": "User has no active plants"
            }
        
        # Detect care action
        care_action = self.detect_care_action(message_body)
        if not care_action:
            return {
                "status": "no_action_detected",
                "phone": phone_number,
                "user_id": user.id,
                "message": "No care action detected in message",
                "original_message": message_body
            }
        
        # Extract plant name
        plant_name = self.extract_plant_name(message_body, user_plants)
        if not plant_name:
            # If no specific plant found, but user has only one plant, use that
            if len(user_plants) == 1:
                plant_name = user_plants[0].nickname
            else:
                return {
                    "status": "plant_not_identified",
                    "phone": phone_number,
                    "user_id": user.id,
                    "care_action": care_action,
                    "message": f"Could not identify which plant for {care_action}",
                    "available_plants": [p.nickname for p in user_plants],
                    "original_message": message_body
                }
        
        # Record care action
        success = self.record_care_action(user, plant_name, care_action)
        if not success:
            return {
                "status": "recording_failed",
                "phone": phone_number,
                "user_id": user.id,
                "plant_name": plant_name,
                "care_action": care_action,
                "message": "Failed to record care action in database"
            }
        
        return {
            "status": "success",
            "phone": phone_number,
            "user_id": user.id,
            "plant_name": plant_name,
            "care_action": care_action,
            "message": f"Successfully recorded {care_action} for {plant_name}",
            "original_message": message_body
        }
