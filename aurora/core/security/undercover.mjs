#!/usr/bin/env node
/**
 * undercover.mjs - Undercover Mode for Public Repos
 * 
 * Hide internal information when working in public repos:
 * - Auto-detect public repos
 * - Hide internal codenames
 * - Hide "Aurora AI" mentions
 * - Block sensitive info in commits
 * - Inject system prompt restrictions
 * 
 * @see docs/CLAUDE_CODE_LEAK_ANALYSIS.md - Undercover Mode
 * @see aurora/core/permissions/aurora-permissions.mjs - Security
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const UNDERCOVER_CONFIG = {
  // Internal allowlist (private repos)
  internalAllowlist: [
    'github.com/iuratobraian/trade-share',
    'github.com/iuratobraian/aurora',
    'github.com/my-internal-org/*'
  ],

  // Internal codenames to hide
  internalCodenames: [
    'Tengu',
    'Fennec',
    'Capybara',
    'KAIROS',
    'ULTRAPLAN',
    'Chicago',
    'Penguin Mode',
    'Aurora AI Framework'
  ],

  // Replacement terms
  replacements: {
    'Aurora AI Framework': 'assistant',
    'Aurora AI': 'assistant',
    'KAIROS': 'always-on mode',
    'ULTRAPLAN': 'remote planning',
    'Tengu': 'internal-project',
    'Fennec': 'internal-model',
    'Capybara': 'internal-model',
    'Chicago': 'computer-use',
    'Penguin Mode': 'fast mode'
  },

  // Sensitive patterns to block
  sensitivePatterns: [
    /api[_-]?key['"]?\s*[:=]\s*['"][^'"]+['"]/gi,
    /password['"]?\s*[:=]\s*['"][^'"]+['"]/gi,
    /secret['"]?\s*[:=]\s*['"][^'"]+['"]/gi,
    /token['"]?\s*[:=]\s*['"][^'"]+['"]/gi,
    /PRIVATE[_-]?KEY/gi,
    /AWS[_-]?SECRET/gi
  ]
};

export class UndercoverMode {
  constructor(options = {}) {
    this.config = { ...UNDERCOVER_CONFIG, ...options };
    this.isUndercover = false;
    this.currentRepo = null;
  }

  /**
   * Get tool schema
   */
  getSchema() {
    return {
      name: 'undercover',
      description: 'Hide internal information in public repos',
      parameters: {
        operation: {
          type: 'string',
          required: true,
          enum: ['check', 'enable', 'disable', 'sanitize', 'status'],
          description: 'Undercover operation'
        },
        text: {
          type: 'string',
          description: 'Text to sanitize'
        },
        repoPath: {
          type: 'string',
          description: 'Repository path to check'
        }
      },
      returns: {
        isUndercover: 'boolean',
        repo: 'string',
        sanitized: 'string'
      }
    };
  }

  /**
   * Execute undercover operation
   */
  async execute(operation, options = {}) {
    switch (operation) {
      case 'check':
        return await this.checkRepo(options.repoPath);
      case 'enable':
        return await this.enable(options.repoPath);
      case 'disable':
        return this.disable();
      case 'sanitize':
        return this.sanitize(options.text);
      case 'status':
        return this.getStatus();
      default:
        return { error: `Unknown operation: ${operation}` };
    }
  }

  /**
   * Check if repo is public
   */
  async checkRepo(repoPath = process.cwd()) {
    try {
      // Get git remote
      const remote = this.getGitRemote(repoPath);
      
      if (!remote) {
        return {
          isPublic: false,
          reason: 'No git remote found',
          undercover: false
        };
      }

      this.currentRepo = remote;

      // Check if in internal allowlist
      const isInternal = this.isInternalRepo(remote);
      
      if (isInternal) {
        return {
          isPublic: false,
          reason: 'Internal repo (allowlisted)',
          undercover: false,
          repo: remote
        };
      }

      // Check if repo is public (simplified - in production would check GitHub API)
      const isPublic = this.isPublicRepo(remote);

      return {
        isPublic,
        reason: isPublic ? 'Public repo detected' : 'Private repo',
        undercover: isPublic,
        repo: remote
      };
    } catch (error) {
      return {
        isPublic: false,
        reason: `Error checking repo: ${error.message}`,
        undercover: false
      };
    }
  }

  /**
   * Enable undercover mode
   */
  async enable(repoPath = process.cwd()) {
    const check = await this.checkRepo(repoPath);
    
    this.isUndercover = check.undercover;
    
    if (this.isUndercover) {
      console.log('\n🕵️ UNDERCOVER MODE ENABLED\n');
      console.log(`Repo: ${check.repo}`);
      console.log('Reason: Public repo detected\n');
      console.log('Restrictions:');
      console.log('  - Internal codenames hidden');
      console.log('  - "Aurora AI" → "assistant"');
      console.log('  - Sensitive info blocked\n');
    }

    return {
      enabled: this.isUndercover,
      repo: check.repo,
      reason: check.reason
    };
  }

  /**
   * Disable undercover mode
   */
  disable() {
    this.isUndercover = false;
    
    console.log('\n✅ UNDERCOVER MODE DISABLED\n');
    
    return {
      enabled: false
    };
  }

  /**
   * Sanitize text (remove/hide sensitive info)
   */
  sanitize(text) {
    if (!this.isUndercover) {
      return {
        original: text,
        sanitized: text,
        changed: false
      };
    }

    let sanitized = text;
    let changed = false;

    // Replace internal codenames
    for (const [internal, replacement] of Object.entries(this.config.replacements)) {
      const regex = new RegExp(internal, 'gi');
      if (regex.test(sanitized)) {
        sanitized = sanitized.replace(regex, replacement);
        changed = true;
      }
    }

    // Block sensitive patterns
    for (const pattern of this.config.sensitivePatterns) {
      if (pattern.test(sanitized)) {
        sanitized = sanitized.replace(pattern, '[REDACTED]');
        changed = true;
      }
    }

    if (changed) {
      console.log('\n🕵️ Text sanitized for public repo\n');
    }

    return {
      original: text,
      sanitized,
      changed,
      reason: this.isUndercover ? 'Undercover mode active' : 'Not in undercover mode'
    };
  }

  /**
   * Get status
   */
  getStatus() {
    return {
      isUndercover: this.isUndercover,
      currentRepo: this.currentRepo,
      restrictions: this.isUndercover ? {
        codenamesHidden: this.config.internalCodenames.length,
        replacements: Object.keys(this.config.replacements).length,
        sensitivePatterns: this.config.sensitivePatterns.length
      } : null
    };
  }

  /**
   * Get git remote URL
   */
  getGitRemote(repoPath) {
    try {
      const remote = execSync('git remote get-url origin', {
        cwd: repoPath,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      }).trim();

      // Normalize URL
      if (remote.startsWith('git@')) {
        // SSH: git@github.com:user/repo.git → github.com/user/repo
        return remote.replace('git@', 'https://').replace('.git', '').split('/').slice(-2).join('/');
      } else if (remote.startsWith('http')) {
        // HTTPS: https://github.com/user/repo.git → github.com/user/repo
        return remote.replace('https://', '').replace('.git', '').split('/').slice(-2).join('/');
      }

      return remote;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if repo is internal (allowlisted)
   */
  isInternalRepo(remote) {
    for (const allowed of this.config.internalAllowlist) {
      if (allowed.endsWith('*')) {
        // Wildcard match
        const prefix = allowed.slice(0, -1);
        if (remote.startsWith(prefix)) {
          return true;
        }
      } else {
        // Exact match
        if (remote === allowed) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check if repo is public (simplified)
   * In production, would check GitHub API
   */
  isPublicRepo(remote) {
    // Simplified logic: assume non-internal repos are public
    // In production: call GitHub API to check repo.visibility
    return !this.isInternalRepo(remote);
  }

  /**
   * Get undercover system prompt
   */
  getSystemPrompt() {
    if (!this.isUndercover) {
      return '';
    }

    return `
## UNDERCOVER MODE - CRITICAL

You are operating in a PUBLIC/OPEN-SOURCE repository.

NEVER include:
- Internal codenames (Tengu, Fennec, Capybara, etc.)
- "Aurora AI Framework" mentions (use "assistant" instead)
- Internal model names
- API keys, passwords, secrets, tokens
- Private infrastructure details

ALWAYS:
- Use generic terms ("assistant" not "Aurora AI")
- Redact sensitive information
- Keep commits professional and public-friendly

VIOLATION CONSEQUENCES:
- Data leaks
- Security vulnerabilities
- Professional reputation damage
`;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let undercoverInstance = null;

export function getUndercoverMode() {
  if (!undercoverInstance) {
    undercoverInstance = new UndercoverMode();
  }
  return undercoverInstance;
}

export async function executeUndercover(operation, options = {}) {
  const undercover = getUndercoverMode();
  return await undercover.execute(operation, options);
}

// ============================================================================
// CLI MODE
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const operation = args[0];

  if (!operation) {
    console.log('UndercoverMode - Hide internal info in public repos\n');
    console.log('Usage: node undercover.mjs <operation> [options]');
    console.log('\nOperations:');
    console.log('  check [path]        - Check if repo is public');
    console.log('  enable [path]       - Enable undercover mode');
    console.log('  disable             - Disable undercover mode');
    console.log('  sanitize <text>     - Sanitize text');
    console.log('  status              - Show current status\n');
    process.exit(0);
  }

  const undercover = getUndercoverMode();
  const options = {};

  if (operation === 'sanitize' && args[1]) {
    options.text = args.slice(1).join(' ');
  } else if (operation === 'check' || operation === 'enable') {
    options.repoPath = args[1] || process.cwd();
  }

  console.log(`🕵️ UndercoverMode: ${operation}\n`);

  undercover.execute(operation, options)
    .then(result => {
      if (result.error) {
        console.error('❌ Error:', result.error);
        process.exit(1);
      }

      if (result.isPublic !== undefined) {
        console.log(`Repo: ${result.repo || 'unknown'}`);
        console.log(`Public: ${result.isPublic ? 'Yes' : 'No'}`);
        console.log(`Reason: ${result.reason}`);
        console.log(`Undercover: ${result.undercover ? 'Enabled' : 'Disabled'}\n`);
      }

      if (result.sanitized !== undefined) {
        console.log('Original:', result.original);
        console.log('Sanitized:', result.sanitized);
        console.log(`Changed: ${result.changed ? 'Yes' : 'No'}\n`);
      }

      if (result.enabled !== undefined) {
        console.log(`Undercover Mode: ${result.enabled ? 'Enabled' : 'Disabled'}\n`);
      }

      if (result.isUndercover !== undefined) {
        console.log('Status:');
        console.log(`  Active: ${result.isUndercover ? 'Yes' : 'No'}`);
        if (result.restrictions) {
          console.log(`  Codenames hidden: ${result.restrictions.codenamesHidden}`);
          console.log(`  Replacements: ${result.restrictions.replacements}`);
          console.log(`  Sensitive patterns: ${result.restrictions.sensitivePatterns}\n`);
        }
      }

      console.log('✅ Success\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    });
}
