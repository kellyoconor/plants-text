from pydantic import BaseModel, field_validator, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
import re


# Plant Catalog Schemas
class PlantCatalogBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    species: str = Field(..., min_length=1, max_length=200)
    care_requirements: Dict[str, Any]
    difficulty_level: str = "medium"
    description: Optional[str] = None
    
    @field_validator('name', 'species')
    @classmethod
    def validate_text_field(cls, v: str) -> str:
        """Validate text fields are not empty and sanitized"""
        if not v or not v.strip():
            raise ValueError('Field cannot be empty or whitespace only')
        # Basic SQL injection prevention
        dangerous_patterns = ['--', ';', '/*', '*/', 'DROP', 'DELETE', 'INSERT', 'UPDATE', 'SELECT']
        v_upper = v.upper()
        for pattern in dangerous_patterns:
            if pattern in v_upper:
                raise ValueError(f'Invalid characters detected in field')
        return v.strip()


class PlantCatalogCreate(PlantCatalogBase):
    pass


class PlantCatalogResponse(PlantCatalogBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# User Schemas
class UserBase(BaseModel):
    phone: str = Field(..., description="Phone number in E.164 format (+1234567890)")
    email: Optional[str] = Field(None, max_length=255)
    timezone: str = "UTC"
    location: Optional[str] = Field(None, max_length=255)
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: str) -> str:
        """
        Validate phone number is in E.164 format
        Format: +[country code][number]
        Example: +12025551234
        """
        if not v:
            raise ValueError('Phone number is required')
        
        # Remove any whitespace
        v = v.strip()
        
        # E.164 format: +[1-9][0-9]{1,14}
        phone_pattern = r'^\+[1-9]\d{1,14}$'
        if not re.match(phone_pattern, v):
            raise ValueError(
                'Invalid phone number format. Must be E.164 format (e.g., +12025551234). '
                'Include country code with + prefix.'
            )
        
        return v
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        """Validate email format if provided"""
        if v is None:
            return v
        
        v = v.strip()
        if not v:
            return None
        
        # Basic email validation
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v):
            raise ValueError('Invalid email format')
        
        return v.lower()


class UserCreate(UserBase):
    subscription_tier: str = "free"


class UserResponse(UserBase):
    id: int
    subscription_tier: str
    is_active: bool
    # phone_verified: bool  # Removed
    # verified_at: Optional[datetime] = None  # Removed
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
    nickname: str = Field(..., min_length=1, max_length=50, description="Plant nickname")
    plant_catalog_id: int = Field(..., gt=0, description="ID of plant from catalog")
    
    @field_validator('nickname')
    @classmethod
    def validate_nickname(cls, v: str) -> str:
        """
        Validate nickname is safe and appropriate
        - Prevent SQL injection
        - Ensure reasonable length
        - Prevent inappropriate content
        """
        if not v or not v.strip():
            raise ValueError('Nickname cannot be empty or whitespace only')
        
        v = v.strip()
        
        # Prevent SQL injection attempts
        dangerous_patterns = [
            '--', ';', '/*', '*/', 'DROP', 'DELETE', 'INSERT', 'UPDATE', 'SELECT',
            'UNION', 'ALTER', 'CREATE', 'EXEC', 'EXECUTE', 'xp_', 'sp_'
        ]
        v_upper = v.upper()
        for pattern in dangerous_patterns:
            if pattern in v_upper:
                raise ValueError('Nickname contains invalid characters')
        
        # Prevent excessive special characters (basic XSS prevention)
        if v.count('<') > 0 or v.count('>') > 0:
            raise ValueError('Nickname cannot contain < or > characters')
        
        # Ensure it's not too long when encoded
        if len(v.encode('utf-8')) > 200:
            raise ValueError('Nickname is too long')
        
        return v


class UserPlantCreate(UserPlantBase):
    user_id: int = Field(..., gt=0, description="User ID")
    # personality_type_id is now auto-assigned, not user-selectable


class UserPlantUpdate(BaseModel):
    nickname: Optional[str] = Field(None, min_length=1, max_length=50)
    
    @field_validator('nickname')
    @classmethod
    def validate_nickname(cls, v: Optional[str]) -> Optional[str]:
        """Validate nickname if provided"""
        if v is None:
            return v
        
        if not v.strip():
            raise ValueError('Nickname cannot be empty or whitespace only')
        
        v = v.strip()
        
        # Same validation as UserPlantBase
        dangerous_patterns = [
            '--', ';', '/*', '*/', 'DROP', 'DELETE', 'INSERT', 'UPDATE', 'SELECT',
            'UNION', 'ALTER', 'CREATE', 'EXEC', 'EXECUTE', 'xp_', 'sp_'
        ]
        v_upper = v.upper()
        for pattern in dangerous_patterns:
            if pattern in v_upper:
                raise ValueError('Nickname contains invalid characters')
        
        if v.count('<') > 0 or v.count('>') > 0:
            raise ValueError('Nickname cannot contain < or > characters')
        
        return v


class UserPlantResponse(UserPlantBase):
    id: int
    user_id: int
    personality_type_id: int  # Include in response but not in create
    qr_code: Optional[str]
    is_active: bool
    created_at: datetime
    welcome_message: Optional[str] = None  # For demo purposes
    sms_status: Optional[str] = None  # For demo purposes
    
    # Nested relationships
    plant_catalog: PlantCatalogResponse
    personality: PersonalityTypeResponse

    class Config:
        from_attributes = True


# Care Schedule Schemas
class CareScheduleBase(BaseModel):
    task_type: str = Field(..., description="Type of care task")
    frequency_days: int = Field(..., gt=0, le=365, description="Frequency in days")
    conditions: Optional[Dict[str, Any]] = None
    
    @field_validator('task_type')
    @classmethod
    def validate_task_type(cls, v: str) -> str:
        """Ensure task_type is valid"""
        valid_tasks = ["watering", "fertilizing", "misting", "pruning", "repotting", "cleaning", "rotating"]
        v = v.strip().lower()
        if v not in valid_tasks:
            raise ValueError(f'task_type must be one of: {", ".join(valid_tasks)}')
        return v


class CareScheduleCreate(CareScheduleBase):
    user_plant_id: int = Field(..., gt=0)
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
    task_type: str = Field(..., description="Type of care task")
    method: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = Field(None, max_length=500)
    
    @field_validator('task_type')
    @classmethod
    def validate_task_type(cls, v: str) -> str:
        """Ensure task_type is valid"""
        valid_tasks = ["watering", "fertilizing", "misting", "pruning", "repotting", "cleaning", "rotating"]
        v = v.strip().lower()
        if v not in valid_tasks:
            raise ValueError(f'task_type must be one of: {", ".join(valid_tasks)}')
        return v
    
    @field_validator('notes')
    @classmethod
    def validate_notes(cls, v: Optional[str]) -> Optional[str]:
        """Sanitize notes field"""
        if v is None:
            return v
        v = v.strip()
        if not v:
            return None
        # Prevent XSS
        if '<script' in v.lower() or '<iframe' in v.lower():
            raise ValueError('Notes contain invalid content')
        return v


class CareHistoryCreate(CareHistoryBase):
    user_plant_id: int = Field(..., gt=0)
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
