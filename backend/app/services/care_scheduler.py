"""
Plant Care Schedule Engine

This service generates personalized care schedules based on:
- Plant type and care requirements
- Seasonal adjustments
- Growth stage considerations
- User location and preferences
- Historical care data
"""

import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from enum import Enum
from dataclasses import dataclass

class Season(Enum):
    SPRING = "spring"
    SUMMER = "summer"
    FALL = "fall"
    WINTER = "winter"

class GrowthStage(Enum):
    NEW_PLANT = "new_plant"
    ESTABLISHED = "established"
    MATURE = "mature"

@dataclass
class CareSchedule:
    """Represents a care schedule for a specific plant"""
    plant_id: int
    plant_name: str
    plant_type: str
    next_watering: datetime
    next_fertilizing: Optional[datetime]
    next_repotting: Optional[datetime]
    watering_frequency_days: int
    seasonal_adjustments: Dict
    growth_stage: GrowthStage
    personality_type: str
    care_notes: List[str]

@dataclass
class CareReminder:
    """Represents a specific care reminder"""
    plant_id: int
    plant_name: str
    care_type: str  # 'watering', 'fertilizing', 'repotting'
    due_date: datetime
    message: str
    urgency: str  # 'low', 'medium', 'high', 'critical'
    personality_type: str

class CareScheduleEngine:
    """Main engine for generating and managing plant care schedules"""
    
    def __init__(self):
        self.care_data = self._load_care_data()
        self.personality_data = self._load_personality_data()
        self.kaggle_data = self._load_kaggle_data()
        self.category_personality_map = self._create_category_personality_map()
    
    def _load_care_data(self) -> Dict:
        """Load plant care schedules from JSON file"""
        try:
            care_file_path = os.path.join(
                os.path.dirname(__file__), 
                "..", 
                "data", 
                "plant_care_schedules.json"
            )
            with open(care_file_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print("Warning: Plant care data file not found")
            return {"plant_care_database": {"plants": {}}}
    
    def _load_personality_data(self) -> Dict:
        """Load plant personality data from JSON file"""
        try:
            personality_file_path = os.path.join(
                os.path.dirname(__file__), 
                "..", 
                "data", 
                "plant_personalities.json"
            )
            with open(personality_file_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print("Warning: Plant personality data file not found")
            return {"plant_personalities": {"personalities": {}}}
    
    def _load_kaggle_data(self) -> Dict:
        """Load the complete Kaggle plant database"""
        try:
            kaggle_file_path = os.path.join(
                os.path.dirname(__file__), 
                "..", 
                "..", 
                "house_plants.json"
            )
            with open(kaggle_file_path, 'r') as f:
                plants_list = json.load(f)
            
            # Convert list to dict keyed by common names for easy lookup
            plants_dict = {}
            for plant in plants_list:
                # Use first common name as primary key
                if plant.get("common") and len(plant["common"]) > 0:
                    primary_name = plant["common"][0].lower()
                    plants_dict[primary_name] = plant
                    
                    # Also index by all common names
                    for name in plant["common"]:
                        plants_dict[name.lower()] = plant
            
            return plants_dict
        except FileNotFoundError:
            print("Warning: Kaggle plant data file not found")
            return {}
    
    def _create_category_personality_map(self) -> Dict[str, str]:
        """Map plant categories to personality types"""
        return {
            # Drought-tolerant survivors
            "cactus and succulent": "sarcastic_survivor",
            "succulent": "sarcastic_survivor", 
            "cactus": "sarcastic_survivor",
            "dracaena": "steady_reliable",
            
            # High-maintenance dramatic plants
            "fern": "dramatic_communicator",
            "bromeliad": "dramatic_diva",
            "orchid": "high_maintenance_diva",
            
            # Easy-going plants
            "foliage plant": "chill_friend",
            "hanging": "chill_friend",
            "vine": "chill_friend",
            "climbing": "chill_friend",
            
            # Steady, reliable plants
            "tree": "steady_reliable",
            "palm": "steady_reliable",
            "shrub": "steady_reliable",
            
            # Independent plants
            "air plant": "independent_survivor",
            "epiphyte": "independent_survivor",
        }
    
    def get_current_season(self, date: datetime = None) -> Season:
        """Determine current season based on date"""
        if date is None:
            date = datetime.now()
        
        month = date.month
        
        if month in [3, 4, 5]:
            return Season.SPRING
        elif month in [6, 7, 8]:
            return Season.SUMMER
        elif month in [9, 10, 11]:
            return Season.FALL
        else:
            return Season.WINTER
    
    def determine_growth_stage(self, plant_added_date: datetime, plant_type: str) -> GrowthStage:
        """Determine plant growth stage based on how long it's been in user's care"""
        days_owned = (datetime.now() - plant_added_date).days
        
        if days_owned < 28:  # Less than 4 weeks
            return GrowthStage.NEW_PLANT
        elif days_owned < 365:  # Less than 1 year
            return GrowthStage.ESTABLISHED
        else:
            return GrowthStage.MATURE
    
    def parse_watering_frequency_from_text(self, watering_text: str, category: str = "") -> Tuple[int, Dict]:
        """Parse watering text into frequency and seasonal adjustments"""
        watering_lower = watering_text.lower()
        category_lower = category.lower()
        
        # Seasonal multipliers for different watering patterns
        seasonal_multipliers = {
            "spring": 0.9,
            "summer": 0.8, 
            "fall": 1.1,
            "winter": 1.3
        }
        
        # Dry-loving patterns (succulents, cacti)
        if any(keyword in watering_lower for keyword in ["only when", "must be dry", "completely dry", "dry between"]):
            base_freq = 14
            seasonal_multipliers["winter"] = 1.5  # Even less water in winter
            
        # Moist-loving patterns (ferns, tropical)  
        elif any(keyword in watering_lower for keyword in ["moist", "must not be dry", "keep wet", "frequently"]):
            base_freq = 4
            seasonal_multipliers["summer"] = 0.7  # More water in summer heat
            
        # Moderate watering patterns
        elif any(keyword in watering_lower for keyword in ["half dry", "regularly", "normal", "moderate"]):
            base_freq = 7
            
        # Special patterns (bromeliads, air plants)
        elif any(keyword in watering_lower for keyword in ["change water", "vase", "water in vase"]):
            base_freq = 5
            seasonal_multipliers["winter"] = 1.2  # Less evaporation in winter
            
        else:
            # Default based on category
            if "succulent" in category_lower or "cactus" in category_lower:
                base_freq = 14
            elif "fern" in category_lower:
                base_freq = 4
            else:
                base_freq = 7
        
        # Adjust base frequency based on plant category
        if "succulent" in category_lower or "cactus" in category_lower:
            base_freq = max(base_freq, 10)  # Succulents need less water
        elif "fern" in category_lower:
            base_freq = min(base_freq, 5)   # Ferns need more water
        
        return base_freq, seasonal_multipliers
    
    def get_personality_from_category(self, category: str, climate: str = "") -> str:
        """Map plant category and climate to personality type"""
        category_lower = category.lower()
        climate_lower = climate.lower()
        
        # Check direct category mapping
        for cat_key, personality in self.category_personality_map.items():
            if cat_key in category_lower:
                return personality
        
        # Climate-based fallbacks
        if "desert" in climate_lower or "arid" in climate_lower:
            return "sarcastic_survivor"
        elif "tropical humid" in climate_lower:
            return "dramatic_diva"
        elif "tropical" in climate_lower:
            return "chill_friend"
        
        # Default personality
        return "chill_friend"
    
    def create_care_tips_from_kaggle_data(self, plant_data: Dict) -> List[str]:
        """Generate care tips from Kaggle plant data"""
        tips = []
        
        # Light tips
        ideal_light = plant_data.get("ideallight", "")
        if "direct sunlight" in ideal_light.lower():
            tips.append("Loves bright, direct sunlight - place near a south-facing window")
        elif "bright light" in ideal_light.lower():
            tips.append("Prefers bright, indirect light - avoid direct sun")
        elif "diffused" in plant_data.get("toleratedlight", "").lower():
            tips.append("Tolerates lower light conditions - good for darker rooms")
        
        # Temperature tips
        temp_min = plant_data.get("tempmin", {}).get("celsius", 0)
        temp_max = plant_data.get("tempmax", {}).get("celsius", 0)
        if temp_min > 15:
            tips.append(f"Keep warm - minimum temperature {temp_min}°C")
        if temp_max < 25:
            tips.append(f"Prefers cooler conditions - maximum {temp_max}°C")
        
        # Climate tips
        climate = plant_data.get("climate", "")
        if "humid" in climate.lower():
            tips.append("Loves humidity - consider a humidifier or pebble tray")
        elif "tropical" in climate.lower():
            tips.append("Tropical plant - keep warm and provide good air circulation")
        
        # Category-specific tips
        category = plant_data.get("category", "").lower()
        if "succulent" in category or "cactus" in category:
            tips.append("Drought-tolerant - better to underwater than overwater")
        elif "fern" in category:
            tips.append("Keep soil consistently moist and provide high humidity")
        elif "hanging" in category:
            tips.append("Perfect for hanging baskets or trailing from shelves")
        
        return tips[:3]  # Limit to 3 tips
    
    def get_plant_care_info(self, plant_type: str) -> Optional[Dict]:
        """Get care information for ANY plant - now with Kaggle intelligence!"""
        
        # First, try the detailed profiles (premium plants)
        plants = self.care_data.get("plant_care_database", {}).get("plants", {})
        
        # Try exact match first
        if plant_type.lower().replace(" ", "_") in plants:
            return plants[plant_type.lower().replace(" ", "_")]
        
        # Try to find by common names in detailed profiles
        for plant_key, plant_info in plants.items():
            common_names = plant_info.get("common_names", [])
            if any(name.lower() == plant_type.lower() for name in common_names):
                return plant_info
        
        # NEW: Try Kaggle database with intelligent parsing
        plant_key = plant_type.lower()
        if plant_key in self.kaggle_data:
            return self._create_care_info_from_kaggle(self.kaggle_data[plant_key])
        
        # Try partial matches in Kaggle data
        for kaggle_name, plant_data in self.kaggle_data.items():
            if plant_type.lower() in kaggle_name or kaggle_name in plant_type.lower():
                return self._create_care_info_from_kaggle(plant_data)
        
        return None
    
    def _create_care_info_from_kaggle(self, plant_data: Dict) -> Dict:
        """Convert Kaggle plant data into our care info format"""
        
        # Parse watering frequency and seasonal adjustments
        watering_text = plant_data.get("watering", "")
        category = plant_data.get("category", "")
        base_frequency, seasonal_multipliers = self.parse_watering_frequency_from_text(watering_text, category)
        
        # Get personality
        personality = self.get_personality_from_category(
            category, 
            plant_data.get("climate", "")
        )
        
        # Create care tips
        care_tips = self.create_care_tips_from_kaggle_data(plant_data)
        
        # Build care info structure (same format as detailed profiles)
        care_info = {
            "common_names": plant_data.get("common", []),
            "latin_name": plant_data.get("latin", ""),
            "personality": personality,
            "data_source": "kaggle_enhanced",  # Mark as enhanced
            "care_schedule": {
                "watering": {
                    "frequency_days": base_frequency,
                    "seasonal_adjustments": {
                        "spring": {
                            "multiplier": seasonal_multipliers.get("spring", 0.9),
                            "frequency_days": int(base_frequency * seasonal_multipliers.get("spring", 0.9))
                        },
                        "summer": {
                            "multiplier": seasonal_multipliers.get("summer", 0.8),
                            "frequency_days": int(base_frequency * seasonal_multipliers.get("summer", 0.8))
                        },
                        "fall": {
                            "multiplier": seasonal_multipliers.get("fall", 1.1),
                            "frequency_days": int(base_frequency * seasonal_multipliers.get("fall", 1.1))
                        },
                        "winter": {
                            "multiplier": seasonal_multipliers.get("winter", 1.3),
                            "frequency_days": int(base_frequency * seasonal_multipliers.get("winter", 1.3))
                        }
                    },
                    "growth_stage_adjustments": {
                        "new_plant": {"multiplier": 1.2, "note": "New plants need consistent care"},
                        "established": {"multiplier": 1.0, "note": "Standard care schedule"},
                        "mature": {"multiplier": 0.9, "note": "Mature plants are more resilient"}
                    }
                },
                "fertilizing": {
                    "frequency_days": 45 if "succulent" not in category.lower() else 90,
                    "seasonal_notes": "Feed during growing season (spring/summer)"
                }
            },
            "care_tips": care_tips,
            "original_watering_text": watering_text,
            "category": category,
            "climate": plant_data.get("climate", "")
        }
        
        return care_info
    
    def calculate_watering_schedule(
        self, 
        plant_type: str, 
        last_watered: datetime, 
        plant_added_date: datetime,
        season: Season = None
    ) -> Tuple[datetime, int]:
        """Calculate next watering date and frequency"""
        
        if season is None:
            season = self.get_current_season()
        
        plant_info = self.get_plant_care_info(plant_type)
        if not plant_info:
            # Default schedule for unknown plants
            base_frequency = 7
            seasonal_multiplier = 1.0
        else:
            care_schedule = plant_info.get("care_schedule", {})
            watering_info = care_schedule.get("watering", {})
            
            # Base frequency
            base_frequency = watering_info.get("frequency_days", 7)
            
            # Seasonal adjustments
            seasonal_adjustments = watering_info.get("seasonal_adjustments", {})
            season_info = seasonal_adjustments.get(season.value, {})
            seasonal_multiplier = season_info.get("multiplier", 1.0)
            
            # Growth stage adjustments
            growth_stage = self.determine_growth_stage(plant_added_date, plant_type)
            growth_adjustments = watering_info.get("growth_stage_adjustments", {})
            growth_info = growth_adjustments.get(growth_stage.value, {})
            growth_multiplier = growth_info.get("multiplier", 1.0)
            
            # Combine multipliers
            seasonal_multiplier *= growth_multiplier
        
        # Calculate adjusted frequency
        adjusted_frequency = int(base_frequency * seasonal_multiplier)
        
        # Calculate next watering date
        next_watering = last_watered + timedelta(days=adjusted_frequency)
        
        return next_watering, adjusted_frequency
    
    def generate_care_schedule(
        self, 
        plant_id: int,
        plant_name: str,
        plant_type: str,
        last_watered: datetime,
        plant_added_date: datetime,
        last_fertilized: Optional[datetime] = None
    ) -> CareSchedule:
        """Generate complete care schedule for a plant"""
        
        current_season = self.get_current_season()
        growth_stage = self.determine_growth_stage(plant_added_date, plant_type)
        
        # Calculate watering schedule
        next_watering, watering_frequency = self.calculate_watering_schedule(
            plant_type, last_watered, plant_added_date, current_season
        )
        
        # Get plant care info
        plant_info = self.get_plant_care_info(plant_type)
        personality_type = "chill_friend"  # default
        care_notes = []
        
        if plant_info:
            personality_type = plant_info.get("personality", "chill_friend")
            care_notes = plant_info.get("care_tips", [])
            
            # Calculate fertilizing schedule
            care_schedule = plant_info.get("care_schedule", {})
            fertilizing_info = care_schedule.get("fertilizing", {})
            fertilizing_frequency = fertilizing_info.get("frequency_days", 60)
            
            if last_fertilized:
                next_fertilizing = last_fertilized + timedelta(days=fertilizing_frequency)
            else:
                # If never fertilized, schedule for 2 weeks from now (let plant settle first)
                next_fertilizing = datetime.now() + timedelta(days=14)
            
            # Calculate repotting reminder (just informational)
            repotting_info = care_schedule.get("repotting", {})
            repotting_frequency_years = repotting_info.get("frequency_years", 2)
            next_repotting = plant_added_date + timedelta(days=repotting_frequency_years * 365)
        else:
            next_fertilizing = None
            next_repotting = None
        
        return CareSchedule(
            plant_id=plant_id,
            plant_name=plant_name,
            plant_type=plant_type,
            next_watering=next_watering,
            next_fertilizing=next_fertilizing,
            next_repotting=next_repotting,
            watering_frequency_days=watering_frequency,
            seasonal_adjustments=current_season.value,
            growth_stage=growth_stage,
            personality_type=personality_type,
            care_notes=care_notes
        )
    
    def get_due_reminders(self, user_plants: List[Dict]) -> List[CareReminder]:
        """Get all care reminders that are due or overdue"""
        reminders = []
        now = datetime.now()
        
        for plant in user_plants:
            schedule = self.generate_care_schedule(
                plant_id=plant.get("id"),
                plant_name=plant.get("nickname", plant.get("common_name", "Your plant")),
                plant_type=plant.get("common_name", "unknown"),
                last_watered=plant.get("last_watered", now - timedelta(days=7)),
                plant_added_date=plant.get("created_at", now - timedelta(days=30)),
                last_fertilized=plant.get("last_fertilized")
            )
            
            # Check watering
            if schedule.next_watering <= now:
                days_overdue = (now - schedule.next_watering).days
                urgency = self._calculate_urgency("watering", days_overdue, schedule.plant_type)
                
                message = self._generate_care_message(
                    "watering_reminder", 
                    schedule.personality_type,
                    plant_name=schedule.plant_name,
                    days=days_overdue
                )
                
                reminders.append(CareReminder(
                    plant_id=schedule.plant_id,
                    plant_name=schedule.plant_name,
                    care_type="watering",
                    due_date=schedule.next_watering,
                    message=message,
                    urgency=urgency,
                    personality_type=schedule.personality_type
                ))
            
            # Check fertilizing
            if schedule.next_fertilizing and schedule.next_fertilizing <= now:
                days_overdue = (now - schedule.next_fertilizing).days
                urgency = self._calculate_urgency("fertilizing", days_overdue, schedule.plant_type)
                
                message = self._generate_care_message(
                    "fertilizing_reminder",
                    schedule.personality_type,
                    plant_name=schedule.plant_name,
                    days=days_overdue
                )
                
                reminders.append(CareReminder(
                    plant_id=schedule.plant_id,
                    plant_name=schedule.plant_name,
                    care_type="fertilizing",
                    due_date=schedule.next_fertilizing,
                    message=message,
                    urgency=urgency,
                    personality_type=schedule.personality_type
                ))
        
        return sorted(reminders, key=lambda x: x.due_date)
    
    def _calculate_urgency(self, care_type: str, days_overdue: int, plant_type: str) -> str:
        """Calculate urgency level based on care type and days overdue"""
        if care_type == "watering":
            if days_overdue <= 0:
                return "low"
            elif days_overdue <= 2:
                return "medium"
            elif days_overdue <= 5:
                return "high"
            else:
                return "critical"
        elif care_type == "fertilizing":
            if days_overdue <= 7:
                return "low"
            elif days_overdue <= 30:
                return "medium"
            else:
                return "high"
        
        return "medium"
    
    def _generate_care_message(
        self, 
        message_type: str, 
        personality_type: str, 
        plant_name: str = "Your plant",
        days: int = 0
    ) -> str:
        """Generate a personalized care message based on plant personality"""
        
        personalities = self.personality_data.get("plant_personalities", {}).get("personalities", {})
        personality = personalities.get(personality_type, {})
        
        message_templates = personality.get("message_templates", {})
        templates = message_templates.get(message_type, [
            f"Time to take care of {plant_name}!"
        ])
        
        if not templates:
            return f"Time to take care of {plant_name}!"
        
        # Select a template (for now, just use the first one)
        # In the future, we could randomize or track which messages were used
        template = templates[0]
        
        # Replace placeholders
        message = template.replace("{days}", str(days))
        message = message.replace("{plant_name}", plant_name)
        
        return message
    
    def update_care_record(
        self, 
        plant_id: int, 
        care_type: str, 
        care_date: datetime = None
    ) -> bool:
        """Update care record for a plant (to be integrated with database)"""
        if care_date is None:
            care_date = datetime.now()
        
        # This would update the database with the new care record
        # For now, just return True to indicate success
        print(f"Updated {care_type} record for plant {plant_id} on {care_date}")
        return True
    
    def get_seasonal_care_tips(self, season: Season = None) -> List[str]:
        """Get general seasonal care tips"""
        if season is None:
            season = self.get_current_season()
        
        seasonal_calendar = self.care_data.get("plant_care_database", {}).get("seasonal_care_calendar", {})
        season_info = seasonal_calendar.get(season.value, {})
        
        tips = []
        if "general_notes" in season_info:
            tips.append(season_info["general_notes"])
        
        if "tasks" in season_info:
            tips.extend(season_info["tasks"])
        
        return tips

# Example usage and testing
if __name__ == "__main__":
    # Initialize the care scheduler
    scheduler = CareScheduleEngine()
    
    # Test with both detailed profiles and Kaggle plants
    example_plants = [
        {
            "id": 1,
            "nickname": "Sammy",
            "common_name": "Snake Plant",  # Detailed profile
            "last_watered": datetime.now() - timedelta(days=15),
            "created_at": datetime.now() - timedelta(days=60),
            "last_fertilized": None
        },
        {
            "id": 2,
            "nickname": "Fernando",
            "common_name": "Variegated Carabbean Agave",  # Kaggle plant!
            "last_watered": datetime.now() - timedelta(days=8),
            "created_at": datetime.now() - timedelta(days=30),
            "last_fertilized": None
        },
        {
            "id": 3,
            "nickname": "Drama Queen",
            "common_name": "Maindenhair",  # Kaggle plant!
            "last_watered": datetime.now() - timedelta(days=2),
            "created_at": datetime.now() - timedelta(days=20),
            "last_fertilized": None
        },
        {
            "id": 4,
            "nickname": "Lippy",
            "common_name": "Lipstick",  # Kaggle plant!
            "last_watered": datetime.now() - timedelta(days=5),
            "created_at": datetime.now() - timedelta(days=40),
            "last_fertilized": None
        }
    ]
    
    # Generate schedules
    for plant in example_plants:
        schedule = scheduler.generate_care_schedule(
            plant_id=plant["id"],
            plant_name=plant["nickname"],
            plant_type=plant["common_name"],
            last_watered=plant["last_watered"],
            plant_added_date=plant["created_at"],
            last_fertilized=plant.get("last_fertilized")
        )
        
        print(f"\n--- Care Schedule for {schedule.plant_name} ({schedule.plant_type}) ---")
        print(f"Next watering: {schedule.next_watering}")
        print(f"Watering frequency: {schedule.watering_frequency_days} days")
        print(f"Growth stage: {schedule.growth_stage.value}")
        print(f"Personality: {schedule.personality_type}")
        print(f"Care notes: {schedule.care_notes[:2]}")  # Show first 2 tips
    
    # Get due reminders
    print("\n--- Due Reminders ---")
    reminders = scheduler.get_due_reminders(example_plants)
    for reminder in reminders:
        print(f"{reminder.plant_name}: {reminder.message} (Urgency: {reminder.urgency})")
    
    # Get seasonal tips
    print(f"\n--- Seasonal Tips ({scheduler.get_current_season().value}) ---")
    seasonal_tips = scheduler.get_seasonal_care_tips()
    for tip in seasonal_tips:
        print(f"- {tip}")
