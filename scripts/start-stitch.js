#!/usr/bin/env node

require('dotenv').config();

const { execSync } = require('child_process');

const apiKey = process.env.STITCH_API_KEY;

if (!apiKey) {
  console.error('❌ STITCH_API_KEY no configurada.');
  console.error('   Agregá STITCH_API_KEY=tu_key a tu .env.local');
  process.exit(1);
}

console.log('Starting Stitch MCP Proxy...');
console.log('API Key configured:', apiKey.substring(0, 10) + '...');

try {
  execSync(`npx @_davideast/stitch-mcp proxy`, {
    env: { ...process.env, STITCH_API_KEY: apiKey },
    stdio: 'inherit'
  });
} catch (error) {
  console.error('Error starting Stitch:', error.message);
  process.exit(1);
}
