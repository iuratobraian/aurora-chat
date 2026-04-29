import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const VAULT = path.join(ROOT, 'vault');
const COORDINATION = path.join(ROOT, '.agent/workspace/coordination');

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function migrateKnowledgeBase() {
  console.log('📖 Migrando KNOWLEDGE_BASE.md...');
  const kbPath = path.join(COORDINATION, 'KNOWLEDGE_BASE.md');
  const content = await readFile(kbPath, 'utf8').catch(() => null);
  if (!content) return;

  const sections = content.split('---').slice(1);
  for (const section of sections) {
    const titleMatch = section.match(/## (.*)/);
    if (!titleMatch) continue;
    const title = titleMatch[1].trim().replace(/[🔐 Town🏘️ 📝 ⚡ 🚫 🔄 📋]/g, '').trim();
    const fileName = title.toLowerCase()
      .replace(/&/g, 'and')
      .replace(/\//g, '-')
      .replace(/[^a-z0-9\-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '.md';
    
    // Categorizar por título
    let category = 'general';
    if (title.toLowerCase().includes('auth')) category = 'auth';
    else if (title.toLowerCase().includes('payment')) category = 'payments';
    else if (title.toLowerCase().includes('community')) category = 'communities';
    else if (title.toLowerCase().includes('post')) category = 'posts';

    const dir = path.join(VAULT, '03-conocimiento', category);
    await ensureDir(dir);

    const noteContent = `---
tags: ["conocimiento", "${category}"]
migrado: true
---

# ${title}

${section.trim().split('\n').filter(line => !line.startsWith('## ')).join('\n').trim()}
`;
    await writeFile(path.join(dir, fileName), noteContent);
  }
}

async function migrateLearningLog() {
  console.log('💡 Migrando LEARNING_LOG.md...');
  const llPath = path.join(COORDINATION, 'LEARNING_LOG.md');
  const content = await readFile(llPath, 'utf8').catch(() => null);
  if (!content) return;

  const entries = content.split('## ').slice(2);
  for (const entry of entries) {
    const lines = entry.split('\n');
    const id = lines[0].trim();
    const fileName = `${id}.md`;
    
    const noteContent = `---
tags: ["aprendizaje"]
id_original: "${id}"
migrado: true
---

# 💡 Aprendizaje: ${id}

${lines.slice(1).join('\n').trim()}
`;
    await writeFile(path.join(VAULT, '05-agentes/aprendizajes', fileName), noteContent);
  }
}

async function migrateHandoffs() {
  console.log('🤝 Migrando HANDOFFS.md...');
  const hPath = path.join(COORDINATION, 'HANDOFFS.md');
  const content = await readFile(hPath, 'utf8').catch(() => null);
  if (!content) return;

  const entries = content.split('## ').slice(3); // Saltar plantilla
  for (const entry of entries) {
    const lines = entry.split('\n');
    const id = lines[0].trim();
    const fileName = `${id.replace(/ -> /g, '-')}.md`;

    const noteContent = `---
tags: ["handoff"]
id_original: "${id}"
migrado: true
---

# 🤝 Handoff: ${id}

${lines.slice(1).join('\n').trim()}
`;
    await writeFile(path.join(VAULT, '05-agentes/handoffs', fileName), noteContent);
  }
}

async function main() {
  try {
    await migrateKnowledgeBase();
    await migrateLearningLog();
    await migrateHandoffs();
    console.log('\n✅ Migración inicial completada con éxito.');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  }
}

main();
