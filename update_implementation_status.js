// Correct API demo for updating Implementation Status and Owner
// Implementation Status is derived from the 'implemented' percentage field

const axios = require('axios');
const fs = require('fs');

const CONFIG = {
    API_BASE_URL: 'http://localhost:3000/api/v1',
    PROJECT_ID: '9mphynhm',
    // Use any valid subcontrol and control IDs from your project
    EXAMPLE_SUBCONTROL_ID: 'pvns3jj2',
    EXAMPLE_CONTROL_ID: 'l73x5nqz',
};

// Implementation Status mapping (from app/utils/mixin_models.py line 372-379)
const IMPLEMENTATION_STATUS = {
    NOT_IMPLEMENTED: { implemented: 0, status: "not implemented" },
    PARTIALLY_IMPLEMENTED: { implemented: 50, status: "partially implemented" }, // 1-99
    FULLY_IMPLEMENTED: { implemented: 100, status: "fully implemented" },
    // Note: "not applicable" is set via applicable: false
};

let headers = { 'Content-Type': 'application/json' };

async function demonstrateImplementationStatusUpdate() {
    console.log('🎯 Implementation Status & Owner Update Demo');
    console.log('=============================================');
    console.log(`Project: ${CONFIG.PROJECT_ID}`);
    console.log('');
    
    console.log('📋 Implementation Status Mapping:');
    console.log('   • "not implemented"      = implemented: 0');
    console.log('   • "partially implemented" = implemented: 1-99');
    console.log('   • "fully implemented"     = implemented: 100');
    console.log('   • "not applicable"        = applicable: false');
    console.log('');

    try {
        // API endpoint for updating subcontrol
        const updateUrl = `${CONFIG.API_BASE_URL}/project-controls/${CONFIG.EXAMPLE_CONTROL_ID}/subcontrols/${CONFIG.EXAMPLE_SUBCONTROL_ID}`;
        console.log(`🔗 API Endpoint: ${updateUrl}`);
        console.log('');

        // 1. Set to "not implemented"
        console.log('1️⃣ Setting status to "not implemented"...');
        await updateImplementationStatus(updateUrl, {
            implemented: IMPLEMENTATION_STATUS.NOT_IMPLEMENTED.implemented,
            notes: "Status set to not implemented via API",
            context: "Testing implementation status updates - " + new Date().toISOString()
        });

        // 2. Set to "partially implemented"
        console.log('2️⃣ Setting status to "partially implemented"...');
        await updateImplementationStatus(updateUrl, {
            implemented: IMPLEMENTATION_STATUS.PARTIALLY_IMPLEMENTED.implemented,
            notes: "Status set to partially implemented via API",
            context: "50% implementation progress recorded"
        });

        // 3. Set to "fully implemented"
        console.log('3️⃣ Setting status to "fully implemented"...');
        await updateImplementationStatus(updateUrl, {
            implemented: IMPLEMENTATION_STATUS.FULLY_IMPLEMENTED.implemented,
            notes: "Status set to fully implemented via API",
            context: "Implementation completed successfully"
        });

        // 4. Update owner (requires valid user ID)
        console.log('4️⃣ Updating subcontrol owner...');
        await updateSubcontrolOwner(updateUrl);

        // 5. Make it not applicable
        console.log('5️⃣ Setting to "not applicable"...');
        await updateImplementationStatus(updateUrl, {
            applicable: false,
            notes: "Control marked as not applicable to this organization",
            context: "Not applicable based on business requirements"
        });

        // 6. Reset to applicable and partially implemented
        console.log('6️⃣ Resetting to applicable and partially implemented...');
        await updateImplementationStatus(updateUrl, {
            applicable: true,
            implemented: 75,
            notes: "Reset to applicable with 75% implementation progress",
            context: "Final demo state"
        });

        console.log('✅ All implementation status updates completed successfully!');

    } catch (error) {
        console.error('❌ Demo error:', error.message);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            if (error.response.data) {
                console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
            }
        }
    }
}

async function updateImplementationStatus(url, payload) {
    try {
        console.log('📤 Payload:', JSON.stringify(payload, null, 2));
        
        const response = await axios.put(url, payload, { headers });
        
        const result = response.data;
        console.log('✅ Update successful:');
        console.log(`   Implementation Status: "${result.implementation_status}"`);
        console.log(`   Implemented: ${result.implemented}%`);
        console.log(`   Applicable: ${result.is_applicable}`);
        console.log(`   Owner: ${result.owner || 'Not assigned'}`);
        console.log(`   Notes: ${result.notes}`);
        console.log('');
        
        return result;
    } catch (error) {
        console.error('❌ Update failed:', error.message);
        throw error;
    }
}

async function updateSubcontrolOwner(url) {
    try {
        // Try to get a valid user ID for owner assignment
        const usersUrl = `${CONFIG.API_BASE_URL}/users`;
        const usersResponse = await axios.get(usersUrl, { headers });
        
        if (usersResponse.data && usersResponse.data.length > 0) {
            const userId = usersResponse.data[0].id;
            const userEmail = usersResponse.data[0].email;
            
            console.log(`   Found user: ${userEmail} (${userId})`);
            
            const ownerPayload = {
                "owner-id": userId,
                notes: `Owner assigned to ${userEmail} via API demo`
            };
            
            const result = await updateImplementationStatus(url, ownerPayload);
            console.log(`   Owner successfully assigned to: ${result.owner}`);
        } else {
            console.log('   No users found for owner assignment');
        }
    } catch (error) {
        console.log('   Could not assign owner:', error.message);
    }
}

// MCP Integration Example
function showMCPIntegration() {
    console.log('');
    console.log('🔧 MCP Tool Integration for Implementation Status');
    console.log('================================================');
    console.log('');
    console.log('Available MCP tool: grc_update_subcontrol_status');
    console.log('Parameters: subcontrol_id, status, notes');
    console.log('');
    console.log('Example MCP usage:');
    
    const mcpExamples = [
        {
            description: "Set to not implemented",
            payload: {
                subcontrol_id: CONFIG.EXAMPLE_SUBCONTROL_ID,
                status: "not_implemented", // Note: Check MCP server for exact status values
                notes: "Not implemented - requires immediate attention"
            }
        },
        {
            description: "Set to fully implemented", 
            payload: {
                subcontrol_id: CONFIG.EXAMPLE_SUBCONTROL_ID,
                status: "implemented",
                notes: "Fully implemented with all required controls in place"
            }
        }
    ];

    mcpExamples.forEach((example, index) => {
        console.log(`${index + 1}. ${example.description}:`);
        console.log(JSON.stringify(example.payload, null, 2));
        console.log('');
    });
}

// API Reference Summary
function showAPIReference() {
    console.log('📚 API Reference - Implementation Status Updates');
    console.log('================================================');
    console.log('');
    console.log('Endpoint: PUT /project-controls/{control_id}/subcontrols/{subcontrol_id}');
    console.log('');
    console.log('Request Body Fields:');
    console.log('  implemented: 0-100     // Sets implementation percentage');
    console.log('                         // 0="not implemented", 1-99="partially implemented", 100="fully implemented"');
    console.log('  applicable: true/false // Sets if control is applicable (false="not applicable")');
    console.log('  owner-id: "user_id"    // Assigns owner by user ID');
    console.log('  notes: "string"        // Implementation notes');
    console.log('  context: "string"      // Additional context');
    console.log('');
    console.log('Response includes:');
    console.log('  implementation_status  // Computed status string');
    console.log('  implemented           // Percentage value');
    console.log('  is_applicable        // Applicability boolean'); 
    console.log('  owner               // Owner email/name');
    console.log('  owner_id           // Owner user ID');
}

// Run demo
if (require.main === module) {
    demonstrateImplementationStatusUpdate()
        .then(() => showMCPIntegration())
        .then(() => showAPIReference())
        .catch(console.error);
}

module.exports = {
    demonstrateImplementationStatusUpdate,
    updateImplementationStatus,
    IMPLEMENTATION_STATUS,
    CONFIG
};