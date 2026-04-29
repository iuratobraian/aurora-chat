#!/usr/bin/env node
/**
 * aurora-handoff.mjs - Generate handoff brief for next session
 * 
 * Ejecutar al finalizar para dejar contexto claro
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const HANDOFF_FILE = path.join(ROOT, '.aurora', 'handoff-brief.md');
const AURORA_CHECK = path.join(ROOT, 'AURORA_CHECK.md');

async function generateHandoff() {
  console.log('📝 Generating handoff brief...\n');
  
  // Ensure directory exists
  const handoffDir = path.dirname(HANDOFF_FILE);
  if (!fs.existsSync(handoffDir)) {
    fs.mkdirSync(handoffDir, { recursive: true });
  }
  
  // Read AURORA_CHECK.md
  let checkContent = '';
  if (fs.existsSync(AURORA_CHECK)) {
    checkContent = fs.readFileSync(AURORA_CHECK, 'utf8');
  }
  
  // Count completed tasks
  const completed = (checkContent.match(/\[x\]/gi) || []).length;
  const pending = (checkContent.match(/⏳ PENDING/g) || []).length;
  
  // Get current git status
  let gitStatus = 'unknown';
  try {
    const { execSync } = await import('node:child_process');
    gitStatus = execSync('git status --short', { encoding: 'utf8' }).trim();
  } catch {
    // ignore
  }
  
  // Generate handoff
  const handoff = `# 🔄 HANDOFF BRIEF

**Generated:** ${new Date().toLocaleString()}
**Session:** ${new Date().toISOString().split('T')[0]}

---

## 📊 PROGRESS SUMMARY

- **Completed Tasks:** ${completed}
- **Pending Tasks:** ${pending}
- **Progress:** ${Math.round((completed / (completed + pending)) * 100)}%

---

## 🎯 NEXT TASKS

${checkContent.match(/\| (AC-\d{3}) \| [^|]+\| ⏳ PENDING \|/g)?.slice(0, 5).join('\n') || 'All tasks complete!'}

---

## 📝 GIT STATUS

${gitStatus || 'Clean working tree'}

---

## 📋 AGENT ASSIGNMENTS

${checkContent.match(/\|.*AGENT.*\|/g)?.slice(0, 10).join('\n') || 'No active agents'}

---

## ⚠️ BLOCKERS / NOTES

${checkContent.match(/⚠️.*|🚨.*/g)?.join('\n') || 'None'}

---

## 🔧 COMMANDS TO RESUME

\`\`\`bash
# Load previous session
node scripts/aurora-load-session.mjs

# Resume work
node scripts/aurora-resume.mjs

# Check health
npm run aurora:health
\`\`\`

---

## 📞 CONTACT

- **Documentation:** AURORA_CHECK.md
- **Session Log:** .aurora/sessions/current-session.json
- **Agent Logs:** .aurora/swarm/logs/

---

*Handoff generated automatically by aurora-handoff.mjs*
`;

  fs.writeFileSync(HANDOFF_FILE, handoff, 'utf8');
  
  console.log('✅ Handoff brief generated\n');
  console.log(`📄 File: ${HANDOFF_FILE}\n`);
  console.log('Preview:\n');
  console.log(handoff.split('\n').slice(0, 30).join('\n'));
  console.log('...\n');
}

generateHandoff().catch(console.error);
