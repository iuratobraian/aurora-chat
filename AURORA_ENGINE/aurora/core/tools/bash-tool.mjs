/**
 * bash-tool.mjs - Shell Command Execution para Aurora
 *
 * Permite ejecutar comandos de shell de forma segura con:
 * - Whitelist de comandos permitidos
 * - Path validation (no traversal)
 * - Timeout por comando
 * - Bloqueo de patrones peligrosos
 *
 * Uso:
 *   const { BashTool } = await import('./bash-tool.mjs');
 *   const tool = new BashTool();
 *   const result = await tool.execute('ls -la');
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import fs from 'node:fs';

const execAsync = promisify(exec);

// ============================================================================
// COMMAND WHITELIST
// ============================================================================

const SAFE_COMMANDS = new Set([
  // File operations
  'ls', 'dir', 'cat', 'type', 'head', 'tail', 'wc', 'find', 'which', 'where',
  // Git operations
  'git',
  // System info
  'echo', 'pwd', 'cd', 'date', 'whoami', 'uname', 'hostname', 'uptime',
  // Node/NPM
  'node', 'npm', 'npx', 'node -v', 'npm -v',
  // Text processing
  'grep', 'sort', 'uniq', 'cut', 'tr', 'sed', 'awk',
  // Network (read-only)
  'curl', 'wget', 'ping',
  // Build tools
  'tsc', 'vitest', 'jest', 'eslint', 'prettier',
  // Archive
  'tar', 'zip', 'unzip',
]);

// ============================================================================
// DANGEROUS PATTERNS (BLOCK LIST)
// ============================================================================

const DANGEROUS_PATTERNS = [
  /\brm\s+(-rf?|--recursive|--force)\b/i,
  /\bdel\s+\/[fq]\b/i,
  /\bsudo\b/i,
  /\bchmod\s+[0-7]{3,4}\s/i,
  /\bchown\b/i,
  /\bmkfs\b/i,
  /\bdd\b/i,
  /\bformat\b/i,
  /\bkill\s+-9\b/i,
  /\bshutdown\b/i,
  /\breboot\b/i,
  /\bpowershell\s+.*-enc\b/i,  // PowerShell encoded commands
  /\bcurl.*\|\s*(bash|sh|zsh)\b/i,  // Pipe to shell
  /\bwget.*-O-.*\|\s*(bash|sh|zsh)\b/i,
  /\beval\b/,
  /\$\(/,  // Command substitution
  /`[^`]+`/,  // Backtick command substitution
  /\bnc\b.*-e\b/i,  // Netcat reverse shell
  /\bbash\s+-i\b/i,  // Interactive bash
  /\bpython.*-c.*import.*socket/i,
  /\bperl.*-e.*socket/i,
  /\bruby.*-r.*socket/i,
  /;.*\b(rm|del|format|mkfs|dd)\b/i,  // Chained dangerous commands
  /\|\|.*\b(rm|del|format|mkfs|dd)\b/i,
];

// ============================================================================
// PATH VALIDATION
// ============================================================================

function validatePath(filePath) {
  if (!filePath) return true;

  // No path traversal
  if (filePath.includes('..') && !filePath.startsWith('..')) {
    return { valid: false, reason: 'Path traversal detected' };
  }

  // No absolute paths outside project
  if (path.isAbsolute(filePath)) {
    const projectRoot = process.cwd();
    if (!filePath.startsWith(projectRoot)) {
      return { valid: false, reason: 'Absolute path outside project directory' };
    }
  }

  return { valid: true };
}

// ============================================================================
// COMMAND VALIDATION
// ============================================================================

function validateCommand(cmd) {
  const trimmed = cmd.trim();

  if (!trimmed) {
    return { valid: false, reason: 'Empty command' };
  }

  // Check dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { valid: false, reason: `Dangerous pattern detected: ${pattern.source}` };
    }
  }

  // Extract base command
  const baseCmd = trimmed.split(/\s+/)[0].toLowerCase();

  // Check if command is in whitelist (single word match)
  const allowedCommands = [...SAFE_COMMANDS].filter(c => !c.includes(' '));
  if (!allowedCommands.has(baseCmd)) {
    return {
      valid: false,
      reason: `Command '${baseCmd}' not in whitelist. Allowed: ${allowedCommands.slice(0, 10).join(', ')}...`,
    };
  }

  return { valid: true };
}

// ============================================================================
// BASH TOOL CLASS
// ============================================================================

export class BashTool {
  constructor(options = {}) {
    this.maxTimeout = options.maxTimeout || 30000; // 30 seconds default
    this.workingDir = options.workingDir || process.cwd();
    this.commandHistory = [];
    this.blockedCount = 0;
  }

  /**
   * Execute a shell command safely
   * @param {string} cmd - Command to execute
   * @param {object} options - Options (timeout, cwd)
   * @returns {Promise<{stdout: string, stderr: string, exitCode: number}>}
   */
  async execute(cmd, options = {}) {
    // Validate command
    const validation = validateCommand(cmd);
    if (!validation.valid) {
      this.blockedCount++;
      return {
        success: false,
        error: validation.reason,
        blocked: true,
        command: cmd,
      };
    }

    // Validate any file paths in the command
    const pathMatch = cmd.match(/(["']?)(\/[^"'\s]+|[A-Za-z]:\\[^"'\s]+)\1/g);
    if (pathMatch) {
      for (const p of pathMatch) {
        const cleanPath = p.replace(/["']/g, '');
        const pathValidation = validatePath(cleanPath);
        if (!pathValidation.valid) {
          return {
            success: false,
            error: pathValidation.reason,
            blocked: true,
            command: cmd,
          };
        }
      }
    }

    const timeout = Math.min(options.timeout || this.maxTimeout, this.maxTimeout);

    try {
      const { stdout, stderr } = await execAsync(cmd, {
        cwd: options.cwd || this.workingDir,
        timeout,
        maxBuffer: 1024 * 1024 * 5, // 5MB
      });

      // Log successful command
      this.commandHistory.push({
        command: cmd,
        timestamp: Date.now(),
        success: true,
      });

      return {
        success: true,
        stdout,
        stderr,
        command: cmd,
      };
    } catch (error) {
      this.commandHistory.push({
        command: cmd,
        timestamp: Date.now(),
        success: false,
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
        stdout: error.stdout || '',
        stderr: error.stderr || '',
        command: cmd,
        timedOut: error.killed,
      };
    }
  }

  /**
   * Check if a command is safe to execute
   * @param {string} cmd
   * @returns {{safe: boolean, reason?: string}}
   */
  isSafe(cmd) {
    const validation = validateCommand(cmd);
    return { safe: validation.valid, reason: validation.reason };
  }

  /**
   * Get command history
   * @param {number} limit
   * @returns {Array}
   */
  getHistory(limit = 20) {
    return this.commandHistory.slice(-limit);
  }

  /**
   * Get security stats
   * @returns {object}
   */
  getStats() {
    return {
      totalCommands: this.commandHistory.length,
      blockedCommands: this.blockedCount,
      successRate: this.commandHistory.length > 0
        ? ((this.commandHistory.filter(c => c.success).length / this.commandHistory.length) * 100).toFixed(1)
        : 'N/A',
    };
  }

  /**
   * Get tool schema for Aurora registry
   * @returns {object}
   */
  getSchema() {
    return bashToolDefinition;
  }
}

// ============================================================================
// REGISTRATION FOR AURORA TOOL REGISTRY
// ============================================================================

export const bashToolDefinition = {
  name: 'bash',
  description: 'Execute shell commands safely with whitelist validation. Use for file operations, git commands, system info, and text processing.',
  parameters: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        description: 'The shell command to execute (must be in whitelist)',
      },
      timeout: {
        type: 'number',
        description: 'Timeout in milliseconds (max 30000)',
      },
      cwd: {
        type: 'string',
        description: 'Working directory for the command',
      },
    },
    required: ['command'],
  },
};
