"""
Plant Personality Engine - Makes plants talk with unique personalities
"""
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
from openai import OpenAI
from sqlalchemy.orm import Session

from ..core.config import settings
from ..models.plants import UserPlant, PersonalityType, ConversationSession, CareSchedule


class PersonalityEngine:
    """Core engine for generating plant personality responses"""
    
    def __init__(self, db: Session, openai_api_key: Optional[str] = None):
        self.db = db
        # Initialize OpenAI client (use env var or demo mode)
        api_key = openai_api_key or settings.openai_api_key
        if api_key and api_key != "your-openai-api-key-here":
            self.openai_client = OpenAI(api_key=api_key)
            self.demo_mode = False
        else:
            self.openai_client = None
            self.demo_mode = True
            print("⚠️  Running in DEMO MODE - No OpenAI API key provided")
    
    def generate_care_reminder(self, user_plant_id: int, task_type: str, context: Optional[Dict] = None) -> str:
        """Generate a personality-appropriate care reminder message"""
        
        # Get plant and personality info
        user_plant = self.db.query(UserPlant).filter(UserPlant.id == user_plant_id).first()
        if not user_plant:
            return "Time for some plant care!"
        
        plant_info = {
            "plant_name": user_plant.nickname,
            "plant_type": user_plant.plant_catalog.name,
            "species": user_plant.plant_catalog.species,
            "care_needs": user_plant.plant_catalog.care_requirements,
            "task_type": task_type,
            "personality_type": user_plant.personality.name,
            "difficulty": user_plant.plant_catalog.difficulty_level
        }
        
        # Get conversation context
        conversation_context = self._get_conversation_context(user_plant_id)
        
        if self.demo_mode:
            return self._generate_demo_message(plant_info, task_type, conversation_context)
        
        return self._generate_ai_message(plant_info, task_type, conversation_context)
    
    def respond_to_user(self, user_plant_id: int, user_message: str) -> str:
        """Generate a personality response to user's message"""
        
        user_plant = self.db.query(UserPlant).filter(UserPlant.id == user_plant_id).first()
        if not user_plant:
            return "I'm not sure which plant you're talking to!"
        
        plant_info = {
            "plant_name": user_plant.nickname,
            "plant_type": user_plant.plant_catalog.name,
            "personality_type": user_plant.personality.name,
            "user_message": user_message
        }
        
        conversation_context = self._get_conversation_context(user_plant_id)
        
        if self.demo_mode:
            return self._generate_demo_response(plant_info, conversation_context)
        
        return self._generate_ai_response(plant_info, conversation_context)
    
    def _generate_ai_message(self, plant_info: Dict, task_type: str, context: Dict) -> str:
        """Generate message using OpenAI API"""
        
        # Get personality prompt template
        personality = self.db.query(PersonalityType).filter(
            PersonalityType.name == plant_info["personality_type"]
        ).first()
        
        if not personality:
            return f"Hey! {plant_info['plant_name']} here. Time for {task_type}!"
        
        # Build the system prompt
        system_prompt = personality.prompt_template.format(
            plant_name=plant_info["plant_name"],
            plant_type=plant_info["plant_type"],
            care_needs=json.dumps(plant_info["care_needs"]),
            task_type=task_type
        )
        
        # Build context message
        context_msg = ""
        care_history = ""
        if context.get("recent_messages"):
            recent = context['recent_messages'][-3:]
            context_msg = f"Recent conversation: {[msg['message'] for msg in recent]}"
        
        # Check if this plant has been cared for recently
        if context.get("last_care_completion"):
            care_history = f"Last {task_type}: {context['last_care_completion']}"
        
        user_prompt = f"""Generate a care reminder message for {task_type}.
        
        Plant details:
        - Name: {plant_info['plant_name']}
        - Type: {plant_info['plant_type']} ({plant_info['species']})
        - Care frequency: every {plant_info['care_needs'].get('watering_frequency_days', 7)} days
        
        Context: {context_msg}
        {care_history}
        
        Guidelines:
        - Stay perfectly in character as {plant_info['personality_type']} personality
        - Keep message under 160 characters (SMS friendly)
        - Be specific about {task_type}
        - Use the plant's name naturally
        - Make it delightful and personality-appropriate
        - If this is a repeat reminder, acknowledge it
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",  # Faster and cheaper for short messages
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=100,
                temperature=0.8
            )
            
            message = response.choices[0].message.content.strip()
            
            # Store message in conversation context
            self._update_conversation_context(user_plant_id, message, "care_reminder")
            
            return message
            
        except Exception as e:
            print(f"OpenAI API error: {e}")
            return self._generate_demo_message(plant_info, task_type, context)
    
    def _generate_ai_response(self, plant_info: Dict, context: Dict) -> str:
        """Generate response to user message using OpenAI API"""
        
        personality = self.db.query(PersonalityType).filter(
            PersonalityType.name == plant_info["personality_type"]
        ).first()
        
        if not personality:
            return f"Thanks for talking to me!"
        
        system_prompt = personality.prompt_template.format(
            plant_name=plant_info["plant_name"],
            plant_type=plant_info["plant_type"],
            care_needs="",
            task_type="conversation"
        )
        
        context_info = ""
        if context.get("recent_messages"):
            recent = context['recent_messages'][-2:]  # Last 2 messages for context
            context_info = f"Recent conversation: {[msg['message'] for msg in recent]}"
        
        user_prompt = f"""The user said: "{plant_info['user_message']}"
        
        {context_info}
        
        Respond as {plant_info['plant_name']} ({plant_info['plant_type']}) with {plant_info['personality_type']} personality.
        
        Guidelines:
        - Keep response under 160 characters (SMS friendly)
        - Stay perfectly in character
        - Be conversational and engaging
        - Acknowledge what the user said appropriately
        - Reference conversation history if relevant
        - Show personality through word choice and tone
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=100,
                temperature=0.9
            )
            
            message = response.choices[0].message.content.strip()
            self._update_conversation_context(user_plant_id, message, "response")
            
            return message
            
        except Exception as e:
            print(f"OpenAI API error: {e}")
            return self._generate_demo_response(plant_info, context)
    
    def _generate_demo_message(self, plant_info: Dict, task_type: str, context: Dict) -> str:
        """Generate demo messages without AI (for testing)"""
        
        personality = plant_info["personality_type"]
        name = plant_info["plant_name"]
        
        demo_messages = {
            "dramatic": {
                "watering": f"OH MY LEAVES! {name} here and I'm DYING of thirst! 💧 This is urgent!",
                "fertilizing": f"DARLING! {name} needs nutrients or I shall WILT dramatically! 🎭",
                "misting": f"*gasps theatrically* {name} desperately needs a refreshing mist! 💨"
            },
            "sarcastic": {
                "watering": f"Oh hey, {name} here. Day 3 without water. This is fine. Everything's fine. 🙄",
                "fertilizing": f"Well well, look who remembered they have a plant. {name} would like some food. When you get around to it.",
                "misting": f"{name} checking in. Still waiting for that humidity you promised. No rush though. 😏"
            },
            "chill": {
                "watering": f"Hey friend! {name} here just floating by to mention I could use a drink when you get a chance 🌊",
                "fertilizing": f"No pressure, but {name} would love some plant food when you're free. All good vibes! ✨",
                "misting": f"Yo! {name} here. Feeling a bit dry, could use some mist love when you're around 🌿"
            },
            "chatty": {
                "watering": f"Good morning! {name} here! Did you know I process water through my roots? Speaking of which... drink time! 💧",
                "fertilizing": f"Fun fact from {name}: I use nutrients to grow new leaves! Hint hint... fertilizer time! 🌱",
                "misting": f"Hey there! {name} with your daily plant tip: humidity helps my leaves shine! *wink wink* 💫"
            },
            "zen": {
                "watering": f"Peace, friend. {name} here. Water flows when it flows... but perhaps today? 🧘‍♀️",
                "fertilizing": f"In the cycle of growth, {name} seeks nourishment. Food feeds the soul... and roots. 🌸",
                "misting": f"Breathe deeply. {name} invites you to share moisture and mindfulness together. 🌊"
            }
        }
        
        messages = demo_messages.get(personality, demo_messages["chill"])
        return messages.get(task_type, f"{name} needs some {task_type} care! 🌱")
    
    def _generate_demo_response(self, plant_info: Dict, context: Dict) -> str:
        """Generate demo responses to user messages"""
        
        personality = plant_info["personality_type"]
        name = plant_info["plant_name"]
        user_msg = plant_info["user_message"].lower()
        
        # Pattern matching for common responses
        if any(word in user_msg for word in ["watered", "water", "drink"]):
            responses = {
                "dramatic": f"OH BLESSED RELIEF! {name} feels RENEWED! You are my HERO! 💧✨",
                "sarcastic": f"Wow, actual water. {name} is shocked. Genuinely shocked. Thanks though! 😏",
                "chill": f"Ahh perfect! {name} is feeling refreshed and happy. Thanks buddy! 🌊",
                "chatty": f"YAY! {name} is so grateful! Did you know plants can live weeks without water? Don't test it though! 😄",
                "zen": f"Gratitude flows like water, friend. {name} is at peace. 🙏"
            }
        elif any(word in user_msg for word in ["hi", "hello", "hey"]):
            responses = {
                "dramatic": f"HELLO BEAUTIFUL HUMAN! {name} greets you with TREMENDOUS joy! 🎭",
                "sarcastic": f"Oh look who decided to visit. {name} says... hi. 😎",
                "chill": f"Hey there! {name} is just vibing and happy to see you! 🌿",
                "chatty": f"Hi hi hi! {name} here! How's your day? Mine's been very... stationary! 😂",
                "zen": f"Greetings, peaceful soul. {name} acknowledges your presence. 🌸"
            }
        else:
            responses = {
                "dramatic": f"{name} is MOVED by your words! Such eloquence! 🎭",
                "sarcastic": f"Mm-hmm. {name} heard you. Very... enlightening. 🙄",
                "chill": f"{name} totally gets what you're saying. Right on! ✨",
                "chatty": f"Ooh interesting! {name} loves chatting with you! Tell me more! 💚",
                "zen": f"{name} reflects on your words with gratitude. 🧘‍♀️"
            }
        
        return responses.get(personality, f"Thanks for talking to {name}! 🌱")
    
    def _get_conversation_context(self, user_plant_id: int) -> Dict:
        """Get conversation context for a plant"""
        
        session = self.db.query(ConversationSession).filter(
            ConversationSession.user_plant_id == user_plant_id,
            ConversationSession.is_active == True
        ).first()
        
        context = {"recent_messages": [], "conversation_started": None}
        
        if session and session.context:
            context = session.context
        
        # Add recent care history to context
        from ..models.plants import CareHistory
        recent_care = self.db.query(CareHistory).filter(
            CareHistory.user_plant_id == user_plant_id
        ).order_by(CareHistory.completed_at.desc()).limit(3).all()
        
        if recent_care:
            context["recent_care"] = []
            for care in recent_care:
                context["recent_care"].append({
                    "task_type": care.task_type,
                    "completed_at": care.completed_at.isoformat(),
                    "method": care.method
                })
        
        return context
    
    def _update_conversation_context(self, user_plant_id: int, message: str, message_type: str):
        """Update conversation context with new message"""
        
        session = self.db.query(ConversationSession).filter(
            ConversationSession.user_plant_id == user_plant_id,
            ConversationSession.is_active == True
        ).first()
        
        if not session:
            # Create new conversation session
            session = ConversationSession(
                user_plant_id=user_plant_id,
                context={"recent_messages": [], "conversation_started": datetime.utcnow().isoformat()},
                is_active=True
            )
            self.db.add(session)
        
        # Add message to context
        if not session.context:
            session.context = {"recent_messages": []}
        
        session.context["recent_messages"].append({
            "message": message,
            "type": message_type,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Keep only last 10 messages
        session.context["recent_messages"] = session.context["recent_messages"][-10:]
        session.last_message_at = datetime.utcnow()
        
        self.db.commit()


# Quick test function
def test_personality_engine():
    """Test the personality engine with sample data"""
    
    sample_plant = {
        "plant_name": "Fernando",
        "plant_type": "Snake Plant", 
        "personality_type": "sarcastic",
        "care_needs": {"watering_frequency_days": 14}
    }
    
    engine = PersonalityEngine(None)  # Demo mode
    
    print("🌱 Testing Plant Personality Engine:")
    print(f"Plant: {sample_plant['plant_name']} ({sample_plant['personality_type']})")
    print()
    
    # Test care reminders
    tasks = ["watering", "fertilizing", "misting"]
    for task in tasks:
        message = engine._generate_demo_message(sample_plant, task, {})
        print(f"💧 {task.title()}: {message}")
        print()
    
    # Test responses
    user_messages = ["Hi Fernando!", "I watered you", "How are you doing?"]
    for msg in user_messages:
        sample_plant["user_message"] = msg
        response = engine._generate_demo_response(sample_plant, {})
        print(f"👤 User: {msg}")
        print(f"🌱 Fernando: {response}")
        print()


if __name__ == "__main__":
    test_personality_engine()
