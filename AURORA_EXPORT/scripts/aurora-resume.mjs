#!/usr/bin/env node
/**
 * aurora-resume.mjs - Resume work from last checkpoint
 * 
 * Ejecutar para continuar después de load-session
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const AURORA_CHECK = path.join(ROOT, 'AURORA_CHECK.md');

async function resume() {
  console.log('🔄 Resuming Aurora development...\n');
  
  if (!fs.existsSync(AURORA_CHECK)) {
    console.log('❌ AURORA_CHECK.md not found\n');
    console.log('Create it first with: node scripts/aurora-create-check.mjs\n');
    return;
  }
  
  const content = fs.readFileSync(AURORA_CHECK, 'utf8');
  
  // Find first incomplete task
  const pendingTasks = content.match(/\| (AC-\d+) \|.*\| ⏳ PENDING \|/g);
  
  if (!pendingTasks || pendingTasks.length === 0) {
    console.log('✅ All tasks complete! Starting new phase...\n');
    return;
  }
  
  const nextTask = pendingTasks[0];
  const taskId = nextTask.match(/AC-\d+/)[0];
  
  console.log('📋 Next Task to Resume:\n');
  console.log(nextTask);
  console.log('\n');
  
  // Find task details
  const taskSection = content.match(new RegExp(`### \\*\\*${taskId}:.*?---`, 's'));
  
  if (taskSection) {
    console.log('📝 Task Details:\n');
    console.log(taskSection[0].replace(/---$/, '').trim());
    console.log('\n');
  }
  
  console.log('💡 To begin work:');
  console.log(`1. Assign agent to ${taskId}`);
  console.log('2. Update AURORA_CHECK.md with agent assignment');
  console.log('3. Start implementation\n');
  
  console.log('Ready to continue? (y/n)');
}

resume().catch(console.error);
