const fs = require('fs');
const path = require('path');
const AdmZip = require(path.join(__dirname, '..', 'backend', 'node_modules', 'adm-zip'));

const docsDir = path.join(__dirname, '..', 'docs');
const files = [
    'ORDENES GENERAL MIERCOLES 17.xlsx',
    'ORDENES MIERCOLES 17.xlsx'
];

files.forEach(fileName => {
    const filePath = path.join(docsDir, fileName);
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }

    console.log(`\n==================================================`);
    console.log(`INSPECTION OF: ${fileName}`);
    console.log(`==================================================`);

    const zip = new AdmZip(filePath);
    
    // 1. Read workbook.xml for sheet names
    const workbookEntry = zip.getEntry('xl/workbook.xml');
    if (!workbookEntry) {
        console.log('Not a valid xlsx file (missing workbook.xml)');
        return;
    }
    const workbookXml = zip.readAsText(workbookEntry);
    const sheetMatches = workbookXml.match(/<sheet[^>]+name="([^"]+)"[^>]+sheetId="([^"]+)"/g) || [];
    console.log('Sheets found:');
    sheetMatches.forEach(s => {
        const name = s.match(/name="([^"]+)"/)[1];
        const id = s.match(/sheetId="([^"]+)"/)[1];
        console.log(` - ID: ${id}, Name: ${name}`);
    });

    // 2. Read shared strings
    const sharedStringsEntry = zip.getEntry('xl/sharedStrings.xml');
    let sharedStrings = [];
    if (sharedStringsEntry) {
        const xml = zip.readAsText(sharedStringsEntry);
        // Extract all <t>...</t> content
        const tMatches = xml.match(/<t[^>]*>([\s\S]*?)<\/t>/g) || [];
        sharedStrings = tMatches.map(t => t.replace(/<[^>]*>/g, ''));
    }
    console.log(`Shared strings count: ${sharedStrings.length}`);

    // 3. Read sheet1.xml (let's look at some rows/cells)
    const sheet1Entry = zip.getEntry('xl/worksheets/sheet1.xml');
    if (sheet1Entry) {
        const xml = zip.readAsText(sheet1Entry);
        // Let's parse rows and cells
        const rows = xml.match(/<row[^>]*>([\s\S]*?)<\/row>/g) || [];
        console.log(`Rows count in Sheet 1: ${rows.length}`);
        
        // Print the first 25 rows
        console.log('\nSample Rows (First 25):');
        rows.slice(0, 25).forEach(row => {
            const rAttr = row.match(/r="(\d+)"/);
            const rowNum = rAttr ? rAttr[1] : '?';
            const cells = row.match(/<c[^>]*>([\s\S]*?)<\/c>/g) || [];
            
            const cellVals = cells.map(cell => {
                const r = cell.match(/r="([A-Z]+\d+)"/)[1];
                const t = cell.match(/t="([^"]+)"/);
                const vMatch = cell.match(/<v>([^<]+)<\/v>/);
                let val = '';
                if (vMatch) {
                    const rawVal = vMatch[1];
                    if (t && t[1] === 's') {
                        val = sharedStrings[parseInt(rawVal)] || '';
                    } else {
                        val = rawVal;
                    }
                }
                return `${r}: "${val}"`;
            });
            console.log(`Row ${rowNum}: ${cellVals.join(' | ')}`);
        });
    }
});
