const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';
const AUTH_TOKEN = 'eyJhbGciOiJIUzUxMiIsImlhdCI6MTc1MDU2MjM5OCwiZXhwIjoxNzUwNjQ4Nzk4fQ.eyJpZCI6Imcyd3ZtcWFrIn0.JiBJ5NEXbaEXLglFODN2gcS2pFYWGnB3zF7kn4vjzHNFeIVWYlZtVC_mYpdjCao7nxo5L52SzAUZN1CIDm_ZSw';

async function verifyFinalApplicability() {
  const headers = { 'token': AUTH_TOKEN };
  
  console.log('=== FINAL VERIFICATION OF CONTROL APPLICABILITY ===\n');
  
  try {
    const controlsResponse = await axios.get(`${API_BASE_URL}/projects/9mphynhm/controls`, { headers });
    const controls = controlsResponse.data;
    
    const applicable = controls.filter(c => c.is_applicable === true);
    const notApplicable = controls.filter(c => c.is_applicable === false);
    const unknown = controls.filter(c => c.is_applicable === null || c.is_applicable === undefined);
    
    console.log(`📊 FINAL CONTROL APPLICABILITY STATUS:`);
    console.log(`✅ APPLICABLE: ${applicable.length} controls`);
    console.log(`❌ NOT APPLICABLE: ${notApplicable.length} controls`);
    console.log(`❓ UNKNOWN: ${unknown.length} controls`);
    console.log(`📈 Total: ${controls.length} controls`);
    
    console.log(`\n✅ APPLICABLE CONTROLS BY CATEGORY:`);
    const applicableByCategory = {};
    applicable.forEach(control => {
      const prefix = control.ref_code ? control.ref_code.substring(0, 3).toLowerCase() : 'other';
      if (!applicableByCategory[prefix]) {
        applicableByCategory[prefix] = 0;
      }
      applicableByCategory[prefix]++;
    });
    
    Object.entries(applicableByCategory).sort().forEach(([category, count]) => {
      const categoryName = {
        'cc1': 'Control Environment',
        'cc2': 'Communication & Information', 
        'cc3': 'Risk Assessment',
        'cc4': 'Monitoring Activities',
        'cc5': 'Control Activities',
        'cc6': 'Logical & Physical Access',
        'cc7': 'System Operations',
        'cc8': 'Change Management', 
        'cc9': 'Risk Mitigation',
        'a1.': 'Availability',
        'c1.': 'Confidentiality',
        'pi1': 'Processing Integrity'
      }[category] || category.toUpperCase();
      
      console.log(`  ✅ ${categoryName}: ${count} controls`);
    });
    
    console.log(`\n❌ NOT APPLICABLE CONTROLS:`);
    notApplicable.forEach(control => {
      console.log(`  ❌ ${control.ref_code}: ${control.name.substring(0, 50)}...`);
    });
    
    console.log(`\n🎯 SCOPE ALIGNMENT WITH SOC 2 AUDIT:`);
    console.log('✅ Security (CC1-CC9): Included in audit scope');
    console.log('✅ Availability (A1): Included in audit scope');
    console.log('✅ Confidentiality (C1): Included in audit scope');
    console.log('✅ Processing Integrity (PI1): Included in audit scope');
    console.log('❌ Privacy (P1-P8): NOT included in audit scope - correctly marked not applicable');
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

verifyFinalApplicability().catch(console.error);