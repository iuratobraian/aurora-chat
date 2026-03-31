import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const baselinePath = path.join(root, '.agent', 'security-baseline.json');
const baseline = fs.existsSync(baselinePath)
  ? JSON.parse(fs.readFileSync(baselinePath, 'utf8'))
  : { allowed_findings: [] };
const filesToSkip = [
  'package-lock.json',
  '.env',
  '.env.local',
  '.env.example',
  '.agent/',
  '.git/',
  'tasks/',
  'node_modules/',
  'dist/',
  'coverage/',
];

const suspiciousPatterns = [
  {
    label: 'possible secret token',
    regex: /\b(sk_live|sk_test|whsec_|SG\.[A-Za-z0-9._-]+|APP_USR-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z\-_]{20,}|sntrys_[A-Za-z0-9._-]+)\b/g,
  },
  {
    label: 'possible bearer token in code',
    regex: /Bearer\s+[A-Za-z0-9._-]{16,}/g,
  },
  {
    label: 'hardcoded convex url',
    regex: /https:\/\/[a-z0-9-]+\.convex\.cloud/g,
  },
  {
    label: 'hardcoded production vercel url',
    regex: /https:\/\/[a-z0-9-]+\.vercel\.app/g,
  },
];

function walk(dir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    const relative = path.relative(root, absolute).replace(/\\/g, '/');

    if (filesToSkip.some((skip) => relative.startsWith(skip) || relative === skip)) {
      continue;
    }

    if (entry.isDirectory()) {
      walk(absolute, acc);
      continue;
    }

    acc.push(relative);
  }

  return acc;
}

function getTrackedFiles() {
  return walk(root).filter((file) => !filesToSkip.some((skip) => file.startsWith(skip) || file === skip));
}

function shouldAllowMatch(file, label) {
  if (file.endsWith('.md')) return true;
  if (file === 'scripts/detect-hardcodes-and-secrets.mjs') return true;
  if (file === '.agent/project-os.config.json' && label === 'hardcoded convex url') return true;
  if (file === 'src/config/urls.ts' && label === 'hardcoded production vercel url') return true;
  if (file === 'src/config/urls.ts' && label === 'hardcoded convex url') return true;
  if (file === 'services/posts/postService.ts' && label === 'hardcoded convex url') return true;
  if (file === 'services/users/userService.ts' && label === 'hardcoded convex url') return true;
  if (file === 'services/backup/syncService.ts' && label === 'hardcoded convex url') return true;
  if (file === 'server.ts' && label === 'hardcoded convex url') return true;
  if (baseline.allowed_findings.some((entry) => entry.file === file && entry.label === label)) return true;
  return false;
}

const offenders = [];
const ignoredByBaseline = [];

for (const file of getTrackedFiles()) {
  const absolutePath = path.join(root, file);
  const content = fs.readFileSync(absolutePath, 'utf8');
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    for (const pattern of suspiciousPatterns) {
      const matches = [...line.matchAll(pattern.regex)];
      if (matches.length === 0) continue;
      if (shouldAllowMatch(file, pattern.label)) {
        ignoredByBaseline.push({
          file,
          line: index + 1,
          label: pattern.label,
          value: matches[0][0],
        });
        continue;
      }
      offenders.push({
        file,
        line: index + 1,
        label: pattern.label,
        value: matches[0][0],
      });
    }
  });
}

if (ignoredByBaseline.length > 0) {
  console.log(`HARDCODE / SECRET GUARD BASELINE: ignoring ${ignoredByBaseline.length} known findings`);
}

if (offenders.length > 0) {
  console.error('HARDCODE / SECRET GUARD FAILED');
  for (const offender of offenders) {
    console.error(`- ${offender.file}:${offender.line} -> ${offender.label} -> ${offender.value}`);
  }
  process.exit(1);
}

console.log('HARDCODE / SECRET GUARD PASSED');
