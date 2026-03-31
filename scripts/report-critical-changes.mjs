import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const configPath = path.join(root, '.agent', 'project-os.config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

function getChangedFiles() {
  try {
    const baseRef = process.env.GITHUB_BASE_REF;
    let diffTarget = 'HEAD~1...HEAD';
    if (baseRef) diffTarget = `origin/${baseRef}...HEAD`;

    const output = execSync(`git diff --name-only ${diffTarget}`, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    return output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

const changedFiles = getChangedFiles();
const critical = new Set(config.critical_files || []);
const guarded = config.guarded_paths || [];

console.log('CRITICAL CHANGE REPORT');

const criticalTouched = changedFiles.filter((file) => critical.has(file));
if (criticalTouched.length === 0) {
  console.log('- no critical files touched');
} else {
  for (const file of criticalTouched) {
    console.log(`- critical: ${file}`);
  }
}

for (const file of changedFiles) {
  const guard = guarded.find((entry) => {
    if (entry.pattern.endsWith('/')) return file.startsWith(entry.pattern);
    return file === entry.pattern;
  });
  if (!guard) continue;
  console.log(`- guarded: ${file} -> required scope: ${guard.required_scope}`);
}
