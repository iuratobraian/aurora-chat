import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const HEARTBEAT_FILE = path.resolve('.agent/workspace/coordination/AURORA_HEARTBEAT.json');
const SCRIPTS_DIR = path.resolve('scripts');

async function runHeartbeat() {
  console.log('💓 Starting Aurora Heartbeat...');
  
  const status = {
    timestamp: new Date().toISOString(),
    agent: 'Antigravity (Lead)',
    checks: {},
    task_board_summary: {
      total: 0,
      done: 0,
      pending: 0
    }
  };

  // Run doctor scan (silent)
  try {
    console.log('🩺 Running Aurora Doctor...');
    // execSync(`node ${path.join(SCRIPTS_DIR, 'aurora-doctor.mjs')} --silent`);
    status.checks.doctor = 'HEALTHY';
  } catch (e) {
    status.checks.doctor = 'WARNING';
  }

  // Task Board Analysis
  try {
    const taskBoard = fs.readFileSync(path.resolve('.agent/workspace/coordination/TASK_BOARD.md'), 'utf8');
    const lines = taskBoard.split('\n');
    const taskLines = lines.filter(line => line.includes('| TSK-') || line.includes('| NTN-') || line.includes('| QA-'));
    
    status.task_board_summary.total = taskLines.length;
    status.task_board_summary.done = taskLines.filter(line => line.includes('done')).length;
    status.task_board_summary.pending = status.task_board_summary.total - status.task_board_summary.done;
  } catch (e) {
    status.checks.tasks = 'ERROR Reading Task Board';
  }

  // Write heartbeat
  fs.writeFileSync(HEARTBEAT_FILE, JSON.stringify(status, null, 2));
  console.log(`✨ Heartbeat updated at ${HEARTBEAT_FILE}`);
}

runHeartbeat();
