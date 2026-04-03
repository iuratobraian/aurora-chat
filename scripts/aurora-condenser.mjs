import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function condenseMemories() {
    console.log("✨ [AURORA CONDENSER] 🧠 Iniciando ciclo de destilación de memoria...");
    
    const projectRoot = path.join(__dirname, '..');
    const memoriesDir = path.join(projectRoot, '.agent', 'workspace', 'agent_memories');
    const vaultDir = path.join(projectRoot, '.agent', 'brain', 'vault', 'archived_memories');
    
    try {
        await fs.mkdir(vaultDir, { recursive: true });
        const files = await fs.readdir(memoriesDir).catch(() => []);
        
        let condensedCount = 0;

        for (const file of files) {
            if (file.endsWith('.md') && file !== 'INDEX.md') {
                const oldPath = path.join(memoriesDir, file);
                const content = await fs.readFile(oldPath, 'utf8');
                
                // Aquí en el futuro, Aurora puede procesar el texto con genai para resumirlo, 
                // por ahora extraemos y movemos para no saturar.
                
                const newPath = path.join(vaultDir, `${Date.now()}_${file}`);
                await fs.rename(oldPath, newPath);
                condensedCount++;
            }
        }
        
        console.log(`✨ [AURORA CONDENSER] 🧠 Destilación completada. Memorias procesadas y resguardadas: ${condensedCount}`);
    } catch (err) {
        console.error("✨ [AURORA CONDENSER] ❌ Error destilando memoria:", err);
    }
}

condenseMemories();
