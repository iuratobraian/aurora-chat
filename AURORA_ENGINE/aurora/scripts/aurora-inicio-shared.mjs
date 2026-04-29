#!/usr/bin/env node
/**
 * aurora-inicio-shared.mjs — Punto de Entrada Unificado Aurora + Agente
 *
 * Este script integra completamente Aurora con el flujo de trabajo del agente.
 * Crea un contexto compartido que potencia la coordinación al máximo.
 *
 * Ejecutar con: node aurora/scripts/aurora-inicio-shared.mjs
 * O via npm:    npm run aurora:shared
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
  } catch { /* skip */ }
}
loadEnv('.env.local');
loadEnv('.env.aurora');

const ROOT = process.cwd();
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

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
const BLUE = '\x1b[34m';

function banner() {
  console.log(`\n${BOLD}${MAGENTA}╔══════════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${MAGENTA}║   🌊 AURORA × AGENTE — INICIO COMPARTIDO INTEGRADO          ║${RESET}`);
  console.log(`${BOLD}${MAGENTA}║   Sistema de Coordinación Unificada                          ║${RESET}`);
  console.log(`${BOLD}${MAGENTA}║   Potenciado por Aurora Mente Maestra                        ║${RESET}`);
  console.log(`${BOLD}${MAGENTA}╚══════════════════════════════════════════════════════════════╝${RESET}\n`);
  console.log(`${DIM}Fecha: ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}${RESET}\n`);
}

function divider(label = '') {
  const line = '─'.repeat(Math.max(0, 60 - label.length - 2));
  console.log(`\n${BOLD}${MAGENTA}── ${label} ${line}${RESET}`);
}

function section(title, lines) {
  console.log(`\n${BOLD}${CYAN}▸ ${title}${RESET}`);
  lines.forEach(l => console.log(`  ${l}`));
}

function statusBadge(ok) {
  return ok ? `${GREEN}●${RESET}` : `${RED}●${RESET}`;
}

// ═══════════════════════════════════════════
// MODULE 1: Git Sync
// ═══════════════════════════════════════════
async function gitSync() {
  console.log(`${DIM}🔄 Sincronizando con Git...${RESET}`);
  try {
    const output = execSync('git pull origin main 2>&1', { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    if (output.includes('Already up to date')) {
      console.log(`${GREEN}  ✓ Repositorio actualizado${RESET}`);
      return { ok: true, msg: 'up-to-date' };
    }
    console.log(`${GREEN}  ✓ Repositorio sincronizado${RESET}`);
    return { ok: true, msg: 'synced' };
  } catch (err) {
    const msg = err.stderr || err.stdout || err.message || '';
    console.log(`${YELLOW}  ⚠ Git pull: ${msg.split('\n')[0]}${RESET}`);
    return { ok: false, msg: msg.split('\n')[0] };
  }
}

// ═══════════════════════════════════════════
// MODULE 2: Notion Connection
// ═══════════════════════════════════════════
async function notionSync() {
  if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
    console.log(`${YELLOW}  ⚠ Notion no configurado (opcional)${RESET}`);
    return { ok: false, tasks: [], msg: 'not-configured' };
  }

  try {
    const res = await fetch('https://api.notion.com/v1/users/me', {
      headers: { 'Authorization': `Bearer ${NOTION_API_KEY}`, 'Notion-Version': '2022-06-28' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log(`${GREEN}  ✓ Notion conectado: ${data.name || 'Notion'}${RESET}`);

    // Fetch tasks
    const taskRes = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${NOTION_API_KEY}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_size: 100, sorts: [{ property: 'Execution Order', direction: 'ascending' }] }),
    });
    if (!taskRes.ok) throw new Error(`HTTP ${taskRes.status}`);
    const taskData = await taskRes.json();

    const tasks = taskData.results.map(page => ({
      id: page.id,
      name: page.properties?.Name?.title?.[0]?.plain_text || 'Untitled',
      status: page.properties?.Status?.select?.name || 'Backlog',
      type: page.properties?.Type?.select?.name || '-',
      priority: page.properties?.Priority?.select?.name || 'Medium',
      domain: page.properties?.Domain?.rich_text?.[0]?.plain_text || '',
      blocked: page.properties?.Blocked?.checkbox || false,
      url: page.url || '',
    }));

    const pending = tasks.filter(t => !['Listo', 'Done'].includes(t.status));
    console.log(`${GREEN}  ✓ ${tasks.length} tareas (${pending.length} pendientes)${RESET}`);
    return { ok: true, tasks, pending, msg: 'synced' };
  } catch (err) {
    console.log(`${RED}  ✗ Notion error: ${err.message}${RESET}`);
    return { ok: false, tasks: [], msg: err.message };
  }
}

// ═══════════════════════════════════════════
// MODULE 3: Aurora Core State
// ═══════════════════════════════════════════
function readText(filePath) {
  try { return fs.readFileSync(path.join(ROOT, filePath), 'utf8'); }
  catch { return ''; }
}

function readJson(filePath) {
  try { return JSON.parse(readText(filePath)); }
  catch { return null; }
}

function readJsonl(filePath) {
  try {
    const text = readText(filePath).trim();
    if (!text) return [];
    return text.split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
  } catch { return []; }
}

function auroraCoreState() {
  console.log(`${DIM}🧠 Cargando estado de Aurora...${RESET}`);

  // Surfaces
  const surfaces = readJson('.agent/aurora/aurora_surface_registry.json');
  const surfaceCount = surfaces?.surfaces?.length || 0;
  console.log(`${GREEN}  ✓ ${surfaceCount} surfaces registradas${RESET}`);

  // Skills
  const skills = readJson('.agent/aurora/aurora_skill_registry.json');
  const skillCount = skills?.skills?.length || 0;
  console.log(`${GREEN}  ✓ ${skillCount} skills activos${RESET}`);

  // Knowledge base
  const knowledgeFiles = [
    '.agent/brain/db/heuristics.jsonl',
    '.agent/brain/db/patterns.jsonl',
    '.agent/brain/db/anti_patterns.jsonl',
    '.agent/brain/db/error_catalog.jsonl',
    '.agent/brain/db/teamwork_knowledge.jsonl',
    '.agent/brain/db/ideas.jsonl',
    '.agent/brain/db/references.jsonl',
  ];
  let knowledgeCount = 0;
  knowledgeFiles.forEach(f => { knowledgeCount += readJsonl(f).length; });
  console.log(`${GREEN}  ✓ ${knowledgeCount} registros de conocimiento${RESET}`);

  // Task board
  const board = readText('.agent/workspace/coordination/TASK_BOARD.md');
  const taskLines = board.split('\n').filter(l => l.startsWith('|') && !l.includes('TASK-ID') && !l.includes('---'));
  const tasks = taskLines.map(l => l.split('|').slice(1, -1).map(c => c.trim())).filter(c => c.length >= 7);
  const doneTasks = tasks.filter(t => t[1] === 'done').length;
  const totalTasks = tasks.length;
  console.log(`${GREEN}  ✓ ${totalTasks} tareas totales (${doneTasks} completadas)${RESET}`);

  // Connectors
  const connectors = readJson('.agent/aurora/connectors.json');
  const apiCount = connectors?.apis?.length || 0;
  const mcpCount = connectors?.mcp?.length || 0;
  console.log(`${GREEN}  ✓ ${apiCount} APIs + ${mcpCount} MCPs configurados${RESET}`);

  // AI Models
  const models = readJson('.agent/aurora/ai_models.json');
  const modelCount = models?.length || 0;
  console.log(`${GREEN}  ✓ ${modelCount} modelos AI configurados${RESET}`);

  return {
    surfaces: surfaceCount,
    skills: skillCount,
    knowledge: knowledgeCount,
    tasks: { total: totalTasks, done: doneTasks, pending: totalTasks - doneTasks },
    connectors: { apis: apiCount, mcps: mcpCount },
    models: modelCount,
  };
}

// ═══════════════════════════════════════════
// MODULE 4: System Health
// ═══════════════════════════════════════════
function systemHealth() {
  console.log(`${DIM}💓 Verificando salud del sistema...${RESET}`);

  const checks = [];

  // Node
  try {
    const version = execSync('node --version', { encoding: 'utf8' }).trim();
    checks.push({ name: 'Node.js', status: 'ok', detail: version });
    console.log(`${GREEN}  ✓ Node.js: ${version}${RESET}`);
  } catch {
    checks.push({ name: 'Node.js', status: 'error', detail: 'not-found' });
    console.log(`${RED}  ✗ Node.js: no encontrado${RESET}`);
  }

  // Dependencies
  const hasNodeModules = fs.existsSync(path.join(ROOT, 'node_modules'));
  checks.push({ name: 'Dependencies', status: hasNodeModules ? 'ok' : 'warning', detail: hasNodeModules ? 'installed' : 'missing' });
  console.log(hasNodeModules ? `${GREEN}  ✓ Dependencias instaladas${RESET}` : `${YELLOW}  ⚠ Dependencias no instaladas${RESET}`);

  // Aurora scripts
  const auroraScripts = fs.existsSync(path.join(ROOT, 'aurora/scripts'));
  const scriptCount = auroraScripts ? fs.readdirSync(path.join(ROOT, 'aurora/scripts')).filter(f => f.endsWith('.mjs')).length : 0;
  checks.push({ name: 'Aurora Scripts', status: auroraScripts ? 'ok' : 'error', detail: `${scriptCount} scripts` });
  console.log(`${GREEN}  ✓ ${scriptCount} scripts Aurora${RESET}`);

  // Brain DB
  const brainDb = fs.existsSync(path.join(ROOT, '.agent/brain/db'));
  checks.push({ name: 'Brain DB', status: brainDb ? 'ok' : 'warning', detail: brainDb ? 'active' : 'missing' });
  console.log(brainDb ? `${GREEN}  ✓ Brain DB activa${RESET}` : `${YELLOW}  ⚠ Brain DB no encontrada${RESET}`);

  // Coordination
  const coord = fs.existsSync(path.join(ROOT, '.agent/workspace/coordination'));
  checks.push({ name: 'Coordination', status: coord ? 'ok' : 'warning', detail: coord ? 'active' : 'missing' });
  console.log(coord ? `${GREEN}  ✓ Sistema de coordinación activo${RESET}` : `${YELLOW}  ⚠ Coordinación no encontrada${RESET}`);

  // API key check
  const hasNvidia = !!NVIDIA_API_KEY;
  const hasOpenRouter = !!OPENROUTER_API_KEY;
  checks.push({ name: 'NVIDIA API', status: hasNvidia ? 'ok' : 'warning', detail: hasNvidia ? 'configured' : 'missing' });
  checks.push({ name: 'OpenRouter', status: hasOpenRouter ? 'ok' : 'warning', detail: hasOpenRouter ? 'configured' : 'missing' });
  console.log(hasNvidia ? `${GREEN}  ✓ NVIDIA API configurada${RESET}` : `${YELLOW}  ⚠ NVIDIA API no configurada${RESET}`);
  console.log(hasOpenRouter ? `${GREEN}  ✓ OpenRouter configurado${RESET}` : `${YELLOW}  ⚠ OpenRouter no configurado${RESET}`);

  return { checks, ok: checks.filter(c => c.status === 'ok').length, total: checks.length };
}

// ═══════════════════════════════════════════
// MODULE 5: Shared Context Builder
// ═══════════════════════════════════════════
function buildSharedContext(auroraState, health, notionResult) {
  console.log(`${DIM}🔗 Construyendo contexto compartido...${RESET}`);

  // Get top knowledge entries
  const heuristics = readJsonl('.agent/brain/db/heuristics.jsonl').slice(0, 10);
  const patterns = readJsonl('.agent/brain/db/patterns.jsonl').slice(0, 10);
  const antiPatterns = readJsonl('.agent/brain/db/anti_patterns.jsonl').slice(0, 10);
  const teamwork = readJsonl('.agent/brain/db/teamwork_knowledge.jsonl').slice(0, 10);

  // Get surfaces
  const surfaces = readJson('.agent/aurora/aurora_surface_registry.json');

  // Get skills
  const skills = readJson('.agent/aurora/aurora_skill_registry.json');

  // Get connectors
  const connectors = readJson('.agent/aurora/connectors.json');

  // Get AI models
  const aiModels = readJson('.agent/aurora/ai_models.json');

  // Get current focus
  const currentFocus = readText('.agent/workspace/coordination/CURRENT_FOCUS.md');

  // Get decisions
  const decisions = readText('.agent/workspace/coordination/DECISIONS.md');

  // Get release blockers
  const releaseBlockers = readText('.agent/workspace/coordination/RELEASE_BLOCKERS.md');

  // Parse task board for pending tasks
  const board = readText('.agent/workspace/coordination/TASK_BOARD.md');
  const taskLines = board.split('\n').filter(l => l.startsWith('|') && !l.includes('TASK-ID') && !l.includes('---'));
  const allTasks = taskLines.map(l => l.split('|').slice(1, -1).map(c => c.trim())).filter(c => c.length >= 7);
  const pendingTasks = allTasks.filter(t => t[1] !== 'done').slice(0, 20);

  const context = {
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    identity: {
      system: 'Aurora × Agente Integrado',
      agent: 'OpenCode',
      aurora: 'Mente Maestra v2.0',
      coordination: 'shared-context',
    },
    health: {
      ok: health.ok,
      total: health.total,
      ratio: health.ok / health.total,
      checks: health.checks,
    },
    aurora: {
      surfaces: auroraState.surfaces,
      skills: auroraState.skills,
      knowledge: auroraState.knowledge,
      tasks: auroraState.tasks,
      connectors: auroraState.connectors,
      models: auroraState.models,
    },
    notion: {
      connected: notionResult.ok,
      pendingTasks: notionResult.pending?.length || 0,
    },
    knowledge: {
      heuristics: heuristics.map(h => ({ id: h.id, title: h.title, statement: h.statement })),
      patterns: patterns.map(p => ({ id: p.id, title: p.title, statement: p.statement })),
      antiPatterns: antiPatterns.map(a => ({ id: a.id, title: a.title, statement: a.statement })),
      teamwork: teamwork.map(t => ({ id: t.id, title: t.title, statement: t.statement })),
    },
    surfaces: surfaces?.surfaces?.map(s => ({
      id: s.surfaceId,
      goal: s.goal,
      metric: s.primaryMetric,
      coreOrSatellite: s.coreOrSatellite,
    })) || [],
    skills: skills?.skills?.map(s => ({
      id: s.id,
      name: s.name,
      domains: s.domains,
      autoTrigger: s.autoTrigger,
    })) || [],
    connectors: {
      apis: connectors?.apis?.map(a => ({ id: a.id, tipo: a.tipo, estado: a.estado })) || [],
      mcps: connectors?.mcp?.map(m => ({ id: m.id, tipo: m.tipo })) || [],
    },
    aiModels: aiModels?.map(m => ({ name: m.name, provider: m.provider, capabilities: m.capabilities, status: m.status })) || [],
    coordination: {
      currentFocus: currentFocus.split('\n').slice(0, 30).join('\n'),
      decisions: decisions.split('\n').slice(0, 20).join('\n'),
      releaseBlockers: releaseBlockers.split('\n').slice(0, 20).join('\n'),
    },
    pendingTasks: pendingTasks.map(t => ({
      id: t[0],
      status: t[1],
      owner: t[2],
      scope: t[3],
      files: t[4],
      goal: t[5],
    })),
    commands: {
      status: 'npm run aurora:status',
      tasks: 'npm run aurora:tasks',
      shell: 'npm run aurora:shell',
      scorecard: 'npm run aurora:scorecard',
      knowledge: 'npm run aurora:knowledge',
      surfaces: 'npm run aurora:surfaces',
      drift: 'npm run aurora:drift',
      healthSnapshot: 'npm run aurora:health-snapshot',
      sessionBrief: 'npm run aurora:session-brief',
      connectors: 'npm run aurora:conectores',
      speedCheck: 'npm run aurora:speed-check',
      product: 'npm run aurora:product',
      dailyOps: 'npm run aurora:daily-ops',
      doctor: 'npm run aurora:doctor',
      intelligence: 'npm run aurora:intelligence-pipeline',
      tokenOptimizer: 'npm run aurora:token-optimizer',
      memorySync: 'npm run aurora:memory-sync',
      taskRouter: 'npm run aurora:task-router',
      smartRetry: 'npm run aurora:smart-retry',
      notion: 'npm run aurora:notion',
      autoValidate: 'npm run aurora:auto-validate',
      context: 'npm run aurora:context',
      metrics: 'npm run aurora:metrics',
      autoLearnV2: 'npm run aurora:auto-learn-v2',
      workers: 'npm run aurora:workers',
      brainBackup: 'npm run aurora:brain-backup',
      capabilities: 'npm run aurora:capabilities',
      api: 'npm run aurora:api',
      ui: 'npm run aurora:ui',
      desktop: 'npm run aurora:desktop',
      hfAgents: 'npm run hf:agents',
      kimi: 'npm run kimi',
    },
    workflow: {
      start: '@aurora inicio → Este script',
      work: 'Elegir tarea → Implementar → Validar',
      close: 'Actualizar TASK_BOARD → AGENT_LOG → Notion → git push',
      loop: 'Repetir hasta tablero vacío',
    },
  };

  // Write shared context
  const contextPath = path.join(ROOT, '.agent/workspace/coordination/shared-context.json');
  fs.writeFileSync(contextPath, JSON.stringify(context, null, 2), 'utf8');
  console.log(`${GREEN}  ✓ Contexto compartido guardado${RESET}`);

  return context;
}

// ═══════════════════════════════════════════
// MODULE 6: Display Dashboard
// ═══════════════════════════════════════════
function displayDashboard(context) {
  divider('📊 DASHBOARD AURORA × AGENTE');

  // Health
  const healthPct = Math.round(context.health.ratio * 100);
  console.log(`\n${BOLD}Salud del Sistema: ${healthPct}%${RESET} ${context.health.ok}/${context.health.total} checks`);
  context.health.checks.forEach(c => {
    const icon = c.status === 'ok' ? `${GREEN}✓${RESET}` : c.status === 'warning' ? `${YELLOW}⚠${RESET}` : `${RED}✗${RESET}`;
    console.log(`  ${icon} ${c.name}: ${c.detail}`);
  });

  // Aurora Stats
  divider('🧠 Aurora Mente Maestra');
  section('Core', [
    `${BOLD}${context.aurora.surfaces}${RESET} surfaces | ${BOLD}${context.aurora.skills}${RESET} skills | ${BOLD}${context.aurora.knowledge}${RESET} knowledge records`,
    `${BOLD}${context.aurora.connectors.apis}${RESET} APIs | ${BOLD}${context.aurora.connectors.mcps}${RESET} MCPs | ${BOLD}${context.aurora.models}${RESET} AI models`,
  ]);

  // Tasks
  divider('📋 Tareas');
  section('Task Board', [
    `Total: ${BOLD}${context.aurora.tasks.total}${RESET} | Completadas: ${GREEN}${context.aurora.tasks.done}${RESET} | Pendientes: ${YELLOW}${context.aurora.tasks.pending}${RESET}`,
    `Notion: ${context.notion.connected ? `${GREEN}Conectado${RESET}` : `${YELLOW}No configurado${RESET}`} | Pendientes en Notion: ${BOLD}${context.notion.pendingTasks}${RESET}`,
  ]);

  // Pending tasks
  if (context.pendingTasks.length > 0) {
    divider('🎯 Tareas Pendientes (Top 20)');
    context.pendingTasks.forEach((t, i) => {
      console.log(`  ${BOLD}${String(i + 1).padStart(2)}${RESET}. ${t.id} | ${t.status} | ${t.scope} | ${t.goal?.substring(0, 60)}...`);
    });
  }

  // Surfaces
  divider('🌐 Surfaces Activas');
  context.surfaces.forEach(s => {
    const badge = s.coreOrSatellite === 'core' ? `${GREEN}[CORE]${RESET}` : `${DIM}[SUP]${RESET}`;
    console.log(`  ${badge} ${BOLD}${s.id}${RESET}: ${s.goal.substring(0, 70)}...`);
  });

  // Knowledge preview
  divider('📚 Conocimiento Reciente');
  if (context.knowledge.heuristics.length > 0) {
    console.log(`\n${BOLD}${CYAN}Heurísticas:${RESET}`);
    context.knowledge.heuristics.slice(0, 5).forEach(h => {
      console.log(`  • ${h.title || h.id}: ${h.statement?.substring(0, 80)}...`);
    });
  }
  if (context.knowledge.patterns.length > 0) {
    console.log(`\n${BOLD}${CYAN}Patrones:${RESET}`);
    context.knowledge.patterns.slice(0, 5).forEach(p => {
      console.log(`  • ${p.title || p.id}: ${p.statement?.substring(0, 80)}...`);
    });
  }

  // AI Models
  divider('🤖 Modelos AI');
  context.aiModels.forEach(m => {
    const status = m.status === 'active' ? `${GREEN}●${RESET}` : `${YELLOW}○${RESET}`;
    console.log(`  ${status} ${BOLD}${m.name}${RESET} (${m.provider}) - ${m.capabilities?.join(', ') || 'general'}`);
  });

  // Commands
  divider('⚡ Comandos Rápidos');
  console.log(`  ${BOLD}aurora:status${RESET}          → Estado del sistema`);
  console.log(`  ${BOLD}aurora:tasks${RESET}           → Tareas pendientes`);
  console.log(`  ${BOLD}aurora:shell${RESET}           → Shell interactiva`);
  console.log(`  ${BOLD}aurora:scorecard${RESET}       → Scorecard diario`);
  console.log(`  ${BOLD}aurora:knowledge${RESET}       → Base de conocimiento`);
  console.log(`  ${BOLD}aurora:surfaces${RESET}        → Surfaces de Aurora`);
  console.log(`  ${BOLD}aurora:drift${RESET}           → Drift detection`);
  console.log(`  ${BOLD}aurora:health-snapshot${RESET} → Health snapshot`);
  console.log(`  ${BOLD}aurora:session-brief${RESET}   → Brief de sesión`);
  console.log(`  ${BOLD}aurora:conectores${RESET}      → APIs y MCPs`);
  console.log(`  ${BOLD}aurora:product${RESET}         → Product intelligence`);
  console.log(`  ${BOLD}aurora:daily-ops${RESET}       → Operaciones diarias`);
  console.log(`  ${BOLD}aurora:doctor${RESET}          → Diagnóstico`);
  console.log(`  ${BOLD}aurora:intelligence${RESET}    → Intelligence pipeline`);
  console.log(`  ${BOLD}aurora:memory-sync${RESET}     → Sincronizar memoria`);
  console.log(`  ${BOLD}aurora:task-router${RESET}     → Router de tareas`);
  console.log(`  ${BOLD}aurora:notion${RESET}          → Sync con Notion`);
  console.log(`  ${BOLD}aurora:api${RESET}             → Levantar API local`);
  console.log(`  ${BOLD}aurora:desktop${RESET}         → UI de escritorio`);
  console.log(`  ${BOLD}kimi${RESET}                   → Chat con Kimi K2.5`);
  console.log(`  ${BOLD}hf:agents${RESET}              → HF Agents registry`);

  // Workflow
  divider('🔄 Flujo de Trabajo');
  console.log(`  1. ${BOLD}@aurora inicio${RESET} → Sincronizar todo (este script)`);
  console.log(`  2. ${BOLD}Elegir tarea${RESET} → De pendingTasks o Notion`);
  console.log(`  3. ${BOLD}Implementar${RESET} → Con Aurora como copiloto`);
  console.log(`  4. ${BOLD}Validar${RESET} → npm run lint + tests`);
  console.log(`  5. ${BOLD}Cerrar tarea${RESET} → TASK_BOARD + AGENT_LOG + Notion`);
  console.log(`  6. ${BOLD}git push${RESET} → Compartir avances`);
  console.log(`  7. ${BOLD}Repetir${RESET} → Loop infinito hasta tablero vacío`);

  // Final message
  console.log(`\n${BOLD}${GREEN}╔══════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${GREEN}║   🚀 SISTEMA LISTO PARA OPERAR                         ║${RESET}`);
  console.log(`${BOLD}${GREEN}║   Aurora × Agente integrados al 100%                   ║${RESET}`);
  console.log(`${BOLD}${GREEN}║   Contexto compartido: .agent/workspace/coordination/  ║${RESET}`);
  console.log(`${BOLD}${GREEN}║   shared-context.json                                  ║${RESET}`);
  console.log(`${BOLD}${GREEN}╚══════════════════════════════════════════════════════╝${RESET}\n`);
}

// ═══════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════
async function main() {
  banner();

  // Step 1: Git sync
  divider('PASO 1: Git Sync');
  const gitResult = await gitSync();

  // Step 2: Notion sync
  divider('PASO 2: Notion Sync');
  const notionResult = await notionSync();

  // Step 3: Aurora core state
  divider('PASO 3: Aurora Core State');
  const auroraState = auroraCoreState();

  // Step 4: System health
  divider('PASO 4: System Health');
  const health = systemHealth();

  // Step 5: Build shared context
  divider('PASO 5: Contexto Compartido');
  const context = buildSharedContext(auroraState, health, notionResult);

  // Step 6: Display dashboard
  displayDashboard(context);

  // Write session log
  const logEntry = `\n## ${new Date().toISOString()} — Aurora × Agente Inicio Compartido\n\n- Git: ${gitResult.ok ? 'OK' : 'WARN'}\n- Notion: ${notionResult.ok ? 'OK' : 'WARN'}\n- Aurora: ${auroraState.surfaces} surfaces, ${auroraState.skills} skills, ${auroraState.knowledge} knowledge\n- Health: ${health.ok}/${health.total} checks\n- Pending tasks: ${context.pendingTasks.length}\n\n`;
  const logPath = path.join(ROOT, '.agent/workspace/coordination/AGENT_LOG.md');
  try {
    const existing = fs.readFileSync(logPath, 'utf8');
    fs.writeFileSync(logPath, logEntry + existing, 'utf8');
  } catch {
    fs.writeFileSync(logPath, logEntry, 'utf8');
  }
}

main().catch(err => {
  console.error(`${RED}Error: ${err.message}${RESET}`);
  process.exit(1);
});
