#!/usr/bin/env node
/**
 * aurora-inicio.mjs — Protocolo de Inicio Aurora Mente Maestra
 *
 * Ejecutar con: node scripts/aurora-inicio.mjs
 * O via npm:    npm run aurora
 *
 * 🧠 AURORA — Agente Integrador Principal
 *
 * FLUJO AUTOMÁTICO:
 * 1. Leer archivos obligatorios de protocolo
 * 2. Verificar conexión Notion (fuente de verdad)
 * 3. Sincronizar TASK_BOARD.md con Notion
 * 4. Verificar estado del sistema (git, env, deps)
 * 5. Leer TASK_BOARD y mostrar tareas pendientes
 * 6. Leer AGENT_LOG para contexto de sesión anterior
 * 7. Proponer mejora proactiva para Aurora
 * 8. Listo para trabajar
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

// Load .env.local
function loadEnv(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    content.split('\n').forEach(line => {
      line = line.trim();
      if (!line || line.startsWith('#')) return;
      const eqIdx = line.indexOf('=');
      if (eqIdx === -1) return;
      let key = line.slice(0, eqIdx).trim();
      let val = line.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    });
  } catch { /* file not found, skip */ }
}
loadEnv('.env.local');

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const ROOT = process.cwd();

// Colors
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const MAGENTA = '\x1b[35m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';
const WHITE = '\x1b[37m';

// ─── Helpers ────────────────────────────────────────────────────────────────
function ok(msg) { console.log(`${GREEN}✓ ${msg}${RESET}`); }
function warn(msg) { console.log(`${YELLOW}⚠ ${msg}${RESET}`); }
function err(msg) { console.log(`${RED}✗ ${msg}${RESET}`); }
function info(msg) { console.log(`${DIM}${msg}${RESET}`); }
function divider(label) {
  const line = '─'.repeat(Math.max(0, 60 - label.length - 2));
  console.log(`\n${BOLD}${MAGENTA}── ${label} ${line}${RESET}`);
}

// ─── Detect project name from package.json ──────────────────────────────────
function getProjectName() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    return pkg.name || 'Proyecto Sin Nombre';
  } catch {
    return 'Proyecto Sin Nombre';
  }
}

// ─── Banner ─────────────────────────────────────────────────────────────────
function banner() {
  const projectName = getProjectName();
  console.log(`\n${BOLD}${CYAN}╔════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${CYAN}║   🌊 AURORA MENTE MAESTRA — INICIO DE SESIÓN           ║${RESET}`);
  console.log(`${BOLD}${CYAN}║   Protocolo de arranque automático                     ║${RESET}`);
  console.log(`${BOLD}${CYAN}║   Contexto local + Notion (opcional)                   ║${RESET}`);
  console.log(`${BOLD}${CYAN}╚════════════════════════════════════════════════════════╝${RESET}\n`);
  console.log(`${DIM}Fecha: ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}${RESET}`);
  console.log(`${DIM}Proyecto: ${projectName}${RESET}\n`);
}

// ─── Paso 1: Leer archivos locales del proyecto ─────────────────────────────
function readLocalProjectFiles() {
  divider('📁 CONTEXTO LOCAL DEL PROYECTO');

  // Buscar archivos en raíz y en subcarpetas comunes
  const possiblePaths = {
    'TASK_BOARD.md': [
      'TASK_BOARD.md',
      '.agent/workspace/coordination/TASK_BOARD.md',
      'docs/TASK_BOARD.md',
      '.github/TASK_BOARD.md'
    ],
    'CURRENT_FOCUS.md': [
      'CURRENT_FOCUS.md',
      '.agent/workspace/coordination/CURRENT_FOCUS.md',
      'docs/CURRENT_FOCUS.md'
    ],
    'AGENT_LOG.md': [
      'AGENT_LOG.md',
      '.agent/workspace/coordination/AGENT_LOG.md',
      'docs/AGENT_LOG.md'
    ],
    'README.md': ['README.md'],
    'PLAN_MEJORAS.md': [
      '.agent/workspace/plans/PLAN_MEJORAS_PNA.md',
      'docs/PLAN_MEJORAS.md',
      'PLAN_MEJORAS.md'
    ]
  };

  const results = {};
  
  for (const [label, paths] of Object.entries(possiblePaths)) {
    let found = false;
    for (const relPath of paths) {
      const fullPath = path.join(ROOT, relPath);
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        results[label] = { ok: true, path: relPath, content, size: content.length };
        ok(`${label} encontrado en ${relPath} (${(content.length / 1024).toFixed(1)}KB)`);
        found = true;
        break; // Found it, stop looking
      } catch {
        continue; // Try next path
      }
    }
    if (!found) {
      results[label] = { ok: false, error: 'No encontrado' };
      warn(`${label} — Archivo no encontrado`);
    }
  }
  
  return results;
}

// ─── Paso 2: Leer protocolos de agente (si existen) ─────────────────────────
function readAgentProtocols() {
  const protocols = [];
  const protocolPaths = [
    '.agent/skills/README.md',
    '.agent/skills/mandatory-startup-readiness/SKILL.md',
    '.agent/skills/mandatory-startup-readiness/references/critical-failures.md',
    '.agent/skills/agents/AGENT_TASK_DIVISION.md',
    '.agent/workspace/coordination/NOTION_SYNC_PROTOCOL.md'
  ];
  
  divider('📖 PROTOCOLOS DE AGENTE');
  
  for (const relPath of protocolPaths) {
    const fullPath = path.join(ROOT, relPath);
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      protocols.push({ path: relPath, content });
      ok(`${path.basename(relPath)} (${(content.length / 1024).toFixed(1)}KB)`);
    } catch {
      warn(`${path.basename(relPath)} — No disponible (opcional)`);
    }
  }
  
  return protocols;
}

// ─── Paso 2: Verificar Git ──────────────────────────────────────────────────
function checkGit() {
  divider('🔄 ESTADO DE GIT');
  try {
    const branch = execSync('git branch --show-current', { cwd: ROOT, encoding: 'utf8' }).trim();
    ok(`Branch: ${branch}`);
    
    const status = execSync('git status --short', { cwd: ROOT, encoding: 'utf8' }).trim();
    if (status) {
      const lines = status.split('\n');
      warn(`${lines.length} archivo(s) modificado(s) sin commitear`);
    } else {
      ok('Working tree limpio');
    }
    
    const log = execSync('git log --oneline -1', { cwd: ROOT, encoding: 'utf8' }).trim();
    info(`Último commit: ${log}`);
  } catch (e) {
    warn('Git no disponible: ' + e.message);
  }
}

// ─── Paso 3: Verificar dependencias ─────────────────────────────────────────
function checkDeps() {
  divider('📦 DEPENDENCIAS');
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const deps = Object.keys(pkg.dependencies || {}).length;
    const devDeps = Object.keys(pkg.devDependencies || {}).length;
    ok(`${deps} dependencias + ${devDeps} devDependencies`);
    info(`Node: ${process.version}`);
  } catch (e) {
    warn('No se pudo leer package.json');
  }
}

// ─── Paso 4: Notion Connection ──────────────────────────────────────────────
async function notionConnection() {
  try {
    const res = await fetch('https://api.notion.com/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { ok: true, user: data.name || 'Notion' };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ─── Paso 5: Fetch Tasks ────────────────────────────────────────────────────
async function fetchTasks() {
  let allTasks = [];
  let hasMore = true;
  let cursor = undefined;

  while (hasMore) {
    const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page_size: 100, start_cursor: cursor }),
    });

    if (!res.ok) throw new Error(`Notion API error: ${await res.text()}`);
    const data = await res.json();
    allTasks = allTasks.concat(data.results);
    hasMore = data.has_more;
    cursor = data.next_cursor;
  }

  return allTasks.map(page => ({
    id: page.id,
    name: page.properties?.Name?.title?.[0]?.plain_text || 'Untitled',
    status: page.properties?.Status?.select?.name || 'Backlog',
    type: page.properties?.Type?.select?.name || '-',
    priority: page.properties?.Priority?.select?.name || 'Medium',
    domain: page.properties?.Domain?.rich_text?.[0]?.plain_text || '',
    url: page.url || '',
  }));
}

// ─── Paso 5: Mostrar tareas del TASK_BOARD local ────────────────────────────
function showLocalTasks(taskBoardContent) {
  if (!taskBoardContent) return;
  
  divider('📋 TAREAS LOCALES');
  
  // Parsear tareas del TASK_BOARD.md (formato markdown table)
  const lines = taskBoardContent.split('\n');
  const tasks = [];
  let inTaskTable = false;
  
  for (const line of lines) {
    // Detectar tablas de tareas (| TASK-ID | ... |)
    if (line.includes('| TASK-ID') || line.includes('| TASK-ID |')) {
      inTaskTable = true;
      continue;
    }
    if (inTaskTable && line.trim().startsWith('|')) {
      // Parsear fila de tarea
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length >= 4 && cells[0].match(/^[A-Z]+-\d+/)) {
        const [taskId, type, status, ...rest] = cells;
        const description = rest.slice(1).join(' ').trim(); // Skip assigned column
        if (status && !['done', 'listo'].includes(status.toLowerCase())) {
          tasks.push({ taskId, type, status, description });
        }
      }
    }
    // Detener al final de la tabla
    if (inTaskTable && !line.trim().startsWith('|') && line.trim() !== '') {
      inTaskTable = false;
    }
  }
  
  if (tasks.length === 0) {
    info('TASK_BOARD.md vacío o sin tareas pendientes');
    info('💡 Las mejoras del plan están listas para ser convertidas en tareas');
  } else {
    ok(`${tasks.length} tarea(s) pendientes encontradas:`);
    tasks.slice(0, 10).forEach(t => {
      console.log(`  ${CYAN}→${RESET} ${t.taskId} ${DIM}(${t.status})${RESET} — ${t.description}`);
    });
    if (tasks.length > 10) {
      info(`  ... y ${tasks.length - 10} más`);
    }
  }
}

// ─── Paso 6: Leer Plan de Mejoras ───────────────────────────────────────────
function showImprovementPlan(planContent) {
  if (!planContent) {
    divider('📋 PLAN DE MEJORAS');
    warn('Plan de mejoras no encontrado');
    return;
  }
  
  divider('📋 PLAN DE MEJORAS');
  const lines = planContent.split('\n');
  const mejoras = lines.filter(l => l.startsWith('### #') || l.startsWith('## #'));

  if (mejoras.length === 0) {
    info('No hay mejoras registradas aún');
  } else {
    ok(`${mejoras.length} mejora(s) registrada(s):`);
    mejoras.forEach(m => {
      const title = m.replace(/^##+ #/, '').split('—')[1]?.trim() || m.replace(/^##+ #/, '').trim();
      console.log(`  ${CYAN}→${RESET} ${title}`);
    });
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  banner();

  // 1. Leer archivos locales del proyecto (PRIORIDAD)
  const localFiles = readLocalProjectFiles();

  // 2. Leer protocolos de agente (si existen)
  const protocols = readAgentProtocols();

  // 3. Verificar Git
  checkGit();

  // 4. Verificar dependencias
  checkDeps();

  // 5. Mostrar tareas locales (PRIORIDAD)
  if (localFiles['TASK_BOARD.md']?.ok) {
    showLocalTasks(localFiles['TASK_BOARD.md'].content);
  }

  // 6. Mostrar plan de mejoras
  showImprovementPlan(localFiles['PLAN_MEJORAS.md']?.content);

  // 7. Notion (SOLO si está configurado - opcional para sync equipo)
  if (NOTION_API_KEY && NOTION_DATABASE_ID) {
    divider('🔗 NOTION (SYNC EQUIPO - OPCIONAL)');
    info('Verificando conexión...');
    const conn = await notionConnection();
    if (conn.ok) {
      ok(`Conectado como: ${conn.user}`);

      info('Obteniendo tareas...');
      const tasks = await fetchTasks();
      const pending = tasks.filter(t => !['Listo', 'Done'].includes(t.status));
      ok(`${tasks.length} tareas totales, ${pending.length} pendientes en Notion`);

      if (pending.length > 0) {
        console.log(`\n${DIM}Tareas en Notion (sync equipo):${RESET}`);
        pending.slice(0, 3).forEach(t => {
          console.log(`  ${CYAN}→${RESET} ${t.name} ${DIM}(${t.priority})${RESET}`);
        });
        if (pending.length > 3) info(`  ... y ${pending.length - 3} más`);
      }
    } else {
      warn(`Error Notion: ${conn.error}`);
    }
  } else {
    info('💡 Notion no configurado - trabajando en modo local');
    info('   Para sync en equipo: agregar NOTION_API_KEY y NOTION_DATABASE_ID en .env.local');
  }

  // 8. Resumen final
  divider('🧠 AURORA LISTA PARA TRABAJAR');

  const localOk = Object.values(localFiles).filter(r => r.ok).length;
  const localTotal = Object.values(localFiles).length;

  console.log(`\n${BOLD}Estado del sistema:${RESET}`);
  console.log(`  Archivos locales: ${localOk}/${localTotal} cargados`);
  console.log(`  Protocolos agente: ${protocols.length} disponibles`);
  console.log(`  Notion: ${NOTION_API_KEY ? 'Configurado (sync equipo)' : 'No configurado (modo local)'}`);
  console.log(`\n${GREEN}${BOLD}Aurora está lista. Esperando instrucciones.${RESET}\n`);
}

main().catch(err => {
  console.error(`${RED}Error: ${RESET}${err.message}`);
  process.exit(1);
});
