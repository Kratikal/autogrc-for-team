// Clear localStorage data for SOC2 controls to fix quota exceeded error
// Run this in browser console: node clear_localStorage.js

console.log("🧹 Clearing localStorage controls data...");

// Clear specific controls data
const projectId = '9mphynhm';
const controlsKey = `${projectId}_controls`;

if (typeof window !== 'undefined' && window.localStorage) {
    // Browser environment
    console.log(`Removing key: ${controlsKey}`);
    localStorage.removeItem(controlsKey);
    
    // Optional: Clear all localStorage if needed
    // localStorage.clear();
    
    console.log("✅ localStorage controls data cleared successfully!");
    console.log("Current localStorage usage:", JSON.stringify(localStorage).length, "characters");
} else {
    console.log("❌ localStorage not available - run this in browser console");
}

// Instructions for manual cleanup
console.log(`
📋 Manual Cleanup Instructions:
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Run: localStorage.removeItem('${controlsKey}')
4. Or clear all: localStorage.clear()
5. Refresh the page

The application will now fetch controls from the server each time instead of caching them.
`);