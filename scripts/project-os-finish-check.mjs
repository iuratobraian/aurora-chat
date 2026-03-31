import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const boardPath = path.join(root, '.agent', 'workspace', 'coordination', 'TASK_BOARD.md');
const finisherPath = path.join(root, '.agent', 'workspace', 'coordination', 'WORK_FINISHER.md');

function parseTaskBoard(markdown) {
  const tasks = [];
  for (const line of markdown.split(/\r?\n/)) {
    if (!line.startsWith('|')) continue;
    if (line.includes('---') || line.includes('TASK-ID')) continue;
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
    if (cells.length < 7) continue;
    tasks.push({
      id: cells[0],
      status: cells[1],
      owner: cells[2],
    });
  }
  return tasks;
}

const tasks = parseTaskBoard(fs.readFileSync(boardPath, 'utf8'));
const finisher = fs.readFileSync(finisherPath, 'utf8');
const active = tasks.filter((task) => ['claimed', 'in_progress', 'review', 'blocked'].includes(task.status));

const missingBlockedNotes = active
  .filter((task) => task.status === 'blocked')
  .filter((task) => !finisher.includes(`## ${task.id}`));

if (missingBlockedNotes.length > 0) {
  console.error('WORK FINISHER GUARD FAILED');
  for (const task of missingBlockedNotes) {
    console.error(`- blocked task missing finisher entry: ${task.id}`);
  }
  process.exit(1);
}

console.log('WORK FINISHER GUARD PASSED');
