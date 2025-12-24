import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXCEL_FILE = '2_1_2d25_smc (3).xls';
const HISTORY_FILE = path.join(__dirname, 'historia.json');

const RATES_TO_EXTRACT = ['USD', 'EUR', 'CNY', 'TRY', 'RUB'];
const RATE_KEYS = {
    'USD': 'tasaUSD',
    'EUR': 'tasaEUR',
    'CNY': 'tasaYUAN',
    'TRY': 'tasaLIRA',
    'RUB': 'tasaRUBLO'
};

const MESES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

function run() {
    console.log(`Reading Excel file: ${EXCEL_FILE}`);
    if (!fs.existsSync(EXCEL_FILE)) {
        console.error('Excel file not found!');
        return;
    }

    const workbook = XLSX.readFile(EXCEL_FILE);
    let history = {};

    if (fs.existsSync(HISTORY_FILE)) {
        try {
            history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
        } catch (e) {
            console.error('Error reading existing history file, starting fresh.');
        }
    }

    workbook.SheetNames.forEach(sheetName => {
        const ws = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // Extract Date
        // Usually in Row 4 (index 4), Column 2 (index 2) -> "Fecha Valor: DD/MM/YYYY"
        let dateStr = '';
        if (data[4] && data[4][2] && typeof data[4][2] === 'string' && data[4][2].includes('Fecha Valor:')) {
            dateStr = data[4][2].replace('Fecha Valor:', '').trim();
        }

        if (!dateStr) {
            console.warn(`Could not find date for sheet ${sheetName}, skipping.`);
            return;
        }

        // Parse Date: DD/MM/YYYY
        const [day, month, year] = dateStr.split('/');
        if (!day || !month || !year) {
            console.warn(`Invalid date format ${dateStr} in sheet ${sheetName}`);
            return;
        }

        const monthIndex = parseInt(month, 10) - 1;
        if (monthIndex < 0 || monthIndex > 11) {
            console.warn(`Invalid month ${month} in sheet ${sheetName}`);
            return;
        }
        const monthName = MESES[monthIndex];

        // Prepare structure
        if (!history[year]) history[year] = {};
        if (!history[year][monthName]) history[year][monthName] = {};

        // Extract Rates
        let dailyRates = {
            fecha_actualizacion: new Date(`${year}-${month}-${day}`).toISOString()
        };

        let foundCount = 0;
        data.forEach(row => {
            if (Array.isArray(row) && row.length > 5) {
                const code = row[0]; // Currency Code
                if (RATES_TO_EXTRACT.includes(code)) {
                    // Column 5 is Selling Rate (Venta) in Bolívares
                    const rate = typeof row[5] === 'number' ? row[5] : parseFloat(row[5]);

                    if (!isNaN(rate)) {
                        const key = RATE_KEYS[code];
                        dailyRates[key] = rate;
                        foundCount++;
                    }
                }
            }
        });

        // Save if we found rates
        if (foundCount > 0) {
            // Using day number as key (without leading zero if preferred, but existing code used 'dia' from Date.getDate() which is usually no leading zero for <10 unless manual string)
            // The standard string output of getDate() is '1', '2', '10'. 
            // Let's assume parseInt(day).toString() to remove leading zeros if extracted from '01'.
            const dayKey = parseInt(day, 10).toString();

            history[year][monthName][dayKey] = dailyRates;
            console.log(`Updated ${dayKey} ${monthName} ${year}`);
        }
    });

    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
    console.log(`History saved to ${HISTORY_FILE}`);
}

run();
