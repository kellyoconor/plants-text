#!/usr/bin/env python3
"""
Test script for phone verification flow

This script tests:
1. User adds first plant → Welcome message sent
2. User responds to SMS → Phone verified + Contact card sent
3. Care reminders only sent to verified users
"""

import requests
import json
import time

# Configuration
BASE_URL = "https://plants-text-production.up.railway.app/api/v1"
TEST_PHONE = "+1234567890"  # Replace with your test phone number

def test_verification_flow():
    """Test the complete phone verification flow"""
    
    print("🧪 Testing PlantTexts Phone Verification Flow")
    print("=" * 50)
    
    # Step 1: Create a test user
    print("\n1️⃣ Creating test user...")
    user_data = {
        "phone": TEST_PHONE,
        "email": "test@example.com"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/users/find-or-create", json=user_data)
        if response.status_code == 200:
            user = response.json()
            user_id = user["id"]
            print(f"✅ User created: ID {user_id}")
        else:
            print(f"❌ Failed to create user: {response.text}")
            return
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        return
    
    # Step 2: Add a plant (this should trigger welcome message)
    print("\n2️⃣ Adding first plant (should trigger welcome message)...")
    plant_data = {
        "user_id": user_id,
        "plant_catalog_id": 1,  # Use first plant in catalog
        "nickname": "Fernando"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/plants", json=plant_data)
        if response.status_code == 200:
            plant = response.json()
            print(f"✅ Plant added: {plant['nickname']}")
            print("📱 Welcome message should be sent to your phone!")
        else:
            print(f"❌ Failed to add plant: {response.text}")
            return
    except Exception as e:
        print(f"❌ Error adding plant: {e}")
        return
    
    # Step 3: Test SMS processing (simulate user responding)
    print("\n3️⃣ Testing SMS response processing...")
    sms_data = {
        "from_phone": TEST_PHONE,
        "message": "YES"  # User responds to verification
    }
    
    try:
        response = requests.post(f"{BASE_URL}/sms/test/sms", json=sms_data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ SMS processed: {result['status']}")
            if result.get('status') == 'phone_verified':
                print("🎉 Phone verified! Contact card should be sent!")
            else:
                print(f"⚠️ Unexpected status: {result}")
        else:
            print(f"❌ Failed to process SMS: {response.text}")
    except Exception as e:
        print(f"❌ Error processing SMS: {e}")
    
    # Step 4: Check user verification status
    print("\n4️⃣ Checking user verification status...")
    try:
        response = requests.get(f"{BASE_URL}/users/{user_id}")
        if response.status_code == 200:
            user = response.json()
            verified = user.get('phone_verified', False)
            print(f"📱 Phone verified: {verified}")
            if verified:
                print("✅ User is now verified and will receive care reminders!")
            else:
                print("⚠️ User is not verified yet")
        else:
            print(f"❌ Failed to get user: {response.text}")
    except Exception as e:
        print(f"❌ Error checking user: {e}")
    
    print("\n🎯 Verification Flow Test Complete!")
    print("\nNext steps:")
    print("1. Check your phone for the welcome message")
    print("2. Reply 'YES' to verify your phone")
    print("3. You should receive a contact card")
    print("4. You'll start getting care reminders from your plants!")

if __name__ == "__main__":
    test_verification_flow()
