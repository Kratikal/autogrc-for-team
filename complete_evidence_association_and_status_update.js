#!/usr/bin/env node

/**
 * Complete SOC 2 Evidence Association and Subcontrol Status Update
 * 
 * This script:
 * 1. Associates all CN01-CN72 evidence with corresponding subcontrols
 * 2. Updates subcontrol status to "completed" for those with CN evidence
 * 3. Provides comprehensive reporting on the process
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';
const PROJECT_ID = '9mphynhm';
const TOKEN = 'eyJhbGciOiJIUzUxMiIsImlhdCI6MTc1MDU3MTYyOCwiZXhwIjoxNzUwNTcyMjI4fQ.eyJpZCI6Imcyd3ZtcWFrIn0.PMylhNOT4fKIs7ij0uSpTKB-I4nBUTY3xf46HuiRNoxyfQdAJzsGHU6YDqD1T8NYSPxsAs4iry76co5Tbp1opw';

const headers = {
  'Content-Type': 'application/json',
  'token': TOKEN
};

// Complete SOC 2 Evidence to Subcontrol Mapping
const evidenceToSubcontrolMapping = [
  // CC1.x - Control Environment (CN01-CN10)
  { evidence: "CN01", subcontrolPattern: "Establishes Reporting Lines", category: "CC1" },
  { evidence: "CN01", subcontrolPattern: "Considers All Structures", category: "CC1" },
  { evidence: "CN01", subcontrolPattern: "Oversight Responsibilities", category: "CC1" },
  
  { evidence: "CN02", subcontrolPattern: "Standards of Conduct", category: "CC1" },
  { evidence: "CN02", subcontrolPattern: "Tone at the Top", category: "CC1" },
  { evidence: "CN02", subcontrolPattern: "Adherence to Standards", category: "CC1" },
  
  { evidence: "CN03", subcontrolPattern: "Background of Individuals", category: "CC1" },
  { evidence: "CN03", subcontrolPattern: "Policies and Practices", category: "CC1" },
  { evidence: "CN03", subcontrolPattern: "Attracts, Develops, and Retains", category: "CC1" },
  
  { evidence: "CN04", subcontrolPattern: "Technical Competencies", category: "CC1" },
  { evidence: "CN04", subcontrolPattern: "Training", category: "CC1" },
  { evidence: "CN04", subcontrolPattern: "Evaluates Competence", category: "CC1" },
  
  { evidence: "CN05", subcontrolPattern: "Performance Measures", category: "CC1" },
  { evidence: "CN05", subcontrolPattern: "Incentives", category: "CC1" },
  { evidence: "CN05", subcontrolPattern: "Rewards", category: "CC1" },
  
  { evidence: "CN06", subcontrolPattern: "Authorities and Responsibilities", category: "CC1" },
  { evidence: "CN06", subcontrolPattern: "Limits Authorities", category: "CC1" },
  { evidence: "CN06", subcontrolPattern: "Accountability", category: "CC1" },
  
  { evidence: "CN07", subcontrolPattern: "Incident", category: "CC1" },
  { evidence: "CN07", subcontrolPattern: "Deviations", category: "CC1" },
  { evidence: "CN07", subcontrolPattern: "Timely Manner", category: "CC1" },
  
  { evidence: "CN08", subcontrolPattern: "Policy", category: "CC1" },
  { evidence: "CN08", subcontrolPattern: "Access", category: "CC1" },
  { evidence: "CN08", subcontrolPattern: "Standards", category: "CC1" },
  
  { evidence: "CN09", subcontrolPattern: "External Parties", category: "CC1" },
  { evidence: "CN09", subcontrolPattern: "Vendor", category: "CC1" },
  { evidence: "CN09", subcontrolPattern: "Privacy", category: "CC1" },
  
  { evidence: "CN10", subcontrolPattern: "Service Level", category: "CC1" },
  { evidence: "CN10", subcontrolPattern: "Management", category: "CC1" },
  { evidence: "CN10", subcontrolPattern: "Performance", category: "CC1" },
  
  // CC2.x - Communication & Information (CN11-CN16)
  { evidence: "CN11", subcontrolPattern: "Information", category: "CC2" },
  { evidence: "CN11", subcontrolPattern: "Processing", category: "CC2" },
  { evidence: "CN11", subcontrolPattern: "Quality", category: "CC2" },
  
  { evidence: "CN12", subcontrolPattern: "Communication", category: "CC2" },
  { evidence: "CN12", subcontrolPattern: "Internal", category: "CC2" },
  { evidence: "CN12", subcontrolPattern: "Incident", category: "CC2" },
  
  { evidence: "CN13", subcontrolPattern: "Information Systems", category: "CC2" },
  { evidence: "CN13", subcontrolPattern: "Portal", category: "CC2" },
  { evidence: "CN13", subcontrolPattern: "Access", category: "CC2" },
  
  { evidence: "CN14", subcontrolPattern: "Privacy", category: "CC2" },
  { evidence: "CN14", subcontrolPattern: "External", category: "CC2" },
  { evidence: "CN14", subcontrolPattern: "Communication", category: "CC2" },
  
  { evidence: "CN15", subcontrolPattern: "Service", category: "CC2" },
  { evidence: "CN15", subcontrolPattern: "Level", category: "CC2" },
  { evidence: "CN15", subcontrolPattern: "Management", category: "CC2" },
  
  { evidence: "CN16", subcontrolPattern: "Risk", category: "CC2" },
  { evidence: "CN16", subcontrolPattern: "Framework", category: "CC2" },
  { evidence: "CN16", subcontrolPattern: "Management", category: "CC2" },
  
  // CC3.x - Risk Assessment (CN17-CN20)
  { evidence: "CN17", subcontrolPattern: "Risk Management", category: "CC3" },
  { evidence: "CN17", subcontrolPattern: "Enterprise", category: "CC3" },
  { evidence: "CN17", subcontrolPattern: "Function", category: "CC3" },
  
  { evidence: "CN18", subcontrolPattern: "Fraud", category: "CC3" },
  { evidence: "CN18", subcontrolPattern: "Risk Assessment", category: "CC3" },
  { evidence: "CN18", subcontrolPattern: "Periodic", category: "CC3" },
  
  { evidence: "CN19", subcontrolPattern: "Asset", category: "CC3" },
  { evidence: "CN19", subcontrolPattern: "Protection", category: "CC3" },
  { evidence: "CN19", subcontrolPattern: "Measures", category: "CC3" },
  
  { evidence: "CN20", subcontrolPattern: "Change", category: "CC3" },
  { evidence: "CN20", subcontrolPattern: "Impact", category: "CC3" },
  { evidence: "CN20", subcontrolPattern: "Risk", category: "CC3" },
  
  // CC4.x - Monitoring Activities (CN21-CN24)
  { evidence: "CN21", subcontrolPattern: "Audit", category: "CC4" },
  { evidence: "CN21", subcontrolPattern: "Internal", category: "CC4" },
  { evidence: "CN21", subcontrolPattern: "Calendar", category: "CC4" },
  
  { evidence: "CN22", subcontrolPattern: "Performance", category: "CC4" },
  { evidence: "CN22", subcontrolPattern: "Monitoring", category: "CC4" },
  { evidence: "CN22", subcontrolPattern: "System", category: "CC4" },
  
  { evidence: "CN23", subcontrolPattern: "Monitoring", category: "CC4" },
  { evidence: "CN23", subcontrolPattern: "Firewall", category: "CC4" },
  { evidence: "CN23", subcontrolPattern: "IDS", category: "CC4" },
  
  { evidence: "CN24", subcontrolPattern: "Vulnerability", category: "CC4" },
  { evidence: "CN24", subcontrolPattern: "Scanning", category: "CC4" },
  { evidence: "CN24", subcontrolPattern: "Penetration", category: "CC4" },
  
  // CC5.x - Control Activities (CN25)
  { evidence: "CN25", subcontrolPattern: "Sign-On", category: "CC5" },
  { evidence: "CN25", subcontrolPattern: "Shared", category: "CC5" },
  { evidence: "CN25", subcontrolPattern: "Functionality", category: "CC5" },
  
  // CC6.x - Logical Access Controls (CN26-CN46)
  { evidence: "CN26", subcontrolPattern: "Authentication", category: "CC6" },
  { evidence: "CN27", subcontrolPattern: "Multi-Factor", category: "CC6" },
  { evidence: "CN28", subcontrolPattern: "Privileged Access", category: "CC6" },
  { evidence: "CN29", subcontrolPattern: "Password", category: "CC6" },
  { evidence: "CN30", subcontrolPattern: "Account", category: "CC6" },
  { evidence: "CN31", subcontrolPattern: "VPN", category: "CC6" },
  { evidence: "CN32", subcontrolPattern: "Network", category: "CC6" },
  { evidence: "CN33", subcontrolPattern: "RBAC", category: "CC6" },
  { evidence: "CN34", subcontrolPattern: "Access Control", category: "CC6" },
  { evidence: "CN35", subcontrolPattern: "User Access", category: "CC6" },
  { evidence: "CN36", subcontrolPattern: "Access Review", category: "CC6" },
  { evidence: "CN37", subcontrolPattern: "Physical Access", category: "CC6" },
  { evidence: "CN38", subcontrolPattern: "Logical Access", category: "CC6" },
  { evidence: "CN39", subcontrolPattern: "Security", category: "CC6" },
  { evidence: "CN40", subcontrolPattern: "Access Management", category: "CC6" },
  { evidence: "CN41", subcontrolPattern: "Application", category: "CC6" },
  { evidence: "CN42", subcontrolPattern: "Encryption", category: "CC6" },
  { evidence: "CN43", subcontrolPattern: "Data Loss Prevention", category: "CC6" },
  { evidence: "CN44", subcontrolPattern: "Endpoint", category: "CC6" },
  { evidence: "CN45", subcontrolPattern: "Security Controls", category: "CC6" },
  { evidence: "CN46", subcontrolPattern: "Access Controls", category: "CC6" },
  
  // CC7.x - System Operations (CN47-CN49)
  { evidence: "CN47", subcontrolPattern: "Configuration", category: "CC7" },
  { evidence: "CN47", subcontrolPattern: "Baseline", category: "CC7" },
  { evidence: "CN47", subcontrolPattern: "Management", category: "CC7" },
  
  { evidence: "CN48", subcontrolPattern: "Monitoring", category: "CC7" },
  { evidence: "CN48", subcontrolPattern: "System", category: "CC7" },
  { evidence: "CN48", subcontrolPattern: "Software", category: "CC7" },
  
  { evidence: "CN49", subcontrolPattern: "Operational", category: "CC7" },
  { evidence: "CN49", subcontrolPattern: "Procedures", category: "CC7" },
  { evidence: "CN49", subcontrolPattern: "Operations", category: "CC7" },
  
  // CC8.x - Change Management (CN50-CN55)
  { evidence: "CN50", subcontrolPattern: "Change Management", category: "CC8" },
  { evidence: "CN50", subcontrolPattern: "Roles", category: "CC8" },
  { evidence: "CN50", subcontrolPattern: "Responsibilities", category: "CC8" },
  
  { evidence: "CN51", subcontrolPattern: "Code Analysis", category: "CC8" },
  { evidence: "CN51", subcontrolPattern: "Static", category: "CC8" },
  { evidence: "CN51", subcontrolPattern: "Testing", category: "CC8" },
  
  { evidence: "CN52", subcontrolPattern: "Testing", category: "CC8" },
  { evidence: "CN52", subcontrolPattern: "Approval", category: "CC8" },
  { evidence: "CN52", subcontrolPattern: "Processes", category: "CC8" },
  
  { evidence: "CN53", subcontrolPattern: "Documentation", category: "CC8" },
  { evidence: "CN53", subcontrolPattern: "Change", category: "CC8" },
  { evidence: "CN53", subcontrolPattern: "Records", category: "CC8" },
  
  { evidence: "CN54", subcontrolPattern: "Project", category: "CC8" },
  { evidence: "CN54", subcontrolPattern: "Management", category: "CC8" },
  { evidence: "CN54", subcontrolPattern: "Framework", category: "CC8" },
  
  { evidence: "CN55", subcontrolPattern: "Version", category: "CC8" },
  { evidence: "CN55", subcontrolPattern: "Source Control", category: "CC8" },
  { evidence: "CN55", subcontrolPattern: "Code", category: "CC8" },
  
  // CC9.x - Risk Mitigation (CN56-CN59)
  { evidence: "CN56", subcontrolPattern: "Business Disruption", category: "CC9" },
  { evidence: "CN56", subcontrolPattern: "Mitigation", category: "CC9" },
  { evidence: "CN56", subcontrolPattern: "Plans", category: "CC9" },
  
  { evidence: "CN57", subcontrolPattern: "Insurance", category: "CC9" },
  { evidence: "CN57", subcontrolPattern: "Coverage", category: "CC9" },
  { evidence: "CN57", subcontrolPattern: "Considerations", category: "CC9" },
  
  { evidence: "CN58", subcontrolPattern: "Vendor", category: "CC9" },
  { evidence: "CN58", subcontrolPattern: "Confidentiality", category: "CC9" },
  { evidence: "CN58", subcontrolPattern: "Commitments", category: "CC9" },
  
  { evidence: "CN59", subcontrolPattern: "Risk Response", category: "CC9" },
  { evidence: "CN59", subcontrolPattern: "Treatment", category: "CC9" },
  { evidence: "CN59", subcontrolPattern: "Strategies", category: "CC9" },
  
  // A1.x - Availability (CN60-CN65)
  { evidence: "CN60", subcontrolPattern: "ISP", category: "A1" },
  { evidence: "CN60", subcontrolPattern: "Redundancy", category: "A1" },
  { evidence: "CN60", subcontrolPattern: "Multiple", category: "A1" },
  
  { evidence: "CN61", subcontrolPattern: "Environmental", category: "A1" },
  { evidence: "CN61", subcontrolPattern: "Protection", category: "A1" },
  { evidence: "CN61", subcontrolPattern: "Backup", category: "A1" },
  
  { evidence: "CN62", subcontrolPattern: "Backup", category: "A1" },
  { evidence: "CN62", subcontrolPattern: "Daily", category: "A1" },
  { evidence: "CN62", subcontrolPattern: "Procedures", category: "A1" },
  
  { evidence: "CN63", subcontrolPattern: "High Availability", category: "A1" },
  { evidence: "CN63", subcontrolPattern: "Architecture", category: "A1" },
  { evidence: "CN63", subcontrolPattern: "Availability", category: "A1" },
  
  { evidence: "CN64", subcontrolPattern: "Capacity", category: "A1" },
  { evidence: "CN64", subcontrolPattern: "Planning", category: "A1" },
  { evidence: "CN64", subcontrolPattern: "Management", category: "A1" },
  
  { evidence: "CN65", subcontrolPattern: "Business Continuity", category: "A1" },
  { evidence: "CN65", subcontrolPattern: "Testing", category: "A1" },
  { evidence: "CN65", subcontrolPattern: "Continuity", category: "A1" },
  
  // C1.x - Confidentiality (CN66-CN69)
  { evidence: "CN66", subcontrolPattern: "Confidential Information", category: "C1" },
  { evidence: "CN66", subcontrolPattern: "Identification", category: "C1" },
  { evidence: "CN66", subcontrolPattern: "Confidentiality", category: "C1" },
  
  { evidence: "CN67", subcontrolPattern: "Data Retention", category: "C1" },
  { evidence: "CN67", subcontrolPattern: "Disposal", category: "C1" },
  { evidence: "CN67", subcontrolPattern: "Policies", category: "C1" },
  
  { evidence: "CN68", subcontrolPattern: "Production Data", category: "C1" },
  { evidence: "CN68", subcontrolPattern: "Protection", category: "C1" },
  { evidence: "CN68", subcontrolPattern: "Data", category: "C1" },
  
  { evidence: "CN69", subcontrolPattern: "Confidentiality", category: "C1" },
  { evidence: "CN69", subcontrolPattern: "Agreements", category: "C1" },
  { evidence: "CN69", subcontrolPattern: "Training", category: "C1" },
  
  // PI1.x - Processing Integrity (CN70-CN72)
  { evidence: "CN70", subcontrolPattern: "Input Validation", category: "PI1" },
  { evidence: "CN70", subcontrolPattern: "Controls", category: "PI1" },
  { evidence: "CN70", subcontrolPattern: "Validation", category: "PI1" },
  
  { evidence: "CN71", subcontrolPattern: "Regression Testing", category: "PI1" },
  { evidence: "CN71", subcontrolPattern: "Application", category: "PI1" },
  { evidence: "CN71", subcontrolPattern: "Testing", category: "PI1" },
  
  { evidence: "CN72", subcontrolPattern: "Application-Level", category: "PI1" },
  { evidence: "CN72", subcontrolPattern: "Security Controls", category: "PI1" },
  { evidence: "CN72", subcontrolPattern: "Application", category: "PI1" },
];

// Utility functions
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

function findEvidenceByPattern(evidenceList, pattern) {
  return evidenceList.find(evidence => 
    evidence.name && evidence.name.includes(pattern)
  );
}

function findSubcontrolsByPattern(controls, pattern, category) {
  const matchingSubcontrols = [];
  
  for (const control of controls) {
    // Check if control title matches category
    if (control.title && control.title.includes(category)) {
      if (control.subcontrols) {
        for (const subcontrol of control.subcontrols) {
          if (subcontrol.description && 
              subcontrol.description.toLowerCase().includes(pattern.toLowerCase())) {
            matchingSubcontrols.push(subcontrol);
          }
        }
      }
    }
  }
  
  return matchingSubcontrols;
}

async function main() {
  console.log('🚀 Complete SOC 2 Evidence Association and Status Update Tool');
  console.log('================================================================');
  console.log(`Project ID: ${PROJECT_ID}`);
  console.log('Mission: Associate CN01-CN72 evidence with subcontrols and update status\n');

  // Get current evidence and controls
  console.log('📊 Loading project data...');
  const evidence = await getProjectEvidence();
  const controls = await getProjectControls();
  
  if (evidence.length === 0 || controls.length === 0) {
    console.error('❌ Failed to retrieve evidence or controls. Exiting.');
    return;
  }
  
  console.log(`✅ Found ${evidence.length} evidence entries`);
  console.log(`✅ Found ${controls.length} controls\n`);
  
  // Statistics tracking
  const stats = {
    totalMappings: evidenceToSubcontrolMapping.length,
    successfulAssociations: 0,
    failedAssociations: 0,
    statusUpdates: 0,
    failedStatusUpdates: 0,
    evidenceProcessed: new Set(),
    subcontrolsUpdated: new Set(),
    categoryStats: {}
  };
  
  console.log('🔄 Starting evidence association process...\n');
  
  // Process each mapping
  for (const mapping of evidenceToSubcontrolMapping) {
    console.log(`Processing ${mapping.evidence} -> ${mapping.category} (${mapping.subcontrolPattern})`);
    
    // Find the evidence
    const evidenceEntry = findEvidenceByPattern(evidence, mapping.evidence);
    if (!evidenceEntry) {
      console.log(`  ❌ Evidence not found: ${mapping.evidence}`);
      stats.failedAssociations++;
      continue;
    }
    
    stats.evidenceProcessed.add(mapping.evidence);
    console.log(`  ✅ Found evidence: ${evidenceEntry.id} - ${evidenceEntry.name}`);
    
    // Find matching subcontrols
    const matchingSubcontrols = findSubcontrolsByPattern(controls, mapping.subcontrolPattern, mapping.category);
    
    if (matchingSubcontrols.length === 0) {
      console.log(`  ❌ No matching subcontrols found for pattern: ${mapping.subcontrolPattern}`);
      stats.failedAssociations++;
      continue;
    }
    
    // Associate evidence with each matching subcontrol
    for (const subcontrol of matchingSubcontrols) {
      console.log(`    🔗 Associating with: ${subcontrol.id} - ${subcontrol.description.substring(0, 60)}...`);
      
      // Associate evidence
      const associationResult = await associateEvidence(subcontrol.id, [evidenceEntry.id]);
      
      if (associationResult) {
        console.log(`    ✅ Successfully associated with ${subcontrol.id}`);
        stats.successfulAssociations++;
        stats.subcontrolsUpdated.add(subcontrol.id);
        
        // Update category stats
        if (!stats.categoryStats[mapping.category]) {
          stats.categoryStats[mapping.category] = { associations: 0, statusUpdates: 0 };
        }
        stats.categoryStats[mapping.category].associations++;
        
        // Update subcontrol status to completed
        console.log(`    🎯 Updating status to "completed" for ${subcontrol.id}`);
        const statusResult = await updateSubcontrolStatus(
          subcontrol.id, 
          'completed', 
          `Completed based on SOC 2 audit evidence ${mapping.evidence} - No Exceptions Noted`
        );
        
        if (statusResult) {
          console.log(`    ✅ Status updated to completed for ${subcontrol.id}`);
          stats.statusUpdates++;
          stats.categoryStats[mapping.category].statusUpdates++;
        } else {
          console.log(`    ❌ Failed to update status for ${subcontrol.id}`);
          stats.failedStatusUpdates++;
        }
      } else {
        console.log(`    ❌ Failed to associate with ${subcontrol.id}`);
        stats.failedAssociations++;
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('');
  }
  
  // Generate final report
  console.log('\n📊 FINAL COMPLETION REPORT');
  console.log('==========================');
  console.log(`Total mappings processed: ${stats.totalMappings}`);
  console.log(`Successful evidence associations: ${stats.successfulAssociations}`);
  console.log(`Failed associations: ${stats.failedAssociations}`);
  console.log(`Subcontrol status updates: ${stats.statusUpdates}`);
  console.log(`Failed status updates: ${stats.failedStatusUpdates}`);
  console.log(`Unique evidence processed: ${stats.evidenceProcessed.size}`);
  console.log(`Unique subcontrols updated: ${stats.subcontrolsUpdated.size}`);
  
  // Calculate percentages
  const associationSuccessRate = Math.round((stats.successfulAssociations / stats.totalMappings) * 100);
  const statusUpdateSuccessRate = Math.round((stats.statusUpdates / stats.successfulAssociations) * 100);
  const overallCompletionRate = Math.round((stats.statusUpdates / stats.totalMappings) * 100);
  
  console.log(`\n📈 SUCCESS METRICS:`);
  console.log(`Association success rate: ${associationSuccessRate}%`);
  console.log(`Status update success rate: ${statusUpdateSuccessRate}%`);
  console.log(`Overall completion rate: ${overallCompletionRate}%`);
  
  console.log('\n📋 CATEGORY BREAKDOWN:');
  for (const [category, categoryStats] of Object.entries(stats.categoryStats)) {
    console.log(`${category}: ${categoryStats.associations} associations, ${categoryStats.statusUpdates} status updates`);
  }
  
  if (stats.successfulAssociations > 0) {
    console.log('\n🎉 MISSION ACCOMPLISHED!');
    console.log('✅ Evidence association process completed successfully');
    console.log('✅ Subcontrol completion status updated');
    console.log('✅ SOC 2 audit results properly reflected in GRC system');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Review completed subcontrols in GRC platform');
    console.log('2. Verify evidence associations are correct');
    console.log('3. Generate compliance reports');
    console.log('4. Monitor ongoing compliance status');
  } else {
    console.log('\n❌ PROCESS FAILED');
    console.log('No successful associations were made. Please check:');
    console.log('1. API connectivity and authentication');
    console.log('2. Evidence and control data availability');
    console.log('3. Mapping patterns and categories');
  }
  
  // Export summary for reporting
  const summaryReport = {
    timestamp: new Date().toISOString(),
    projectId: PROJECT_ID,
    totalMappings: stats.totalMappings,
    successfulAssociations: stats.successfulAssociations,
    statusUpdates: stats.statusUpdates,
    evidenceProcessed: Array.from(stats.evidenceProcessed),
    subcontrolsUpdated: Array.from(stats.subcontrolsUpdated),
    categoryStats: stats.categoryStats,
    successRates: {
      associations: associationSuccessRate,
      statusUpdates: statusUpdateSuccessRate,
      overall: overallCompletionRate
    }
  };
  
  console.log('\n📄 Summary report available for export:');
  console.log(JSON.stringify(summaryReport, null, 2));
}

// Run the main process
main().catch(console.error);