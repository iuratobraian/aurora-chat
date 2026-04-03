import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

async function getFiles(dir, matchExt = []) {
    let results = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name !== 'node_modules' && entry.name !== '_generated') {
                results = results.concat(await getFiles(fullPath, matchExt));
            }
        } else {
            if (matchExt.length === 0 || matchExt.some(ext => entry.name.endsWith(ext))) {
                results.push(fullPath);
            }
        }
    }
    return results;
}

async function audit() {
    console.log("✨ [AURORA AUDITOR] 🧠 Iniciando rastreo galáctico de funciones huérfanas...");
    const convexDir = path.join(projectRoot, 'convex');
    const srcDir = path.join(projectRoot, 'src');

    const backendFiles = await getFiles(convexDir, ['.ts']);
    const frontendFiles = await getFiles(srcDir, ['.ts', '.tsx']);

    let allFunctions = []; // { file: 'posts', name: 'getPosts' }

    // 1. Extraer firmas de Convex
    for (const bf of backendFiles) {
        const content = await fs.readFile(bf, 'utf8');
        const filename = path.basename(bf, '.ts');
        
        // Regex to match: export const funcName = query({  or mutation({
        const regex = /export\s+const\s+([a-zA-Z0-9_]+)\s*=\s*(query|mutation|action)\s*\(/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            allFunctions.push({ file: filename, name: match[1], type: match[2] });
        }
    }

    // 2. Extraer todo el código frontend en memoria para busqueda rápida
    let allFrontendCode = '';
    for (const ff of frontendFiles) {
        allFrontendCode += '\n' + await fs.readFile(ff, 'utf8');
    }

    let orphans = [];
    let usedCount = 0;

    for (const fn of allFunctions) {
        // En frontend generalmente se invoca via api.archivo.funcion
        // o a veces importe directo si es interno al backend, pero un endpoint válido
        // debe tener `api.${fn.file}.${fn.name}` si se usa en la web.
        const usagePattern1 = `api.${fn.file}.${fn.name}`;
        const usagePattern2 = `"${fn.name}"`; // menos seguro pero captura llamadas abstractas

        if (!allFrontendCode.includes(usagePattern1)) {
            // chequear si se usa internamente o via referencias indirectas
            if (!allFrontendCode.includes(fn.name)) {
                orphans.push(fn);
            } else {
                usedCount++;
            }
        } else {
            usedCount++;
        }
    }

    const reportPath = path.join(projectRoot, '.agent', 'workspace', 'coordination', 'AUDIT_ORPHANS.md');
    
    let report = `# 🚨 REPORTE DE AUDITORÍA GALÁCTICA (CÓDIGO HUÉRFANO/DESCONECTADO)\n\n`;
    report += `**Resumen:**\n- Funciones de Backend Evaluadas: ${allFunctions.length}\n`;
    report += `- Funciones en Uso (Conectadas): ${usedCount}\n`;
    report += `- **Funciones Huérfanas (Por Reactivar): ${orphans.length}**\n\n`;
    report += `--- \n\n### 📝 FUNCIONES PARA INYECTAR COMO TAREAS\n\n`;

    // Group orphans by file
    let grouped = {};
    for (let o of orphans) {
        if (!grouped[o.file]) grouped[o.file] = [];
        grouped[o.file].push(o);
    }

    for (let file in grouped) {
        report += `#### 📁 Módulo: \`convex/${file}.ts\`\n`;
        for (let fn of grouped[file]) {
            report += `- \`${fn.name}\` (${fn.type})\n`;
        }
        report += '\n';
    }

    await fs.writeFile(reportPath, report, 'utf8');
    console.log(`✨ [AURORA] Auditoría lista! Encontrados ${orphans.length} endpoints huérfanos. Reporte generado.`);
}

audit();
