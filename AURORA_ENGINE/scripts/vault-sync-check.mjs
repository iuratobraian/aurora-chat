import fs from 'fs';
import path from 'path';

const VAULT_TASKS_DIR = path.join(process.cwd(), 'vault/01-tareas/activas');
const TASK_BOARD_PATH = path.join(process.cwd(), '.agent/workspace/coordination/TASK_BOARD.md');

async function checkSync() {
  console.log('🔍 Verificando sincronización Vault ↔ TaskBoard...');
  
  if (!fs.existsSync(VAULT_TASKS_DIR)) {
    console.error('❌ Directorio de tareas activas no encontrado.');
    process.exit(1);
  }

  const vaultTasks = fs.readdirSync(VAULT_TASKS_DIR).filter(f => f.endsWith('.md'));
  const boardContent = fs.readFileSync(TASK_BOARD_PATH, 'utf8');

  const missingTasks = [];

  for (const taskFile of vaultTasks) {
    const taskId = taskFile.replace('.md', '');
    // Search for the task ID or a part of it in the board
    if (!boardContent.includes(taskId.split('-').slice(0, 2).join('-'))) {
      missingTasks.push(taskFile);
    }
  }

  if (missingTasks.length === 0) {
    console.log('✅ Sincronización perfecta: Todas las tareas del Vault están en el TaskBoard.');
  } else {
    console.warn(`⚠️  Desincronización detectada: ${missingTasks.length} tareas en Vault no aparecen en TaskBoard:`);
    missingTasks.forEach(t => console.log(`  - ${t}`));
    console.log('\n👉 Por favor, actualiza TASK_BOARD.md para mantener la coherencia del enjambre.');
  }
}

checkSync().catch(console.error);
