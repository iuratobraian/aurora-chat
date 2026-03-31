#!/usr/bin/env node
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const isWindows = process.platform === 'win32';

const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function run(command, options = {}) {
  try {
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    log(`[ERROR] Command failed: ${command}`, 'red');
    return false;
  }
}

function getCommitMessage() {
  const args = process.argv.slice(2);
  const msgIndex = args.findIndex(arg => arg === '-m' || arg === '--message');
  if (msgIndex !== -1 && args[msgIndex + 1]) {
    return args.slice(msgIndex + 1).join(' ');
  }
  return `chore: update ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;
}

async function main() {
  log('\n========================================', 'cyan');
  log('  TradePortal Deploy Script', 'cyan');
  log('========================================\n', 'cyan');

  // Get commit message
  const commitMessage = getCommitMessage();

  // Step 1: Check git status and commit
  log('[1/5] Checking git status...', 'cyan');
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  
  if (status.trim()) {
    log('    Changes detected, staging files...', 'yellow');
    run('git add -A');
    log(`    Committing: ${commitMessage}`, 'yellow');
    if (!run(`git commit -m "${commitMessage}"`)) {
      log('    [ERROR] Commit failed!', 'red');
      process.exit(1);
    }
    log('    [OK] Committed successfully', 'green');
  } else {
    log('    [OK] No changes to commit', 'green');
  }

  // Step 2: Push to remote
  log('[2/5] Pushing to remote...', 'cyan');
  if (!run('git push')) {
    log('    [ERROR] Push failed!', 'red');
    process.exit(1);
  }
  log('    [OK] Pushed to origin/main', 'green');

  // Step 3: Build frontend
  log('[3/5] Building frontend...', 'cyan');
  if (!run('npm run build')) {
    log('    [ERROR] Build failed!', 'red');
    process.exit(1);
  }
  log('    [OK] Build successful', 'green');

  // Step 4: Deploy to Vercel
  log('[4/5] Deploying to Vercel...', 'cyan');
  if (!run('npx vercel --prod --yes')) {
    log('    [ERROR] Vercel deploy failed!', 'red');
    process.exit(1);
  }
  log('    [OK] Deployed to Vercel', 'green');

  // Step 5: Deploy Convex (optional)
  log('[5/5] Deploying Convex...', 'cyan');
  if (!run('npx convex deploy')) {
    log('    [WARN] Convex deploy failed or not configured', 'yellow');
  } else {
    log('    [OK] Convex deployed', 'green');
  }

  // Summary
  log('\n========================================', 'green');
  log('  Deploy Complete!', 'green');
  log('========================================\n', 'green');
  log('Production URL: https://tradeportal-2025-platinum.vercel.app/', 'cyan');
  log('');
}

main();
