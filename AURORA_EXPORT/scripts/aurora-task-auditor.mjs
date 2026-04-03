#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const FORBIDDEN_PATTERNS = [
  { 
    pattern: /localStorage\./, 
    message: '🔴 localStorage is forbidden. Use official services or Convex.',
    exclude: [/src\/services\/storage\.ts/, /src\/lib\/cache\.ts/] 
  },
  { 
    pattern: /window\.convex/, 
    message: '🔴 window.convex is forbidden. Use official useQuery/useMutation hooks.' 
  },
  { 
    pattern: /internalMutation/, 
    message: '🔴 internalMutation called from client side is forbidden.',
    include: [/src\//] 
  },
  { 
    pattern: /internalAction/, 
    message: '🔴 internalAction called from client side is forbidden.',
    include: [/src\//] 
  },
  { 
    pattern: /en desarrollo|mostrar toast.*desarrollo|alert.*desarrollo/i, 
    message: '🟡 Placeholder "en desarrollo" found in UI.' 
  },
  { 
    pattern: /console\.log|alert\(|confirm\(/, 
    message: '⚪ Debugging leftovers (console.log, alert, confirm) found.',
    exclude: [/scripts\//, /convex\/_generated\//, /src\/lib\/logger\.ts/]
  }
];

const SCAN_DIRS = ['src', 'convex'];

function getFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    if (item.isDirectory()) {
      if (item.name === 'node_modules' || item.name === '.git' || item.name === '_generated') continue;
      files = [...files, ...getFiles(path.join(dir, item.name))];
    } else {
      if (item.name.endsWith('.ts') || item.name.endsWith('.tsx') || item.name.endsWith('.mjs')) {
        files.push(path.join(dir, item.name));
      }
    }
  }
  return files;
}

console.log('🚀 Aurora Task Auditor - Mandatory Compliance Check\n');

let totalIssues = 0;
const files = SCAN_DIRS.flatMap(dir => {
  const fullPath = path.join(ROOT, dir);
  return fs.existsSync(fullPath) ? getFiles(fullPath) : [];
});

files.forEach(file => {
  const relativePath = path.relative(ROOT, file);
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const fileFindings = [];

  lines.forEach((line, index) => {
    FORBIDDEN_PATTERNS.forEach(({ pattern, message, exclude, include }) => {
      if (include && !include.some(p => p.test(relativePath))) return;
      if (exclude && exclude.some(p => p.test(relativePath))) return;
      
      if (pattern.test(line) && !line.includes('// @allow-auditor')) {
        fileFindings.push({
          line: index + 1,
          content: line.trim(),
          message
        });
      }
    });
  });

  if (fileFindings.length > 0) {
    console.log(`\n📄 File: ${relativePath}`);
    fileFindings.forEach(f => {
      console.log(`  [Line ${f.line}] ${f.message}`);
      console.log(`    > ${f.content}`);
      totalIssues++;
    });
  }
});

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
if (totalIssues === 0) {
  console.log('✅ All checks passed! No critical failures found.');
} else {
  console.log(`❌ Found ${totalIssues} potential issues. Please fix them before marking task as DONE.`);
  process.exit(1);
}
