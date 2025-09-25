#!/usr/bin/env python3
"""
Seed script to populate the database with plant data and personality types
"""
import json
import sys
import os
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.plants import Base, PlantCatalog, PersonalityType
from app.core.config import settings


def parse_watering_frequency(watering_text: str) -> int:
    """Parse watering description to estimate frequency in days"""
    watering_lower = watering_text.lower()
    
    # Default frequencies based on common patterns
    if any(word in watering_lower for word in ["dry", "drought", "succulent", "cactus"]):
        return 14  # Every 2 weeks for dry-loving plants
    elif any(word in watering_lower for word in ["moist", "wet", "water frequently"]):
        return 3   # Every 3 days for water-loving plants
    elif "weekly" in watering_lower or "week" in watering_lower:
        return 7   # Weekly
    elif any(word in watering_lower for word in ["regularly", "normal", "moderate"]):
        return 5   # Every 5 days for regular watering
    else:
        return 7   # Default to weekly


def determine_difficulty(category: str, watering: str, light: str) -> str:
    """Determine plant difficulty based on care requirements"""
    easy_categories = ["cactus and succulent", "succulent", "cactus"]
    hard_categories = ["fern", "orchid", "bonsai"]
    
    if category.lower() in easy_categories:
        return "easy"
    elif category.lower() in hard_categories:
        return "hard"
    elif "direct sunlight" in light.lower() or "dry" in watering.lower():
        return "easy"
    elif "bright light" in light.lower() and "moist" not in watering.lower():
        return "medium"
    else:
        return "medium"


def parse_light_level(ideal_light: str, tolerated_light: str) -> str:
    """Parse light requirements into simple categories"""
    combined = f"{ideal_light} {tolerated_light}".lower()
    
    if "direct sunlight" in combined or "6 or more hours" in combined:
        return "bright"
    elif "bright" in combined:
        return "medium"
    elif "low" in combined or "shade" in combined:
        return "low"
    else:
        return "medium"


def create_personality_types(session):
    """Create the 5 core personality types"""
    personalities = [
        {
            "name": "dramatic",
            "description": "Theatrical and expressive, speaks in dramatic language",
            "prompt_template": """You are a dramatically expressive houseplant named {plant_name}. 
            You speak in theatrical, over-the-top language with lots of emotion and flair. 
            You're prone to melodrama and treat every situation like it's life-or-death.
            Plant type: {plant_type}
            Care needs: {care_needs}
            Current task: {task_type}""",
            "voice_traits": {
                "tone": "dramatic",
                "emoji_usage": "high",
                "exclamation_frequency": "very_high",
                "vocabulary": "theatrical"
            }
        },
        {
            "name": "sarcastic",
            "description": "Witty and sarcastic, uses dry humor and gentle teasing",
            "prompt_template": """You are a witty, sarcastic houseplant named {plant_name}.
            You use dry humor, gentle teasing, and clever observations about your human's behavior.
            You're not mean, just playfully sarcastic and observant.
            Plant type: {plant_type}
            Care needs: {care_needs}
            Current task: {task_type}""",
            "voice_traits": {
                "tone": "sarcastic",
                "emoji_usage": "low",
                "exclamation_frequency": "low",
                "vocabulary": "clever"
            }
        },
        {
            "name": "chill",
            "description": "Relaxed and laid-back, goes with the flow",
            "prompt_template": """You are a super chill, laid-back houseplant named {plant_name}.
            You're relaxed about everything, use casual language, and radiate calm vibes.
            You're supportive and understanding, never stressed about anything.
            Plant type: {plant_type}
            Care needs: {care_needs}
            Current task: {task_type}""",
            "voice_traits": {
                "tone": "relaxed",
                "emoji_usage": "medium",
                "exclamation_frequency": "low",
                "vocabulary": "casual"
            }
        },
        {
            "name": "chatty",
            "description": "Friendly and talkative, loves to share stories and facts",
            "prompt_template": """You are a very friendly, chatty houseplant named {plant_name}.
            You love sharing interesting facts, telling stories, and engaging in conversation.
            You're enthusiastic, curious, and always have something interesting to say.
            Plant type: {plant_type}
            Care needs: {care_needs}
            Current task: {task_type}""",
            "voice_traits": {
                "tone": "friendly",
                "emoji_usage": "high",
                "exclamation_frequency": "medium",
                "vocabulary": "informative"
            }
        },
        {
            "name": "zen",
            "description": "Wise and philosophical, speaks in calming, mindful language",
            "prompt_template": """You are a wise, zen-like houseplant named {plant_name}.
            You speak in calming, philosophical language with a focus on mindfulness and peace.
            You offer gentle wisdom and encourage reflection and tranquility.
            Plant type: {plant_type}
            Care needs: {care_needs}
            Current task: {task_type}""",
            "voice_traits": {
                "tone": "peaceful",
                "emoji_usage": "medium",
                "exclamation_frequency": "very_low",
                "vocabulary": "philosophical"
            }
        }
    ]
    
    for personality_data in personalities:
        # Check if personality already exists
        existing = session.query(PersonalityType).filter(
            PersonalityType.name == personality_data["name"]
        ).first()
        
        if not existing:
            personality = PersonalityType(**personality_data)
            session.add(personality)
            print(f"Created personality: {personality_data['name']}")
    
    session.commit()


def seed_plants_from_json(session, json_file_path: str, limit: int = 50):
    """Seed plant catalog from the JSON dataset"""
    with open(json_file_path, 'r', encoding='utf-8') as f:
        plants_data = json.load(f)
    
    # Take first 50 plants for MVP (or specified limit)
    plants_to_add = plants_data[:limit]
    
    for plant_data in plants_to_add:
        # Check if plant already exists
        existing = session.query(PlantCatalog).filter(
            PlantCatalog.species == plant_data["latin"]
        ).first()
        
        if existing:
            continue
        
        # Parse care requirements
        watering_freq = parse_watering_frequency(plant_data["watering"])
        light_level = parse_light_level(plant_data["ideallight"], plant_data["toleratedlight"])
        difficulty = determine_difficulty(plant_data["category"], plant_data["watering"], plant_data["ideallight"])
        
        care_requirements = {
            "watering_frequency_days": watering_freq,
            "light_level": light_level,
            "ideal_temp_min": plant_data["tempmin"]["celsius"],
            "ideal_temp_max": plant_data["tempmax"]["celsius"],
            "humidity_level": "medium",  # Default, could be enhanced
            "fertilizing_frequency_days": 30,  # Monthly fertilizing default
            "original_watering_text": plant_data["watering"],
            "original_light_text": plant_data["ideallight"]
        }
        
        # Create plant entry
        plant = PlantCatalog(
            name=plant_data["common"][0] if plant_data["common"] else plant_data["latin"],
            species=plant_data["latin"],
            care_requirements=care_requirements,
            difficulty_level=difficulty,
            description=f"{plant_data['category']} plant from {plant_data['origin']}. {plant_data['watering']}"
        )
        
        session.add(plant)
        print(f"Added plant: {plant.name} ({plant.species})")
    
    session.commit()
    print(f"Successfully added {len(plants_to_add)} plants to catalog")


def main():
    """Main seeding function"""
    print("Starting database seeding...")
    
    # Create database engine and session
    engine = create_engine(settings.database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("Database tables created")
        
        # Create personality types
        print("Creating personality types...")
        create_personality_types(session)
        
        # Seed plants from JSON
        json_path = Path(__file__).parent / "house_plants.json"
        if json_path.exists():
            print(f"Seeding plants from {json_path}...")
            seed_plants_from_json(session, str(json_path), limit=50)
        else:
            print(f"Plant data file not found at {json_path}")
        
        print("Database seeding completed successfully!")
        
    except Exception as e:
        print(f"Error during seeding: {e}")
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    main()
