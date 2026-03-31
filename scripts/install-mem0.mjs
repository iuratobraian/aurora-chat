#!/usr/bin/env node
/**
 * Mem0 MCP Installer
 * Universal Memory Layer - +26% accuracy, 91% faster, 90% fewer tokens
 * https://github.com/mem0ai/mem0
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

console.log('🧠 Installing Mem0 - Universal Memory Layer\n');

try {
  // Step 1: Install Python and Node.js packages
  console.log('📦 Installing mem0ai packages...');
  execSync('pip install mem0ai', { stdio: 'inherit' });
  execSync('npm install mem0ai', { stdio: 'inherit', cwd: rootDir });

  // Step 2: Update connectors.json
  const connectorsPath = join(rootDir, '.agent', 'aurora', 'connectors.json');
  const connectors = JSON.parse(readFileSync(connectorsPath, 'utf8'));

  const mem0Index = connectors.mcp.findIndex(m => m.id === 'mem0');
  if (mem0Index !== -1) {
    connectors.mcp[mem0Index].readiness = 'installed';
    connectors.mcp[mem0Index].installed_date = new Date().toISOString().split('T')[0];
    writeFileSync(connectorsPath, JSON.stringify(connectors, null, 2), 'utf8');
    console.log('✅ Updated connectors.json - mem0 marked as installed');
  }

  // Step 3: Initialize memory
  console.log('\n🔧 Initializing memory layer...');
  execSync('mem0 init', { stdio: 'inherit', cwd: rootDir });

  console.log('\n✅ Mem0 installed successfully!');
  console.log('\n📚 Usage:');
  console.log('   mem0.add("user prefers TypeScript")  - Add memory');
  console.log('   mem0.search("preferences")           - Search memories');
  console.log('   mem0.get_all()                       - Get all memories');
  console.log('   mem0.delete("id")                    - Delete memory');
  console.log('\n🎯 Benefits:');
  console.log('   - +26% accuracy vs OpenAI Memory (LOCOMO benchmark)');
  console.log('   - 91% faster retrieval');
  console.log('   - 90% fewer tokens');
  console.log('   - Sub-50ms retrieval for real-time apps');
  console.log('   - Working, factual, and episodic memory support');
  console.log('   - Graph memory with Neo4j');
  console.log('   - LangGraph, LlamaIndex, CrewAI, AutoGen integrations');

} catch (error) {
  console.error('❌ Installation failed:', error.message);
  process.exit(1);
}
