import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createSnapshot() {
    console.log("✨ [AURORA SNAPSHOT] 🧠 Iniciando resguardo de la base de memoria...");
    
    // Rutas
    const projectRoot = path.join(__dirname, '..');
    const brainDir = path.join(projectRoot, '.agent', 'brain');
    const backupsDir = path.join(brainDir, 'backups');
    
    try {
        await fs.mkdir(backupsDir, { recursive: true });
        const snapshotName = `brain-snap-${Date.now()}.json`;
        const snapshotPath = path.join(backupsDir, snapshotName);

        // Archivos a resguardar de forma rápida (ej. SKILL.md, README)
        const snapshotData = {
            timestamp: new Date().toISOString(),
            files: []
        };

        const masteryPath = path.join(projectRoot, '.agent', 'skills', 'aurora-mastery', 'SKILL.md');
        if (await fs.stat(masteryPath).catch(() => false)) {
            snapshotData.files.push({
                name: 'aurora-mastery/SKILL.md',
                content: await fs.readFile(masteryPath, 'utf8')
            });
        }

        await fs.writeFile(snapshotPath, JSON.stringify(snapshotData, null, 2), 'utf8');
        console.log(`✨ [AURORA SNAPSHOT] 🧠 Backup completado con éxito: ${snapshotName}`);
    } catch (err) {
        console.error("✨ [AURORA SNAPSHOT] ❌ Error creando resguardo:", err);
    }
}

createSnapshot();
