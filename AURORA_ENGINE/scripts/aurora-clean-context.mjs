import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const LOGS_DIR = path.join(ROOT_DIR, '.agent', 'workspace', 'coordination');
const STATE_FILE = path.join(ROOT_DIR, '.aurora-awakening-state.json');

async function cleanContext() {
    console.log('🧠 [Aurora AMM] Iniciando limpieza de contexto y optimización...');

    // 1. Limpiar logs antiguos en la mesa de trabajo
    try {
        const files = fs.readdirSync(LOGS_DIR);
        const logFiles = files.filter(f => f.endsWith('.log') || f.startsWith('AGENT_LOG_BACKUP_'));
        
        let count = 0;
        for (const file of logFiles) {
            const filePath = path.join(LOGS_DIR, file);
            const stats = fs.statSync(filePath);
            const daysOld = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
            
            if (daysOld > 7) {
                fs.unlinkSync(filePath);
                count++;
            }
        }
        console.log(`✅ [Aurora AMM] Se eliminaron ${count} archivos de log antiguos.`);
    } catch (e) {
        console.warn('⚠️ [Aurora AMM] No se pudo acceder al directorio de logs.');
    }

    // 2. Optimizar archivo de estado de Aurora
    try {
        if (fs.existsSync(STATE_FILE)) {
            const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
            if (state.history && state.history.length > 50) {
                console.log('✅ [Aurora AMM] Truncando historial de despertar de Aurora (50 entradas max).');
                state.history = state.history.slice(-50);
                fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
            }
        }
    } catch (e) {
        console.warn('⚠️ [Aurora AMM] Error al optimizar el archivo de estado.');
    }

    console.log('🚀 [Aurora AMM] Mejora ejecutada con éxito. Aurora está más liviana.');
}

cleanContext();
