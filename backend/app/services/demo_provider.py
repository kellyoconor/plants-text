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
    
    def __init__(self):
        self.message_count = 0
        self.log_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sms_logs.txt")
        logger.info("Demo SMS Provider initialized - messages will be logged")
    
    def send_sms(self, to_phone: str, message: str, from_phone: Optional[str] = None) -> SMSResult:
        """Log SMS message instead of sending"""
        self.message_count += 1
        
        # Log the message with timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
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
        
        # Write to logs file
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
        return self.message_count
    
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
