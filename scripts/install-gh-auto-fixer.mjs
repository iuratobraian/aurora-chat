#!/usr/bin/env node
/**
 * GitHub Issues Auto Fixer Installer
 * Complete GitHub Issue Automation - 330k stars TOP 1
 * https://github.com/openclaw/gh-issues-auto-fixer
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

console.log('🐙 Installing GitHub Issues Auto Fixer - Complete Issue Automation\n');

try {
  // Step 1: Install skill
  console.log('📦 Installing gh-issues-auto-fixer skill...');
  execSync('skill install gh-issues-auto-fixer', { stdio: 'inherit', cwd: rootDir });

  // Step 2: Update connectors.json
  const connectorsPath = join(rootDir, '.agent', 'aurora', 'connectors.json');
  const connectors = JSON.parse(readFileSync(connectorsPath, 'utf8'));

  const ghAutoFixerIndex = connectors.mcp.findIndex(m => m.id === 'gh_issues_auto_fixer');
  if (ghAutoFixerIndex !== -1) {
    connectors.mcp[ghAutoFixerIndex].readiness = 'installed';
    connectors.mcp[ghAutoFixerIndex].installed_date = new Date().toISOString().split('T')[0];
    writeFileSync(connectorsPath, JSON.stringify(connectors, null, 2), 'utf8');
    console.log('✅ Updated connectors.json - gh_issues_auto_fixer marked as installed');
  }

  console.log('\n✅ GitHub Issues Auto Fixer installed successfully!');
  console.log('\n📚 Usage:');
  console.log('   gh-issues-auto-fixer spawn_subagents     - Spawn sub-agents for fixes');
  console.log('   gh-issues-auto-fixer implement_code_fix  - Implement code fixes');
  console.log('   gh-issues-auto-fixer open_pull_request   - Open PRs automatically');
  console.log('   gh-issues-auto-fixer resolve_review      - Resolve review comments');
  console.log('   gh-issues-auto-fixer auto_close_issues   - Auto-close resolved issues');
  console.log('\n🎯 Benefits:');
  console.log('   - 330k+ stars (TOP 1 Skill)');
  console.log('   - Complete issue lifecycle automation');
  console.log('   - Spawn sub-agents for complex fixes');
  console.log('   - Automatic PR creation and management');
  console.log('   - Code review loop resolution');

} catch (error) {
  console.error('❌ Installation failed:', error.message);
  process.exit(1);
}
