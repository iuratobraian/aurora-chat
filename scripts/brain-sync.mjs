import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const brainDir = path.join(root, '.agent', 'brain');
const coordinationDir = path.join(root, '.agent', 'workspace', 'coordination');

const files = {
  decisions: path.join(coordinationDir, 'DECISIONS.md'),
  agentLog: path.join(coordinationDir, 'AGENT_LOG.md'),
  learningLog: path.join(coordinationDir, 'LEARNING_LOG.md'),
  output: path.join(brainDir, 'generated', 'PROJECT_BRAIN.md'),
  memory: path.join(brainDir, 'datasets', 'TASK_MEMORY.jsonl'),
};

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function parseLearningLog(markdown) {
  return markdown
    .split(/\n## /)
    .slice(1)
    .map((section) => {
      const normalized = section.startsWith('## ') ? section : `## ${section}`;
      const lines = normalized.split(/\r?\n/);
      const taskId = lines[0].replace(/^##\s+/, '').trim();
      const entry = { taskId };

      for (const line of lines.slice(1)) {
        const match = line.match(/^- ([^:]+):\s*(.*)$/);
        if (!match) continue;
        entry[match[1].trim().toLowerCase()] = match[2].trim();
      }

      return entry;
    })
    .filter((entry) => {
      if (!entry.taskId) return false;
      if (!/^(TP|INF|OPS|TASK)-/i.test(entry.taskId)) return false;
      if (entry.taskId === 'TASK-ID') return false;
      return true;
    });
}

const decisions = read(files.decisions);
const agentLog = read(files.agentLog);
const learningLog = read(files.learningLog);
const learningEntries = parseLearningLog(learningLog);

const snapshot = [
  '# Project Brain Snapshot',
  '',
  '## Mission',
  'Preservar el mejor conocimiento operativo y técnico del proyecto.',
  '',
  '## Decisions',
  decisions.trim(),
  '',
  '## Recent Agent Log',
  agentLog.trim(),
  '',
  '## Distilled Learnings',
  learningEntries.length === 0 ? '- no learnings recorded yet' : '',
  ...learningEntries.map((entry) => `- ${entry.taskId}: ${entry['qué se aprendió'] || 'learning pending'}`),
  '',
].join('\n');

fs.writeFileSync(files.output, snapshot);

const jsonl = learningEntries
  .map((entry) => JSON.stringify(entry))
  .join('\n');

fs.writeFileSync(files.memory, jsonl ? `${jsonl}\n` : '');

console.log(`PROJECT BRAIN SYNCED: ${learningEntries.length} learning entries`);
