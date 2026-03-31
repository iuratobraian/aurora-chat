#!/usr/bin/env node
/**
 * Auto-save Chat History
 * Ejecutar después de cada tarea completada
 * 
 * Uso: node scripts/auto-save-chat.js [--task TASK-ID] [--notes "Notas"]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const HISTORY_FILE = path.join(__dirname, '..', '.agent', 'workspace', 'coordination', 'GLOBAL_CHAT_HISTORY.md');

const args = process.argv.slice(2);

function getArg(name) {
  const index = args.indexOf(`--${name}`);
  if (index !== -1 && args[index + 1]) {
    return args[index + 1];
  }
  return null;
}

function getLastCommit() {
  try {
    const msg = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
    const sha = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    return { msg, sha };
  } catch {
    return { msg: 'Unknown', sha: 'unknown' };
  }
}

function saveChatHistory() {
  const taskId = getArg('task');
  const notes = getArg('notes');
  const { msg, sha } = getLastCommit();
  const timestamp = new Date().toISOString();
  
  const entry = `
---

## Task Completed - ${new Date().toLocaleString('es-ES')}

### Automated Task Backup
- Timestamp: ${timestamp}
- Commit: ${msg}
- SHA: ${sha}
${taskId ? `- Task: ${taskId}` : ''}
${notes ? `- Notes: ${notes}` : ''}
`;
  
  try {
    fs.appendFileSync(HISTORY_FILE, entry);
    console.log('✅ Chat history saved');
    console.log(entry);
    
    // Auto-commit if git is available
    try {
      execSync('git add .agent/workspace/coordination/GLOBAL_CHAT_HISTORY.md', { stdio: 'ignore' });
      const status = execSync('git status --porcelain .agent/workspace/coordination/GLOBAL_CHAT_HISTORY.md', { encoding: 'utf8' });
      if (status.trim()) {
        execSync('git commit -m "chore: auto-save chat history"', { stdio: 'ignore' });
        console.log('✅ Auto-committed');
      }
    } catch {
      // Git not available or no changes
    }
  } catch (error) {
    console.error('❌ Error saving chat history:', error.message);
  }
}

// Help
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
📝 Auto-save Chat History

Uso:
  node scripts/auto-save-chat.js [opciones]

Opciones:
  --task TASK-ID    ID de la tarea completada
  --notes "Notas"  Notas adicionales
  --help, -h       Mostrar esta ayuda

Ejemplos:
  node scripts/auto-save-chat.js --task SAB-003 --notes "Motor de juego completado"
  node scripts/auto-save-chat.js --task APP-001
  `);
  process.exit(0);
}

saveChatHistory();
