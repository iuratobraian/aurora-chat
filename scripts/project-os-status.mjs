import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const coordinationDir = path.join(root, '.agent', 'workspace', 'coordination');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

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
      objective: cells[5],
    });
  }
  return tasks;
}

function parseList(markdown) {
  return markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.replace(/^- /, '').trim());
}

function parseFocus(markdown) {
  return markdown
    .split(/\n## /)
    .slice(1)
    .map((section) => {
      const normalized = section.startsWith('## ') ? section : `## ${section}`;
      const lines = normalized.split(/\r?\n/);
      const agent = lines[0].replace(/^##\s+/, '').trim();
      const taskLine = lines.find((line) => line.startsWith('- TASK-ID:'));
      const stateLine = lines.find((line) => line.startsWith('- Estado:'));
      const workLine = lines.find((line) => line.startsWith('- Voy a hacer:'));
      return {
        agent,
        task: taskLine?.split(':').slice(1).join(':').trim() || '',
        state: stateLine?.split(':').slice(1).join(':').trim() || '',
        work: workLine?.split(':').slice(1).join(':').trim() || '',
      };
    })
    .filter((entry) => entry.task);
}

const tasks = parseTaskBoard(read(path.join(coordinationDir, 'TASK_BOARD.md')));
const blockers = parseList(read(path.join(coordinationDir, 'RELEASE_BLOCKERS.md')));
const focusEntries = parseFocus(read(path.join(coordinationDir, 'CURRENT_FOCUS.md')));

const counts = tasks.reduce((acc, task) => {
  acc[task.status] = (acc[task.status] || 0) + 1;
  return acc;
}, {});

console.log('PROJECT OS STATUS');
console.log(`Total tasks: ${tasks.length}`);
console.log(`Todo: ${counts.todo || 0}`);
console.log(`Claimed: ${counts.claimed || 0}`);
console.log(`In progress: ${counts.in_progress || 0}`);
console.log(`Review: ${counts.review || 0}`);
console.log(`Done: ${counts.done || 0}`);
console.log('');
console.log(`Release blockers tracked: ${blockers.length}`);
console.log('');
console.log('Active focus:');

if (focusEntries.length === 0) {
  console.log('- none');
} else {
  for (const entry of focusEntries) {
    console.log(`- ${entry.agent}: ${entry.task} (${entry.state || 'n/a'}) -> ${entry.work || 'no description'}`);
  }
}
