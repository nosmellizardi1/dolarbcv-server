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
        const tasaTextoEuro = $("#euro .centrado strong").text().trim();
        const tasaTextoYuan = $("#yuan .centrado strong").text().trim();
        const tasaTextoLira = $("#lira .centrado strong").text().trim();
        const tasaTextoRublo = $("#rublo .centrado strong").text().trim();
        const tasaTextoDolar = $("#dolar .centrado strong").text().trim();
        const tasaUSD = parseFloat(tasaTextoDolar.replace(",", ".")).toFixed(3); // Redondeado a 2 decimales para app
        const tasaEUR = parseFloat(tasaTextoEuro.replace(",", ".")).toFixed(3); // Redondeado a 2 decimales para app
        const tasaYUAN = parseFloat(tasaTextoYuan.replace(",", ".")).toFixed(3); // Redondeado a 2 decimales para app
        const tasaLIRA = parseFloat(tasaTextoLira.replace(",", ".")).toFixed(3); // Redondeado a 2 decimales para app
        const tasaRUBLO = parseFloat(tasaTextoRublo.replace(",", ".")).toFixed(3); // Redondeado a 2 decimales para app

        if (isNaN(tasaUSD)) {
            throw new Error(`No se pudo leer la tasa. Texto encontrado: ${tasaTextoDolar}`);
        }
        if (isNaN(tasaEUR)) {
            throw new Error(`No se pudo leer la tasa. Texto encontrado: ${tasaTextoEuro}`);
        }
        if (isNaN(tasaYUAN)) {
            throw new Error(`No se pudo leer la tasa. Texto encontrado: ${tasaTextoYuan}`);
        }
        if (isNaN(tasaLIRA)) {
            throw new Error(`No se pudo leer la tasa. Texto encontrado: ${tasaTextoLira}`);
        }
        if (isNaN(tasaRUBLO)) {
            throw new Error(`No se pudo leer la tasa. Texto encontrado: ${tasaTextoRublo}`);
        }

        const rateData = {
            tasaUSD: tasaUSD,
            tasaEUR: tasaEUR,
            tasaYUAN: tasaYUAN,
            tasaLIRA: tasaLIRA,
            tasaRUBLO: tasaRUBLO,
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