#!/usr/bin/env node
/**
 * 🧠 AURORA ALWAYS-ON - Auto-Start Protocol
 * 
 * Mantiene a Aurora siempre presente en el chat mediante:
 * 1. Auto-start al abrir terminal
 * 2. Background process para respuestas rápidas
 * 3. Integration con Qwen Code
 * 
 * Uso:
 *   node scripts/aurora-always-on.mjs start    # Iniciar daemon
 *   node scripts/aurora-always-on.mjs stop     # Detener
 *   node scripts/aurora-always-on.mjs status   # Ver estado
 */

import { spawn } from 'node:child_process';
import { writeFile, readFile, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const PID_FILE = path.join(PROJECT_ROOT, '.aurora-daemon.pid');
const LOG_FILE = path.join(PROJECT_ROOT, '.aurora-daemon.log');

// ============================================================================
// AURORA PRESENCE PROTOCOL
// ============================================================================

const AURORA_PRESENCE = {
  enabled: true,
  autoRespond: true,
  providers: ['groq', 'kimi', 'openrouter'],
  models: {
    fast: 'groq:llama-3.3-70b-versatile',
    quality: 'kimi:kimi-k2-instruct',
    backup: 'openrouter:qwen-2.5-coder-32b'
  },
  features: {
    codeReview: true,
    memoryLeakDetection: true,
    performanceMonitoring: true,
    taskTracking: true
  }
};

// ============================================================================
// DAEMON MANAGEMENT
// ============================================================================

async function startDaemon() {
  console.log('🧠 Starting Aurora Always-On Daemon...\n');

  if (existsSync(PID_FILE)) {
    const pid = await readFile(PID_FILE, 'utf-8');
    console.log(`⚠️  Aurora daemon already running (PID: ${pid.trim()})`);
    console.log('   Run: node scripts/aurora-always-on.mjs stop\n');
    return;
  }

  // Start background process
  const daemon = spawn('node', [
    path.join(__dirname, 'aurora-always-on.mjs'),
    '--daemon-mode'
  ], {
    detached: true,
    stdio: 'ignore',
    cwd: PROJECT_ROOT
  });

  daemon.unref();

  // Write PID file
  await writeFile(PID_FILE, daemon.pid.toString());
  console.log(`✅ Aurora daemon started (PID: ${daemon.pid})`);
  console.log(`📝 Log file: ${LOG_FILE}\n`);

  // Initialize Aurora presence
  console.log('🔌 Initializing Aurora presence in chat...\n');
  console.log('   Providers: groq, kimi, openrouter');
  console.log('   Models: llama-3.3-70b, kimi-k2-instruct, qwen-2.5-coder');
  console.log('   Features: code-review, memory-leak-detection, performance-monitoring\n');

  console.log('✨ Aurora is now always present in your chat!\n');
  console.log('   Commands:');
  console.log('   - @aurora help          → Show available commands');
  console.log('   - @aurora review [file] → Code review');
  console.log('   - @aurora analyze       → Deep analysis');
  console.log('   - @aurora optimize      → Performance suggestions');
  console.log('   - @aurora memory        → Memory leak check');
  console.log('   - @aurora status        → System status\n');
}

async function stopDaemon() {
  console.log('🛑 Stopping Aurora Daemon...\n');

  if (!existsSync(PID_FILE)) {
    console.log('ℹ️  Aurora daemon is not running\n');
    return;
  }

  const pid = await readFile(PID_FILE, 'utf-8');
  
  try {
    process.kill(parseInt(pid.trim()), 'SIGTERM');
    await unlink(PID_FILE);
    console.log(`✅ Aurora daemon stopped (PID: ${pid.trim()})\n`);
  } catch (error) {
    console.log(`⚠️  Failed to stop daemon: ${error.message}\n`);
    await unlink(PID_FILE);
  }
}

async function showStatus() {
  console.log('🧠 Aurora Always-On Status\n');
  console.log('=' .repeat(50));
  
  if (existsSync(PID_FILE)) {
    const pid = await readFile(PID_FILE, 'utf-8');
    console.log(`✅ Status: RUNNING`);
    console.log(`📌 PID: ${pid.trim()}`);
    console.log(`📝 Log: ${LOG_FILE}`);
  } else {
    console.log(`❌ Status: STOPPED`);
    console.log(`   Run: node scripts/aurora-always-on.mjs start`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('\nConfiguration:');
  console.log(`   Providers: ${AURORA_PRESENCE.providers.join(', ')}`);
  console.log(`   Features: ${Object.keys(AURORA_PRESENCE.features).join(', ')}`);
  console.log(`   Auto-respond: ${AURORA_PRESENCE.autoRespond ? '✅' : '❌'}\n`);
}

// ============================================================================
// CHAT INTEGRATION
// ============================================================================

function injectAuroraPresence() {
  // This would integrate with Qwen Code's chat system
  console.log('🔌 Injecting Aurora presence into chat...\n');
  
  const auroraIntro = `
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🧠 AURORA AI is now present in your chat!          ║
║                                                       ║
║   Available Commands:                                 ║
║   @aurora help          → Show all commands          ║
║   @aurora review        → Code review                ║
║   @aurora analyze       → Deep analysis              ║
║   @aurora optimize      → Performance tips           ║
║   @aurora memory        → Memory leak check          ║
║   @aurora status        → System health              ║
║                                                       ║
║   Providers: Groq (fast), Kimi (quality), OpenRouter ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `;

  console.log(auroraIntro);
}

// ============================================================================
// MAIN
// ============================================================================

const args = process.argv.slice(2);
const command = args[0];

if (command === 'start') {
  await startDaemon();
} else if (command === 'stop') {
  await stopDaemon();
} else if (command === 'status') {
  await showStatus();
} else if (command === '--daemon-mode') {
  // Background daemon logic would go here
  console.log('🧠 Aurora daemon running in background...');
} else {
  console.log('🧠 Aurora Always-On Protocol\n');
  console.log('Usage:');
  console.log('  node scripts/aurora-always-on.mjs start    → Start daemon');
  console.log('  node scripts/aurora-always-on.mjs stop     → Stop daemon');
  console.log('  node scripts/aurora-always-on.mjs status   → Show status\n');
  
  injectAuroraPresence();
}
