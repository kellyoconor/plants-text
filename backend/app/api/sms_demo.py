"""
Demo SMS Log Endpoint
Shows recent SMS messages for demo purposes
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import os
from ..core.database import get_db

router = APIRouter()

@router.get("/demo-log")
def get_demo_sms_log(db: Session = Depends(get_db)):
    """Get recent demo SMS messages from database"""
    try:
        from ..models.sms_log import SMSLog
        
        # Get all SMS logs, ordered by most recent first
        logs = db.query(SMSLog).order_by(SMSLog.created_at.desc()).limit(50).all()
        
        messages = [
            {
                "id": log.id,
                "to": log.to_phone,
                "from": log.from_phone,
                "message": log.message,
                "status": log.status,
                "timestamp": log.created_at.strftime("%Y-%m-%d %H:%M:%S")
            }
            for log in logs
        ]
        
        return {
            "status": "success",
            "count": len(messages),
            "messages": messages
        }
    
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "messages": []
        }

@router.post("/clear-demo-log")
def clear_demo_log():
    """Clear the demo SMS messages from memory"""
    try:
        from ..services.demo_provider import DemoProvider
        
        DemoProvider.clear_messages()
        
        return {
            "status": "success",
            "message": "Demo log cleared"
        }
    
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

