#!/usr/bin/env node
/**
 * aurora-swarm-start.mjs - Initialize swarm colony
 * 
 * Usage: node scripts/aurora-swarm-start.mjs --phase=1 --agents=4
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SWARM_DIR = path.join(ROOT, '.aurora', 'swarm');
const LOGS_DIR = path.join(SWARM_DIR, 'logs');
const SCRATCH_DIR = path.join(SWARM_DIR, 'scratch');

// Parse arguments
const args = process.argv.slice(2);
const phaseMatch = args.find(a => a.startsWith('--phase='));
const agentsMatch = args.find(a => a.startsWith('--agents='));

const phase = phaseMatch ? phaseMatch.split('=')[1] : '1';
const agentCount = agentsMatch ? parseInt(agentsMatch.split('=')[1]) : 4;

console.log('🐝 AURORA SWARM COLONY - INITIALIZING\n');
console.log(`Phase: ${phase}`);
console.log(`Agents: ${agentCount}\n`);

// Ensure directories exist
console.log('📁 Creating swarm directories...\n');

const dirs = [SWARM_DIR, LOGS_DIR, SCRATCH_DIR];
for (const dir of dirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`  ✅ Created: ${dir}`);
  } else {
    console.log(`  ✓ Exists: ${dir}`);
  }
}

// Initialize agent log files
console.log('\n📝 Initializing agent logs...\n');

const phase1Agents = ['BASH-AGENT', 'GIT-AGENT', 'CORRECT-AGENT', 'DIFF-AGENT'];
const agents = phase === '1' ? phase1Agents : phase1Agents;

for (const agent of agents.slice(0, agentCount)) {
  const logFile = path.join(LOGS_DIR, `${agent.toLowerCase()}.log`);
  const timestamp = new Date().toISOString();
  
  const logContent = `# ${agent} Log

**Session:** ${timestamp}
**Phase:** ${phase}
**Status:** INITIALIZED

---

## Activity Log

[${timestamp}] Agent initialized
[${timestamp}] Waiting for task assignment

---
`;
  
  if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, logContent, 'utf8');
    console.log(`  ✅ Created log: ${logFile}`);
  } else {
    console.log(`  ✓ Log exists: ${logFile}`);
  }
}

// Create session state file
console.log('\n💾 Creating session state...\n');

const sessionState = {
  sessionId: `session-${Date.now()}`,
  phase,
  startTime: new Date().toISOString(),
  agents: agents.slice(0, agentCount).map(name => ({
    name,
    status: 'INITIALIZED',
    task: null,
    startTime: null,
    endTime: null
  })),
  syncPoints: [],
  safetyLog: {
    commands: [],
    gitOperations: [],
    filesModified: []
  }
};

const stateFile = path.join(SWARM_DIR, 'session-state.json');
fs.writeFileSync(stateFile, JSON.stringify(sessionState, null, 2), 'utf8');
console.log(`  ✅ Created: ${stateFile}`);

// Update SESSION_LOG.md
console.log('\n📋 Updating SESSION_LOG.md...\n');

const sessionLogFile = path.join(SWARM_DIR, 'SESSION_LOG.md');
if (fs.existsSync(sessionLogFile)) {
  console.log(`  ✓ SESSION_LOG.md exists`);
} else {
  console.log(`  ⚠️  SESSION_LOG.md not found (create manually)`);
}

console.log('\n✅ SWARM INITIALIZED\n');
console.log('Next steps:');
console.log('1. Review .aurora/swarm/SESSION_LOG.md');
console.log('2. Check agent logs in .aurora/swarm/logs/');
console.log('3. Begin Phase 1 tasks\n');

console.log('📊 Swarm Status:');
console.log(`  Phase: ${phase}`);
console.log(`  Active Agents: ${Math.min(agentCount, agents.length)}`);
console.log(`  Session ID: ${sessionState.sessionId}\n`);
