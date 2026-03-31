#!/usr/bin/env node
/**
 * HuggingFace SmolAgents Installer
 * Official HF Agent Framework - 30k stars
 * https://github.com/huggingface/smolagents
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

console.log('🤗 Installing HuggingFace SmolAgents - Agent Framework\n');

try {
  // Step 1: Install Python package
  console.log('📦 Installing smolagents with toolkit...');
  execSync('pip install smolagents[toolkit]', { stdio: 'inherit' });

  // Step 2: Update connectors.json
  const connectorsPath = join(rootDir, '.agent', 'aurora', 'connectors.json');
  const connectors = JSON.parse(readFileSync(connectorsPath, 'utf8'));

  const smolAgentsIndex = connectors.mcp.findIndex(m => m.id === 'hf_smolagents');
  if (smolAgentsIndex !== -1) {
    connectors.mcp[smolAgentsIndex].readiness = 'installed';
    connectors.mcp[smolAgentsIndex].installed_date = new Date().toISOString().split('T')[0];
    writeFileSync(connectorsPath, JSON.stringify(connectors, null, 2), 'utf8');
    console.log('✅ Updated connectors.json - hf_smolagents marked as installed');
  }

  console.log('\n✅ SmolAgents installed successfully!');
  console.log('\n📚 Usage:');
  console.log('   npm run hf:agents              - Run smolagents example');
  console.log('   npm run hf:agents:list         - List available agents');
  console.log('   npm run hf:agents:install      - Install new agent');
  console.log('   npm run hf:agents:search       - Search HuggingFace agents');
  console.log('\n🎯 Benefits:');
  console.log('   - 30k+ stars');
  console.log('   - Official HuggingFace agent framework');
  console.log('   - Code-first approach (better than JSON)');
  console.log('   - Supports any LLM (local, HF, OpenAI, Anthropic)');
  console.log('   - Safe sandbox execution (E2B, Docker, Pyodide)');
  console.log('   - Multi-modal support (text, vision, audio)');
  console.log('   - MCP integration ready');
  console.log('\n📖 Docs: https://huggingface.co/docs/smolagents');

} catch (error) {
  console.error('❌ Installation failed:', error.message);
  process.exit(1);
}
