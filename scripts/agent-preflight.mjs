import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const files = [
  '.agent/skills/PROJECT_CHARTER.md',
  '.agent/skills/NON_NEGOTIABLES.md',
  '.agent/skills/ATTACK_PRIORITY.md',
  '.agent/skills/WORKSPACE_RULES.md',
  '.agent/skills/AGENT_TASK_DIVISION.md',
  '.agent/skills/AGENT_BOOTCAMP.md',
  '.agent/workspace/coordination/TASK_BOARD.md',
  '.agent/workspace/coordination/CURRENT_FOCUS.md',
];

const missing = files.filter((relativePath) => {
  return !fs.existsSync(path.join(root, relativePath));
});

if (missing.length > 0) {
  console.error('AGENT PREFLIGHT FAILED');
  for (const file of missing) {
    console.error(`Missing required file: ${file}`);
  }
  process.exit(1);
}

console.log('AGENT PREFLIGHT READY');
console.log('Read in this order:');
for (const file of files) {
  console.log(`- ${file}`);
}
console.log('Before editing: claim task, declare focus, respect non-negotiables.');
