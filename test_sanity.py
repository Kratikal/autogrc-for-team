#!/usr/bin/env python3
"""
Comprehensive sanity tests for GRC Platform
Tests all major functionality to ensure the application is working correctly
"""

import os
import sys
import unittest
import requests
import json
import time
import psycopg2
from datetime import datetime
import logging

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set up test logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(name)s | %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('test_results.log')
    ]
)

logger = logging.getLogger('SanityTests')

class GRCSanityTests(unittest.TestCase):
    """Comprehensive sanity tests for GRC Platform"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment"""
        cls.base_url = "http://localhost:3000"
        cls.api_url = f"{cls.base_url}/api/v1"
        cls.admin_email = "admin@example.com"
        cls.admin_password = "admin1234567"
        cls.auth_token = None
        cls.test_tenant_id = None
        cls.test_project_id = None
        
        logger.info("="*80)
        logger.info("STARTING GRC PLATFORM SANITY TESTS")
        logger.info("="*80)
        
        # Wait for application to be ready
        cls.wait_for_application()
    
    @classmethod
    def wait_for_application(cls, max_attempts=30):
        """Wait for the application to be ready"""
        logger.info("Waiting for application to be ready...")
        
        for attempt in range(max_attempts):
            try:
                response = requests.get(f"{cls.api_url}/health", timeout=5)
                if response.status_code == 200:
                    logger.info(f"Application ready after {attempt + 1} attempts")
                    return
            except requests.exceptions.RequestException:
                pass
            
            time.sleep(2)
        
        raise Exception(f"Application not ready after {max_attempts} attempts")
    
    def test_01_database_connectivity(self):
        """Test database connectivity"""
        logger.info("Testing database connectivity...")
        
        try:
            conn = psycopg2.connect(
                host="localhost",
                database="gapps",
                user="postgres",
                password="madhu@12"
            )
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            cursor.close()
            conn.close()
            
            self.assertEqual(result[0], 1)
            logger.info("✅ Database connectivity test passed")
            
        except Exception as e:
            logger.error(f"❌ Database connectivity test failed: {e}")
            self.fail(f"Database connectivity failed: {e}")
    
    def test_02_health_endpoint(self):
        """Test health endpoint"""
        logger.info("Testing health endpoint...")
        
        try:
            response = requests.get(f"{self.api_url}/health")
            self.assertEqual(response.status_code, 200)
            
            data = response.json()
            self.assertEqual(data.get("message"), "ok")
            
            logger.info("✅ Health endpoint test passed")
            
        except Exception as e:
            logger.error(f"❌ Health endpoint test failed: {e}")
            self.fail(f"Health endpoint failed: {e}")
    
    def test_03_web_interface_access(self):
        """Test web interface accessibility"""
        logger.info("Testing web interface access...")
        
        try:
            response = requests.get(self.base_url)
            self.assertIn(response.status_code, [200, 302])  # 302 for redirect to login
            
            logger.info("✅ Web interface access test passed")
            
        except Exception as e:
            logger.error(f"❌ Web interface access test failed: {e}")
            self.fail(f"Web interface access failed: {e}")
    
    def test_04_login_functionality(self):
        """Test login functionality"""
        logger.info("Testing login functionality...")
        
        try:
            # Test login endpoint
            login_data = {
                "email": self.admin_email,
                "password": self.admin_password
            }
            
            session = requests.Session()
            response = session.post(f"{self.base_url}/login", data=login_data)
            
            # Should redirect after successful login
            self.assertIn(response.status_code, [200, 302])
            
            logger.info("✅ Login functionality test passed")
            
        except Exception as e:
            logger.error(f"❌ Login functionality test failed: {e}")
            self.fail(f"Login functionality failed: {e}")
    
    def test_05_api_token_generation(self):
        """Test API token generation"""
        logger.info("Testing API token generation...")
        
        try:
            # First login to get session
            session = requests.Session()
            login_data = {
                "email": self.admin_email,
                "password": self.admin_password
            }
            session.post(f"{self.base_url}/login", data=login_data)
            
            # Generate API token
            response = session.get(f"{self.api_url}/token?expiration=3600")
            self.assertEqual(response.status_code, 200)
            
            data = response.json()
            self.assertIn("token", data)
            self.assertIn("expires_in", data)
            
            # Store token for other tests
            self.__class__.auth_token = data["token"]
            
            logger.info("✅ API token generation test passed")
            
        except Exception as e:
            logger.error(f"❌ API token generation test failed: {e}")
            self.fail(f"API token generation failed: {e}")
    
    def test_06_authenticated_api_access(self):
        """Test authenticated API access"""
        logger.info("Testing authenticated API access...")
        
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        try:
            headers = {"token": self.auth_token}
            response = requests.get(f"{self.api_url}/tenants", headers=headers)
            self.assertEqual(response.status_code, 200)
            
            data = response.json()
            self.assertIsInstance(data, list)
            
            if data:  # If tenants exist, store the first one for testing
                self.__class__.test_tenant_id = data[0]["id"]
            
            logger.info("✅ Authenticated API access test passed")
            
        except Exception as e:
            logger.error(f"❌ Authenticated API access test failed: {e}")
            self.fail(f"Authenticated API access failed: {e}")
    
    def test_07_tenant_operations(self):
        """Test tenant operations"""
        logger.info("Testing tenant operations...")
        
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        try:
            headers = {"token": self.auth_token}
            
            # Create a test tenant
            tenant_data = {
                "name": "Test Tenant",
                "contact_email": "test@example.com"
            }
            
            response = requests.post(f"{self.api_url}/tenants", 
                                   headers=headers, 
                                   json=tenant_data)
            self.assertEqual(response.status_code, 200)
            
            tenant = response.json()
            self.assertEqual(tenant["name"], "Test Tenant")
            
            # Store for other tests
            self.__class__.test_tenant_id = tenant["id"]
            
            logger.info("✅ Tenant operations test passed")
            
        except Exception as e:
            logger.error(f"❌ Tenant operations test failed: {e}")
            self.fail(f"Tenant operations failed: {e}")
    
    def test_08_project_operations(self):
        """Test project operations"""
        logger.info("Testing project operations...")
        
        if not self.auth_token or not self.test_tenant_id:
            self.skipTest("No auth token or tenant ID available")
        
        try:
            headers = {"token": self.auth_token}
            
            # Create a test project
            project_data = {
                "name": "Test SOC2 Project",
                "description": "Test compliance project",
                "framework": "empty"  # Use empty framework for testing
            }
            
            response = requests.post(f"{self.api_url}/tenants/{self.test_tenant_id}/projects",
                                   headers=headers,
                                   json=project_data)
            self.assertEqual(response.status_code, 200)
            
            project = response.json()
            self.assertEqual(project["name"], "Test SOC2 Project")
            
            # Store for other tests
            self.__class__.test_project_id = project["id"]
            
            logger.info("✅ Project operations test passed")
            
        except Exception as e:
            logger.error(f"❌ Project operations test failed: {e}")
            self.fail(f"Project operations failed: {e}")
    
    def test_09_controls_functionality(self):
        """Test controls functionality"""
        logger.info("Testing controls functionality...")
        
        if not self.auth_token or not self.test_project_id:
            self.skipTest("No auth token or project ID available")
        
        try:
            headers = {"token": self.auth_token}
            
            # Get project controls
            response = requests.get(f"{self.api_url}/projects/{self.test_project_id}/controls",
                                  headers=headers)
            self.assertEqual(response.status_code, 200)
            
            controls = response.json()
            self.assertIsInstance(controls, list)
            
            logger.info("✅ Controls functionality test passed")
            
        except Exception as e:
            logger.error(f"❌ Controls functionality test failed: {e}")
            self.fail(f"Controls functionality failed: {e}")
    
    def test_10_evidence_functionality(self):
        """Test evidence functionality"""
        logger.info("Testing evidence functionality...")
        
        if not self.auth_token or not self.test_project_id:
            self.skipTest("No auth token or project ID available")
        
        try:
            headers = {"token": self.auth_token}
            
            # Create test evidence
            evidence_data = {
                "title": "Test Evidence",
                "description": "Test evidence document"
            }
            
            response = requests.post(f"{self.api_url}/projects/{self.test_project_id}/evidence",
                                   headers=headers,
                                   json=evidence_data)
            self.assertEqual(response.status_code, 200)
            
            evidence = response.json()
            self.assertEqual(evidence["title"], "Test Evidence")
            
            logger.info("✅ Evidence functionality test passed")
            
        except Exception as e:
            logger.error(f"❌ Evidence functionality test failed: {e}")
            self.fail(f"Evidence functionality failed: {e}")
    
    def test_11_vendor_functionality(self):
        """Test vendor functionality"""
        logger.info("Testing vendor functionality...")
        
        if not self.auth_token or not self.test_tenant_id:
            self.skipTest("No auth token or tenant ID available")
        
        try:
            headers = {"token": self.auth_token}
            
            # Create test vendor
            vendor_data = {
                "name": "Test Vendor",
                "contact_email": "vendor@example.com",
                "website": "https://vendor.example.com"
            }
            
            response = requests.post(f"{self.api_url}/tenants/{self.test_tenant_id}/vendors",
                                   headers=headers,
                                   json=vendor_data)
            self.assertEqual(response.status_code, 200)
            
            vendor = response.json()
            self.assertEqual(vendor["name"], "Test Vendor")
            
            logger.info("✅ Vendor functionality test passed")
            
        except Exception as e:
            logger.error(f"❌ Vendor functionality test failed: {e}")
            self.fail(f"Vendor functionality failed: {e}")
    
    def test_12_risk_functionality(self):
        """Test risk functionality"""
        logger.info("Testing risk functionality...")
        
        if not self.auth_token or not self.test_tenant_id:
            self.skipTest("No auth token or tenant ID available")
        
        try:
            headers = {"token": self.auth_token}
            
            # Create test risk
            risk_data = {
                "title": "Test Risk",
                "description": "Test risk description",
                "risk_level": "medium",
                "mitigation": "Test mitigation strategy"
            }
            
            response = requests.post(f"{self.api_url}/tenants/{self.test_tenant_id}/risks",
                                   headers=headers,
                                   json=risk_data)
            self.assertEqual(response.status_code, 200)
            
            risk = response.json()
            self.assertEqual(risk["title"], "Test Risk")
            
            logger.info("✅ Risk functionality test passed")
            
        except Exception as e:
            logger.error(f"❌ Risk functionality test failed: {e}")
            self.fail(f"Risk functionality failed: {e}")
    
    def test_13_policy_functionality(self):
        """Test policy functionality"""
        logger.info("Testing policy functionality...")
        
        if not self.auth_token or not self.test_tenant_id:
            self.skipTest("No auth token or tenant ID available")
        
        try:
            headers = {"token": self.auth_token}
            
            # Create test policy
            policy_data = {
                "title": "Test Security Policy",
                "content": "This is a test security policy document."
            }
            
            response = requests.post(f"{self.api_url}/tenants/{self.test_tenant_id}/policies",
                                   headers=headers,
                                   json=policy_data)
            self.assertEqual(response.status_code, 200)
            
            policy = response.json()
            self.assertEqual(policy["title"], "Test Security Policy")
            
            logger.info("✅ Policy functionality test passed")
            
        except Exception as e:
            logger.error(f"❌ Policy functionality test failed: {e}")
            self.fail(f"Policy functionality failed: {e}")
    
    def test_14_comment_functionality(self):
        """Test comment functionality"""
        logger.info("Testing comment functionality...")
        
        if not self.auth_token or not self.test_project_id:
            self.skipTest("No auth token or project ID available")
        
        try:
            headers = {"token": self.auth_token}
            
            # Add test comment
            comment_data = {
                "content": "Test comment for project"
            }
            
            response = requests.post(f"{self.api_url}/projects/{self.test_project_id}/comments",
                                   headers=headers,
                                   json=comment_data)
            self.assertEqual(response.status_code, 200)
            
            comment = response.json()
            self.assertEqual(comment["content"], "Test comment for project")
            
            logger.info("✅ Comment functionality test passed")
            
        except Exception as e:
            logger.error(f"❌ Comment functionality test failed: {e}")
            self.fail(f"Comment functionality failed: {e}")
    
    def test_15_frameworks_functionality(self):
        """Test frameworks functionality"""
        logger.info("Testing frameworks functionality...")
        
        if not self.auth_token or not self.test_tenant_id:
            self.skipTest("No auth token or tenant ID available")
        
        try:
            headers = {"token": self.auth_token}
            
            # Get frameworks
            response = requests.get(f"{self.api_url}/tenants/{self.test_tenant_id}/frameworks",
                                  headers=headers)
            self.assertEqual(response.status_code, 200)
            
            frameworks = response.json()
            self.assertIsInstance(frameworks, list)
            
            logger.info("✅ Frameworks functionality test passed")
            
        except Exception as e:
            logger.error(f"❌ Frameworks functionality test failed: {e}")
            self.fail(f"Frameworks functionality failed: {e}")


def run_sanity_tests():
    """Run all sanity tests and generate report"""
    logger.info("Starting GRC Platform Sanity Tests")
    logger.info(f"Test time: {datetime.now()}")
    logger.info(f"Testing against: http://localhost:3000")
    
    # Create test suite
    test_suite = unittest.TestLoader().loadTestsFromTestCase(GRCSanityTests)
    
    # Run tests with detailed output
    runner = unittest.TextTestRunner(verbosity=2, stream=sys.stdout)
    result = runner.run(test_suite)
    
    # Generate summary
    total_tests = result.testsRun
    failures = len(result.failures)
    errors = len(result.errors)
    skipped = len(result.skipped) if hasattr(result, 'skipped') else 0
    passed = total_tests - failures - errors - skipped
    
    logger.info("="*80)
    logger.info("SANITY TEST RESULTS SUMMARY")
    logger.info("="*80)
    logger.info(f"Total Tests: {total_tests}")
    logger.info(f"Passed: {passed}")
    logger.info(f"Failed: {failures}")
    logger.info(f"Errors: {errors}")
    logger.info(f"Skipped: {skipped}")
    logger.info(f"Success Rate: {(passed/total_tests)*100:.1f}%")
    
    if failures > 0:
        logger.error("FAILED TESTS:")
        for test, traceback in result.failures:
            logger.error(f"  - {test}: {traceback.split(chr(10))[-2]}")
    
    if errors > 0:
        logger.error("ERROR TESTS:")
        for test, traceback in result.errors:
            logger.error(f"  - {test}: {traceback.split(chr(10))[-2]}")
    
    logger.info("="*80)
    
    # Return True if all critical tests passed
    return failures == 0 and errors == 0


if __name__ == "__main__":
    success = run_sanity_tests()
    sys.exit(0 if success else 1)