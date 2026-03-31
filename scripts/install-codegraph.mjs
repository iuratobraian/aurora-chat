#!/usr/bin/env node
/**
 * Code Graph MCP Installer
 * Knowledge graph del codebase con AST - 40-60% token reduction
 * https://github.com/sdsrss/code-graph-mcp
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

console.log('🧠 Installing Code Graph MCP - AST-based Code Intelligence\n');

try {
  // Step 1: Install via plugin marketplace
  console.log('📦 Installing code-graph-mcp plugin...');
  execSync('npx code-graph-mcp install', { stdio: 'inherit', cwd: rootDir });

  // Step 2: Update connectors.json
  const connectorsPath = join(rootDir, '.agent', 'aurora', 'connectors.json');
  const connectors = JSON.parse(readFileSync(connectorsPath, 'utf8'));

  const codeGraphIndex = connectors.mcp.findIndex(m => m.id === 'code_graph_mcp');
  if (codeGraphIndex !== -1) {
    connectors.mcp[codeGraphIndex].readiness = 'installed';
    connectors.mcp[codeGraphIndex].installed_date = new Date().toISOString().split('T')[0];
    writeFileSync(connectorsPath, JSON.stringify(connectors, null, 2), 'utf8');
    console.log('✅ Updated connectors.json - code_graph_mcp marked as installed');
  }

  // Step 3: Index current repository
  console.log('\n📊 Indexing current repository...');
  execSync('npx code-graph-mcp index .', { stdio: 'inherit', cwd: rootDir });

  console.log('\n✅ Code Graph MCP installed successfully!');
  console.log('\n📚 Usage:');
  console.log('   code-graph-mcp project_map           - View architecture overview');
  console.log('   code-graph-mcp semantic_search <q>   - Hybrid BM25+vector search');
  console.log('   code-graph-mcp trace_call_chain      - Trace function calls');
  console.log('   code-graph-mcp find_dependents       - Find inverse dependencies');
  console.log('\n🎯 Benefits:');
  console.log('   - 40-60% token reduction');
  console.log('   - 9 herramientas para análisis estructural');
  console.log('   - 10 lenguajes soportados (TS, JS, Go, Python, Rust, Java, C, C++, HTML, CSS)');
  console.log('   - Incremental indexing con BLAKE3 Merkle tree');

} catch (error) {
  console.error('❌ Installation failed:', error.message);
  process.exit(1);
}
