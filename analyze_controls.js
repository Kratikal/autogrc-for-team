const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';
const AUTH_TOKEN = 'eyJhbGciOiJIUzUxMiIsImlhdCI6MTc1MDU2MjM5OCwiZXhwIjoxNzUwNjQ4Nzk4fQ.eyJpZCI6Imcyd3ZtcWFrIn0.JiBJ5NEXbaEXLglFODN2gcS2pFYWGnB3zF7kn4vjzHNFeIVWYlZtVC_mYpdjCao7nxo5L52SzAUZN1CIDm_ZSw';

async function analyzeProjectControls() {
  const headers = { 'token': AUTH_TOKEN };
  
  console.log('=== ANALYZING SOC2 PROJECT CONTROL STRUCTURE ===\n');
  
  try {
    // Get all project controls
    const controlsResponse = await axios.get(`${API_BASE_URL}/projects/9mphynhm/controls`, { headers });
    const controls = controlsResponse.data;
    
    console.log(`Total Controls in Project: ${controls.length}`);
    
    // Group by Trust Service Criteria
    const controlGroups = {};
    controls.forEach(control => {
      const prefix = control.ref_code ? control.ref_code.substring(0, 3).toLowerCase() : 'other';
      if (!controlGroups[prefix]) {
        controlGroups[prefix] = [];
      }
      controlGroups[prefix].push(control);
    });
    
    console.log('\n=== CONTROL GROUPS BY TRUST SERVICE CRITERIA ===');
    Object.keys(controlGroups).sort().forEach(group => {
      console.log(`\n${group.toUpperCase()}: ${controlGroups[group].length} controls`);
      controlGroups[group].forEach(control => {
        console.log(`  - ${control.ref_code}: ${control.name.substring(0, 60)}...`);
        if (control.subcontrols && control.subcontrols.length > 0) {
          console.log(`    Subcontrols: ${control.subcontrols.length}`);
          control.subcontrols.slice(0, 2).forEach(sub => {
            console.log(`      • ${sub.ref_code}: ${sub.name.substring(0, 50)}...`);
          });
          if (control.subcontrols.length > 2) {
            console.log(`      ... and ${control.subcontrols.length - 2} more`);
          }
        }
      });
    });
    
    // Get current evidence
    const evidenceResponse = await axios.get(`${API_BASE_URL}/projects/9mphynhm/evidence`, { headers });
    const evidence = evidenceResponse.data;
    
    console.log(`\n=== CURRENT EVIDENCE STATUS ===`);
    console.log(`Total Evidence Entries: ${evidence.length}`);
    
    // Count CN evidence
    const cnEvidence = evidence.filter(e => e.name && e.name.startsWith('CN'));
    console.log(`CN-prefixed Evidence: ${cnEvidence.length}`);
    
    console.log('\nRecent Evidence Entries:');
    evidence.slice(-10).forEach(e => {
      console.log(`  - ${e.name}: ${e.description ? e.description.substring(0, 50) + '...' : 'No description'}`);
    });
    
    // Check evidence associations
    console.log('\n=== CHECKING EVIDENCE ASSOCIATIONS ===');
    let associatedCount = 0;
    let unassociatedCount = 0;
    
    for (const ev of evidence.slice(-20)) {
      if (ev.associations && ev.associations.length > 0) {
        associatedCount++;
        console.log(`✅ ${ev.name}: ${ev.associations.length} associations`);
      } else {
        unassociatedCount++;
        console.log(`❌ ${ev.name}: No associations`);
      }
    }
    
    console.log(`\nAssociation Summary (last 20 evidence):`);
    console.log(`✅ Associated: ${associatedCount}`);
    console.log(`❌ Unassociated: ${unassociatedCount}`);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

analyzeProjectControls().catch(console.error);