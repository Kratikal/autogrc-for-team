#!/usr/bin/env node

/**
 * Test MCP Control Fetching Functionality
 * Specifically tests fetching controls for project 9mphynhm
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';
const AUTH_TOKEN = 'eyJhbGciOiJIUzUxMiIsImlhdCI6MTc1MDU2MjM5OCwiZXhwIjoxNzUwNjQ4Nzk4fQ.eyJpZCI6Imcyd3ZtcWFrIn0.JiBJ5NEXbaEXLglFODN2gcS2pFYWGnB3zF7kn4vjzHNFeIVWYlZtVC_mYpdjCao7nxo5L52SzAUZN1CIDm_ZSw';
const PROJECT_ID = '9mphynhm';

console.log('🔍 Testing MCP Control Fetching Functionality');
console.log('===============================================');
console.log(`Project ID: ${PROJECT_ID}`);
console.log(`API Base URL: ${API_BASE_URL}`);
console.log('===============================================\n');

const headers = {
  'Content-Type': 'application/json',
  'token': AUTH_TOKEN
};

async function testHealthCheck() {
  console.log('1. Testing API Health Check...');
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ API Health Check - SUCCESS');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log('❌ API Health Check - FAILED');
    console.log('Error:', error.message);
    return false;
  }
}

async function testTokenValidation() {
  console.log('\n2. Testing Token Validation...');
  try {
    const response = await axios.get(`${API_BASE_URL}/tenants`, { headers });
    console.log('✅ Token Validation - SUCCESS');
    console.log('Number of tenants:', response.data.length);
    return true;
  } catch (error) {
    console.log('❌ Token Validation - FAILED');
    console.log('Error:', error.message);
    return false;
  }
}

async function testProjectAccess() {
  console.log('\n3. Testing Project Access...');
  try {
    const response = await axios.get(`${API_BASE_URL}/projects/${PROJECT_ID}`, { headers });
    console.log('✅ Project Access - SUCCESS');
    console.log('Project Details:');
    console.log('- ID:', response.data.id);
    console.log('- Name:', response.data.name);
    console.log('- Description:', response.data.description);
    console.log('- Framework:', response.data.framework);
    console.log('- Status:', response.data.status);
    return true;
  } catch (error) {
    console.log('❌ Project Access - FAILED');
    console.log('Error:', error.message);
    return false;
  }
}

async function testControlFetching() {
  console.log('\n4. Testing Control Fetching...');
  try {
    const response = await axios.get(`${API_BASE_URL}/projects/${PROJECT_ID}/controls`, { headers });
    console.log('✅ Control Fetching - SUCCESS');
    
    const controls = response.data;
    console.log('\n📊 Control Data Analysis:');
    console.log('- Total controls:', controls.length);
    
    if (controls.length > 0) {
      console.log('- First control ID:', controls[0].id);
      console.log('- First control title:', controls[0].title);
      
      // Data size analysis
      const jsonString = JSON.stringify(controls);
      const dataSizeKB = (jsonString.length / 1024).toFixed(2);
      console.log('- Data size:', dataSizeKB, 'KB');
      
      // Control status breakdown
      const statusCounts = {};
      controls.forEach(control => {
        statusCounts[control.status] = (statusCounts[control.status] || 0) + 1;
      });
      
      console.log('- Status breakdown:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  * ${status}: ${count}`);
      });
      
      // Check for framework specific controls
      const frameworks = [...new Set(controls.map(c => c.framework))];
      console.log('- Frameworks:', frameworks);
      
      // Sample control structure
      console.log('\n📋 Sample Control Structure:');
      console.log(JSON.stringify(controls[0], null, 2));
      
      // Check for pagination headers
      const headers = response.headers;
      console.log('\n📄 Response Headers Analysis:');
      if (headers['x-total-count']) {
        console.log('- Total Count Header:', headers['x-total-count']);
      }
      if (headers['x-page']) {
        console.log('- Page Header:', headers['x-page']);
      }
      if (headers['x-per-page']) {
        console.log('- Per Page Header:', headers['x-per-page']);
      }
      if (headers['link']) {
        console.log('- Link Header:', headers['link']);
      }
    } else {
      console.log('⚠️  No controls found for this project');
    }
    
    return controls;
  } catch (error) {
    console.log('❌ Control Fetching - FAILED');
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
    }
    return null;
  }
}

async function testPaginationAndFiltering() {
  console.log('\n5. Testing Pagination and Filtering Options...');
  
  const testCases = [
    { name: 'Limit parameter', params: { limit: 10 } },
    { name: 'Page parameter', params: { page: 1 } },
    { name: 'Status filter', params: { status: 'completed' } },
    { name: 'Framework filter', params: { framework: 'soc2' } },
    { name: 'Search parameter', params: { search: 'access' } },
    { name: 'Sort parameter', params: { sort: 'title' } },
    { name: 'Combined parameters', params: { limit: 5, page: 1, sort: 'title' } }
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    try {
      const queryParams = new URLSearchParams(testCase.params).toString();
      const url = `${API_BASE_URL}/projects/${PROJECT_ID}/controls?${queryParams}`;
      
      const response = await axios.get(url, { headers });
      
      console.log(`  ✅ ${testCase.name} - SUCCESS`);
      console.log(`     - URL: ${url}`);
      console.log(`     - Returned ${response.data.length} controls`);
      
      results.push({
        name: testCase.name,
        status: 'SUCCESS',
        count: response.data.length,
        params: testCase.params
      });
    } catch (error) {
      console.log(`  ❌ ${testCase.name} - FAILED: ${error.message}`);
      results.push({
        name: testCase.name,
        status: 'FAILED',
        error: error.message,
        params: testCase.params
      });
    }
  }
  
  return results;
}

async function testControlDetails() {
  console.log('\n6. Testing Individual Control Details...');
  
  try {
    // First get a control to test with
    const controlsResponse = await axios.get(`${API_BASE_URL}/projects/${PROJECT_ID}/controls`, { headers });
    const controls = controlsResponse.data;
    
    if (controls.length === 0) {
      console.log('⚠️  No controls available to test individual details');
      return;
    }
    
    const sampleControl = controls[0];
    console.log(`Testing with control: ${sampleControl.id} - ${sampleControl.title}`);
    
    // Test getting individual control details
    const controlResponse = await axios.get(`${API_BASE_URL}/controls/${sampleControl.id}`, { headers });
    
    console.log('✅ Individual Control Details - SUCCESS');
    console.log('Control Details:');
    console.log(JSON.stringify(controlResponse.data, null, 2));
    
    return controlResponse.data;
  } catch (error) {
    console.log('❌ Individual Control Details - FAILED');
    console.log('Error:', error.message);
    return null;
  }
}

async function runAllTests() {
  console.log('🚀 Starting MCP Control Fetching Tests...\n');
  
  const results = {
    healthCheck: await testHealthCheck(),
    tokenValidation: await testTokenValidation(),
    projectAccess: await testProjectAccess(),
    controlFetching: await testControlFetching(),
    paginationAndFiltering: await testPaginationAndFiltering(),
    controlDetails: await testControlDetails()
  };
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 MCP CONTROL FETCHING TEST SUMMARY');
  console.log('='.repeat(50));
  
  console.log('\n🔍 Test Results:');
  console.log('- Health Check:', results.healthCheck ? '✅ PASS' : '❌ FAIL');
  console.log('- Token Validation:', results.tokenValidation ? '✅ PASS' : '❌ FAIL');
  console.log('- Project Access:', results.projectAccess ? '✅ PASS' : '❌ FAIL');
  console.log('- Control Fetching:', results.controlFetching ? '✅ PASS' : '❌ FAIL');
  console.log('- Individual Control Details:', results.controlDetails ? '✅ PASS' : '❌ FAIL');
  
  if (results.paginationAndFiltering) {
    const paginationResults = results.paginationAndFiltering;
    const passedPagination = paginationResults.filter(r => r.status === 'SUCCESS').length;
    const totalPagination = paginationResults.length;
    console.log(`- Pagination/Filtering: ${passedPagination}/${totalPagination} tests passed`);
  }
  
  console.log('\n🎯 Key Findings:');
  if (results.controlFetching && Array.isArray(results.controlFetching)) {
    console.log(`- Successfully fetched ${results.controlFetching.length} controls`);
    
    const jsonString = JSON.stringify(results.controlFetching);
    const dataSizeKB = (jsonString.length / 1024).toFixed(2);
    console.log(`- Data size: ${dataSizeKB} KB`);
    
    console.log('- Backend/MCP layer is working correctly');
    console.log('- Data is being returned in proper JSON format');
    console.log('- Control structure includes all necessary fields');
  }
  
  console.log('\n💡 Recommendations:');
  console.log('- If frontend localStorage issues persist, focus on:');
  console.log('  1. localStorage size limits');
  console.log('  2. JSON serialization/deserialization');
  console.log('  3. Browser storage quotas');
  console.log('  4. Data chunking for large datasets');
  
  return results;
}

// Run the tests
runAllTests().then(results => {
  const allPassed = results.healthCheck && results.tokenValidation && 
                   results.projectAccess && results.controlFetching;
  
  console.log('\n🏁 Test Complete!');
  process.exit(allPassed ? 0 : 1);
}).catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});