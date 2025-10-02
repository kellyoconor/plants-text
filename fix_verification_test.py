#!/usr/bin/env python3
"""
FINAL VERIFICATION TEST
Test all the fixes we've implemented to ensure they're working correctly
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"

class FixVerificationTest:
    def __init__(self):
        self.results = []
        self.passed = 0
        self.failed = 0
    
    def test_result(self, test_name, success, details=""):
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.results.append(result)
        
        if success:
            self.passed += 1
            print(f"✅ {test_name}")
        else:
            self.failed += 1
            print(f"❌ {test_name} - {details}")
    
    def test_invalid_plant_ids_return_404(self):
        """Test that invalid plant IDs now return 404 instead of 422"""
        print("\n🔍 Testing Invalid Plant ID Fixes...")
        
        invalid_ids = [
            "invalid",
            "None", 
            "'; DROP TABLE plants; --",
            "!@#$%^&*()",
            "植物",
            "true",
            "3.14"
        ]
        
        all_correct = True
        for invalid_id in invalid_ids:
            try:
                response = requests.get(f"{BASE_URL}/catalog/{invalid_id}", allow_redirects=False)
                if response.status_code == 404:
                    continue
                else:
                    all_correct = False
                    break
            except Exception:
                all_correct = False
                break
        
        self.test_result(
            "Invalid Plant IDs Return 404", 
            all_correct,
            "All invalid plant IDs correctly return 404" if all_correct else "Some invalid IDs don't return 404"
        )
    
    def test_invalid_user_ids_return_404(self):
        """Test that invalid user IDs now return 404 instead of 422"""
        print("\n👥 Testing Invalid User ID Fixes...")
        
        invalid_ids = ["invalid", "None", "!@#$", "-1"]
        
        all_correct = True
        for invalid_id in invalid_ids:
            try:
                response = requests.get(f"{BASE_URL}/users/{invalid_id}", allow_redirects=False)
                if response.status_code == 404:
                    continue
                else:
                    all_correct = False
                    break
            except Exception:
                all_correct = False
                break
        
        self.test_result(
            "Invalid User IDs Return 404", 
            all_correct,
            "All invalid user IDs correctly return 404" if all_correct else "Some invalid IDs don't return 404"
        )
    
    def test_invalid_dashboard_ids_return_404(self):
        """Test that invalid dashboard user IDs return 404"""
        print("\n📊 Testing Invalid Dashboard ID Fixes...")
        
        invalid_ids = ["invalid", "None"]
        
        all_correct = True
        for invalid_id in invalid_ids:
            try:
                response = requests.get(f"{BASE_URL}/users/{invalid_id}/dashboard", allow_redirects=False)
                if response.status_code == 404:
                    continue
                else:
                    all_correct = False
                    break
            except Exception:
                all_correct = False
                break
        
        self.test_result(
            "Invalid Dashboard User IDs Return 404", 
            all_correct,
            "All invalid dashboard user IDs correctly return 404" if all_correct else "Some invalid IDs don't return 404"
        )
    
    def test_invalid_care_types_rejected(self):
        """Test that invalid care types are now properly rejected"""
        print("\n💧 Testing Invalid Care Type Fixes...")
        
        # First create a user and plant for testing
        try:
            import time
            unique_phone = f"+155512348{int(time.time()) % 10000:04d}"
            user_response = requests.post(f"{BASE_URL}/users", json={"phone": unique_phone})
            
            if user_response.status_code not in [200, 201]:
                self.test_result("Invalid Care Types Rejected", False, "Could not create test user")
                return
            
            user = user_response.json()
            
            # Get catalog and create plant
            catalog_response = requests.get(f"{BASE_URL}/catalog")
            if catalog_response.status_code != 200:
                self.test_result("Invalid Care Types Rejected", False, "Could not get catalog")
                return
            
            catalog = catalog_response.json()
            
            plant_response = requests.post(f"{BASE_URL}/plants", json={
                "user_id": user["id"],
                "plant_catalog_id": catalog[0]["id"],
                "nickname": "CareTestPlant",
                "location": "TestLocation"
            })
            
            if plant_response.status_code not in [200, 201]:
                self.test_result("Invalid Care Types Rejected", False, "Could not create test plant")
                return
            
            plant = plant_response.json()
            
            # Test invalid care type
            invalid_care_response = requests.post(f"{BASE_URL}/care/complete", json={
                "user_plant_id": plant["id"],
                "task_type": "invalid_task_type",
                "notes": "Test invalid care type"
            })
            
            # Should return 400 for invalid task type
            if invalid_care_response.status_code == 400:
                self.test_result("Invalid Care Types Rejected", True, "Invalid care types properly return 400")
            else:
                self.test_result("Invalid Care Types Rejected", False, f"Invalid care type returned {invalid_care_response.status_code} instead of 400")
                
        except Exception as e:
            self.test_result("Invalid Care Types Rejected", False, f"Exception: {str(e)}")
    
    def test_valid_operations_still_work(self):
        """Test that valid operations still work after our fixes"""
        print("\n✅ Testing Valid Operations Still Work...")
        
        try:
            # Test valid plant catalog access
            catalog_response = requests.get(f"{BASE_URL}/catalog")
            if catalog_response.status_code != 200:
                self.test_result("Valid Catalog Access", False, f"Catalog returns {catalog_response.status_code}")
                return
            
            catalog = catalog_response.json()
            if len(catalog) == 0:
                self.test_result("Valid Catalog Access", False, "Catalog is empty")
                return
            
            # Test valid individual plant access
            first_plant_response = requests.get(f"{BASE_URL}/catalog/{catalog[0]['id']}")
            if first_plant_response.status_code != 200:
                self.test_result("Valid Plant Access", False, f"Individual plant returns {first_plant_response.status_code}")
                return
            
            # Test valid user creation
            import time
            unique_phone = f"+155512349{int(time.time()) % 10000:04d}"
            user_response = requests.post(f"{BASE_URL}/users", json={"phone": unique_phone})
            
            if user_response.status_code not in [200, 201]:
                self.test_result("Valid User Creation", False, f"User creation returns {user_response.status_code}")
                return
            
            user = user_response.json()
            
            # Test valid user access
            user_get_response = requests.get(f"{BASE_URL}/users/{user['id']}")
            if user_get_response.status_code != 200:
                self.test_result("Valid User Access", False, f"User access returns {user_get_response.status_code}")
                return
            
            # Test valid dashboard access
            dashboard_response = requests.get(f"{BASE_URL}/users/{user['id']}/dashboard")
            if dashboard_response.status_code != 200:
                self.test_result("Valid Dashboard Access", False, f"Dashboard returns {dashboard_response.status_code}")
                return
            
            # Test valid plant creation
            plant_response = requests.post(f"{BASE_URL}/plants", json={
                "user_id": user["id"],
                "plant_catalog_id": catalog[0]["id"],
                "nickname": "ValidTestPlant",
                "location": "TestLocation"
            })
            
            if plant_response.status_code not in [200, 201]:
                self.test_result("Valid Plant Creation", False, f"Plant creation returns {plant_response.status_code}")
                return
            
            plant = plant_response.json()
            
            # Test valid care completion
            care_response = requests.post(f"{BASE_URL}/care/complete", json={
                "user_plant_id": plant["id"],
                "task_type": "watering",
                "notes": "Test valid care completion"
            })
            
            if care_response.status_code not in [200, 201]:
                self.test_result("Valid Care Completion", False, f"Care completion returns {care_response.status_code}")
                return
            
            # Test valid chat
            chat_response = requests.post(f"{BASE_URL}/plants/{plant['id']}/chat", json={
                "message": "Hello, how are you?"
            })
            
            if chat_response.status_code != 200:
                self.test_result("Valid Chat", False, f"Chat returns {chat_response.status_code}")
                return
            
            # If we get here, all valid operations work
            self.test_result("All Valid Operations Work", True, "Catalog, users, plants, dashboard, care, and chat all working")
            
        except Exception as e:
            self.test_result("Valid Operations", False, f"Exception: {str(e)}")
    
    def run_verification_tests(self):
        """Run all verification tests"""
        print("🔧 FINAL VERIFICATION TEST")
        print("Testing all the fixes we implemented")
        print("=" * 60)
        
        self.test_invalid_plant_ids_return_404()
        self.test_invalid_user_ids_return_404()
        self.test_invalid_dashboard_ids_return_404()
        self.test_invalid_care_types_rejected()
        self.test_valid_operations_still_work()
        
        # Generate summary
        print("\n" + "=" * 60)
        print("🔧 VERIFICATION TEST RESULTS")
        print("=" * 60)
        print(f"✅ Passed: {self.passed}")
        print(f"❌ Failed: {self.failed}")
        print(f"📈 Success Rate: {(self.passed / (self.passed + self.failed)) * 100:.1f}%")
        
        if self.failed == 0:
            print("\n🎉 ALL FIXES VERIFIED! The application is working perfectly!")
        else:
            print(f"\n⚠️  {self.failed} issues still need attention")
        
        # Save results
        results_data = {
            "timestamp": datetime.now().isoformat(),
            "passed": self.passed,
            "failed": self.failed,
            "success_rate": f"{(self.passed / (self.passed + self.failed)) * 100:.1f}%",
            "tests": self.results
        }
        
        with open("fix_verification_results.json", "w") as f:
            json.dump(results_data, f, indent=2)
        
        print(f"\n📄 Detailed results saved to: fix_verification_results.json")

def main():
    verifier = FixVerificationTest()
    verifier.run_verification_tests()

if __name__ == "__main__":
    main()
