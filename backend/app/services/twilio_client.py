"""
Twilio SMS Client Service

Handles all SMS operations through Twilio:
- Sending SMS messages
- Error handling and retries
- Message status tracking
"""

from twilio.rest import Client
from twilio.base.exceptions import TwilioException
from typing import Optional, Dict, Any
import logging
from ..core.config import settings

logger = logging.getLogger(__name__)

class TwilioClient:
    """Twilio SMS client with error handling"""
    
    def __init__(self):
        self.client = None
        self.phone_number = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Twilio client with credentials"""
        try:
            if not settings.twilio_account_sid or not settings.twilio_auth_token:
                logger.warning("Twilio credentials not configured - SMS will be logged only")
                return
            
            self.client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
            self.phone_number = settings.twilio_phone_number
            
            if not self.phone_number:
                logger.warning("Twilio phone number not configured")
                return
            
            logger.info("Twilio client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Twilio client: {str(e)}")
            self.client = None
    
    def send_sms(self, to_phone: str, message: str, from_phone: Optional[str] = None) -> Dict[str, Any]:
        """
        Send SMS message via Twilio
        
        Args:
            to_phone: Recipient phone number
            message: SMS message content
            from_phone: Sender phone number (uses default if not provided)
            
        Returns:
            Dict with send status and message details
        """
        try:
            # Use default phone number if not provided
            if not from_phone:
                from_phone = self.phone_number
            
            if not self.client or not from_phone:
                # Fallback: log message instead of sending
                logger.info(f"SMS (Twilio not configured): To: {to_phone}, Message: {message}")
                return {
                    "status": "logged",
                    "to": to_phone,
                    "message": message,
                    "error": "Twilio not configured - message logged only"
                }
            
            # Send SMS via Twilio
            message_obj = self.client.messages.create(
                body=message,
                from_=from_phone,
                to=to_phone
            )
            
            logger.info(f"SMS sent successfully: SID {message_obj.sid} to {to_phone}")
            
            return {
                "status": "sent",
                "sid": message_obj.sid,
                "to": to_phone,
                "from": from_phone,
                "message": message,
                "status_twilio": message_obj.status,
                "price": message_obj.price,
                "price_unit": message_obj.price_unit
            }
            
        except TwilioException as e:
            logger.error(f"Twilio error sending SMS to {to_phone}: {str(e)}")
            return {
                "status": "failed",
                "to": to_phone,
                "message": message,
                "error": f"Twilio error: {str(e)}",
                "error_code": getattr(e, 'code', None)
            }
            
        except Exception as e:
            logger.error(f"Unexpected error sending SMS to {to_phone}: {str(e)}")
            return {
                "status": "failed",
                "to": to_phone,
                "message": message,
                "error": f"Unexpected error: {str(e)}"
            }
    
    def get_message_status(self, message_sid: str) -> Dict[str, Any]:
        """
        Get status of a sent message
        
        Args:
            message_sid: Twilio message SID
            
        Returns:
            Dict with message status details
        """
        try:
            if not self.client:
                return {"status": "error", "message": "Twilio client not initialized"}
            
            message = self.client.messages(message_sid).fetch()
            
            return {
                "status": "success",
                "sid": message.sid,
                "status_twilio": message.status,
                "to": message.to,
                "from": message.from_,
                "body": message.body,
                "price": message.price,
                "price_unit": message.price_unit,
                "date_created": message.date_created.isoformat() if message.date_created else None,
                "date_sent": message.date_sent.isoformat() if message.date_sent else None,
                "date_updated": message.date_updated.isoformat() if message.date_updated else None,
                "error_code": message.error_code,
                "error_message": message.error_message
            }
            
        except TwilioException as e:
            logger.error(f"Error fetching message status for {message_sid}: {str(e)}")
            return {
                "status": "error",
                "sid": message_sid,
                "error": str(e)
            }
    
    def is_configured(self) -> bool:
        """Check if Twilio is properly configured"""
        return (
            self.client is not None and 
            self.phone_number is not None and
            settings.twilio_account_sid is not None and
            settings.twilio_auth_token is not None
        )
    
    def get_phone_number(self) -> Optional[str]:
        """Get the configured Twilio phone number"""
        return self.phone_number

# Global Twilio client instance
twilio_client = TwilioClient()
