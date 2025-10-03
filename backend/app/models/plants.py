from sqlalchemy import Column, Integer, String, JSON, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class PlantCatalog(Base):
    """Plant species catalog with care requirements"""
    __tablename__ = "plants_catalog"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    species = Column(String(100), nullable=False)
    care_requirements = Column(JSON, nullable=False)  # Watering freq, light, humidity, etc.
    difficulty_level = Column(String(20), default="medium")  # easy, medium, hard
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user_plants = relationship("UserPlant", back_populates="plant_catalog")


class User(Base):
    """User accounts and subscription info"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(20), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    subscription_tier = Column(String(20), default="free")  # free, premium
    timezone = Column(String(50), default="UTC")
    location = Column(String(100))  # For environmental adjustments
    is_active = Column(Boolean, default=True)
    # phone_verified = Column(Boolean, default=False)  # Phone verification status - removed
    # verified_at = Column(DateTime(timezone=True), nullable=True)  # When phone was verified - removed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    plants = relationship("UserPlant", back_populates="user")


class PersonalityType(Base):
    """Plant personality definitions"""
    __tablename__ = "personality_types"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text)
    prompt_template = Column(Text, nullable=False)
    voice_traits = Column(JSON)  # Personality characteristics
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user_plants = relationship("UserPlant", back_populates="personality")


class UserPlant(Base):
    """Individual plants owned by users"""
    __tablename__ = "user_plants"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plant_catalog_id = Column(Integer, ForeignKey("plants_catalog.id"), nullable=False)
    personality_type_id = Column(Integer, ForeignKey("personality_types.id"), nullable=False)
    
    nickname = Column(String(100), nullable=False)
    qr_code = Column(String(100), unique=True, nullable=True, index=True)
    is_active = Column(Boolean, default=True)
    last_watered = Column(DateTime(timezone=True), nullable=True)
    last_fertilized = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="plants")
    plant_catalog = relationship("PlantCatalog", back_populates="user_plants")
    personality = relationship("PersonalityType", back_populates="user_plants")
    care_schedules = relationship("CareSchedule", back_populates="user_plant")
    care_history = relationship("CareHistory", back_populates="user_plant")
    conversations = relationship("ConversationSession", back_populates="user_plant")


class CareSchedule(Base):
    """Care scheduling for individual plants"""
    __tablename__ = "care_schedules"
    
    id = Column(Integer, primary_key=True, index=True)
    user_plant_id = Column(Integer, ForeignKey("user_plants.id"), nullable=False)
    
    task_type = Column(String(50), nullable=False)  # watering, fertilizing, etc.
    frequency_days = Column(Integer, nullable=False)
    next_due = Column(DateTime(timezone=True), nullable=False, index=True)
    conditions = Column(JSON)  # Environmental conditions that affect timing
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user_plant = relationship("UserPlant", back_populates="care_schedules")


class CareHistory(Base):
    """History of completed care tasks"""
    __tablename__ = "care_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_plant_id = Column(Integer, ForeignKey("user_plants.id"), nullable=False)
    
    task_type = Column(String(50), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=False, index=True)
    method = Column(String(50))  # sms, manual, sensor
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user_plant = relationship("UserPlant", back_populates="care_history")


class ConversationSession(Base):
    """Conversation state for plant personalities"""
    __tablename__ = "conversation_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_plant_id = Column(Integer, ForeignKey("user_plants.id"), nullable=False)
    
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    context = Column(JSON)  # Conversation memory and context
    last_message_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relationships
    user_plant = relationship("UserPlant", back_populates="conversations")
