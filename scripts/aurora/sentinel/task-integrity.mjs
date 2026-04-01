import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../..');
const TASK_BOARD_PATH = path.join(ROOT, '.agent', 'workspace', 'coordination', 'TASK_BOARD.md');

async function checkTaskIntegrity() {
  console.log('🔍 AURORA TASK INTEGRITY CHECK');
  console.log('-------------------------------');
  
  if (!fs.existsSync(TASK_BOARD_PATH)) {
    console.error(`❌ Task board not found at ${TASK_BOARD_PATH}`);
    return;
  }

  const content = fs.readFileSync(TASK_BOARD_PATH, 'utf-8');
  const lines = content.split('\n');
  const taskIds = new Map();
  const duplicates = [];

  for (const line of lines) {
    // Match | TSK-XXX | or | NTN-XXX | (case insensitive IDs)
    const match = line.match(/\|\s*((TSK|NTN)-\d+)\s*\|/i);
    if (match) {
      const id = match[1].trim().toUpperCase();
      if (taskIds.has(id)) {
        duplicates.push({ id, line });
      } else {
        taskIds.set(id, line);
      }
    }
  }

  if (duplicates.length > 0) {
    console.warn('⚠️  DUPLICATE TASK IDS FOUND:');
    duplicates.forEach(d => console.warn(`   - ${d.id}`));
    console.warn('\nFixing this is priority to prevent swarm conflicts.');
  } else {
    console.log('✅ No duplicate task IDs found.');
  }

  console.log('-------------------------------');
  return { duplicates };
}

checkTaskIntegrity();
