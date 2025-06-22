#!/usr/bin/env node

/**
 * Final Test Summary for GRC Platform and MCP Tools
 * Comprehensive testing of platform functionality and MCP tool readiness
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';

console.log('🎯 GRC PLATFORM & MCP TOOLS - FINAL TEST SUMMARY');
console.log('='.repeat(60));

async function runTests() {
  const results = {
    platform: { passed: 0, failed: 0, total: 0 },
    mcpReady: { passed: 0, failed: 0, total: 0 }
  };
  
  // Test 1: Platform Health
  console.log('\n📊 PLATFORM HEALTH TESTS');
  console.log('-'.repeat(40));
  
  try {
    const health = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health Check: PASSED');
    results.platform.passed++;
  } catch (error) {
    console.log('❌ Health Check: FAILED');
    results.platform.failed++;
  }
  results.platform.total++;
  
  // Test 2: Basic API Authentication
  console.log('\n🔐 AUTHENTICATION TESTS');
  console.log('-'.repeat(40));
  
  let authToken = null;
  try {
    // Get session cookie first (simulate web login)
    const session = axios.create();
    const loginData = { email: 'admin@example.com', password: 'admin1234567' };
    await session.post(`${API_BASE_URL.replace('/api/v1', '')}/login`, loginData);
    
    // Get JWT token
    const tokenResponse = await session.get(`${API_BASE_URL}/token?expiration=3600`);
    authToken = tokenResponse.data.token;
    console.log('✅ JWT Token Generation: PASSED');
    results.platform.passed++;
  } catch (error) {
    console.log('❌ JWT Token Generation: FAILED');
    results.platform.failed++;
  }
  results.platform.total++;
  
  if (!authToken) {
    console.log('\n⚠️  Cannot proceed with MCP tests - no authentication token');
    return results;
  }
  
  const headers = { 'token': authToken, 'Content-Type': 'application/json' };
  
  // Test 3: Core MCP Tools (Basic CRUD)
  console.log('\n🛠️  MCP TOOLS READINESS TESTS');
  console.log('-'.repeat(40));
  
  const mcpTests = [
    {
      name: 'grc_get_tenants',
      test: () => axios.get(`${API_BASE_URL}/tenants`, { headers })
    },
    {
      name: 'grc_health_check',
      test: () => axios.get(`${API_BASE_URL}/health`)
    },
    {
      name: 'grc_generate_token',
      test: () => axios.get(`${API_BASE_URL}/token?expiration=1800`, { headers })
    }
  ];
  
  for (const mcpTest of mcpTests) {
    try {
      await mcpTest.test();
      console.log(`✅ ${mcpTest.name}: READY`);
      results.mcpReady.passed++;
    } catch (error) {
      console.log(`❌ ${mcpTest.name}: NOT READY (${error.response?.status || 'ERROR'})`);
      results.mcpReady.failed++;
    }
    results.mcpReady.total++;
  }
  
  // Test 4: MCP Configuration Files
  console.log('\n📁 MCP CONFIGURATION FILES');
  console.log('-'.repeat(40));
  
  const fs = require('fs');
  const configFiles = [
    { name: 'claude_desktop_config.json', path: './claude_desktop_config.json' },
    { name: 'mcp-server.js', path: './mcp-server.js' },
    { name: 'package.json', path: './package.json' },
    { name: 'CLAUDE_DESKTOP_SETUP.md', path: './CLAUDE_DESKTOP_SETUP.md' }
  ];
  
  for (const file of configFiles) {
    try {
      if (fs.existsSync(file.path)) {
        console.log(`✅ ${file.name}: AVAILABLE`);
        results.mcpReady.passed++;
      } else {
        console.log(`❌ ${file.name}: MISSING`);
        results.mcpReady.failed++;
      }
    } catch (error) {
      console.log(`❌ ${file.name}: ERROR`);
      results.mcpReady.failed++;
    }
    results.mcpReady.total++;
  }
  
  return results;
}

async function displaySummary() {
  const results = await runTests();
  
  console.log('\n' + '='.repeat(60));
  console.log('📈 FINAL TEST SUMMARY');
  console.log('='.repeat(60));
  
  const platformSuccess = (results.platform.passed / results.platform.total * 100).toFixed(1);
  const mcpSuccess = (results.mcpReady.passed / results.mcpReady.total * 100).toFixed(1);
  
  console.log(`🏛️  Platform Health: ${results.platform.passed}/${results.platform.total} (${platformSuccess}%)`);
  console.log(`🔧 MCP Tools Ready: ${results.mcpReady.passed}/${results.mcpReady.total} (${mcpSuccess}%)`);
  
  const overall = ((results.platform.passed + results.mcpReady.passed) / 
                   (results.platform.total + results.mcpReady.total) * 100).toFixed(1);
  
  console.log(`\n🎯 OVERALL READINESS: ${overall}%`);
  
  if (parseFloat(overall) >= 80) {
    console.log('\n🎉 SYSTEM READY FOR CLAUDE DESKTOP INTEGRATION!');
    console.log('\nNext Steps:');
    console.log('1. Update your JWT token in claude_desktop_config.json');
    console.log('2. Copy the config to Claude Desktop settings');
    console.log('3. Restart Claude Desktop');
    console.log('4. Test the MCP tools in Claude Desktop');
  } else {
    console.log('\n⚠️  SYSTEM NEEDS ATTENTION BEFORE MCP INTEGRATION');
    console.log('\nReview failed tests and address issues before proceeding.');
  }
  
  console.log('\n📚 Resources:');
  console.log('• API Documentation: http://localhost:8002/docs');
  console.log('• Platform Interface: http://localhost:3000');
  console.log('• Setup Guide: ./CLAUDE_DESKTOP_SETUP.md');
  console.log('='.repeat(60));
}

displaySummary().catch(error => {
  console.error('Test runner failed:', error.message);
  process.exit(1);
});