import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RATES_FILE = path.join(__dirname, 'rates.json');
const HISTORY_FILE = path.join(__dirname, 'historia.json');

const MESES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

async function actualizarHistorial() {
    console.log('📜 Iniciando actualización de historial...');

    // 1. Leer tasa actual
    if (!fs.existsSync(RATES_FILE)) {
        console.error('❌ No existe rates.json. Ejecuta primero index.js');
        process.exit(1);
    }

    const ratesData = JSON.parse(fs.readFileSync(RATES_FILE, 'utf8'));
    const tasaEUR = parseFloat(ratesData.tasaEUR);
    const tasaYUAN = parseFloat(ratesData.tasaYUAN);
    const tasaLIRA = parseFloat(ratesData.tasaLIRA);
    const tasaRUBLO = parseFloat(ratesData.tasaRUBLO);
    const tasaUSD = parseFloat(ratesData.tasaUSD);

    if (isNaN(tasaUSD)) {
        console.error('❌ La tasa en rates.json no es un número válido.');
        process.exit(1);
    }
    if (isNaN(tasaEUR)) {
        console.error('❌ La tasa en rates.json no es un número válido.');
        process.exit(1);
    }
    if (isNaN(tasaYUAN)) {
        console.error('❌ La tasa en rates.json no es un número válido.');
        process.exit(1);
    }
    if (isNaN(tasaLIRA)) {
        console.error('❌ La tasa en rates.json no es un número válido.');
        process.exit(1);
    }
    if (isNaN(tasaRUBLO)) {
        console.error('❌ La tasa en rates.json no es un número válido.');
        process.exit(1);
    }

    // 2. Leer o crear archivo de historia
    let historia = {};
    if (fs.existsSync(HISTORY_FILE)) {
        try {
            historia = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
        } catch (error) {
            console.error('⚠️ Error leyendo historia.json, se creará uno nuevo.', error);
        }
    }

    // 3. Determinar fecha actual
    const hoy = new Date();
    const anio = hoy.getFullYear().toString();
    const mesIndex = hoy.getMonth();
    const mesNombre = MESES[mesIndex];
    const dia = hoy.getDate().toString();

    // 4. Estructura anidada: Año -> Mes -> Dia
    if (!historia[anio]) {
        historia[anio] = {};
    }
    if (!historia[anio][mesNombre]) {
        historia[anio][mesNombre] = {};
    }

    const valor = {
        tasaUSD: tasaUSD,
        tasaEUR: tasaEUR,
        tasaYUAN: tasaYUAN,
        tasaLIRA: tasaLIRA,
        tasaRUBLO: tasaRUBLO,
        fecha_actualizacion: new Date().toISOString(),
    };
    historia[anio][mesNombre][dia] = valor;

    console.log(`✅ Guardando tasa ${tasaUSD} para fecha: ${dia} de ${mesNombre}, ${anio}`);

    // 5. Escribir archivo
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(historia, null, 2));
    console.log('💾 Historial actualizado exitosamente.');
}

actualizarHistorial();
