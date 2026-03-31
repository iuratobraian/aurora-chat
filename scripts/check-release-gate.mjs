import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const coordinationDir = path.join(root, '.agent', 'workspace', 'coordination');
const boardPath = path.join(coordinationDir, 'TASK_BOARD.md');
const gatePath = path.join(coordinationDir, 'RELEASE_BLOCKERS.md');

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
    tasks.push({ id: cells[0], status: cells[1] });
  }

  return tasks;
}

function parseBlockers(markdown) {
  return markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.replace(/^- /, '').trim())
    .filter(Boolean);
}

const tasks = parseTaskBoard(read(boardPath));
const blockers = parseBlockers(read(gatePath));
const taskMap = new Map(tasks.map((task) => [task.id, task.status]));

const openBlockers = blockers.filter((id) => taskMap.get(id) !== 'done');

if (openBlockers.length > 0) {
  console.error('RELEASE GATE FAILED');
  for (const blocker of openBlockers) {
    console.error(`Open blocker: ${blocker} (status: ${taskMap.get(blocker) || 'missing'})`);
  }
  process.exit(1);
}

console.log('RELEASE GATE PASSED');
