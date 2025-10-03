"""
Plivo SMS Provider Implementation
"""

import logging
from typing import Optional
from plivo import RestClient
from plivo.exceptions import PlivoRestException

from .sms_provider import SMSProvider, SMSResult
from ..core.config import settings

logger = logging.getLogger(__name__)


class PlivoProvider(SMSProvider):
    """Plivo SMS provider implementation"""
    
    def __init__(self):
        self.client = None
        self.phone_number = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Plivo client with credentials"""
        try:
            if not settings.plivo_auth_id or not settings.plivo_auth_token:
                logger.warning("Plivo credentials not configured - SMS will be logged only")
                return
            
            self.client = RestClient(settings.plivo_auth_id, settings.plivo_auth_token)
            self.phone_number = settings.plivo_phone_number
            
            if not self.phone_number:
                logger.warning("Plivo phone number not configured")
                return
            
            logger.info("Plivo client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Plivo client: {str(e)}")
            self.client = None
    
    def send_sms(self, to_phone: str, message: str, from_phone: Optional[str] = None) -> SMSResult:
        """Send SMS via Plivo"""
        try:
            # Use default phone number if not provided
            if not from_phone:
                from_phone = self.phone_number
            
            if not self.client or not from_phone:
                # Fallback: log message instead of sending
                logger.info(f"SMS (Plivo not configured): To: {to_phone}, Message: {message}")
                return SMSResult(
                    status="logged",
                    error="Plivo not configured - message logged only",
                    provider="plivo"
                )
            
            # Send SMS via Plivo
            response = self.client.messages.create(
                src=from_phone,
                dst=to_phone,
                text=message
            )
            
            logger.info(f"SMS sent successfully via Plivo: {response['message_uuid']} to {to_phone}")
            
            return SMSResult(
                status="sent",
                message_id=response['message_uuid'],
                provider="plivo"
            )
            
        except PlivoRestException as e:
            logger.error(f"Plivo SMS failed to {to_phone}: {e}")
            return SMSResult(
                status="failed",
                error=str(e),
                provider="plivo"
            )
        except Exception as e:
            logger.error(f"Unexpected error sending SMS to {to_phone}: {e}")
            return SMSResult(
                status="failed",
                error=str(e),
                provider="plivo"
            )
    
    def is_configured(self) -> bool:
        """Check if Plivo is properly configured"""
        return (
            self.client is not None and 
            self.phone_number is not None and
            settings.plivo_auth_id is not None and
            settings.plivo_auth_token is not None
        )
    
    def get_provider_name(self) -> str:
        """Get the provider name"""
        return "plivo"
