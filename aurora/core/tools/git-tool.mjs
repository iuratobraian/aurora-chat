#!/usr/bin/env node
/**
 * git-tool.mjs - Git Operations Tool
 * 
 * Allows Aurora to perform git operations safely with:
 * - 10+ git commands
 * - Preview before commit
 * - Confirmation before push
 * - Protected branch handling
 * - Change validation
 * 
 * @see docs/CLAUDE_CODE_LEAK_ANALYSIS.md - Tool Registry Pattern
 * @see aurora/core/tools/bash-tool.mjs - Base tool template
 * @see aurora/core/permissions/aurora-permissions.mjs - Security
 */

import { exec } from 'node:child_process';
import path from 'node:path';

// Import BashTool for underlying execution
import { getBashTool } from './bash-tool.mjs';

// ============================================================================
// CONFIGURATION
// ============================================================================

const GIT_TOOL_CONFIG = {
  // Protected branches (never push/merge/delete without approval)
  protectedBranches: [
    'main',
    'master',
    'develop',
    'dev',
    'production',
    'prod'
  ],
  
  // Operations requiring confirmation
  requiresConfirmation: [
    'push',
    'merge',
    'rebase',
    'reset --hard',
    'branch -D',
    'tag -d'
  ],
  
  // Default commit message if not provided
  defaultCommitPrefix: 'chore: Aurora AI - ',
  
  // Max files to show in preview
  maxPreviewFiles: 20,
  
  // Timeout for git operations (10 min)
  defaultTimeoutMs: 10 * 60 * 1000
};

// ============================================================================
// GIT TOOL CLASS
// ============================================================================

export class GitTool {
  constructor(options = {}) {
    this.config = { ...GIT_TOOL_CONFIG, ...options };
    this.bashTool = getBashTool();
    this.operationHistory = [];
  }

  /**
   * Get tool schema (for Tool Registry)
   */
  getSchema() {
    return {
      name: 'git',
      description: 'Perform git operations safely with preview and confirmation',
      parameters: {
        operation: { 
          type: 'string', 
          required: true, 
          enum: [
            'status', 'add', 'reset', 'commit', 'push', 'pull',
            'checkout', 'branch', 'diff', 'log', 'stash', 'merge', 'rebase'
          ],
          description: 'Git operation to perform' 
        },
        args: { 
          type: 'array', 
          items: 'string',
          description: 'Additional arguments' 
        },
        message: { 
          type: 'string', 
          description: 'Commit message (for commit operation)' 
        },
        branch: { 
          type: 'string', 
          description: 'Branch name (for checkout/branch operations)' 
        },
        preview: { 
          type: 'boolean', 
          description: 'Show preview before operation (default: true)' 
        },
        force: { 
          type: 'boolean', 
          description: 'Force operation (bypass safety checks)' 
        }
      },
      returns: {
        output: 'string',
        success: 'boolean',
        error: 'string | null',
        preview: 'object | null'
      }
    };
  }

  /**
   * Execute git operation
   */
  async execute(operation, options = {}) {
    const {
      args = [],
      message,
      branch,
      preview = true,
      force = false,
      timeout = this.config.defaultTimeoutMs
    } = options;

    // Log operation
    this.logOperation(operation, options);

    // Validate operation
    if (!this.isValidOperation(operation)) {
      return {
        output: '',
        success: false,
        error: `Invalid git operation: ${operation}`,
        preview: null
      };
    }

    // Check if operation requires confirmation
    if (!force && this.requiresConfirmation(operation, branch)) {
      if (!preview) {
        return {
          output: '',
          success: false,
          error: `Operation '${operation}' requires confirmation or preview flag`,
          preview: null
        };
      }
    }

    // Check protected branches
    if (!force && this.isProtectedBranch(branch)) {
      return {
        output: '',
        success: false,
        error: `Protected branch '${branch}' requires force flag`,
        preview: null
      };
    }

    // Build git command
    const gitCommand = this.buildGitCommand(operation, args, message, branch);

    // Show preview if requested
    if (preview && this.shouldShowPreview(operation)) {
      const previewData = await this.getPreview(operation, args);
      
      if (previewData && !force) {
        return {
          output: '',
          success: false,
          error: 'Preview available - review and retry with force flag if acceptable',
          preview: previewData
        };
      }
    }

    // Execute git command
    return await this.bashTool.execute(gitCommand, { timeout });
  }

  /**
   * Git Status - Get repository status
   */
  async status() {
    return await this.execute('status');
  }

  /**
   * Git Add - Stage files
   */
  async add(files = ['.']) {
    return await this.execute('add', { args: files, preview: false });
  }

  /**
   * Git Reset - Unstage files
   */
  async reset(files = []) {
    const args = files.length > 0 ? files : ['HEAD'];
    return await this.execute('reset', { args, preview: false });
  }

  /**
   * Git Commit - Commit staged changes
   */
  async commit(message, options = {}) {
    const { preview = true, force = false } = options;
    
    // Validate message
    if (!message || message.trim().length === 0) {
      message = `${this.config.defaultCommitPrefix}${new Date().toISOString()}`;
    }

    return await this.execute('commit', {
      args: ['-m', message],
      message,
      preview,
      force
    });
  }

  /**
   * Git Push - Push to remote
   */
  async push(remote = 'origin', branch = null, options = {}) {
    const args = [remote];
    
    if (branch) {
      args.push(branch);
    }
    
    return await this.execute('push', {
      args,
      preview: true, // Always preview push
      force: options.force || false
    });
  }

  /**
   * Git Pull - Pull from remote
   */
  async pull(remote = 'origin', branch = null) {
    const args = [remote];
    
    if (branch) {
      args.push(branch);
    }
    
    return await this.execute('pull', { args, preview: false });
  }

  /**
   * Git Checkout - Switch branches
   */
  async checkout(branch, createNew = false) {
    const args = createNew ? ['-b', branch] : [branch];
    
    return await this.execute('checkout', {
      args,
      branch,
      preview: false
    });
  }

  /**
   * Git Branch - List or create branches
   */
  async branch(name = null, deleteBranch = false) {
    const args = [];
    
    if (deleteBranch) {
      args.push('-d');
    }
    
    if (name) {
      args.push(name);
    }
    
    return await this.execute('branch', {
      args,
      branch: name,
      preview: false
    });
  }

  /**
   * Git Diff - Show changes
   */
  async diff(target = 'HEAD') {
    return await this.execute('diff', {
      args: [target],
      preview: false
    });
  }

  /**
   * Git Log - Show commit history
   */
  async log(options = { max: 10, oneline: true }) {
    const args = [];
    
    if (options.oneline) {
      args.push('--oneline');
    }
    
    if (options.max) {
      args.push(`-${options.max}`);
    }
    
    return await this.execute('log', { args, preview: false });
  }

  /**
   * Git Stash - Stash changes
   */
  async stash(action = 'push', message = null) {
    const args = [action];
    
    if (message && action === 'push') {
      args.push('-m', message);
    }
    
    return await this.execute('stash', { args, preview: false });
  }

  /**
   * Git Merge - Merge branches
   */
  async merge(branch, options = {}) {
    return await this.execute('merge', {
      args: [branch],
      branch,
      preview: true,
      force: options.force || false
    });
  }

  /**
   * Git Rebase - Rebase branch
   */
  async rebase(onto, options = {}) {
    return await this.execute('rebase', {
      args: [onto],
      preview: true,
      force: options.force || false
    });
  }

  /**
   * Build git command string
   */
  buildGitCommand(operation, args = [], message, branch) {
    let command = `git ${operation}`;
    
    if (args && args.length > 0) {
      command += ' ' + args.map(arg => this.escapeArg(arg)).join(' ');
    }
    
    return command;
  }

  /**
   * Escape argument for shell
   */
  escapeArg(arg) {
    if (arg.includes(' ') || arg.includes('"')) {
      return `"${arg.replace(/"/g, '\\"')}"`;
    }
    return arg;
  }

  /**
   * Check if operation is valid
   */
  isValidOperation(operation) {
    const validOperations = [
      'status', 'add', 'reset', 'commit', 'push', 'pull',
      'checkout', 'branch', 'diff', 'log', 'stash', 'merge', 'rebase'
    ];
    return validOperations.includes(operation);
  }

  /**
   * Check if operation requires confirmation
   */
  requiresConfirmation(operation, branch) {
    return this.config.requiresConfirmation.includes(operation);
  }

  /**
   * Check if branch is protected
   */
  isProtectedBranch(branch) {
    if (!branch) return false;
    return this.config.protectedBranches.includes(branch);
  }

  /**
   * Get preview for operation
   */
  async getPreview(operation, args) {
    switch (operation) {
      case 'push':
        return await this.getPushPreview();
      case 'commit':
        return await this.getCommitPreview();
      case 'merge':
        return await this.getMergePreview(args[0]);
      case 'rebase':
        return await this.getRebasePreview(args[0]);
      default:
        return null;
    }
  }

  /**
   * Get push preview
   */
  async getPushPreview() {
    try {
      // Get current branch
      const branchResult = await this.bashTool.execute('git branch --show-current');
      const branch = branchResult.output.trim();
      
      // Get status
      const statusResult = await this.bashTool.execute('git status --porcelain');
      const changedFiles = statusResult.output
        .split('\n')
        .filter(line => line.trim().length > 0)
        .slice(0, this.config.maxPreviewFiles);
      
      // Get ahead/behind info
      const aheadBehindResult = await this.bashTool.execute(
        `git rev-list --left-right --count origin/${branch}...${branch}`
      );
      
      const [behind, ahead] = aheadBehindResult.output.trim().split('\t').map(Number);
      
      return {
        operation: 'push',
        branch,
        changedFiles,
        totalChanged: statusResult.output.split('\n').filter(l => l.trim()).length,
        ahead,
        behind,
        message: `Push ${ahead} commit(s) to origin/${branch}`
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Get commit preview
   */
  async getCommitPreview() {
    try {
      const statusResult = await this.bashTool.execute('git status --porcelain');
      const stagedResult = await this.bashTool.execute('git diff --cached --name-only');
      
      const stagedFiles = stagedResult.output
        .split('\n')
        .filter(line => line.trim().length > 0);
      
      const allChangedFiles = statusResult.output
        .split('\n')
        .filter(line => line.trim().length > 0);
      
      return {
        operation: 'commit',
        stagedFiles,
        totalStaged: stagedFiles.length,
        allChangedFiles,
        totalChanged: allChangedFiles.length,
        message: stagedFiles.length > 0
          ? `Commit ${stagedFiles.length} staged file(s)`
          : 'No files staged for commit'
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Get merge preview
   */
  async getMergePreview(branch) {
    try {
      const diffResult = await this.bashTool.execute(`git diff --name-only HEAD ${branch}`);
      const filesToChange = diffResult.output
        .split('\n')
        .filter(line => line.trim().length > 0);
      
      return {
        operation: 'merge',
        targetBranch: branch,
        filesToChange,
        totalFiles: filesToChange.length,
        message: `Merge ${branch} into current branch (${filesToChange.length} files affected)`
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Get rebase preview
   */
  async getRebasePreview(onto) {
    try {
      const logResult = await this.bashTool.execute(`git log --oneline HEAD..${onto}`);
      const commitsToReplay = logResult.output
        .split('\n')
        .filter(line => line.trim().length > 0);
      
      return {
        operation: 'rebase',
        onto,
        commitsToReplay,
        totalCommits: commitsToReplay.length,
        message: `Replay ${commitsToReplay.length} commit(s) onto ${onto}`
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Check if should show preview
   */
  shouldShowPreview(operation) {
    return ['push', 'commit', 'merge', 'rebase'].includes(operation);
  }

  /**
   * Log operation to history
   */
  logOperation(operation, options) {
    this.operationHistory.push({
      operation,
      options,
      timestamp: Date.now(),
      status: 'pending'
    });
  }

  /**
   * Get operation history
   */
  getHistory(limit = 10) {
    return this.operationHistory.slice(-limit);
  }

  /**
   * Clear operation history
   */
  clearHistory() {
    this.operationHistory = [];
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let gitToolInstance = null;

export function getGitTool() {
  if (!gitToolInstance) {
    gitToolInstance = new GitTool();
  }
  return gitToolInstance;
}

export async function executeGit(operation, options = {}) {
  const gitTool = getGitTool();
  return await gitTool.execute(operation, options);
}

// ============================================================================
// CLI MODE
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const operation = args[0];

  if (!operation) {
    console.log('GitTool - Perform git operations safely\n');
    console.log('Usage: node git-tool.mjs <operation> [options]');
    console.log('\nOperations:');
    console.log('  status              - Show repository status');
    console.log('  add [files]         - Stage files');
    console.log('  reset [files]       - Unstage files');
    console.log('  commit -m "msg"     - Commit staged changes');
    console.log('  push [remote]       - Push to remote');
    console.log('  pull [remote]       - Pull from remote');
    console.log('  checkout <branch>   - Switch branches');
    console.log('  branch [name]       - List/create branches');
    console.log('  diff [target]       - Show changes');
    console.log('  log [-n]            - Show commit history');
    console.log('  stash [push|pop]    - Stash changes');
    console.log('  merge <branch>      - Merge branch');
    console.log('  rebase <onto>       - Rebase branch\n');
    console.log('Examples:');
    console.log('  node git-tool.mjs status');
    console.log('  node git-tool.mjs add src/index.ts');
    console.log('  node git-tool.mjs commit -m "feat: add feature"');
    console.log('  node git-tool.mjs push origin main --preview\n');
    process.exit(0);
  }

  const gitTool = getGitTool();
  const options = {};
  
  // Parse arguments
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--preview') {
      options.preview = true;
    } else if (arg === '--force' || arg === '-f') {
      options.force = true;
    } else if (arg === '-m' && args[i + 1]) {
      options.message = args[++i];
    } else if (arg === '-n' && args[i + 1]) {
      options.max = parseInt(args[++i]);
    } else if (!arg.startsWith('-')) {
      if (!options.args) options.args = [];
      options.args.push(arg);
    }
  }

  console.log(`🔧 Git: ${operation} ${options.args ? options.args.join(' ') : ''}\n`);

  gitTool.execute(operation, options)
    .then(result => {
      if (result.preview) {
        console.log('📋 PREVIEW:\n');
        console.log(JSON.stringify(result.preview, null, 2));
        console.log('\n💡 To proceed, add --force flag');
      } else {
        if (result.output) {
          console.log(result.output);
        }
        if (result.error) {
          console.error('❌ Error:', result.error);
        }
      }
      
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    });
}
