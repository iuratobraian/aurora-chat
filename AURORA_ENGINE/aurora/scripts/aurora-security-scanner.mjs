import fs from 'fs';
import path from 'path';

/**
 * Aurora Security Scanner
 * Automates detection of security gaps mentioned in the Strategic Plan.
 */

const PROJECT_ROOT = process.cwd();

const GAPS = [
  {
    id: 'SEC-003',
    description: 'v.any() in schema.ts',
    pattern: /v\.any\(\)/g,
    files: ['convex/schema.ts']
  },
  {
    id: 'SEC-002',
    description: 'In-memory data exposure in WS init',
    pattern: /type: 'init', data: \{ .* \}/g,
    files: ['server.ts']
  },
  {
    id: 'SEC-010',
    description: 'WS connection without token validation',
    pattern: /wss\.on\('connection', \(ws\) => \{/g,
    files: ['server.ts']
  }
];

function scan() {
  console.log('🚀 Aurora Security Scanner - Start');
  let totalIssues = 0;

  GAPS.forEach(gap => {
    gap.files.forEach(file => {
      const filePath = path.join(PROJECT_ROOT, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const matches = content.match(gap.pattern);
        if (matches) {
          console.log(`⚠️  [${gap.id}] Found ${matches.length} matches in ${file}: ${gap.description}`);
          totalIssues += matches.length;
        }
      }
    });
  });

  if (totalIssues === 0) {
    console.log('✅ No security gaps found matching current patterns.');
  } else {
    console.log(`🏁 Scan complete. Total issues found: ${totalIssues}`);
  }
}

scan();
