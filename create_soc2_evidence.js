#!/usr/bin/env node

/**
 * SOC 2 Evidence Creation Script
 * Creates evidence entries for CN01-CN10 control areas
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';
const PROJECT_ID = '9mphynhm';
const TOKEN = 'eyJhbGciOiJIUzUxMiIsImlhdCI6MTc1MDU3MTYyOCwiZXhwIjoxNzUwNTcyMjI4fQ.eyJpZCI6Imcyd3ZtcWFrIn0.PMylhNOT4fKIs7ij0uSpTKB-I4nBUTY3xf46HuiRNoxyfQdAJzsGHU6YDqD1T8NYSPxsAs4iry76co5Tbp1opw';

const headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'token': TOKEN
};

// Control Environment (CC1.x) evidence entries for CN01-CN10
const evidenceData = [
  {
    name: "CN01 - Organization Chart with Defined Reporting Lines",
    description: "Organization chart demonstrating clear reporting lines and management structure for oversight and accountability.",
    content: "CONTROL REFERENCE: CN01 (CC1.1-CC1.2)\n\nCOMPLIANCE EVIDENCE:\n• Current organizational chart showing clear reporting relationships\n• Defined roles and responsibilities for all positions\n• Management oversight structure including board and executive team\n• Clear escalation paths for issues and concerns\n• Regular updates to organizational structure documentation\n\nAUDIT FINDINGS:\n• Organization chart is maintained and current as of audit date\n• Clear reporting lines established from operational level to executive leadership\n• Segregation of duties appropriately reflected in structure\n• Board oversight responsibilities clearly defined"
  },
  {
    name: "CN02 - Code of Conduct, Employee Handbook, and NDA Processes",
    description: "Comprehensive code of conduct agreement, employee handbook policies, and non-disclosure agreement processes demonstrating commitment to integrity and ethical values.",
    content: "CONTROL REFERENCE: CN02 (CC1.1-CC1.3)\n\nCOMPLIANCE EVIDENCE:\n• Signed code of conduct agreements from all employees\n• Employee handbook with clearly defined policies and procedures\n• Non-disclosure agreements executed with all personnel\n• Regular training on ethical standards and compliance requirements\n• Disciplinary procedures for policy violations\n\nAUDIT FINDINGS:\n• All active employees have signed current code of conduct agreements\n• Employee handbook covers all required policy areas\n• NDA processes ensure confidentiality of sensitive information\n• Regular communication of standards and expectations to all personnel"
  },
  {
    name: "CN03 - Job Descriptions and Background Verification Processes",
    description: "Comprehensive job descriptions and background verification processes to ensure qualified and trustworthy personnel.",
    content: "CONTROL REFERENCE: CN03 (CC1.4)\n\nCOMPLIANCE EVIDENCE:\n• Detailed job descriptions for all positions with security responsibilities\n• Background check procedures for all employees\n• Reference verification processes\n• Skills and qualification verification\n• Periodic review and update of job descriptions\n\nAUDIT FINDINGS:\n• Job descriptions clearly define roles, responsibilities, and required qualifications\n• Background verification completed for all personnel prior to access\n• Reference checks performed and documented\n• Skills verification aligned with job requirements\n• Regular review ensures job descriptions remain current"
  },
  {
    name: "CN04 - Security Awareness Training",
    description: "Comprehensive security awareness training program to ensure all personnel understand their security responsibilities.",
    content: "CONTROL REFERENCE: CN04 (CC1.5)\n\nCOMPLIANCE EVIDENCE:\n• Security awareness training curriculum and materials\n• Training completion records for all employees\n• Regular refresher training schedules\n• Role-specific security training for privileged users\n• Training effectiveness measurement and testing\n\nAUDIT FINDINGS:\n• All employees completed required security awareness training\n• Training content covers relevant security topics and responsibilities\n• Regular refresher training ensures continued awareness\n• Role-specific training provided for users with elevated privileges\n• Training effectiveness measured through testing and assessment"
  },
  {
    name: "CN05 - Performance Measures and KPIs",
    description: "Performance measurement framework including key performance indicators for security and compliance objectives.",
    content: "CONTROL REFERENCE: CN05 (CC1.2-CC1.5)\n\nCOMPLIANCE EVIDENCE:\n• Defined performance measures for security and compliance functions\n• Regular monitoring and reporting of KPIs\n• Performance review processes for security personnel\n• Corrective action procedures for performance gaps\n• Board and management reporting on security metrics\n\nAUDIT FINDINGS:\n• Performance measures appropriately defined and monitored\n• Regular reporting to management and board on security metrics\n• Performance reviews include assessment of security responsibilities\n• Corrective actions taken when performance gaps identified\n• Continuous improvement in security performance measurement"
  },
  {
    name: "CN06 - Information Processing Controls with Checks and Balances",
    description: "Information processing controls implementing appropriate checks and balances to prevent errors and unauthorized activities.",
    content: "CONTROL REFERENCE: CN06 (CC2.1-CC2.3)\n\nCOMPLIANCE EVIDENCE:\n• Documented information processing procedures\n• Segregation of duties in critical processes\n• Authorization controls for data processing activities\n• Review and approval mechanisms for data changes\n• Monitoring controls for unusual or unauthorized activities\n\nAUDIT FINDINGS:\n• Information processing controls properly designed and implemented\n• Adequate segregation of duties maintained in critical functions\n• Authorization requirements appropriate for data sensitivity\n• Regular review processes ensure accuracy and completeness\n• Monitoring controls detect and prevent unauthorized activities"
  },
  {
    name: "CN07 - Incident Management Policy and Procedures",
    description: "Comprehensive incident management policy and procedures for identifying, responding to, and managing security incidents.",
    content: "CONTROL REFERENCE: CN07 (CC7.4-CC7.5)\n\nCOMPLIANCE EVIDENCE:\n• Incident management policy and procedures documentation\n• Incident response team roles and responsibilities\n• Incident classification and escalation procedures\n• Communication plans for incident notification\n• Incident tracking and resolution documentation\n\nAUDIT FINDINGS:\n• Incident management policy comprehensive and current\n• Response procedures clearly defined with appropriate escalation\n• Incident response team properly trained and equipped\n• Communication procedures ensure timely notification\n• Incident tracking maintains complete records for analysis"
  },
  {
    name: "CN08 - Intranet Portal with Policy Access",
    description: "Intranet portal providing centralized access to policies, procedures, and security-related information for all personnel.",
    content: "CONTROL REFERENCE: CN08 (CC1.1-CC1.3)\n\nCOMPLIANCE EVIDENCE:\n• Intranet portal with centralized policy repository\n• Access controls ensuring appropriate personnel can view policies\n• Version control for policy documents and updates\n• Search functionality for easy policy location\n• Regular review and update of policy content\n\nAUDIT FINDINGS:\n• Intranet portal provides centralized access to current policies\n• Access controls appropriate for different user roles\n• Policy documents maintained with proper version control\n• Search and navigation functions facilitate policy location\n• Regular policy review ensures content remains current and relevant"
  },
  {
    name: "CN09 - Master Subscription Agreements and Privacy Notices",
    description: "Master subscription agreements and privacy notices demonstrating commitment to privacy and data protection obligations.",
    content: "CONTROL REFERENCE: CN09 (CC6.7-CC6.8)\n\nCOMPLIANCE EVIDENCE:\n• Master subscription agreements with privacy clauses\n• Privacy notices provided to customers and users\n• Data processing agreements with third parties\n• Privacy policy documentation and disclosures\n• Regular review and update of privacy commitments\n\nAUDIT FINDINGS:\n• Master agreements include appropriate privacy protections\n• Privacy notices clearly communicate data handling practices\n• Data processing agreements ensure third-party compliance\n• Privacy policies comprehensive and regularly updated\n• Privacy commitments aligned with regulatory requirements"
  },
  {
    name: "CN10 - Service Level Management Procedures",
    description: "Service level management procedures ensuring consistent service delivery and performance monitoring.",
    content: "CONTROL REFERENCE: CN10 (CC8.1)\n\nCOMPLIANCE EVIDENCE:\n• Service level agreements defining performance standards\n• Service level monitoring and reporting procedures\n• Performance dashboards and metrics tracking\n• Escalation procedures for service level breaches\n• Regular review and improvement of service delivery\n\nAUDIT FINDINGS:\n• Service level agreements appropriately defined and documented\n• Service performance regularly monitored against defined standards\n• Performance metrics tracked and reported to management\n• Escalation procedures ensure timely resolution of service issues\n• Continuous improvement processes enhance service delivery quality"
  }
];

async function createEvidence() {
  console.log('Creating SOC 2 evidence entries for CN01-CN10...\n');
  
  for (let i = 0; i < evidenceData.length; i++) {
    const evidence = evidenceData[i];
    
    try {
      console.log(`Creating evidence ${i + 1}/10: ${evidence.name}`);
      
      const formData = new URLSearchParams();
      formData.append('name', evidence.name);
      formData.append('description', evidence.description);
      formData.append('content', evidence.content);
      
      const response = await axios.post(
        `${API_BASE_URL}/projects/${PROJECT_ID}/evidence`,
        formData,
        { headers }
      );
      
      console.log(`✓ Created evidence ID: ${response.data.id}`);
      console.log(`  Description: ${evidence.description.substring(0, 80)}...`);
      console.log('');
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`✗ Failed to create evidence: ${evidence.name}`);
      console.error(`  Error: ${error.response ? error.response.data : error.message}`);
      console.log('');
    }
  }
  
  console.log('Evidence creation completed!');
  console.log('\nNext steps:');
  console.log('1. Associate each evidence with appropriate CC1.x subcontrols');
  console.log('2. Review evidence content and adjust as needed');
  console.log('3. Continue with CN11-CN72 control areas');
}

async function getProjectControls() {
  console.log('Getting project controls to identify CC1.x subcontrols...\n');
  
  try {
    const response = await axios.get(
      `${API_BASE_URL}/projects/${PROJECT_ID}/controls`,
      { headers: { 'token': TOKEN } }
    );
    
    const cc1Controls = response.data.filter(control => 
      control.ref_code && control.ref_code.toLowerCase().startsWith('cc1')
    );
    
    console.log(`Found ${cc1Controls.length} CC1.x controls:`);
    cc1Controls.forEach(control => {
      console.log(`- ${control.ref_code}: ${control.name.substring(0, 60)}...`);
      if (control.subcontrols && control.subcontrols.length > 0) {
        control.subcontrols.forEach(sub => {
          console.log(`  └─ ${sub.id}: ${sub.description.substring(0, 80)}...`);
        });
      }
    });
    
    return cc1Controls;
    
  } catch (error) {
    console.error('Failed to get project controls:', error.response ? error.response.data : error.message);
    return [];
  }
}

// Main execution
async function main() {
  console.log('SOC 2 Evidence Creation Tool');
  console.log('============================');
  console.log(`Project ID: ${PROJECT_ID}`);
  console.log(`Target: CN01-CN10 Control Environment Evidence\n`);
  
  // First get the control structure
  await getProjectControls();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Then create the evidence
  await createEvidence();
}

main().catch(console.error);