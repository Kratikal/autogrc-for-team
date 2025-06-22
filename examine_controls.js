#!/usr/bin/env node

/**
 * Control Structure Examination Tool
 * Examines all controls to understand the structure and find CC1.1 controls
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';
const PROJECT_ID = '9mphynhm';
const TOKEN = 'eyJhbGciOiJIUzUxMiIsImlhdCI6MTc1MDU2MjM5OCwiZXhwIjoxNzUwNjQ4Nzk4fQ.eyJpZCI6Imcyd3ZtcWFrIn0.JiBJ5NEXbaEXLglFODN2gcS2pFYWGnB3zF7kn4vjzHNFeIVWYlZtVC_mYpdjCao7nxo5L52SzAUZN1CIDm_ZSw';

async function examineControls() {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/projects/${PROJECT_ID}/controls`,
      { headers: { 'token': TOKEN } }
    );
    
    const controls = response.data;
    
    console.log('🔍 CONTROL STRUCTURE EXAMINATION');
    console.log('===============================');
    console.log(`Total controls found: ${controls.length}\n`);
    
    // Find CC1 related controls
    console.log('🎯 SEARCHING FOR CC1 CONTROLS:');
    console.log('==============================');
    
    const cc1Controls = [];
    
    controls.forEach((control, index) => {
      // Check various ways CC1 might be referenced
      const title = control.title || '';
      const name = control.name || '';
      const refCode = control.ref_code || '';
      const description = control.description || '';
      
      const isCC1 = title.includes('CC1') || 
                    name.includes('CC1') || 
                    refCode.includes('CC1') ||
                    description.includes('CC1') ||
                    title.toLowerCase().includes('control environment') ||
                    name.toLowerCase().includes('control environment') ||
                    description.toLowerCase().includes('control environment') ||
                    title.toLowerCase().includes('integrity') ||
                    name.toLowerCase().includes('integrity') ||
                    description.toLowerCase().includes('integrity');
      
      if (isCC1) {
        cc1Controls.push(control);
        console.log(`\n📍 FOUND CC1 CONTROL #${cc1Controls.length}:`);
        console.log(`ID: ${control.id}`);
        console.log(`Title: ${title}`);
        console.log(`Name: ${name}`);
        console.log(`Ref Code: ${refCode}`);
        console.log(`Description: ${description.substring(0, 100)}...`);
        
        if (control.subcontrols) {
          console.log(`Subcontrols: ${control.subcontrols.length}`);
          control.subcontrols.forEach((sub, subIndex) => {
            console.log(`  ${subIndex + 1}. ${sub.id} - ${sub.ref_code || 'No ref'} - ${sub.name || sub.description?.substring(0, 60) || 'No name'}...`);
          });
        } else {
          console.log('Subcontrols: None');
        }
        console.log('---');
      }
    });
    
    if (cc1Controls.length === 0) {
      console.log('❌ No CC1 controls found. Let me show first 10 controls to understand structure:\n');
      
      console.log('📋 FIRST 10 CONTROLS:');
      console.log('=====================');
      
      controls.slice(0, 10).forEach((control, index) => {
        console.log(`\n${index + 1}. ${control.id}`);
        console.log(`   Title: ${control.title || 'N/A'}`);
        console.log(`   Name: ${control.name || 'N/A'}`);
        console.log(`   Ref Code: ${control.ref_code || 'N/A'}`);
        console.log(`   Description: ${(control.description || 'N/A').substring(0, 80)}...`);
        console.log(`   Subcontrols: ${control.subcontrols ? control.subcontrols.length : 0}`);
      });
      
      // Also check for control environment keywords
      console.log('\n🔍 SEARCHING FOR CONTROL ENVIRONMENT KEYWORDS:');
      console.log('==============================================');
      
      const controlEnvControls = controls.filter(control => {
        const searchText = `${control.title || ''} ${control.name || ''} ${control.description || ''}`.toLowerCase();
        return searchText.includes('control environment') ||
               searchText.includes('governance') ||
               searchText.includes('ethical values') ||
               searchText.includes('integrity') ||
               searchText.includes('board oversight') ||
               searchText.includes('organizational structure') ||
               searchText.includes('authority') ||
               searchText.includes('responsibility');
      });
      
      console.log(`Found ${controlEnvControls.length} controls with Control Environment keywords:`);
      
      controlEnvControls.forEach((control, index) => {
        console.log(`\n${index + 1}. ${control.id}`);
        console.log(`   Title: ${control.title || 'N/A'}`);
        console.log(`   Name: ${control.name || 'N/A'}`);
        console.log(`   Ref Code: ${control.ref_code || 'N/A'}`);
        console.log(`   Subcontrols: ${control.subcontrols ? control.subcontrols.length : 0}`);
      });
    } else {
      console.log(`\n✅ Found ${cc1Controls.length} CC1 related controls!`);
      
      // Count total CC1 subcontrols
      const totalCC1Subcontrols = cc1Controls.reduce((sum, control) => {
        return sum + (control.subcontrols ? control.subcontrols.length : 0);
      }, 0);
      
      console.log(`Total CC1 subcontrols: ${totalCC1Subcontrols}`);
    }
    
  } catch (error) {
    console.error('Error examining controls:', error.response ? error.response.data : error.message);
  }
}

examineControls().catch(console.error);