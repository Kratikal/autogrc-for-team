const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';
const AUTH_TOKEN = 'eyJhbGciOiJIUzUxMiIsImlhdCI6MTc1MDU2MjM5OCwiZXhwIjoxNzUwNjQ4Nzk4fQ.eyJpZCI6Imcyd3ZtcWFrIn0.JiBJ5NEXbaEXLglFODN2gcS2pFYWGnB3zF7kn4vjzHNFeIVWYlZtVC_mYpdjCao7nxo5L52SzAUZN1CIDm_ZSw';

async function fixEvidenceMapping() {
  const headers = { 'token': AUTH_TOKEN };
  
  console.log('=== FIXING EVIDENCE MAPPING ===\n');
  
  try {
    // Get all evidence and controls
    const evidenceResponse = await axios.get(`${API_BASE_URL}/projects/9mphynhm/evidence`, { headers });
    const controlsResponse = await axios.get(`${API_BASE_URL}/projects/9mphynhm/controls`, { headers });
    
    const evidence = evidenceResponse.data;
    const controls = controlsResponse.data;
    
    // Get CN evidence only
    const cnEvidence = evidence.filter(e => e.name && e.name.startsWith('CN')).sort((a, b) => {
      const aNum = parseInt(a.name.substring(2, 4));
      const bNum = parseInt(b.name.substring(2, 4));
      return aNum - bNum;
    });
    
    console.log(`Found ${cnEvidence.length} CN evidence entries to map`);
    console.log(`Found ${controls.length} controls with subcontrols`);
    
    // Create mapping based on SOC 2 control areas from the audit report
    const controlMapping = [
      // Control Environment (CN01-CN10) -> CC1.x
      { cnStart: 1, cnEnd: 10, targetControls: ['cc1.1', 'cc1.2', 'cc1.3', 'cc1.4', 'cc1.5'] },
      
      // Communication & Information (CN11-CN16) -> CC2.x  
      { cnStart: 11, cnEnd: 16, targetControls: ['cc2.1', 'cc2.2', 'cc2.3'] },
      
      // Risk Assessment (CN17-CN20) -> CC3.x
      { cnStart: 17, cnEnd: 20, targetControls: ['cc3.1', 'cc3.2', 'cc3.3', 'cc3.4'] },
      
      // Monitoring Activities (CN21-CN24) -> CC4.x
      { cnStart: 21, cnEnd: 24, targetControls: ['cc4.1', 'cc4.2'] },
      
      // Control Activities (CN25) -> CC5.x
      { cnStart: 25, cnEnd: 25, targetControls: ['cc5.1', 'cc5.2', 'cc5.3'] },
      
      // Logical Access Controls (CN26-CN46) -> CC6.x
      { cnStart: 26, cnEnd: 46, targetControls: ['cc6.1', 'cc6.2', 'cc6.3', 'cc6.4', 'cc6.5', 'cc6.6', 'cc6.7', 'cc6.8'] },
      
      // System Operations (CN47-CN49) -> CC7.x
      { cnStart: 47, cnEnd: 49, targetControls: ['cc7.1', 'cc7.2', 'cc7.3', 'cc7.4', 'cc7.5'] },
      
      // Change Management (CN50-CN55) -> CC8.x
      { cnStart: 50, cnEnd: 55, targetControls: ['cc8.1'] },
      
      // Risk Mitigation (CN56-CN59) -> CC9.x
      { cnStart: 56, cnEnd: 59, targetControls: ['cc9.1', 'cc9.2'] },
      
      // Availability (CN60-CN65) -> A1.x
      { cnStart: 60, cnEnd: 65, targetControls: ['a1.1', 'a1.2', 'a1.3'] },
      
      // Confidentiality (CN66-CN69) -> C1.x
      { cnStart: 66, cnEnd: 69, targetControls: ['c1.1', 'c1.2'] },
      
      // Processing Integrity (CN70-CN72) -> PI1.x
      { cnStart: 70, cnEnd: 72, targetControls: ['pi1.1', 'pi1.2', 'pi1.3', 'pi1.4', 'pi1.5'] }
    ];
    
    let successCount = 0;
    let totalAttempts = 0;
    
    // Process each CN evidence
    for (const ev of cnEvidence) {
      const cnNumber = parseInt(ev.name.substring(2, 4));
      if (isNaN(cnNumber)) continue;
      
      // Find which control area this CN belongs to
      const mapping = controlMapping.find(m => cnNumber >= m.cnStart && cnNumber <= m.cnEnd);
      if (!mapping) {
        console.log(`⚠️  No mapping found for ${ev.name}`);
        continue;
      }
      
      // Find matching controls and their subcontrols
      const matchingControls = controls.filter(control => 
        mapping.targetControls.includes(control.ref_code)
      );
      
      if (matchingControls.length === 0) {
        console.log(`⚠️  No matching controls found for ${ev.name} in ${mapping.targetControls.join(', ')}`);
        continue;
      }
      
      // Associate with first available subcontrol from matching controls
      let associated = false;
      for (const control of matchingControls) {
        if (control.subcontrols && control.subcontrols.length > 0) {
          const subcontrol = control.subcontrols[0];
          totalAttempts++;
          
          try {
            await axios.put(
              `${API_BASE_URL}/subcontrols/${subcontrol.id}/associate-evidence`,
              { evidence: [ev.id] },
              { headers }
            );
            console.log(`✅ ${ev.name} -> ${control.ref_code} (${subcontrol.id})`);
            successCount++;
            associated = true;
            break;
          } catch (error) {
            console.error(`❌ Failed to associate ${ev.name} with ${control.ref_code}:`, error.response?.data || error.message);
          }
        }
      }
      
      if (!associated) {
        console.log(`⚠️  Could not associate ${ev.name} - no available subcontrols`);
      }
    }
    
    console.log(`\n📊 MAPPING RESULTS:`);
    console.log(`✅ Successfully associated: ${successCount}/${totalAttempts}`);
    console.log(`📈 Success rate: ${Math.round((successCount/totalAttempts) * 100)}%`);
    console.log(`🎯 CN Evidence processed: ${cnEvidence.length}`);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

fixEvidenceMapping().catch(console.error);