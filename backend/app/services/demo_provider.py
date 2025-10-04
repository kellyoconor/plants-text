"""
Demo SMS Provider - Logs messages instead of sending
Perfect for development and testing
"""

import logging
import os
from typing import Optional
from datetime import datetime
from .sms_provider import SMSProvider, SMSResult

logger = logging.getLogger(__name__)


class DemoProvider(SMSProvider):
    """Demo SMS provider that logs messages instead of sending"""
    
    # Class-level list to store messages in memory (persists across requests)
    _messages = []
    
    def __init__(self):
        self.message_count = len(DemoProvider._messages)
        self.log_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sms_logs.txt")
        logger.info("Demo SMS Provider initialized - messages will be logged")
    
    def send_sms(self, to_phone: str, message: str, from_phone: Optional[str] = None) -> SMSResult:
        """Log SMS message instead of sending"""
        self.message_count += 1
        
        # Log the message with timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Store in memory (class-level list)
        message_data = {
            "number": self.message_count,
            "timestamp": timestamp,
            "to": to_phone,
            "from": from_phone or 'Demo Plant',
            "message": message
        }
        DemoProvider._messages.append(message_data)
        
        # Also save to database for persistence across workers
        try:
            from ..core.database import SessionLocal
            from ..models.sms_log import SMSLog
            
            db = SessionLocal()
            sms_log = SMSLog(
                to_phone=to_phone,
                from_phone=from_phone or 'Demo Plant',
                message=message,
                status="logged"
            )
            db.add(sms_log)
            db.commit()
            db.close()
        except Exception as e:
            logger.error(f"Failed to save SMS to database: {e}")
        
        logger.info(f"📱 DEMO SMS #{self.message_count} [{timestamp}]")
        logger.info(f"   To: {to_phone}")
        logger.info(f"   From: {from_phone or 'Demo Plant'}")
        logger.info(f"   Message: {message}")
        logger.info("   " + "="*50)
        
        # Also print to console for visibility
        print(f"\n🌱 DEMO SMS #{self.message_count} [{timestamp}]")
        print(f"📱 To: {to_phone}")
        print(f"📤 From: {from_phone or 'Demo Plant'}")
        print(f"💬 Message: {message}")
        print("="*60)
        
        # Write to logs file (still do this for local development)
        self._write_to_log_file(to_phone, from_phone or 'Demo Plant', message, timestamp)
        
        return SMSResult(
            status="logged",
            message_id=f"demo-{self.message_count}-{timestamp.replace(':', '-')}",
            provider="demo"
        )
    
    def is_configured(self) -> bool:
        """Demo provider is always configured"""
        return True
    
    def get_provider_name(self) -> str:
        """Get the provider name"""
        return "demo"
    
    def get_message_count(self) -> int:
        """Get total number of messages logged"""
        return len(DemoProvider._messages)
    
    @classmethod
    def get_all_messages(cls):
        """Get all messages from memory"""
        return cls._messages
    
    @classmethod
    def clear_messages(cls):
        """Clear all messages from memory"""
        cls._messages = []
    
    def _write_to_log_file(self, to_phone: str, from_phone: str, message: str, timestamp: str):
        """Write SMS message to logs file"""
        try:
            log_entry = f"""
🌱 DEMO SMS #{self.message_count} [{timestamp}]
📱 To: {to_phone}
📤 From: {from_phone}
💬 Message: {message}
============================================================

"""
            with open(self.log_file, "a", encoding="utf-8") as f:
                f.write(log_entry)
        except Exception as e:
            logger.error(f"Failed to write to log file: {e}")
