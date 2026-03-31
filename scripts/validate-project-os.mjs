import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const projectOsConfigPath = path.join(root, '.agent', 'project-os.config.json');
const projectOsConfig = JSON.parse(fs.readFileSync(projectOsConfigPath, 'utf8'));
const coordinationDir = path.join(root, projectOsConfig.coordination_dir);

const files = {
  taskBoard: path.join(coordinationDir, 'TASK_BOARD.md'),
  currentFocus: path.join(coordinationDir, 'CURRENT_FOCUS.md'),
  agentLog: path.join(coordinationDir, 'AGENT_LOG.md'),
  decisions: path.join(coordinationDir, 'DECISIONS.md'),
};

const criticalFiles = new Set(projectOsConfig.critical_files || []);
const guardedPaths = projectOsConfig.guarded_paths || [];

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function parseTaskBoard(markdown) {
  const tasks = [];
  const lines = markdown.split(/\r?\n/);

  for (const line of lines) {
    if (!line.startsWith('|')) continue;
    if (line.includes('---')) continue;
    if (line.includes('TASK-ID')) continue;

    const cells = line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());

    if (cells.length < 7) continue;

    tasks.push({
      id: cells[0],
      status: cells[1],
      owner: cells[2],
      scope: cells[3],
      files: cells[4],
      objective: cells[5],
      acceptance: cells[6],
    });
  }

  return tasks;
}

function parseFocus(markdown) {
  const entries = [];
  const sections = markdown.split(/\n## /).slice(1);

  for (const rawSection of sections) {
    const section = rawSection.startsWith('## ') ? rawSection : `## ${rawSection}`;
    const lines = section.split(/\r?\n/);
    const header = lines[0].replace(/^##\s+/, '').trim();

    const entry = { agent: header };

    for (const line of lines.slice(1)) {
      const match = line.match(/^- ([^:]+):\s*(.*)$/);
      if (!match) continue;
      const key = match[1].trim().toLowerCase();
      const value = match[2].trim();
      entry[key] = value;
    }

    entries.push(entry);
  }

  return entries.filter((entry) => entry.agent && entry['task-id']);
}

function getChangedFiles() {
  try {
    const baseRef = process.env.GITHUB_BASE_REF;
    let diffTarget = 'HEAD~1...HEAD';

    if (baseRef) {
      diffTarget = `origin/${baseRef}...HEAD`;
    }

    const output = execSync(`git diff --name-only ${diffTarget}`, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    return output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function matchesPattern(file, pattern) {
  if (pattern.endsWith('/')) {
    return file.startsWith(pattern);
  }

  return file === pattern;
}

function fail(message) {
  console.error(`OPS VALIDATION FAILED: ${message}`);
  process.exitCode = 1;
}

const tasks = parseTaskBoard(read(files.taskBoard));
const focusEntries = parseFocus(read(files.currentFocus));
const changedFiles = getChangedFiles();

const taskById = new Map(tasks.map((task) => [task.id, task]));
const activeTaskStatuses = new Set(['claimed', 'in_progress', 'review']);
const activeTasks = tasks.filter((task) => activeTaskStatuses.has(task.status));

const seenTaskIds = new Set();
for (const task of tasks) {
  if (seenTaskIds.has(task.id)) {
    fail(`TASK_BOARD has duplicated task id: ${task.id}`);
  }
  seenTaskIds.add(task.id);

  if (task.status !== 'todo' && task.owner === 'unassigned') {
    fail(`Task ${task.id} has status ${task.status} but owner is unassigned.`);
  }
}

const activeScopes = new Map();
for (const task of activeTasks) {
  if (activeScopes.has(task.scope)) {
    fail(`More than one active task in scope ${task.scope}: ${activeScopes.get(task.scope)} and ${task.id}`);
  }
  activeScopes.set(task.scope, task.id);
}

for (const task of activeTasks) {
  const focus = focusEntries.find(
    (entry) => entry.agent === task.owner && entry['task-id'] === task.id
  );

  if (!focus) {
    fail(`Active task ${task.id} owned by ${task.owner} has no CURRENT_FOCUS entry.`);
  }
}

for (const focus of focusEntries) {
  const task = taskById.get(focus['task-id']);

  if (!task) {
    fail(`CURRENT_FOCUS references unknown task id ${focus['task-id']}.`);
    continue;
  }

  if (task.owner !== focus.agent) {
    fail(`CURRENT_FOCUS entry for ${focus.agent} points to ${task.id}, but task owner is ${task.owner}.`);
  }
}

const codeChanged = changedFiles.some((file) => {
  return !file.startsWith('.agent/') && !file.startsWith('.github/');
});

const criticalChanged = changedFiles.some((file) => criticalFiles.has(file));
const touched = new Set(changedFiles);

if (codeChanged) {
  for (const required of projectOsConfig.required_files_on_code_change || []) {
    if (!touched.has(required)) {
      fail(`Code changed but ${required} was not updated.`);
    }
  }
}

if (criticalChanged && !touched.has('.agent/workspace/coordination/DECISIONS.md')) {
  fail('Critical files changed without updating DECISIONS.md.');
}

for (const file of changedFiles) {
  const guard = guardedPaths.find((entry) => matchesPattern(file, entry.pattern));
  if (!guard || !guard.required_scope) continue;

  const activeTaskForScope = activeTasks.find((task) => task.scope === guard.required_scope);
  if (!activeTaskForScope) {
    fail(`Changed file ${file} requires an active task in scope ${guard.required_scope}.`);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log('OPS VALIDATION PASSED');
