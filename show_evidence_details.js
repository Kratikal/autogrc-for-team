const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';
const AUTH_TOKEN = 'eyJhbGciOiJIUzUxMiIsImlhdCI6MTc1MDU2MjM5OCwiZXhwIjoxNzUwNjQ4Nzk4fQ.eyJpZCI6Imcyd3ZtcWFrIn0.JiBJ5NEXbaEXLglFODN2gcS2pFYWGnB3zF7kn4vjzHNFeIVWYlZtVC_mYpdjCao7nxo5L52SzAUZN1CIDm_ZSw';

async function showEvidenceDetails() {
  const headers = { 'token': AUTH_TOKEN };
  
  console.log('=== EVIDENCE DETAILS AND ASSOCIATIONS ===\n');
  
  try {
    // Get all evidence
    const evidenceResponse = await axios.get(`${API_BASE_URL}/projects/9mphynhm/evidence`, { headers });
    const evidence = evidenceResponse.data;
    
    // Filter CN evidence
    const cnEvidence = evidence.filter(e => e.name && e.name.startsWith('CN')).sort((a, b) => {
      const aNum = parseInt(a.name.match(/CN(\d+)/)?.[1] || '0');
      const bNum = parseInt(b.name.match(/CN(\d+)/)?.[1] || '0');
      return aNum - bNum;
    });
    
    console.log(`Total CN Evidence: ${cnEvidence.length}\n`);
    
    // Show first 10 evidence entries with their details
    console.log('=== EVIDENCE SAMPLE (First 10 CN entries) ===\n');
    
    for (let i = 0; i < Math.min(10, cnEvidence.length); i++) {
      const ev = cnEvidence[i];
      console.log(`${i + 1}. ${ev.name}`);
      console.log(`   Description: ${ev.description ? ev.description.substring(0, 120) + '...' : 'No description'}`);
      console.log(`   Content: ${ev.content ? ev.content.substring(0, 120) + '...' : 'No content'}`);
      console.log(`   Associations: ${ev.associations ? ev.associations.length : 0}`);
      
      if (ev.associations && ev.associations.length > 0) {
        console.log(`   Associated Controls:`);
        ev.associations.slice(0, 3).forEach(assoc => {
          console.log(`     - Control ID: ${assoc.control_id}`);
        });
        if (ev.associations.length > 3) {
          console.log(`     ... and ${ev.associations.length - 3} more`);
        }
      } else {
        console.log(`   ❌ NO ASSOCIATIONS FOUND`);
      }
      console.log('');
    }
    
    // Check last 10 evidence entries (these were mentioned as recently created)
    console.log('=== RECENT EVIDENCE (Last 10 CN entries) ===\n');
    
    const recentCN = cnEvidence.slice(-10);
    for (let i = 0; i < recentCN.length; i++) {
      const ev = recentCN[i];
      console.log(`${i + 1}. ${ev.name}`);
      console.log(`   Description: ${ev.description ? ev.description.substring(0, 120) + '...' : 'No description'}`);
      console.log(`   Associations: ${ev.associations ? ev.associations.length : 0}`);
      
      if (ev.associations && ev.associations.length > 0) {
        console.log(`   ✅ HAS ASSOCIATIONS`);
      } else {
        console.log(`   ❌ NO ASSOCIATIONS`);
      }
      console.log('');
    }
    
    // Show evidence that DO have associations (if any)
    const associatedEvidence = cnEvidence.filter(ev => ev.associations && ev.associations.length > 0);
    console.log(`=== EVIDENCE WITH ASSOCIATIONS (${associatedEvidence.length} entries) ===\n`);
    
    if (associatedEvidence.length > 0) {
      associatedEvidence.slice(0, 5).forEach((ev, i) => {
        console.log(`${i + 1}. ${ev.name}`);
        console.log(`   Associations: ${ev.associations.length}`);
        ev.associations.slice(0, 3).forEach(assoc => {
          console.log(`     - Control ID: ${assoc.control_id}`);
        });
        console.log('');
      });
    } else {
      console.log('❌ NO EVIDENCE FOUND WITH ASSOCIATIONS!');
      console.log('\nThis indicates that the evidence creation was successful but the association');
      console.log('process may have failed or not been completed yet.');
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

showEvidenceDetails().catch(console.error);