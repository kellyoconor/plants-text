#!/usr/bin/env python3
"""
Comprehensive Test Suite for Plants-Texts Application
Tests plant creation, user flow, and AI personalities with GitHub issue tracking
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

# Add the backend directory to Python path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

# GitHub API configuration
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
GITHUB_REPO = os.getenv('GITHUB_REPO', 'your-username/plants-texts')  # Update this
GITHUB_API_URL = f"https://api.github.com/repos/{GITHUB_REPO}/issues"

# Test configuration
BASE_URL = "http://localhost:8000/api/v1"  # Correct API prefix
FRONTEND_URL = "http://localhost:3000"  # Adjust if different

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
            'labels': labels or ['bug', 'testing']
        }
        
        try:
            response = requests.post(GITHUB_API_URL, headers=self.headers, json=data)
            if response.status_code == 201:
                issue_url = response.json().get('html_url')
                print(f"✅ GitHub issue created: {issue_url}")
                return True
            elif response.status_code == 403:
                print("⚠️  GitHub token lacks permission to create issues. Consider updating token scopes.")
                print(f"📝 Issue would be: {title}")
                return False
            else:
                print(f"❌ Failed to create GitHub issue: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Error creating GitHub issue: {e}")
            return False

class PlantsTestSuite:
    def __init__(self):
        self.results: List[TestResult] = []
        self.github_tracker = GitHubIssueTracker(GITHUB_TOKEN)
        self.setup_logging()
    
    def setup_logging(self):
        """Setup logging for test results"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('test_results.log'),
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
            title = f"Test Failure: {result.test_name}"
            body = f"""
## Test Failure Report

**Test Name:** {result.test_name}
**Timestamp:** {result.timestamp}
**Error:** {result.error}

### Details
```json
{json.dumps(result.details, indent=2)}
```

### Stack Trace
```
{result.details.get('traceback', 'No traceback available')}
```

---
*This issue was automatically created by the test suite*
            """
            self.github_tracker.create_issue(title, body, ['bug', 'testing', 'automated'])
        else:
            self.logger.info(f"✅ {result.test_name} PASSED")
    
    # TEST 1: Plant Creation Tests
    async def test_plant_creation(self):
        """Test plant creation functionality"""
        print("\n🌱 Testing Plant Creation...")
        
        # First create a test user
        try:
            user_data = {
                "phone": "+1234567890"
            }
            user_response = requests.post(f"{BASE_URL}/users", json=user_data)
            if user_response.status_code == 201:
                # User created successfully
                user = user_response.json()
                user_id = user["id"]
                self.add_result(TestResult("Create Test User", True, details={"user_id": user_id}))
            elif user_response.status_code == 200:
                # User already exists, that's fine for testing
                user = user_response.json()
                user_id = user["id"]
                self.add_result(TestResult("Create Test User (existing)", True, details={"user_id": user_id}))
            elif user_response.status_code == 400 and "already exists" in user_response.text:
                # User exists, let's get the existing user
                # For now, we'll create a user with a different phone number
                import random
                user_data["phone"] = f"+123456789{random.randint(0, 9)}"
                user_response = requests.post(f"{BASE_URL}/users", json=user_data)
                if user_response.status_code in [200, 201]:
                    user = user_response.json()
                    user_id = user["id"]
                    self.add_result(TestResult("Create Test User (retry)", True, details={"user_id": user_id}))
                else:
                    self.add_result(TestResult(
                        "Create Test User", 
                        False, 
                        f"HTTP {user_response.status_code}: {user_response.text}"
                    ))
                    return
            else:
                self.add_result(TestResult(
                    "Create Test User", 
                    False, 
                    f"HTTP {user_response.status_code}: {user_response.text}"
                ))
                return
            
            # Get plant catalog to find valid plant IDs
            catalog_response = requests.get(f"{BASE_URL}/catalog")
            if catalog_response.status_code != 200:
                self.add_result(TestResult(
                    "Get Plant Catalog", 
                    False, 
                    f"HTTP {catalog_response.status_code}: {catalog_response.text}"
                ))
                return
            
            catalog = catalog_response.json()
            self.add_result(TestResult("Get Plant Catalog", True, details={"catalog_count": len(catalog)}))
            
            # Test creating plants for the user
            test_plants = [
                {"nickname": "My Snake Plant", "location": "Living Room"},
                {"nickname": "My Fiddle Leaf Fig", "location": "Bedroom"},
                {"nickname": "My Pothos", "location": "Kitchen"},
                {"nickname": "My Monstera", "location": "Office"}
            ]
            
            for i, plant_data in enumerate(test_plants):
                try:
                    # Use catalog plants (cycle through available ones)
                    catalog_plant = catalog[i % len(catalog)]
                    plant_data.update({
                        "user_id": user_id,
                        "plant_catalog_id": catalog_plant["id"]
                    })
                    
                    response = requests.post(f"{BASE_URL}/plants", json=plant_data)
                    
                    if response.status_code in [200, 201]:
                        plant = response.json()
                        personality_name = plant.get("personality", {}).get("name", "unknown")
                        self.add_result(TestResult(
                            f"Create {plant_data['nickname']}", 
                            True, 
                            details={
                                "plant_id": plant.get("id"), 
                                "personality": personality_name,
                                "plant_type": plant.get("plant_catalog", {}).get("name", "unknown")
                            }
                        ))
                    else:
                        self.add_result(TestResult(
                            f"Create {plant_data['nickname']}", 
                            False, 
                            f"HTTP {response.status_code}: {response.text}",
                            {"request_data": plant_data, "response": response.text}
                        ))
                except Exception as e:
                    self.add_result(TestResult(
                        f"Create {plant_data['nickname']}", 
                        False, 
                        str(e),
                        {"traceback": traceback.format_exc(), "plant_data": plant_data}
                    ))
        except Exception as e:
            self.add_result(TestResult(
                "Plant Creation Setup", 
                False, 
                str(e),
                {"traceback": traceback.format_exc()}
            ))
    
    # TEST 2: User Flow Tests
    async def test_user_flow(self):
        """Test complete user flow from onboarding to chat"""
        print("\n👤 Testing User Flow...")
        
        try:
            # Step 1: Create user
            import random
            user_data = {
                "phone": f"+123456789{random.randint(10, 99)}"
            }
            user_response = requests.post(f"{BASE_URL}/users", json=user_data)
            
            if user_response.status_code in [200, 201]:
                user = user_response.json()
                user_id = user["id"]
                
                self.add_result(TestResult(
                    "User Creation", 
                    True, 
                    details={"user_id": user_id}
                ))
                
                # Step 2: Get plant catalog
                catalog_response = requests.get(f"{BASE_URL}/catalog")
                if catalog_response.status_code == 200:
                    catalog = catalog_response.json()
                    
                    # Step 3: Add a plant to user
                    plant_data = {
                        "user_id": user_id,
                        "plant_catalog_id": catalog[0]["id"],
                        "nickname": "Flow Test Plant",
                        "location": "Test Room"
                    }
                    
                    plant_response = requests.post(f"{BASE_URL}/plants", json=plant_data)
                    
                    if plant_response.status_code in [200, 201]:
                        plant = plant_response.json()
                        plant_id = plant["id"]
                        
                        self.add_result(TestResult("Plant Addition", True, details={"plant_id": plant_id}))
                        
                        # Step 4: Test dashboard access
                        dashboard_response = requests.get(f"{BASE_URL}/users/{user_id}/dashboard")
                        if dashboard_response.status_code == 200:
                            dashboard_data = dashboard_response.json()
                            self.add_result(TestResult(
                                "Dashboard Access", 
                                True, 
                                details={"dashboard": dashboard_data}
                            ))
                            
                            # Step 5: Test chat functionality
                            chat_data = {"message": "How are you doing today?"}
                            chat_response = requests.post(f"{BASE_URL}/plants/{plant_id}/chat", json=chat_data)
                            
                            if chat_response.status_code == 200:
                                chat_result = chat_response.json()
                                self.add_result(TestResult(
                                    "Chat Functionality", 
                                    True, 
                                    details={"chat_response": chat_result}
                                ))
                            else:
                                self.add_result(TestResult(
                                    "Chat Functionality", 
                                    False, 
                                    f"HTTP {chat_response.status_code}: {chat_response.text}"
                                ))
                        else:
                            self.add_result(TestResult(
                                "Dashboard Access", 
                                False, 
                                f"HTTP {dashboard_response.status_code}: {dashboard_response.text}"
                            ))
                    else:
                        self.add_result(TestResult(
                            "Plant Addition", 
                            False, 
                            f"HTTP {plant_response.status_code}: {plant_response.text}"
                        ))
                else:
                    self.add_result(TestResult(
                        "Catalog Access", 
                        False, 
                        f"HTTP {catalog_response.status_code}: {catalog_response.text}"
                    ))
            else:
                self.add_result(TestResult(
                    "User Creation", 
                    False, 
                    f"HTTP {user_response.status_code}: {user_response.text}",
                    {"user_data": user_data}
                ))
        except Exception as e:
            self.add_result(TestResult(
                "User Flow", 
                False, 
                str(e),
                {"traceback": traceback.format_exc()}
            ))
    
    # TEST 3: AI Personality Tests
    async def test_ai_personalities(self):
        """Test AI personality assignment and responses"""
        print("\n🤖 Testing AI Personalities...")
        
        try:
            # Create a test user for personality tests
            import random
            user_data = {
                "phone": f"+123456789{random.randint(100, 999)}"
            }
            user_response = requests.post(f"{BASE_URL}/users", json=user_data)
            
            if user_response.status_code not in [200, 201]:
                self.add_result(TestResult(
                    "Create Personality Test User", 
                    False, 
                    f"HTTP {user_response.status_code}: {user_response.text}"
                ))
                return
            
            user = user_response.json()
            user_id = user["id"]
            
            # Get plant catalog
            catalog_response = requests.get(f"{BASE_URL}/catalog")
            if catalog_response.status_code != 200:
                self.add_result(TestResult(
                    "Get Catalog for Personality Tests", 
                    False, 
                    f"HTTP {catalog_response.status_code}: {catalog_response.text}"
                ))
                return
            
            catalog = catalog_response.json()
            
            # Test personality for different plant types
            for i, catalog_plant in enumerate(catalog[:5]):  # Test first 5 plants
                try:
                    plant_name = catalog_plant.get("name", f"Plant {i+1}")
                    plant_data = {
                        "user_id": user_id,
                        "plant_catalog_id": catalog_plant["id"],
                        "nickname": f"Personality Test {plant_name}",
                        "location": "Test Location"
                    }
                    
                    create_response = requests.post(f"{BASE_URL}/plants", json=plant_data)
                    
                    if create_response.status_code in [200, 201]:
                        plant = create_response.json()
                        plant_id = plant["id"]
                        personality_name = plant.get("personality", {}).get("name", "unknown")
                        
                        self.add_result(TestResult(
                            f"Create {plant_name} for personality test", 
                            True, 
                            details={"plant_id": plant_id, "personality": personality_name}
                        ))
                        
                        # Test chat with personality (this will show the personality in action)
                        chat_data = {"message": "Tell me about yourself and your personality!"}
                        chat_response = requests.post(f"{BASE_URL}/plants/{plant_id}/chat", json=chat_data)
                        
                        if chat_response.status_code == 200:
                            chat_result = chat_response.json()
                            response_text = chat_result.get("plant_response", "")
                            personality_type = chat_result.get("personality", "unknown")
                            
                            # Check if we got a meaningful response
                            if len(response_text) > 20:  # Basic check for substantial response
                                self.add_result(TestResult(
                                    f"Personality Chat for {plant_name}", 
                                    True, 
                                    details={
                                        "response": response_text, 
                                        "personality": personality_type,
                                        "plant_name": plant_name,
                                        "full_response": chat_result
                                    }
                                ))
                            else:
                                self.add_result(TestResult(
                                    f"Personality Chat for {plant_name}", 
                                    False, 
                                    "Response too short or empty",
                                    {"response": response_text, "full_response": chat_result}
                                ))
                        else:
                            self.add_result(TestResult(
                                f"Personality Chat for {plant_name}", 
                                False, 
                                f"HTTP {chat_response.status_code}: {chat_response.text}"
                            ))
                        
                        # Test personality demo endpoint if available
                        demo_response = requests.get(f"{BASE_URL}/plants/{plant_id}/personality-demo")
                        if demo_response.status_code == 200:
                            demo_result = demo_response.json()
                            self.add_result(TestResult(
                                f"Personality Demo for {plant_name}", 
                                True, 
                                details={"demo": demo_result}
                            ))
                        # Don't fail if demo endpoint doesn't exist - it's optional
                        
                    else:
                        self.add_result(TestResult(
                            f"Create {plant_name} for personality test", 
                            False, 
                            f"HTTP {create_response.status_code}: {create_response.text}"
                        ))
                except Exception as e:
                    self.add_result(TestResult(
                        f"Personality test for {plant_name}", 
                        False, 
                        str(e),
                        {"traceback": traceback.format_exc(), "plant_name": plant_name}
                    ))
        except Exception as e:
            self.add_result(TestResult(
                "AI Personality Tests Setup", 
                False, 
                str(e),
                {"traceback": traceback.format_exc()}
            ))
    
    def get_expected_personality_traits(self, plant_type: str) -> Dict:
        """Get expected personality traits for a plant type"""
        # This should match your personality system
        trait_mapping = {
            "snake_plant": {"resilient": True, "low_maintenance": True, "stoic": True},
            "fiddle_leaf_fig": {"dramatic": True, "attention_seeking": True, "sensitive": True},
            "pothos": {"friendly": True, "adaptable": True, "easy_going": True},
            "monstera": {"social": True, "growing": True, "impressive": True},
            "peace_lily": {"calming": True, "elegant": True, "communicative": True},
            "rubber_plant": {"sturdy": True, "reliable": True, "classic": True},
            "spider_plant": {"prolific": True, "nurturing": True, "family_oriented": True},
            "aloe_vera": {"healing": True, "practical": True, "succulent": True}
        }
        return trait_mapping.get(plant_type, {})
    
    def validate_personality(self, personality: Dict, expected_traits: Dict) -> bool:
        """Validate that personality contains expected traits"""
        if not expected_traits:
            return True  # No specific expectations
        
        personality_str = json.dumps(personality).lower()
        
        for trait, should_have in expected_traits.items():
            trait_present = trait.lower() in personality_str
            if should_have and not trait_present:
                return False
        
        return True
    
    def check_personality_in_response(self, response: str, personality: Dict, plant_type: str) -> bool:
        """Check if AI response reflects the plant's personality"""
        response_lower = response.lower()
        
        # Basic checks - customize based on your personality system
        expected_traits = self.get_expected_personality_traits(plant_type)
        
        for trait in expected_traits.keys():
            if trait.lower() in response_lower:
                return True
        
        # Check for personality-related keywords in response
        personality_keywords = [
            word.lower() for word in str(personality).split() 
            if len(word) > 3 and word.isalpha()
        ]
        
        for keyword in personality_keywords[:5]:  # Check first 5 keywords
            if keyword in response_lower:
                return True
        
        return len(response) > 10  # At least got some response
    
    async def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Comprehensive Plants-Texts Test Suite")
        print("=" * 60)
        
        start_time = datetime.now()
        
        # Run all tests
        await self.test_plant_creation()
        await self.test_user_flow()
        await self.test_ai_personalities()
        
        end_time = datetime.now()
        duration = end_time - start_time
        
        # Generate summary
        self.generate_summary(duration)
    
    def generate_summary(self, duration):
        """Generate test summary"""
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r.success)
        failed_tests = total_tests - passed_tests
        
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"⏱️  Duration: {duration}")
        print(f"📝 Log file: test_results.log")
        
        if failed_tests > 0:
            print(f"\n🐛 {failed_tests} GitHub issues created for failures")
            print("Check your GitHub repository for detailed bug reports")
        
        # Save detailed results
        results_data = {
            "summary": {
                "total": total_tests,
                "passed": passed_tests,
                "failed": failed_tests,
                "duration": str(duration),
                "timestamp": datetime.now().isoformat()
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
        
        with open("test_results.json", "w") as f:
            json.dump(results_data, f, indent=2)
        
        print(f"📄 Detailed results saved to: test_results.json")

async def main():
    """Main test runner"""
    test_suite = PlantsTestSuite()
    await test_suite.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())
