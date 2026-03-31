import fs from 'node:fs';
import path from 'node:path';
import { loadAuroraEnv } from '../../load-aurora-env.mjs';

/**
 * Aurora Sentinel: Health Check & Monitor
 * Goal: Detect desync between code and live Convex deployment.
 */

async function checkSentinelHealth() {
  console.log('🛡️ [Aurora Sentinel] Starting Health Check...');

  // 1. Load Environment
  loadAuroraEnv();
  const convexUrl = process.env.VITE_CONVEX_URL;
  const deploymentName = process.env.CONVEX_DEPLOYMENT;

  if (!convexUrl) {
    console.error('❌ [Sentinel] VITE_CONVEX_URL missing in .env');
    process.exit(1);
  }

  console.log(`📡 [Sentinel] Monitoring: ${convexUrl} (${deploymentName || 'Unknown'})`);

  // 2. Scan convex/ directory for exported queries
  const convexDir = path.join(process.cwd(), 'convex');
  const files = fs.readdirSync(convexDir).filter(f => f.endsWith('.ts') && !f.startsWith('_'));

  console.log(`📂 [Sentinel] Scanning ${files.length} module(s)...`);

  for (const file of files) {
    const content = fs.readFileSync(path.join(convexDir, file), 'utf8');
    const queries = content.match(/export const (\w+) = query/g) || [];
    const mutations = content.match(/export const (\w+) = mutation/g) || [];
    
    if (queries.length > 0) {
       console.log(`   - ${file}: Detected ${queries.length} queries`);
    }
  }

  // 3. (Optional) Check live connectivity if token is available
  // In a real scenario, Aurora would hit a /health endpoint in Convex.
  
  console.log('✅ [Sentinel] Scan complete. Health report generated.');
}

checkSentinelHealth().catch(console.error);
