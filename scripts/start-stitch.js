#!/usr/bin/env node

require('dotenv').config();

const { execSync } = require('child_process');

const apiKey = process.env.STITCH_API_KEY || 'AQ.Ab8RN6LVlJylZuhwyBC5y_x7t3oOCUqnZt5SXjiM_GxKYGgDJA';

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
