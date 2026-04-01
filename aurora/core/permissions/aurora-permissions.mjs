#!/usr/bin/env node
/**
 * aurora-permissions.mjs - Permission System with Risk Classification
 * 
 * Patrón extraído de Claude Code leak:
 * - ML-based auto-approval
 * - Risk classification (LOW/MEDIUM/HIGH)
 * - Protected files
 * - Path traversal prevention
 * 
 * @see docs/CLAUDE_CODE_LEAK_ANALYSIS.md
 */

import fs from 'node:fs';
import path from 'node:path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const PERMISSION_CONFIG = {
  // Permission modes
  modes: {
    DEFAULT: 'default',      // Interactive prompts for HIGH risk
    AUTO: 'auto',           // ML-based auto-approval
    BYPASS: 'bypass',       // Skip all checks
    DENY_ALL: 'deny_all'    // Deny everything
  },
  
  // Risk levels
  riskLevels: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  },
  
  // Protected files (never allow modification)
  protectedFiles: [
    '.gitconfig',
    '.bashrc',
    '.zshrc',
    '.mcp.json',
    '.env.local',
    '.env.aurora',
    'package-lock.json'
  ],
  
  // Protected directories
  protectedDirs: [
    'node_modules',
    '.git',
    'node'
  ],
  
  // Risk thresholds for auto-approval
  autoApproveThresholds: {
    maxFiles: 5,
    maxLinesChanged: 100,
    allowedPatterns: ['*.md', '*.txt', '*.json']
  }
};

// ============================================================================
// PERMISSIONS CLASS
// ============================================================================

export class AuroraPermissions {
  constructor(options = {}) {
    this.config = { ...PERMISSION_CONFIG, ...options };
    this.currentMode = this.config.modes.DEFAULT;
    this.requestLog = [];
    this.approvedPatterns = new Set();
  }

  /**
   * Check permission for tool action
   */
  async checkPermission(tool, action, context = {}) {
    const request = {
      tool,
      action,
      context,
      timestamp: Date.now(),
      id: `${tool}-${action}-${Date.now()}`
    };
    
    // Classify risk
    const risk = await this.classifyRisk(tool, action, context);
    request.risk = risk;
    
    // Get current mode
    const mode = this.currentMode;
    request.mode = mode;
    
    // Log request
    this.requestLog.push(request);
    
    // Check based on mode
    let approved = false;
    
    switch (mode) {
      case this.config.modes.BYPASS:
        approved = true;
        break;
        
      case this.config.modes.DENY_ALL:
        approved = false;
        break;
        
      case this.config.modes.AUTO:
        approved = await this.autoApprove(risk, context);
        break;
        
      case this.config.modes.DEFAULT:
      default:
        // LOW risk = auto-approve, HIGH risk = prompt user
        if (risk === this.config.riskLevels.LOW || 
            risk === this.config.riskLevels.MEDIUM) {
          approved = true;
        } else {
          approved = await this.promptUser(tool, action, risk, context);
        }
    }
    
    request.approved = approved;
    
    return {
      approved,
      risk,
      mode,
      requestId: request.id
    };
  }

  /**
   * Classify risk level
   */
  async classifyRisk(tool, action, context) {
    // Check protected files
    if (this.isProtectedFile(context.file)) {
      return this.config.riskLevels.CRITICAL;
    }
    
    // Check protected directories
    if (this.isInProtectedDir(context.path)) {
      return this.config.riskLevels.CRITICAL;
    }
    
    // Check for path traversal
    if (this.hasPathTraversal(context.path || context.file)) {
      return this.config.riskLevels.HIGH;
    }
    
    // Tool-specific risk classification
    const toolRisk = this.getToolRisk(tool, action);
    
    // Context-specific risk
    const contextRisk = this.getContextRisk(context);
    
    // Return highest risk
    const risks = [toolRisk, contextRisk].filter(Boolean);
    
    return this.getHighestRisk(risks);
  }

  /**
   * Get tool-specific risk
   */
  getToolRisk(tool, action) {
    const riskMap = {
      // LOW risk tools
      'file_read': this.config.riskLevels.LOW,
      'git_status': this.config.riskLevels.LOW,
      'search': this.config.riskLevels.LOW,
      
      // MEDIUM risk tools
      'file_write': this.config.riskLevels.MEDIUM,
      'review': this.config.riskLevels.MEDIUM,
      'analyze': this.config.riskLevels.MEDIUM,
      
      // HIGH risk tools
      'bash': this.config.riskLevels.HIGH,
      'execute': this.config.riskLevels.HIGH,
      'delete': this.config.riskLevels.HIGH,
      
      // CRITICAL risk tools
      'sudo': this.config.riskLevels.CRITICAL,
      'rm_rf': this.config.riskLevels.CRITICAL
    };
    
    return riskMap[tool] || this.config.riskLevels.MEDIUM;
  }

  /**
   * Get context-specific risk
   */
  getContextRisk(context) {
    // Number of files
    if (context.files && context.files.length > 10) {
      return this.config.riskLevels.HIGH;
    }
    
    // Lines to change
    if (context.linesChanged && context.linesChanged > 100) {
      return this.config.riskLevels.HIGH;
    }
    
    // Destructive actions
    if (context.destructive) {
      return this.config.riskLevels.HIGH;
    }
    
    return this.config.riskLevels.LOW;
  }

  /**
   * Get highest risk level
   */
  getHighestRisk(risks) {
    const order = [
      this.config.riskLevels.LOW,
      this.config.riskLevels.MEDIUM,
      this.config.riskLevels.HIGH,
      this.config.riskLevels.CRITICAL
    ];
    
    let highestIndex = 0;
    
    for (const risk of risks) {
      const index = order.indexOf(risk);
      if (index > highestIndex) {
        highestIndex = index;
      }
    }
    
    return order[highestIndex];
  }

  /**
   * Auto-approve based on ML classifier (simplified)
   */
  async autoApprove(risk, context) {
    // LOW risk = always approve
    if (risk === this.config.riskLevels.LOW) {
      return true;
    }
    
    // Check if within thresholds
    const withinThresholds = 
      (!context.files || context.files.length <= this.config.autoApproveThresholds.maxFiles) &&
      (!context.linesChanged || context.linesChanged <= this.config.autoApproveThresholds.maxLinesChanged);
    
    // Check if file pattern is approved
    const patternApproved = context.file && 
      this.config.autoApproveThresholds.allowedPatterns.some(
        pattern => this.matchPattern(context.file, pattern)
      );
    
    return withinThresholds && (risk === this.config.riskLevels.MEDIUM || patternApproved);
  }

  /**
   * Prompt user for approval (simulated)
   */
  async promptUser(tool, action, risk, context) {
    // In production, this would show interactive prompt
    // For now, we'll log and return false (require explicit approval)
    
    console.log('\n⚠️  PERMISSION REQUIRED');
    console.log(`Tool: ${tool}`);
    console.log(`Action: ${action}`);
    console.log(`Risk: ${risk}`);
    
    if (context.file) {
      console.log(`File: ${context.file}`);
    }
    
    console.log('\nIn production, this would prompt for user approval.\n');
    
    // Return false to require explicit approval
    return false;
  }

  /**
   * Check if file is protected
   */
  isProtectedFile(filename) {
    if (!filename) return false;
    
    const baseName = path.basename(filename);
    return this.config.protectedFiles.includes(baseName);
  }

  /**
   * Check if path is in protected directory
   */
  isInProtectedDir(filePath) {
    if (!filePath) return false;
    
    return this.config.protectedDirs.some(
      dir => filePath.includes(`/${dir}/`) || filePath.startsWith(`${dir}/`)
    );
  }

  /**
   * Check for path traversal attempts
   */
  hasPathTraversal(pathStr) {
    if (!pathStr) return false;
    
    // Check for common traversal patterns
    const traversalPatterns = [
      '..',
      '%2e%2e',
      '%252e',
      '\\..',
      '..\\'
    ];
    
    return traversalPatterns.some(pattern => 
      pathStr.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Match pattern (glob-like)
   */
  matchPattern(str, pattern) {
    // Simple glob matching
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(str);
  }

  /**
   * Set permission mode
   */
  setMode(mode) {
    if (!Object.values(this.config.modes).includes(mode)) {
      throw new Error(`Invalid mode: ${mode}`);
    }
    
    this.currentMode = mode;
    console.log(`🔐 Permission mode set to: ${mode}`);
  }

  /**
   * Get current mode
   */
  getMode() {
    return this.currentMode;
  }

  /**
   * Get request log
   */
  getRequestLog() {
    return this.requestLog.slice(-100); // Last 100 requests
  }

  /**
   * Get statistics
   */
  getStats() {
    const log = this.getRequestLog();
    
    return {
      totalRequests: log.length,
      approved: log.filter(r => r.approved).length,
      denied: log.filter(r => !r.approved).length,
      byRisk: {
        low: log.filter(r => r.risk === this.config.riskLevels.LOW).length,
        medium: log.filter(r => r.risk === this.config.riskLevels.MEDIUM).length,
        high: log.filter(r => r.risk === this.config.riskLevels.HIGH).length,
        critical: log.filter(r => r.risk === this.config.riskLevels.CRITICAL).length
      },
      currentMode: this.currentMode
    };
  }

  /**
   * Clear request log
   */
  clearLog() {
    this.requestLog = [];
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let permissionsInstance = null;

export function getPermissions() {
  if (!permissionsInstance) {
    permissionsInstance = new AuroraPermissions();
  }
  return permissionsInstance;
}

export async function checkPermission(tool, action, context) {
  const permissions = getPermissions();
  return await permissions.checkPermission(tool, action, context);
}

export function setPermissionMode(mode) {
  const permissions = getPermissions();
  permissions.setMode(mode);
}

// ============================================================================
// CLI MODE
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const permissions = getPermissions();
  
  if (command === 'mode') {
    const mode = args[1];
    
    if (!mode) {
      console.log(`Current mode: ${permissions.getMode()}`);
      console.log('\nAvailable modes:');
      console.log('  default   - Interactive prompts for HIGH risk');
      console.log('  auto      - ML-based auto-approval');
      console.log('  bypass    - Skip all checks');
      console.log('  deny_all  - Deny everything');
    } else {
      permissions.setMode(mode);
    }
    
  } else if (command === 'stats') {
    const stats = permissions.getStats();
    
    console.log('🔐 Permission System Statistics\n');
    console.log(`Total requests: ${stats.totalRequests}`);
    console.log(`Approved: ${stats.approved}`);
    console.log(`Denied: ${stats.denied}`);
    console.log(`Current mode: ${stats.currentMode}`);
    
    console.log('\nBy risk level:');
    console.log(`  LOW: ${stats.byRisk.low}`);
    console.log(`  MEDIUM: ${stats.byRisk.medium}`);
    console.log(`  HIGH: ${stats.byRisk.high}`);
    console.log(`  CRITICAL: ${stats.byRisk.critical}`);
    
  } else if (command === 'test') {
    // Test permission check
    const testCases = [
      { tool: 'file_read', action: 'read', context: { file: 'README.md' } },
      { tool: 'file_write', action: 'write', context: { file: '.env.local', content: 'test' } },
      { tool: 'bash', action: 'execute', context: { command: 'ls -la' } },
      { tool: 'file_write', action: 'write', context: { file: '../../../etc/passwd' } }
    ];
    
    console.log('🧪 Testing Permission System\n');
    
    for (const testCase of testCases) {
      const result = await permissions.checkPermission(
        testCase.tool,
        testCase.action,
        testCase.context
      );
      
      console.log(`${testCase.tool}:${testCase.action} on ${testCase.context.file || 'N/A'}`);
      console.log(`  Risk: ${result.risk}, Approved: ${result.approved}\n`);
    }
    
  } else {
    console.log('Aurora Permission System\n');
    console.log('Usage:');
    console.log('  node aurora-permissions.mjs mode [mode] - Get/set mode');
    console.log('  node aurora-permissions.mjs stats       - Show statistics');
    console.log('  node aurora-permissions.mjs test        - Run tests');
  }
}
