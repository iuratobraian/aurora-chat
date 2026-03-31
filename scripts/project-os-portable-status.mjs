import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const required = [
  '.agent/project-os.config.json',
  '.agent/skills/README.md',
  '.agent/prompt-library/README.md',
  '.agent/brain/README.md',
  '.agent/workspace/coordination/TASK_BOARD.md',
  'scripts/validate-project-os.mjs',
  'scripts/brain-sync.mjs',
  '.github/workflows/ci.yml',
];

const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));

console.log('PORTABLE STACK STATUS');
console.log(`Required artifacts: ${required.length}`);
console.log(`Missing: ${missing.length}`);

if (missing.length > 0) {
  for (const file of missing) {
    console.log(`- missing: ${file}`);
  }
  process.exit(1);
}

console.log('Portable stack is complete.');
