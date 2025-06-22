// Simple test to verify subcontrol API endpoints
const axios = require('axios');
const fs = require('fs');

const API_BASE_URL = 'http://localhost:3000/api/v1';
const PROJECT_ID = '9mphynhm';

// Load authentication
let headers = { 'Content-Type': 'application/json' };
try {
    const cookies = fs.readFileSync('cookies.txt', 'utf8').trim();
    if (cookies) headers['Cookie'] = cookies;
} catch (error) {
    console.log('⚠️ No cookies.txt found');
}

async function testSubcontrolAPIs() {
    console.log('🧪 Testing Subcontrol API Endpoints');
    console.log('====================================');
    
    try {
        // 1. Test getting all controls first
        console.log('1. Getting project controls...');
        const controlsUrl = `${API_BASE_URL}/projects/${PROJECT_ID}/controls`;
        const controlsResponse = await axios.get(controlsUrl, { headers });
        
        if (controlsResponse.data && controlsResponse.data.length > 0) {
            const firstControl = controlsResponse.data[0];
            console.log(`✅ Found ${controlsResponse.data.length} controls`);
            console.log(`   First control: ${firstControl.id} - ${firstControl.name || 'No name'}`);
            
            if (firstControl.subcontrols && firstControl.subcontrols.length > 0) {
                const firstSubcontrol = firstControl.subcontrols[0];
                console.log(`   First subcontrol: ${firstSubcontrol.id} - ${firstSubcontrol.name || 'No name'}`);
                
                // 2. Test getting specific subcontrol
                console.log('\n2. Getting specific subcontrol...');
                const subcontrolUrl = `${API_BASE_URL}/projects/${PROJECT_ID}/subcontrols/${firstSubcontrol.id}`;
                const subcontrolResponse = await axios.get(subcontrolUrl, { headers });
                
                console.log('✅ Subcontrol details:');
                console.log(`   ID: ${subcontrolResponse.data.id}`);
                console.log(`   Name: ${subcontrolResponse.data.name}`);
                console.log(`   Implemented: ${subcontrolResponse.data.implemented || 0}%`);
                console.log(`   Owner: ${subcontrolResponse.data.owner || 'Not assigned'}`);
                console.log(`   Implementation Status: ${subcontrolResponse.data.implementation_status || 'Not set'}`);
                
                // 3. Test UPDATE endpoint
                console.log('\n3. Testing subcontrol update...');
                const updateUrl = `${API_BASE_URL}/project-controls/${firstControl.id}/subcontrols/${firstSubcontrol.id}`;
                
                const updatePayload = {
                    implemented: 25,
                    notes: "Test update from API script - " + new Date().toISOString(),
                    context: "API testing"
                };
                
                console.log('📤 Update payload:', JSON.stringify(updatePayload, null, 2));
                console.log('📍 Update URL:', updateUrl);
                
                const updateResponse = await axios.put(updateUrl, updatePayload, { headers });
                
                console.log('✅ Update successful!');
                console.log(`   Implemented: ${updateResponse.data.implemented}%`);
                console.log(`   Notes: ${updateResponse.data.notes}`);
                console.log(`   Context: ${updateResponse.data.context}`);
                
                // 4. Verify the update
                console.log('\n4. Verifying update...');
                const verifyResponse = await axios.get(subcontrolUrl, { headers });
                
                console.log('✅ Verification:');
                console.log(`   Implemented: ${verifyResponse.data.implemented}%`);
                console.log(`   Notes: ${verifyResponse.data.notes}`);
                
            } else {
                console.log('❌ No subcontrols found in first control');
            }
        } else {
            console.log('❌ No controls found');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
        }
    }
}

// API Endpoint Summary
function showAPIEndpoints() {
    console.log('\n📚 Subcontrol API Endpoints Summary');
    console.log('=====================================');
    console.log('GET    /projects/{pid}/subcontrols/{sid}                    - Get specific subcontrol');
    console.log('PUT    /project-controls/{cid}/subcontrols/{sid}            - Update subcontrol');
    console.log('PUT    /projects/{pid}/subcontrols/{sid}/notes              - Update notes');
    console.log('PUT    /projects/{pid}/subcontrols/{sid}/auditor-notes      - Update auditor notes');
    console.log('PUT    /projects/{pid}/subcontrols/{sid}/context            - Update context');
    console.log('POST   /projects/{pid}/subcontrols/{sid}/comments           - Add comment');
    console.log('POST   /projects/{pid}/subcontrols/{sid}/evidence           - Add evidence');
    console.log('PUT    /subcontrols/{sid}/associate-evidence                - Associate evidence');
    console.log('\nUpdate Fields Available:');
    console.log('• implemented: 0-100 (percentage)');
    console.log('• applicable: true/false');
    console.log('• notes: string');
    console.log('• context: string');
    console.log('• owner-id: user ID string');
    console.log('• evidence: array of evidence IDs');
}

if (require.main === module) {
    testSubcontrolAPIs()
        .then(() => showAPIEndpoints())
        .catch(console.error);
}