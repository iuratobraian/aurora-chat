#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_FILE = '.agent/brain/db/retry-strategy-log.jsonl';
const ERROR_PATTERNS_FILE = '.agent/brain/db/error-patterns.jsonl';

const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  jitter: 0.3,
  backoffMultiplier: 2
};

const ERROR_PATTERNS = [
  { pattern: /Cannot find module/, category: 'import', severity: 'high', fix: 'check_import_path' },
  { pattern: /TS2307/, category: 'import', severity: 'high', fix: 'check_import_path' },
  { pattern: /Type error/, category: 'type', severity: 'high', fix: 'check_type_definition' },
  { pattern: /TS2322/, category: 'type', severity: 'medium', fix: 'check_type_assignment' },
  { pattern: /Syntax error/, category: 'syntax', severity: 'critical', fix: 'check_syntax' },
  { pattern: /Module not found/, category: 'import', severity: 'high', fix: 'check_package_json' },
  { pattern: /ENOENT/, category: 'filesystem', severity: 'high', fix: 'check_file_exists' },
  { pattern: /Permission denied/, category: 'filesystem', severity: 'medium', fix: 'check_permissions' },
  { pattern: /timeout/i, category: 'timeout', severity: 'medium', fix: 'increase_timeout' },
  { pattern: /EADDRINUSE/, category: 'port', severity: 'medium', fix: 'kill_port_process' }
];

function log(level, message, data = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data
  };
  console.log(`[${level.toUpperCase()}] ${message}`, data);
  
  try {
    const dir = path.dirname(LOG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');
  } catch (e) {
    console.error('Failed to write log:', e.message);
  }
}

function calculateDelay(attempt, baseDelay, maxDelay, multiplier, jitter) {
  const exponentialDelay = baseDelay * Math.pow(multiplier, attempt);
  const cappedDelay = Math.min(exponentialDelay, maxDelay);
  const jitterAmount = cappedDelay * jitter * Math.random();
  return Math.floor(cappedDelay + jitterAmount);
}

function analyzeError(errorOutput) {
  const findings = [];
  
  for (const { pattern, category, severity, fix } of ERROR_PATTERNS) {
    if (pattern.test(errorOutput)) {
      findings.push({ category, severity, fix, raw: errorOutput.substring(0, 200) });
    }
  }
  
  return findings;
}

function suggestFix(finding) {
  const fixes = {
    check_import_path: 'Verificar que la ruta del import sea correcta. Usar rutas relativas normalizadas (../../lib/)',
    check_type_definition: 'Verificar que el tipo esté correctamente definido o exportado',
    check_type_assignment: 'Revisar compatibilidad de tipos en asignaciones',
    check_syntax: 'Revisar sintaxis del archivo indicado en el error',
    check_package_json: 'Verificar que el paquete esté en package.json y instalado (npm install)',
    check_file_exists: 'Verificar que el archivo/directorio existe en la ruta especificada',
    check_permissions: 'Verificar permisos del archivo o directorio',
    increase_timeout: 'Incrementar timeout en la configuración del proceso',
    kill_port_process: 'Ejecutar: npx kill-port <puerto> o encontrar proceso con lsof'
  };
  
  return fixes[finding.fix] || 'Revisar error manualmente';
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const { timeout = 60000, retries = RETRY_CONFIG.maxRetries } = options;
    
    let attempt = 0;
    
    const tryRun = () => {
      attempt++;
      log('info', `Attempt ${attempt}/${retries + 1}: ${command} ${args.join(' ')}`);
      
      const proc = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
        cwd: process.cwd()
      });
      
      let stdout = '';
      let stderr = '';
      let timedOut = false;
      
      const timeoutId = setTimeout(() => {
        timedOut = true;
        proc.kill('SIGTERM');
        log('warn', `Command timed out after ${timeout}ms`);
      }, timeout);
      
      proc.stdout.on('data', (data) => { stdout += data.toString(); });
      proc.stderr.on('data', (data) => { stderr += data.toString(); });
      
      proc.on('close', (code) => {
        clearTimeout(timeoutId);
        
        const fullOutput = stdout + stderr;
        
        if (code === 0) {
          log('success', `Command succeeded on attempt ${attempt}`);
          resolve({ success: true, stdout, stderr, code, attempt });
        } else if (attempt <= retries) {
          const findings = analyzeError(fullOutput);
          log('warn', `Command failed (attempt ${attempt}), retrying...`, { findings });
          
          const delay = calculateDelay(
            attempt,
            RETRY_CONFIG.baseDelay,
            RETRY_CONFIG.maxDelay,
            RETRY_CONFIG.backoffMultiplier,
            RETRY_CONFIG.jitter
          );
          
          log('info', `Waiting ${delay}ms before retry...`);
          setTimeout(tryRun, delay);
        } else {
          const findings = analyzeError(fullOutput);
          log('error', `Command failed after ${attempt} attempts`);
          resolve({ success: false, stdout, stderr, code, attempt, findings });
        }
      });
      
      proc.on('error', (err) => {
        clearTimeout(timeoutId);
        if (attempt <= retries) {
          log('warn', `Error: ${err.message}, retrying...`);
          setTimeout(tryRun, calculateDelay(attempt, RETRY_CONFIG.baseDelay, RETRY_CONFIG.maxDelay, RETRY_CONFIG.backoffMultiplier, RETRY_CONFIG.jitter));
        } else {
          reject(err);
        }
      });
    };
    
    tryRun();
  });
}

async function smartRetry(command, args) {
  log('info', 'Starting Smart Retry Strategy', { command, args });
  
  const result = await runCommand(command, args);
  
  if (result.findings && result.findings.length > 0) {
    log('info', 'Error analysis and suggestions:');
    result.findings.forEach((finding, i) => {
      console.log(`\n${i + 1}. [${finding.severity.toUpperCase()}] ${finding.category}`);
      console.log(`   Error: ${finding.raw}`);
      console.log(`   Suggestion: ${suggestFix(finding)}`);
    });
    
    const criticalFindings = result.findings.filter(f => f.severity === 'critical');
    if (criticalFindings.length > 0) {
      log('error', 'Critical errors detected - manual intervention required');
    }
  }
  
  return result;
}

async function diagnoseBuild() {
  log('info', 'Running diagnostic build...');
  
  const commands = [
    { cmd: 'npm', args: ['run', 'lint'], label: 'Lint' },
    { cmd: 'npm', args: ['run', 'build'], label: 'Build' }
  ];
  
  const results = [];
  
  for (const { cmd, args, label } of commands) {
    log('info', `Running ${label}...`);
    const result = await runCommand(cmd, args, { timeout: 90000, retries: 2 });
    results.push({ label, ...result });
  }
  
  const allSuccess = results.every(r => r.success);
  
  log('info', 'Diagnostic complete', { 
    total: results.length, 
    success: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length 
  });
  
  return { success: allSuccess, results };
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Aurora Smart Retry Strategy - ERR-001
=======================================

Usage:
  node aurora-smart-retry.mjs <command> [args...]
  node aurora-smart-retry.mjs diagnose

Examples:
  node aurora-smart-retry.mjs npm run lint
  node aurora-smart-retry.mjs tsc --noEmit
  node aurora-smart-retry.mjs npm run build
  node aurora-smart-retry.mjs diagnose

Features:
  - Exponential backoff with jitter
  - Automatic error pattern analysis
  - Fix suggestions based on error categories
  - Detailed logging to .agent/brain/db/retry-strategy-log.jsonl
  - Retry strategy: ${RETRY_CONFIG.maxRetries} retries, ${RETRY_CONFIG.baseDelay}ms base delay
    `);
    process.exit(0);
  }
  
  if (args[0] === 'diagnose') {
    const result = await diagnoseBuild();
    process.exit(result.success ? 0 : 1);
  }
  
  const command = args[0];
  const commandArgs = args.slice(1);
  
  const result = await smartRetry(command, commandArgs);
  
  process.exit(result.success ? 0 : 1);
}

main().catch(err => {
  log('error', 'Fatal error', { error: err.message });
  process.exit(1);
});
