"""
SMS Manager - Handles provider selection and fallback
"""

import logging
from typing import Optional
from .sms_provider import SMSProvider, SMSResult
from .twilio_client import TwilioProvider
from .plivo_provider import PlivoProvider
from .demo_provider import DemoProvider
from ..core.config import settings

logger = logging.getLogger(__name__)


class SMSManager:
    """Manages SMS providers with fallback logic"""
    
    def __init__(self):
        self.providers = []
        self._initialize_providers()
    
    def _initialize_providers(self):
        """Initialize available SMS providers"""
        # Add Demo provider as primary (always works)
        demo_provider = DemoProvider()
        self.providers.append(demo_provider)
        logger.info("Demo provider initialized - messages will be logged")
        
        # Add Plivo as secondary (no A2P 10DLC issues)
        plivo_provider = PlivoProvider()
        if plivo_provider.is_configured():
            self.providers.append(plivo_provider)
            logger.info("Plivo provider initialized")
        else:
            logger.warning("Plivo not configured")
        
        # Add Twilio as fallback
        twilio_provider = TwilioProvider()
        if twilio_provider.is_configured():
            self.providers.append(twilio_provider)
            logger.info("Twilio provider initialized")
        else:
            logger.warning("Twilio not configured")
    
    def send_sms(self, to_phone: str, message: str, from_phone: Optional[str] = None) -> SMSResult:
        """
        Send SMS using the best available provider
        
        Args:
            to_phone: Recipient phone number
            message: SMS message content
            from_phone: Sender phone number (optional)
            
        Returns:
            SMSResult with status and details
        """
        if not self.providers:
            logger.info(f"SMS (No providers configured): To: {to_phone}, Message: {message}")
            return SMSResult(
                status="logged",
                error="No SMS providers configured - message logged only"
            )
        
        # Try each provider in order
        for provider in self.providers:
            try:
                logger.info(f"Attempting to send SMS via {provider.get_provider_name()}")
                result = provider.send_sms(to_phone, message, from_phone)
                
                if result.status == "sent":
                    logger.info(f"SMS sent successfully via {provider.get_provider_name()}")
                    return result
                else:
                    logger.warning(f"SMS failed via {provider.get_provider_name()}: {result.error}")
                    
            except Exception as e:
                logger.error(f"Unexpected error with {provider.get_provider_name()}: {e}")
                continue
        
        # All providers failed
        logger.error(f"All SMS providers failed for {to_phone}")
        return SMSResult(
            status="failed",
            error="All SMS providers failed"
        )
    
    def get_available_providers(self) -> list[str]:
        """Get list of available provider names"""
        return [provider.get_provider_name() for provider in self.providers]
    
    def is_configured(self) -> bool:
        """Check if any providers are configured"""
        return len(self.providers) > 0


# Global SMS manager instance
sms_manager = SMSManager()
