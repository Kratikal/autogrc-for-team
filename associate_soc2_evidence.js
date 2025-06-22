#!/usr/bin/env node

/**
 * SOC 2 Evidence Association Script
 * Associates created evidence with appropriate CC1.x subcontrols
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';
const PROJECT_ID = '9mphynhm';
const TOKEN = 'eyJhbGciOiJIUzUxMiIsImlhdCI6MTc1MDU3MTYyOCwiZXhwIjoxNzUwNTcyMjI4fQ.eyJpZCI6Imcyd3ZtcWFrIn0.PMylhNOT4fKIs7ij0uSpTKB-I4nBUTY3xf46HuiRNoxyfQdAJzsGHU6YDqD1T8NYSPxsAs4iry76co5Tbp1opw';

const headers = {
  'Content-Type': 'application/json',
  'token': TOKEN
};

// Evidence mapping to subcontrols based on SOC 2 control areas
const evidenceAssociations = [
  {
    evidenceName: "CN01 - Organization Chart with Defined Reporting Lines",
    subcontrolTargets: [
      "Establishes Reporting Lines", // CC1.3
      "Considers All Structures of the Entity", // CC1.3
      "Establishes Oversight Responsibilities" // CC1.2
    ]
  },
  {
    evidenceName: "CN02 - Code of Conduct, Employee Handbook, and NDA Processes", 
    subcontrolTargets: [
      "Establishes Standards of Conduct", // CC1.1
      "Sets the Tone at the Top", // CC1.1
      "Evaluates Adherence to Standards of Conduct" // CC1.1
    ]
  },
  {
    evidenceName: "CN03 - Job Descriptions and Background Verification Processes",
    subcontrolTargets: [
      "Considers the Background of Individuals", // CC1.4
      "Establishes Policies and Practices", // CC1.4
      "Attracts, Develops, and Retains Individuals" // CC1.4
    ]
  },
  {
    evidenceName: "CN04 - Security Awareness Training",
    subcontrolTargets: [
      "Provides Training to Maintain Technical Competencies", // CC1.4
      "Considers the Technical Competency of Individuals", // CC1.4
      "Evaluates Competence and Addresses Shortcomings" // CC1.4
    ]
  },
  {
    evidenceName: "CN05 - Performance Measures and KPIs",
    subcontrolTargets: [
      "Establishes Performance Measures, Incentives, and Rewards", // CC1.5
      "Evaluates Performance Measures, Incentives, and Rewards for Ongoing Relevance", // CC1.5
      "Evaluates Performance and Rewards or Disciplines Individuals" // CC1.5
    ]
  },
  {
    evidenceName: "CN06 - Information Processing Controls with Checks and Balances",
    subcontrolTargets: [
      "Defines, Assigns, and Limits Authorities and Responsibilities", // CC1.3
      "Addresses Specific Requirements When Defining Authorities and Responsibilities", // CC1.3
      "Enforces Accountability Through Structures, Authorities, and Responsibilities" // CC1.5
    ]
  },
  {
    evidenceName: "CN07 - Incident Management Policy and Procedures",
    subcontrolTargets: [
      "Addresses Deviations in a Timely Manner", // CC1.1
      "Establishes Policies and Practices", // CC1.4
      "Considers Excessive Pressures" // CC1.5
    ]
  },
  {
    evidenceName: "CN08 - Intranet Portal with Policy Access",
    subcontrolTargets: [
      "Establishes Standards of Conduct", // CC1.1
      "Evaluates Adherence to Standards of Conduct", // CC1.1
      "Establishes Policies and Practices" // CC1.4
    ]
  },
  {
    evidenceName: "CN09 - Master Subscription Agreements and Privacy Notices",
    subcontrolTargets: [
      "Sets the Tone at the Top", // CC1.1
      "Considers Contractors and Vendor Employees in Demonstrating Its Commitment", // CC1.1
      "Considers Interactions With External Parties When Establishing Structures" // CC1.3
    ]
  },
  {
    evidenceName: "CN10 - Service Level Management Procedures",
    subcontrolTargets: [
      "Establishes Performance Measures, Incentives, and Rewards", // CC1.5
      "Plans and Prepares for Succession", // CC1.4
      "Establishes Oversight Responsibilities" // CC1.2
    ]
  }
];

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

function findSubcontrolByDescription(controls, targetDescription) {
  for (const control of controls) {
    if (control.subcontrols) {
      for (const subcontrol of control.subcontrols) {
        if (subcontrol.description && 
            subcontrol.description.includes(targetDescription.substring(0, 30))) {
          return subcontrol;
        }
      }
    }
  }
  return null;
}

function findEvidenceByName(evidenceList, targetName) {
  return evidenceList.find(evidence => 
    evidence.name && evidence.name.includes(targetName.substring(0, 20))
  );
}

async function main() {
  console.log('SOC 2 Evidence Association Tool');
  console.log('===============================');
  console.log(`Project ID: ${PROJECT_ID}`);
  console.log('Target: Associate CN01-CN10 evidence with CC1.x subcontrols\n');

  // Get current evidence and controls
  const evidence = await getProjectEvidence();
  const controls = await getProjectControls();
  
  if (evidence.length === 0 || controls.length === 0) {
    console.error('Failed to retrieve evidence or controls. Exiting.');
    return;
  }
  
  console.log(`Found ${evidence.length} evidence entries`);
  console.log(`Found ${controls.length} controls\n`);
  
  let successCount = 0;
  let failureCount = 0;
  
  // Process each evidence association
  for (const association of evidenceAssociations) {
    console.log(`Processing: ${association.evidenceName}`);
    
    // Find the evidence entry
    const evidenceEntry = findEvidenceByName(evidence, association.evidenceName);
    if (!evidenceEntry) {
      console.log(`  ✗ Evidence not found: ${association.evidenceName}`);
      failureCount++;
      continue;
    }
    
    console.log(`  ✓ Found evidence ID: ${evidenceEntry.id}`);
    
    // Process each target subcontrol
    for (const target of association.subcontrolTargets) {
      const subcontrol = findSubcontrolByDescription(controls, target);
      
      if (!subcontrol) {
        console.log(`    ✗ Subcontrol not found: ${target.substring(0, 40)}...`);
        failureCount++;
        continue;
      }
      
      console.log(`    → Associating with: ${subcontrol.id} (${target.substring(0, 40)}...)`);
      
      // Associate the evidence with the subcontrol
      const result = await associateEvidence(subcontrol.id, [evidenceEntry.id]);
      
      if (result) {
        console.log(`    ✓ Successfully associated with ${subcontrol.id}`);
        successCount++;
      } else {
        console.log(`    ✗ Failed to associate with ${subcontrol.id}`);
        failureCount++;
      }
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log('');
  }
  
  console.log('Association Summary:');
  console.log('===================');
  console.log(`Successful associations: ${successCount}`);
  console.log(`Failed associations: ${failureCount}`);
  console.log(`Total evidence entries processed: ${evidenceAssociations.length}`);
  
  if (successCount > 0) {
    console.log('\n✓ Evidence has been successfully associated with CC1.x subcontrols!');
    console.log('Next steps:');
    console.log('1. Review the associations in the GRC platform');
    console.log('2. Verify evidence content aligns with control requirements');
    console.log('3. Continue with CN11-CN72 control areas');
  }
}

main().catch(console.error);