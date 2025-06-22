const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';
const AUTH_TOKEN = 'eyJhbGciOiJIUzUxMiIsImlhdCI6MTc1MDU2MjM5OCwiZXhwIjoxNzUwNjQ4Nzk4fQ.eyJpZCI6Imcyd3ZtcWFrIn0.JiBJ5NEXbaEXLglFODN2gcS2pFYWGnB3zF7kn4vjzHNFeIVWYlZtVC_mYpdjCao7nxo5L52SzAUZN1CIDm_ZSw';

async function verifyFinalMapping() {
  const headers = { 'token': AUTH_TOKEN };
  
  console.log('=== FINAL VERIFICATION OF EVIDENCE MAPPING ===\n');
  
  try {
    const evidenceResponse = await axios.get(`${API_BASE_URL}/projects/9mphynhm/evidence`, { headers });
    const evidence = evidenceResponse.data;
    
    // Get CN evidence only
    const cnEvidence = evidence.filter(e => e.name && e.name.startsWith('CN')).sort((a, b) => {
      const aMatch = a.name.match(/CN(\d+)/);
      const bMatch = b.name.match(/CN(\d+)/);
      const aNum = aMatch ? parseInt(aMatch[1]) : 0;
      const bNum = bMatch ? parseInt(bMatch[1]) : 0;
      return aNum - bNum;
    });
    
    console.log(`Total CN Evidence: ${cnEvidence.length}`);
    
    // Group evidence by CN number (1-72)
    const cnGroups = {};
    cnEvidence.forEach(ev => {
      const match = ev.name.match(/CN(\d+)/);
      if (match) {
        const cnNum = parseInt(match[1]);
        if (!cnGroups[cnNum]) {
          cnGroups[cnNum] = [];
        }
        cnGroups[cnNum].push(ev);
      }
    });
    
    console.log('\n📋 SOC 2 Control Coverage (CN01-CN72):');
    
    let totalCovered = 0;
    const missingControls = [];
    
    for (let i = 1; i <= 72; i++) {
      if (cnGroups[i]) {
        totalCovered++;
        console.log(`✅ CN${i.toString().padStart(2, '0')}: ${cnGroups[i].length} evidence entries`);
      } else {
        missingControls.push(`CN${i.toString().padStart(2, '0')}`);
        console.log(`❌ CN${i.toString().padStart(2, '0')}: No evidence`);
      }
    }
    
    console.log(`\n📊 COVERAGE SUMMARY:`);
    console.log(`✅ Controls with Evidence: ${totalCovered}/72`);
    console.log(`❌ Missing Controls: ${72 - totalCovered}/72`);
    console.log(`📈 Coverage Rate: ${Math.round((totalCovered/72) * 100)}%`);
    
    if (missingControls.length > 0) {
      console.log(`\n⚠️  Missing Evidence: ${missingControls.join(', ')}`);
    }
    
    // Sample check of recent evidence associations
    console.log('\n🔍 Sample Association Check (last 10 evidence):');
    const recentEvidence = cnEvidence.slice(-10);
    
    for (const ev of recentEvidence) {
      if (ev.associations && ev.associations.length > 0) {
        console.log(`✅ ${ev.name}: ${ev.associations.length} associations`);
      } else {
        console.log(`❓ ${ev.name}: Association status unknown`);
      }
    }
    
    console.log('\n🎯 ANALYSIS COMPLETE!');
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

verifyFinalMapping().catch(console.error);