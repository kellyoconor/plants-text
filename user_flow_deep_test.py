#!/usr/bin/env python3
"""
DEEP User Flow Testing Suite
Tests every aspect of the user journey in extreme detail
"""

import asyncio
import json
import logging
import traceback
from datetime import datetime
from typing import Dict, List, Any, Optional
import requests
import sys
import os
from pathlib import Path
import random
import time

# Add the backend directory to Python path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

# GitHub API configuration
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
GITHUB_REPO = os.getenv('GITHUB_REPO', 'kellyoconor/plants-text')
GITHUB_API_URL = f"https://api.github.com/repos/{GITHUB_REPO}/issues"

# Test configuration
BASE_URL = "http://localhost:8000/api/v1"
FRONTEND_URL = "http://localhost:3000"

class TestResult:
    def __init__(self, test_name: str, success: bool, error: Optional[str] = None, details: Optional[Dict] = None):
        self.test_name = test_name
        self.success = success
        self.error = error
        self.details = details or {}
        self.timestamp = datetime.now().isoformat()

class GitHubIssueTracker:
    def __init__(self, token: Optional[str] = None):
        self.token = token
        self.headers = {
            'Authorization': f'token {token}' if token else None,
            'Accept': 'application/vnd.github.v3+json'
        }
    
    def create_issue(self, title: str, body: str, labels: List[str] = None) -> bool:
        """Create a GitHub issue for a test failure"""
        if not self.token:
            print("⚠️  GitHub token not provided. Issue not created.")
            return False
        
        data = {
            'title': title,
            'body': body,
            'labels': labels or ['bug', 'testing', 'user-flow']
        }
        
        try:
            response = requests.post(GITHUB_API_URL, headers=self.headers, json=data)
            if response.status_code == 201:
                issue_url = response.json().get('html_url')
                print(f"✅ GitHub issue created: {issue_url}")
                return True
            else:
                print(f"❌ Failed to create GitHub issue: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Error creating GitHub issue: {e}")
            return False

class DeepUserFlowTestSuite:
    def __init__(self):
        self.results: List[TestResult] = []
        self.github_tracker = GitHubIssueTracker(GITHUB_TOKEN)
        self.setup_logging()
        
        # Test data storage
        self.test_users = []
        self.test_plants = []
        self.test_conversations = []
        
    def setup_logging(self):
        """Setup logging for test results"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('deep_user_flow_test.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def add_result(self, result: TestResult):
        """Add a test result and create GitHub issue if failed"""
        self.results.append(result)
        
        if not result.success:
            self.logger.error(f"❌ {result.test_name} FAILED: {result.error}")
            
            # Create GitHub issue for failure
            title = f"User Flow Issue: {result.test_name}"
            body = f"""
## User Flow Test Failure

**Test Name:** {result.test_name}
**Category:** User Flow - Deep Testing
**Timestamp:** {result.timestamp}
**Error:** {result.error}

### Test Details
```json
{json.dumps(result.details, indent=2)}
```

### Stack Trace
```
{result.details.get('traceback', 'No traceback available')}
```

### Impact Assessment
This failure affects the core user experience and should be prioritized for fixing.

---
*This issue was automatically created by the deep user flow test suite*
            """
            self.github_tracker.create_issue(title, body, ['bug', 'testing', 'user-flow', 'high-priority'])
        else:
            self.logger.info(f"✅ {result.test_name} PASSED")

    async def test_user_registration_variations(self):
        """Test different user registration scenarios"""
        print("\n👤 Testing User Registration Variations...")
        
        # Test various phone number formats
        phone_formats = [
            "+1234567890",
            "+1-234-567-8901", 
            "+1 (234) 567-8902",
            "234-567-8903",
            "(234) 567-8904",
            "2345678905"
        ]
        
        for i, phone in enumerate(phone_formats):
            try:
                user_data = {"phone": phone}
                response = requests.post(f"{BASE_URL}/users", json=user_data)
                
                if response.status_code in [200, 201]:
                    user = response.json()
                    self.test_users.append(user)
                    self.add_result(TestResult(
                        f"User Registration - Format {i+1}", 
                        True, 
                        details={"phone_format": phone, "user_id": user["id"]}
                    ))
                else:
                    self.add_result(TestResult(
                        f"User Registration - Format {i+1}", 
                        False, 
                        f"HTTP {response.status_code}: {response.text}",
                        {"phone_format": phone, "response": response.text}
                    ))
            except Exception as e:
                self.add_result(TestResult(
                    f"User Registration - Format {i+1}", 
                    False, 
                    str(e),
                    {"traceback": traceback.format_exc(), "phone_format": phone}
                ))

        # Test edge cases for user registration
        edge_cases = [
            ("Empty phone", {"phone": ""}),
            ("Null phone", {"phone": None}),
            ("Very long phone", {"phone": "+1234567890123456789012345"}),
            ("Invalid characters", {"phone": "+123abc456def"}),
            ("Just numbers", {"phone": "1234567890"}),
            ("International format", {"phone": "+44 20 7946 0958"}),
        ]
        
        for case_name, user_data in edge_cases:
            try:
                response = requests.post(f"{BASE_URL}/users", json=user_data)
                
                # For edge cases, we expect either success or proper error handling
                if response.status_code in [200, 201]:
                    user = response.json()
                    self.add_result(TestResult(
                        f"User Registration Edge Case - {case_name}", 
                        True, 
                        details={"case": case_name, "user_id": user["id"], "accepted": True}
                    ))
                elif 400 <= response.status_code < 500:
                    # Proper error handling
                    self.add_result(TestResult(
                        f"User Registration Edge Case - {case_name}", 
                        True, 
                        details={"case": case_name, "proper_error": response.status_code}
                    ))
                else:
                    # Unexpected server error
                    self.add_result(TestResult(
                        f"User Registration Edge Case - {case_name}", 
                        False, 
                        f"Unexpected server error: HTTP {response.status_code}",
                        {"case": case_name, "response": response.text}
                    ))
            except Exception as e:
                self.add_result(TestResult(
                    f"User Registration Edge Case - {case_name}", 
                    False, 
                    str(e),
                    {"traceback": traceback.format_exc(), "case": case_name}
                ))

    async def test_plant_onboarding_journey(self):
        """Test the complete plant onboarding process"""
        print("\n🌱 Testing Plant Onboarding Journey...")
        
        if not self.test_users:
            self.add_result(TestResult("Plant Onboarding Setup", False, "No test users available"))
            return
        
        # Get plant catalog
        try:
            catalog_response = requests.get(f"{BASE_URL}/catalog")
            if catalog_response.status_code != 200:
                self.add_result(TestResult("Plant Catalog Access", False, f"HTTP {catalog_response.status_code}"))
                return
            
            catalog = catalog_response.json()
            self.add_result(TestResult("Plant Catalog Access", True, details={"plant_count": len(catalog)}))
        except Exception as e:
            self.add_result(TestResult("Plant Catalog Access", False, str(e), {"traceback": traceback.format_exc()}))
            return

        # Test plant creation with different scenarios
        plant_scenarios = [
            {"nickname": "My First Plant", "location": "Living Room"},
            {"nickname": "Kitchen Herb", "location": "Kitchen Counter"},
            {"nickname": "Bedroom Beauty", "location": "Bedroom Window"},
            {"nickname": "Office Companion", "location": "Desk"},
            {"nickname": "Bathroom Plant", "location": "Bathroom Shelf"},
            {"nickname": "Plant with Emoji 🌿", "location": "Sunny Spot ☀️"},
            {"nickname": "Very Long Plant Name That Goes On And On", "location": "Very Specific Location Description"},
            {"nickname": "Plant123", "location": "Room #1"},
        ]
        
        user = self.test_users[0]  # Use first test user
        
        for i, plant_scenario in enumerate(plant_scenarios):
            try:
                # Use different plants from catalog
                catalog_plant = catalog[i % len(catalog)]
                
                plant_data = {
                    "user_id": user["id"],
                    "plant_catalog_id": catalog_plant["id"],
                    **plant_scenario
                }
                
                response = requests.post(f"{BASE_URL}/plants", json=plant_data)
                
                if response.status_code in [200, 201]:
                    plant = response.json()
                    self.test_plants.append(plant)
                    
                    # Verify plant has personality assigned
                    personality = plant.get("personality", {})
                    personality_name = personality.get("name", "unknown")
                    
                    self.add_result(TestResult(
                        f"Plant Creation - {plant_scenario['nickname'][:20]}...", 
                        True, 
                        details={
                            "plant_id": plant["id"],
                            "personality": personality_name,
                            "catalog_plant": catalog_plant["name"]
                        }
                    ))
                    
                    # Test immediate plant retrieval
                    get_response = requests.get(f"{BASE_URL}/users/{user['id']}/plants")
                    if get_response.status_code == 200:
                        user_plants = get_response.json()
                        plant_found = any(p["id"] == plant["id"] for p in user_plants)
                        
                        if plant_found:
                            self.add_result(TestResult(f"Plant Retrieval - {plant_scenario['nickname'][:20]}...", True))
                        else:
                            self.add_result(TestResult(
                                f"Plant Retrieval - {plant_scenario['nickname'][:20]}...", 
                                False, 
                                "Plant not found in user's plant list"
                            ))
                    else:
                        self.add_result(TestResult(
                            f"Plant Retrieval - {plant_scenario['nickname'][:20]}...", 
                            False, 
                            f"HTTP {get_response.status_code}: {get_response.text}"
                        ))
                        
                else:
                    self.add_result(TestResult(
                        f"Plant Creation - {plant_scenario['nickname'][:20]}...", 
                        False, 
                        f"HTTP {response.status_code}: {response.text}",
                        {"plant_data": plant_data}
                    ))
            except Exception as e:
                self.add_result(TestResult(
                    f"Plant Creation - {plant_scenario['nickname'][:20]}...", 
                    False, 
                    str(e),
                    {"traceback": traceback.format_exc(), "plant_scenario": plant_scenario}
                ))

    async def test_dashboard_functionality_deep(self):
        """Deep test of dashboard functionality"""
        print("\n📊 Testing Dashboard Functionality (Deep)...")
        
        for user in self.test_users[:3]:  # Test first 3 users
            try:
                # Test dashboard access
                response = requests.get(f"{BASE_URL}/users/{user['id']}/dashboard")
                
                if response.status_code == 200:
                    dashboard = response.json()
                    
                    # Validate dashboard structure
                    required_fields = ["user", "plants", "upcoming_care"]
                    missing_fields = [field for field in required_fields if field not in dashboard]
                    
                    if not missing_fields:
                        # Deep validation of dashboard content
                        user_data = dashboard["user"]
                        plants_data = dashboard["plants"]
                        care_data = dashboard["upcoming_care"]
                        
                        # Validate user data
                        if user_data.get("id") == user["id"]:
                            self.add_result(TestResult(
                                f"Dashboard User Data - User {user['id']}", 
                                True, 
                                details={"user_fields": list(user_data.keys())}
                            ))
                        else:
                            self.add_result(TestResult(
                                f"Dashboard User Data - User {user['id']}", 
                                False, 
                                "User ID mismatch in dashboard"
                            ))
                        
                        # Validate plants data
                        if isinstance(plants_data, list):
                            plant_count = len(plants_data)
                            self.add_result(TestResult(
                                f"Dashboard Plants Data - User {user['id']}", 
                                True, 
                                details={"plant_count": plant_count}
                            ))
                            
                            # Validate each plant has required fields
                            for i, plant in enumerate(plants_data):
                                required_plant_fields = ["id", "nickname", "plant_catalog", "personality"]
                                missing_plant_fields = [field for field in required_plant_fields if field not in plant]
                                
                                if not missing_plant_fields:
                                    self.add_result(TestResult(
                                        f"Dashboard Plant {i+1} Structure - User {user['id']}", 
                                        True
                                    ))
                                else:
                                    self.add_result(TestResult(
                                        f"Dashboard Plant {i+1} Structure - User {user['id']}", 
                                        False, 
                                        f"Missing fields: {missing_plant_fields}"
                                    ))
                        else:
                            self.add_result(TestResult(
                                f"Dashboard Plants Data - User {user['id']}", 
                                False, 
                                "Plants data is not a list"
                            ))
                        
                        # Validate care data
                        if isinstance(care_data, list):
                            self.add_result(TestResult(
                                f"Dashboard Care Data - User {user['id']}", 
                                True, 
                                details={"care_items": len(care_data)}
                            ))
                        else:
                            self.add_result(TestResult(
                                f"Dashboard Care Data - User {user['id']}", 
                                False, 
                                "Care data is not a list"
                            ))
                            
                    else:
                        self.add_result(TestResult(
                            f"Dashboard Structure - User {user['id']}", 
                            False, 
                            f"Missing required fields: {missing_fields}",
                            {"dashboard_keys": list(dashboard.keys())}
                        ))
                else:
                    self.add_result(TestResult(
                        f"Dashboard Access - User {user['id']}", 
                        False, 
                        f"HTTP {response.status_code}: {response.text}"
                    ))
            except Exception as e:
                self.add_result(TestResult(
                    f"Dashboard Test - User {user['id']}", 
                    False, 
                    str(e),
                    {"traceback": traceback.format_exc()}
                ))

    async def test_chat_functionality_comprehensive(self):
        """Comprehensive chat functionality testing"""
        print("\n💬 Testing Chat Functionality (Comprehensive)...")
        
        if not self.test_plants:
            self.add_result(TestResult("Chat Setup", False, "No test plants available"))
            return
        
        # Test different types of conversations
        conversation_scenarios = [
            # Basic greetings
            {"category": "Greetings", "messages": ["Hello", "Hi there", "Good morning", "Hey plant!"]},
            
            # Care-related questions
            {"category": "Care Questions", "messages": [
                "Do you need water?", 
                "How are you feeling?", 
                "Are you thirsty?", 
                "Do you need fertilizer?",
                "Should I mist you?"
            ]},
            
            # Personality exploration
            {"category": "Personality", "messages": [
                "Tell me about yourself",
                "What's your personality like?",
                "Are you dramatic?",
                "Are you sarcastic?",
                "What makes you unique?"
            ]},
            
            # Care actions
            {"category": "Care Actions", "messages": [
                "I just watered you",
                "I gave you fertilizer",
                "I moved you to a sunny spot",
                "I pruned your leaves",
                "I repotted you"
            ]},
            
            # Compliments and encouragement
            {"category": "Compliments", "messages": [
                "You look beautiful today",
                "Your leaves are so green",
                "You're growing so well",
                "I love your new growth",
                "You're my favorite plant"
            ]},
            
            # Complex conversations
            {"category": "Complex", "messages": [
                "I'm having a bad day, can you cheer me up?",
                "Tell me a story about your life",
                "What do you think about the weather?",
                "Do you have any advice for me?",
                "What's your favorite time of day?"
            ]},
            
            # Edge cases
            {"category": "Edge Cases", "messages": [
                "",  # Empty message
                "a",  # Single character
                "This is a very long message that goes on and on and on to test how the AI handles really long input messages that might exceed normal conversation length",
                "🌿🌱💚",  # Only emojis
                "What's 2+2?",  # Math question
                "Hello world! How are you doing today? I hope you're having a great time!",  # Multiple sentences
            ]}
        ]
        
        # Test with first few plants
        for plant in self.test_plants[:3]:
            plant_id = plant["id"]
            plant_name = plant["nickname"]
            
            for scenario in conversation_scenarios:
                category = scenario["category"]
                messages = scenario["messages"]
                
                for i, message in enumerate(messages):
                    try:
                        chat_data = {"message": message}
                        response = requests.post(f"{BASE_URL}/plants/{plant_id}/chat", json=chat_data)
                        
                        if response.status_code == 200:
                            chat_result = response.json()
                            
                            # Validate response structure
                            required_fields = ["plant_id", "plant_name", "personality", "user_message", "plant_response"]
                            missing_fields = [field for field in required_fields if field not in chat_result]
                            
                            if not missing_fields:
                                plant_response = chat_result["plant_response"]
                                personality = chat_result["personality"]
                                
                                # Validate response quality
                                if message == "":  # Empty message edge case
                                    if 400 <= response.status_code < 500:
                                        # Should return error for empty message
                                        self.add_result(TestResult(
                                            f"Chat {category} - Empty Message Handling", 
                                            True, 
                                            details={"expected_error": True}
                                        ))
                                    else:
                                        # If it accepts empty message, response should indicate this
                                        self.add_result(TestResult(
                                            f"Chat {category} - Empty Message Handling", 
                                            len(plant_response) > 0, 
                                            "No response to empty message" if len(plant_response) == 0 else None,
                                            {"response_length": len(plant_response)}
                                        ))
                                elif len(plant_response) > 10:  # Substantial response
                                    self.add_result(TestResult(
                                        f"Chat {category} {i+1} - {plant_name[:15]}...", 
                                        True, 
                                        details={
                                            "message": message[:30] + "..." if len(message) > 30 else message,
                                            "response_length": len(plant_response),
                                            "personality": personality
                                        }
                                    ))
                                    
                                    # Store conversation for analysis
                                    self.test_conversations.append({
                                        "plant_id": plant_id,
                                        "plant_name": plant_name,
                                        "category": category,
                                        "user_message": message,
                                        "plant_response": plant_response,
                                        "personality": personality
                                    })
                                else:
                                    self.add_result(TestResult(
                                        f"Chat {category} {i+1} - {plant_name[:15]}...", 
                                        False, 
                                        "Response too short",
                                        {
                                            "message": message,
                                            "response": plant_response,
                                            "response_length": len(plant_response)
                                        }
                                    ))
                            else:
                                self.add_result(TestResult(
                                    f"Chat {category} {i+1} Structure - {plant_name[:15]}...", 
                                    False, 
                                    f"Missing response fields: {missing_fields}",
                                    {"response_keys": list(chat_result.keys())}
                                ))
                        else:
                            # For edge cases, some errors might be expected
                            if category == "Edge Cases" and 400 <= response.status_code < 500:
                                self.add_result(TestResult(
                                    f"Chat {category} {i+1} - {plant_name[:15]}...", 
                                    True, 
                                    details={"expected_error": response.status_code, "message": message}
                                ))
                            else:
                                self.add_result(TestResult(
                                    f"Chat {category} {i+1} - {plant_name[:15]}...", 
                                    False, 
                                    f"HTTP {response.status_code}: {response.text}",
                                    {"message": message}
                                ))
                    except Exception as e:
                        self.add_result(TestResult(
                            f"Chat {category} {i+1} - {plant_name[:15]}...", 
                            False, 
                            str(e),
                            {"traceback": traceback.format_exc(), "message": message}
                        ))
                    
                    # Small delay to avoid overwhelming the API
                    await asyncio.sleep(0.1)

    async def test_data_persistence_and_consistency(self):
        """Test data persistence and consistency across operations"""
        print("\n💾 Testing Data Persistence and Consistency...")
        
        # Test user data persistence
        for user in self.test_users[:2]:
            try:
                # Get user data multiple times to ensure consistency
                responses = []
                for i in range(3):
                    response = requests.get(f"{BASE_URL}/users/{user['id']}")
                    if response.status_code == 200:
                        responses.append(response.json())
                    await asyncio.sleep(0.5)
                
                if len(responses) == 3:
                    # Check if all responses are identical
                    if responses[0] == responses[1] == responses[2]:
                        self.add_result(TestResult(
                            f"User Data Consistency - User {user['id']}", 
                            True
                        ))
                    else:
                        self.add_result(TestResult(
                            f"User Data Consistency - User {user['id']}", 
                            False, 
                            "User data inconsistent across requests"
                        ))
                else:
                    self.add_result(TestResult(
                        f"User Data Consistency - User {user['id']}", 
                        False, 
                        "Could not retrieve user data consistently"
                    ))
            except Exception as e:
                self.add_result(TestResult(
                    f"User Data Consistency - User {user['id']}", 
                    False, 
                    str(e),
                    {"traceback": traceback.format_exc()}
                ))

        # Test plant data persistence
        for plant in self.test_plants[:3]:
            try:
                # Get plant data through different endpoints
                user_id = plant["user_id"]
                plant_id = plant["id"]
                
                # Method 1: Get through user's plants
                user_plants_response = requests.get(f"{BASE_URL}/users/{user_id}/plants")
                plant_from_user_list = None
                if user_plants_response.status_code == 200:
                    user_plants = user_plants_response.json()
                    plant_from_user_list = next((p for p in user_plants if p["id"] == plant_id), None)
                
                # Method 2: Get through dashboard
                dashboard_response = requests.get(f"{BASE_URL}/users/{user_id}/dashboard")
                plant_from_dashboard = None
                if dashboard_response.status_code == 200:
                    dashboard = dashboard_response.json()
                    dashboard_plants = dashboard.get("plants", [])
                    plant_from_dashboard = next((p for p in dashboard_plants if p["id"] == plant_id), None)
                
                # Compare data consistency
                if plant_from_user_list and plant_from_dashboard:
                    # Check key fields for consistency
                    key_fields = ["id", "nickname", "user_id"]
                    consistent = all(
                        plant_from_user_list.get(field) == plant_from_dashboard.get(field) 
                        for field in key_fields
                    )
                    
                    if consistent:
                        self.add_result(TestResult(
                            f"Plant Data Consistency - Plant {plant_id}", 
                            True
                        ))
                    else:
                        self.add_result(TestResult(
                            f"Plant Data Consistency - Plant {plant_id}", 
                            False, 
                            "Plant data inconsistent between endpoints",
                            {
                                "user_list_data": plant_from_user_list,
                                "dashboard_data": plant_from_dashboard
                            }
                        ))
                else:
                    self.add_result(TestResult(
                        f"Plant Data Consistency - Plant {plant_id}", 
                        False, 
                        "Could not retrieve plant data from both endpoints",
                        {
                            "user_list_success": plant_from_user_list is not None,
                            "dashboard_success": plant_from_dashboard is not None
                        }
                    ))
            except Exception as e:
                self.add_result(TestResult(
                    f"Plant Data Consistency - Plant {plant_id}", 
                    False, 
                    str(e),
                    {"traceback": traceback.format_exc()}
                ))

    async def test_user_flow_performance(self):
        """Test performance aspects of user flow"""
        print("\n⚡ Testing User Flow Performance...")
        
        # Test response times for key operations
        performance_tests = [
            ("User Creation", "POST", "/users", {"phone": f"+123456789{random.randint(10000, 99999)}"}),
            ("Plant Catalog", "GET", "/catalog", None),
            ("Personality List", "GET", "/personalities", None),
        ]
        
        if self.test_users:
            user_id = self.test_users[0]["id"]
            performance_tests.extend([
                ("User Dashboard", "GET", f"/users/{user_id}/dashboard", None),
                ("User Plants", "GET", f"/users/{user_id}/plants", None),
            ])
        
        if self.test_plants:
            plant_id = self.test_plants[0]["id"]
            performance_tests.append(
                ("Plant Chat", "POST", f"/plants/{plant_id}/chat", {"message": "Hello!"})
            )
        
        for test_name, method, endpoint, data in performance_tests:
            try:
                start_time = time.time()
                
                if method == "GET":
                    response = requests.get(f"{BASE_URL}{endpoint}")
                else:
                    response = requests.post(f"{BASE_URL}{endpoint}", json=data)
                
                end_time = time.time()
                response_time = end_time - start_time
                
                # Consider response times
                # < 1s = excellent, < 3s = good, < 5s = acceptable, > 5s = slow
                if response.status_code in [200, 201]:
                    if response_time < 1.0:
                        performance_rating = "excellent"
                    elif response_time < 3.0:
                        performance_rating = "good"
                    elif response_time < 5.0:
                        performance_rating = "acceptable"
                    else:
                        performance_rating = "slow"
                    
                    self.add_result(TestResult(
                        f"Performance - {test_name}", 
                        response_time < 10.0,  # Fail if > 10 seconds
                        None if response_time < 10.0 else f"Response too slow: {response_time:.2f}s",
                        {
                            "response_time": f"{response_time:.2f}s",
                            "rating": performance_rating,
                            "endpoint": endpoint
                        }
                    ))
                else:
                    self.add_result(TestResult(
                        f"Performance - {test_name}", 
                        False, 
                        f"HTTP {response.status_code}: {response.text}",
                        {"response_time": f"{response_time:.2f}s"}
                    ))
            except Exception as e:
                self.add_result(TestResult(
                    f"Performance - {test_name}", 
                    False, 
                    str(e),
                    {"traceback": traceback.format_exc()}
                ))

    async def run_deep_user_flow_tests(self):
        """Run all deep user flow tests"""
        print("🚀 Starting DEEP User Flow Test Suite")
        print("=" * 80)
        
        start_time = datetime.now()
        
        # Run all test categories in order
        await self.test_user_registration_variations()
        await self.test_plant_onboarding_journey()
        await self.test_dashboard_functionality_deep()
        await self.test_chat_functionality_comprehensive()
        await self.test_data_persistence_and_consistency()
        await self.test_user_flow_performance()
        
        end_time = datetime.now()
        duration = end_time - start_time
        
        # Generate summary
        self.generate_summary(duration)
    
    def generate_summary(self, duration):
        """Generate comprehensive test summary"""
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r.success)
        failed_tests = total_tests - passed_tests
        
        print("\n" + "=" * 80)
        print("📊 DEEP USER FLOW TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"📈 Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        print(f"⏱️  Duration: {duration}")
        print(f"👥 Test Users Created: {len(self.test_users)}")
        print(f"🌱 Test Plants Created: {len(self.test_plants)}")
        print(f"💬 Conversations Tested: {len(self.test_conversations)}")
        
        if failed_tests > 0:
            print(f"\n🐛 {failed_tests} GitHub issues created for failures")
            print("Check your GitHub repository for detailed bug reports")
            
            print("\n❌ FAILED TESTS:")
            for result in self.results:
                if not result.success:
                    print(f"  - {result.test_name}: {result.error}")
        
        # Save detailed results
        results_data = {
            "summary": {
                "total": total_tests,
                "passed": passed_tests,
                "failed": failed_tests,
                "success_rate": f"{(passed_tests/total_tests)*100:.1f}%",
                "duration": str(duration),
                "timestamp": datetime.now().isoformat(),
                "test_users": len(self.test_users),
                "test_plants": len(self.test_plants),
                "conversations": len(self.test_conversations)
            },
            "test_data": {
                "users": self.test_users,
                "plants": self.test_plants,
                "conversations": self.test_conversations[:10]  # Sample conversations
            },
            "results": [
                {
                    "test_name": r.test_name,
                    "success": r.success,
                    "error": r.error,
                    "details": r.details,
                    "timestamp": r.timestamp
                }
                for r in self.results
            ]
        }
        
        with open("deep_user_flow_results.json", "w") as f:
            json.dump(results_data, f, indent=2)
        
        print(f"📄 Detailed results saved to: deep_user_flow_results.json")
        print(f"📝 Log file: deep_user_flow_test.log")

async def main():
    """Main test runner"""
    test_suite = DeepUserFlowTestSuite()
    await test_suite.run_deep_user_flow_tests()

if __name__ == "__main__":
    asyncio.run(main())
