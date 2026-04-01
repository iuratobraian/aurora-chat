#!/usr/bin/env node
/**
 * diff-tool.mjs - Diff and Patch Tool
 * 
 * Allows Aurora to work with diffs by:
 * - Generating diffs between files
 * - Applying diffs/patches
 * - Showing unified diff format
 * - Creating diff from git staging
 * - Reversing diffs
 * 
 * @see docs/CLAUDE_CODE_LEAK_ANALYSIS.md - Tool Registry Pattern
 * @see aurora/core/tools/bash-tool.mjs - Base tool template
 * @see aurora/core/tools/git-tool.mjs - Git integration
 */

import { exec } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { getBashTool } from './bash-tool.mjs';

// ============================================================================
// CONFIGURATION
// ============================================================================

const DIFF_TOOL_CONFIG = {
  // Default diff options
  defaultContextLines: 3,
  
  // Max file size to diff (1MB)
  maxFileSize: 1024 * 1024,
  
  // Supported diff formats
  formats: ['unified', 'context', 'normal', 'stat'],
  
  // File extensions to skip (binary)
  skipBinaryExtensions: [
    '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.svg',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx',
    '.zip', '.tar', '.gz', '.rar', '.7z',
    '.exe', '.dll', '.so', '.dylib',
    '.mp3', '.mp4', '.avi', '.mov', '.wav'
  ]
};

// ============================================================================
// DIFF TOOL CLASS
// ============================================================================

export class DiffTool {
  constructor(options = {}) {
    this.config = { ...DIFF_TOOL_CONFIG, ...options };
    this.bashTool = getBashTool();
    this.diffHistory = [];
  }

  /**
   * Get tool schema (for Tool Registry)
   */
  getSchema() {
    return {
      name: 'diff',
      description: 'Generate and apply diffs between files',
      parameters: {
        operation: {
          type: 'string',
          required: true,
          enum: ['generate', 'apply', 'reverse', 'stat', 'staged'],
          description: 'Diff operation to perform'
        },
        source: {
          type: 'string',
          description: 'Source file path (for generate)'
        },
        target: {
          type: 'string',
          description: 'Target file path (for generate)'
        },
        patch: {
          type: 'string',
          description: 'Patch content or file path (for apply/reverse)'
        },
        format: {
          type: 'string',
          enum: ['unified', 'context', 'normal', 'stat'],
          description: 'Diff format (default: unified)'
        },
        context: {
          type: 'number',
          description: 'Context lines (default: 3)'
        },
        outputPath: {
          type: 'string',
          description: 'Output file path (optional)'
        }
      },
      returns: {
        diff: 'string',
        stats: 'object',
        applied: 'boolean',
        error: 'string | null'
      }
    };
  }

  /**
   * Execute diff operation
   */
  async execute(operation, options = {}) {
    const {
      source,
      target,
      patch,
      format = 'unified',
      context = this.config.defaultContextLines,
      outputPath
    } = options;

    // Log operation
    this.logOperation(operation, options);

    // Validate operation
    if (!this.isValidOperation(operation)) {
      return {
        diff: null,
        stats: null,
        applied: false,
        error: `Invalid operation: ${operation}`
      };
    }

    // Execute operation
    switch (operation) {
      case 'generate':
        return await this.generateDiff(source, target, format, context, outputPath);
      
      case 'apply':
        return await this.applyPatch(patch, options);
      
      case 'reverse':
        return await this.reversePatch(patch, options);
      
      case 'stat':
        return await this.getDiffStat(source, target);
      
      case 'staged':
        return await this.getStagedDiff(format);
      
      default:
        return {
          diff: null,
          error: `Unknown operation: ${operation}`
        };
    }
  }

  /**
   * Generate diff between two files
   */
  async generateDiff(source, target, format = 'unified', context = 3, outputPath = null) {
    // Validate files exist
    if (!source || !target) {
      return {
        diff: null,
        stats: null,
        error: 'Source and target files are required'
      };
    }

    // Check if files exist
    if (!fs.existsSync(source)) {
      return {
        diff: null,
        stats: null,
        error: `Source file not found: ${source}`
      };
    }

    if (!fs.existsSync(target)) {
      return {
        diff: null,
        stats: null,
        error: `Target file not found: ${target}`
      };
    }

    // Check file sizes
    const sourceStats = fs.statSync(source);
    const targetStats = fs.statSync(target);

    if (sourceStats.size > this.config.maxFileSize) {
      return {
        diff: null,
        stats: null,
        error: `Source file too large: ${sourceStats.size} bytes (max: ${this.config.maxFileSize})`
      };
    }

    if (targetStats.size > this.config.maxFileSize) {
      return {
        diff: null,
        stats: null,
        error: `Target file too large: ${targetStats.size} bytes (max: ${this.config.maxFileSize})`
      };
    }

    // Check for binary files
    if (this.isBinaryFile(source) || this.isBinaryFile(target)) {
      return {
        diff: null,
        stats: null,
        error: 'Binary files are not supported for diff generation'
      };
    }

    // Build diff command
    const formatFlag = this.getFormatFlag(format);
    const contextFlag = format === 'unified' ? `-u${context}` : (format === 'context' ? `-C${context}` : '');
    
    const command = `diff ${formatFlag} ${contextFlag} "${source}" "${target}"`;

    // Execute diff
    const result = await this.bashTool.execute(command);

    if (result.exitCode !== 0 && result.exitCode !== 1) {
      return {
        diff: null,
        stats: null,
        error: result.error || 'Diff command failed'
      };
    }

    // Parse diff stats
    const stats = this.parseDiffStats(result.output);

    // Save to output file if specified
    if (outputPath) {
      fs.writeFileSync(outputPath, result.output, 'utf8');
    }

    return {
      diff: result.output,
      stats,
      source,
      target,
      format
    };
  }

  /**
   * Apply patch to file
   */
  async applyPatch(patch, options = {}) {
    const { dryRun = false, outputPath = null } = options;

    if (!patch) {
      return {
        diff: null,
        applied: false,
        error: 'Patch content is required'
      };
    }

    // Determine if patch is file path or content
    let patchContent = patch;
    if (fs.existsSync(patch)) {
      patchContent = fs.readFileSync(patch, 'utf8');
    }

    // Write patch to temp file
    const tempPatchFile = path.join(process.env.TEMP || '/tmp', `aurora-patch-${Date.now()}.diff`);
    fs.writeFileSync(tempPatchFile, patchContent, 'utf8');

    // Build patch command
    const dryRunFlag = dryRun ? '--dry-run' : '';
    const command = `patch ${dryRunFlag} -p1 < "${tempPatchFile}"`;

    // Execute patch
    const result = await this.bashTool.execute(command);

    // Clean up temp file
    try {
      fs.unlinkSync(tempPatchFile);
    } catch (e) {
      // Ignore cleanup errors
    }

    if (result.exitCode !== 0) {
      return {
        diff: null,
        applied: false,
        error: result.error || 'Patch application failed'
      };
    }

    return {
      diff: patchContent,
      applied: true,
      output: result.output,
      dryRun
    };
  }

  /**
   * Reverse/undo patch
   */
  async reversePatch(patch, options = {}) {
    const { dryRun = false } = options;

    if (!patch) {
      return {
        diff: null,
        applied: false,
        error: 'Patch content is required'
      };
    }

    // Determine if patch is file path or content
    let patchContent = patch;
    if (fs.existsSync(patch)) {
      patchContent = fs.readFileSync(patch, 'utf8');
    }

    // Write patch to temp file
    const tempPatchFile = path.join(process.env.TEMP || '/tmp', `aurora-patch-${Date.now()}.diff`);
    fs.writeFileSync(tempPatchFile, patchContent, 'utf8');

    // Build reverse patch command
    const dryRunFlag = dryRun ? '--dry-run' : '';
    const command = `patch ${dryRunFlag} -R -p1 < "${tempPatchFile}"`;

    // Execute reverse patch
    const result = await this.bashTool.execute(command);

    // Clean up temp file
    try {
      fs.unlinkSync(tempPatchFile);
    } catch (e) {
      // Ignore cleanup errors
    }

    if (result.exitCode !== 0) {
      return {
        diff: null,
        applied: false,
        error: result.error || 'Patch reversal failed'
      };
    }

    return {
      diff: patchContent,
      applied: true,
      output: result.output,
      reversed: true
    };
  }

  /**
   * Get diff statistics
   */
  async getDiffStat(source, target) {
    if (!source || !target) {
      return {
        diff: null,
        stats: null,
        error: 'Source and target files are required'
      };
    }

    const command = `diff --stat "${source}" "${target}"`;
    const result = await this.bashTool.execute(command);

    if (result.exitCode !== 0 && result.exitCode !== 1) {
      return {
        diff: null,
        stats: null,
        error: result.error || 'Diff stat command failed'
      };
    }

    const stats = this.parseDiffStats(result.output);

    return {
      diff: result.output,
      stats,
      source,
      target
    };
  }

  /**
   * Get diff of staged git changes
   */
  async getStagedDiff(format = 'unified') {
    const formatFlag = format === 'unified' ? '--cached' : '--cached';
    const command = `git diff ${formatFlag}`;

    const result = await this.bashTool.execute(command);

    if (result.exitCode !== 0) {
      return {
        diff: null,
        stats: null,
        error: result.error || 'Git staged diff failed'
      };
    }

    const stats = this.parseDiffStats(result.output);

    return {
      diff: result.output,
      stats,
      staged: true
    };
  }

  /**
   * Validate operation
   */
  isValidOperation(operation) {
    const validOperations = ['generate', 'apply', 'reverse', 'stat', 'staged'];
    return validOperations.includes(operation);
  }

  /**
   * Get format flag for diff command
   */
  getFormatFlag(format) {
    switch (format) {
      case 'unified':
        return '-u';
      case 'context':
        return '-c';
      case 'normal':
        return '';
      case 'stat':
        return '--stat';
      default:
        return '-u';
    }
  }

  /**
   * Check if file is binary
   */
  isBinaryFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return this.config.skipBinaryExtensions.includes(ext);
  }

  /**
   * Parse diff statistics
   */
  parseDiffStats(diffOutput) {
    const lines = diffOutput.split('\n');
    const stats = {
      filesChanged: 0,
      insertions: 0,
      deletions: 0,
      files: []
    };

    for (const line of lines) {
      // File change line: "file.ts | 10 +++++-----"
      const fileMatch = line.match(/^(.+?)\s+\|\s+(\d+)\s+([+\-]+)?/);
      if (fileMatch) {
        stats.filesChanged++;
        stats.files.push({
          file: fileMatch[1].trim(),
          changes: parseInt(fileMatch[2])
        });
      }

      // Summary line: "1 file changed, 5 insertions(+), 3 deletions(-)"
      const summaryMatch = line.match(/(\d+)\s+files?\s+changed/);
      if (summaryMatch) {
        stats.filesChanged = parseInt(summaryMatch[1]);
      }

      const insertionsMatch = line.match(/(\d+)\s+insertions/);
      if (insertionsMatch) {
        stats.insertions = parseInt(insertionsMatch[1]);
      }

      const deletionsMatch = line.match(/(\d+)\s+deletions/);
      if (deletionsMatch) {
        stats.deletions = parseInt(deletionsMatch[1]);
      }
    }

    return stats;
  }

  /**
   * Log operation to history
   */
  logOperation(operation, options) {
    this.diffHistory.push({
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
    return this.diffHistory.slice(-limit);
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.diffHistory = [];
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let diffToolInstance = null;

export function getDiffTool() {
  if (!diffToolInstance) {
    diffToolInstance = new DiffTool();
  }
  return diffToolInstance;
}

export async function executeDiff(operation, options = {}) {
  const diffTool = getDiffTool();
  return await diffTool.execute(operation, options);
}

// ============================================================================
// CLI MODE
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const operation = args[0];

  if (!operation) {
    console.log('DiffTool - Generate and apply diffs\n');
    console.log('Usage: node diff-tool.mjs <operation> [options]');
    console.log('\nOperations:');
    console.log('  generate <source> <target>  - Generate diff between files');
    console.log('  apply <patch>               - Apply patch file');
    console.log('  reverse <patch>             - Reverse/undo patch');
    console.log('  stat <source> <target>      - Show diff statistics');
    console.log('  staged                      - Show staged git diff\n');
    console.log('Options:');
    console.log('  --format <format>           - unified, context, normal, stat');
    console.log('  --context <lines>           - Context lines (default: 3)');
    console.log('  --output <file>             - Output to file\n');
    console.log('Examples:');
    console.log('  node diff-tool.mjs generate old.ts new.ts');
    console.log('  node diff-tool.mjs apply changes.diff');
    console.log('  node diff-tool.mjs staged --format unified\n');
    process.exit(0);
  }

  const diffTool = getDiffTool();
  const options = {};

  // Parse arguments
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--format' && args[i + 1]) {
      options.format = args[++i];
    } else if (arg === '--context' && args[i + 1]) {
      options.context = parseInt(args[++i]);
    } else if (arg === '--output' && args[i + 1]) {
      options.outputPath = args[++i];
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (!arg.startsWith('-') && operation === 'generate') {
      if (!options.source) {
        options.source = arg;
      } else if (!options.target) {
        options.target = arg;
      }
    } else if (!arg.startsWith('-') && (operation === 'apply' || operation === 'reverse')) {
      options.patch = arg;
    }
  }

  console.log(`🔧 Diff: ${operation} ${options.source || ''} ${options.target || ''}\n`);

  diffTool.execute(operation, options)
    .then(result => {
      if (result.error) {
        console.error('❌ Error:', result.error);
        process.exit(1);
      }

      if (result.diff) {
        console.log(result.diff);
      }

      if (result.stats) {
        console.log('\n📊 Stats:');
        console.log(`  Files changed: ${result.stats.filesChanged}`);
        console.log(`  Insertions: ${result.stats.insertions}`);
        console.log(`  Deletions: ${result.stats.deletions}`);
      }

      if (result.applied !== undefined) {
        console.log(`\n${result.applied ? '✅' : '❌'} Patch ${result.reversed ? 'reversed' : 'applied'} ${result.dryRun ? '(dry run)' : ''}`);
      }

      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    });
}
