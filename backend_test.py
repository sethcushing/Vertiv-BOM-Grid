#!/usr/bin/env python3
"""
Backend API Testing for BOM Convergence Grid
Tests all API endpoints defined in the backend server.
"""

import requests
import sys
import json
from datetime import datetime

class BOMAPITester:
    def __init__(self, base_url="https://convergence-grid.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
    def run_test(self, name, method, endpoint, expected_status, data=None, description=""):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}" if endpoint else f"{self.base_url}/api/"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        if description:
            print(f"   Description: {description}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                print(f"❌ Unsupported method: {method}")
                return False, {}
            
            print(f"   URL: {url}")
            print(f"   Response Status: {response.status_code}")
            
            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Status: {response.status_code}")
                
                # Try to parse JSON response
                try:
                    json_response = response.json()
                    if isinstance(json_response, list):
                        print(f"   Response: List with {len(json_response)} items")
                    elif isinstance(json_response, dict):
                        print(f"   Response: Dict with keys: {list(json_response.keys())}")
                    return True, json_response
                except:
                    print(f"   Response: Non-JSON response")
                    return True, response.text
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Error: {response.text}")
                
                self.failed_tests.append({
                    'name': name,
                    'endpoint': endpoint,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'error': response.text[:200]
                })
                return False, {}
                
        except requests.exceptions.RequestException as e:
            print(f"❌ FAILED - Request Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'endpoint': endpoint,
                'error': f'Request exception: {str(e)}'
            })
            return False, {}
    
    def test_health_endpoints(self):
        """Test basic health and root endpoints"""
        print("\n" + "="*50)
        print("TESTING HEALTH & ROOT ENDPOINTS")
        print("="*50)
        
        # Test root endpoint
        self.run_test("Root API", "GET", "", 200, description="Root API endpoint")
        
        # Test health check
        self.run_test("Health Check", "GET", "health", 200, description="Health check endpoint")
        
    def test_bom_items_endpoints(self):
        """Test BOM items CRUD endpoints"""
        print("\n" + "="*50)
        print("TESTING BOM ITEMS ENDPOINTS")
        print("="*50)
        
        # Test get all BOM items
        success, items = self.run_test("Get All BOM Items", "GET", "bom-items", 200, 
                                     description="Retrieve all BOM items")
        
        if success and items:
            print(f"   Found {len(items)} BOM items")
            
            # Test get specific BOM item
            if len(items) > 0 and 'id' in items[0]:
                item_id = items[0]['id']
                self.run_test("Get Specific BOM Item", "GET", f"bom-items/{item_id}", 200,
                             description=f"Retrieve BOM item {item_id}")
            
            # Test with query parameters
            self.run_test("Get BOM Items by Lifecycle", "GET", "bom-items?lifecycleStage=Orderable", 200,
                         description="Filter BOM items by lifecycle stage")
            
            self.run_test("Get BOM Items by MakeBuy", "GET", "bom-items?makeBuy=Buy", 200,
                         description="Filter BOM items by make/buy")
            
            self.run_test("Get Orderable Items", "GET", "bom-items?orderable=true", 200,
                         description="Filter orderable BOM items")
            
            self.run_test("Get Items with Blockers", "GET", "bom-items?hasBlockers=true", 200,
                         description="Filter BOM items with blockers")
        
        # Test invalid item ID
        self.run_test("Get Invalid BOM Item", "GET", "bom-items/invalid-id", 404,
                     description="Test 404 for non-existent item")
        
    def test_statistics_endpoints(self):
        """Test statistics endpoints"""
        print("\n" + "="*50)
        print("TESTING STATISTICS ENDPOINTS")
        print("="*50)
        
        # Test general statistics
        success, stats = self.run_test("Get Statistics", "GET", "statistics", 200,
                                     description="Retrieve general statistics")
        
        if success and stats:
            expected_keys = ['totalItems', 'orderableItems', 'itemsWithBlockers', 
                           'averageReadiness', 'lastUpdated']
            missing_keys = [key for key in expected_keys if key not in stats]
            if missing_keys:
                print(f"   ⚠️  Missing expected keys in statistics: {missing_keys}")
            else:
                print(f"   ✅ All expected statistics keys present")
        
        # Test lifecycle distribution
        success, lifecycle = self.run_test("Get Lifecycle Distribution", "GET", "lifecycle-distribution", 200,
                                         description="Retrieve lifecycle stage distribution")
        
        if success and lifecycle:
            print(f"   Found {len(lifecycle)} lifecycle stages")
            for stage, count in lifecycle.items():
                print(f"     {stage}: {count}")
    
    def test_project_endpoints(self):
        """Test project endpoints"""
        print("\n" + "="*50)
        print("TESTING PROJECT ENDPOINTS")
        print("="*50)
        
        # Test get projects
        success, projects = self.run_test("Get Projects", "GET", "projects", 200,
                                        description="Retrieve all projects")
        
        if success and projects:
            print(f"   Found {len(projects)} projects")
            
            # Test get specific project
            if len(projects) > 0 and 'id' in projects[0]:
                project_id = projects[0]['id']
                self.run_test("Get Specific Project", "GET", f"projects/{project_id}", 200,
                             description=f"Retrieve project {project_id}")
        
        # Test invalid project ID
        self.run_test("Get Invalid Project", "GET", "projects/invalid-id", 404,
                     description="Test 404 for non-existent project")
    
    def test_co_endpoints(self):
        """Test CO (Change Order) endpoints"""
        print("\n" + "="*50)
        print("TESTING CHANGE ORDER ENDPOINTS")
        print("="*50)
        
        # Test CO data
        success, co_data = self.run_test("Get CO Data", "GET", "co-data", 200,
                                       description="Retrieve change order data")
        
        if success and co_data:
            print(f"   Found {len(co_data)} change orders")
            for co in co_data[:3]:  # Show first 3
                print(f"     CO: {co.get('coNumber', 'N/A')} - Status: {co.get('status', 'N/A')} - Items: {co.get('itemCount', 0)}")
    
    def test_data_integrity(self):
        """Test data integrity and relationships"""
        print("\n" + "="*50)
        print("TESTING DATA INTEGRITY")
        print("="*50)
        
        success, items = self.run_test("Data Integrity Check", "GET", "bom-items", 200,
                                     description="Check BOM items data integrity")
        
        if success and items:
            # Check required fields
            required_fields = ['id', 'itemNumber', 'description', 'level', 'lifecycleStage']
            items_with_missing_fields = []
            
            for item in items:
                missing_fields = [field for field in required_fields if field not in item or item[field] is None]
                if missing_fields:
                    items_with_missing_fields.append({
                        'itemNumber': item.get('itemNumber', 'Unknown'),
                        'missing_fields': missing_fields
                    })
            
            if items_with_missing_fields:
                print(f"   ⚠️  {len(items_with_missing_fields)} items have missing required fields:")
                for item in items_with_missing_fields[:5]:  # Show first 5
                    print(f"     {item['itemNumber']}: missing {item['missing_fields']}")
            else:
                print(f"   ✅ All {len(items)} items have required fields")
            
            # Check hierarchy consistency
            parent_child_issues = []
            item_map = {item['id']: item for item in items}
            
            for item in items:
                if item.get('parentId') and item['parentId'] not in item_map:
                    parent_child_issues.append(f"Item {item.get('itemNumber')} references non-existent parent {item['parentId']}")
            
            if parent_child_issues:
                print(f"   ⚠️  {len(parent_child_issues)} parent-child reference issues:")
                for issue in parent_child_issues[:3]:
                    print(f"     {issue}")
            else:
                print(f"   ✅ All parent-child references are valid")
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%" if self.tests_run > 0 else "0%")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for i, test in enumerate(self.failed_tests, 1):
                print(f"{i}. {test['name']}")
                if 'endpoint' in test:
                    print(f"   Endpoint: {test['endpoint']}")
                if 'expected' in test and 'actual' in test:
                    print(f"   Expected: {test['expected']}, Got: {test['actual']}")
                print(f"   Error: {test.get('error', 'Unknown error')}")
        
        print(f"\nTest completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

def main():
    """Main test execution"""
    print("🚀 Starting BOM Convergence Grid Backend API Tests")
    print(f"Testing against: https://convergence-grid.preview.emergentagent.com")
    
    tester = BOMAPITester()
    
    # Run all test suites
    tester.test_health_endpoints()
    tester.test_bom_items_endpoints()
    tester.test_statistics_endpoints()
    tester.test_project_endpoints()
    tester.test_co_endpoints()
    tester.test_data_integrity()
    
    # Print final summary
    tester.print_summary()
    
    # Return exit code based on results
    return 0 if len(tester.failed_tests) == 0 else 1

if __name__ == "__main__":
    sys.exit(main())