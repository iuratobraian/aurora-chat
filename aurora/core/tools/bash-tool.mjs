#!/usr/bin/env node
/**
 * bash-tool.mjs - Bash Command Execution Tool
 * 
 * Allows Aurora to execute shell commands safely with:
 * - Command validation and sanitization
 * - Protected command blocking
 * - Path traversal prevention
 * - Timeout enforcement
 * - Output capture
 * 
 * @see docs/CLAUDE_CODE_LEAK_ANALYSIS.md - Tool Registry Pattern
 * @see aurora/core/permissions/aurora-permissions.mjs - Security Patterns
 */

import { exec } from 'node:child_process';
import path from 'node:path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const BASH_TOOL_CONFIG = {
  // Timeout por defecto (5 minutos)
  defaultTimeoutMs: 5 * 60 * 1000,
  
  // Comandos permitidos (whitelist)
  allowedCommands: [
    'ls', 'dir',
    'cat', 'type', 'more', 'less',
    'grep', 'find', 'rg',
    'echo', 'printf',
    'pwd', 'cd',
    'mkdir', 'rmdir',
    'cp', 'mv', 'rename',
    'touch',
    'rm', 'del',
    'git',
    'npm', 'npx', 'node',
    'yarn', 'pnpm',
    'python', 'python3',
    'pip', 'pip3',
    'curl', 'wget',
    'zip', 'unzip',
    'tar',
    'chmod', 'chown',
    'whoami', 'hostname', 'uname',
    'date', 'time',
    'wc', 'head', 'tail',
    'sort', 'uniq',
    'diff', 'patch',
    'jq', // JSON processor
    'code', // VS Code CLI
    'docker', 'docker-compose'
  ],
  
  // Comandos bloqueados (nunca permitir)
  blockedCommands: [
    'sudo',
    'su',
    'pkexec',
    'gksu',
    'rm -rf /',
    'rm -rf /*',
    'dd if=/dev/zero',
    ':(){:|:&};:', // fork bomb
    'mkfs',
    'fdisk',
    'wget | bash',
    'curl | bash',
    'curl | sh',
    'wget | sh',
    'chmod -R 777 /',
    'chown -R'
  ],
  
  // Patrones peligrosos (regex)
  dangerousPatterns: [
    /rm\s+-rf\s+\//,           // rm -rf /
    /rm\s+-rf\s+\*$/,          // rm -rf *
    /:\(\)\{:\|:\&\}\;/,       // fork bomb
    /mkfs\./,                   // format disk
    /dd\s+if=\/dev\/zero/,     // zero fill
    /chmod\s+-R\s+777\s+\//,   // chmod all
    /chown\s+-R/,               // chown recursive root
    /\|\s*(bash|sh)$/,         // pipe to shell
    /curl.*\|\s*(bash|sh)/,    // curl pipe
    /wget.*\|\s*(bash|sh)/     // wget pipe
  ],
  
  // Directorios protegidos
  protectedDirs: [
    '/',
    '/etc',
    '/usr',
    '/bin',
    '/sbin',
    '/var',
    '/boot',
    '/dev',
    '/proc',
    '/sys',
    'C:\\Windows',
    'C:\\Program Files',
    'C:\\Program Files (x86)'
  ]
};

// ============================================================================
// BASH TOOL CLASS
// ============================================================================

export class BashTool {
  constructor(options = {}) {
    this.config = { ...BASH_TOOL_CONFIG, ...options };
    this.commandHistory = [];
  }

  /**
   * Get tool schema (for Tool Registry)
   */
  getSchema() {
    return {
      name: 'bash',
      description: 'Execute shell commands with safety validation',
      parameters: {
        command: { 
          type: 'string', 
          required: true, 
          description: 'Shell command to execute' 
        },
        timeout: { 
          type: 'number', 
          description: 'Timeout in ms (default: 5 min)' 
        },
        cwd: { 
          type: 'string', 
          description: 'Working directory' 
        },
        captureStderr: { 
          type: 'boolean', 
          description: 'Capture stderr (default: true)' 
        }
      },
      returns: {
        output: 'string',
        exitCode: 'number',
        error: 'string | null',
        timedOut: 'boolean'
      }
    };
  }

  /**
   * Execute bash command
   */
  async execute(command, options = {}) {
    const {
      timeout = this.config.defaultTimeoutMs,
      cwd = process.cwd(),
      captureStderr = true
    } = options;

    // Log command
    this.logCommand(command);

    // Validate command
    const validation = this.validateCommand(command, cwd);
    
    if (!validation.valid) {
      return {
        output: '',
        exitCode: -1,
        error: `Command blocked: ${validation.reason}`,
        timedOut: false,
        blocked: true
      };
    }

    // Execute command
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      exec(command, {
        cwd,
        timeout,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        shell: true
      }, (error, stdout, stderr) => {
        const executionTime = Date.now() - startTime;
        
        const result = {
          output: stdout || '',
          exitCode: error?.code || 0,
          error: null,
          timedOut: false,
          executionTime
        };

        if (error) {
          if (error.killed && error.signal === 'SIGTERM') {
            result.timedOut = true;
            result.error = `Command timed out after ${timeout}ms`;
          } else {
            result.error = error.message;
          }
        }

        if (captureStderr && stderr) {
          result.output += stderr;
        }

        // Log result
        this.logResult(command, result);

        resolve(result);
      });
    });
  }

  /**
   * Validate command for safety
   */
  validateCommand(command, cwd = process.cwd()) {
    // Check if command is empty
    if (!command || command.trim().length === 0) {
      return { valid: false, reason: 'Empty command' };
    }

    // Extract base command (first word)
    const baseCommand = command.split(/\s+/)[0].toLowerCase();

    // Check against blocked commands
    for (const blocked of this.config.blockedCommands) {
      if (command.toLowerCase().includes(blocked.toLowerCase())) {
        return { valid: false, reason: `Blocked command: ${blocked}` };
      }
    }

    // Check against dangerous patterns
    for (const pattern of this.config.dangerousPatterns) {
      if (pattern.test(command)) {
        return { valid: false, reason: `Dangerous pattern detected: ${pattern}` };
      }
    }

    // Check if base command is in whitelist (if whitelist is enabled)
    if (this.config.allowedCommands.length > 0) {
      // Allow commands that start with allowed command
      const isAllowed = this.config.allowedCommands.some(
        allowed => baseCommand === allowed || baseCommand.startsWith(allowed + '-')
      );
      
      if (!isAllowed) {
        return { 
          valid: false, 
          reason: `Command not in whitelist: ${baseCommand}` 
        };
      }
    }

    // Check for path traversal
    if (this.hasPathTraversal(command)) {
      return { valid: false, reason: 'Path traversal detected' };
    }

    // Check if accessing protected directories
    if (this.accessesProtectedDir(command, cwd)) {
      return { valid: false, reason: 'Accessing protected directory' };
    }

    return { valid: true, reason: null };
  }

  /**
   * Check for path traversal attempts
   */
  hasPathTraversal(command) {
    const traversalPatterns = [
      '..',
      '%2e%2e',
      '%252e',
      '\\..',
      '..\\'
    ];

    return traversalPatterns.some(pattern => 
      command.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Check if command accesses protected directories
   */
  accessesProtectedDir(command, cwd = process.cwd()) {
    const protectedDirs = this.config.protectedDirs;
    
    for (const protectedDir of protectedDirs) {
      // Normalize paths for comparison
      const normalizedCommand = command.toLowerCase().replace(/\\/g, '/');
      const normalizedProtected = protectedDir.toLowerCase().replace(/\\/g, '/');
      
      if (normalizedCommand.includes(normalizedProtected)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Log command to history
   */
  logCommand(command) {
    this.commandHistory.push({
      command,
      timestamp: Date.now(),
      status: 'pending'
    });
  }

  /**
   * Log result to history
   */
  logResult(command, result) {
    const lastEntry = this.commandHistory[this.commandHistory.length - 1];
    if (lastEntry && lastEntry.command === command) {
      lastEntry.status = result.error ? 'error' : 'success';
      lastEntry.result = result;
    }
  }

  /**
   * Get command history
   */
  getHistory(limit = 10) {
    return this.commandHistory.slice(-limit);
  }

  /**
   * Clear command history
   */
  clearHistory() {
    this.commandHistory = [];
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let bashToolInstance = null;

export function getBashTool() {
  if (!bashToolInstance) {
    bashToolInstance = new BashTool();
  }
  return bashToolInstance;
}

export async function executeBash(command, options = {}) {
  const bashTool = getBashTool();
  return await bashTool.execute(command, options);
}

// ============================================================================
// CLI MODE
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const command = args.join(' ');

  if (!command) {
    console.log('BashTool - Execute shell commands safely\n');
    console.log('Usage: node bash-tool.mjs <command>');
    console.log('\nExamples:');
    console.log('  node bash-tool.mjs ls -la');
    console.log('  node bash-tool.mjs git status');
    console.log('  node bash-tool.mjs npm install\n');
    process.exit(0);
  }

  console.log(`🔧 Executing: ${command}\n`);

  const bashTool = getBashTool();
  
  bashTool.execute(command)
    .then(result => {
      if (result.blocked) {
        console.log('🚫 BLOCKED:', result.error);
        process.exit(1);
      }
      
      if (result.output) {
        console.log(result.output);
      }
      
      if (result.error && !result.timedOut) {
        console.error('❌ Error:', result.error);
      }
      
      if (result.timedOut) {
        console.error('⏱️  Timed out');
      }
      
      console.log(`\n⏱️  Execution time: ${result.executionTime}ms`);
      console.log(`📊 Exit code: ${result.exitCode}`);
      
      process.exit(result.exitCode || 0);
    })
    .catch(error => {
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    });
}
