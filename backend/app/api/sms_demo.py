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
    """Get recent demo SMS messages from log file"""
    try:
        log_file = os.path.join(os.path.dirname(__file__), "..", "..", "sms_logs.txt")
        
        if not os.path.exists(log_file):
            return {
                "status": "no_logs",
                "message": "No SMS logs found yet",
                "messages": []
            }
        
        with open(log_file, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Parse the log file into individual messages
        messages = []
        entries = content.split("============================================================")
        
        for entry in entries:
            if "DEMO SMS" in entry:
                lines = entry.strip().split("\n")
                message_data = {}
                for line in lines:
                    if "DEMO SMS #" in line:
                        message_data["timestamp"] = line.split("[")[1].split("]")[0] if "[" in line else ""
                        message_data["number"] = line.split("#")[1].split("[")[0].strip() if "#" in line else ""
                    elif "To:" in line:
                        message_data["to"] = line.split("To:")[1].strip()
                    elif "From:" in line:
                        message_data["from"] = line.split("From:")[1].strip()
                    elif "Message:" in line:
                        message_data["message"] = line.split("Message:")[1].strip()
                
                if message_data:
                    messages.append(message_data)
        
        return {
            "status": "success",
            "count": len(messages),
            "messages": messages,
            "raw_log": content if len(content) < 5000 else content[-5000:]  # Last 5000 chars
        }
    
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "messages": []
        }

@router.post("/clear-demo-log")
def clear_demo_log():
    """Clear the demo SMS log file"""
    try:
        log_file = os.path.join(os.path.dirname(__file__), "..", "..", "sms_logs.txt")
        
        # Reset the log file with header
        with open(log_file, "w", encoding="utf-8") as f:
            f.write("""# Plant Texts SMS Logs
# Demo Mode - Messages are logged instead of sent

## SMS Log Format:
# 🌱 DEMO SMS #[number] [timestamp]
# 📱 To: [phone_number]
# 📤 From: [sender_name]
# 💬 Message: [message_content]
# ============================================================

## Recent SMS Messages:

""")
        
        return {
            "status": "success",
            "message": "Demo log cleared"
        }
    
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

