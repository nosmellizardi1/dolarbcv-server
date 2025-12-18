import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Guardaremos el archivo en la raiz para que GitHub Pages lo lea fácil
const RATES_FILE = path.join(__dirname, 'rates.json');

const agent = new https.Agent({ rejectUnauthorized: false });

async function obtenerTasaBCV() {
    const url = "https://www.bcv.org.ve/";
    console.log('Iniciando Scraping del BCV...');

    try {
        const response = await fetch(url, { agent });
        const html = await response.text();
        const $ = cheerio.load(html);

        // Extraer el valor
        const tasaTexto = $("#dolar .centrado strong").text().trim();
        const tasaUSD = parseFloat(tasaTexto.replace(",", ".")).toFixed(3); // Redondeado a 2 decimales para app

        if (isNaN(tasaUSD)) {
            throw new Error(`No se pudo leer la tasa. Texto encontrado: ${tasaTexto}`);
        }

        const rateData = {
            tasaUSD: tasaUSD,
            fecha_actualizacion: new Date().toISOString(),
            mensaje_alerta: "" // Campo extra por si quieres comunicar algo urgente a la app
        };

        // Guardar archivo
        fs.writeFileSync(RATES_FILE, JSON.stringify(rateData, null, 2));
        console.log(`✅ Tasa actualizada exitosamente: ${tasaUSD} Bs/USD`);

    } catch (error) {
        console.error("❌ Error fatal:", error);
        process.exit(1); // Salir con error para que GitHub nos avise
    }
}

// Ejecutar una sola vez
obtenerTasaBCV();