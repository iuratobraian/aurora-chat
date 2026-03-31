#!/usr/bin/env node
/**
 * Codebase Memory MCP Installer
 * Ultra-fast C-based code indexing (Linux kernel 3min)
 * https://github.com/DeusData/codebase-memory-mcp
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

console.log('⚡ Installing Codebase Memory MCP - Ultra-fast C Indexing\n');

try {
  // Step 1: Download and install binary
  console.log('📦 Downloading codebase-memory-mcp binary...');
  execSync('curl -L https://github.com/DeusData/codebase-memory-mcp/releases/latest/download/codebase-memory-mcp.tar.gz -o /tmp/codebase-memory-mcp.tar.gz', { stdio: 'inherit' });
  execSync('tar xzf /tmp/codebase-memory-mcp.tar.gz -C /tmp', { stdio: 'inherit' });
  execSync('mv /tmp/codebase-memory-mcp ~/.local/bin/ 2>/dev/null || mv /tmp/codebase-memory-mcp /usr/local/bin/', { stdio: 'inherit' });

  // Step 2: Update connectors.json
  const connectorsPath = join(rootDir, '.agent', 'aurora', 'connectors.json');
  const connectors = JSON.parse(readFileSync(connectorsPath, 'utf8'));

  const codebaseMemIndex = connectors.mcp.findIndex(m => m.id === 'codebase_memory_mcp');
  if (codebaseMemIndex !== -1) {
    connectors.mcp[codebaseMemIndex].readiness = 'installed';
    connectors.mcp[codebaseMemIndex].installed_date = new Date().toISOString().split('T')[0];
    writeFileSync(connectorsPath, JSON.stringify(connectors, null, 2), 'utf8');
    console.log('✅ Updated connectors.json - codebase_memory_mcp marked as installed');
  }

  // Step 3: Index current repository
  console.log('\n📊 Indexing current repository...');
  execSync('codebase-memory-mcp index .', { stdio: 'inherit', cwd: rootDir });

  console.log('\n✅ Codebase Memory MCP installed successfully!');
  console.log('\n📚 Usage:');
  console.log('   codebase-memory-mcp search_graph <query>  - Structural search');
  console.log('   codebase-memory-mcp get_call_graph <fn>   - Function call graph');
  console.log('   codebase-memory-mcp find_dependents <sym> - Find dependencies');
  console.log('\n🎯 Benefits:');
  console.log('   - Linux kernel (28M LOC) indexed in 3 minutes');
  console.log('   - 2,000 files/sec indexing speed');
  console.log('   - <1ms query latency for structural queries');
  console.log('   - 66 languages supported with tree-sitter AST');
  console.log('   - 3D graph visualization at localhost:9749');

} catch (error) {
  console.error('❌ Installation failed:', error.message);
  process.exit(1);
}
