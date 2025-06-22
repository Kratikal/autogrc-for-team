// Bulk update all subcontrols to "fully implemented" status
// Sets implemented: 100 for all applicable subcontrols in the project

const axios = require('axios');
const fs = require('fs');

const CONFIG = {
    API_BASE_URL: 'http://localhost:3000/api/v1',
    PROJECT_ID: '9mphynhm',
    BATCH_SIZE: 5, // Process 5 at a time to avoid overwhelming the server
    DELAY_MS: 1000, // 1 second delay between batches
};

let headers = { 'Content-Type': 'application/json' };

// Load authentication if available
try {
    const cookieContent = fs.readFileSync('cookies.txt', 'utf8');
    // Extract just the session cookie value, clean up any formatting issues
    const lines = cookieContent.split('\n');
    for (const line of lines) {
        if (line.includes('session') && line.includes('.eJ')) {
            const parts = line.split('\t');
            if (parts.length >= 7) {
                const cookieValue = parts[6];
                headers['Cookie'] = `session=${cookieValue}`;
                console.log('✅ Authentication cookie loaded');
                break;
            }
        }
    }
} catch (error) {
    console.log('⚠️ No authentication cookies found - requests may fail');
}

async function getAllSubcontrols() {
    console.log('📋 Fetching all controls and subcontrols...');
    
    try {
        const controlsUrl = `${CONFIG.API_BASE_URL}/projects/${CONFIG.PROJECT_ID}/controls?stats=yes`;
        const response = await axios.get(controlsUrl, { headers });
        
        const allSubcontrols = [];
        let totalControls = 0;
        let totalSubcontrols = 0;
        
        for (const control of response.data) {
            totalControls++;
            if (control.subcontrols && control.subcontrols.length > 0) {
                for (const subcontrol of control.subcontrols) {
                    if (subcontrol.is_applicable !== false) { // Only update applicable ones
                        allSubcontrols.push({
                            controlId: control.id,
                            controlName: control.name || control.ref_code,
                            subcontrolId: subcontrol.id,
                            subcontrolName: subcontrol.name,
                            currentImplemented: subcontrol.implemented || 0,
                            currentStatus: subcontrol.implementation_status || 'unknown'
                        });
                    }
                    totalSubcontrols++;
                }
            }
        }
        
        console.log(`✅ Found ${totalControls} controls with ${totalSubcontrols} total subcontrols`);
        console.log(`🎯 ${allSubcontrols.length} applicable subcontrols will be updated`);
        
        return allSubcontrols;
        
    } catch (error) {
        console.error('❌ Failed to fetch controls:', error.message);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
        }
        throw error;
    }
}

async function updateSubcontrolToFullyImplemented(subcontrol) {
    const updateUrl = `${CONFIG.API_BASE_URL}/project-controls/${subcontrol.controlId}/subcontrols/${subcontrol.subcontrolId}`;
    
    const payload = {
        implemented: 100, // Set to fully implemented
        notes: `Bulk update to fully implemented - ${new Date().toISOString()}`,
        context: "Bulk implementation status update via API script"
    };
    
    try {
        const response = await axios.put(updateUrl, payload, { headers });
        return {
            success: true,
            subcontrol: subcontrol,
            result: response.data
        };
    } catch (error) {
        return {
            success: false,
            subcontrol: subcontrol,
            error: error.message,
            status: error.response?.status
        };
    }
}

async function bulkUpdateAllControls() {
    console.log('🚀 Bulk Update All Controls to Fully Implemented');
    console.log('=================================================');
    console.log(`Project: ${CONFIG.PROJECT_ID}`);
    console.log(`API Base: ${CONFIG.API_BASE_URL}`);
    console.log('');
    
    try {
        // 1. Get all subcontrols
        const subcontrols = await getAllSubcontrols();
        
        if (subcontrols.length === 0) {
            console.log('ℹ️ No applicable subcontrols found to update');
            return;
        }
        
        // 2. Show summary before starting
        console.log('📊 Current Status Summary:');
        const statusCounts = {};
        subcontrols.forEach(sc => {
            const status = sc.currentStatus;
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`   ${status}: ${count} subcontrols`);
        });
        console.log('');
        
        // 3. Confirm before proceeding
        console.log(`⚠️  About to update ${subcontrols.length} subcontrols to "fully implemented"`);
        console.log('   This will set implemented: 100 for all applicable subcontrols');
        console.log('');
        
        // 4. Process in batches
        console.log('🔄 Starting bulk update process...');
        const results = {
            success: [],
            failed: [],
            total: subcontrols.length
        };
        
        for (let i = 0; i < subcontrols.length; i += CONFIG.BATCH_SIZE) {
            const batch = subcontrols.slice(i, i + CONFIG.BATCH_SIZE);
            const batchNumber = Math.floor(i / CONFIG.BATCH_SIZE) + 1;
            const totalBatches = Math.ceil(subcontrols.length / CONFIG.BATCH_SIZE);
            
            console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} items)...`);
            
            // Process batch concurrently
            const batchPromises = batch.map(subcontrol => 
                updateSubcontrolToFullyImplemented(subcontrol)
            );
            
            const batchResults = await Promise.all(batchPromises);
            
            // Categorize results
            batchResults.forEach(result => {
                if (result.success) {
                    results.success.push(result);
                    console.log(`   ✅ ${result.subcontrol.subcontrolName} → fully implemented`);
                } else {
                    results.failed.push(result);
                    console.log(`   ❌ ${result.subcontrol.subcontrolName} → failed (${result.error})`);
                }
            });
            
            // Delay between batches to avoid overwhelming the server
            if (i + CONFIG.BATCH_SIZE < subcontrols.length) {
                console.log(`   ⏱️  Waiting ${CONFIG.DELAY_MS}ms before next batch...`);
                await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_MS));
            }
        }
        
        // 5. Final summary
        console.log('');
        console.log('📈 Bulk Update Complete!');
        console.log('========================');
        console.log(`✅ Successfully updated: ${results.success.length}/${results.total}`);
        console.log(`❌ Failed updates: ${results.failed.length}/${results.total}`);
        
        if (results.failed.length > 0) {
            console.log('');
            console.log('❌ Failed Updates:');
            results.failed.forEach(failure => {
                console.log(`   • ${failure.subcontrol.subcontrolName}: ${failure.error}`);
            });
        }
        
        // 6. Verification
        if (results.success.length > 0) {
            console.log('');
            console.log('🔍 Verifying a few random updates...');
            const samplesToVerify = Math.min(3, results.success.length);
            
            for (let i = 0; i < samplesToVerify; i++) {
                const randomIndex = Math.floor(Math.random() * results.success.length);
                const sample = results.success[randomIndex];
                
                try {
                    const verifyUrl = `${CONFIG.API_BASE_URL}/projects/${CONFIG.PROJECT_ID}/subcontrols/${sample.subcontrol.subcontrolId}`;
                    const verifyResponse = await axios.get(verifyUrl, { headers });
                    
                    console.log(`   ✅ ${sample.subcontrol.subcontrolName}:`);
                    console.log(`      Status: "${verifyResponse.data.implementation_status}"`);
                    console.log(`      Implemented: ${verifyResponse.data.implemented}%`);
                } catch (error) {
                    console.log(`   ⚠️ Could not verify ${sample.subcontrol.subcontrolName}`);
                }
            }
        }
        
        return results;
        
    } catch (error) {
        console.error('❌ Bulk update failed:', error.message);
        throw error;
    }
}

// Dry run function to preview what would be updated
async function dryRun() {
    console.log('🧪 DRY RUN - Preview of bulk update');
    console.log('===================================');
    
    try {
        const subcontrols = await getAllSubcontrols();
        
        console.log('📋 Subcontrols that would be updated:');
        subcontrols.slice(0, 10).forEach((sc, index) => {
            console.log(`${index + 1}. ${sc.controlName} → ${sc.subcontrolName}`);
            console.log(`   Current: ${sc.currentStatus} (${sc.currentImplemented}%)`);
            console.log(`   Will become: fully implemented (100%)`);
            console.log('');
        });
        
        if (subcontrols.length > 10) {
            console.log(`... and ${subcontrols.length - 10} more subcontrols`);
        }
        
        console.log('To run the actual update, call bulkUpdateAllControls()');
        
    } catch (error) {
        console.error('❌ Dry run failed:', error.message);
    }
}

// Command line interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--dry-run') || args.includes('-d')) {
        dryRun().catch(console.error);
    } else if (args.includes('--help') || args.includes('-h')) {
        console.log('Bulk Update Controls to Fully Implemented');
        console.log('========================================');
        console.log('');
        console.log('Usage:');
        console.log('  node bulk_update_controls_fully_implemented.js       # Run bulk update');
        console.log('  node bulk_update_controls_fully_implemented.js -d    # Dry run (preview only)');
        console.log('  node bulk_update_controls_fully_implemented.js -h    # Show help');
        console.log('');
        console.log('This script will:');
        console.log('• Fetch all applicable subcontrols from the project');
        console.log('• Update each one to "fully implemented" (implemented: 100)');
        console.log('• Process in batches to avoid server overload');
        console.log('• Provide detailed progress and error reporting');
    } else {
        console.log('⚠️  WARNING: This will update ALL applicable subcontrols to "fully implemented"');
        console.log('   Use --dry-run first to preview the changes');
        console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...');
        console.log('');
        
        setTimeout(() => {
            bulkUpdateAllControls().catch(console.error);
        }, 5000);
    }
}

module.exports = {
    bulkUpdateAllControls,
    getAllSubcontrols,
    updateSubcontrolToFullyImplemented,
    dryRun,
    CONFIG
};