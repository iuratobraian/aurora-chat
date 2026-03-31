import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const templatesDir = path.join(root, '.agent', 'templates');

const files = fs
  .readdirSync(templatesDir)
  .filter((file) => file.endsWith('.md'))
  .sort();

console.log('PROJECT OS TEMPLATES');

for (const file of files) {
  console.log(`- .agent/templates/${file}`);
}
