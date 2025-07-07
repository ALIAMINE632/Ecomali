import requests
import unittest
import json
import sys
from datetime import datetime

class ECommerceAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.product_id = None  # Will store a product ID for testing deletion

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
            else:
                print(f"❌ Unsupported method: {method}")
                return False, None

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.text else {}
                except json.JSONDecodeError:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text}")
                return False, None

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, None

    def test_get_products(self):
        """Test GET /api/products endpoint"""
        success, response = self.run_test(
            "Get All Products",
            "GET",
            "/api/products",
            200
        )
        if success and response:
            print(f"Found {len(response)} products")
            if len(response) > 0:
                self.product_id = response[0]['id']  # Save first product ID for later tests
                print(f"Sample product: {response[0]['nom']} - {response[0]['prix']}€")
        return success

    def test_get_categories(self):
        """Test GET /api/categories endpoint"""
        success, response = self.run_test(
            "Get Categories",
            "GET",
            "/api/categories",
            200
        )
        if success and 'categories' in response:
            print(f"Categories: {', '.join(response['categories'])}")
        return success

    def test_get_single_product(self):
        """Test GET /api/products/{id} endpoint"""
        if not self.product_id:
            print("❌ Cannot test single product - no product ID available")
            return False
            
        success, response = self.run_test(
            "Get Single Product",
            "GET",
            f"/api/products/{self.product_id}",
            200
        )
        if success:
            print(f"Retrieved product: {response['nom']}")
        return success

    def test_add_product(self):
        """Test POST /api/products endpoint"""
        test_product = {
            "nom": f"Produit Test {datetime.now().strftime('%H:%M:%S')}",
            "prix": 99.99,
            "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
            "description": "Produit créé par le test automatique",
            "categorie": "Test"
        }
        
        success, response = self.run_test(
            "Add Product",
            "POST",
            "/api/products",
            200,  # FastAPI returns 200 for successful POST with response_model
            data=test_product
        )
        
        if success and response and 'id' in response:
            print(f"Added product with ID: {response['id']}")
            self.product_id = response['id']  # Save for delete test
        return success

    def test_delete_product(self):
        """Test DELETE /api/products/{id} endpoint"""
        if not self.product_id:
            print("❌ Cannot test delete - no product ID available")
            return False
            
        success, response = self.run_test(
            "Delete Product",
            "DELETE",
            f"/api/products/{self.product_id}",
            200
        )
        
        if success:
            print("Product deleted successfully")
        return success

def main():
    print("🚀 Starting E-Commerce API Tests")
    print("================================")
    
    # Use localhost for testing
    backend_url = "http://localhost:8001"
    
    tester = ECommerceAPITester(backend_url)
    
    # Run tests
    tester.test_get_products()
    tester.test_get_categories()
    tester.test_get_single_product()
    tester.test_add_product()
    tester.test_delete_product()
    
    # Print results
    print("\n📊 Test Results")
    print("================================")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    
    if tester.tests_passed == tester.tests_run:
        print("✅ All tests passed!")
        return 0
    else:
        print(f"❌ {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())