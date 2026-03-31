import { execSync } from 'child_process';
import process from 'process';
import fs from 'fs';
import path from 'path';

function checkGit() {
  try {
    const status = execSync('git status --short').toString();
    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    return { branch, dirty: status.length > 0 };
  } catch (e) {
    return { branch: 'unknown', dirty: false };
  }
}

async function checkTaskBoard() {
    try {
        const boardPath = path.join(process.cwd(), '.agent/workspace/coordination/TASK_BOARD.md');
        if (!fs.existsSync(boardPath)) {
            console.log('Task Board: ⚠️ TASK_BOARD.md not found');
            return;
        }
        const content = fs.readFileSync(boardPath, 'utf8');
        const lines = content.split('\n');
        const stats = {
            ready: 0,
            in_progress: 0,
            claimed: 0,
            done: 0,
            backlog: 0
        };

        lines.forEach(line => {
            if (line.includes('| ready |')) stats.ready++;
            if (line.includes('| in_progress |')) stats.in_progress++;
            if (line.includes('| claimed |')) stats.claimed++;
            if (line.includes('| done |')) stats.done++;
            if (line.includes('| backlog |') || line.includes('| Sin empezar |')) stats.backlog++;
        });

        console.log(`Task Board: 📊 ${stats.done} done, ⏳ ${stats.in_progress} in progress, 📋 ${stats.ready} ready`);
    } catch (e) {
        console.log('Task Board: ⚠️ Could not parse TASK_BOARD.md');
    }
}

async function pulse() {
  console.log('--- AURORA STARTUP PULSE ---');
  
  const git = checkGit();
  console.log(`Git Branch: ${git.branch}`);
  console.log(`Git State: ${git.dirty ? '⚠️ Dirty' : '✅ Clean'}`);

  await checkTaskBoard();

  console.log('-----------------------------');
  
  if (git.dirty) {
    console.log('👉 Tip: Fix local changes or commit before sync.');
  }
}

pulse().catch(err => {
  console.error('❌ Pulse failed:', err);
  process.exit(1);
});
