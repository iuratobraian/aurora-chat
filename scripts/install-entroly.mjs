#!/usr/bin/env node
/**
 * Entroly MCP Installer
 * The Context Engineering Engine - 78% fewer tokens
 * https://github.com/juyterman1000/entroly
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

console.log('🎯 Installing Entroly - Context Engineering Engine\n');

try {
  // Step 1: Install Python package
  console.log('📦 Installing entroly Python package...');
  execSync('pip install entroly', { stdio: 'inherit' });

  // Step 2: Update connectors.json
  const connectorsPath = join(rootDir, '.agent', 'aurora', 'connectors.json');
  const connectors = JSON.parse(readFileSync(connectorsPath, 'utf8'));

  const entrolyIndex = connectors.mcp.findIndex(m => m.id === 'entroly');
  if (entrolyIndex !== -1) {
    connectors.mcp[entrolyIndex].readiness = 'installed';
    connectors.mcp[entrolyIndex].installed_date = new Date().toISOString().split('T')[0];
    writeFileSync(connectorsPath, JSON.stringify(connectors, null, 2), 'utf8');
    console.log('✅ Updated connectors.json - entroly marked as installed');
  }

  // Step 3: Initialize context
  console.log('\n🔧 Initializing context engineering...');
  execSync('entroly init', { stdio: 'inherit', cwd: rootDir });

  console.log('\n✅ Entroly installed successfully!');
  console.log('\n📚 Usage:');
  console.log('   entroly remember <fragment>     - Store context with auto-dedup');
  console.log('   entroly optimize                - Select optimal subset for token budget');
  console.log('   entroly recall <query>          - Semantic recall via LSH');
  console.log('   entroly health                  - Codebase health grade (A-F)');
  console.log('\n🎯 Benefits:');
  console.log('   - 78% fewer tokens per request');
  console.log('   - 100% codebase visibility at variable resolution');
  console.log('   - AI responses improve over time (RL)');
  console.log('   - Built-in security scanning (55 SAST rules)');
  console.log('   - <10ms overhead (Rust engine)');

} catch (error) {
  console.error('❌ Installation failed:', error.message);
  process.exit(1);
}
