const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';
const AUTH_TOKEN = 'eyJhbGciOiJIUzUxMiIsImlhdCI6MTc1MDU2MjM5OCwiZXhwIjoxNzUwNjQ4Nzk4fQ.eyJpZCI6Imcyd3ZtcWFrIn0.JiBJ5NEXbaEXLglFODN2gcS2pFYWGnB3zF7kn4vjzHNFeIVWYlZtVC_mYpdjCao7nxo5L52SzAUZN1CIDm_ZSw';

async function analyzeEvidenceStatus() {
  const headers = { 'token': AUTH_TOKEN };
  
  console.log('=== COMPREHENSIVE SOC2 EVIDENCE STATUS ANALYSIS ===\n');
  
  try {
    // Get all project controls with subcontrols
    const controlsResponse = await axios.get(`${API_BASE_URL}/projects/9mphynhm/controls`, { headers });
    const controls = controlsResponse.data;
    
    // Get all evidence
    const evidenceResponse = await axios.get(`${API_BASE_URL}/projects/9mphynhm/evidence`, { headers });
    const evidence = evidenceResponse.data;
    
    console.log(`Total Controls: ${controls.length}`);
    console.log(`Total Evidence: ${evidence.length}`);
    console.log(`CN Evidence: ${evidence.filter(e => e.name && e.name.startsWith('CN')).length}\n`);
    
    // Create a mapping of all subcontrols
    const allSubcontrols = {};
    let totalSubcontrols = 0;
    
    controls.forEach(control => {
      if (control.subcontrols && control.subcontrols.length > 0) {
        control.subcontrols.forEach(subcontrol => {
          allSubcontrols[subcontrol.id] = {
            id: subcontrol.id,
            ref_code: subcontrol.ref_code,
            name: subcontrol.name,
            control_name: control.name,
            control_ref: control.ref_code,
            evidence: [],
            status: 'not_started'
          };
          totalSubcontrols++;
        });
      }
    });
    
    console.log(`Total Subcontrols: ${totalSubcontrols}\n`);
    
    // Map evidence to subcontrols
    evidence.forEach(ev => {
      if (ev.associations && ev.associations.length > 0) {
        ev.associations.forEach(assoc => {
          if (allSubcontrols[assoc.control_id]) {
            allSubcontrols[assoc.control_id].evidence.push({
              name: ev.name,
              description: ev.description,
              content: ev.content
            });
          }
        });
      }
    });
    
    // Analyze status of each subcontrol
    let completedCount = 0;
    let inProgressCount = 0;
    let notStartedCount = 0;
    
    console.log('=== SUBCONTROL STATUS ANALYSIS ===\n');
    
    // Group by control family for organized output
    const controlFamilies = {};
    
    Object.values(allSubcontrols).forEach(subcontrol => {
      const family = subcontrol.ref_code.substring(0, 3).toLowerCase();
      if (!controlFamilies[family]) {
        controlFamilies[family] = [];
      }
      
      // Determine status based on evidence
      if (subcontrol.evidence.length > 0) {
        // Check if evidence shows "No Exceptions Noted" or similar completion indicators
        const hasCompleteEvidence = subcontrol.evidence.some(ev => 
          ev.description && (
            ev.description.includes('No Exceptions Noted') ||
            ev.description.includes('implemented') ||
            ev.description.includes('established') ||
            ev.description.includes('operating effectively')
          )
        );
        
        if (hasCompleteEvidence) {
          subcontrol.status = 'completed';
          completedCount++;
        } else {
          subcontrol.status = 'in_progress';
          inProgressCount++;
        }
      } else {
        subcontrol.status = 'not_started';
        notStartedCount++;
      }
      
      controlFamilies[family].push(subcontrol);
    });
    
    // Display results by control family
    Object.keys(controlFamilies).sort().forEach(family => {
      const subcontrols = controlFamilies[family];
      const completed = subcontrols.filter(s => s.status === 'completed').length;
      const inProgress = subcontrols.filter(s => s.status === 'in_progress').length;
      const notStarted = subcontrols.filter(s => s.status === 'not_started').length;
      
      console.log(`\n${family.toUpperCase()} Control Family (${subcontrols.length} subcontrols):`);
      console.log(`  ✅ Completed: ${completed}`);
      console.log(`  🔄 In Progress: ${inProgress}`);
      console.log(`  ❌ Not Started: ${notStarted}`);
      
      // Show detailed status for each subcontrol
      subcontrols.forEach(sub => {
        const statusIcon = sub.status === 'completed' ? '✅' : sub.status === 'in_progress' ? '🔄' : '❌';
        console.log(`    ${statusIcon} ${sub.ref_code}: ${sub.name.substring(0, 60)}...`);
        
        if (sub.evidence.length > 0) {
          console.log(`      Evidence: ${sub.evidence.length} items`);
          sub.evidence.forEach(ev => {
            console.log(`        - ${ev.name}: ${ev.description ? ev.description.substring(0, 80) + '...' : 'No description'}`);
          });
        }
      });
    });
    
    console.log('\n=== OVERALL STATUS SUMMARY ===');
    console.log(`✅ Completed: ${completedCount} (${Math.round(completedCount/totalSubcontrols*100)}%)`);
    console.log(`🔄 In Progress: ${inProgressCount} (${Math.round(inProgressCount/totalSubcontrols*100)}%)`);
    console.log(`❌ Not Started: ${notStartedCount} (${Math.round(notStartedCount/totalSubcontrols*100)}%)`);
    
    console.log('\n=== COMPLETION CRITERIA ANALYSIS ===');
    console.log('Status Determination Logic:');
    console.log('- ✅ COMPLETED: Evidence shows "No Exceptions Noted", "implemented", "established", or "operating effectively"');
    console.log('- 🔄 IN PROGRESS: Evidence exists but lacks completion indicators');
    console.log('- ❌ NOT STARTED: No evidence associated with subcontrol');
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

analyzeEvidenceStatus().catch(console.error);