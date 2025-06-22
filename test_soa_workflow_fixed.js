#!/usr/bin/env node

/**
 * Fixed SOA to Gap Assessment Workflow Test
 * Uses correct API endpoints for updating control applicability
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';
const AUTH_TOKEN = 'eyJhbGciOiJIUzUxMiIsImlhdCI6MTc1MDU2MjM5OCwiZXhwIjoxNzUwNjQ4Nzk4fQ.eyJpZCI6Imcyd3ZtcWFrIn0.JiBJ5NEXbaEXLglFODN2gcS2pFYWGnB3zF7kn4vjzHNFeIVWYlZtVC_mYpdjCao7nxo5L52SzAUZN1CIDm_ZSw';
const TENANT_ID = 'nhqmzvcx';
const PROJECT_ID = '9mphynhm'; // SOC2 project

console.log('🚀 Testing FIXED SOA to Gap Assessment Workflow');
console.log('='.repeat(50));

const headers = {
  'Content-Type': 'application/json',
  'token': AUTH_TOKEN
};

async function step3_updateBulkApplicability_Fixed(controlsToUpdate) {
  console.log('\n✏️  STEP 3: Update Control Applicability (FIXED)');
  console.log('—'.repeat(40));
  
  try {
    console.log('🔄 Updating first 5 controls with proper justifications...');
    
    const results = [];
    for (let i = 0; i < controlsToUpdate.length; i++) {
      const control = controlsToUpdate[i];
      console.log(`\n   Processing control ${i + 1}: ${control.ref_code}`);
      
      // Get the first subcontrol for this control
      if (control.subcontrols && control.subcontrols.length > 0) {
        const subcontrol = control.subcontrols[0];
        
        try {
          // Update subcontrol applicability and notes
          const url = `/project-controls/${control.id}/subcontrols/${subcontrol.id}`;
          const payload = {
            applicable: true,
            implemented: 1, // Mark as partially implemented
            notes: `Control ${control.ref_code} has been assessed as applicable for SOC 2 compliance. This control addresses ${control.subcategory} requirements and is essential for maintaining security, availability, and confidentiality of customer data processing operations. Implementation in progress.`,
            context: `Updated via SOA workflow testing on ${new Date().toISOString()}`
          };
          
          const response = await axios.put(`${API_BASE_URL}${url}`, payload, { headers });
          
          results.push({
            control_id: control.id,
            control_ref: control.ref_code,
            subcontrol_id: subcontrol.id,
            status: 'updated',
            result: response.data
          });
          
          console.log(`   ✅ Updated subcontrol for ${control.ref_code}`);
        } catch (subcontrolError) {
          console.log(`   ❌ Failed to update subcontrol for ${control.ref_code}: ${subcontrolError.response?.status} ${subcontrolError.response?.data?.message || subcontrolError.message}`);
          results.push({
            control_id: control.id,
            control_ref: control.ref_code,
            status: 'failed',
            error: subcontrolError.message
          });
        }
      } else {
        console.log(`   ⚠️  No subcontrols found for ${control.ref_code}`);
        results.push({
          control_id: control.id,
          control_ref: control.ref_code,
          status: 'skipped',
          reason: 'no_subcontrols'
        });
      }
    }
    
    const successCount = results.filter(r => r.status === 'updated').length;
    console.log(`\n✅ Successfully updated ${successCount} out of ${results.length} control subcontrols`);
    
    return results;
  } catch (error) {
    console.log(`❌ Error: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

async function step3_updateControlReviewStatus(controlsToUpdate) {
  console.log('\n📝 STEP 3b: Update Control Review Status');
  console.log('—'.repeat(40));
  
  try {
    console.log('🔄 Updating control review status...');
    
    const results = [];
    for (let i = 0; i < controlsToUpdate.length; i++) {
      const control = controlsToUpdate[i];
      
      try {
        // Update control review status
        const url = `/controls/${control.id}/status`;
        const payload = {
          "review-status": "in progress"
        };
        
        const response = await axios.put(`${API_BASE_URL}${url}`, payload, { headers });
        
        results.push({
          control_id: control.id,
          control_ref: control.ref_code,
          status: 'updated',
          result: response.data
        });
        
        console.log(`   ✅ Updated review status for ${control.ref_code}`);
      } catch (controlError) {
        console.log(`   ❌ Failed to update review status for ${control.ref_code}: ${controlError.response?.status} ${controlError.response?.data?.message || controlError.message}`);
        results.push({
          control_id: control.id,
          control_ref: control.ref_code,
          status: 'failed',
          error: controlError.message
        });
      }
    }
    
    const successCount = results.filter(r => r.status === 'updated').length;
    console.log(`\n✅ Successfully updated review status for ${successCount} out of ${results.length} controls`);
    
    return results;
  } catch (error) {
    console.log(`❌ Error: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

async function testFixedWorkflow() {
  try {
    // Get controls data
    console.log('\n📋 Getting SOC2 project controls...');
    const response = await axios.get(`${API_BASE_URL}/projects/${PROJECT_ID}/controls`, { headers });
    const controls = response.data;
    const firstFiveControls = controls.slice(0, 5);
    
    console.log(`✅ Found ${controls.length} controls, testing with first 5:`);
    firstFiveControls.forEach((control, index) => {
      console.log(`  ${index + 1}. ${control.ref_code}: ${control.name.substring(0, 80)}...`);
      console.log(`     Subcontrols: ${control.subcontrols?.length || 0}`);
    });
    
    // Test subcontrol updates
    const subcontrolResults = await step3_updateBulkApplicability_Fixed(firstFiveControls);
    
    // Test control review status updates
    const reviewResults = await step3_updateControlReviewStatus(firstFiveControls);
    
    // Generate summary
    console.log('\n' + '='.repeat(50));
    console.log('🎉 FIXED WORKFLOW TEST COMPLETED');
    console.log('='.repeat(50));
    
    console.log('\n📊 RESULTS SUMMARY:');
    console.log(`✅ Subcontrol Updates: ${subcontrolResults.filter(r => r.status === 'updated').length}/${subcontrolResults.length}`);
    console.log(`✅ Review Status Updates: ${reviewResults.filter(r => r.status === 'updated').length}/${reviewResults.length}`);
    
    console.log('\n🔍 DETAILED RESULTS:');
    console.log('Subcontrol Updates:');
    subcontrolResults.forEach(result => {
      console.log(`  ${result.control_ref}: ${result.status} ${result.error ? '(' + result.error + ')' : ''}`);
    });
    
    console.log('\nReview Status Updates:');
    reviewResults.forEach(result => {
      console.log(`  ${result.control_ref}: ${result.status} ${result.error ? '(' + result.error + ')' : ''}`);
    });
    
    return { subcontrolResults, reviewResults };
    
  } catch (error) {
    console.error('\n❌ WORKFLOW FAILED:', error.message);
    throw error;
  }
}

testFixedWorkflow().then(results => {
  console.log('\n🏁 Fixed workflow test completed');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});