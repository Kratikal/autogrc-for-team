const axios = require('axios');
const fs = require('fs');

const headers = { 'Content-Type': 'application/json' };
const cookieContent = fs.readFileSync('cookies.txt', 'utf8');
const lines = cookieContent.split('\n');
for (const line of lines) {
    if (line.includes('session') && line.includes('.eJ')) {
        const parts = line.split('\t');
        if (parts.length >= 7) {
            headers['Cookie'] = `session=${parts[6]}`;
            break;
        }
    }
}

(async () => {
    const response = await axios.get('http://localhost:3000/api/v1/projects/9mphynhm/controls', { headers });
    const controls = response.data;
    
    let total = 0, fullyImplemented = 0, partiallyImplemented = 0, notImplemented = 0;
    
    controls.forEach(control => {
        if (control.subcontrols) {
            control.subcontrols.forEach(sc => {
                if (sc.is_applicable !== false) {
                    total++;
                    if (sc.implemented === 100) fullyImplemented++;
                    else if (sc.implemented > 0) partiallyImplemented++;
                    else notImplemented++;
                }
            });
        }
    });
    
    console.log('📊 Current Implementation Status:');
    console.log(`   Total applicable subcontrols: ${total}`);
    console.log(`   Fully implemented (100%): ${fullyImplemented}`);
    console.log(`   Partially implemented (1-99%): ${partiallyImplemented}`);
    console.log(`   Not implemented (0%): ${notImplemented}`);
    console.log(`   Success rate: ${Math.round(fullyImplemented/total*100)}%`);
})().catch(console.error);