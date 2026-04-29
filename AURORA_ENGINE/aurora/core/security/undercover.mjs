/**
 * undercover.mjs - Undercover Mode: Public Repo Safety
 *
 * Auto-detect public repos + hide internal codenames + block sensitive info.
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

const INTERNAL_NAMES = ['aurora', 'tengu', 'fennec', 'capybara', 'tradeportal', 'tradeshare'];
const ALLOWED_REPOS = ['iuratobraian']; // Allowlist for private repos

function getGitRemote() {
  return execAsync('git remote get-url origin 2>/dev/null || echo ""')
    .then(r => r.stdout.trim())
    .catch(() => '');
}

function isPublicRepo(remote) {
  if (!remote) return false;
  for (const allowed of ALLOWED_REPOS) {
    if (remote.includes(allowed)) return false;
  }
  return true;
}

function sanitizeOutput(text) {
  let result = text;
  for (const name of INTERNAL_NAMES) {
    result = result.replace(new RegExp(name, 'gi'), 'assistant');
  }
  result = result.replace(/Aurora AI/gi, 'AI assistant');
  result = result.replace(/MENTE MAESTRA/gi, 'CORE SYSTEM');
  return result;
}

function hasSensitiveInfo(text) {
  const patterns = [
    /password\s*[:=]\s*\S+/i,
    /api[_-]?key\s*[:=]\s*\S+/i,
    /secret\s*[:=]\s*\S+/i,
    /token\s*[:=]\s*\S+/i,
    /-----BEGIN (RSA |EC )?PRIVATE KEY-----/,
  ];
  return patterns.some(p => p.test(text));
}

export class UndercoverMode {
  constructor() { this.enabled = false; this.isPublic = false; }

  async init() {
    const remote = await getGitRemote();
    this.isPublic = isPublicRepo(remote);
    this.enabled = this.isPublic;
    return { enabled: this.enabled, isPublic: this.isPublic, remote };
  }

  sanitize(text) {
    if (!this.enabled) return text;
    const hasSensitive = hasSensitiveInfo(text);
    return {
      content: sanitizeOutput(text),
      sanitized: this.enabled,
      hadSensitiveInfo: hasSensitive,
    };
  }

  blockCommit(content) {
    if (hasSensitiveInfo(content)) {
      return { blocked: true, reason: 'Sensitive information detected in commit content' };
    }
    return { blocked: false };
  }

  getSchema() {
    return {
      name: 'undercover',
      description: 'Auto-detect public repos and hide internal codenames. Block sensitive info in commits.',
      parameters: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['init', 'sanitize', 'block_commit'] },
          text: { type: 'string' },
          content: { type: 'string' },
        },
        required: ['action'],
      },
    };
  }
}
