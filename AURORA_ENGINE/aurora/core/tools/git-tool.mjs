/**
 * git-tool.mjs - 10+ Git Operations para Aurora
 *
 * Operaciones:
 *  1. status  2. add  3. commit  4. push  5. pull
 *  6. checkout  7. diff  8. log  9. stash  10. merge
 *
 * Safety:
 *  - No force push sin confirmación explícita
 *  - Preview de cambios antes de commit
 *  - Bloqueo de patrones peligrosos
 *
 * Uso:
 *   const { GitTool } = await import('./git-tool.mjs');
 *   const tool = new GitTool();
 *   const status = await tool.execute({ operation: 'status' });
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

// ============================================================================
// DANGEROUS PATTERNS
// ============================================================================

const DANGEROUS_GIT = [
  /push\s+--force/,
  /push\s+-f\b/,
  /reset\s+--hard\b/,
  /clean\s+-fd\b/,
  /filter-branch/,
  /amend.*--no-edit.*--force/,
];

function isDangerous(args = '') {
  for (const pattern of DANGEROUS_GIT) {
    if (pattern.test(args)) return true;
  }
  return false;
}

async function runGit(args, cwd) {
  const { stdout, stderr } = await execAsync(`git ${args}`, {
    cwd: cwd || process.cwd(),
    timeout: 60000,
    maxBuffer: 1024 * 1024 * 10,
  });
  return { stdout: stdout.trim(), stderr: stderr.trim() };
}

// ============================================================================
// GIT TOOL CLASS
// ============================================================================

export class GitTool {
  constructor(options = {}) {
    this.cwd = options.cwd || process.cwd();
    this.history = [];
  }

  async execute(params) {
    const { operation, ...args } = params;

    try {
      let result;
      switch (operation) {
        case 'status': result = await this.status(); break;
        case 'add': result = await this.add(args.files); break;
        case 'commit': result = await this.commit(args.message); break;
        case 'push': result = await this.push(args); break;
        case 'pull': result = await this.pull(args); break;
        case 'checkout': result = await this.checkout(args.branch || args.file); break;
        case 'diff': result = await this.diff(args); break;
        case 'log': result = await this.log(args.limit); break;
        case 'stash': result = await this.stash(args.action, args.message); break;
        case 'merge': result = await this.merge(args.branch); break;
        case 'branch': result = await this.branch(); break;
        default:
          return { success: false, error: `Unknown operation: ${operation}` };
      }

      this.history.push({ operation, timestamp: Date.now(), success: true });
      return { success: true, ...result };
    } catch (error) {
      this.history.push({ operation, timestamp: Date.now(), success: false, error: error.message });
      return { success: false, error: error.message };
    }
  }

  // 1. STATUS
  async status() {
    const { stdout } = await runGit('status --porcelain', this.cwd);
    const { stdout: branch } = await runGit('branch --show-current', this.cwd);

    const files = [];
    for (const line of stdout.split('\n').filter(Boolean)) {
      files.push({ status: line.substring(0, 2).trim(), path: line.substring(3).trim() });
    }

    return { branch, files };
  }

  // 2. ADD
  async add(files) {
    if (!files) return await runGit('add -A', this.cwd);
    const fileList = Array.isArray(files) ? files.join(' ') : files;
    return await runGit(`add ${fileList}`, this.cwd);
  }

  // 3. COMMIT
  async commit(message) {
    if (!message) throw new Error('Commit message required');
    // Preview what will be committed
    const { stdout: staged } = await runGit('diff --cached --stat', this.cwd);
    const result = await runGit(`commit -m "${message.replace(/"/g, '\\"')}"`, this.cwd);
    return { ...result, stagedPreview: staged };
  }

  // 4. PUSH (blocks --force)
  async push(args = {}) {
    if (isDangerous(`push ${args.force ? '-f' : ''}`)) {
      throw new Error('Force push is blocked. Use git directly if needed.');
    }
    const remote = args.remote || 'origin';
    const branch = args.branch || '';
    return await runGit(`push ${remote} ${branch}`, this.cwd);
  }

  // 5. PULL
  async pull(args = {}) {
    const remote = args.remote || 'origin';
    const branch = args.branch || '';
    return await runGit(`pull ${remote} ${branch}`, this.cwd);
  }

  // 6. CHECKOUT
  async checkout(target) {
    if (!target) throw new Error('Branch or file required');
    return await runGit(`checkout ${target}`, this.cwd);
  }

  // 7. DIFF
  async diff(args = {}) {
    if (args.file) {
      return await runGit(`diff -- ${args.file}`, this.cwd);
    }
    if (args.staged) {
      return await runGit('diff --cached', this.cwd);
    }
    if (args.commit) {
      return await runGit(`show ${args.commit} --stat`, this.cwd);
    }
    return await runGit('diff --stat', this.cwd);
  }

  // 8. LOG
  async log(limit = 10) {
    const format = '--pretty=format:"%h|%an|%ad|%s"';
    return await runGit(`log -n ${limit} ${format}`, this.cwd);
  }

  // 9. STASH
  async stash(action = 'push', message) {
    if (action === 'push') {
      return await runGit(`stash push${message ? ` -m "${message}"` : ''}`, this.cwd);
    }
    if (action === 'pop') {
      return await runGit('stash pop', this.cwd);
    }
    if (action === 'list') {
      return await runGit('stash list', this.cwd);
    }
    if (action === 'apply') {
      return await runGit('stash apply', this.cwd);
    }
    throw new Error(`Unknown stash action: ${action}`);
  }

  // 10. MERGE
  async merge(branch) {
    if (!branch) throw new Error('Branch required for merge');
    if (isDangerous(`merge ${branch}`)) {
      throw new Error('Dangerous merge pattern detected');
    }
    return await runGit(`merge ${branch}`, this.cwd);
  }

  // BONUS: BRANCH LIST
  async branch() {
    const { stdout } = await runGit('branch -a', this.cwd);
    return { branches: stdout.split('\n').map(b => b.trim()).filter(Boolean) };
  }

  // HISTORY
  getHistory(limit = 20) {
    return this.history.slice(-limit);
  }

  // SCHEMA
  getSchema() {
    return {
      name: 'git',
      description: 'Execute git operations: status, add, commit, push, pull, checkout, diff, log, stash, merge, branch',
      parameters: {
        type: 'object',
        properties: {
          operation: {
            type: 'string',
            enum: ['status', 'add', 'commit', 'push', 'pull', 'checkout', 'diff', 'log', 'stash', 'merge', 'branch'],
          },
          files: { type: ['string', 'array'] },
          message: { type: 'string' },
          branch: { type: 'string' },
          remote: { type: 'string' },
          limit: { type: 'number' },
          staged: { type: 'boolean' },
          commit: { type: 'string' },
          action: { type: 'string' },
        },
        required: ['operation'],
      },
    };
  }
}
