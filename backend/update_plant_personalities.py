#!/usr/bin/env python3
"""
Update existing plants in database with suggested personality types
"""
import sys
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.plants import PlantCatalog, PersonalityType
from app.core.config import settings
from app.services.personality_matcher import PersonalityMatcher


def update_plant_personalities():
    """Update all plants in catalog with suggested personalities"""
    
    # Create database connection
    engine = create_engine(settings.database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    
    try:
        # Get all plants
        plants = session.query(PlantCatalog).all()
        personality_types = {p.name: p.id for p in session.query(PersonalityType).all()}
        
        print(f"Updating {len(plants)} plants with personality suggestions...")
        
        updated_count = 0
        personality_distribution = {"dramatic": 0, "sarcastic": 0, "chill": 0, "chatty": 0, "zen": 0}
        
        for plant in plants:
            # Create plant data for personality matcher
            plant_data = {
                "category": plant.description.split(" plant from ")[0] if " plant from " in plant.description else "Other",
                "difficulty_level": plant.difficulty_level,
                "care_requirements": plant.care_requirements
            }
            
            # Get suggested personality
            suggested_personality = PersonalityMatcher.suggest_personality(plant_data)
            personality_distribution[suggested_personality] += 1
            
            # Get explanation
            explanation = PersonalityMatcher.get_personality_explanation(plant_data, suggested_personality)
            
            # Add personality suggestion to plant's care requirements
            if "suggested_personality" not in plant.care_requirements:
                plant.care_requirements["suggested_personality"] = suggested_personality
                plant.care_requirements["personality_explanation"] = explanation
                
                updated_count += 1
                print(f"✓ {plant.name} → {suggested_personality}")
                print(f"  Reason: {explanation[:100]}...")
                print()
        
        # Commit changes
        session.commit()
        
        print(f"Successfully updated {updated_count} plants!")
        print(f"Personality distribution: {personality_distribution}")
        
        # Show some examples
        print("\nExample personality assignments:")
        for personality in ["dramatic", "sarcastic", "chill", "chatty", "zen"]:
            example_plant = session.query(PlantCatalog).filter(
                PlantCatalog.care_requirements.contains({"suggested_personality": personality})
            ).first()
            
            if example_plant:
                print(f"  {personality.upper()}: {example_plant.name} ({example_plant.species})")
        
    except Exception as e:
        print(f"Error updating personalities: {e}")
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    update_plant_personalities()
