from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ..core.database import get_db
from ..models.plants import PlantCatalog, User, UserPlant, CareSchedule, CareHistory, PersonalityType
from ..schemas.plants import (
    PlantCatalogResponse, UserCreate, UserResponse, UserPlantCreate, 
    UserPlantResponse, CareScheduleCreate, CareScheduleResponse,
    CareHistoryCreate, CareHistoryResponse, UserDashboard,
    PersonalityTypeResponse
)
from ..services.plant_care import PlantCareService
from ..services.personality_matcher import PersonalityMatcher
from ..services.personality_engine import PersonalityEngine
from ..services.care_scheduler import CareScheduleEngine

router = APIRouter()


# Plant Catalog endpoints
@router.get("/catalog", response_model=List[PlantCatalogResponse])
def get_plant_catalog(db: Session = Depends(get_db)):
    """Get all available plants from catalog"""
    plants = db.query(PlantCatalog).all()
    return plants


@router.get("/catalog/{plant_id}", response_model=PlantCatalogResponse)
def get_plant_by_id(plant_id: int, db: Session = Depends(get_db)):
    """Get specific plant from catalog"""
    plant = db.query(PlantCatalog).filter(PlantCatalog.id == plant_id).first()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    return plant


# User endpoints
@router.post("/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.phone == user.phone).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this phone already exists")
    
    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/users/find/{phone}", response_model=UserResponse)
def find_user_by_phone(phone: str, db: Session = Depends(get_db)):
    """Find user by phone number"""
    user = db.query(User).filter(User.phone == phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/users/find-or-create", response_model=UserResponse)
def find_or_create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Find existing user by phone or create new one"""
    # First try to find existing user
    existing_user = db.query(User).filter(User.phone == user.phone).first()
    if existing_user:
        return existing_user
    
    # If not found, create new user
    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.get("/users/{user_id}/dashboard", response_model=UserDashboard)
def get_user_dashboard(user_id: int, db: Session = Depends(get_db)):
    """Get user dashboard with plants and upcoming care"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user plants with relationships
    plants = db.query(UserPlant).filter(
        UserPlant.user_id == user_id,
        UserPlant.is_active == True
    ).all()
    
    # Get upcoming care tasks
    upcoming_care = db.query(CareSchedule).join(UserPlant).filter(
        UserPlant.user_id == user_id,
        CareSchedule.is_active == True
    ).order_by(CareSchedule.next_due).limit(10).all()
    
    return UserDashboard(
        user=user,
        plants=plants,
        upcoming_care=upcoming_care
    )


# User Plant endpoints
@router.post("/plants", response_model=UserPlantResponse)
def add_plant_to_user(plant: UserPlantCreate, db: Session = Depends(get_db)):
    """Add a plant to user's collection"""
    # Verify user exists
    user = db.query(User).filter(User.id == plant.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify plant catalog exists
    plant_catalog = db.query(PlantCatalog).filter(PlantCatalog.id == plant.plant_catalog_id).first()
    if not plant_catalog:
        raise HTTPException(status_code=404, detail="Plant not found in catalog")
    
    # Auto-assign personality based on plant type (no user choice)
    suggested_personality = plant_catalog.care_requirements.get("suggested_personality")
    if not suggested_personality:
        # Fallback: generate personality suggestion on the fly
        category = plant_catalog.description.split(" plant from ")[0] if " plant from " in plant_catalog.description else "Other"
        plant_data = {
            "category": category,
            "difficulty_level": plant_catalog.difficulty_level,
            "care_requirements": plant_catalog.care_requirements
        }
        suggested_personality = PersonalityMatcher.suggest_personality(plant_data)
    
    # Get the personality type ID
    personality = db.query(PersonalityType).filter(PersonalityType.name == suggested_personality).first()
    if not personality:
        raise HTTPException(status_code=500, detail=f"Personality type '{suggested_personality}' not found")
    
    # Create user plant with auto-assigned personality
    plant_data = plant.dict()
    plant_data['personality_type_id'] = personality.id
    db_plant = UserPlant(**plant_data)
    db.add(db_plant)
    db.commit()
    db.refresh(db_plant)
    
    # Generate care schedule
    care_service = PlantCareService(db)
    care_service.create_initial_schedule(db_plant.id)
    
    return db_plant


@router.get("/users/{user_id}/plants", response_model=List[UserPlantResponse])
def get_user_plants(user_id: int, db: Session = Depends(get_db)):
    """Get all plants for a user"""
    plants = db.query(UserPlant).filter(
        UserPlant.user_id == user_id,
        UserPlant.is_active == True
    ).all()
    return plants


# Care endpoints
@router.post("/care/complete", response_model=CareHistoryResponse)
def complete_care_task(care: CareHistoryCreate, db: Session = Depends(get_db)):
    """Log completion of a care task"""
    # Verify plant exists
    plant = db.query(UserPlant).filter(UserPlant.id == care.user_plant_id).first()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    
    # Create care history record
    db_care = CareHistory(**care.dict())
    if not db_care.completed_at:
        from datetime import datetime
        db_care.completed_at = datetime.utcnow()
    
    db.add(db_care)
    db.commit()
    db.refresh(db_care)
    
    # Update care schedule
    care_service = PlantCareService(db)
    care_service.update_schedule_after_care(care.user_plant_id, care.task_type)
    
    return db_care


@router.get("/users/{user_id}/schedule", response_model=List[CareScheduleResponse])
def get_user_care_schedule(user_id: int, db: Session = Depends(get_db)):
    """Get upcoming care schedule for user"""
    schedules = db.query(CareSchedule).join(UserPlant).filter(
        UserPlant.user_id == user_id,
        CareSchedule.is_active == True
    ).order_by(CareSchedule.next_due).all()
    
    return schedules


# Personality endpoints
@router.get("/personalities", response_model=List[PersonalityTypeResponse])
def get_personality_types(db: Session = Depends(get_db)):
    """Get all available personality types"""
    personalities = db.query(PersonalityType).all()
    return personalities


@router.get("/catalog/{plant_id}/suggest-personality")
def suggest_personality_for_plant(plant_id: int, db: Session = Depends(get_db)):
    """Get personality suggestion for a specific plant"""
    plant = db.query(PlantCatalog).filter(PlantCatalog.id == plant_id).first()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    
    # Extract category from description (stored as "Category plant from Origin...")
    category = plant.description.split(" plant from ")[0] if " plant from " in plant.description else "Other"
    
    plant_data = {
        "category": category,
        "difficulty_level": plant.difficulty_level,
        "care_requirements": plant.care_requirements
    }
    
    suggested_personality = PersonalityMatcher.suggest_personality(plant_data)
    explanation = PersonalityMatcher.get_personality_explanation(plant_data, suggested_personality)
    
    # Get the personality type details
    personality_type = db.query(PersonalityType).filter(
        PersonalityType.name == suggested_personality
    ).first()
    
    return {
        "plant_id": plant_id,
        "plant_name": plant.name,
        "suggested_personality": suggested_personality,
        "explanation": explanation,
        "personality_details": {
            "id": personality_type.id if personality_type else None,
            "name": personality_type.name if personality_type else suggested_personality,
            "description": personality_type.description if personality_type else "AI-suggested personality",
            "voice_traits": personality_type.voice_traits if personality_type else {}
        }
    }


# Plant Conversation endpoints
@router.post("/plants/{plant_id}/remind/{task_type}")
def get_care_reminder(plant_id: int, task_type: str, db: Session = Depends(get_db)):
    """Get a personality-based care reminder from the plant"""
    # Verify plant exists
    plant = db.query(UserPlant).filter(UserPlant.id == plant_id).first()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    
    # Generate personality message
    personality_engine = PersonalityEngine(db)
    message = personality_engine.generate_care_reminder(plant_id, task_type)
    
    return {
        "plant_id": plant_id,
        "plant_name": plant.nickname,
        "personality": plant.personality.name,
        "task_type": task_type,
        "message": message,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.post("/plants/{plant_id}/chat")
def chat_with_plant(plant_id: int, message: dict, db: Session = Depends(get_db)):
    """Send a message to a plant and get a personality response"""
    # Verify plant exists
    plant = db.query(UserPlant).filter(UserPlant.id == plant_id).first()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    
    user_message = message.get("message", "")
    if not user_message:
        raise HTTPException(status_code=400, detail="Message is required")
    
    # Generate personality response
    personality_engine = PersonalityEngine(db)
    response = personality_engine.respond_to_user(plant_id, user_message)
    
    return {
        "plant_id": plant_id,
        "plant_name": plant.nickname,
        "personality": plant.personality.name,
        "user_message": user_message,
        "plant_response": response,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/plants/{plant_id}/personality-demo")
def demo_plant_personality(plant_id: int, db: Session = Depends(get_db)):
    """Get a demo of all personality responses for a plant"""
    # Verify plant exists
    plant = db.query(UserPlant).filter(UserPlant.id == plant_id).first()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    
    personality_engine = PersonalityEngine(db)
    
    # Generate demo messages for different care tasks
    demo_messages = {}
    care_tasks = ["watering", "fertilizing", "misting"]
    
    for task in care_tasks:
        demo_messages[task] = personality_engine.generate_care_reminder(plant_id, task)
    
    # Generate demo conversation responses
    demo_conversations = {}
    sample_messages = [
        "Hi there!",
        "I just watered you",
        "How are you feeling?",
        "You look beautiful today"
    ]
    
    for msg in sample_messages:
        demo_conversations[msg] = personality_engine.respond_to_user(plant_id, msg)
    
    return {
        "plant_id": plant_id,
        "plant_name": plant.nickname,
        "personality": plant.personality.name,
        "care_reminders": demo_messages,
        "conversation_samples": demo_conversations,
        "personality_traits": plant.personality.voice_traits
    }


@router.post("/plants/{plant_id}/test-ai")
def test_ai_personality(plant_id: int, request: dict, db: Session = Depends(get_db)):
    """Test AI personality with a custom OpenAI API key"""
    # Verify plant exists
    plant = db.query(UserPlant).filter(UserPlant.id == plant_id).first()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    
    api_key = request.get("openai_api_key")
    test_message = request.get("message", "Hi there!")
    
    if not api_key:
        raise HTTPException(status_code=400, detail="OpenAI API key is required for testing")
    
    # Test with provided API key
    personality_engine = PersonalityEngine(db, openai_api_key=api_key)
    
    try:
        # Test care reminder
        care_reminder = personality_engine.generate_care_reminder(plant_id, "watering")
        
        # Test conversation
        conversation_response = personality_engine.respond_to_user(plant_id, test_message)
        
        return {
            "plant_id": plant_id,
            "plant_name": plant.nickname,
            "personality": plant.personality.name,
            "test_results": {
                "care_reminder": care_reminder,
                "conversation": {
                    "user_message": test_message,
                    "plant_response": conversation_response
                }
            },
            "ai_enabled": True,
            "status": "success"
        }
        
    except Exception as e:
        return {
            "plant_id": plant_id,
            "plant_name": plant.nickname,
            "error": str(e),
            "ai_enabled": False,
            "status": "error"
        }


# Care Schedule endpoints
@router.get("/users/{user_id}/care-schedule")
def get_user_care_schedule(user_id: int, db: Session = Depends(get_db)):
    """Get comprehensive care schedule for all user's plants"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's plants
    user_plants = db.query(UserPlant).filter(UserPlant.user_id == user_id).all()
    
    if not user_plants:
        return {
            "user_id": user_id,
            "schedules": [],
            "due_reminders": [],
            "seasonal_tips": []
        }
    
    # Initialize care scheduler
    scheduler = CareScheduleEngine()
    
    # Convert user plants to format expected by scheduler
    plant_data = []
    for plant in user_plants:
        plant_data.append({
            "id": plant.id,
            "nickname": plant.nickname,
            "common_name": plant.plant_catalog.name,
            "last_watered": plant.last_watered or datetime.now(),
            "created_at": plant.created_at,
            "last_fertilized": plant.last_fertilized
        })
    
    # Generate schedules for each plant
    schedules = []
    for plant in plant_data:
        schedule = scheduler.generate_care_schedule(
            plant_id=plant["id"],
            plant_name=plant["nickname"],
            plant_type=plant["common_name"],
            last_watered=plant["last_watered"],
            plant_added_date=plant["created_at"],
            last_fertilized=plant.get("last_fertilized")
        )
        
        schedules.append({
            "plant_id": schedule.plant_id,
            "plant_name": schedule.plant_name,
            "plant_type": schedule.plant_type,
            "next_watering": schedule.next_watering.isoformat(),
            "next_fertilizing": schedule.next_fertilizing.isoformat() if schedule.next_fertilizing else None,
            "next_repotting": schedule.next_repotting.isoformat() if schedule.next_repotting else None,
            "watering_frequency_days": schedule.watering_frequency_days,
            "growth_stage": schedule.growth_stage.value,
            "personality_type": schedule.personality_type,
            "care_notes": schedule.care_notes[:3]  # Limit to 3 tips
        })
    
    # Get due reminders
    reminders = scheduler.get_due_reminders(plant_data)
    reminder_data = []
    for reminder in reminders:
        reminder_data.append({
            "plant_id": reminder.plant_id,
            "plant_name": reminder.plant_name,
            "care_type": reminder.care_type,
            "due_date": reminder.due_date.isoformat(),
            "message": reminder.message,
            "urgency": reminder.urgency,
            "personality_type": reminder.personality_type
        })
    
    # Get seasonal tips
    seasonal_tips = scheduler.get_seasonal_care_tips()
    
    return {
        "user_id": user_id,
        "schedules": schedules,
        "due_reminders": reminder_data,
        "seasonal_tips": seasonal_tips,
        "current_season": scheduler.get_current_season().value
    }


@router.get("/users/{user_id}/plants/{plant_id}/care-schedule")
def get_plant_care_schedule(user_id: int, plant_id: int, db: Session = Depends(get_db)):
    """Get detailed care schedule for a specific plant"""
    user_plant = db.query(UserPlant).filter(
        UserPlant.user_id == user_id,
        UserPlant.id == plant_id
    ).first()
    
    if not user_plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    
    scheduler = CareScheduleEngine()
    
    schedule = scheduler.generate_care_schedule(
        plant_id=user_plant.id,
        plant_name=user_plant.nickname,
        plant_type=user_plant.plant_catalog.name,
        last_watered=user_plant.last_watered or datetime.now(),
        plant_added_date=user_plant.created_at,
        last_fertilized=user_plant.last_fertilized
    )
    
    # Get plant care info for detailed tips
    plant_info = scheduler.get_plant_care_info(user_plant.plant_catalog.name)
    common_issues = plant_info.get("common_issues", {}) if plant_info else {}
    
    return {
        "plant_id": schedule.plant_id,
        "plant_name": schedule.plant_name,
        "plant_type": schedule.plant_type,
        "next_watering": schedule.next_watering.isoformat(),
        "next_fertilizing": schedule.next_fertilizing.isoformat() if schedule.next_fertilizing else None,
        "next_repotting": schedule.next_repotting.isoformat() if schedule.next_repotting else None,
        "watering_frequency_days": schedule.watering_frequency_days,
        "growth_stage": schedule.growth_stage.value,
        "personality_type": schedule.personality_type,
        "care_notes": schedule.care_notes,
        "common_issues": common_issues,
        "seasonal_adjustments": schedule.seasonal_adjustments
    }


@router.post("/users/{user_id}/plants/{plant_id}/care-record")
def record_plant_care(
    user_id: int, 
    plant_id: int, 
    care_data: dict,
    db: Session = Depends(get_db)
):
    """Record that care was performed on a plant"""
    user_plant = db.query(UserPlant).filter(
        UserPlant.user_id == user_id,
        UserPlant.id == plant_id
    ).first()
    
    if not user_plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    
    care_type = care_data.get("care_type")
    care_date_str = care_data.get("care_date")
    
    if care_date_str:
        care_date = datetime.fromisoformat(care_date_str.replace('Z', '+00:00'))
    else:
        care_date = datetime.now()
    
    # Update the plant record based on care type
    if care_type == "watering":
        user_plant.last_watered = care_date
    elif care_type == "fertilizing":
        user_plant.last_fertilized = care_date
    
    # Add to care history
    care_history = CareHistory(
        user_plant_id=plant_id,
        task_type=care_type,
        completed_at=care_date,
        method="manual",
        notes=f"{care_type.capitalize()} completed"
    )
    
    db.add(care_history)
    db.commit()
    db.refresh(user_plant)
    
    # Generate updated schedule
    scheduler = CareScheduleEngine()
    updated_schedule = scheduler.generate_care_schedule(
        plant_id=user_plant.id,
        plant_name=user_plant.nickname,
        plant_type=user_plant.plant_catalog.name,
        last_watered=user_plant.last_watered or datetime.now(),
        plant_added_date=user_plant.created_at,
        last_fertilized=user_plant.last_fertilized
    )
    
    return {
        "success": True,
        "care_type": care_type,
        "care_date": care_date.isoformat(),
        "plant_name": user_plant.nickname,
        "next_watering": updated_schedule.next_watering.isoformat(),
        "message": f"{care_type.capitalize()} recorded successfully!"
    }
