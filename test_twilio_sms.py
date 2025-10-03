#!/usr/bin/env python3
"""
Test script for Twilio SMS integration

This script tests:
1. Twilio client initialization
2. SMS sending functionality
3. Message status checking
"""

import os
import sys
import requests
import json
from datetime import datetime

# Add backend to path
sys.path.append('/Users/kellyoconor/plants-text-main/backend')

# Configuration
BASE_URL = "https://plants-text-production.up.railway.app/api/v1"
TEST_PHONE = "+1234567890"  # Replace with your test phone number

def test_twilio_configuration():
    """Test if Twilio is properly configured"""
    print("🔧 Testing Twilio Configuration")
    print("=" * 40)
    
    try:
        from backend.app.services.twilio_client import twilio_client
        
        if twilio_client.is_configured():
            print("✅ Twilio client is properly configured")
            print(f"📱 Phone number: {twilio_client.get_phone_number()}")
            return True
        else:
            print("❌ Twilio client is not configured")
            print("   Missing credentials or phone number")
            return False
            
    except Exception as e:
        print(f"❌ Error testing Twilio configuration: {e}")
        return False

def test_sms_sending():
    """Test SMS sending via API"""
    print("\n📱 Testing SMS Sending")
    print("=" * 40)
    
    # Test message
    test_message = f"🌱 Test message from PlantTexts! {datetime.now().strftime('%H:%M:%S')}"
    
    # Test via API endpoint
    sms_data = {
        "from_phone": TEST_PHONE,
        "message": test_message
    }
    
    try:
        print(f"Sending test SMS to {TEST_PHONE}...")
        response = requests.post(f"{BASE_URL}/sms/test/sms", json=sms_data)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ SMS test submitted: {result['status']}")
            print(f"📋 Task ID: {result.get('task_id', 'N/A')}")
            return True
        else:
            print(f"❌ SMS test failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing SMS: {e}")
        return False

def test_verification_flow():
    """Test the complete verification flow with SMS"""
    print("\n🔄 Testing Complete Verification Flow")
    print("=" * 40)
    
    # Step 1: Create user
    print("1️⃣ Creating test user...")
    user_data = {
        "phone": TEST_PHONE,
        "email": "test@example.com"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/users/find-or-create", json=user_data)
        if response.status_code != 200:
            print(f"❌ Failed to create user: {response.text}")
            return False
        
        user = response.json()
        user_id = user["id"]
        print(f"✅ User created: ID {user_id}")
        
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        return False
    
    # Step 2: Add plant (triggers welcome message)
    print("\n2️⃣ Adding plant (triggers welcome message)...")
    plant_data = {
        "user_id": user_id,
        "plant_catalog_id": 1,
        "nickname": "Test Plant"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/plants", json=plant_data)
        if response.status_code != 200:
            print(f"❌ Failed to add plant: {response.text}")
            return False
        
        print("✅ Plant added - welcome message should be sent!")
        print("📱 Check your phone for the welcome message from your plant!")
        
    except Exception as e:
        print(f"❌ Error adding plant: {e}")
        return False
    
    # Step 3: Simulate verification response
    print("\n3️⃣ Simulating verification response...")
    sms_data = {
        "from_phone": TEST_PHONE,
        "message": "YES"  # User responds to verification
    }
    
    try:
        response = requests.post(f"{BASE_URL}/sms/test/sms", json=sms_data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Verification response processed: {result['status']}")
            
            if result.get('status') == 'phone_verified':
                print("🎉 Phone verified! Contact card should be sent!")
                return True
            else:
                print(f"⚠️ Unexpected status: {result}")
                return False
        else:
            print(f"❌ Failed to process verification: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error processing verification: {e}")
        return False

def main():
    """Run all Twilio tests"""
    print("🧪 PlantTexts Twilio SMS Integration Test")
    print("=" * 50)
    
    # Test 1: Configuration
    config_ok = test_twilio_configuration()
    
    # Test 2: SMS Sending
    sms_ok = test_sms_sending()
    
    # Test 3: Complete Flow
    flow_ok = test_verification_flow()
    
    # Summary
    print("\n📊 Test Results Summary")
    print("=" * 30)
    print(f"Twilio Configuration: {'✅ PASS' if config_ok else '❌ FAIL'}")
    print(f"SMS Sending: {'✅ PASS' if sms_ok else '❌ FAIL'}")
    print(f"Verification Flow: {'✅ PASS' if flow_ok else '❌ FAIL'}")
    
    if config_ok and sms_ok and flow_ok:
        print("\n🎉 All tests passed! Twilio SMS integration is working!")
        print("\nNext steps:")
        print("1. Set up Twilio credentials in Railway")
        print("2. Configure webhook URL in Twilio console")
        print("3. Test with real phone numbers")
    else:
        print("\n⚠️ Some tests failed. Check the configuration and try again.")
        print("\nTo fix:")
        print("1. Set TWILIO_ACCOUNT_SID in Railway")
        print("2. Set TWILIO_AUTH_TOKEN in Railway") 
        print("3. Set TWILIO_PHONE_NUMBER in Railway")
        print("4. Redeploy the application")

if __name__ == "__main__":
    main()
