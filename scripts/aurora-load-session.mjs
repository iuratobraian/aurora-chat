#!/usr/bin/env node
/**
 * aurora-load-session.mjs - Load previous session state
 * 
 * Ejecutar AL ABRIR sesión para restaurar contexto
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SESSION_FILE = path.join(ROOT, '.aurora', 'sessions', 'current-session.json');

async function loadSession() {
  console.log('📥 Loading Aurora session...\n');
  
  if (!fs.existsSync(SESSION_FILE)) {
    console.log('ℹ️  No previous session found\n');
    console.log('Starting fresh session...\n');
    return;
  }
  
  const session = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
  
  console.log('📊 Previous Session Summary\n');
  console.log(`Timestamp: ${new Date(session.timestamp).toLocaleString()}`);
  console.log(`Branch: ${session.git?.branch || 'unknown'}`);
  console.log(`Last Commit: ${session.git?.lastCommit || 'unknown'}`);
  console.log(`Completed Tasks: ${session.auroraCheck?.completedTasks || 0}`);
  console.log(`Active Agents: ${session.activeAgents?.length || 0}\n`);
  
  if (session.git?.status) {
    const hasChanges = session.git.status.trim().length > 0;
    console.log(`Working Tree: ${hasChanges ? '⚠️  Has uncommitted changes' : '✅ Clean'}\n`);
  }
  
  console.log('📋 To resume work:\n');
  console.log('1. Review AURORA_CHECK.md for task status');
  console.log('2. Check git status for uncommitted changes');
  console.log('3. Run: node scripts/aurora-resume.mjs\n');
  
  // Show last handoff brief if exists
  const handoffFile = path.join(ROOT, '.aurora', 'handoff-brief.md');
  if (fs.existsSync(handoffFile)) {
    console.log('📝 Last Handoff Brief:\n');
    const brief = fs.readFileSync(handoffFile, 'utf8');
    console.log(brief.split('\n').slice(0, 20).join('\n'));
    console.log('...\n');
  }
}

loadSession().catch(console.error);
