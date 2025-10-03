"""
Demo SMS Log Endpoint
Shows recent SMS messages for demo purposes
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import os

router = APIRouter()

@router.get("/demo-log")
def get_demo_sms_log():
    """Get recent demo SMS messages from memory"""
    try:
        from ..services.demo_provider import DemoProvider
        
        messages = DemoProvider.get_all_messages()
        
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

