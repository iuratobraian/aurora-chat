import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const config = JSON.parse(fs.readFileSync(path.join(root, '.agent', 'project-os.config.json'), 'utf8'));
const protectedFiles = new Set([
  '.agent/project-os.config.json',
  '.agent/security-baseline.json',
  '.agent/skills/README.md',
  '.agent/skills/WORKSPACE_RULES.md',
  '.agent/skills/NON_NEGOTIABLES.md',
  '.agent/skills/ATTACK_PRIORITY.md',
  '.agent/skills/AGENT_TASK_DIVISION.md',
  '.agent/skills/AGENT_BOOTCAMP.md',
  '.agent/skills/ENFORCEMENT.md',
  '.agent/skills/IMMUTABLE_CORE.md',
  '.agent/skills/PROJECT_OS_REUSE.md',
  '.agent/skills/PROMPT_LIBRARY.md',
  '.agent/workspace/coordination/TASK_BOARD.md',
  '.agent/workspace/coordination/CURRENT_FOCUS.md',
  '.agent/workspace/coordination/DECISIONS.md',
  '.agent/workspace/coordination/RELEASE_BLOCKERS.md',
  '.github/workflows/ci.yml',
  '.github/workflows/release-gate.yml',
  '.github/workflows/repo-guardian.yml',
  'scripts/validate-project-os.mjs',
  'scripts/check-release-gate.mjs',
  'scripts/detect-hardcodes-and-secrets.mjs',
  'scripts/report-critical-changes.mjs',
]);

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

const overridePath = path.join(root, '.agent', 'workspace', 'coordination', 'ARCHITECT_OVERRIDE.md');
const overrideContent = fs.readFileSync(overridePath, 'utf8');
const overrideActive = overrideContent.includes('## OVERRIDE');

const changedProtected = getChangedFiles().filter((file) => protectedFiles.has(file));

if (changedProtected.length > 0 && !overrideActive) {
  console.error('IMMUTABLE CORE GUARD FAILED');
  for (const file of changedProtected) {
    console.error(`- protected file changed without override: ${file}`);
  }
  process.exit(1);
}

console.log('IMMUTABLE CORE GUARD PASSED');
