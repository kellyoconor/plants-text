#!/usr/bin/env python3
"""
FINAL COMPREHENSIVE TEST SUITE
Ultra-thorough testing of the entire Plants-Texts application
This is the most comprehensive test we'll run to ensure everything is bulletproof
"""

import asyncio
import json
import logging
import traceback
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import requests
import sys
import os
from pathlib import Path
import random
import time
import uuid

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
            'labels': labels or ['bug', 'testing', 'final-comprehensive']
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

class FinalComprehensiveTestSuite:
    def __init__(self):
        self.results: List[TestResult] = []
        self.github_tracker = GitHubIssueTracker(GITHUB_TOKEN)
        self.setup_logging()
        
        # Test data storage for cross-test validation
        self.test_users = []
        self.test_plants = []
        self.test_conversations = []
        self.test_care_history = []
        
        # Performance tracking
        self.performance_metrics = {}
        
    def setup_logging(self):
        """Setup comprehensive logging"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('final_comprehensive_test.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def add_result(self, result: TestResult):
        """Add a test result and create GitHub issue if failed"""
        self.results.append(result)
        
        if not result.success:
            self.logger.error(f"❌ {result.test_name} FAILED: {result.error}")
            
            # Create detailed GitHub issue for failure
            title = f"FINAL TEST FAILURE: {result.test_name}"
            body = f"""
## 🚨 Final Comprehensive Test Failure

**Test Name:** {result.test_name}
**Category:** Final Comprehensive Testing
**Timestamp:** {result.timestamp}
**Severity:** HIGH (Found in final validation)

### Error Details
```
{result.error}
```

### Test Context
```json
{json.dumps(result.details, indent=2)}
```

### Stack Trace
```
{result.details.get('traceback', 'No traceback available')}
```

### Impact Assessment
This issue was discovered during final comprehensive testing and needs immediate attention before production deployment.

### Reproduction Steps
1. Run the final comprehensive test suite
2. Execute the specific test: `{result.test_name}`
3. Observe the failure

### Environment
- API Base URL: {BASE_URL}
- Test Suite: Final Comprehensive
- GitHub Integration: Active

---
*This issue was automatically created by the final comprehensive test suite*
            """
            self.github_tracker.create_issue(title, body, ['bug', 'testing', 'final-comprehensive', 'high-priority'])
        else:
            self.logger.info(f"✅ {result.test_name} PASSED")

    def measure_performance(self, operation_name: str, func):
        """Measure and track performance of operations"""
        start_time = time.time()
        try:
            result = func()
            end_time = time.time()
            duration = end_time - start_time
            
            self.performance_metrics[operation_name] = {
                'duration': duration,
                'success': True,
                'timestamp': datetime.now().isoformat()
            }
            
            return result, duration
        except Exception as e:
            end_time = time.time()
            duration = end_time - start_time
            
            self.performance_metrics[operation_name] = {
                'duration': duration,
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
            
            raise e

    async def test_system_health_comprehensive(self):
        """Comprehensive system health checks"""
        print("\n🏥 Testing System Health (Comprehensive)...")
        
        health_checks = [
            ("API Root Endpoint", lambda: requests.get("http://localhost:8000/")),
            ("Health Check Endpoint", lambda: requests.get("http://localhost:8000/health")),
            ("OpenAPI Documentation", lambda: requests.get("http://localhost:8000/openapi.json")),
            ("API Docs UI", lambda: requests.get("http://localhost:8000/docs")),
            ("Redoc UI", lambda: requests.get("http://localhost:8000/redoc")),
        ]
        
        for check_name, check_func in health_checks:
            try:
                response, duration = self.measure_performance(f"health_{check_name.lower().replace(' ', '_')}", check_func)
                
                if response.status_code == 200:
                    self.add_result(TestResult(
                        f"Health Check - {check_name}", 
                        True, 
                        details={"response_time": f"{duration:.3f}s", "status": response.status_code}
                    ))
                else:
                    self.add_result(TestResult(
                        f"Health Check - {check_name}", 
                        False, 
                        f"HTTP {response.status_code}: {response.text[:200]}",
                        {"response_time": f"{duration:.3f}s"}
                    ))
            except Exception as e:
                self.add_result(TestResult(
                    f"Health Check - {check_name}", 
                    False, 
                    str(e),
                    {"traceback": traceback.format_exc()}
                ))

    async def test_user_management_exhaustive(self):
        """Exhaustive user management testing"""
        print("\n👥 Testing User Management (Exhaustive)...")
        
        # Test user creation with various phone formats
        phone_test_cases = [
            ("+1234567890", "Standard US format"),
            ("+44 20 7946 0958", "UK format with spaces"),
            ("+33 1 23 45 67 89", "French format"),
            ("+49 30 12345678", "German format"),
            ("+81-3-1234-5678", "Japanese format with dashes"),
            ("(555) 123-4567", "US format with parentheses"),
            ("555.123.4567", "US format with dots"),
            ("5551234567", "US format no formatting"),
        ]
        
        for phone, description in phone_test_cases:
            try:
                user_data = {"phone": phone}
                response, duration = self.measure_performance(f"user_creation_{description.lower().replace(' ', '_')}", 
                                                            lambda: requests.post(f"{BASE_URL}/users", json=user_data))
                
                if response.status_code in [200, 201]:
                    user = response.json()
                    self.test_users.append(user)
                    self.add_result(TestResult(
                        f"User Creation - {description}", 
                        True, 
                        details={"user_id": user["id"], "phone_format": phone, "response_time": f"{duration:.3f}s"}
                    ))
                    
                    # Test immediate user retrieval
                    get_response = requests.get(f"{BASE_URL}/users/{user['id']}")
                    if get_response.status_code == 200:
                        self.add_result(TestResult(f"User Retrieval - {description}", True))
                    else:
                        self.add_result(TestResult(
                            f"User Retrieval - {description}", 
                            False, 
                            f"HTTP {get_response.status_code}: {get_response.text}"
                        ))
                        
                    # Test phone lookup
                    find_response = requests.get(f"{BASE_URL}/users/find/{phone}")
                    if find_response.status_code == 200:
                        self.add_result(TestResult(f"Phone Lookup - {description}", True))
                    else:
                        self.add_result(TestResult(
                            f"Phone Lookup - {description}", 
                            False, 
                            f"HTTP {find_response.status_code}: {find_response.text}"
                        ))
                        
                elif response.status_code == 400 and "already exists" in response.text:
                    # Handle duplicate phone numbers gracefully
                    self.add_result(TestResult(
                        f"User Creation - {description}", 
                        True, 
                        details={"duplicate_handled": True, "phone_format": phone}
                    ))
                else:
                    self.add_result(TestResult(
                        f"User Creation - {description}", 
                        False, 
                        f"HTTP {response.status_code}: {response.text}",
                        {"phone_format": phone, "response_time": f"{duration:.3f}s"}
                    ))
            except Exception as e:
                self.add_result(TestResult(
                    f"User Creation - {description}", 
                    False, 
                    str(e),
                    {"traceback": traceback.format_exc(), "phone_format": phone}
                ))

        # Test edge cases for user management
        edge_cases = [
            ("Empty Phone", {"phone": ""}),
            ("Null Phone", {"phone": None}),
            ("Very Long Phone", {"phone": "+1234567890123456789012345"}),
            ("Special Characters", {"phone": "+123-456-7890#ext123"}),
            ("Only Letters", {"phone": "abcdefghij"}),
            ("Mixed Content", {"phone": "+1abc234def5678"}),
            ("Unicode Characters", {"phone": "+1234567890🌱"}),
            ("SQL Injection Attempt", {"phone": "'; DROP TABLE users; --"}),
            ("XSS Attempt", {"phone": "<script>alert('xss')</script>"}),
        ]
        
        for case_name, user_data in edge_cases:
            try:
                response = requests.post(f"{BASE_URL}/users", json=user_data)
                
                # For edge cases, we expect either success (if input is sanitized/accepted) or proper error handling
                if response.status_code in [200, 201]:
                    user = response.json()
                    self.add_result(TestResult(
                        f"User Edge Case - {case_name}", 
                        True, 
                        details={"accepted": True, "user_id": user["id"], "input": user_data}
                    ))
                elif 400 <= response.status_code < 500:
                    # Proper error handling
                    self.add_result(TestResult(
                        f"User Edge Case - {case_name}", 
                        True, 
                        details={"proper_error_handling": True, "status": response.status_code, "input": user_data}
                    ))
                else:
                    # Unexpected server error
                    self.add_result(TestResult(
                        f"User Edge Case - {case_name}", 
                        False, 
                        f"Unexpected server error: HTTP {response.status_code}",
                        {"input": user_data, "response": response.text}
                    ))
            except Exception as e:
                self.add_result(TestResult(
                    f"User Edge Case - {case_name}", 
                    False, 
                    str(e),
                    {"traceback": traceback.format_exc(), "input": user_data}
                ))

    async def test_plant_catalog_comprehensive(self):
        """Comprehensive plant catalog testing"""
        print("\n🌿 Testing Plant Catalog (Comprehensive)...")
        
        # Test catalog retrieval
        try:
            response, duration = self.measure_performance("plant_catalog_retrieval", 
                                                        lambda: requests.get(f"{BASE_URL}/catalog"))
            
            if response.status_code == 200:
                catalog = response.json()
                plant_count = len(catalog)
                
                self.add_result(TestResult(
                    "Plant Catalog Retrieval", 
                    True, 
                    details={
                        "plant_count": plant_count, 
                        "response_time": f"{duration:.3f}s",
                        "data_size": len(json.dumps(catalog))
                    }
                ))
                
                # Test individual plant retrieval for first 10 plants
                for i, plant in enumerate(catalog[:10]):
                    plant_id = plant["id"]
                    plant_name = plant.get("name", f"Plant {plant_id}")
                    
                    try:
                        plant_response = requests.get(f"{BASE_URL}/catalog/{plant_id}")
                        if plant_response.status_code == 200:
                            plant_data = plant_response.json()
                            
                            # Validate plant data structure
                            required_fields = ["id", "name", "species", "care_requirements", "difficulty_level"]
                            missing_fields = [field for field in required_fields if field not in plant_data]
                            
                            if not missing_fields:
                                self.add_result(TestResult(f"Individual Plant Retrieval - {plant_name}", True))
                                
                                # Test personality suggestion for this plant
                                personality_response = requests.get(f"{BASE_URL}/catalog/{plant_id}/suggest-personality")
                                if personality_response.status_code == 200:
                                    suggestion = personality_response.json()
                                    self.add_result(TestResult(
                                        f"Personality Suggestion - {plant_name}", 
                                        True, 
                                        details={"suggestion": suggestion.get("suggested_personality")}
                                    ))
                                else:
                                    self.add_result(TestResult(
                                        f"Personality Suggestion - {plant_name}", 
                                        False, 
                                        f"HTTP {personality_response.status_code}: {personality_response.text}"
                                    ))
                            else:
                                self.add_result(TestResult(
                                    f"Individual Plant Retrieval - {plant_name}", 
                                    False, 
                                    f"Missing required fields: {missing_fields}",
                                    {"plant_data": plant_data}
                                ))
                        else:
                            self.add_result(TestResult(
                                f"Individual Plant Retrieval - {plant_name}", 
                                False, 
                                f"HTTP {plant_response.status_code}: {plant_response.text}"
                            ))
                    except Exception as e:
                        self.add_result(TestResult(
                            f"Individual Plant Retrieval - {plant_name}", 
                            False, 
                            str(e),
                            {"traceback": traceback.format_exc(), "plant_id": plant_id}
                        ))
                
                # Test invalid plant IDs
                invalid_ids = [0, -1, 99999, "invalid", None, "'; DROP TABLE plants; --"]
                for invalid_id in invalid_ids:
                    try:
                        response = requests.get(f"{BASE_URL}/catalog/{invalid_id}")
                        if response.status_code == 404:
                            self.add_result(TestResult(f"Invalid Plant ID Handling - {invalid_id}", True))
                        else:
                            self.add_result(TestResult(
                                f"Invalid Plant ID Handling - {invalid_id}", 
                                False, 
                                f"Expected 404, got {response.status_code}",
                                {"response": response.text}
                            ))
                    except Exception as e:
                        self.add_result(TestResult(
                            f"Invalid Plant ID Handling - {invalid_id}", 
                            False, 
                            str(e),
                            {"traceback": traceback.format_exc()}
                        ))
                        
            else:
                self.add_result(TestResult(
                    "Plant Catalog Retrieval", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}",
                    {"response_time": f"{duration:.3f}s"}
                ))
        except Exception as e:
            self.add_result(TestResult(
                "Plant Catalog Retrieval", 
                False, 
                str(e),
                {"traceback": traceback.format_exc()}
            ))

    async def test_plant_creation_exhaustive(self):
        """Exhaustive plant creation testing"""
        print("\n🌱 Testing Plant Creation (Exhaustive)...")
        
        if not self.test_users:
            self.add_result(TestResult("Plant Creation Setup", False, "No test users available"))
            return
        
        # Get catalog for testing
        catalog_response = requests.get(f"{BASE_URL}/catalog")
        if catalog_response.status_code != 200:
            self.add_result(TestResult("Plant Creation Setup", False, "Could not get catalog"))
            return
        
        catalog = catalog_response.json()
        
        # Test plant creation with various scenarios
        plant_scenarios = [
            {"nickname": "Basic Plant", "location": "Living Room"},
            {"nickname": "Plant with Special Characters !@#$%", "location": "Kitchen & Dining"},
            {"nickname": "Very Long Plant Name That Goes On And On And On And On", "location": "Very Specific Location With Lots Of Details"},
            {"nickname": "Plant123", "location": "Room #1"},
            {"nickname": "植物", "location": "部屋"},  # Unicode characters
            {"nickname": "Plant with Emoji 🌿🌱💚", "location": "Sunny Spot ☀️"},
            {"nickname": "Hyphenated-Plant-Name", "location": "Under-Stairs"},
            {"nickname": "Plant.with.dots", "location": "Room.2"},
            {"nickname": "Plant (with parentheses)", "location": "Room (upstairs)"},
            {"nickname": "Plant/with/slashes", "location": "Path/to/room"},
            {"nickname": "Plant\\with\\backslashes", "location": "C:\\Plants\\Room"},
            {"nickname": "Plant'with'quotes", "location": "John's Room"},
            {"nickname": 'Plant"with"double"quotes', "location": 'The "Green" Room'},
            {"nickname": "   Plant with spaces   ", "location": "   Spaced Room   "},
            {"nickname": "", "location": "Empty Name Test"},  # Edge case
            {"nickname": "Normal Plant", "location": ""},  # Edge case
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
                
                response, duration = self.measure_performance(f"plant_creation_{i}", 
                                                            lambda: requests.post(f"{BASE_URL}/plants", json=plant_data))
                
                if response.status_code in [200, 201]:
                    plant = response.json()
                    self.test_plants.append(plant)
                    
                    # Validate plant structure
                    required_fields = ["id", "nickname", "user_id", "plant_catalog_id", "personality_type_id", "plant_catalog", "personality"]
                    missing_fields = [field for field in required_fields if field not in plant]
                    
                    if not missing_fields:
                        personality_name = plant.get("personality", {}).get("name", "unknown")
                        self.add_result(TestResult(
                            f"Plant Creation - {plant_scenario['nickname'][:30]}...", 
                            True, 
                            details={
                                "plant_id": plant["id"],
                                "personality": personality_name,
                                "catalog_plant": catalog_plant["name"],
                                "response_time": f"{duration:.3f}s"
                            }
                        ))
                        
                        # Test immediate plant retrieval through user plants endpoint
                        user_plants_response = requests.get(f"{BASE_URL}/users/{user['id']}/plants")
                        if user_plants_response.status_code == 200:
                            user_plants = user_plants_response.json()
                            plant_found = any(p["id"] == plant["id"] for p in user_plants)
                            
                            if plant_found:
                                self.add_result(TestResult(f"Plant Retrieval Validation - {plant_scenario['nickname'][:30]}...", True))
                            else:
                                self.add_result(TestResult(
                                    f"Plant Retrieval Validation - {plant_scenario['nickname'][:30]}...", 
                                    False, 
                                    "Plant not found in user's plant list immediately after creation"
                                ))
                    else:
                        self.add_result(TestResult(
                            f"Plant Creation - {plant_scenario['nickname'][:30]}...", 
                            False, 
                            f"Missing required fields in response: {missing_fields}",
                            {"plant_data": plant, "response_time": f"{duration:.3f}s"}
                        ))
                elif response.status_code == 400 and (plant_scenario['nickname'] == "" or plant_scenario['location'] == ""):
                    # Proper handling of empty fields
                    self.add_result(TestResult(
                        f"Plant Creation - {plant_scenario['nickname'][:30] or 'Empty Name'}...", 
                        True, 
                        details={"proper_validation": True, "status": response.status_code}
                    ))
                else:
                    self.add_result(TestResult(
                        f"Plant Creation - {plant_scenario['nickname'][:30]}...", 
                        False, 
                        f"HTTP {response.status_code}: {response.text}",
                        {"plant_data": plant_data, "response_time": f"{duration:.3f}s"}
                    ))
            except Exception as e:
                self.add_result(TestResult(
                    f"Plant Creation - {plant_scenario['nickname'][:30]}...", 
                    False, 
                    str(e),
                    {"traceback": traceback.format_exc(), "plant_scenario": plant_scenario}
                ))
        
        # Test concurrent plant creation
        print("Testing concurrent plant creation...")
        try:
            import concurrent.futures
            
            def create_concurrent_plant(index):
                plant_data = {
                    "user_id": user["id"],
                    "plant_catalog_id": catalog[index % len(catalog)]["id"],
                    "nickname": f"Concurrent Plant {index}",
                    "location": f"Concurrent Location {index}"
                }
                return requests.post(f"{BASE_URL}/plants", json=plant_data)
            
            with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
                futures = [executor.submit(create_concurrent_plant, i) for i in range(5)]
                concurrent_results = [future.result() for future in concurrent.futures.as_completed(futures)]
            
            successful_concurrent = sum(1 for r in concurrent_results if r.status_code in [200, 201])
            
            if successful_concurrent >= 4:  # Allow for some race conditions
                self.add_result(TestResult("Concurrent Plant Creation", True, details={"successful": successful_concurrent, "total": 5}))
            else:
                self.add_result(TestResult(
                    "Concurrent Plant Creation", 
                    False, 
                    f"Only {successful_concurrent}/5 concurrent creations succeeded",
                    {"results": [r.status_code for r in concurrent_results]}
                ))
        except Exception as e:
            self.add_result(TestResult(
                "Concurrent Plant Creation", 
                False, 
                str(e),
                {"traceback": traceback.format_exc()}
            ))

    async def test_dashboard_functionality_extreme(self):
        """Extreme dashboard functionality testing"""
        print("\n📊 Testing Dashboard Functionality (Extreme)...")
        
        for user in self.test_users[:3]:  # Test multiple users
            try:
                response, duration = self.measure_performance(f"dashboard_user_{user['id']}", 
                                                            lambda: requests.get(f"{BASE_URL}/users/{user['id']}/dashboard"))
                
                if response.status_code == 200:
                    dashboard = response.json()
                    
                    # Comprehensive dashboard validation
                    required_top_level = ["user", "plants", "upcoming_care"]
                    missing_top_level = [field for field in required_top_level if field not in dashboard]
                    
                    if not missing_top_level:
                        user_data = dashboard["user"]
                        plants_data = dashboard["plants"]
                        care_data = dashboard["upcoming_care"]
                        
                        # Validate user data completeness
                        user_required = ["id", "phone", "subscription_tier", "is_active", "created_at"]
                        user_missing = [field for field in user_required if field not in user_data]
                        
                        if not user_missing:
                            self.add_result(TestResult(f"Dashboard User Data Validation - User {user['id']}", True))
                        else:
                            self.add_result(TestResult(
                                f"Dashboard User Data Validation - User {user['id']}", 
                                False, 
                                f"Missing user fields: {user_missing}"
                            ))
                        
                        # Validate plants data structure
                        if isinstance(plants_data, list):
                            for i, plant in enumerate(plants_data):
                                plant_required = ["id", "nickname", "plant_catalog", "personality", "recent_care", "care_schedules"]
                                plant_missing = [field for field in plant_required if field not in plant]
                                
                                if not plant_missing:
                                    # Validate nested structures
                                    catalog_required = ["id", "name", "species", "care_requirements"]
                                    catalog_missing = [field for field in catalog_required if field not in plant["plant_catalog"]]
                                    
                                    personality_required = ["id", "name", "description"]
                                    personality_missing = [field for field in personality_required if field not in plant["personality"]]
                                    
                                    if not catalog_missing and not personality_missing:
                                        self.add_result(TestResult(f"Dashboard Plant {i+1} Validation - User {user['id']}", True))
                                    else:
                                        self.add_result(TestResult(
                                            f"Dashboard Plant {i+1} Validation - User {user['id']}", 
                                            False, 
                                            f"Missing nested fields - catalog: {catalog_missing}, personality: {personality_missing}"
                                        ))
                                else:
                                    self.add_result(TestResult(
                                        f"Dashboard Plant {i+1} Validation - User {user['id']}", 
                                        False, 
                                        f"Missing plant fields: {plant_missing}"
                                    ))
                        else:
                            self.add_result(TestResult(
                                f"Dashboard Plants Data Type - User {user['id']}", 
                                False, 
                                f"Plants data is not a list, got: {type(plants_data)}"
                            ))
                        
                        # Validate care data
                        if isinstance(care_data, list):
                            self.add_result(TestResult(
                                f"Dashboard Care Data - User {user['id']}", 
                                True, 
                                details={"care_items": len(care_data), "response_time": f"{duration:.3f}s"}
                            ))
                        else:
                            self.add_result(TestResult(
                                f"Dashboard Care Data - User {user['id']}", 
                                False, 
                                f"Care data is not a list, got: {type(care_data)}"
                            ))
                            
                        # Test dashboard performance
                        if duration > 5.0:
                            self.add_result(TestResult(
                                f"Dashboard Performance - User {user['id']}", 
                                False, 
                                f"Dashboard loading too slow: {duration:.3f}s",
                                {"threshold": "5.0s", "actual": f"{duration:.3f}s"}
                            ))
                        else:
                            self.add_result(TestResult(f"Dashboard Performance - User {user['id']}", True))
                            
                    else:
                        self.add_result(TestResult(
                            f"Dashboard Structure - User {user['id']}", 
                            False, 
                            f"Missing top-level fields: {missing_top_level}",
                            {"dashboard_keys": list(dashboard.keys())}
                        ))
                else:
                    self.add_result(TestResult(
                        f"Dashboard Access - User {user['id']}", 
                        False, 
                        f"HTTP {response.status_code}: {response.text}",
                        {"response_time": f"{duration:.3f}s"}
                    ))
            except Exception as e:
                self.add_result(TestResult(
                    f"Dashboard Test - User {user['id']}", 
                    False, 
                    str(e),
                    {"traceback": traceback.format_exc()}
                ))

    async def test_ai_chat_comprehensive(self):
        """Comprehensive AI chat system testing"""
        print("\n🤖 Testing AI Chat System (Comprehensive)...")
        
        if not self.test_plants:
            self.add_result(TestResult("AI Chat Setup", False, "No test plants available"))
            return
        
        # Comprehensive conversation scenarios
        conversation_categories = {
            "Basic Greetings": [
                "Hello", "Hi", "Hey", "Good morning", "Good afternoon", "Good evening",
                "What's up?", "How's it going?", "Howdy", "Greetings"
            ],
            "Care Questions": [
                "Do you need water?", "Are you thirsty?", "How are you feeling?",
                "Do you need fertilizer?", "Should I mist you?", "Are you getting enough light?",
                "Do you need to be repotted?", "Are your roots okay?", "Do you need pruning?"
            ],
            "Personality Exploration": [
                "Tell me about yourself", "What's your personality like?", "Are you dramatic?",
                "Are you sarcastic?", "What makes you unique?", "What do you like?",
                "What don't you like?", "How do you feel about other plants?"
            ],
            "Care Actions": [
                "I just watered you", "I gave you fertilizer", "I moved you to a sunny spot",
                "I pruned your leaves", "I repotted you", "I cleaned your leaves",
                "I rotated you toward the light", "I checked your soil"
            ],
            "Emotional Support": [
                "I'm having a bad day", "You make me happy", "I love having you around",
                "You're my favorite plant", "Thank you for being here", "I appreciate you"
            ],
            "Complex Conversations": [
                "Tell me a story about your life", "What do you think about the weather?",
                "Do you have any advice for me?", "What's your favorite time of day?",
                "If you could be any plant, what would you be?", "What's your biggest fear?",
                "What makes you happiest?", "Do you dream?"
            ],
            "Edge Cases": [
                "", "a", "🌿🌱💚", "What's 2+2?", "Sing me a song",
                "This is a very long message that goes on and on and on to test how the AI handles really long input messages that might exceed normal conversation length and see if it can still provide meaningful responses",
                "Hello world! How are you doing today? I hope you're having a great time! What's new with you?",
                "Do you speak other languages? Hola! Bonjour! Guten Tag!",
                "Can you help me with my homework?", "What's the meaning of life?"
            ]
        }
        
        # Test with multiple plants to ensure personality consistency
        for plant in self.test_plants[:5]:  # Test with first 5 plants
            plant_id = plant["id"]
            plant_name = plant["nickname"]
            personality = plant.get("personality", {}).get("name", "unknown")
            
            print(f"Testing conversations with {plant_name} ({personality} personality)...")
            
            plant_conversations = []
            
            for category, messages in conversation_categories.items():
                for i, message in enumerate(messages):
                    try:
                        chat_data = {"message": message}
                        response, duration = self.measure_performance(f"chat_{plant_id}_{category}_{i}", 
                                                                    lambda: requests.post(f"{BASE_URL}/plants/{plant_id}/chat", json=chat_data))
                        
                        if response.status_code == 200:
                            chat_result = response.json()
                            
                            # Validate response structure
                            required_fields = ["plant_id", "plant_name", "personality", "user_message", "plant_response"]
                            missing_fields = [field for field in required_fields if field not in chat_result]
                            
                            if not missing_fields:
                                plant_response = chat_result["plant_response"]
                                returned_personality = chat_result["personality"]
                                
                                # Store conversation for analysis
                                conversation_record = {
                                    "plant_id": plant_id,
                                    "plant_name": plant_name,
                                    "category": category,
                                    "user_message": message,
                                    "plant_response": plant_response,
                                    "personality": returned_personality,
                                    "response_time": duration,
                                    "timestamp": datetime.now().isoformat()
                                }
                                plant_conversations.append(conversation_record)
                                
                                # Validate response quality
                                if message == "":  # Empty message test
                                    if 400 <= response.status_code < 500:
                                        self.add_result(TestResult(f"Chat Empty Message - {plant_name}", True))
                                    elif len(plant_response) > 0:
                                        self.add_result(TestResult(
                                            f"Chat Empty Message - {plant_name}", 
                                            True, 
                                            details={"handles_empty": True, "response_length": len(plant_response)}
                                        ))
                                    else:
                                        self.add_result(TestResult(
                                            f"Chat Empty Message - {plant_name}", 
                                            False, 
                                            "No response to empty message"
                                        ))
                                elif len(plant_response) > 10:  # Substantial response
                                    # Check for personality consistency
                                    personality_consistent = returned_personality == personality
                                    
                                    self.add_result(TestResult(
                                        f"Chat {category} - {plant_name} - Message {i+1}", 
                                        True, 
                                        details={
                                            "message": message[:50] + "..." if len(message) > 50 else message,
                                            "response_length": len(plant_response),
                                            "personality": returned_personality,
                                            "personality_consistent": personality_consistent,
                                            "response_time": f"{duration:.3f}s"
                                        }
                                    ))
                                    
                                    # Performance check
                                    if duration > 10.0:
                                        self.add_result(TestResult(
                                            f"Chat Performance - {plant_name} - {category}", 
                                            False, 
                                            f"Response too slow: {duration:.3f}s",
                                            {"message": message[:30]}
                                        ))
                                else:
                                    self.add_result(TestResult(
                                        f"Chat {category} - {plant_name} - Message {i+1}", 
                                        False, 
                                        "Response too short or empty",
                                        {
                                            "message": message,
                                            "response": plant_response,
                                            "response_length": len(plant_response)
                                        }
                                    ))
                            else:
                                self.add_result(TestResult(
                                    f"Chat Response Structure - {plant_name} - {category}", 
                                    False, 
                                    f"Missing response fields: {missing_fields}",
                                    {"response_keys": list(chat_result.keys())}
                                ))
                        else:
                            # For edge cases, some errors might be expected
                            if category == "Edge Cases" and 400 <= response.status_code < 500:
                                self.add_result(TestResult(
                                    f"Chat {category} - {plant_name} - Message {i+1}", 
                                    True, 
                                    details={"expected_error": response.status_code, "message": message}
                                ))
                            else:
                                self.add_result(TestResult(
                                    f"Chat {category} - {plant_name} - Message {i+1}", 
                                    False, 
                                    f"HTTP {response.status_code}: {response.text}",
                                    {"message": message, "response_time": f"{duration:.3f}s"}
                                ))
                    except Exception as e:
                        self.add_result(TestResult(
                            f"Chat {category} - {plant_name} - Message {i+1}", 
                            False, 
                            str(e),
                            {"traceback": traceback.format_exc(), "message": message}
                        ))
                    
                    # Small delay to avoid overwhelming the API
                    await asyncio.sleep(0.1)
            
            # Store conversations for this plant
            self.test_conversations.extend(plant_conversations)
            
            # Test personality demo endpoint
            try:
                demo_response = requests.get(f"{BASE_URL}/plants/{plant_id}/personality-demo")
                if demo_response.status_code == 200:
                    demo_data = demo_response.json()
                    
                    # Validate demo structure
                    demo_required = ["plant_id", "plant_name", "personality", "care_reminders", "conversation_samples"]
                    demo_missing = [field for field in demo_required if field not in demo_data]
                    
                    if not demo_missing:
                        self.add_result(TestResult(f"Personality Demo - {plant_name}", True))
                    else:
                        self.add_result(TestResult(
                            f"Personality Demo - {plant_name}", 
                            False, 
                            f"Missing demo fields: {demo_missing}",
                            {"demo_keys": list(demo_data.keys())}
                        ))
                else:
                    self.add_result(TestResult(
                        f"Personality Demo - {plant_name}", 
                        False, 
                        f"HTTP {demo_response.status_code}: {demo_response.text}"
                    ))
            except Exception as e:
                self.add_result(TestResult(
                    f"Personality Demo - {plant_name}", 
                    False, 
                    str(e),
                    {"traceback": traceback.format_exc()}
                ))

    async def test_care_system_comprehensive(self):
        """Comprehensive care system testing"""
        print("\n💧 Testing Care System (Comprehensive)...")
        
        if not self.test_users or not self.test_plants:
            self.add_result(TestResult("Care System Setup", False, "No test users or plants available"))
            return
        
        user = self.test_users[0]
        plant = self.test_plants[0] if self.test_plants else None
        
        if not plant:
            self.add_result(TestResult("Care System Setup", False, "No test plants available"))
            return
        
        # Test care schedule retrieval
        try:
            response = requests.get(f"{BASE_URL}/users/{user['id']}/schedule")
            if response.status_code == 200:
                schedule = response.json()
                self.add_result(TestResult(
                    "Care Schedule Retrieval", 
                    True, 
                    details={"schedule_items": len(schedule)}
                ))
            else:
                self.add_result(TestResult(
                    "Care Schedule Retrieval", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                ))
        except Exception as e:
            self.add_result(TestResult(
                "Care Schedule Retrieval", 
                False, 
                str(e),
                {"traceback": traceback.format_exc()}
            ))
        
        # Test care task completion with various scenarios
        care_scenarios = [
            {"task_type": "watering", "notes": "Regular watering"},
            {"task_type": "fertilizing", "notes": "Monthly fertilizer application"},
            {"task_type": "misting", "notes": "Humidity boost"},
            {"task_type": "pruning", "notes": "Removed dead leaves"},
            {"task_type": "repotting", "notes": "Moved to larger pot"},
            {"task_type": "cleaning", "notes": "Wiped leaves clean"},
            {"task_type": "rotating", "notes": "Turned toward light"},
            {"task_type": "watering", "notes": ""},  # Empty notes
            {"task_type": "watering", "notes": "Very long notes that go on and on about the detailed care process including water temperature, amount, soil condition, and general plant health observations"},
            {"task_type": "custom_care", "notes": "Custom care type test"},
        ]
        
        for scenario in care_scenarios:
            try:
                care_data = {
                    "user_plant_id": plant["id"],  # Note: using user_plant_id as per schema
                    **scenario
                }
                
                response = requests.post(f"{BASE_URL}/care/complete", json=care_data)
                
                if response.status_code in [200, 201]:
                    care_record = response.json()
                    self.test_care_history.append(care_record)
                    
                    self.add_result(TestResult(
                        f"Care Completion - {scenario['task_type']}", 
                        True, 
                        details={"care_id": care_record.get("id"), "task_type": scenario['task_type']}
                    ))
                else:
                    self.add_result(TestResult(
                        f"Care Completion - {scenario['task_type']}", 
                        False, 
                        f"HTTP {response.status_code}: {response.text}",
                        {"care_data": care_data}
                    ))
            except Exception as e:
                self.add_result(TestResult(
                    f"Care Completion - {scenario['task_type']}", 
                    False, 
                    str(e),
                    {"traceback": traceback.format_exc(), "scenario": scenario}
                ))
        
        # Test care reminders for different task types
        reminder_types = ["watering", "fertilizing", "misting", "pruning", "repotting", "cleaning", "invalid_type"]
        
        for task_type in reminder_types:
            try:
                response = requests.post(f"{BASE_URL}/plants/{plant['id']}/remind/{task_type}")
                
                if task_type == "invalid_type":
                    # This should either return an error or handle gracefully
                    if 400 <= response.status_code < 500:
                        self.add_result(TestResult(f"Care Reminder Invalid Type", True))
                    elif response.status_code == 200:
                        # If it handles gracefully, that's also acceptable
                        self.add_result(TestResult(f"Care Reminder Invalid Type", True, details={"graceful_handling": True}))
                    else:
                        self.add_result(TestResult(
                            f"Care Reminder Invalid Type", 
                            False, 
                            f"Unexpected response: HTTP {response.status_code}"
                        ))
                else:
                    if response.status_code == 200:
                        reminder = response.json()
                        self.add_result(TestResult(
                            f"Care Reminder - {task_type}", 
                            True, 
                            details={"reminder_content": len(str(reminder))}
                        ))
                    else:
                        self.add_result(TestResult(
                            f"Care Reminder - {task_type}", 
                            False, 
                            f"HTTP {response.status_code}: {response.text}"
                        ))
            except Exception as e:
                self.add_result(TestResult(
                    f"Care Reminder - {task_type}", 
                    False, 
                    str(e),
                    {"traceback": traceback.format_exc()}
                ))

    async def test_data_consistency_and_integrity(self):
        """Test data consistency and integrity across the system"""
        print("\n🔍 Testing Data Consistency and Integrity...")
        
        # Test cross-endpoint data consistency
        for user in self.test_users[:2]:
            user_id = user["id"]
            
            try:
                # Get user data from multiple endpoints
                user_direct = requests.get(f"{BASE_URL}/users/{user_id}")
                user_dashboard = requests.get(f"{BASE_URL}/users/{user_id}/dashboard")
                user_plants = requests.get(f"{BASE_URL}/users/{user_id}/plants")
                
                if all(r.status_code == 200 for r in [user_direct, user_dashboard, user_plants]):
                    direct_data = user_direct.json()
                    dashboard_data = user_dashboard.json()
                    plants_data = user_plants.json()
                    
                    # Check user data consistency
                    dashboard_user = dashboard_data["user"]
                    key_fields = ["id", "phone", "subscription_tier", "is_active"]
                    
                    consistent = all(
                        direct_data.get(field) == dashboard_user.get(field) 
                        for field in key_fields
                    )
                    
                    if consistent:
                        self.add_result(TestResult(f"User Data Consistency - User {user_id}", True))
                    else:
                        self.add_result(TestResult(
                            f"User Data Consistency - User {user_id}", 
                            False, 
                            "User data inconsistent between endpoints",
                            {
                                "direct": {field: direct_data.get(field) for field in key_fields},
                                "dashboard": {field: dashboard_user.get(field) for field in key_fields}
                            }
                        ))
                    
                    # Check plants data consistency
                    dashboard_plants = dashboard_data["plants"]
                    
                    if len(plants_data) == len(dashboard_plants):
                        self.add_result(TestResult(f"Plants Count Consistency - User {user_id}", True))
                    else:
                        self.add_result(TestResult(
                            f"Plants Count Consistency - User {user_id}", 
                            False, 
                            f"Plant count mismatch: direct={len(plants_data)}, dashboard={len(dashboard_plants)}"
                        ))
                        
                else:
                    self.add_result(TestResult(
                        f"Data Consistency Setup - User {user_id}", 
                        False, 
                        "Could not retrieve data from all endpoints"
                    ))
            except Exception as e:
                self.add_result(TestResult(
                    f"Data Consistency - User {user_id}", 
                    False, 
                    str(e),
                    {"traceback": traceback.format_exc()}
                ))

    async def test_performance_and_scalability(self):
        """Test performance and scalability aspects"""
        print("\n⚡ Testing Performance and Scalability...")
        
        # Analyze performance metrics collected during tests
        slow_operations = []
        fast_operations = []
        
        for operation, metrics in self.performance_metrics.items():
            if metrics['success']:
                duration = metrics['duration']
                if duration > 3.0:  # Slow operations
                    slow_operations.append((operation, duration))
                elif duration < 0.5:  # Fast operations
                    fast_operations.append((operation, duration))
        
        # Report on performance
        if slow_operations:
            self.add_result(TestResult(
                "Performance Analysis - Slow Operations", 
                len(slow_operations) < 5,  # Fail if more than 5 slow operations
                f"Found {len(slow_operations)} slow operations" if len(slow_operations) >= 5 else None,
                {"slow_operations": slow_operations[:10]}  # Top 10 slowest
            ))
        else:
            self.add_result(TestResult("Performance Analysis - Slow Operations", True))
        
        self.add_result(TestResult(
            "Performance Analysis - Fast Operations", 
            True, 
            details={"fast_operations_count": len(fast_operations)}
        ))
        
        # Test rapid sequential requests
        if self.test_plants:
            plant = self.test_plants[0]
            
            try:
                rapid_requests = []
                start_time = time.time()
                
                for i in range(10):
                    response = requests.post(f"{BASE_URL}/plants/{plant['id']}/chat", 
                                           json={"message": f"Rapid test {i}"})
                    rapid_requests.append(response.status_code)
                
                end_time = time.time()
                total_duration = end_time - start_time
                
                successful_requests = sum(1 for status in rapid_requests if status == 200)
                
                if successful_requests >= 8:  # Allow for some failures under load
                    self.add_result(TestResult(
                        "Rapid Sequential Requests", 
                        True, 
                        details={
                            "successful": successful_requests, 
                            "total": 10, 
                            "total_time": f"{total_duration:.3f}s",
                            "avg_time": f"{total_duration/10:.3f}s"
                        }
                    ))
                else:
                    self.add_result(TestResult(
                        "Rapid Sequential Requests", 
                        False, 
                        f"Only {successful_requests}/10 requests succeeded",
                        {"status_codes": rapid_requests}
                    ))
            except Exception as e:
                self.add_result(TestResult(
                    "Rapid Sequential Requests", 
                    False, 
                    str(e),
                    {"traceback": traceback.format_exc()}
                ))

    async def run_final_comprehensive_tests(self):
        """Run the complete final comprehensive test suite"""
        print("🚀 Starting FINAL COMPREHENSIVE Test Suite")
        print("=" * 100)
        print("This is the most thorough test of the entire Plants-Texts application")
        print("=" * 100)
        
        start_time = datetime.now()
        
        # Run all test categories
        await self.test_system_health_comprehensive()
        await self.test_user_management_exhaustive()
        await self.test_plant_catalog_comprehensive()
        await self.test_plant_creation_exhaustive()
        await self.test_dashboard_functionality_extreme()
        await self.test_ai_chat_comprehensive()
        await self.test_care_system_comprehensive()
        await self.test_data_consistency_and_integrity()
        await self.test_performance_and_scalability()
        
        end_time = datetime.now()
        duration = end_time - start_time
        
        # Generate comprehensive summary
        self.generate_final_summary(duration)
    
    def generate_final_summary(self, duration):
        """Generate the most comprehensive test summary"""
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r.success)
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        print("\n" + "=" * 100)
        print("📊 FINAL COMPREHENSIVE TEST SUMMARY")
        print("=" * 100)
        print(f"🔢 Total Tests Executed: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"📈 Success Rate: {success_rate:.1f}%")
        print(f"⏱️  Total Duration: {duration}")
        print(f"👥 Test Users Created: {len(self.test_users)}")
        print(f"🌱 Test Plants Created: {len(self.test_plants)}")
        print(f"💬 Conversations Tested: {len(self.test_conversations)}")
        print(f"🗂️  Care Records Created: {len(self.test_care_history)}")
        print(f"⚡ Performance Metrics: {len(self.performance_metrics)}")
        
        # Performance summary
        if self.performance_metrics:
            avg_response_time = sum(m['duration'] for m in self.performance_metrics.values() if m['success']) / len([m for m in self.performance_metrics.values() if m['success']])
            print(f"⏱️  Average Response Time: {avg_response_time:.3f}s")
        
        if failed_tests > 0:
            print(f"\n🐛 {failed_tests} GitHub issues created for failures")
            print("Check your GitHub repository for detailed bug reports")
            
            print(f"\n❌ FAILED TESTS ({failed_tests}):")
            for i, result in enumerate([r for r in self.results if not r.success], 1):
                print(f"  {i:2d}. {result.test_name}")
                print(f"      Error: {result.error}")
        else:
            print("\n🎉 ALL TESTS PASSED! The system is ready for production!")
        
        # Categorize results
        categories = {}
        for result in self.results:
            category = result.test_name.split(' - ')[0] if ' - ' in result.test_name else "General"
            if category not in categories:
                categories[category] = {"passed": 0, "failed": 0}
            
            if result.success:
                categories[category]["passed"] += 1
            else:
                categories[category]["failed"] += 1
        
        print(f"\n📊 RESULTS BY CATEGORY:")
        for category, counts in categories.items():
            total_cat = counts["passed"] + counts["failed"]
            success_rate_cat = (counts["passed"] / total_cat) * 100 if total_cat > 0 else 0
            print(f"  {category:30} | ✅ {counts['passed']:3d} | ❌ {counts['failed']:3d} | {success_rate_cat:5.1f}%")
        
        # Save comprehensive results
        results_data = {
            "summary": {
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "failed_tests": failed_tests,
                "success_rate": f"{success_rate:.1f}%",
                "duration": str(duration),
                "timestamp": datetime.now().isoformat(),
                "test_data_created": {
                    "users": len(self.test_users),
                    "plants": len(self.test_plants),
                    "conversations": len(self.test_conversations),
                    "care_records": len(self.test_care_history)
                }
            },
            "performance_metrics": self.performance_metrics,
            "test_data": {
                "users": self.test_users[:5],  # Sample data
                "plants": self.test_plants[:5],
                "conversations": self.test_conversations[:20],
                "care_history": self.test_care_history[:10]
            },
            "categories": categories,
            "detailed_results": [
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
        
        with open("final_comprehensive_test_results.json", "w") as f:
            json.dump(results_data, f, indent=2)
        
        print(f"\n📄 Detailed results saved to: final_comprehensive_test_results.json")
        print(f"📝 Log file: final_comprehensive_test.log")
        
        # Final verdict
        if success_rate >= 95:
            print(f"\n🎉 EXCELLENT! Success rate {success_rate:.1f}% - System is production-ready!")
        elif success_rate >= 90:
            print(f"\n✅ GOOD! Success rate {success_rate:.1f}% - Minor issues to address")
        elif success_rate >= 80:
            print(f"\n⚠️  FAIR! Success rate {success_rate:.1f}% - Several issues need attention")
        else:
            print(f"\n🚨 CRITICAL! Success rate {success_rate:.1f}% - Major issues require immediate attention")

async def main():
    """Main test runner for final comprehensive testing"""
    print("🔥 FINAL COMPREHENSIVE TEST SUITE")
    print("This will be the most thorough test of the entire application")
    print("Buckle up! 🚀\n")
    
    test_suite = FinalComprehensiveTestSuite()
    await test_suite.run_final_comprehensive_tests()

if __name__ == "__main__":
    asyncio.run(main())
