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
      scope: cells[3],
      files: cells[4],
      objective: cells[5],
    });
  }
  return tasks;
}

const markdown = fs.readFileSync(boardPath, 'utf8');
const tasks = parseTaskBoard(markdown).filter((task) => task.status === 'todo');

console.log('OPEN WORK');

if (tasks.length === 0) {
  console.log('- no todo tasks');
  process.exit(0);
}

for (const task of tasks) {
  console.log(`- ${task.id} [${task.scope}] ${task.objective}`);
  console.log(`  owner: ${task.owner}`);
  console.log(`  files: ${task.files}`);
}
