#!/usr/bin/env node
/**
 * Shellward MCP Installer
 * AI Agent Security Middleware - 8-layer defense
 * https://github.com/jnmetacode/shellward
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

console.log('🔒 Installing Shellward MCP - AI Agent Security Middleware\n');

try {
  // Step 1: Install npm package
  console.log('📦 Installing shellward package...');
  execSync('npm install -g shellward', { stdio: 'inherit', cwd: rootDir });

  // Step 2: Update connectors.json
  const connectorsPath = join(rootDir, '.agent', 'aurora', 'connectors.json');
  const connectors = JSON.parse(readFileSync(connectorsPath, 'utf8'));

  const shellwardIndex = connectors.mcp.findIndex(m => m.id === 'shellward_mcp');
  if (shellwardIndex !== -1) {
    connectors.mcp[shellwardIndex].readiness = 'installed';
    connectors.mcp[shellwardIndex].installed_date = new Date().toISOString().split('T')[0];
    writeFileSync(connectorsPath, JSON.stringify(connectors, null, 2), 'utf8');
    console.log('✅ Updated connectors.json - shellward_mcp marked as installed');
  }

  // Step 3: Verify installation
  console.log('\n🔍 Verifying installation...');
  execSync('shellward --version', { stdio: 'inherit' });

  console.log('\n✅ Shellward MCP installed successfully!');
  console.log('\n📚 Usage:');
  console.log('   shellward init              - Initialize security middleware');
  console.log('   shellward scan <project>    - Scan for vulnerabilities');
  console.log('   shellward guard             - Enable real-time protection');
  console.log('\n🛡️  Features:');
  console.log('   - Prompt injection detection (32 rules)');
  console.log('   - Data exfiltration prevention');
  console.log('   - Dangerous command blocking');
  console.log('   - PII detection (SSN, credit cards, API keys)');
  console.log('   - DLP-style data flow control');

} catch (error) {
  console.error('❌ Installation failed:', error.message);
  process.exit(1);
}
