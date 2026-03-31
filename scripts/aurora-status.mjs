import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PROJECT_ROOT = "C:\\Users\\iurato\\Downloads\\tradeportal-2025-platinum";
const TASK_BOARD = path.join(PROJECT_ROOT, '.agent', 'workspace', 'coordination', 'TASK_BOARD.md');

function checkConvex() {
  try {
    execSync('npx convex --version', { stdio: 'ignore' });
    return "✅ OK";
  } catch (e) {
    return "❌ Not installed or not in PATH";
  }
}

function checkVite() {
  try {
    execSync('npx vite --version', { stdio: 'ignore' });
    return "✅ OK";
  } catch (e) {
    return "❌ Not installed";
  }
}

function getTaskSummary() {
  if (!fs.existsSync(TASK_BOARD)) return "Board not found";
  const content = fs.readFileSync(TASK_BOARD, 'utf8');
  const pending = (content.match(/\| [^|]* \| pending/g) || []).length;
  const inProgress = (content.match(/\| [^|]* \| in-progress/g) || []).length;
  const done = (content.match(/\| [^|]* \| done/g) || []).length;
  return `Pending: ${pending}, In-Progress: ${inProgress}, Done: ${done}`;
}

console.log("=== AURORA SYSTEM STATUS ===");
console.log(`Convex: ${checkConvex()}`);
console.log(`Vite: ${checkVite()}`);
console.log(`Task Board: ${getTaskSummary()}`);
console.log("============================");
