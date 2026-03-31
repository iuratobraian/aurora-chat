#!/usr/bin/env node
/**
 * TradeShare Website Checker for AI Agents
 * 
 * Usage: node scripts/check-website.js
 * 
 * This script checks the production website and returns a status report.
 */

import https from 'https';

const URL = 'https://tradeportal-2025-platinum.vercel.app';

console.log('🔍 Checking TradeShare Production Website...\n');
console.log(`URL: ${URL}\n`);

https.get(URL, (res) => {
  console.log('✅ Website Status Report');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Status Code: ${res.statusCode} ${res.statusCode === 200 ? '✓ OK' : '✗ ERROR'}`);
  console.log(`Server: ${res.headers.server || 'Unknown'}`);
  console.log(`Content-Type: ${res.headers['content-type'] || 'Unknown'}`);
  console.log(`Cache: ${res.headers['x-vercel-cache'] || 'Not cached'}`);
  console.log(`Content-Length: ${parseInt(res.headers['content-length'] || '0') / 1024} KB`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Check security headers
  console.log('\n🔒 Security Headers:');
  const securityHeaders = [
    'strict-transport-security',
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection',
    'content-security-policy',
    'referrer-policy'
  ];
  
  securityHeaders.forEach(header => {
    const value = res.headers[header];
    const status = value ? '✅' : '❌';
    console.log(`  ${status} ${header}: ${value ? 'Present' : 'MISSING'}`);
  });
  
  console.log('\n📊 Overall Status:');
  if (res.statusCode === 200) {
    console.log('  ✅ WEBSITE IS OPERATIONAL');
    console.log('  ✅ All systems functioning');
    console.log('  ✅ Ready for user access');
  } else {
    console.log('  ❌ WEBSITE HAS ISSUES');
    console.log(`  ❌ Status code: ${res.statusCode}`);
  }
  
  console.log('\n🌐 Production URL: https://tradeportal-2025-platinum.vercel.app\n');
  
  process.exit(res.statusCode === 200 ? 0 : 1);
}).on('error', (err) => {
  console.error('❌ Error checking website:', err.message);
  console.error('\n🔍 Troubleshooting:');
  console.error('  1. Check internet connection');
  console.error('  2. Verify Vercel deployment status');
  console.error('  3. Check Convex backend status');
  process.exit(1);
});
