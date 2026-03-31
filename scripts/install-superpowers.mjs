#!/usr/bin/env node
/**
 * Superpowers MCP Installer
 * Complete TDD Workflow - 108k stars TOP 1
 * https://github.com/obra/superpowers
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

console.log('💪 Installing Superpowers MCP - Complete TDD Workflow\n');

try {
  // Step 1: Install npm package
  console.log('📦 Installing superpowers-mcp...');
  execSync('npm install -g superpowers-mcp', { stdio: 'inherit', cwd: rootDir });

  // Step 2: Update connectors.json
  const connectorsPath = join(rootDir, '.agent', 'aurora', 'connectors.json');
  const connectors = JSON.parse(readFileSync(connectorsPath, 'utf8'));

  const superpowersIndex = connectors.mcp.findIndex(m => m.id === 'superpowers_mcp');
  if (superpowersIndex !== -1) {
    connectors.mcp[superpowersIndex].readiness = 'installed';
    connectors.mcp[superpowersIndex].installed_date = new Date().toISOString().split('T')[0];
    writeFileSync(connectorsPath, JSON.stringify(connectors, null, 2), 'utf8');
    console.log('✅ Updated connectors.json - superpowers_mcp marked as installed');
  }

  console.log('\n✅ Superpowers MCP installed successfully!');
  console.log('\n📚 Usage:');
  console.log('   superpowers design_refinement    - Refine design specs');
  console.log('   superpowers tdd_implementation   - TDD-driven implementation');
  console.log('   superpowers code_generation      - Generate code');
  console.log('   superpowers test_generation      - Generate tests');
  console.log('   superpowers workflow_orchestrate - Orchestrate full workflow');
  console.log('\n🎯 Benefits:');
  console.log('   - 108k+ stars (TOP 1 MCP)');
  console.log('   - Complete software development workflow');
  console.log('   - Design → TDD → Code → Tests');
  console.log('   - Production-ready code generation');

} catch (error) {
  console.error('❌ Installation failed:', error.message);
  process.exit(1);
}
