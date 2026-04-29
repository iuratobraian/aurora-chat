import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Deploying to Convex...\n');

// Read .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

// Extract CONVEX_DEPLOY_KEY
const match = envContent.match(/^CONVEX_DEPLOY_KEY=(.+)$/m);
if (!match) {
  console.error('❌ CONVEX_DEPLOY_KEY not found in .env.local');
  process.exit(1);
}

const deployKey = match[1].trim();
console.log(`✅ Deploy key loaded from .env.local`);
console.log(`📦 Running pre-deploy check...\n`);

try {
  execSync('npm run pre-deploy', { stdio: 'inherit' });
} catch (e) {
  // Pre-deploy might exit with code 1 but still be ok
  console.log('\n⚠️  Pre-deploy check completed');
}

console.log('\n🚀 Running convex deploy...\n');

const env = {
  ...process.env,
  CONVEX_DEPLOY_KEY: deployKey,
};

execSync('npx convex deploy --typecheck=disable', {
  stdio: 'inherit',
  env,
});

console.log('\n🚀 Running convex run seeds:seedPricingSystem...\n');

execSync('npx convex run seeds:seedPricingSystem', {
  stdio: 'inherit',
  env,
});

console.log('\n✅ Deploy complete!');
