const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const headers = ['No', 'Compañia', 'Email', 'Teléfono', 'Celular', 'Nombre', 'Accion'];
const row = [1, 'Prueba', 'vegamorales0304@gmail.com', '', '8312415462', '', 'Whatsapp'];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet([headers, row]);
XLSX.utils.book_append_sheet(wb, ws, 'Contactos');

const outDir = path.join(__dirname, '..');
const outPath = path.join(outDir, 'prueba-importacion.xlsx');
XLSX.writeFile(wb, outPath);

console.log('Creado:', outPath);
