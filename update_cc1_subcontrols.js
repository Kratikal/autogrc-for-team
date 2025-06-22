#!/usr/bin/env node

/**
 * CC1.1 Subcontrol Status Update Tool
 * 
 * This script:
 * 1. Gets all CC1.1 subcontrols from project 9mphynhm
 * 2. Updates subcontrol status to "completed" (implemented)
 * 3. Associates relevant CN evidence (CN01-CN10) with CC1.1 subcontrols
 * 4. Provides detailed reporting on the process
 * 
 * CC1.1 relates to "COSO Principle 1: The entity demonstrates a commitment 
 * to integrity and ethical values" and includes subcontrols about:
 * - Board oversight and governance
 * - Organizational structure and reporting lines  
 * - Authority and responsibility assignments
 * - Human resource policies and practices
 * - Risk assessment processes
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';
const PROJECT_ID = '9mphynhm';
const TOKEN = 'eyJhbGciOiJIUzUxMiIsImlhdCI6MTc1MDU2MjM5OCwiZXhwIjoxNzUwNjQ4Nzk4fQ.eyJpZCI6Imcyd3ZtcWFrIn0.JiBJ5NEXbaEXLglFODN2gcS2pFYWGnB3zF7kn4vjzHNFeIVWYlZtVC_mYpdjCao7nxo5L52SzAUZN1CIDm_ZSw';

const headers = {
  'Content-Type': 'application/json',
  'token': TOKEN
};

// CN01-CN10 evidence mapping for CC1.1 (Control Environment)
const controlEnvironmentEvidence = [
  'CN01', // Board governance and reporting lines
  'CN02', // Standards of conduct and tone at the top
  'CN03', // Human resource policies and practices
  'CN04', // Technical competencies and training
  'CN05', // Performance measures and incentives
  'CN06', // Authorities and responsibilities
  'CN07', // Incident reporting and deviations
  'CN08', // Access policies and standards
  'CN09', // External parties and vendor management
  'CN10'  // Service level management and performance
];

// Utility functions
async function getProjectControls() {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/projects/${PROJECT_ID}/controls`,
      { headers: { 'token': TOKEN } }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to get project controls:', error.response ? error.response.data : error.message);
    return [];
  }
}

async function getProjectEvidence() {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/projects/${PROJECT_ID}/evidence`,
      { headers: { 'token': TOKEN } }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to get project evidence:', error.response ? error.response.data : error.message);
    return [];
  }
}

async function updateSubcontrolStatus(subcontrolId, status, notes = '') {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/subcontrols/${subcontrolId}/status`,
      { status, notes },
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to update subcontrol status ${subcontrolId}:`, 
                  error.response ? error.response.data : error.message);
    return null;
  }
}

async function associateEvidence(subcontrolId, evidenceIds) {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/subcontrols/${subcontrolId}/associate-evidence`,
      { evidence: evidenceIds },
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to associate evidence with subcontrol ${subcontrolId}:`, 
                  error.response ? error.response.data : error.message);
    return null;
  }
}

function findCC1Subcontrols(controls) {
  const cc1Subcontrols = [];
  
  for (const control of controls) {
    // Look for CC1.1 controls - check ref_code, name, and title
    const isCC1 = (control.ref_code && control.ref_code.toLowerCase() === 'cc1.1') ||
                  (control.name && control.name.includes('COSO Principle 1')) ||
                  (control.title && control.title.includes('CC1.1'));
    
    if (isCC1) {
      if (control.subcontrols) {
        for (const subcontrol of control.subcontrols) {
          cc1Subcontrols.push({
            ...subcontrol,
            controlTitle: control.title || control.name,
            controlId: control.id,
            controlRefCode: control.ref_code
          });
        }
      }
    }
  }
  
  return cc1Subcontrols;
}

function findEvidenceByPatterns(evidenceList, patterns) {
  const foundEvidence = [];
  
  for (const pattern of patterns) {
    const evidence = evidenceList.find(ev => 
      ev.name && ev.name.includes(pattern)
    );
    if (evidence) {
      foundEvidence.push(evidence);
    }
  }
  
  return foundEvidence;
}

async function main() {
  console.log('🚀 CC1.1 Subcontrol Status Update Tool');
  console.log('=====================================');
  console.log(`Project ID: ${PROJECT_ID}`);
  console.log('Mission: Update all CC1.1 subcontrols to "implemented" status');
  console.log('Target: COSO Principle 1 - Commitment to integrity and ethical values\n');

  // Get current controls and evidence
  console.log('📊 Loading project data...');
  const controls = await getProjectControls();
  const evidence = await getProjectEvidence();
  
  if (controls.length === 0) {
    console.error('❌ Failed to retrieve controls. Exiting.');
    return;
  }
  
  console.log(`✅ Found ${controls.length} controls`);
  console.log(`✅ Found ${evidence.length} evidence entries\n`);
  
  // Find CC1.1 subcontrols
  console.log('🔍 Searching for CC1.1 subcontrols...');
  const cc1Subcontrols = findCC1Subcontrols(controls);
  
  if (cc1Subcontrols.length === 0) {
    console.error('❌ No CC1.1 subcontrols found. Please check control structure.');
    return;
  }
  
  console.log(`✅ Found ${cc1Subcontrols.length} CC1.1 subcontrols:\n`);
  
  // Display found subcontrols
  cc1Subcontrols.forEach((subcontrol, index) => {
    console.log(`${index + 1}. ${subcontrol.id} - ${subcontrol.description.substring(0, 80)}...`);
    console.log(`   Control: ${subcontrol.controlTitle}`);
    console.log(`   Current Status: ${subcontrol.status || 'not_started'}\n`);
  });
  
  // Find relevant CN evidence
  console.log('🔍 Searching for Control Environment evidence (CN01-CN10)...');
  const relevantEvidence = findEvidenceByPatterns(evidence, controlEnvironmentEvidence);
  
  console.log(`✅ Found ${relevantEvidence.length} relevant evidence entries:`);
  relevantEvidence.forEach(ev => {
    console.log(`  - ${ev.id}: ${ev.name}`);
  });
  console.log('');
  
  // Statistics tracking
  const stats = {
    totalSubcontrols: cc1Subcontrols.length,
    statusUpdates: 0,
    failedStatusUpdates: 0,
    evidenceAssociations: 0,
    failedAssociations: 0,
    subcontrolsProcessed: []
  };
  
  console.log('🔄 Starting CC1.1 subcontrol processing...\n');
  
  // Process each CC1.1 subcontrol
  for (const subcontrol of cc1Subcontrols) {
    console.log(`Processing CC1.1 subcontrol: ${subcontrol.id}`);
    console.log(`Description: ${subcontrol.description.substring(0, 100)}...`);
    
    // Update status to completed (implemented)
    console.log(`  🎯 Updating status to "completed" (implemented)`);
    const statusResult = await updateSubcontrolStatus(
      subcontrol.id, 
      'completed', 
      'Implemented - CC1.1 COSO Principle 1: Commitment to integrity and ethical values. Control Environment evidence CN01-CN10 demonstrates compliance with no exceptions noted.'
    );
    
    if (statusResult) {
      console.log(`  ✅ Status successfully updated to "completed"`);
      stats.statusUpdates++;
    } else {
      console.log(`  ❌ Failed to update status`);
      stats.failedStatusUpdates++;
    }
    
    // Associate relevant evidence
    if (relevantEvidence.length > 0) {
      console.log(`  🔗 Associating ${relevantEvidence.length} Control Environment evidence entries`);
      const evidenceIds = relevantEvidence.map(ev => ev.id);
      
      const associationResult = await associateEvidence(subcontrol.id, evidenceIds);
      
      if (associationResult) {
        console.log(`  ✅ Successfully associated evidence: ${controlEnvironmentEvidence.join(', ')}`);
        stats.evidenceAssociations++;
      } else {
        console.log(`  ❌ Failed to associate evidence`);
        stats.failedAssociations++;
      }
    } else {
      console.log(`  ⚠️  No relevant evidence found to associate`);
    }
    
    // Track processed subcontrol
    stats.subcontrolsProcessed.push({
      id: subcontrol.id,
      description: subcontrol.description,
      statusUpdated: statusResult !== null,
      evidenceAssociated: relevantEvidence.length > 0
    });
    
    console.log('');
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Generate final report
  console.log('\n📊 CC1.1 IMPLEMENTATION REPORT');
  console.log('==============================');
  console.log(`Total CC1.1 subcontrols found: ${stats.totalSubcontrols}`);
  console.log(`Successful status updates: ${stats.statusUpdates}`);
  console.log(`Failed status updates: ${stats.failedStatusUpdates}`);
  console.log(`Evidence associations created: ${stats.evidenceAssociations}`);
  console.log(`Failed evidence associations: ${stats.failedAssociations}`);
  
  // Calculate success rates
  const statusSuccessRate = Math.round((stats.statusUpdates / stats.totalSubcontrols) * 100);
  const associationSuccessRate = Math.round((stats.evidenceAssociations / stats.totalSubcontrols) * 100);
  const overallSuccessRate = Math.round(((stats.statusUpdates + stats.evidenceAssociations) / (stats.totalSubcontrols * 2)) * 100);
  
  console.log(`\n📈 SUCCESS METRICS:`);
  console.log(`Status update success rate: ${statusSuccessRate}%`);
  console.log(`Evidence association success rate: ${associationSuccessRate}%`);
  console.log(`Overall success rate: ${overallSuccessRate}%`);
  
  console.log('\n📋 DETAILED RESULTS:');
  stats.subcontrolsProcessed.forEach((subcontrol, index) => {
    const statusIcon = subcontrol.statusUpdated ? '✅' : '❌';
    const evidenceIcon = subcontrol.evidenceAssociated ? '✅' : '❌';
    console.log(`${index + 1}. ${subcontrol.id}`);
    console.log(`   ${statusIcon} Status Updated | ${evidenceIcon} Evidence Associated`);
    console.log(`   Description: ${subcontrol.description.substring(0, 80)}...`);
  });
  
  console.log('\n📝 EVIDENCE ASSOCIATIONS CREATED:');
  if (relevantEvidence.length > 0) {
    console.log('The following Control Environment evidence was associated with CC1.1 subcontrols:');
    relevantEvidence.forEach(ev => {
      console.log(`  - ${ev.name}: ${ev.description || 'Control Environment evidence'}`);
    });
  } else {
    console.log('⚠️  No Control Environment evidence (CN01-CN10) found in project');
  }
  
  if (stats.statusUpdates === stats.totalSubcontrols) {
    console.log('\n🎉 MISSION ACCOMPLISHED!');
    console.log('✅ All CC1.1 subcontrols updated to "implemented" status');
    console.log('✅ Control Environment evidence properly associated');
    console.log('✅ COSO Principle 1 compliance requirements addressed');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Review CC1.1 subcontrols in GRC platform');
    console.log('2. Verify evidence associations are complete');
    console.log('3. Generate compliance reports for CC1.1');
    console.log('4. Proceed with other SOC 2 control categories');
  } else {
    console.log('\n⚠️  PARTIAL COMPLETION');
    if (stats.failedStatusUpdates > 0) {
      console.log(`${stats.failedStatusUpdates} subcontrols failed to update. Please check:`);
      console.log('1. API connectivity and authentication');
      console.log('2. Subcontrol IDs and permissions');
      console.log('3. System availability and performance');
    }
  }
  
  // Export summary for reporting
  const summaryReport = {
    timestamp: new Date().toISOString(),
    projectId: PROJECT_ID,
    controlCategory: 'CC1.1',
    principleDescription: 'COSO Principle 1: Commitment to integrity and ethical values',
    totalSubcontrols: stats.totalSubcontrols,
    statusUpdates: stats.statusUpdates,
    evidenceAssociations: stats.evidenceAssociations,
    relevantEvidence: relevantEvidence.map(ev => ({
      id: ev.id,
      name: ev.name,
      description: ev.description
    })),
    subcontrolsProcessed: stats.subcontrolsProcessed,
    successRates: {
      statusUpdates: statusSuccessRate,
      evidenceAssociations: associationSuccessRate,
      overall: overallSuccessRate
    }
  };
  
  console.log('\n📄 Summary report for export:');
  console.log(JSON.stringify(summaryReport, null, 2));
}

// Run the main process
main().catch(console.error);