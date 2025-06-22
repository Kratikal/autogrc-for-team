// Demo script for updating subcontrol Implementation Progress and Owner
// Uses existing API endpoints found in app/api_v1/views.py lines 852-866

const axios = require('axios');
const fs = require('fs');

// Configuration
const CONFIG = {
    API_BASE_URL: 'http://localhost:3000/api/v1',
    PROJECT_ID: '9mphynhm',
    // Example subcontrol from previous test data
    EXAMPLE_SUBCONTROL_ID: 'pvns3jj2', // "Sets the Tone at the Top"
    EXAMPLE_CONTROL_ID: 'l73x5nqz', // Parent control CC1.1
};

// Load authentication cookie
let cookieHeader = '';
try {
    const cookies = fs.readFileSync('cookies.txt', 'utf8');
    cookieHeader = cookies.trim().replace(/[\r\n]/g, '');
} catch (error) {
    console.log('⚠️ Warning: Could not load cookies.txt. Authentication may fail.');
}

const headers = {
    'Content-Type': 'application/json',
};

// Only add cookie if it exists and is valid
if (cookieHeader && cookieHeader.length > 0) {
    headers['Cookie'] = cookieHeader;
}

async function demonstrateSubcontrolUpdates() {
    console.log('🎯 Subcontrol Update Demo');
    console.log('=========================');
    console.log(`Project: ${CONFIG.PROJECT_ID}`);
    console.log(`API Base: ${CONFIG.API_BASE_URL}`);
    console.log('');

    try {
        // 1. First, get current subcontrol data
        console.log('1️⃣ Getting current subcontrol data...');
        const getUrl = `${CONFIG.API_BASE_URL}/projects/${CONFIG.PROJECT_ID}/subcontrols/${CONFIG.EXAMPLE_SUBCONTROL_ID}`;
        const currentData = await axios.get(getUrl, { headers });
        
        console.log('📋 Current Subcontrol Data:');
        console.log(`   Name: ${currentData.data.name}`);
        console.log(`   Implementation Status: ${currentData.data.implementation_status}`);
        console.log(`   Implemented: ${currentData.data.implemented}`);
        console.log(`   Owner ID: ${currentData.data.owner_id || 'Not set'}`);
        console.log(`   Owner: ${currentData.data.owner || 'Not set'}`);
        console.log(`   Is Applicable: ${currentData.data.is_applicable}`);
        console.log('');

        // 2. Update Implementation Progress
        console.log('2️⃣ Updating Implementation Progress...');
        const updateUrl = `${CONFIG.API_BASE_URL}/project-controls/${CONFIG.EXAMPLE_CONTROL_ID}/subcontrols/${CONFIG.EXAMPLE_SUBCONTROL_ID}`;
        
        const updatePayload = {
            implemented: 75, // Set to 75% implemented
            notes: "Updated implementation progress via API demo",
            context: "Implementation progress updated on " + new Date().toISOString()
        };

        console.log('📤 Sending update payload:');
        console.log(JSON.stringify(updatePayload, null, 2));

        const updateResponse = await axios.put(updateUrl, updatePayload, { headers });
        
        console.log('✅ Implementation Progress Update Response:');
        console.log(`   Implemented: ${updateResponse.data.implemented}%`);
        console.log(`   Notes: ${updateResponse.data.notes}`);
        console.log(`   Context: ${updateResponse.data.context}`);
        console.log('');

        // 3. Update Owner (if we have a user ID)
        console.log('3️⃣ Updating Subcontrol Owner...');
        
        // First get users to find a valid owner ID
        const usersUrl = `${CONFIG.API_BASE_URL}/users`;
        let validOwnerId = null;
        
        try {
            const usersResponse = await axios.get(usersUrl, { headers });
            if (usersResponse.data && usersResponse.data.length > 0) {
                validOwnerId = usersResponse.data[0].id;
                console.log(`   Found valid owner ID: ${validOwnerId}`);
            }
        } catch (error) {
            console.log('   Could not fetch users for owner assignment');
        }

        if (validOwnerId) {
            const ownerUpdatePayload = {
                "owner-id": validOwnerId,
                notes: "Owner assigned via API demo"
            };

            console.log('📤 Sending owner update payload:');
            console.log(JSON.stringify(ownerUpdatePayload, null, 2));

            const ownerUpdateResponse = await axios.put(updateUrl, ownerUpdatePayload, { headers });
            
            console.log('✅ Owner Update Response:');
            console.log(`   Owner ID: ${ownerUpdateResponse.data.owner_id}`);
            console.log(`   Owner: ${ownerUpdateResponse.data.owner}`);
        } else {
            console.log('⚠️ Skipping owner update - no valid user ID found');
        }
        console.log('');

        // 4. Get updated subcontrol data to verify changes
        console.log('4️⃣ Verifying updates...');
        const verifyResponse = await axios.get(getUrl, { headers });
        
        console.log('📋 Updated Subcontrol Data:');
        console.log(`   Name: ${verifyResponse.data.name}`);
        console.log(`   Implementation Status: ${verifyResponse.data.implementation_status}`);
        console.log(`   Implemented: ${verifyResponse.data.implemented}%`);
        console.log(`   Owner ID: ${verifyResponse.data.owner_id || 'Not set'}`);
        console.log(`   Owner: ${verifyResponse.data.owner || 'Not set'}`);
        console.log(`   Notes: ${verifyResponse.data.notes}`);
        console.log(`   Context: ${verifyResponse.data.context}`);
        console.log('');

        // 5. Demonstrate batch update for multiple fields
        console.log('5️⃣ Demonstrating comprehensive update...');
        const comprehensivePayload = {
            implemented: 50,
            applicable: true,
            notes: "Comprehensive update: Implementation reset to 50%, marked as applicable",
            context: "Full subcontrol review completed on " + new Date().toISOString(),
            "owner-id": validOwnerId
        };

        const comprehensiveResponse = await axios.put(updateUrl, comprehensivePayload, { headers });
        
        console.log('✅ Comprehensive Update Complete:');
        console.log(`   Implemented: ${comprehensiveResponse.data.implemented}%`);
        console.log(`   Applicable: ${comprehensiveResponse.data.is_applicable}`);
        console.log(`   Owner: ${comprehensiveResponse.data.owner || 'Not set'}`);
        console.log(`   Notes: ${comprehensiveResponse.data.notes}`);

        console.log('');
        console.log('🎉 Subcontrol update demo completed successfully!');
        
        // Summary of available fields
        console.log('');
        console.log('📚 Available Update Fields:');
        console.log('   • implemented: Integer (0-100) - Implementation progress percentage');
        console.log('   • applicable: Boolean - Whether subcontrol is applicable');
        console.log('   • notes: String - Implementation notes');
        console.log('   • context: String - Additional context information');
        console.log('   • owner-id: String - User ID of the owner');
        console.log('   • evidence: Array - Evidence associations');

    } catch (error) {
        console.error('❌ Error during subcontrol update demo:');
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Message: ${JSON.stringify(error.response.data, null, 2)}`);
        } else {
            console.error(`   Error: ${error.message}`);
        }
    }
}

// MCP Tool Integration Example
async function demonstrateMCPIntegration() {
    console.log('');
    console.log('🔧 MCP Tool Integration');
    console.log('========================');
    
    console.log('Available MCP tools for subcontrol updates:');
    console.log('');
    console.log('1. grc_update_subcontrol_status');
    console.log('   - Updates subcontrol completion status');
    console.log('   - Parameters: subcontrol_id, status, notes');
    console.log('');
    console.log('2. grc_associate_evidence_with_subcontrol');
    console.log('   - Associates evidence with subcontrols');
    console.log('   - Parameters: subcontrol_id, evidence_ids');
    console.log('');
    console.log('Example MCP usage:');
    console.log(`
// Update subcontrol status via MCP
const mcpUpdateExample = {
    tool: 'grc_update_subcontrol_status',
    arguments: {
        subcontrol_id: '${CONFIG.EXAMPLE_SUBCONTROL_ID}',
        status: 'completed',
        notes: 'Implementation completed via MCP tool'
    }
};
    `);
}

// Run the demo
if (require.main === module) {
    demonstrateSubcontrolUpdates()
        .then(() => demonstrateMCPIntegration())
        .catch(console.error);
}

module.exports = {
    demonstrateSubcontrolUpdates,
    demonstrateMCPIntegration,
    CONFIG
};