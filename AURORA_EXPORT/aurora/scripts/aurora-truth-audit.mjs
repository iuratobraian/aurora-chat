import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const VIOLATIONS = [
  {
    regex: /localStorage\.get|localStorage\.set|localStorage\.clear/g,
    message: 'CRITICAL: localStorage usage detected in view/hook. Use Convex state instead.',
    severity: 'ERROR',
  },
  {
    regex: /window\.convex/g,
    message: 'WARNING: Direct window.convex access. Use useQuery/useMutation hooks.',
    severity: 'WARNING',
  },
  {
    regex: /SAMPLE_NEWS|NOTICIAS_MOCK|MOCK_DATA/g,
    message: 'CRITICAL: Mock/Sample data found in production-facing file.',
    severity: 'ERROR',
  },
  {
    regex: /showToast\('.*', '.*en desarrollo.*'\)/g,
    message: 'CRITICAL: "Work in progress" toast found.',
    severity: 'ERROR',
  },
  {
    regex: /internalMutation|internalAction/g,
    message: 'CRITICAL: internal Convex call detected in potential frontend code (check imports).',
    severity: 'ERROR',
  }
];

const IGNORE_DIRS = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  '.agent',
  'scripts',
  'android',
  'ios',
  'public',
  'docs',
  '__tests__',
  '.expo',
  '.vscode',
];

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

async function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        results = results.concat(await walk(filePath));
      }
    } else {
      if (EXTENSIONS.includes(path.extname(file))) {
        results.push(filePath);
      }
    }
  }
  return results;
}

async function audit() {
  console.log('--- AURORA TRUTH AUDIT START ---');
  const files = await walk(rootDir);
  let totalViolations = 0;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const relativePath = path.relative(rootDir, file);

    for (const v of VIOLATIONS) {
      const matches = content.match(v.regex);
      if (matches) {
        // Additional check for internal mutations: only flag if it looks like a frontend file
        if (v.regex.toString().includes('internalMutation') && !relativePath.includes('src/')) continue;
        
        console.log(`[${v.severity}] ${relativePath}: ${v.message} (${matches.length} matches)`);
        totalViolations += matches.length;
      }
    }
  }

  console.log('---------------------------------');
  console.log(`Audit finished. Total potential violations: ${totalViolations}`);
  console.log('--- AURORA TRUTH AUDIT END ---');
}

audit().catch(console.error);
