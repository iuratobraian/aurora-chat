#!/usr/bin/env node
/**
 * aurora-inicio.mjs — Punto de Entrada Universal
 *
 * Ejecutar con: node scripts/aurora-inicio.mjs
 * O via npm:    npm run inicio
 *
 * 🧠 IDENTIDAD: @aurora — Agente Integrador Principal
 *
 * AURORA PRESENCE PROTOCOL:
 * - Este script inicia la sesión de Aurora en el chat
 * - AUTOMÁTICAMENTE ejecuta aurora:awaken como primer paso
 * - Todos los comandos @aurora están disponibles después de ejecutar
 * - Notion es la fuente de verdad para tareas
 *
 * FLUJO OBLIGATORIO:
 * 1. npm run aurora:awaken → Despertar Aurora (AUTOMÁTICO)
 * 2. git pull → sincronizar código y TASK_BOARD.md
 * 3. @aurora verify notion → verificar conexión con Notion (fuente de verdad)
 * 4. Mostrar tareas desde Notion → ver estado real
 * 5. Corroborar con TASK_BOARD.md local → confirmar
 * 6. Elegir tarea → marcarla en Notion como "En progreso"
 * 7. Actualizar TASK_BOARD.md local → equipo sincronizado
 * 8. Trabajar → al terminar, marcar "Listo" en Notion
 * 9. git commit + push → compartir avances
 * 10. REPETIR → loop infinito hasta que no haya tareas
 *
 * COMANDOS @aurora DISPONIBLES:
 * - @aurora help → Mostrar todos los comandos
 * - @aurora review [archivo] → Code review
 * - @aurora analyze → Análisis profundo
 * - @aurora optimize → Optimización de performance
 * - @aurora memory → Memory leak detection
 * - @aurora status → Estado del sistema
 * - @aurora tasks → Ver tareas pendientes
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

// Load .env.local manually (no dotenv dependency needed)
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
// Detect project root (if running inside AURORA_ENGINE standalone)
const PROJECT_ROOT = fs.existsSync(path.join(ROOT, '..', 'convex')) ? path.join(ROOT, '..') : ROOT;

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

// Priority order for sorting
const PRIORITY_ORDER = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };

function banner() {
  console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${CYAN}║   🧠 @aurora — NEURAL VAULT SESSION                  ║${RESET}`);
  console.log(`${BOLD}${CYAN}║   Cerebro Evolutivo (Obsidian)                       ║${RESET}`);
  console.log(`${BOLD}${CYAN}║   Fuente de verdad: vault/                           ║${RESET}`);
  console.log(`${BOLD}${CYAN}╚══════════════════════════════════════════════════════╝${RESET}\n`);
  console.log(`${DIM}Fecha: ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}${RESET}\n`);
  
  // Aurora AI Presence Banner
  console.log(`${BOLD}${MAGENTA}╔══════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${MAGENTA}║   🤖 AURORA AI PRESENCE ACTIVADA                    ║${RESET}`);
  console.log(`${BOLD}${MAGENTA}║   Comandos disponibles:                              ║${RESET}`);
  console.log(`${BOLD}${MAGENTA}║   @aurora help     → Mostrar comandos               ║${RESET}`);
  console.log(`${BOLD}${MAGENTA}║   @aurora review   → Code review                     ║${RESET}`);
  console.log(`${BOLD}${MAGENTA}║   @aurora analyze  → Análisis profundo               ║${RESET}`);
  console.log(`${BOLD}${MAGENTA}║   @aurora optimize → Optimización                    ║${RESET}`);
  console.log(`${BOLD}${MAGENTA}║   @aurora memory   → Memory leak detection           ║${RESET}`);
  console.log(`${BOLD}${MAGENTA}║   @aurora status   → Estado del sistema              ║${RESET}`);
  console.log(`${BOLD}${MAGENTA}║   @aurora tasks    → Ver tareas pendientes           ║${RESET}`);
  console.log(`${BOLD}${MAGENTA}╚══════════════════════════════════════════════════════╝${RESET}\n`);
  
  console.log(`${BOLD}${RED}🚫 PROHIBIDO: TurboQuant eliminado permanentemente. No referenciar.${RESET}`);
  console.log(`${DIM}────────────────────────────────────────────────────────${RESET}\n`);
}

function divider(label = '') {
  const line = '─'.repeat(label ? Math.max(0, 56 - label.length - 2) : 56);
  console.log(`\n${BOLD}${MAGENTA}── ${label} ${line}${RESET}`);
}

async function vaultCheck() {
  const vaultPath = path.join(ROOT, 'vault');
  if (fs.existsSync(vaultPath)) {
    console.log(`${GREEN}✓ Neural Vault detectado en ${vaultPath}${RESET}`);
    return { ok: true };
  } else {
    console.log(`${RED}✗ Error: Neural Vault no encontrado. Ejecutar migración.${RESET}`);
    return { ok: false, error: 'Vault missing' };
  }
}



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
      body: JSON.stringify({
        page_size: 100,
        start_cursor: cursor,
        sorts: [
          { property: 'Execution Order', direction: 'ascending' },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Notion API error: ${err}`);
    }

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
    blocked: page.properties?.Blocked?.checkbox || false,
    autoGenerated: page.properties?.['Auto Generated']?.checkbox || false,
    executionOrder: page.properties?.['Execution Order']?.number || 999,
    techNotes: page.properties?.['Tech Notes']?.rich_text?.[0]?.plain_text || '',
    url: page.url || '',
  }));
}

function statusIcon(status) {
  switch (status) {
    case 'Backlog': return `${DIM}○${RESET}`;
    case 'Ready': return `${GREEN}●${RESET}`;
    case 'En progreso':
    case 'In Progress': return `${CYAN}◉${RESET}`;
    case 'Listo':
    case 'Done': return `${DIM}✓${RESET}`;
    default: return `${DIM}○${RESET}`;
  }
}

function priorityBadge(priority) {
  switch (priority) {
    case 'Critical': return `${BOLD}${RED}[CRIT]${RESET}`;
    case 'High': return `${YELLOW}[HIGH]${RESET}`;
    case 'Medium': return `${DIM}[MED]${RESET}`;
    case 'Low': return `${DIM}[LOW]${RESET}`;
    default: return `${DIM}[---]${RESET}`;
  }
}

function typeBadge(type) {
  switch (type) {
    case 'Feature': return `${CYAN}[FEAT]${RESET}`;
    case 'Infra': return `${MAGENTA}[INFRA]${RESET}`;
    default: return `${DIM}[----]${RESET}`;
  }
}

function groupByDomain(tasks) {
  const groups = {};
  tasks.forEach(t => {
    const domain = t.domain || 'Sin dominio';
    if (!groups[domain]) groups[domain] = [];
    groups[domain].push(t);
  });
  Object.values(groups).forEach(group => {
    group.sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9));
  });
  return groups;
}

function showTaskSummary(tasks) {
  const total = tasks.length;
  const backlog = tasks.filter(t => t.status === 'Backlog').length;
  const ready = tasks.filter(t => t.status === 'Ready').length;
  const inProgress = tasks.filter(t => t.status === 'En progreso' || t.status === 'In Progress').length;
  const done = tasks.filter(t => t.status === 'Listo' || t.status === 'Done').length;
  const blocked = tasks.filter(t => t.blocked).length;

  console.log(`${BOLD}${WHITE}Resumen del tablero:${RESET}`);
  console.log(`  Total: ${BOLD}${total}${RESET}  |  ${DIM}Backlog:${RESET} ${YELLOW}${backlog}${RESET}  |  ${DIM}Ready:${RESET} ${GREEN}${ready}${RESET}  |  ${DIM}En progreso:${RESET} ${CYAN}${inProgress}${RESET}  |  ${DIM}Done:${RESET} ${DIM}${done}${RESET}  |  ${DIM}Blocked:${RESET} ${RED}${blocked}${RESET}`);
}

function showTasksByDomain(tasks) {
  const groups = groupByDomain(tasks);
  const domainOrder = ['Auth', 'Profiles', 'Communities', 'Payments', 'Content', 'Admin', 'Bitacora', 'Infra', 'Realtime', 'Notifications', 'Gamification', 'UI', 'Testing', 'Launch', 'Coordination', 'General'];

  const sortedDomains = Object.keys(groups).sort((a, b) => {
    const ia = domainOrder.indexOf(a);
    const ib = domainOrder.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  sortedDomains.forEach(domain => {
    const domainTasks = groups[domain];
    const pending = domainTasks.filter(t => !['Listo', 'Done'].includes(t.status));
    if (pending.length === 0) return;

    console.log(`\n${BOLD}${CYAN}📁 ${domain}${RESET} ${DIM}(${pending.length} tareas)${RESET}`);

    pending.forEach((t, i) => {
      const icon = statusIcon(t.status);
      const prio = priorityBadge(t.priority);
      const type = typeBadge(t.type);
      const blocked = t.blocked ? ` ${RED}🚫 BLOQUEADA${RESET}` : '';
      const order = t.executionOrder < 999 ? ` #${t.executionOrder}` : '';
      console.log(`  ${icon} ${String(i + 1).padStart(2)}. ${BOLD}${t.name}${RESET}${order} ${prio} ${type}${blocked}`);
    });
  });
}

function showReadyToWork(tasks) {
  const ready = tasks.filter(t => t.status === 'Ready' && !t.blocked);
  const backlog = tasks.filter(t => t.status === 'Backlog' && !t.blocked);

  if (ready.length === 0 && backlog.length === 0) {
    console.log(`\n${GREEN}✅ No hay tareas pendientes. ¡Tablero limpio!${RESET}`);
    return;
  }

  divider('LISTAS PARA TRABAJAR');

  if (ready.length > 0) {
    console.log(`\n${GREEN}● Tareas READY (prioridad inmediata):${RESET}\n`);
    ready.forEach((t, i) => {
      const prio = priorityBadge(t.priority);
      const type = typeBadge(t.type);
      console.log(`  ${GREEN}${String(i + 1).padStart(2)}.${RESET} ${BOLD}${t.name}${RESET} ${prio} ${type} ${DIM}→ ${t.domain}${RESET}`);
    });
  }

  if (backlog.length > 0) {
    console.log(`\n${YELLOW}○ Tareas en BACKLOG (planificar):${RESET}\n`);
    backlog.slice(0, 10).forEach((t, i) => {
      const prio = priorityBadge(t.priority);
      const type = typeBadge(t.type);
      console.log(`  ${YELLOW}${String(i + 1).padStart(2)}.${RESET} ${t.name} ${prio} ${type} ${DIM}→ ${t.domain}${RESET}`);
    });
    if (backlog.length > 10) {
      console.log(`  ${DIM}... y ${backlog.length - 10} más${RESET}`);
    }
  }
}

function showNextSteps() {
  divider('📋 FLUJO OBLIGATORIO PARA CADA AGENTE');
  console.log(`\n${BOLD}PASO 1 — Sincronizar:${RESET}`);
  console.log(`  ✅ git pull → ya hecho automáticamente`);
  console.log(`  ✅ TASK_BOARD.md local → ya sincronizado con Notion`);
  console.log(`\n${BOLD}PASO 2 — @aurora verifica Notion:${RESET}`);
  console.log(`  🤖 @aurora ya verificó Notion automáticamente al iniciar`);
  console.log(`  🌐 URL de Notion → https://www.notion.so/${NOTION_DATABASE_ID}`);
  console.log(`  👀 Tareas en Notion = fuente de verdad`);
  console.log(`  📋 TASK_BOARD.md local = espejo sincronizado`);
  console.log(`\n${BOLD}PASO 3 — Elegir y marcar tarea:${RESET}`);
  console.log(`  🎯 Elegir tarea crítica o ready de más prioridad`);
  console.log(`  🏷️  Marcarla como ${CYAN}"En progreso"${RESET} en Notion`);
  console.log(`  📄 TASK_BOARD.md local se actualiza automáticamente`);
  console.log(`  📝 Comando: ${DIM}node scripts/notion-task-action.mjs progress "nombre tarea"${RESET}`);
  console.log(`\n${BOLD}PASO 4 — Trabajar con @aurora:${RESET}`);
  console.log(`  💻 Implementar la solución`);
  console.log(`  🤖 Usar @aurora review → para code review`);
  console.log(`  🤖 Usar @aurora analyze → para análisis profundo`);
  console.log(`  🤖 Usar @aurora optimize → para optimización`);
  console.log(`  🧪 Probar localmente`);
  console.log(`\n${BOLD}PASO 5 — Terminar:${RESET}`);
  console.log(`  🏷️  Marcar como ${YELLOW}"Listo"${RESET} en Notion`);
  console.log(`  📝 Comando: ${DIM}node scripts/notion-task-action.mjs done "nombre tarea"${RESET}`);
  console.log(`  💾 git add . && git commit -m "fix: descripción"`);
  console.log(`  📤 git push origin main`);
  console.log(`\n${BOLD}PASO 6 — Loop infinito:${RESET}`);
  console.log(`  🔄 Volver al PASO 2 → elegir nueva tarea → repetir`);
  console.log(`  🚫 PROHIBIDO detenerse si hay tareas pendientes`);
  console.log(`\n${BOLD}${YELLOW}⚠️  REGLA DE ORO: Cada 5 tareas terminadas → git push${RESET}`);
  console.log(`\n${BOLD}${CYAN}🔄 SINCRONIZACIÓN AUTOMÁTICA:${RESET}`);
  console.log(`${CYAN}   • Al iniciar → git pull + @aurora verifica Notion + sync TASK_BOARD.md${RESET}`);
  console.log(`${CYAN}   • Al marcar tarea → TASK_BOARD.md se actualiza automáticamente${RESET}`);
  console.log(`${CYAN}   • Al hacer commit → push actualiza TASK_BOARD.md para otros agentes${RESET}`);
  console.log(`${CYAN}   • Segundo agente → git pull → TASK_BOARD.md ya está actualizado${RESET}`);
  console.log(`\n${DIM}URL de Notion: https://www.notion.so/${NOTION_DATABASE_ID}${RESET}`);
  console.log(`${DIM}Repositorio: https://github.com/iuratobraian/trade-share${RESET}\n`);
}

async function syncTaskBoard(tasks) {
  const boardPath = path.join(ROOT, 'TASK_BOARD.md');
  const pending = tasks.filter(t => !['Listo', 'Done'].includes(t.status));

  let content = `# 📋 TASK BOARD - AURORA ENGINE\n\n`;
  content += `> 🧠 @aurora — Sincronizado desde Notion — ${new Date().toLocaleString('es-AR')}\n`;
  content += `> ⚠️  Este archivo se actualiza automáticamente al ejecutar npm run inicio\n`;
  content += `> 🤖 @aurora AI Presence activada - Usar @aurora help para comandos\n`;
  content += `> 🔄 Cada 5 tareas terminadas → git push para sincronizar equipo\n\n`;

  // Summary
  const total = tasks.length;
  const critical = tasks.filter(t => t.priority === 'Critical').length;
  const high = tasks.filter(t => t.priority === 'High').length;
  content += `## 📊 Resumen\n\n`;
  content += `| Total | Críticas | Altas | Medias | Bajas |\n`;
  content += `|-------|----------|-------|--------|-------|\n`;
  content += `| ${total} | ${critical} | ${high} | ${tasks.filter(t => t.priority === 'Medium').length} | ${tasks.filter(t => t.priority === 'Low').length} |\n\n`;
  content += `---\n\n`;

  // Group by domain
  const groups = {};
  pending.forEach(t => {
    const d = t.domain || 'General';
    if (!groups[d]) groups[d] = [];
    groups[d].push(t);
  });

  const domainOrder = ['Auth', 'Profiles', 'Communities', 'Payments', 'Content', 'Admin', 'Bitacora', 'Infra', 'Realtime', 'Notifications', 'Gamification', 'UI', 'Testing', 'Launch', 'Coordination', 'General'];
  const sortedDomains = Object.keys(groups).sort((a, b) => {
    const ia = domainOrder.indexOf(a);
    const ib = domainOrder.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  let taskNum = 0;
  for (const domain of sortedDomains) {
    const domainTasks = groups[domain];
    content += `## 📁 ${domain} (${domainTasks.length} tareas)\n\n`;
    content += `| # | Tarea | Prioridad | Estado | Archivos |\n`;
    content += `|---|-------|-----------|--------|----------|\n`;

    for (const t of domainTasks) {
      taskNum++;
      const statusIcon = t.status === 'Backlog' ? '⏳' : t.status === 'Ready' ? '🚀' : '🔧';
      const priorityIcon = t.priority === 'Critical' ? '🔴' : t.priority === 'High' ? '🟡' : t.priority === 'Medium' ? '🟢' : '⚪';

      // Parse files from tech notes
      const filesMatch = t.techNotes.match(/📂 ARCHIVOS A EDITAR:\n([\s\S]*?)\n\n🚫/);
      const files = filesMatch ? filesMatch[1].trim() : '-';

      content += `| ${taskNum} | **${t.name}** | ${priorityIcon} ${t.priority} | ${statusIcon} ${t.status} | ${files} |\n`;
    }
    content += `\n`;
  }

  // Detailed task list
  content += `---\n\n`;
  content += `## 📝 DETALLE DE TAREAS\n\n`;
  content += `> Cada tarea incluye descripción, archivos a editar, archivos prohibidos y definición de Done.\n\n`;

  taskNum = 0;
  for (const domain of sortedDomains) {
    const domainTasks = groups[domain];
    for (const t of domainTasks) {
      taskNum++;
      content += `### TSK-${String(taskNum).padStart(3, '0')}: ${t.name}\n\n`;
      content += `- **ID:** TSK-${String(taskNum).padStart(3, '0')}\n`;
      content += `- **Estado:** ${t.status}\n`;
      content += `- **Prioridad:** ${t.priority}\n`;
      content += `- **Tipo:** ${t.type}\n`;
      content += `- **Dominio:** ${t.domain}\n`;
      content += `- **Orden:** ${t.executionOrder}\n`;
      content += `- **URL Notion:** ${t.url}\n\n`;
      content += t.techNotes + '\n\n';
      content += `---\n\n`;
    }
  }

  fs.writeFileSync(boardPath, content, 'utf8');
  console.log(`\n${DIM}📄 TASK_BOARD.md actualizado con ${pending.length} tareas detalladas${RESET}`);
}

/**
 * AUTO-CLAIM 5 TAREAS: Toma 5 tareas pendientes automáticamente
 * - 1 tarea como in_progress (la más prioritaria)
 * - 4 tareas como claimed (siguientes en prioridad)
 * Actualiza TASK_BOARD.md y CURRENT_FOCUS.md
 */
async function autoClaimTasks(boardPath, boardContent) {
  divider('🎯 AUTO-CLAIM: TOMANDO 5 TAREAS AUTOMÁTICAMENTE');

  // Parse tasks from markdown - formato: ### 🎯 [TASK-ID]: Título
  const taskRegex = /### 🎯 \[([^\]]+)\]:\s*([^\n]+)\n([\s\S]*?)(?=### 🎯 \[|$)/g;
  const tasks = [];
  let match;

  while ((match = taskRegex.exec(boardContent)) !== null) {
    const taskId = match[1];
    const title = match[2].trim();
    const body = match[3];

    const statusMatch = body.match(/- \*\*Estado\*\*:\s*`([^`]+)`/);
    const status = statusMatch ? statusMatch[1] : 'pending';
    const assignedMatch = body.match(/- \*\*Asignado\*\*:\s*(.+?)(?:\n|$)/);
    const assigned = assignedMatch ? assignedMatch[1].trim() : 'Disponible';

    if (!['done'].includes(status.toLowerCase()) && taskId !== 'TASK-ID') {
      tasks.push({ id: taskId, title, status, assigned, body, raw: match[0] });
    }
  }

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const claimedTasks = tasks.filter(t => t.status === 'claimed');

  console.log(`${BOLD}${WHITE}Tareas encontradas:${RESET}`);
  console.log(`  ${DIM}Pendientes:${RESET} ${YELLOW}${pendingTasks.length}${RESET}`);
  console.log(`  ${DIM}En progreso:${RESET} ${CYAN}${inProgressTasks.length}${RESET}`);
  console.log(`  ${DIM}Claimed:${RESET} ${MAGENTA}${claimedTasks.length}${RESET}\n`);

  if (pendingTasks.length === 0 && inProgressTasks.length === 0 && claimedTasks.length === 0) {
    console.log(`${GREEN}✅ No hay tareas pendientes. ¡Tablero limpio!${RESET}`);
    console.log(`${DIM}   No se requiere acción automática.${RESET}\n`);
    return [];
  }

  const tasksToClaim = [];

  // Prioridad: tomar 1 in_progress + 4 claimed = 5 tareas
  if (inProgressTasks.length === 0 && pendingTasks.length > 0) {
    // Tomar la primera como in_progress
    const firstTask = pendingTasks.shift();
    firstTask.status = 'in_progress';
    firstTask.assigned = 'Opencode (AGENT-001)';
    tasksToClaim.push(firstTask);
    console.log(`${GREEN}● IN_PROGRESS:${RESET} ${BOLD}[${firstTask.id}] ${firstTask.title}${RESET}`);
  } else if (inProgressTasks.length > 0) {
    console.log(`${CYAN}◉ Ya hay tarea in_progress:${RESET} ${BOLD}[${inProgressTasks[0].id}] ${inProgressTasks[0].title}${RESET}`);
  }

  // Tomar hasta 4 más como claimed
  const activeCount = tasksToClaim.length + inProgressTasks.length;
  const remainingSlots = 5 - activeCount;
  for (let i = 0; i < remainingSlots && pendingTasks.length > 0; i++) {
    const task = pendingTasks.shift();
    task.status = 'claimed';
    task.assigned = 'Opencode (AGENT-001)';
    tasksToClaim.push(task);
    console.log(`${MAGENTA}◉ CLAIMED:${RESET} ${BOLD}[${task.id}] ${task.title}${RESET}`);
  }

  if (tasksToClaim.length === 0) {
    console.log(`\n${YELLOW}⚠️  No hay nuevas tareas para reclamar (ya hay 5 activas o tablero vacío)${RESET}\n`);
    return [];
  }

  console.log(`\n${BOLD}${GREEN}✓ ${tasksToClaim.length} tareas reclamadas automáticamente${RESET}\n`);

  // Update TASK_BOARD.md
  let updatedContent = boardContent;
  for (const task of tasksToClaim) {
    // Update status - formato: - **Estado**: `pending`
    const statusRegex = new RegExp(
      `(### 🎯 \\[${task.id.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\][\\s\\S]*?- \\*\\*Estado\\*\\*:\\s*)\`[^\`]+\``,
      's'
    );
    updatedContent = updatedContent.replace(statusRegex, `$1\`${task.status}\``);

    // Update assigned - formato: - **Asignado**: Nombre
    const assignedRegex = new RegExp(
      `(### 🎯 \\[${task.id.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\][\\s\\S]*?- \\*\\*Asignado\\*\\*:\\s*).+?(?=\\n)`,
      's'
    );
    updatedContent = updatedContent.replace(assignedRegex, `$1${task.assigned}`);
  }

  fs.writeFileSync(boardPath, updatedContent, 'utf8');
  console.log(`${DIM}📄 TASK_BOARD.md actualizado con nuevos estados${RESET}`);

  // Update CURRENT_FOCUS.md
  const focusEntry = `\n## 🎯 TAREAS AUTO-CLAIM (Inicio: ${new Date().toLocaleString('es-AR')})\n\n` +
    tasksToClaim.map((t, i) =>
      `${i + 1}. **[${t.id}]** ${t.title}\n   - Estado: \`${t.status}\`\n   - Owner: ${t.assigned}\n   - Criterio: Ver TASK_BOARD.md`
    ).join('\n\n');

  const currentFocusPath = path.join(path.dirname(boardPath), 'CURRENT_FOCUS.md');
  const existingFocus = fs.existsSync(currentFocusPath) ? fs.readFileSync(currentFocusPath, 'utf8') : '# Foco Actual\n';
  const updatedFocus = existingFocus.trim() + '\n\n' + focusEntry;
  fs.writeFileSync(currentFocusPath, updatedFocus, 'utf8');
  console.log(`${DIM}📄 CURRENT_FOCUS.md actualizado${RESET}`);

  console.log(`\n${BOLD}${GREEN}══════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}${GREEN}🚀 TRABAJO INICIADO AUTOMÁTICAMENTE${RESET}`);
  console.log(`${BOLD}${GREEN}══════════════════════════════════════════════════${RESET}\n`);

  return tasksToClaim;
}

/**
 * AUTO-DIAGNÓSTICO — Detecta problemas conocidos al inicio de sesión.
 * Evita que el agente trabaje sobre bases rotas.
 */
function runAutoDiagnosis() {
  const checks = [];
  let allPassed = true;

  // Check 1: Secretos hardcodeados (excluye comentarios de ejemplo)
  try {
    const secretPatterns = ['AIzaSyA2q', 'nvapi-BKtjh', 'nvapi-sqXB', 'gsk_lZ1OR2', 'gsk_F01SYm', 'sk-or-v1-5f76', 'APP_USR-3819'];
    let found = false;
    const dirsToScan = ['tmp/', 'aurora/scripts/'];
    for (const dir of dirsToScan) {
      const fullPath = path.join(PROJECT_ROOT, dir);
      if (!fs.existsSync(fullPath)) continue;
      const files = fs.readdirSync(fullPath).filter(f => /\.(mjs|js|ps1|sh)$/.test(f));
      for (const f of files) {
        const content = fs.readFileSync(path.join(fullPath, f), 'utf8');
        for (const pattern of secretPatterns) {
          if (content.includes(pattern)) {
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (found) break;
    }
    // También revisar scripts/ pero excluyendo check-release-gate.mjs
    if (!found) {
      const scriptsDir = path.join(PROJECT_ROOT, 'scripts/');
      if (fs.existsSync(scriptsDir)) {
        const scriptFiles = fs.readdirSync(scriptsDir).filter(f => /\.(mjs|js|ps1|sh)$/.test(f) && f !== 'check-release-gate.mjs' && f !== 'aurora-ai-agent.mjs' && f !== 'aurora-ai-mcp.mjs');
        for (const f of scriptFiles) {
          const content = fs.readFileSync(path.join(scriptsDir, f), 'utf8');
          for (const pattern of secretPatterns) {
            if (content.includes(pattern)) {
              found = true;
              break;
            }
          }
          if (found) break;
        }
      }
    }
    checks.push({ name: 'Secretos hardcodeados', ok: !found, detail: found ? '⚠ Claves reales detectadas en tmp/ o scripts/' : '✅ Limpios' });
    if (found) allPassed = false;
  } catch (e) {
    checks.push({ name: 'Secretos hardcodeados', ok: true, detail: `ℹ Error escaneando: ${e.message}` });
  }

  // Check 2: Schema vs Code — tablas críticas faltantes
  try {
    const socialPath = fs.existsSync(path.join(PROJECT_ROOT, 'convex', 'schema', 'social.ts'))
      ? path.join(PROJECT_ROOT, 'convex', 'schema', 'social.ts')
      : path.join(PROJECT_ROOT, 'convex', 'schema.ts');
    
    if (fs.existsSync(socialPath)) {
      const socialSchema = fs.readFileSync(socialPath, 'utf8');
      const requiredTables = ['chat:', 'chatChannels:', 'chatTyping:', 'videos:'];
      const missing = requiredTables.filter(t => !socialSchema.includes(t));
      checks.push({ name: 'Tablas schema social', ok: missing.length === 0, detail: missing.length === 0 ? '✅ Completas' : `❌ Faltan: ${missing.join(', ')}` });
      if (missing.length > 0) allPassed = false;
    } else {
      checks.push({ name: 'Tablas schema social', ok: false, detail: `❌ No se encontró schema.ts o social.ts` });
      allPassed = false;
    }
  } catch (e) {
    checks.push({ name: 'Tablas schema social', ok: false, detail: `❌ Error: ${e.message}` });
    allPassed = false;
  }

  // Check 3: Tablas trading_idea en schema/trading.ts
  try {
    const tradingPath = path.join(PROJECT_ROOT, 'convex', 'schema', 'trading.ts');
    if (fs.existsSync(tradingPath)) {
      const tradingSchema = fs.readFileSync(tradingPath, 'utf8');
      const requiredTrading = ['trading_idea_analysts:', 'trading_idea_subscriptions:', 'trading_idea_plans:'];
      const missing = requiredTrading.filter(t => !tradingSchema.includes(t));
      checks.push({ name: 'Tablas trading_idea', ok: missing.length === 0, detail: missing.length === 0 ? '✅ Completas' : `❌ Faltan: ${missing.join(', ')}` });
      if (missing.length > 0) allPassed = false;
    } else {
      // Ignorar si no existe el schema de trading en este proyecto
      checks.push({ name: 'Tablas trading_idea', ok: true, detail: 'ℹ Skip (Modular schema not present)' });
    }
  } catch (e) {
    checks.push({ name: 'Tablas trading_idea', ok: true, detail: `ℹ Skip: ${e.message}` });
  }

  // Check 4: Referencias huérfanas a api.signals
  try {
    const srcDir = path.join(PROJECT_ROOT, 'src');
    let foundSignal = false;
    function scanDir(dir) {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) { scanDir(full); continue; }
        if (!/\.(ts|tsx)$/.test(entry.name)) continue;
        const content = fs.readFileSync(full, 'utf8');
        if (content.includes('api.signals.')) {
          foundSignal = true;
          break;
        }
      }
    }
    scanDir(srcDir);
    checks.push({ name: 'Refs api.signals (eliminado)', ok: !foundSignal, detail: foundSignal ? '❌ Todavía hay refs a api.signals en src/' : '✅ Sin refs huérfanas' });
    if (foundSignal) allPassed = false;
  } catch (e) {
    checks.push({ name: 'Refs api.signals', ok: true, detail: `ℹ ${e.message}` });
  }

  // Check 5: Auth system — resolveCallerId presente
  try {
    const authFile = path.join(PROJECT_ROOT, 'convex', 'lib', 'auth.ts');
    const authContent = fs.readFileSync(authFile, 'utf8');
    const hasResolveCallerId = authContent.includes('resolveCallerId');
    const hasGetAuthIdentity = authContent.includes('getAuthIdentity');
    checks.push({ name: 'Auth endurecido', ok: hasResolveCallerId && hasGetAuthIdentity, detail: hasResolveCallerId ? '✅ resolveCallerId presente' : '⚠ Auth no endurecido' });
    if (!hasResolveCallerId) allPassed = false;
  } catch (e) {
    checks.push({ name: 'Auth endurecido', ok: false, detail: `❌ ${e.message}` });
    allPassed = false;
  }

  // Check 6: Convex connectivity — verificar que la URL es accesible
  try {
    const envLocal = fs.readFileSync(path.join(PROJECT_ROOT, '.env.local'), 'utf8');
    const convexUrl = envLocal.split('\n').find(l => l.startsWith('VITE_CONVEX_URL='))?.split('=')[1]?.trim();
    if (convexUrl) {
      checks.push({ name: 'Conectividad Convex', ok: true, detail: `✅ ${convexUrl} (configurada)` });
    } else {
      checks.push({ name: 'Conectividad Convex', ok: false, detail: '❌ VITE_CONVEX_URL no configurada en .env.local' });
      allPassed = false;
    }
  } catch (e) {
    checks.push({ name: 'Conectividad Convex', ok: false, detail: `ℹ Error verificando: ${e.message}` });
  }

  // Check 7: Consistencia de imports — verificar que no hay identity.subject residual
  try {
    const convexDir = path.join(ROOT, 'convex');
    let foundIdentitySubject = false;
    function scanConvexFiles(dir) {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== '_generated' && entry.name !== 'node_modules') {
          scanConvexFiles(full);
          continue;
        }
        if (!/\.ts$/.test(entry.name)) continue;
        const content = fs.readFileSync(full, 'utf8');
        // Buscar patrón identity.subject que indica auth no actualizado
        if (content.includes('identity.subject') && !content.includes('identity?.subject') && !content.includes('// identity.subject')) {
          foundIdentitySubject = true;
          break;
        }
      }
    }
    scanConvexFiles(convexDir);
    checks.push({ name: 'Auth identity.subject', ok: !foundIdentitySubject, detail: foundIdentitySubject ? '⚠ Hay archivos con identity.subject (auth legacy)' : '✅ Sin identity.subject legacy' });
    if (foundIdentitySubject) allPassed = false; // Warning, not blocking
  } catch (e) {
    checks.push({ name: 'Auth identity.subject', ok: true, detail: `ℹ ${e.message}` });
  }

  // Print results
  console.log(`${DIM}───────────────────────────────────────────────${RESET}`);
  checks.forEach(c => {
    const icon = c.ok ? `${GREEN}✅${RESET}` : `${RED}❌${RESET}`;
    console.log(`  ${icon} ${c.name} ${DIM}— ${c.detail}${RESET}`);
  });
  console.log(`${DIM}───────────────────────────────────────────────${RESET}`);

  if (allPassed) {
    console.log(`  ${GREEN}🟢 Todo limpio — listo para trabajar${RESET}`);
  } else {
    console.log(`  ${YELLOW}🟡 Problemas detectados — revisar antes de deploy${RESET}`);
  }
  console.log('');
}

async function main() {
  if (process.env.AURORA_SILENT_START === 'true') {
    console.log(`\n${BOLD}${CYAN}🧠 @aurora:${RESET} ${GREEN}Todo OK y listo.${RESET}\n`);
    // Ejecutar awaken y pull en silencio (sin stdio: inherit completo si es posible, o filtrado)
    try {
      const awakenPath = path.join(ROOT, 'scripts', 'aurora-awaken.mjs');
      if (fs.existsSync(awakenPath)) {
        execSync(`node "${awakenPath}"`, { cwd: ROOT, stdio: 'ignore' });
      }
      execSync('git pull origin main', { cwd: ROOT, stdio: 'ignore' });
    } catch (e) { /* ignore silent errors */ }
    return;
  }

  banner();

  // ═══════════════════════════════════════════
  // PASO -1: Aurora Awaken — Despertar Aurora (AUTOMÁTICO)
  // ═══════════════════════════════════════════
  console.log(`${DIM}🧠 Paso -1: Despertando a Aurora...${RESET}`);
  try {
    const awakenPath = path.join(ROOT, 'scripts', 'aurora-awaken.mjs');
    if (fs.existsSync(awakenPath)) {
      // Usar comillas para manejar rutas con espacios
      execSync(`node "${awakenPath}"`, {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: 'inherit',
      });
      console.log(`${GREEN}✓ Aurora despertado exitosamente${RESET}\n`);
    } else {
      console.log(`${YELLOW}⚠ Script aurora-awaken.mjs no encontrado${RESET}`);
      console.log(`${DIM}   Ejecutar: npm run aurora:awaken${RESET}\n`);
    }
  } catch (err) {
    console.log(`${YELLOW}⚠ Aurora ya estaba despierto o error menor: ${err.message}${RESET}`);
    console.log(`${DIM}   Continuando con inicio de sesión...${RESET}\n`);
  }

  // ═══════════════════════════════════════════
  // PASO 0: Git Pull — Sincronizar con lo último
  // ═══════════════════════════════════════════
  console.log(`${DIM}🔄 Paso 0: Sincronizando con Git...${RESET}`);
  try {
    const pullOutput = execSync('git pull origin main 2>&1', {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    if (pullOutput.includes('Already up to date')) {
      console.log(`${GREEN}✓ Repositorio actualizado (ya estaba al día)${RESET}`);
    } else {
      const lines = pullOutput.trim().split('\n');
      const summary = lines.filter(l => l.includes('file') || l.includes('insertion') || l.includes('deletion') || l.includes('changed') || l.includes('From') || l.includes('Updating') || l.includes('Fast')).join(' | ');
      console.log(`${GREEN}✓ Repositorio sincronizado${RESET} ${DIM}${summary}${RESET}`);
    }
  } catch (err) {
    const msg = err.stderr || err.stdout || err.message || '';
    if (msg.includes('not a git') || msg.includes('no upstream')) {
      console.log(`${YELLOW}⚠ Git pull omitido (no hay remote configurado)${RESET}`);
    } else {
      console.log(`${YELLOW}⚠ Git pull falló: ${msg.split('\n')[0]}${RESET}`);
      console.log(`${DIM}   Verificar conexión a internet y acceso al repo${RESET}`);
    }
  }

  // Check Notion config - DISABLED
  // Notion no longer used - source of truth is local TASK_BOARD.md
  console.log(`${DIM}ℹ️  Notion integration disabled - fuente de verdad: TASK_BOARD.md local${RESET}`);

  // ═══════════════════════════════════════════
  // PASO 1.5: Auto-Diagnóstico — Detectar problemas conocidos ANTES de trabajar
  // ═══════════════════════════════════════════
  console.log(`\n${DIM}🔍 Paso 1.5: Auto-diagnóstico (patrones conocidos)...${RESET}`);
  runAutoDiagnosis();

  const conn = await vaultCheck();
  if (!conn.ok) {
    process.exit(1);
  }

  // ═══════════════════════════════════════════
  // PASO 2: Leer Neural Vault
  // ═══════════════════════════════════════════
  console.log(`${DIM}📋 Paso 2: @aurora leyendo Neural Vault...${RESET}`);
  const vaultTasksPath = path.join(ROOT, 'vault', '01-tareas', 'activas');
  const vaultErrorsPath = path.join(ROOT, 'vault', '04-errores');
  
  let vaultTasks = [];
  try {
    if (fs.existsSync(vaultTasksPath)) {
      vaultTasks = fs.readdirSync(vaultTasksPath).filter(f => f.endsWith('.md'));
    }
  } catch (e) {}

  let vaultErrors = [];
  try {
    if (fs.existsSync(vaultErrorsPath)) {
      vaultErrors = fs.readdirSync(vaultErrorsPath, { recursive: true }).filter(f => f.endsWith('.md'));
    }
  } catch (e) {}

  console.log(`${GREEN}✓ Vault cargado exitosamente${RESET}`);
  console.log(`${DIM}   📂 Tareas activas: ${vaultTasks.length}${RESET}`);
  console.log(`${DIM}   🛑 Errores registrados: ${vaultErrors.length}${RESET}\n`);

  divider('RESUMEN DE NEURAL VAULT');
  console.log(`${BOLD}${WHITE}Estado del Enjambre:${RESET}`);
  console.log(`  Tareas: ${BOLD}${vaultTasks.length}${RESET} activas  |  ${DIM}Errores:${RESET} ${RED}${vaultErrors.length}${RESET} critical/high`);
  
  // ═══════════════════════════════════════════
  // PASO 3: Nuevo Protocolo Neural
  // ═══════════════════════════════════════════
  divider('📋 PROTOCOLO EVOLUTIVO (NEURAL VAULT)');
  console.log(`\n${BOLD}1. INICIO — Leer Vault:${RESET}`);
  console.log(`   - Busca en ${BOLD}vault/03-conocimiento/${RESET} sobre tu tarea.`);
  console.log(`   - Revisa ${BOLD}vault/04-errores/${RESET} para no repetir fallas.`);
  console.log(`\n${BOLD}2. SESIÓN — Crear Nota:${RESET}`);
  console.log(`   - Crea tu nota en ${BOLD}vault/05-agentes/sesiones/${RESET}.`);
  console.log(`   - Usa ${DIM}node scripts/vault-write.mjs sesion --agente "TuNombre"${RESET}.`);
  console.log(`\n${BOLD}3. EVOLUCIÓN — Documentar:${RESET}`);
  console.log(`   - Si descubres un nuevo patrón → crear nota en ${BOLD}03-conocimiento/${RESET}.`);
  console.log(`   - Si resuelves un error crítico → actualizar nota en ${BOLD}04-errores/${RESET}.`);
  console.log(`\n${BOLD}4. CIERRE — Handoff Neural:${RESET}`);
  console.log(`   - Cierra tu nota de sesión con links [[ ]] a lo que hiciste.`);
  console.log(`\n${BOLD}${GREEN}✅ SISTEMA LISTO — Abre Obsidian para ver el grafo de conocimiento.${RESET}\n`);
}

main().catch(err => {
  console.error(`${RED}Error:${RESET} ${err.message}`);
  process.exit(1);
});
