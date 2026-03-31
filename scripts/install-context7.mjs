#!/usr/bin/env node
/**
 * Context7 MCP Installer
 * Live Documentation for LLMs - 50k+ stars TOP 2
 * https://github.com/upstash/context7
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

console.log('📚 Installing Context7 MCP - Live Documentation\n');

try {
  // Step 1: Install npx package
  console.log('📦 Installing @context7/mcp-server...');
  execSync('npx @context7/mcp-server@latest', { stdio: 'inherit', cwd: rootDir });

  // Step 2: Update connectors.json
  const connectorsPath = join(rootDir, '.agent', 'aurora', 'connectors.json');
  const connectors = JSON.parse(readFileSync(connectorsPath, 'utf8'));

  const context7Index = connectors.mcp.findIndex(m => m.id === 'context7_mcp');
  if (context7Index !== -1) {
    connectors.mcp[context7Index].readiness = 'installed';
    connectors.mcp[context7Index].installed_date = new Date().toISOString().split('T')[0];
    writeFileSync(connectorsPath, JSON.stringify(connectors, null, 2), 'utf8');
    console.log('✅ Updated connectors.json - context7_mcp marked as installed');
  }

  console.log('\n✅ Context7 MCP installed successfully!');
  console.log('\n📚 Usage:');
  console.log('   npx @context7/mcp-server get_docs <lib>        - Get latest docs');
  console.log('   npx @context7/mcp-server get_code_examples <f> - Get code examples');
  console.log('   npx @context7/mcp-server search_docs <query>   - Search documentation');
  console.log('\n🎯 Benefits:');
  console.log('   - 50k+ stars (TOP 2 MCP)');
  console.log('   - Always up-to-date documentation');
  console.log('   - Code examples for any library/framework');
  console.log('   - Perfect for API/Framework queries');

} catch (error) {
  console.error('❌ Installation failed:', error.message);
  process.exit(1);
}
