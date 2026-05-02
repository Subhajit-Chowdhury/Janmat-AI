const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    if (filePath.includes('node_modules') || filePath.includes('.git')) return;
    
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
        const files = fs.readdirSync(filePath);
        for (const file of files) {
            replaceInFile(path.join(filePath, file));
        }
    } else {
        const ext = path.extname(filePath);
        if (!['.md', '.js', '.html', '.css', '.json'].includes(ext)) return;
        
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = content
            .replace(/Janmat-AI/g, 'Elect-AI')
            .replace(/JanMat AI/g, 'Elect AI')
            .replace(/Janmat AI/g, 'Elect AI')
            .replace(/janmat-ai/g, 'elect-ai')
            .replace(/JanMat/g, 'ElectAI')
            .replace(/Janmat/g, 'ElectAI')
            .replace(/janmat_settings/g, 'elect_settings')
            .replace(/janmat/g, 'elect')
            .replace(/askJanMat/g, 'askElectAI')
            .replace(/जनमत/g, 'इलेक्ट');

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log('Updated:', filePath);
        }
    }
}

replaceInFile(__dirname);
