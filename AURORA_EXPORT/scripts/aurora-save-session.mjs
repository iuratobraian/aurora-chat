#!/usr/bin/env node
/**
 * aurora-save-session.mjs - Save current session state
 * 
 * Ejecutar ANTES de cerrar sesión para guardar progreso
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SESSION_DIR = path.join(ROOT, '.aurora', 'sessions');
const SESSION_FILE = path.join(SESSION_DIR, 'current-session.json');

async function saveSession() {
  console.log('💾 Saving Aurora session...\n');
  
  // Ensure directory exists
  if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR, { recursive: true });
  }
  
  // Gather session state
  const session = {
    timestamp: Date.now(),
    git: {
      branch: await exec('git branch --show-current'),
      lastCommit: await exec('git log -1 --oneline'),
      status: await exec('git status --porcelain')
    },
    auroraCheck: {
      file: 'AURORA_CHECK.md',
      lastModified: fs.existsSync(path.join(ROOT, 'AURORA_CHECK.md')) 
        ? fs.statSync(path.join(ROOT, 'AURORA_CHECK.md')).mtime.toISOString()
        : null
    },
    activeAgents: [],
    pendingTasks: [],
    notes: ''
  };
  
  // Read AURORA_CHECK.md for current state
  try {
    const checkContent = fs.readFileSync(path.join(ROOT, 'AURORA_CHECK.md'), 'utf8');
    
    // Parse completed tasks
    const completedMatches = checkContent.match(/\[x\]/gi);
    session.auroraCheck.completedTasks = completedMatches ? completedMatches.length : 0;
    
    // Parse active agents
    const agentMatches = checkContent.match(/│.*AGENT.*│/g);
    if (agentMatches) {
      session.activeAgents = agentMatches.map(a => a.trim());
    }
    
  } catch (error) {
    console.log('⚠️  Could not read AURORA_CHECK.md');
  }
  
  // Save session
  fs.writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2), 'utf8');
  
  console.log('✅ Session saved successfully\n');
  console.log(`📊 Completed tasks: ${session.auroraCheck.completedTasks || 0}`);
  console.log(`📝 Active agents: ${session.activeAgents.length}`);
  console.log(`💾 Session file: ${SESSION_FILE}\n`);
  
  console.log('Next steps:');
  console.log('1. Commit changes: git add . && git commit -m "Save progress"');
  console.log('2. Push to GitHub: git push');
  console.log('3. Close session safely\n');
}

async function exec(cmd) {
  try {
    const { execSync } = await import('node:child_process');
    return execSync(cmd, { encoding: 'utf8', cwd: ROOT }).trim();
  } catch {
    return null;
  }
}

saveSession().catch(console.error);
