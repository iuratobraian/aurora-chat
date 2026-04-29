/**
 * diff-tool.mjs - View/Apply Diffs para Aurora
 *
 * Operaciones:
 *  1. generate - Generar diff entre archivos o strings
 *  2. apply - Aplicar diff/patch a archivo
 *  3. reverse - Generar diff inverso
 *  4. show - Mostrar diff en formato unified
 *  5. stat - Estadísticas del diff
 *
 * Uso:
 *   const { DiffTool } = await import('./diff-tool.mjs');
 *   const tool = new DiffTool();
 *   const diff = await tool.execute({ operation: 'generate', fileA: 'old.ts', fileB: 'new.ts' });
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';

const execAsync = promisify(exec);

// ============================================================================
// DIFF UTILITIES
// ============================================================================

function unifiedDiff(oldContent, newContent, oldName = 'a', newName = 'b') {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');

  // Simple LCS-based diff
  const m = oldLines.length;
  const n = newLines.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find diff
  const result = [];
  let i = m, j = n;
  let oldStart = m, newStart = n;
  let oldCount = 0, newCount = 0;
  let inHunk = false;

  const ops = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      ops.unshift({ type: 'context', line: oldLines[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.unshift({ type: 'add', line: newLines[j - 1] });
      j--;
    } else {
      ops.unshift({ type: 'remove', line: oldLines[i - 1] });
      i--;
    }
  }

  // Build unified format
  let oldLine = 1;
  let newLine = 1;
  const header = [`--- ${oldName}`, `+++ ${newName}`];
  const hunkLines = [];
  let hunkOldStart = null;
  let hunkOldCount = 0;
  let hunkNewStart = null;
  let hunkNewCount = 0;

  function flushHunk() {
    if (hunkOldStart !== null) {
      header.unshift(`@@ -${hunkOldStart},${hunkOldCount} +${hunkNewStart},${hunkNewCount} @@`);
      header.push(...hunkLines);
      hunkLines.length = 0;
      hunkOldStart = null;
      hunkNewStart = null;
      hunkOldCount = 0;
      hunkNewCount = 0;
    }
  }

  for (const op of ops) {
    if (op.type === 'context') {
      if (hunkOldStart === null) {
        hunkOldStart = oldLine;
        hunkNewStart = newLine;
      }
      hunkLines.push(` ${op.line}`);
      hunkOldCount++;
      hunkNewCount++;
      oldLine++;
      newLine++;

      if (hunkOldCount >= 3) flushHunk();
    } else if (op.type === 'remove') {
      if (hunkOldStart === null) {
        hunkOldStart = oldLine;
        hunkNewStart = newLine;
      }
      hunkLines.push(`-${op.line}`);
      hunkOldCount++;
      oldLine++;
    } else if (op.type === 'add') {
      if (hunkOldStart === null) {
        hunkOldStart = oldLine;
        hunkNewStart = newLine;
      }
      hunkLines.push(`+${op.line}`);
      hunkNewCount++;
      newLine++;
    }
  }

  flushHunk();

  if (header.length <= 2) return ''; // No diff
  return header.join('\n') + '\n';
}

function parsePatch(patch) {
  const hunks = [];
  const lines = patch.split('\n');
  let currentHunk = null;

  for (const line of lines) {
    if (line.startsWith('@@')) {
      if (currentHunk) hunks.push(currentHunk);
      const match = line.match(/@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@/);
      if (match) {
        currentHunk = {
          oldStart: parseInt(match[1]),
          oldCount: parseInt(match[2]) || 1,
          newStart: parseInt(match[3]),
          newCount: parseInt(match[4]) || 1,
          lines: [],
        };
      }
    } else if (currentHunk) {
      currentHunk.lines.push(line);
    }
  }

  if (currentHunk) hunks.push(currentHunk);
  return hunks;
}

function applyPatch(content, patch) {
  const hunks = parsePatch(patch);
  const lines = content.split('\n');
  let result = [...lines];
  let offset = 0;

  for (const hunk of hunks) {
    const startIdx = hunk.oldStart - 1 + offset;

    // Count lines to remove/add correctly (context lines stay, - lines removed, + lines added)
    const toRemove = hunk.lines.filter(l => l.startsWith('-')).length;
    const toAdd = hunk.lines.filter(l => l.startsWith('+')).length;
    const contextLines = hunk.lines.filter(l => l.startsWith(' ')).length;

    // Remove old lines (only actual removals, not context)
    result.splice(startIdx, toRemove + contextLines);

    // Build new content from hunk
    const newContent = hunk.lines
      .filter(l => l.startsWith('+') || l.startsWith(' '))
      .map(l => l.substring(1));

    result.splice(startIdx, 0, ...newContent);
    offset += toAdd - toRemove - contextLines + newContent.length - toRemove - contextLines;
    offset = startIdx + newContent.length - (hunk.oldStart - 1 + offset - startIdx) - (toRemove + contextLines);
  }

  return result.join('\n');
}

// ============================================================================
// DIFF TOOL CLASS
// ============================================================================

export class DiffTool {
  constructor(options = {}) {
    this.cwd = options.cwd || process.cwd();
    this.history = [];
  }

  async execute(params) {
    const { operation, ...args } = params;

    try {
      let result;
      switch (operation) {
        case 'generate': result = await this.generate(args); break;
        case 'apply': result = await this.apply(args); break;
        case 'reverse': result = await this.reverse(args); break;
        case 'show': result = await this.show(args); break;
        case 'stat': result = await this.stat(args); break;
        default:
          return { success: false, error: `Unknown operation: ${operation}` };
      }

      this.history.push({ operation, timestamp: Date.now(), success: true });
      return { success: true, ...result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 1. GENERATE diff between two files or strings
  async generate(args) {
    if (args.contentA !== undefined && args.contentB !== undefined) {
      // String diff
      const diff = unifiedDiff(args.contentA, args.contentB, args.nameA || 'a', args.nameB || 'b');
      return { diff, isIdentical: !diff };
    }

    if (args.fileA && args.fileB) {
      // File diff
      const contentA = fs.readFileSync(args.fileA, 'utf8');
      const contentB = fs.readFileSync(args.fileB, 'utf8');
      const diff = unifiedDiff(contentA, contentB, args.fileA, args.fileB);
      return { diff, isIdentical: !diff };
    }

    // Git diff
    if (args.gitDiff) {
      const target = args.target || '';
      const { stdout } = await execAsync(`git diff ${target}`, { cwd: this.cwd });
      return { diff: stdout, isIdentical: !stdout.trim() };
    }

    throw new Error('Provide contentA/contentB, fileA/fileB, or gitDiff');
  }

  // 2. APPLY patch to file
  async apply(args) {
    if (!args.file) throw new Error('File path required');
    if (!args.patch) throw new Error('Patch content required');

    const content = fs.readFileSync(args.file, 'utf8');
    const result = applyPatch(content, args.patch);

    if (args.dryRun) {
      return { applied: false, preview: result };
    }

    // Backup
    if (args.backup !== false) {
      fs.writeFileSync(`${args.file}.bak`, content, 'utf8');
    }

    fs.writeFileSync(args.file, result, 'utf8');
    return { applied: true, file: args.file };
  }

  // 3. REVERSE diff
  async reverse(args) {
    if (args.diff) {
      const reversed = args.diff
        .split('\n')
        .map(line => {
          if (line.startsWith('---')) return line.replace('--- ', '+++ ');
          if (line.startsWith('+++')) return line.replace('+++ ', '--- ');
          if (line.startsWith('+')) return '-' + line.substring(1);
          if (line.startsWith('-')) return '+' + line.substring(1);
          return line;
        })
        .join('\n');
      return { reversed };
    }

    if (args.gitDiff) {
      const target = args.target || '';
      const { stdout } = await execAsync(`git diff -R ${target}`, { cwd: this.cwd });
      return { reversed: stdout };
    }

    throw new Error('Provide diff or gitDiff');
  }

  // 4. SHOW diff in readable format
  async show(args) {
    if (args.commit) {
      const { stdout } = await execAsync(`git show ${args.commit} --stat`, { cwd: this.cwd });
      return { output: stdout };
    }

    if (args.file) {
      const { stdout } = await execAsync(`git diff -- ${args.file}`, { cwd: this.cwd });
      return { output: stdout || 'No changes' };
    }

    throw new Error('Provide commit hash or file path');
  }

  // 5. STATISTICS
  async stat(args) {
    if (args.diff) {
      const lines = args.diff.split('\n');
      let additions = 0, deletions = 0;
      for (const line of lines) {
        if (line.startsWith('+')) additions++;
        if (line.startsWith('-')) deletions++;
      }
      return { additions, deletions, total: additions + deletions };
    }

    if (args.gitDiff) {
      const { stdout } = await execAsync('git diff --stat', { cwd: this.cwd });
      return { output: stdout };
    }

    throw new Error('Provide diff or gitDiff');
  }

  // HISTORY
  getHistory(limit = 20) {
    return this.history.slice(-limit);
  }

  // SCHEMA
  getSchema() {
    return {
      name: 'diff',
      description: 'View and apply diffs. Operations: generate, apply, reverse, show, stat',
      parameters: {
        type: 'object',
        properties: {
          operation: {
            type: 'string',
            enum: ['generate', 'apply', 'reverse', 'show', 'stat'],
          },
          fileA: { type: 'string' },
          fileB: { type: 'string' },
          contentA: { type: 'string' },
          contentB: { type: 'string' },
          patch: { type: 'string' },
          file: { type: 'string' },
          diff: { type: 'string' },
          commit: { type: 'string' },
          target: { type: 'string' },
          gitDiff: { type: 'boolean' },
          dryRun: { type: 'boolean' },
          backup: { type: 'boolean' },
        },
        required: ['operation'],
      },
    };
  }
}
