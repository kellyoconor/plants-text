"""
SMS Log Model for Demo Mode
Stores demo SMS messages in the database
"""

from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from ..core.database import Base


class SMSLog(Base):
    """Demo SMS message log"""
    __tablename__ = "sms_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    to_phone = Column(String, index=True)
    from_phone = Column(String)
    message = Column(Text)
    status = Column(String, default="logged")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

