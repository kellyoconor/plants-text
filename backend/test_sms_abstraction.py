#!/usr/bin/env python3
"""
Test script for SMS abstraction layer
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.sms_manager import sms_manager
from app.services.sms_provider import SMSResult

def test_sms_abstraction():
    """Test the SMS abstraction layer"""
    print("🧪 Testing SMS Abstraction Layer")
    print("=" * 50)
    
    # Test phone number (demo mode - any number works)
    test_phone = "+1234567890"  # Demo mode - this will be logged
    test_message = "🌱 Test message from Plant Texts SMS abstraction layer!"
    
    print(f"📱 Testing SMS to: {test_phone}")
    print(f"💬 Message: {test_message}")
    print()
    
    # Check available providers
    providers = sms_manager.get_available_providers()
    print(f"🔧 Available providers: {providers}")
    print(f"✅ SMS Manager configured: {sms_manager.is_configured()}")
    print()
    
    # Send test SMS
    print("📤 Sending test SMS...")
    result = sms_manager.send_sms(
        to_phone=test_phone,
        message=test_message
    )
    
    # Display results
    print("📊 Results:")
    print(f"   Status: {result.status}")
    print(f"   Provider: {result.provider}")
    print(f"   Message ID: {result.message_id}")
    if result.error:
        print(f"   Error: {result.error}")
    if result.cost:
        print(f"   Cost: {result.cost}")
    
    print()
    print("✅ SMS Abstraction Layer Test Complete!")

if __name__ == "__main__":
    test_sms_abstraction()
