#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE = join(__dirname, '../../workspace/coordination');
const BRAIN_DB = join(__dirname, '../../brain/db');
const TASKS_IMPLEMENTED = [
  'IMP-001', 'IMP-002', 'IMP-003', 'IMP-005', 'IMP-006', 'IMP-010', 'IMP-012'
];

const MODULES = {
  'semantic-retriever': {
    file: 'lib/aurora/semantic-retriever.mjs',
    description: 'Embedding-based semantic search',
    commands: ['search <query>', 'compute [--force]', 'stats']
  },
  'drift-detector': {
    file: 'lib/aurora/drift-detector.mjs',
    description: 'Automatic drift detection',
    commands: ['detect [--verbose]', 'fix [--apply]', 'report']
  },
  'quality-gate': {
    file: 'lib/aurora/quality-gate.mjs',
    description: 'Knowledge quality validation',
    commands: ['stats', 'review', 'test']
  },
  'pre-task-automation': {
    file: 'lib/aurora/pre-task-automation.mjs',
    description: 'Pre-task context generation',
    commands: ['build <task-id>', 'list [limit]', 'similar <query>']
  },
  'health-monitor': {
    file: 'lib/aurora/health-monitor.mjs',
    description: 'Continuous health monitoring',
    commands: ['check [--verbose]', 'monitor', 'history [limit]', 'trend']
  },
  'knowledge-validator': {
    file: 'lib/aurora/knowledge-validator.mjs',
    description: 'Knowledge validation pipeline',
    commands: ['validate [--force]', 'stats', 'report', 'review']
  },
  'reasoning-with-memory': {
    file: 'lib/aurora/reasoning-with-memory.mjs',
    description: 'Chain-of-thought with memory',
    commands: ['classify <query>', 'risk <query>', 'reason <query>', 'plan <query>']
  }
};

function log(message, type = 'info') {
  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
  console.log(`${icons[type] || ''} ${message}`);
}

async function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: join(__dirname, '../..'),
      stdio: 'pipe',
      shell: true
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', d => stdout += d);
    child.stderr.on('data', d => stderr += d);
    
    child.on('close', code => {
      resolve({ code, stdout, stderr });
    });
    
    child.on('error', reject);
  });
}

async function checkHealth() {
  log('Running health check...', 'info');
  
  try {
    const result = await runCommand('node', [join(__dirname, MODULES['health-monitor'].file), 'check']);
    if (result.code === 0) {
      log('Health check passed', 'success');
    } else {
      log('Health check failed', 'warning');
    }
  } catch (e) {
    log(`Health check error: ${e.message}`, 'error');
  }
}

async function checkDrift() {
  log('Running drift detection...', 'info');
  
  try {
    const result = await runCommand('node', [join(__dirname, MODULES['drift-detector'].file), 'detect']);
    if (result.stdout.includes('No drift')) {
      log('No drift detected', 'success');
    } else {
      log('Drift signals found', 'warning');
    }
  } catch (e) {
    log(`Drift detection error: ${e.message}`, 'error');
  }
}

async function checkSemantic() {
  log('Running semantic search test...', 'info');
  
  try {
    const result = await runCommand('node', [join(__dirname, MODULES['semantic-retriever'].file), 'stats']);
    if (result.code === 0) {
      log('Semantic retriever working', 'success');
    }
  } catch (e) {
    log(`Semantic retriever error: ${e.message}`, 'warning');
  }
}

async function checkKnowledge() {
  log('Checking knowledge stats...', 'info');
  
  try {
    const result = await runCommand('node', [join(__dirname, MODULES['quality-gate'].file), 'stats']);
    if (result.code === 0) {
      log('Quality gate working', 'success');
    }
  } catch (e) {
    log(`Quality gate error: ${e.message}`, 'warning');
  }
}

async function validateKnowledge() {
  log('Running knowledge validation...', 'info');
  
  try {
    const result = await runCommand('node', [join(__dirname, MODULES['knowledge-validator'].file), 'validate']);
    if (result.code === 0) {
      log('Knowledge validation complete', 'success');
    }
  } catch (e) {
    log(`Validation error: ${e.message}`, 'warning');
  }
}

async function runAuroraSync() {
  log('Starting Aurora sync...', 'info');
  
  await checkHealth();
  await checkDrift();
  await checkSemantic();
  await checkKnowledge();
  
  log('Aurora sync complete', 'success');
}

async function showStatus() {
  console.log('\n=== Aurora Intelligence - Module Status ===\n');
  
  for (const [name, module] of Object.entries(MODULES)) {
    const exists = existsSync(join(__dirname, '../..', module.file));
    console.log(`${exists ? '✅' : '❌'} ${name}`);
    console.log(`   ${module.description}`);
    console.log(`   Commands: ${module.commands.join(', ')}\n`);
  }
  
  console.log('=== Implemented Improvements ===\n');
  TASKS_IMPLEMENTED.forEach(t => console.log(`✅ ${t}`));
  console.log();
}

async function showHelp() {
  console.log(`
Aurora Intelligence - Integrated Module Runner

USAGE:
  node aurora-integrator.mjs <command>

COMMANDS:
  sync          Run full Aurora sync (health, drift, semantic, knowledge)
  health        Run health check
  drift         Run drift detection
  semantic      Test semantic search
  knowledge     Check knowledge stats
  validate      Run knowledge validation
  status        Show module status
  help          Show this help

EXAMPLES:
  node aurora-integrator.mjs sync
  node aurora-integrator.mjs health
  node aurora-integrator.mjs status

MODULES:
  semantic-retriever      - Embedding-based semantic search
  drift-detector         - Automatic drift detection
  quality-gate           - Knowledge quality validation
  pre-task-automation     - Pre-task context generation
  health-monitor         - Continuous health monitoring
  knowledge-validator     - Knowledge validation pipeline
  reasoning-with-memory   - Chain-of-thought with memory

To run individual module commands:
  node lib/aurora/<module>.mjs <command> <args>

Example:
  node lib/aurora/semantic-retriever.mjs search "security auth"
`);
}

const command = process.argv[2];

async function main() {
  switch (command) {
    case 'sync':
      await runAuroraSync();
      break;
    case 'health':
      await checkHealth();
      break;
    case 'drift':
      await checkDrift();
      break;
    case 'semantic':
      await checkSemantic();
      break;
    case 'knowledge':
      await checkKnowledge();
      break;
    case 'validate':
      await validateKnowledge();
      break;
    case 'status':
      await showStatus();
      break;
    case 'help':
    case '--help':
    case '-h':
    default:
      if (!command || command === 'help') {
        await showHelp();
      } else {
        console.log(`Unknown command: ${command}`);
        await showHelp();
        process.exit(1);
      }
  }
}

main().catch(e => {
  log(`Fatal error: ${e.message}`, 'error');
  process.exit(1);
});
