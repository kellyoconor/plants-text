"""
Service for intelligently matching plants with appropriate personality types
"""
from typing import Dict, List, Optional
import random


class PersonalityMatcher:
    """Matches plants with personalities based on their characteristics"""
    
    # Plant category to personality mappings
    CATEGORY_PERSONALITY_MAP = {
        # Dramatic personalities - high-maintenance or striking plants
        "dramatic": {
            "categories": ["Fern", "Bromeliad", "Anthurium", "Flower", "Other"],
            "traits": ["high_maintenance", "colorful", "exotic", "temperamental"]
        },
        
        # Sarcastic personalities - tough, independent plants
        "sarcastic": {
            "categories": ["Cactus And Succulent", "Sansevieria", "Dracaena", "Ficus"],
            "traits": ["drought_tolerant", "tough", "low_maintenance", "survivor"]
        },
        
        # Chill personalities - easy-going, adaptable plants
        "chill": {
            "categories": ["Palm", "Philodendron", "Spathiphyllum", "Foliage plant"],
            "traits": ["easy_care", "adaptable", "forgiving", "stable"]
        },
        
        # Chatty personalities - social, fast-growing plants
        "chatty": {
            "categories": ["Hanging", "Topiairy", "Grass", "Schefflera"],
            "traits": ["fast_growing", "spreading", "social", "communicative"]
        },
        
        # Zen personalities - peaceful, meditative plants
        "zen": {
            "categories": ["Aglaonema", "Dieffenbachia", "Aralia"],
            "traits": ["peaceful", "air_purifying", "meditative", "calm"]
        }
    }
    
    # Difficulty-based personality preferences
    DIFFICULTY_PERSONALITY_MAP = {
        "easy": ["chill", "sarcastic", "zen"],
        "medium": ["chatty", "chill", "zen"],
        "hard": ["dramatic", "sarcastic"]
    }
    
    # Care requirement based traits
    CARE_TRAITS = {
        "drought_tolerant": {"watering_frequency_days": 10},  # 10+ days = drought tolerant
        "high_maintenance": {"watering_frequency_days": 3},   # 3 days or less = high maintenance
        "bright_light": {"light_level": "bright"},
        "low_light": {"light_level": "low"}
    }
    
    @classmethod
    def suggest_personality(cls, plant_data: Dict) -> str:
        """
        Suggest the best personality type for a plant based on its characteristics
        
        Args:
            plant_data: Dictionary containing plant info (category, care_requirements, difficulty_level, etc.)
        
        Returns:
            Personality type name (dramatic, sarcastic, chill, chatty, zen)
        """
        category = plant_data.get("category", "")
        difficulty = plant_data.get("difficulty_level", "medium")
        care_reqs = plant_data.get("care_requirements", {})
        
        # Score each personality type
        personality_scores = {
            "dramatic": 0,
            "sarcastic": 0, 
            "chill": 0,
            "chatty": 0,
            "zen": 0
        }
        
        # Score based on category
        for personality, data in cls.CATEGORY_PERSONALITY_MAP.items():
            if category in data["categories"]:
                personality_scores[personality] += 3
        
        # Score based on difficulty
        preferred_personalities = cls.DIFFICULTY_PERSONALITY_MAP.get(difficulty, [])
        for personality in preferred_personalities:
            personality_scores[personality] += 2
        
        # Score based on care traits
        watering_freq = care_reqs.get("watering_frequency_days", 7)
        light_level = care_reqs.get("light_level", "medium")
        
        # Drought tolerant plants → sarcastic or chill
        if watering_freq >= 10:
            personality_scores["sarcastic"] += 2
            personality_scores["chill"] += 1
        
        # High maintenance plants → dramatic
        elif watering_freq <= 3:
            personality_scores["dramatic"] += 2
        
        # Bright light plants → chatty or dramatic
        if light_level == "bright":
            personality_scores["chatty"] += 1
            personality_scores["dramatic"] += 1
        
        # Low light plants → zen or chill
        elif light_level == "low":
            personality_scores["zen"] += 2
            personality_scores["chill"] += 1
        
        # Find the highest scoring personality
        max_score = max(personality_scores.values())
        top_personalities = [p for p, score in personality_scores.items() if score == max_score]
        
        # If there's a tie, add some randomness but with weighted preferences
        if len(top_personalities) > 1:
            return random.choice(top_personalities)
        elif max_score > 0:
            return top_personalities[0]
        else:
            # Fallback to random if no clear match
            return random.choice(list(personality_scores.keys()))
    
    @classmethod
    def get_personality_distribution(cls, plants_data: List[Dict]) -> Dict[str, int]:
        """
        Analyze how personalities would be distributed across a list of plants
        
        Returns:
            Dictionary with personality counts
        """
        distribution = {"dramatic": 0, "sarcastic": 0, "chill": 0, "chatty": 0, "zen": 0}
        
        for plant in plants_data:
            personality = cls.suggest_personality(plant)
            distribution[personality] += 1
        
        return distribution
    
    @classmethod
    def get_personality_explanation(cls, plant_data: Dict, suggested_personality: str) -> str:
        """
        Generate an explanation for why a particular personality was suggested
        """
        category = plant_data.get("category", "Unknown")
        difficulty = plant_data.get("difficulty_level", "medium")
        care_reqs = plant_data.get("care_requirements", {})
        watering_freq = care_reqs.get("watering_frequency_days", 7)
        light_level = care_reqs.get("light_level", "medium")
        
        explanations = {
            "dramatic": f"Suggested because {category} plants tend to be expressive and eye-catching, "
                       f"with {difficulty} difficulty requiring attention and care.",
            
            "sarcastic": f"Suggested because {category} plants are typically independent and resilient, "
                        f"needing water only every {watering_freq} days - perfect for a witty personality.",
            
            "chill": f"Suggested because {category} plants are known for being easy-going and adaptable, "
                    f"with {difficulty} care requirements that are forgiving.",
            
            "chatty": f"Suggested because {category} plants tend to be social and communicative, "
                     f"thriving in {light_level} light where they can 'talk' to their owners.",
            
            "zen": f"Suggested because {category} plants embody peace and tranquility, "
                  f"with calm {difficulty} care needs that promote mindfulness."
        }
        
        return explanations.get(suggested_personality, "Great personality match for this plant!")


# Example usage and testing
if __name__ == "__main__":
    # Test with some sample plant data
    sample_plants = [
        {
            "category": "Cactus And Succulent",
            "difficulty_level": "easy",
            "care_requirements": {"watering_frequency_days": 14, "light_level": "bright"}
        },
        {
            "category": "Fern", 
            "difficulty_level": "hard",
            "care_requirements": {"watering_frequency_days": 3, "light_level": "medium"}
        },
        {
            "category": "Palm",
            "difficulty_level": "medium", 
            "care_requirements": {"watering_frequency_days": 7, "light_level": "medium"}
        }
    ]
    
    for i, plant in enumerate(sample_plants):
        personality = PersonalityMatcher.suggest_personality(plant)
        explanation = PersonalityMatcher.get_personality_explanation(plant, personality)
        print(f"Plant {i+1}: {personality}")
        print(f"Explanation: {explanation}")
        print()
    
    # Show distribution
    distribution = PersonalityMatcher.get_personality_distribution(sample_plants)
    print(f"Personality distribution: {distribution}")
