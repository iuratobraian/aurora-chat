#!/usr/bin/env node
/**
 * vault-query.mjs — Consulta Inteligente del Neural Vault
 *
 * Comandos:
 *   node vault-query.mjs buscar --buscar "auth"          → Busca en todo el vault
 *   node vault-query.mjs errores                          → Lista errores abiertos
 *   node vault-query.mjs decisiones                       → Lista ADRs recientes
 *   node vault-query.mjs conocimiento --categoria "auth"  → Notas de una categoría
 *   node vault-query.mjs sesiones --agente "AntiGravity"  → Sesiones de un agente
 *   node vault-query.mjs contexto --tarea "SEC-AUTH"      → Contexto para una tarea
 *   node vault-query.mjs equipo                            → Muestra el team roster
 *   node vault-query.mjs stats                             → Estadísticas del vault
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const VAULT = path.join(ROOT, 'vault');

const args = process.argv.slice(2);
const command = args[0];

const R = '\x1b[0m';
const BOLD = '\x1b[1m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';

function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

async function walk(dir, results = []) {
  try {
    const files = await readdir(dir);
    for (const file of files) {
      if (file.startsWith('.')) continue;
      const fullPath = path.join(dir, file);
      const s = await stat(fullPath);
      if (s.isDirectory()) {
        await walk(fullPath, results);
      } else if (file.endsWith('.md')) {
        results.push(fullPath);
      }
    }
  } catch { /* dir doesn't exist */ }
  return results;
}

function parseFrontmatter(content) {
  if (!content.startsWith('---')) return {};
  const endIdx = content.indexOf('---', 3);
  if (endIdx === -1) return {};
  const fm = content.slice(3, endIdx);
  const result = {};
  fm.split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return;
    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    result[key] = val;
  });
  return result;
}

// ═══════════════════════════════════════════════════════
// COMANDOS
// ═══════════════════════════════════════════════════════

async function searchVault() {
  const query = getArg('buscar');
  if (!query) return console.log('Uso: --buscar <query>');

  const files = await walk(VAULT);
  const matches = [];

  for (const file of files) {
    const content = await readFile(file, 'utf8');
    if (content.toLowerCase().includes(query.toLowerCase())) {
      const fm = parseFrontmatter(content);
      const relPath = path.relative(ROOT, file);
      const titleMatch = content.match(/^# (.+)/m);
      matches.push({
        path: relPath,
        title: titleMatch ? titleMatch[1] : path.basename(file),
        agent: fm.agente || '-',
        date: fm.fecha || '-',
      });
    }
  }

  console.log(`\n${BOLD}${CYAN}🔎 Resultados para "${query}" (${matches.length}):${R}\n`);
  matches.forEach((m, i) => {
    console.log(`  ${i + 1}. ${BOLD}${m.title}${R}`);
    console.log(`     ${DIM}📁 ${m.path} | 👤 ${m.agent} | 📅 ${m.date}${R}`);
  });
  console.log('');
}

async function listErrors() {
  const files = await walk(path.join(VAULT, '04-errores'));
  const errors = [];

  for (const file of files) {
    const content = await readFile(file, 'utf8');
    const fm = parseFrontmatter(content);
    const titleMatch = content.match(/^# (.+)/m);
    errors.push({
      path: path.relative(ROOT, file),
      title: titleMatch ? titleMatch[1] : path.basename(file),
      severity: fm.severidad || '-',
      status: fm.estado || '-',
      agent: fm.agente || '-',
      date: fm.fecha || '-',
    });
  }

  console.log(`\n${BOLD}${RED}🛑 Errores Registrados (${errors.length}):${R}\n`);
  errors.forEach((e, i) => {
    const icon = e.status === 'open' ? `${RED}●${R}` : `${GREEN}✓${R}`;
    console.log(`  ${icon} ${BOLD}${e.title}${R} [${e.severity}]`);
    console.log(`    ${DIM}👤 ${e.agent} | 📅 ${e.date} | 📁 ${e.path}${R}`);
  });
  console.log('');
}

async function listDecisions() {
  const files = await walk(path.join(VAULT, '02-decisiones'));
  const decisions = [];

  for (const file of files) {
    const content = await readFile(file, 'utf8');
    const fm = parseFrontmatter(content);
    const titleMatch = content.match(/^# (.+)/m);
    decisions.push({
      title: titleMatch ? titleMatch[1] : path.basename(file),
      status: fm.estado || '-',
      agent: fm.agente || '-',
      date: fm.fecha || '-',
    });
  }

  console.log(`\n${BOLD}${CYAN}🏛️ Decisiones Arquitectónicas (${decisions.length}):${R}\n`);
  decisions.forEach((d, i) => {
    const icon = d.status === 'accepted' ? `${GREEN}✓${R}` : `${YELLOW}○${R}`;
    console.log(`  ${icon} ${BOLD}${d.title}${R} [${d.status}]`);
    console.log(`    ${DIM}👤 ${d.agent} | 📅 ${d.date}${R}`);
  });
  console.log('');
}

async function listKnowledge() {
  const categoria = getArg('categoria');
  const baseDir = categoria
    ? path.join(VAULT, '03-conocimiento', categoria)
    : path.join(VAULT, '03-conocimiento');
  
  const files = await walk(baseDir);
  
  console.log(`\n${BOLD}${GREEN}📖 Base de Conocimiento (${files.length} notas):${R}\n`);
  for (const file of files) {
    const content = await readFile(file, 'utf8');
    const titleMatch = content.match(/^# (.+)/m);
    const relPath = path.relative(path.join(VAULT, '03-conocimiento'), file);
    console.log(`  📄 ${BOLD}${titleMatch ? titleMatch[1] : path.basename(file)}${R}`);
    console.log(`     ${DIM}${relPath}${R}`);
  }
  console.log('');
}

async function listSessions() {
  const agent = getArg('agente');
  const files = await walk(path.join(VAULT, '05-agentes', 'sesiones'));
  
  const sessions = [];
  for (const file of files) {
    const content = await readFile(file, 'utf8');
    const fm = parseFrontmatter(content);
    if (agent && fm.agente && !fm.agente.toLowerCase().includes(agent.toLowerCase())) continue;
    const titleMatch = content.match(/^# (.+)/m);
    sessions.push({
      title: titleMatch ? titleMatch[1] : path.basename(file),
      agent: fm.agente || '-',
      date: fm.fecha || '-',
      status: fm.estado || '-',
    });
  }

  console.log(`\n${BOLD}${CYAN}🧠 Sesiones de Agentes (${sessions.length}):${R}\n`);
  sessions.forEach(s => {
    console.log(`  📝 ${BOLD}${s.title}${R} [${s.status}]`);
    console.log(`     ${DIM}👤 ${s.agent} | 📅 ${s.date}${R}`);
  });
  console.log('');
}

async function showContext() {
  const taskQuery = getArg('tarea');
  if (!taskQuery) return console.log('Uso: --tarea <query>');

  console.log(`\n${BOLD}${CYAN}🧠 Contexto Neural para "${taskQuery}":${R}\n`);

  // Buscar en errores
  const errorFiles = await walk(path.join(VAULT, '04-errores'));
  const relatedErrors = [];
  for (const file of errorFiles) {
    const content = await readFile(file, 'utf8');
    if (content.toLowerCase().includes(taskQuery.toLowerCase())) {
      const title = content.match(/^# (.+)/m);
      relatedErrors.push(title ? title[1] : path.basename(file));
    }
  }
  
  if (relatedErrors.length > 0) {
    console.log(`  ${RED}🛑 Errores relacionados:${R}`);
    relatedErrors.forEach(e => console.log(`     - ${e}`));
  }

  // Buscar en conocimiento
  const knowFiles = await walk(path.join(VAULT, '03-conocimiento'));
  const relatedKnowledge = [];
  for (const file of knowFiles) {
    const content = await readFile(file, 'utf8');
    if (content.toLowerCase().includes(taskQuery.toLowerCase())) {
      const title = content.match(/^# (.+)/m);
      relatedKnowledge.push(title ? title[1] : path.basename(file));
    }
  }

  if (relatedKnowledge.length > 0) {
    console.log(`  ${GREEN}📖 Conocimiento relevante:${R}`);
    relatedKnowledge.forEach(k => console.log(`     - ${k}`));
  }

  // Buscar en aprendizajes
  const learnFiles = await walk(path.join(VAULT, '05-agentes', 'aprendizajes'));
  const relatedLearnings = [];
  for (const file of learnFiles) {
    const content = await readFile(file, 'utf8');
    if (content.toLowerCase().includes(taskQuery.toLowerCase())) {
      const title = content.match(/^# (.+)/m);
      relatedLearnings.push(title ? title[1] : path.basename(file));
    }
  }

  if (relatedLearnings.length > 0) {
    console.log(`  ${YELLOW}💡 Aprendizajes previos:${R}`);
    relatedLearnings.forEach(l => console.log(`     - ${l}`));
  }

  if (relatedErrors.length === 0 && relatedKnowledge.length === 0 && relatedLearnings.length === 0) {
    console.log(`  ${DIM}Sin contexto previo. Territorio inexplorado.${R}`);
  }
  console.log('');
}

async function showStats() {
  const dirs = {
    'Tareas activas': '01-tareas/activas',
    'Tareas completadas': '01-tareas/completadas',
    'Decisiones': '02-decisiones',
    'Conocimiento': '03-conocimiento',
    'Errores': '04-errores',
    'Sesiones': '05-agentes/sesiones',
    'Aprendizajes': '05-agentes/aprendizajes',
    'Handoffs': '05-agentes/handoffs',
    'Identidades': '05-agentes/identidades',
  };

  console.log(`\n${BOLD}${CYAN}📊 Estadísticas del Neural Vault:${R}\n`);
  let total = 0;
  for (const [label, dir] of Object.entries(dirs)) {
    const files = await walk(path.join(VAULT, dir));
    total += files.length;
    const bar = '█'.repeat(Math.min(files.length, 30));
    console.log(`  ${label.padEnd(22)} ${BOLD}${String(files.length).padStart(3)}${R} ${CYAN}${bar}${R}`);
  }
  console.log(`  ${'─'.repeat(40)}`);
  console.log(`  ${'TOTAL'.padEnd(22)} ${BOLD}${String(total).padStart(3)}${R} notas\n`);
}

async function showTeam() {
  const rosterPath = path.join(VAULT, '00-inbox', 'TEAM_ROSTER.md');
  try {
    const content = await readFile(rosterPath, 'utf8');
    console.log(`\n${content}`);
  } catch {
    console.log(`${RED}TEAM_ROSTER.md no encontrado${R}`);
  }
}

// ═══════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════

const COMMANDS = {
  buscar: searchVault,
  errores: listErrors,
  decisiones: listDecisions,
  conocimiento: listKnowledge,
  sesiones: listSessions,
  contexto: showContext,
  stats: showStats,
  equipo: showTeam,
};

async function main() {
  if (!command || !COMMANDS[command]) {
    console.log('\n🔍 vault-query.mjs — Consulta del Neural Vault\n');
    console.log('Comandos:');
    console.log('  buscar         → Buscar texto en todo el vault (--buscar "query")');
    console.log('  errores        → Listar errores registrados');
    console.log('  decisiones     → Listar ADRs');
    console.log('  conocimiento   → Listar base de conocimiento (--categoria "auth")');
    console.log('  sesiones       → Listar sesiones de agentes (--agente "XXX")');
    console.log('  contexto       → Obtener contexto para una tarea (--tarea "auth")');
    console.log('  stats          → Estadísticas del vault');
    console.log('  equipo         → Mostrar el Team Roster\n');
    return;
  }

  await COMMANDS[command]();
}

main().catch(err => {
  console.error(`❌ Error: ${err.message}`);
  process.exit(1);
});
