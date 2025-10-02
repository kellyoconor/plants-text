#!/usr/bin/env python3
"""
TARGETED ISSUE REPRODUCTION TEST
This test specifically targets the issues visible in GitHub to reproduce and fix them
"""

import requests
import json
import traceback
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"

class IssueReproducer:
    def __init__(self):
        self.reproduced_issues = []
        self.test_data = {}
    
    def log_issue(self, issue_name, error, details=None):
        issue = {
            "name": issue_name,
            "error": error,
            "details": details or {},
            "timestamp": datetime.now().isoformat()
        }
        self.reproduced_issues.append(issue)
        print(f"🚨 REPRODUCED: {issue_name} - {error}")
    
    def test_invalid_plant_id_handling(self):
        """Test the Invalid Plant ID Handling issues from GitHub"""
        print("\n🔍 Testing Invalid Plant ID Handling...")
        
        invalid_ids = [
            ("invalid_string", "invalid"),
            ("null_value", None),
            ("sql_injection", "'; DROP TABLE plants; --"),
            ("empty_string", ""),
            ("negative_number", -1),
            ("zero", 0),
            ("very_large_number", 999999999),
            ("special_chars", "!@#$%^&*()"),
            ("unicode", "植物"),
            ("boolean", True),
            ("float", 3.14)
        ]
        
        for test_name, invalid_id in invalid_ids:
            try:
                # Test catalog endpoint
                if invalid_id is None:
                    url = f"{BASE_URL}/catalog/None"
                elif isinstance(invalid_id, bool):
                    url = f"{BASE_URL}/catalog/{str(invalid_id).lower()}"
                else:
                    url = f"{BASE_URL}/catalog/{invalid_id}"
                
                response = requests.get(url, allow_redirects=False)
                
                # According to GitHub issues, these should return 404 but are returning 422
                # Special case: empty string gets redirected to catalog list, which is acceptable
                if test_name == "empty_string" and response.status_code == 307:
                    # This is acceptable - empty string redirects to catalog list
                    pass
                elif response.status_code == 422:
                    self.log_issue(
                        f"Invalid Plant ID Handling - {test_name}",
                        f"Returns 422 instead of expected 404",
                        {"invalid_id": str(invalid_id), "status_code": response.status_code, "response": response.text[:200]}
                    )
                elif response.status_code != 404:
                    self.log_issue(
                        f"Invalid Plant ID Handling - {test_name}",
                        f"Unexpected status code: {response.status_code}",
                        {"invalid_id": str(invalid_id), "expected": 404, "actual": response.status_code}
                    )
                
            except Exception as e:
                self.log_issue(
                    f"Invalid Plant ID Handling - {test_name}",
                    f"Exception occurred: {str(e)}",
                    {"invalid_id": str(invalid_id), "traceback": traceback.format_exc()}
                )
    
    def test_user_registration_issues(self):
        """Test user registration with various formats that might be failing"""
        print("\n👥 Testing User Registration Issues...")
        
        # Test cases that might be causing the GitHub issues
        problematic_formats = [
            ("format_1", "+1234567890"),  # Standard format from GitHub issue
            ("format_2", "+33 1 23 45 67 89"),  # French format
            ("format_3", "+44 20 7946 0958"),  # UK format
            ("format_4", "+49 30 12345678"),  # German format
            ("format_5", "+81-3-1234-5678"),  # Japanese format
            ("format_6", "(555) 123-4567"),  # US parentheses format
            ("empty_phone", ""),  # Empty phone
            ("null_phone", None),  # Null phone
            ("very_long_phone", "+1234567890123456789012345"),  # Very long
            ("special_chars", "+123-456-7890#ext123"),  # Special characters
            ("letters_only", "abcdefghij"),  # Letters only
            ("mixed_content", "+1abc234def5678"),  # Mixed content
        ]
        
        for test_name, phone in problematic_formats:
            try:
                user_data = {"phone": phone} if phone is not None else {"phone": None}
                response = requests.post(f"{BASE_URL}/users", json=user_data)
                
                # Check for various failure modes
                if response.status_code >= 500:
                    self.log_issue(
                        f"User Registration - {test_name}",
                        f"Server error: HTTP {response.status_code}",
                        {"phone": phone, "response": response.text[:200]}
                    )
                elif response.status_code == 422 and phone in ["", None]:
                    # This might be expected for empty/null phones
                    pass
                elif response.status_code not in [200, 201, 400]:
                    self.log_issue(
                        f"User Registration - {test_name}",
                        f"Unexpected status code: {response.status_code}",
                        {"phone": phone, "response": response.text[:200]}
                    )
                elif response.status_code in [200, 201]:
                    # Success - store for later tests
                    user = response.json()
                    self.test_data[f"user_{test_name}"] = user
                    
            except Exception as e:
                self.log_issue(
                    f"User Registration - {test_name}",
                    f"Exception: {str(e)}",
                    {"phone": phone, "traceback": traceback.format_exc()}
                )
    
    def test_chat_setup_issues(self):
        """Test chat setup issues mentioned in GitHub"""
        print("\n💬 Testing Chat Setup Issues...")
        
        # First create a user and plant for testing
        try:
            # Use a unique phone number to avoid conflicts
            import time
            unique_phone = f"+155512345{int(time.time()) % 10000:04d}"
            user_response = requests.post(f"{BASE_URL}/users", json={"phone": unique_phone})
            if user_response.status_code not in [200, 201]:
                self.log_issue("Chat Setup - User Creation", f"Could not create user: {user_response.status_code}", {"response": user_response.text})
                return
            
            user = user_response.json()
            
            # Get catalog
            catalog_response = requests.get(f"{BASE_URL}/catalog")
            if catalog_response.status_code != 200:
                self.log_issue("Chat Setup - Catalog Access", f"Could not get catalog: {catalog_response.status_code}", {"response": catalog_response.text})
                return
            
            catalog = catalog_response.json()
            
            # Create plant
            plant_response = requests.post(f"{BASE_URL}/plants", json={
                "user_id": user["id"],
                "plant_catalog_id": catalog[0]["id"],
                "nickname": "ChatTestPlant",
                "location": "TestLocation"
            })
            
            if plant_response.status_code not in [200, 201]:
                self.log_issue("Chat Setup - Plant Creation", f"Could not create plant: {plant_response.status_code}", {"response": plant_response.text})
                return
            
            plant = plant_response.json()
            
            # Test various chat scenarios that might be failing
            chat_test_cases = [
                ("empty_message", ""),
                ("null_message", None),
                ("very_long_message", "A" * 10000),
                ("special_chars", "Hello! @#$%^&*()"),
                ("unicode", "Hello 植物 🌱"),
                ("json_injection", '{"evil": "payload"}'),
                ("html_injection", "<script>alert('test')</script>"),
                ("normal_message", "Hello, how are you?")
            ]
            
            for test_name, message in chat_test_cases:
                try:
                    chat_data = {"message": message} if message is not None else {"message": None}
                    response = requests.post(f"{BASE_URL}/plants/{plant['id']}/chat", json=chat_data, timeout=10)
                    
                    if response.status_code >= 500:
                        self.log_issue(
                            f"Chat Setup - {test_name}",
                            f"Server error: HTTP {response.status_code}",
                            {"message": str(message)[:100], "response": response.text[:200]}
                        )
                    elif response.status_code == 422 and message in ["", None]:
                        # Might be expected for empty/null messages
                        pass
                    elif response.status_code not in [200, 400]:
                        self.log_issue(
                            f"Chat Setup - {test_name}",
                            f"Unexpected status code: {response.status_code}",
                            {"message": str(message)[:100], "response": response.text[:200]}
                        )
                        
                except requests.exceptions.Timeout:
                    self.log_issue(
                        f"Chat Setup - {test_name}",
                        "Chat request timed out after 10 seconds",
                        {"message": str(message)[:100]}
                    )
                except Exception as e:
                    self.log_issue(
                        f"Chat Setup - {test_name}",
                        f"Exception: {str(e)}",
                        {"message": str(message)[:100], "traceback": traceback.format_exc()}
                    )
                    
        except Exception as e:
            self.log_issue("Chat Setup - General", f"Setup failed: {str(e)}", {"traceback": traceback.format_exc()})
    
    def test_care_task_issues(self):
        """Test care task completion issues from GitHub"""
        print("\n💧 Testing Care Task Issues...")
        
        # Create test data
        try:
            # Use a unique phone number to avoid conflicts
            import time
            unique_phone = f"+155512346{int(time.time()) % 10000:04d}"
            user_response = requests.post(f"{BASE_URL}/users", json={"phone": unique_phone})
            if user_response.status_code not in [200, 201]:
                return
            
            user = user_response.json()
            
            catalog_response = requests.get(f"{BASE_URL}/catalog")
            if catalog_response.status_code != 200:
                return
            
            catalog = catalog_response.json()
            
            plant_response = requests.post(f"{BASE_URL}/plants", json={
                "user_id": user["id"],
                "plant_catalog_id": catalog[0]["id"],
                "nickname": "CareTestPlant",
                "location": "TestLocation"
            })
            
            if plant_response.status_code not in [200, 201]:
                return
            
            plant = plant_response.json()
            
            # Test care completion with different field names (GitHub issue mentions user_plant_id vs plant_id confusion)
            care_test_cases = [
                ("correct_field", {"user_plant_id": plant["id"], "task_type": "watering", "notes": "Test watering"}),
                ("wrong_field", {"plant_id": plant["id"], "task_type": "watering", "notes": "Test watering"}),  # This might be the issue
                ("missing_required", {"user_plant_id": plant["id"]}),  # Missing task_type
                ("invalid_task_type", {"user_plant_id": plant["id"], "task_type": "invalid_task", "notes": "Test"}),
                ("empty_task_type", {"user_plant_id": plant["id"], "task_type": "", "notes": "Test"}),
                ("null_task_type", {"user_plant_id": plant["id"], "task_type": None, "notes": "Test"}),
                ("very_long_notes", {"user_plant_id": plant["id"], "task_type": "watering", "notes": "A" * 10000}),
            ]
            
            for test_name, care_data in care_test_cases:
                try:
                    response = requests.post(f"{BASE_URL}/care/complete", json=care_data)
                    
                    if test_name == "wrong_field" and response.status_code == 400:
                        # This is the expected behavior - using plant_id instead of user_plant_id should fail
                        self.log_issue(
                            "Care Task - Wrong Field Name",
                            "API expects 'user_plant_id' but 'plant_id' was provided",
                            {"care_data": care_data, "status_code": response.status_code, "response": response.text[:200]}
                        )
                    elif test_name == "invalid_task_type" and response.status_code not in [400, 422]:
                        # Invalid task types should be rejected
                        self.log_issue(
                            "Care Task - Invalid Task Type",
                            f"Invalid task type not properly rejected: {response.status_code}",
                            {"care_data": care_data, "response": response.text[:200]}
                        )
                    elif response.status_code >= 500:
                        self.log_issue(
                            f"Care Task - {test_name}",
                            f"Server error: HTTP {response.status_code}",
                            {"care_data": care_data, "response": response.text[:200]}
                        )
                        
                except Exception as e:
                    self.log_issue(
                        f"Care Task - {test_name}",
                        f"Exception: {str(e)}",
                        {"care_data": care_data, "traceback": traceback.format_exc()}
                    )
                    
        except Exception as e:
            self.log_issue("Care Task - Setup", f"Setup failed: {str(e)}", {"traceback": traceback.format_exc()})
    
    def test_dashboard_issues(self):
        """Test dashboard access issues from GitHub"""
        print("\n📊 Testing Dashboard Issues...")
        
        # Test various dashboard access scenarios
        dashboard_test_cases = [
            ("invalid_user_id", 99999),
            ("negative_user_id", -1),
            ("zero_user_id", 0),
            ("string_user_id", "invalid"),
            ("null_user_id", None),
        ]
        
        for test_name, user_id in dashboard_test_cases:
            try:
                if user_id is None:
                    url = f"{BASE_URL}/users/None/dashboard"
                else:
                    url = f"{BASE_URL}/users/{user_id}/dashboard"
                
                response = requests.get(url)
                
                if response.status_code >= 500:
                    self.log_issue(
                        f"Dashboard - {test_name}",
                        f"Server error: HTTP {response.status_code}",
                        {"user_id": user_id, "response": response.text[:200]}
                    )
                elif response.status_code == 422 and test_name in ["string_user_id", "null_user_id"]:
                    # These might be expected validation errors, but GitHub shows them as issues
                    self.log_issue(
                        f"Dashboard - {test_name}",
                        f"Returns 422 instead of 404 for invalid user ID",
                        {"user_id": user_id, "status_code": response.status_code}
                    )
                    
            except Exception as e:
                self.log_issue(
                    f"Dashboard - {test_name}",
                    f"Exception: {str(e)}",
                    {"user_id": user_id, "traceback": traceback.format_exc()}
                )
        
        # Test dashboard with valid user but edge cases
        try:
            # Use a unique phone number to avoid conflicts
            import time
            unique_phone = f"+155512347{int(time.time()) % 10000:04d}"
            user_response = requests.post(f"{BASE_URL}/users", json={"phone": unique_phone})
            if user_response.status_code in [200, 201]:
                user = user_response.json()
                
                # Test dashboard immediately after user creation (might have timing issues)
                response = requests.get(f"{BASE_URL}/users/{user['id']}/dashboard")
                if response.status_code != 200:
                    self.log_issue(
                        "Dashboard - New User Access",
                        f"Cannot access dashboard immediately after user creation: {response.status_code}",
                        {"user_id": user["id"], "response": response.text[:200]}
                    )
                    
        except Exception as e:
            self.log_issue("Dashboard - New User Test", f"Exception: {str(e)}", {"traceback": traceback.format_exc()})
    
    def run_targeted_tests(self):
        """Run all targeted issue reproduction tests"""
        print("🎯 TARGETED ISSUE REPRODUCTION TEST")
        print("Attempting to reproduce the specific issues visible in GitHub")
        print("=" * 80)
        
        self.test_invalid_plant_id_handling()
        self.test_user_registration_issues()
        self.test_chat_setup_issues()
        self.test_care_task_issues()
        self.test_dashboard_issues()
        
        # Generate summary
        print("\n" + "=" * 80)
        print("🎯 TARGETED TEST RESULTS")
        print("=" * 80)
        print(f"🚨 Issues Reproduced: {len(self.reproduced_issues)}")
        
        if self.reproduced_issues:
            print("\n🚨 REPRODUCED ISSUES:")
            for i, issue in enumerate(self.reproduced_issues, 1):
                print(f"  {i:2d}. {issue['name']}")
                print(f"      {issue['error']}")
        else:
            print("\n🤔 No issues reproduced - the GitHub issues might be resolved or test conditions different")
        
        # Save results
        results_data = {
            "timestamp": datetime.now().isoformat(),
            "total_issues": len(self.reproduced_issues),
            "issues": self.reproduced_issues,
            "test_data": self.test_data
        }
        
        with open("targeted_issue_reproduction.json", "w") as f:
            json.dump(results_data, f, indent=2)
        
        print(f"\n📄 Detailed results saved to: targeted_issue_reproduction.json")

def main():
    reproducer = IssueReproducer()
    reproducer.run_targeted_tests()

if __name__ == "__main__":
    main()
