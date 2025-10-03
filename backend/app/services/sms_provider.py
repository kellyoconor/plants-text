"""
SMS Provider Abstraction Layer

Provides a clean interface for different SMS providers (Twilio, Plivo, etc.)
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class SMSResult:
    """Standardized SMS result"""
    status: str  # "sent", "failed", "logged"
    message_id: Optional[str] = None
    error: Optional[str] = None
    cost: Optional[float] = None
    provider: Optional[str] = None


class SMSProvider(ABC):
    """Abstract base class for SMS providers"""
    
    @abstractmethod
    def send_sms(self, to_phone: str, message: str, from_phone: Optional[str] = None) -> SMSResult:
        """
        Send an SMS message
        
        Args:
            to_phone: Recipient phone number
            message: SMS message content
            from_phone: Sender phone number (optional)
            
        Returns:
            SMSResult with status and details
        """
        pass
    
    @abstractmethod
    def is_configured(self) -> bool:
        """Check if provider is properly configured"""
        pass
    
    @abstractmethod
    def get_provider_name(self) -> str:
        """Get the provider name"""
        pass

