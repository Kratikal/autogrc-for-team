#!/usr/bin/env node

/**
 * Test script for GRC Platform MCP Tools
 * Tests all available MCP tools to ensure they work correctly
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';
const AUTH_TOKEN = 'eyJhbGciOiJIUzUxMiIsImlhdCI6MTc1MDU2MjM5OCwiZXhwIjoxNzUwNjQ4Nzk4fQ.eyJpZCI6Imcyd3ZtcWFrIn0.JiBJ5NEXbaEXLglFODN2gcS2pFYWGnB3zF7kn4vjzHNFeIVWYlZtVC_mYpdjCao7nxo5L52SzAUZN1CIDm_ZSw';

console.log('🚀 Testing GRC Platform MCP Tools');
console.log('=' * 50);

const headers = {
  'Content-Type': 'application/json',
  'token': AUTH_TOKEN
};

async function testTool(name, testFunction) {
  try {
    console.log(`\n🔍 Testing ${name}...`);
    const result = await testFunction();
    console.log(`✅ ${name} - SUCCESS`);
    return { name, status: 'SUCCESS', result };
  } catch (error) {
    console.log(`❌ ${name} - FAILED: ${error.message}`);
    return { name, status: 'FAILED', error: error.message };
  }
}

const tests = [
  {
    name: 'grc_health_check',
    test: async () => {
      const response = await axios.get(`${API_BASE_URL}/health`);
      return response.data;
    }
  },
  {
    name: 'grc_generate_token',
    test: async () => {
      const response = await axios.get(`${API_BASE_URL}/token?expiration=3600`, { headers });
      return response.data;
    }
  },
  {
    name: 'grc_get_tenants',
    test: async () => {
      const response = await axios.get(`${API_BASE_URL}/tenants`, { headers });
      return response.data;
    }
  },
  {
    name: 'grc_create_tenant',
    test: async () => {
      const data = {
        name: 'Test MCP Tenant',
        contact_email: 'mcp-test@example.com'
      };
      const response = await axios.post(`${API_BASE_URL}/tenants`, data, { headers });
      // Store tenant ID for other tests
      global.testTenantId = response.data.id;
      return response.data;
    }
  },
  {
    name: 'grc_get_projects',
    test: async () => {
      if (!global.testTenantId) throw new Error('No tenant ID available');
      const response = await axios.get(`${API_BASE_URL}/tenants/${global.testTenantId}/projects`, { headers });
      return response.data;
    }
  },
  {
    name: 'grc_create_project',
    test: async () => {
      if (!global.testTenantId) throw new Error('No tenant ID available');
      const data = {
        name: 'Test MCP Project',
        description: 'Test project for MCP testing',
        framework: 'empty'
      };
      const response = await axios.post(`${API_BASE_URL}/tenants/${global.testTenantId}/projects`, data, { headers });
      global.testProjectId = response.data.id;
      return response.data;
    }
  },
  {
    name: 'grc_get_controls',
    test: async () => {
      if (!global.testProjectId) throw new Error('No project ID available');
      const response = await axios.get(`${API_BASE_URL}/projects/${global.testProjectId}/controls`, { headers });
      return response.data;
    }
  },
  {
    name: 'grc_create_evidence',
    test: async () => {
      if (!global.testProjectId) throw new Error('No project ID available');
      const data = {
        title: 'Test MCP Evidence',
        description: 'Test evidence document for MCP',
        file_name: 'test-mcp-doc.pdf'
      };
      const response = await axios.post(`${API_BASE_URL}/projects/${global.testProjectId}/evidence`, data, { headers });
      return response.data;
    }
  },
  {
    name: 'grc_get_evidence',
    test: async () => {
      if (!global.testProjectId) throw new Error('No project ID available');
      const response = await axios.get(`${API_BASE_URL}/projects/${global.testProjectId}/evidence`, { headers });
      return response.data;
    }
  },
  {
    name: 'grc_create_vendor',
    test: async () => {
      if (!global.testTenantId) throw new Error('No tenant ID available');
      const data = {
        name: 'Test MCP Vendor',
        contact_email: 'vendor-mcp@example.com',
        website: 'https://mcp-vendor.example.com'
      };
      const response = await axios.post(`${API_BASE_URL}/tenants/${global.testTenantId}/vendors`, data, { headers });
      return response.data;
    }
  },
  {
    name: 'grc_get_vendors',
    test: async () => {
      if (!global.testTenantId) throw new Error('No tenant ID available');
      const response = await axios.get(`${API_BASE_URL}/tenants/${global.testTenantId}/vendors`, { headers });
      return response.data;
    }
  },
  {
    name: 'grc_create_risk',
    test: async () => {
      if (!global.testTenantId) throw new Error('No tenant ID available');
      const data = {
        title: 'Test MCP Risk',
        description: 'Test risk for MCP testing',
        risk_level: 'medium',
        mitigation: 'Test mitigation strategy'
      };
      const response = await axios.post(`${API_BASE_URL}/tenants/${global.testTenantId}/risks`, data, { headers });
      return response.data;
    }
  },
  {
    name: 'grc_get_risks',
    test: async () => {
      if (!global.testTenantId) throw new Error('No tenant ID available');
      const response = await axios.get(`${API_BASE_URL}/tenants/${global.testTenantId}/risks`, { headers });
      return response.data;
    }
  },
  {
    name: 'grc_create_policy',
    test: async () => {
      if (!global.testTenantId) throw new Error('No tenant ID available');
      const data = {
        title: 'Test MCP Policy',
        content: 'This is a test policy document for MCP testing.'
      };
      const response = await axios.post(`${API_BASE_URL}/tenants/${global.testTenantId}/policies`, data, { headers });
      return response.data;
    }
  },
  {
    name: 'grc_get_policies',
    test: async () => {
      if (!global.testTenantId) throw new Error('No tenant ID available');
      const response = await axios.get(`${API_BASE_URL}/tenants/${global.testTenantId}/policies`, { headers });
      return response.data;
    }
  }
];

async function runAllTests() {
  const results = [];
  
  for (const test of tests) {
    const result = await testTool(test.name, test.test);
    results.push(result);
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Summary
  console.log('\n' + '=' * 50);
  console.log('📊 MCP TOOLS TEST SUMMARY');
  console.log('=' * 50);
  
  const passed = results.filter(r => r.status === 'SUCCESS').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  const total = results.length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${((passed/total) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => r.status === 'FAILED').forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }
  
  console.log('\n✅ SUCCESSFUL TESTS:');
  results.filter(r => r.status === 'SUCCESS').forEach(r => {
    console.log(`  - ${r.name}`);
  });
  
  return passed === total;
}

runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});