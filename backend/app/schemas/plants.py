from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime


# Plant Catalog Schemas
class PlantCatalogBase(BaseModel):
    name: str
    species: str
    care_requirements: Dict[str, Any]
    difficulty_level: str = "medium"
    description: Optional[str] = None


class PlantCatalogCreate(PlantCatalogBase):
    pass


class PlantCatalogResponse(PlantCatalogBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# User Schemas
class UserBase(BaseModel):
    phone: str
    email: Optional[str] = None
    timezone: str = "UTC"
    location: Optional[str] = None


class UserCreate(UserBase):
    subscription_tier: str = "free"


class UserResponse(UserBase):
    id: int
    subscription_tier: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Personality Type Schemas
class PersonalityTypeBase(BaseModel):
    name: str
    description: str
    prompt_template: str
    voice_traits: Dict[str, Any]


class PersonalityTypeCreate(PersonalityTypeBase):
    pass


class PersonalityTypeResponse(PersonalityTypeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# User Plant Schemas
class UserPlantBase(BaseModel):
    nickname: str
    plant_catalog_id: int


class UserPlantCreate(UserPlantBase):
    user_id: int
    # personality_type_id is now auto-assigned, not user-selectable


class UserPlantResponse(UserPlantBase):
    id: int
    user_id: int
    personality_type_id: int  # Include in response but not in create
    qr_code: Optional[str]
    is_active: bool
    created_at: datetime
    
    # Nested relationships
    plant_catalog: PlantCatalogResponse
    personality: PersonalityTypeResponse

    class Config:
        from_attributes = True


# Care Schedule Schemas
class CareScheduleBase(BaseModel):
    task_type: str
    frequency_days: int
    conditions: Optional[Dict[str, Any]] = None


class CareScheduleCreate(CareScheduleBase):
    user_plant_id: int
    next_due: datetime


class CareScheduleResponse(CareScheduleBase):
    id: int
    user_plant_id: int
    next_due: datetime
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# Care History Schemas
class CareHistoryBase(BaseModel):
    task_type: str
    method: Optional[str] = None
    notes: Optional[str] = None


class CareHistoryCreate(CareHistoryBase):
    user_plant_id: int
    completed_at: Optional[datetime] = None


class CareHistoryResponse(CareHistoryBase):
    id: int
    user_plant_id: int
    completed_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


# Conversation Session Schemas
class ConversationSessionBase(BaseModel):
    context: Optional[Dict[str, Any]] = None


class ConversationSessionCreate(ConversationSessionBase):
    user_plant_id: int


class ConversationSessionResponse(ConversationSessionBase):
    id: int
    user_plant_id: int
    started_at: datetime
    last_message_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


# Complex response schemas
class UserPlantWithSchedule(UserPlantResponse):
    care_schedules: List[CareScheduleResponse]
    recent_care: List[CareHistoryResponse]


class UserDashboard(BaseModel):
    user: UserResponse
    plants: List[UserPlantWithSchedule]
    upcoming_care: List[CareScheduleResponse]
