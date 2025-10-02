#!/usr/bin/env python3
"""
COMPREHENSIVE Test Suite for Plants-Texts Application
Tests ALL endpoints and edge cases to find real issues
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
            'labels': labels or ['bug', 'testing']
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

class ComprehensiveTestSuite:
    def __init__(self):
        self.results: List[TestResult] = []
        self.github_tracker = GitHubIssueTracker(GITHUB_TOKEN)
        self.setup_logging()
        self.test_user_id = None
        self.test_plant_id = None
    
    def setup_logging(self):
        """Setup logging for test results"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('comprehensive_test_results.log'),
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
*This issue was automatically created by the comprehensive test suite*
            """
            self.github_tracker.create_issue(title, body, ['bug', 'testing', 'comprehensive'])
        else:
            self.logger.info(f"✅ {result.test_name} PASSED")

    async def test_basic_endpoints(self):
        """Test basic API endpoints"""
        print("\n🔍 Testing Basic API Endpoints...")
        
        # Test root endpoint
        try:
            response = requests.get("http://localhost:8000/")
            if response.status_code == 200:
                self.add_result(TestResult("Root Endpoint", True, details={"response": response.json()}))
            else:
                self.add_result(TestResult("Root Endpoint", False, f"HTTP {response.status_code}: {response.text}"))
        except Exception as e:
            self.add_result(TestResult("Root Endpoint", False, str(e), {"traceback": traceback.format_exc()}))

        # Test health endpoint
        try:
            response = requests.get("http://localhost:8000/health")
            if response.status_code == 200:
                self.add_result(TestResult("Health Check", True, details={"response": response.json()}))
            else:
                self.add_result(TestResult("Health Check", False, f"HTTP {response.status_code}: {response.text}"))
        except Exception as e:
            self.add_result(TestResult("Health Check", False, str(e), {"traceback": traceback.format_exc()}))

        # Test OpenAPI docs
        try:
            response = requests.get("http://localhost:8000/openapi.json")
            if response.status_code == 200:
                openapi_data = response.json()
                endpoint_count = len(openapi_data.get('paths', {}))
                self.add_result(TestResult("OpenAPI Documentation", True, details={"endpoint_count": endpoint_count}))
            else:
                self.add_result(TestResult("OpenAPI Documentation", False, f"HTTP {response.status_code}: {response.text}"))
        except Exception as e:
            self.add_result(TestResult("OpenAPI Documentation", False, str(e), {"traceback": traceback.format_exc()}))

    async def test_catalog_endpoints(self):
        """Test plant catalog endpoints"""
        print("\n🌿 Testing Plant Catalog Endpoints...")
        
        # Test get all plants
        try:
            response = requests.get(f"{BASE_URL}/catalog")
            if response.status_code == 200:
                catalog = response.json()
                self.add_result(TestResult("Get Plant Catalog", True, details={"plant_count": len(catalog)}))
                
                # Test individual plant lookup
                if catalog:
                    plant_id = catalog[0]["id"]
                    plant_response = requests.get(f"{BASE_URL}/catalog/{plant_id}")
                    if plant_response.status_code == 200:
                        self.add_result(TestResult("Get Individual Plant", True, details={"plant": plant_response.json()}))
                    else:
                        self.add_result(TestResult("Get Individual Plant", False, f"HTTP {plant_response.status_code}: {plant_response.text}"))
                    
                    # Test personality suggestion
                    personality_response = requests.get(f"{BASE_URL}/catalog/{plant_id}/suggest-personality")
                    if personality_response.status_code == 200:
                        self.add_result(TestResult("Personality Suggestion", True, details={"suggestion": personality_response.json()}))
                    else:
                        self.add_result(TestResult("Personality Suggestion", False, f"HTTP {personality_response.status_code}: {personality_response.text}"))
            else:
                self.add_result(TestResult("Get Plant Catalog", False, f"HTTP {response.status_code}: {response.text}"))
        except Exception as e:
            self.add_result(TestResult("Get Plant Catalog", False, str(e), {"traceback": traceback.format_exc()}))

        # Test invalid plant ID
        try:
            response = requests.get(f"{BASE_URL}/catalog/99999")
            if response.status_code == 404:
                self.add_result(TestResult("Invalid Plant ID Handling", True, details={"expected_404": True}))
            else:
                self.add_result(TestResult("Invalid Plant ID Handling", False, f"Expected 404, got {response.status_code}"))
        except Exception as e:
            self.add_result(TestResult("Invalid Plant ID Handling", False, str(e), {"traceback": traceback.format_exc()}))

    async def test_user_endpoints(self):
        """Test user management endpoints"""
        print("\n👤 Testing User Management Endpoints...")
        
        # Create test user
        try:
            user_data = {"phone": f"+123456789{random.randint(1000, 9999)}"}
            response = requests.post(f"{BASE_URL}/users", json=user_data)
            if response.status_code in [200, 201]:
                user = response.json()
                self.test_user_id = user["id"]
                self.add_result(TestResult("Create User", True, details={"user_id": self.test_user_id}))
                
                # Test get user by ID
                get_response = requests.get(f"{BASE_URL}/users/{self.test_user_id}")
                if get_response.status_code == 200:
                    self.add_result(TestResult("Get User by ID", True, details={"user": get_response.json()}))
                else:
                    self.add_result(TestResult("Get User by ID", False, f"HTTP {get_response.status_code}: {get_response.text}"))
                
                # Test find user by phone
                find_response = requests.get(f"{BASE_URL}/users/find/{user_data['phone']}")
                if find_response.status_code == 200:
                    self.add_result(TestResult("Find User by Phone", True, details={"user": find_response.json()}))
                else:
                    self.add_result(TestResult("Find User by Phone", False, f"HTTP {find_response.status_code}: {find_response.text}"))
                
                # Test find-or-create endpoint
                find_create_response = requests.post(f"{BASE_URL}/users/find-or-create", json=user_data)
                if find_create_response.status_code == 200:
                    self.add_result(TestResult("Find or Create User", True, details={"user": find_create_response.json()}))
                else:
                    self.add_result(TestResult("Find or Create User", False, f"HTTP {find_create_response.status_code}: {find_create_response.text}"))
                    
            else:
                self.add_result(TestResult("Create User", False, f"HTTP {response.status_code}: {response.text}"))
        except Exception as e:
            self.add_result(TestResult("Create User", False, str(e), {"traceback": traceback.format_exc()}))

        # Test invalid user operations
        try:
            response = requests.get(f"{BASE_URL}/users/99999")
            if response.status_code == 404:
                self.add_result(TestResult("Invalid User ID Handling", True, details={"expected_404": True}))
            else:
                self.add_result(TestResult("Invalid User ID Handling", False, f"Expected 404, got {response.status_code}"))
        except Exception as e:
            self.add_result(TestResult("Invalid User ID Handling", False, str(e), {"traceback": traceback.format_exc()}))

        # Test invalid phone lookup
        try:
            response = requests.get(f"{BASE_URL}/users/find/+999999999999")
            if response.status_code == 404:
                self.add_result(TestResult("Invalid Phone Lookup", True, details={"expected_404": True}))
            else:
                self.add_result(TestResult("Invalid Phone Lookup", False, f"Expected 404, got {response.status_code}"))
        except Exception as e:
            self.add_result(TestResult("Invalid Phone Lookup", False, str(e), {"traceback": traceback.format_exc()}))

    async def test_plant_management(self):
        """Test plant management endpoints"""
        print("\n🌱 Testing Plant Management...")
        
        if not self.test_user_id:
            self.add_result(TestResult("Plant Management Setup", False, "No test user available"))
            return
        
        # Get catalog for plant creation
        catalog_response = requests.get(f"{BASE_URL}/catalog")
        if catalog_response.status_code != 200:
            self.add_result(TestResult("Plant Management Setup", False, "Could not get catalog"))
            return
        
        catalog = catalog_response.json()
        
        # Test plant creation
        try:
            plant_data = {
                "user_id": self.test_user_id,
                "plant_catalog_id": catalog[0]["id"],
                "nickname": "Test Plant",
                "location": "Test Location"
            }
            response = requests.post(f"{BASE_URL}/plants", json=plant_data)
            if response.status_code in [200, 201]:
                plant = response.json()
                self.test_plant_id = plant["id"]
                self.add_result(TestResult("Create Plant", True, details={"plant_id": self.test_plant_id}))
            else:
                self.add_result(TestResult("Create Plant", False, f"HTTP {response.status_code}: {response.text}"))
        except Exception as e:
            self.add_result(TestResult("Create Plant", False, str(e), {"traceback": traceback.format_exc()}))

        # Test get user plants
        try:
            response = requests.get(f"{BASE_URL}/users/{self.test_user_id}/plants")
            if response.status_code == 200:
                plants = response.json()
                self.add_result(TestResult("Get User Plants", True, details={"plant_count": len(plants)}))
            else:
                self.add_result(TestResult("Get User Plants", False, f"HTTP {response.status_code}: {response.text}"))
        except Exception as e:
            self.add_result(TestResult("Get User Plants", False, str(e), {"traceback": traceback.format_exc()}))

        # Test user dashboard (the known failing test)
        try:
            response = requests.get(f"{BASE_URL}/users/{self.test_user_id}/dashboard")
            if response.status_code == 200:
                dashboard = response.json()
                self.add_result(TestResult("User Dashboard", True, details={"dashboard": dashboard}))
            else:
                self.add_result(TestResult("User Dashboard", False, f"HTTP {response.status_code}: {response.text}"))
        except Exception as e:
            self.add_result(TestResult("User Dashboard", False, str(e), {"traceback": traceback.format_exc()}))

    async def test_care_system(self):
        """Test plant care system"""
        print("\n💧 Testing Care System...")
        
        if not self.test_user_id or not self.test_plant_id:
            self.add_result(TestResult("Care System Setup", False, "No test user or plant available"))
            return

        # Test care schedule
        try:
            response = requests.get(f"{BASE_URL}/users/{self.test_user_id}/schedule")
            if response.status_code == 200:
                schedule = response.json()
                self.add_result(TestResult("Get Care Schedule", True, details={"schedule_items": len(schedule)}))
            else:
                self.add_result(TestResult("Get Care Schedule", False, f"HTTP {response.status_code}: {response.text}"))
        except Exception as e:
            self.add_result(TestResult("Get Care Schedule", False, str(e), {"traceback": traceback.format_exc()}))

        # Test care completion
        try:
            care_data = {
                "plant_id": self.test_plant_id,
                "task_type": "watering",
                "notes": "Test watering"
            }
            response = requests.post(f"{BASE_URL}/care/complete", json=care_data)
            if response.status_code in [200, 201]:
                self.add_result(TestResult("Complete Care Task", True, details={"care": response.json()}))
            else:
                self.add_result(TestResult("Complete Care Task", False, f"HTTP {response.status_code}: {response.text}"))
        except Exception as e:
            self.add_result(TestResult("Complete Care Task", False, str(e), {"traceback": traceback.format_exc()}))

        # Test care reminders
        care_types = ["watering", "fertilizing", "misting", "pruning"]
        for care_type in care_types:
            try:
                response = requests.post(f"{BASE_URL}/plants/{self.test_plant_id}/remind/{care_type}")
                if response.status_code == 200:
                    self.add_result(TestResult(f"Care Reminder - {care_type}", True, details={"reminder": response.json()}))
                else:
                    self.add_result(TestResult(f"Care Reminder - {care_type}", False, f"HTTP {response.status_code}: {response.text}"))
            except Exception as e:
                self.add_result(TestResult(f"Care Reminder - {care_type}", False, str(e), {"traceback": traceback.format_exc()}))

    async def test_ai_chat_system(self):
        """Test AI chat and personality system"""
        print("\n🤖 Testing AI Chat System...")
        
        if not self.test_plant_id:
            self.add_result(TestResult("AI Chat Setup", False, "No test plant available"))
            return

        # Test basic chat
        chat_messages = [
            "Hello!",
            "How are you feeling today?",
            "Tell me about yourself",
            "Do you need water?",
            "What's your personality like?",
            "I just watered you",
            "You look beautiful today",
            "What do you need from me?"
        ]
        
        for message in chat_messages:
            try:
                chat_data = {"message": message}
                response = requests.post(f"{BASE_URL}/plants/{self.test_plant_id}/chat", json=chat_data)
                if response.status_code == 200:
                    chat_result = response.json()
                    response_text = chat_result.get("plant_response", "")
                    if len(response_text) > 10:  # Basic validation
                        self.add_result(TestResult(f"Chat - '{message[:20]}...'", True, details={"response_length": len(response_text)}))
                    else:
                        self.add_result(TestResult(f"Chat - '{message[:20]}...'", False, "Response too short", {"response": response_text}))
                else:
                    self.add_result(TestResult(f"Chat - '{message[:20]}...'", False, f"HTTP {response.status_code}: {response.text}"))
            except Exception as e:
                self.add_result(TestResult(f"Chat - '{message[:20]}...'", False, str(e), {"traceback": traceback.format_exc()}))

        # Test personality demo
        try:
            response = requests.get(f"{BASE_URL}/plants/{self.test_plant_id}/personality-demo")
            if response.status_code == 200:
                demo = response.json()
                self.add_result(TestResult("Personality Demo", True, details={"demo_keys": list(demo.keys())}))
            else:
                self.add_result(TestResult("Personality Demo", False, f"HTTP {response.status_code}: {response.text}"))
        except Exception as e:
            self.add_result(TestResult("Personality Demo", False, str(e), {"traceback": traceback.format_exc()}))

    async def test_personality_system(self):
        """Test personality system endpoints"""
        print("\n🎭 Testing Personality System...")
        
        # Test get all personalities
        try:
            response = requests.get(f"{BASE_URL}/personalities")
            if response.status_code == 200:
                personalities = response.json()
                self.add_result(TestResult("Get All Personalities", True, details={"personality_count": len(personalities)}))
            else:
                self.add_result(TestResult("Get All Personalities", False, f"HTTP {response.status_code}: {response.text}"))
        except Exception as e:
            self.add_result(TestResult("Get All Personalities", False, str(e), {"traceback": traceback.format_exc()}))

    async def test_admin_endpoints(self):
        """Test admin endpoints"""
        print("\n🔧 Testing Admin Endpoints...")
        
        admin_endpoints = [
            ("Database Status", "GET", "/admin/database-status"),
            ("Reset Database", "GET", "/admin/reset-database"),
            ("Init Database", "GET", "/admin/init-database"),
            ("Seed Database", "GET", "/admin/seed-database")
        ]
        
        for name, method, endpoint in admin_endpoints:
            try:
                if method == "GET":
                    response = requests.get(f"{BASE_URL}{endpoint}")
                else:
                    response = requests.post(f"{BASE_URL}{endpoint}")
                
                if response.status_code in [200, 201]:
                    self.add_result(TestResult(name, True, details={"response": response.json()}))
                else:
                    self.add_result(TestResult(name, False, f"HTTP {response.status_code}: {response.text}"))
            except Exception as e:
                self.add_result(TestResult(name, False, str(e), {"traceback": traceback.format_exc()}))

    async def test_edge_cases(self):
        """Test edge cases and error handling"""
        print("\n⚠️  Testing Edge Cases...")
        
        # Test malformed requests
        edge_cases = [
            ("Empty User Data", "POST", "/users", {}),
            ("Invalid JSON", "POST", "/users", "invalid json"),
            ("Missing Required Fields", "POST", "/plants", {"nickname": "test"}),
            ("Invalid Plant ID Chat", "POST", "/plants/99999/chat", {"message": "hello"}),
            ("Empty Chat Message", "POST", f"/plants/{self.test_plant_id}/chat" if self.test_plant_id else "/plants/1/chat", {"message": ""}),
            ("Invalid Care Type", "POST", f"/plants/{self.test_plant_id}/remind/invalid_type" if self.test_plant_id else "/plants/1/remind/invalid_type", {}),
        ]
        
        for name, method, endpoint, data in edge_cases:
            try:
                url = f"{BASE_URL}{endpoint}"
                if method == "POST":
                    if isinstance(data, str):
                        response = requests.post(url, data=data, headers={'Content-Type': 'application/json'})
                    else:
                        response = requests.post(url, json=data)
                else:
                    response = requests.get(url)
                
                # For edge cases, we expect errors (4xx status codes)
                if 400 <= response.status_code < 500:
                    self.add_result(TestResult(f"Edge Case - {name}", True, details={"expected_error": response.status_code}))
                elif response.status_code == 200:
                    # Some edge cases might succeed unexpectedly
                    self.add_result(TestResult(f"Edge Case - {name}", False, "Expected error but got success", {"response": response.text}))
                else:
                    self.add_result(TestResult(f"Edge Case - {name}", False, f"Unexpected status {response.status_code}: {response.text}"))
            except Exception as e:
                self.add_result(TestResult(f"Edge Case - {name}", False, str(e), {"traceback": traceback.format_exc()}))

    async def run_all_tests(self):
        """Run all comprehensive tests"""
        print("🚀 Starting COMPREHENSIVE Plants-Texts Test Suite")
        print("=" * 80)
        
        start_time = datetime.now()
        
        # Run all test categories
        await self.test_basic_endpoints()
        await self.test_catalog_endpoints()
        await self.test_user_endpoints()
        await self.test_plant_management()
        await self.test_care_system()
        await self.test_ai_chat_system()
        await self.test_personality_system()
        await self.test_admin_endpoints()
        await self.test_edge_cases()
        
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
        print("📊 COMPREHENSIVE TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"⏱️  Duration: {duration}")
        print(f"📝 Log file: comprehensive_test_results.log")
        
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
        
        with open("comprehensive_test_results.json", "w") as f:
            json.dump(results_data, f, indent=2)
        
        print(f"📄 Detailed results saved to: comprehensive_test_results.json")

async def main():
    """Main test runner"""
    test_suite = ComprehensiveTestSuite()
    await test_suite.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())
