import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const libraryDir = path.join(root, '.agent', 'prompt-library');

function walk(dir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(absolute, acc);
      continue;
    }
    if (entry.name.endsWith('.md')) {
      acc.push(path.relative(root, absolute).replace(/\\/g, '/'));
    }
  }
  return acc;
}

const files = walk(libraryDir).sort();

console.log('PROMPT LIBRARY');
for (const file of files) {
  console.log(`- ${file}`);
}
