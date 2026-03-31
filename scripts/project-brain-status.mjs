import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const learningLogPath = path.join(root, '.agent', 'workspace', 'coordination', 'LEARNING_LOG.md');
const memoryPath = path.join(root, '.agent', 'brain', 'datasets', 'TASK_MEMORY.jsonl');

const learningLog = fs.readFileSync(learningLogPath, 'utf8');
const entries = learningLog.split(/\n## /).slice(1).length;
const memoryLines = fs.existsSync(memoryPath)
  ? fs.readFileSync(memoryPath, 'utf8').split(/\r?\n/).filter(Boolean).length
  : 0;

console.log('PROJECT BRAIN STATUS');
console.log(`Learning entries: ${entries}`);
console.log(`Memory records: ${memoryLines}`);
