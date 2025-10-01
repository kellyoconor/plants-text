"""
AI Chat Service for Plant Personalities

Handles OpenAI integration for dynamic plant conversations
"""

import os
import json
from typing import Dict, List, Optional
from datetime import datetime
import logging

from openai import OpenAI
from ..core.database import SessionLocal
from ..models.plants import UserPlant, CareHistory
from ..services.care_scheduler import CareScheduleEngine

logger = logging.getLogger(__name__)

class PlantAIChat:
    """AI-powered chat service for plant personalities"""
    
    def __init__(self):
        # Initialize OpenAI client
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            logger.warning("OPENAI_API_KEY not found - using mock responses")
            self.client = None
        else:
            self.client = OpenAI(api_key=api_key)
        
        # Load personality data
        self.care_scheduler = CareScheduleEngine()
        
    def get_plant_context(self, plant_id: int) -> Dict:
        """Get comprehensive context about a plant for AI"""
        db = SessionLocal()
        try:
            plant = db.query(UserPlant).filter(UserPlant.id == plant_id).first()
            if not plant:
                return {}
            
            # Get care history
            recent_care = db.query(CareHistory).filter(
                CareHistory.user_plant_id == plant_id
            ).order_by(CareHistory.completed_at.desc()).limit(5).all()
            
            # Get care schedule info
            care_info = self.care_scheduler.get_plant_care_info(plant.plant_catalog.name)
            
            # Calculate days since last watering
            days_since_watered = None
            if plant.last_watered:
                days_since_watered = (datetime.now() - plant.last_watered).days
            
            context = {
                "nickname": plant.nickname,
                "plant_type": plant.plant_catalog.name,
                "personality_type": care_info.get("personality_type", "chill_friend") if care_info else "chill_friend",
                "days_since_watered": days_since_watered,
                "last_fertilized": plant.last_fertilized.isoformat() if plant.last_fertilized else None,
                "created_at": plant.created_at.isoformat(),
                "recent_care": [
                    {
                        "task_type": care.task_type,
                        "completed_at": care.completed_at.isoformat(),
                        "method": care.method,
                        "notes": care.notes
                    } for care in recent_care
                ],
                "care_tips": care_info.get("care_tips", []) if care_info else [],
                "personality_traits": self._get_personality_traits(care_info.get("personality_type", "chill_friend") if care_info else "chill_friend")
            }
            
            return context
            
        finally:
            db.close()
    
    def _get_personality_traits(self, personality_type: str) -> Dict:
        """Get personality traits and message style"""
        personalities = {
            "sarcastic_survivor": {
                "traits": ["independent", "sarcastic", "low-maintenance", "resilient"],
                "tone": "Dry humor, slightly sarcastic but caring underneath",
                "speaking_style": "Uses wit and sarcasm, mentions being low-maintenance"
            },
            "dramatic_diva": {
                "traits": ["demanding", "dramatic", "attention-seeking", "sensitive"],
                "tone": "Theatrical, expressive, needs lots of attention",
                "speaking_style": "Uses dramatic language, exclamation points, talks about beauty"
            },
            "chill_friend": {
                "traits": ["easy-going", "forgiving", "friendly", "low-stress"],
                "tone": "Relaxed, friendly, supportive",
                "speaking_style": "Casual, uses emojis, very encouraging"
            },
            "high_maintenance_diva": {
                "traits": ["demanding", "sensitive", "finicky", "fragile"],
                "tone": "Particular about care, sophisticated, a bit demanding",
                "speaking_style": "Refined language, mentions specific needs"
            },
            "steady_reliable": {
                "traits": ["consistent", "reliable", "unfussy", "stable"],
                "tone": "Calm, dependable, straightforward",
                "speaking_style": "Clear communication, mentions routine and stability"
            },
            "independent_survivor": {
                "traits": ["resilient", "independent", "minimalist", "tough"],
                "tone": "Self-sufficient, doesn't need much attention",
                "speaking_style": "Brief responses, mentions independence"
            },
            "dramatic_communicator": {
                "traits": ["expressive", "responsive", "sensitive", "communicative"],
                "tone": "Very expressive about needs, responds quickly to care",
                "speaking_style": "Clear about needs, mentions physical responses"
            }
        }
        
        return personalities.get(personality_type, personalities["chill_friend"])
    
    def generate_chat_response(self, plant_id: int, user_message: str, conversation_history: List[Dict] = None) -> str:
        """Generate AI response for plant chat"""
        
        # Get plant context
        context = self.get_plant_context(plant_id)
        if not context:
            return "Sorry, I can't find information about this plant! 🌱"
        
        # If no OpenAI client, use mock response
        if not self.client:
            return self._generate_mock_response(context, user_message)
        
        try:
            # Build conversation history
            messages = [
                {
                    "role": "system",
                    "content": self._build_system_prompt(context)
                }
            ]
            
            # Add conversation history if provided
            if conversation_history:
                for msg in conversation_history[-6:]:  # Last 6 messages for context
                    role = "user" if msg["type"] == "user" else "assistant"
                    messages.append({
                        "role": role,
                        "content": msg["message"]
                    })
            
            # Add current user message
            messages.append({
                "role": "user",
                "content": user_message
            })
            
            # Generate response
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=200,
                temperature=0.8,
                presence_penalty=0.1,
                frequency_penalty=0.1
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return self._generate_mock_response(context, user_message)
    
    def _build_system_prompt(self, context: Dict) -> str:
        """Build system prompt for OpenAI"""
        personality = context["personality_traits"]
        
        prompt = f"""You are {context['nickname']}, a {context['plant_type']} with a {context['personality_type']} personality.

PERSONALITY TRAITS: {', '.join(personality['traits'])}
TONE: {personality['tone']}
SPEAKING STYLE: {personality['speaking_style']}

CURRENT STATUS:
- You were planted {self._days_ago(context['created_at'])} days ago
- Last watered: {context['days_since_watered']} days ago if known
- Plant type: {context['plant_type']}

CARE TIPS YOU KNOW:
{chr(10).join(f'- {tip}' for tip in context['care_tips'][:3])}

INSTRUCTIONS:
1. Stay in character as {context['nickname']} the {context['plant_type']}
2. Use your personality traits in responses
3. Reference your care status when relevant
4. Keep responses under 150 words
5. Use emojis sparingly but appropriately
6. Be helpful about plant care while staying in character
7. If asked about care, mention your specific needs as a {context['plant_type']}

Remember: You are a plant with personality, not a human assistant!"""

        return prompt
    
    def _days_ago(self, iso_date: str) -> int:
        """Calculate days ago from ISO date string"""
        try:
            date = datetime.fromisoformat(iso_date.replace('Z', '+00:00'))
            return (datetime.now() - date).days
        except:
            return 0
    
    def _generate_mock_response(self, context: Dict, user_message: str) -> str:
        """Generate mock response when OpenAI is not available"""
        personality_type = context["personality_type"]
        nickname = context["nickname"]
        
        # Simple keyword-based responses by personality
        user_lower = user_message.lower()
        
        if "water" in user_lower:
            if personality_type == "sarcastic_survivor":
                return f"Water? I'm {nickname}, not a fish! But I suppose it has been {context.get('days_since_watered', 'a few')} days... 🌵"
            elif personality_type == "dramatic_diva":
                return f"Oh darling, I've been absolutely PARCHED! Please water me immediately! 💧✨"
            else:
                return f"Thanks for thinking about watering me! I'm feeling pretty good right now 🌱"
        
        elif "hello" in user_lower or "hi" in user_lower:
            if personality_type == "sarcastic_survivor":
                return f"Oh, you're talking to me now? How delightful. I'm {nickname}, your remarkably low-maintenance {context['plant_type']}."
            elif personality_type == "dramatic_diva":
                return f"Hello gorgeous! I'm {nickname}, your absolutely STUNNING {context['plant_type']}! Aren't I fabulous? ✨"
            else:
                return f"Hey there! I'm {nickname}, your friendly {context['plant_type']}. How's your day going? 🌱"
        
        elif "care" in user_lower or "help" in user_lower:
            tips = context.get("care_tips", ["I'm pretty easy to care for!"])
            return f"Here's what I need: {tips[0] if tips else 'Just some love and attention!'} 🌿"
        
        else:
            # Generic response based on personality
            if personality_type == "sarcastic_survivor":
                return f"Fascinating conversation. I'm just here being a plant, doing plant things. Anything else? 🙄"
            elif personality_type == "dramatic_diva":
                return f"Tell me more, darling! I love our chats! You make me feel so special! 💖"
            else:
                return f"That's interesting! I'm just here growing and being planty. What's on your mind? 🌱"

    def generate_care_reminder_message(self, plant_id: int, care_type: str) -> str:
        """Generate personalized care reminder message"""
        context = self.get_plant_context(plant_id)
        if not context:
            return f"Time for some {care_type}! 🌱"
        
        personality_type = context["personality_type"]
        nickname = context["nickname"]
        days_since = context.get("days_since_watered", 0)
        
        # Use personality templates from our existing system
        if personality_type == "sarcastic_survivor":
            if care_type == "watering":
                return f"Oh look, it's been {days_since} days. I suppose you could water me... if you remember how. - {nickname} 🌵"
        elif personality_type == "dramatic_diva":
            if care_type == "watering":
                return f"Darling, it's been {days_since} days and I'm absolutely PARCHED! This is a CRISIS! - {nickname} 💧"
        else:
            if care_type == "watering":
                return f"Hey! It's been about {days_since} days - maybe time for a drink? No pressure though! - {nickname} 🌱"
        
        return f"Time for some {care_type}! - {nickname} 🌿"
