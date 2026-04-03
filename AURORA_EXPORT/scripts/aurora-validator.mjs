import fs from 'fs';
import path from 'path';

const CRITICAL_KEYWORDS = [
  'TODO',
  'FIXME',
  'mock',
  'placeholder',
  'en desarrollo',
  'demo data',
  'localStorage.setItem',
  'localStorage.getItem'
];

function checkFiles(dir, filesToIgnore = ['node_modules', '.git']) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (filesToIgnore.includes(file)) continue;
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      checkFiles(fullPath, filesToIgnore);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const keyword of CRITICAL_KEYWORDS) {
        if (content.includes(keyword)) {
          console.warn(`[AURORA-VALIDATOR] Critical keyword found in ${fullPath}: "${keyword}"`);
        }
      }
    }
  }
}

console.log('🚀 Aurora Task Integrity Validator Starting...');
checkFiles('./src');
console.log('✅ Validation complete.');
