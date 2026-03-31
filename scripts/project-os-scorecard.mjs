import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const boardPath = path.join(root, '.agent', 'workspace', 'coordination', 'TASK_BOARD.md');

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
const byOwner = new Map();

for (const task of tasks) {
  if (!task.owner || task.owner === 'unassigned') continue;
  if (!byOwner.has(task.owner)) {
    byOwner.set(task.owner, { total: 0, done: 0, active: 0, blocked: 0 });
  }
  const stats = byOwner.get(task.owner);
  stats.total += 1;
  if (task.status === 'done') stats.done += 1;
  if (['claimed', 'in_progress', 'review'].includes(task.status)) stats.active += 1;
  if (task.status === 'blocked') stats.blocked += 1;
}

console.log('TEAM SCORECARD');

if (byOwner.size === 0) {
  console.log('- no assigned tasks yet');
  process.exit(0);
}

for (const [owner, stats] of byOwner.entries()) {
  console.log(`- ${owner}: total=${stats.total} done=${stats.done} active=${stats.active} blocked=${stats.blocked}`);
}
