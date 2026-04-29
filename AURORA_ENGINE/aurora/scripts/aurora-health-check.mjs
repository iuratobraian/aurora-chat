import fs from 'fs';

console.log('🚀 Aurora Health Check starting...');

// 1. Check Convex
try {
  console.log('📘 Convex check: Skipping detailed check, assume online if dev server runs.');
} catch (e) {}

// 2. Check Workspace Files
const requiredFiles = [
  '.agent/workspace/coordination/TASK_BOARD.md',
  '.agent/workspace/coordination/CURRENT_FOCUS.md',
  '.agent/workspace/coordination/AGENT_LOG.md'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ File found: ${file}`);
  } else {
    console.error(`❌ Missing critical file: ${file}`);
  }
});

console.log('✅ Health check complete.');
