#!/usr/bin/env node

/**
 * Test Evidence Association API
 * Tests evidence association to confirm the API endpoint works
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';
const TOKEN = 'eyJhbGciOiJIUzUxMiIsImlhdCI6MTc1MDU2MjM5OCwiZXhwIjoxNzUwNjQ4Nzk4fQ.eyJpZCI6Imcyd3ZtcWFrIn0.JiBJ5NEXbaEXLglFODN2gcS2pFYWGnB3zF7kn4vjzHNFeIVWYlZtVC_mYpdjCao7nxo5L52SzAUZN1CIDm_ZSw';

const headers = {
  'Content-Type': 'application/json',
  'token': TOKEN
};

async function testEvidenceAssociation() {
  // Test with the first CC1.1 subcontrol ID from the previous run
  const testSubcontrolId = 'oe7i7gtg';
  const testEvidenceId = 'g57h4cgc'; // CN01 evidence ID from previous run
  
  console.log('🧪 Testing Evidence Association API');
  console.log('===================================');
  console.log(`Test subcontrol ID: ${testSubcontrolId}`);
  console.log(`Test evidence ID: ${testEvidenceId}`);
  
  try {
    console.log('📡 Making evidence association API call...');
    const response = await axios.put(
      `${API_BASE_URL}/subcontrols/${testSubcontrolId}/associate-evidence`,
      { evidence: [testEvidenceId] },
      { headers }
    );
    
    console.log('✅ Evidence association successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Evidence association failed!');
    console.log('Status:', error.response ? error.response.status : 'No response');
    console.log('Error Data:', error.response ? error.response.data : error.message);
    console.log('URL:', `${API_BASE_URL}/subcontrols/${testSubcontrolId}/associate-evidence`);
  }
  
  // Now test a different endpoint pattern for status updates
  console.log('\n🧪 Testing Alternative Status Update Patterns');
  console.log('==============================================');
  
  const alternativeEndpoints = [
    `/controls/${testSubcontrolId}/status`,
    `/subcontrols/${testSubcontrolId}`,
    `/projects/9mphynhm/subcontrols/${testSubcontrolId}/status`,
    `/projects/9mphynhm/controls/${testSubcontrolId}/status`
  ];
  
  for (const endpoint of alternativeEndpoints) {
    try {
      console.log(`📡 Testing: ${endpoint}`);
      const response = await axios.put(
        `${API_BASE_URL}${endpoint}`,
        { status: 'completed', notes: 'Test update' },
        { headers }
      );
      console.log(`✅ Success with: ${endpoint}`);
      console.log('Response:', response.data);
      break;
    } catch (error) {
      console.log(`❌ Failed: ${endpoint} - ${error.response ? error.response.status : 'No response'}`);
    }
  }
}

testEvidenceAssociation().catch(console.error);