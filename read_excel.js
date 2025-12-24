import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const fileName = '2_1_2d25_smc (3).xls';
const filePath = path.resolve(fileName);

if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
}

console.log(`Reading file: ${fileName}`);
const workbook = XLSX.readFile(filePath);

console.log('Sheets found:', workbook.SheetNames.join(', '));

workbook.SheetNames.forEach(sheetName => {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const worksheet = workbook.Sheets[sheetName];
    // Convert to JSON to inspect data
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // header: 1 gives array of arrays

    // Print first 10 rows as preview
    jsonData.slice(0, 10).forEach((row, index) => {
        console.log(`Row ${index}:`, row);
    });

    if (jsonData.length > 10) {
        console.log(`... and ${jsonData.length - 10} more rows.`);
    }
});
