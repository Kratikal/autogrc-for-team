#!/usr/bin/env node

/**
 * Test Status Update Function
 * Tests the subcontrol status update API to debug the issue
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';
const TOKEN = 'eyJhbGciOiJIUzUxMiIsImlhdCI6MTc1MDU2MjM5OCwiZXhwIjoxNzUwNjQ4Nzk4fQ.eyJpZCI6Imcyd3ZtcWFrIn0.JiBJ5NEXbaEXLglFODN2gcS2pFYWGnB3zF7kn4vjzHNFeIVWYlZtVC_mYpdjCao7nxo5L52SzAUZN1CIDm_ZSw';

const headers = {
  'Content-Type': 'application/json',
  'token': TOKEN
};

async function testStatusUpdate() {
  // Test with the first CC1.1 subcontrol ID from the previous run
  const testSubcontrolId = 'oe7i7gtg';
  
  console.log('🧪 Testing Status Update API');
  console.log('============================');
  console.log(`Test subcontrol ID: ${testSubcontrolId}`);
  
  try {
    console.log('📡 Making API call...');
    const response = await axios.put(
      `${API_BASE_URL}/subcontrols/${testSubcontrolId}/status`,
      { 
        status: 'completed',
        notes: 'Test status update - CC1.1 implemented' 
      },
      { headers }
    );
    
    console.log('✅ Status update successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Status update failed!');
    console.log('Status:', error.response ? error.response.status : 'No response');
    console.log('Status Text:', error.response ? error.response.statusText : 'No response');
    console.log('Error Data:', error.response ? error.response.data : error.message);
    console.log('Headers sent:', headers);
    console.log('URL:', `${API_BASE_URL}/subcontrols/${testSubcontrolId}/status`);
    
    // Let's also test if the subcontrol exists by trying to get it
    console.log('\n🔍 Testing if subcontrol exists...');
    try {
      const getResponse = await axios.get(
        `${API_BASE_URL}/subcontrols/${testSubcontrolId}`,
        { headers: { 'token': TOKEN } }
      );
      console.log('✅ Subcontrol exists:', getResponse.data);
    } catch (getError) {
      console.log('❌ Failed to get subcontrol:', getError.response ? getError.response.data : getError.message);
    }
  }
}

testStatusUpdate().catch(console.error);