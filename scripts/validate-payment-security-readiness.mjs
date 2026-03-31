import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();

const requiredEnv = [
  'VITE_CONVEX_URL',
  'VITE_APP_URL',
  'VITE_API_URL',
  'MERCADOPAGO_ACCESS_TOKEN',
  'MERCADOPAGO_WEBHOOK_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'ZENOBANK_API_KEY',
  'INTERNAL_API_SHARED_KEY',
];

const serverFilesToCheck = [
  'server.ts',
  'convex/lib/mercadopago.ts',
  'convex/lib/zenobank.ts',
];

const findings = [];

for (const name of requiredEnv) {
  if (!process.env[name]) {
    findings.push(`Missing env: ${name}`);
  }
}

for (const file of serverFilesToCheck) {
  const fullPath = path.join(cwd, file);
  if (!fs.existsSync(fullPath)) continue;
  const content = fs.readFileSync(fullPath, 'utf8');

  if (content.includes('process.env.VITE_')) {
    findings.push(`Server-side file uses VITE_* env: ${file}`);
  }
  if (content.includes('notable-sandpiper-279.convex.cloud') || content.includes('quick-orca-372.convex.cloud')) {
    findings.push(`Hardcoded deployment URL found: ${file}`);
  }
}

if (findings.length === 0) {
  console.log('Payment security readiness: PASS');
  process.exit(0);
}

console.log('Payment security readiness: FAIL');
for (const finding of findings) {
  console.log(`- ${finding}`);
}

process.exit(1);
