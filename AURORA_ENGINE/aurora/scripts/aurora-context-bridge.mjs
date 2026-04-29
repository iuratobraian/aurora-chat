#!/usr/bin/env node
/**
 * aurora-context-bridge.mjs — Puente de Contexto Compartido
 *
 * Este módulo actúa como puente entre Aurora y el agente de trabajo.
 * Proporciona funciones para inyectar, extraer y sincronizar contexto.
 *
 * Uso: import { getContext, injectContext, syncContext } from './aurora-context-bridge.mjs';
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CONTEXT_PATH = path.join(ROOT, '.agent/workspace/coordination/shared-context.json');

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

function writeJson(filePath, data) {
  fs.writeFileSync(path.join(ROOT, filePath), JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Obtiene el contexto compartido actual
 */
export function getContext() {
  try {
    return JSON.parse(fs.readFileSync(CONTEXT_PATH, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Obtiene el contexto mínimo para una tarea específica
 */
export function getTaskContext(taskId) {
  const context = getContext();
  if (!context) return { error: 'No shared context available' };

  const task = context.pendingTasks?.find(t => t.id === taskId);
  if (!task) return { error: `Task ${taskId} not found` };

  // Get relevant knowledge for this task
  const scope = task.scope?.toLowerCase() || '';
  const goal = task.goal?.toLowerCase() || '';
  const query = `${scope} ${goal}`;

  const heuristics = readJsonl('.agent/brain/db/heuristics.jsonl')
    .filter(h => JSON.stringify(h).toLowerCase().includes(query))
    .slice(0, 5);

  const patterns = readJsonl('.agent/brain/db/patterns.jsonl')
    .filter(p => JSON.stringify(p).toLowerCase().includes(query))
    .slice(0, 5);

  const antiPatterns = readJsonl('.agent/brain/db/anti_patterns.jsonl')
    .filter(a => JSON.stringify(a).toLowerCase().includes(query))
    .slice(0, 5);

  const teamwork = readJsonl('.agent/brain/db/teamwork_knowledge.jsonl')
    .filter(t => JSON.stringify(t).toLowerCase().includes(query))
    .slice(0, 5);

  // Get relevant surface
  const surfaceMap = {
    'feed': 'community_feed',
    'community': 'community_feed',
    'post': 'community_feed',
    'auth': 'auth_and_onboarding',
    'login': 'auth_and_onboarding',
    'onboarding': 'auth_and_onboarding',
    'payment': 'pricing_and_conversion',
    'pricing': 'pricing_and_conversion',
    'subscription': 'pricing_and_conversion',
    'admin': 'admin_panel',
    'creator': 'creator_dashboard',
    'signal': 'signals_surface',
    'news': 'news_surface',
    'marketplace': 'marketplace_surface',
  };

  let relevantSurface = null;
  for (const [keyword, surfaceId] of Object.entries(surfaceMap)) {
    if (query.includes(keyword)) {
      relevantSurface = context.surfaces?.find(s => s.id === surfaceId);
      break;
    }
  }

  return {
    task,
    surface: relevantSurface,
    knowledge: {
      heuristics,
      patterns,
      antiPatterns,
      teamwork,
    },
    files: task.files?.split(',').map(f => f.trim()).filter(Boolean) || [],
    skills: context.skills?.filter(s =>
      s.domains?.some(d => scope.includes(d)) ||
      s.autoTrigger?.some(t => query.includes(t))
    ) || [],
    timestamp: new Date().toISOString(),
  };
}

/**
 * Inyecta nuevo conocimiento en la base de Aurora
 */
export function injectKnowledge(type, entry) {
  const validTypes = ['heuristics', 'patterns', 'anti_patterns', 'error_catalog', 'teamwork_knowledge', 'ideas', 'references'];
  if (!validTypes.includes(type)) {
    return { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` };
  }

  const filePath = `.agent/brain/db/${type}.jsonl`;
  const enrichedEntry = {
    ...entry,
    id: entry.id || `${type}_${Date.now()}`,
    timestamp: entry.timestamp || new Date().toISOString(),
    source: entry.source || 'aurora-agent-bridge',
    validated: entry.validated || false,
    reuseScore: entry.reuseScore || 0,
  };

  try {
    const existing = readJsonl(filePath);
    existing.push(enrichedEntry);
    writeJson(filePath, existing.map(e => JSON.stringify(e)).join('\n'));
    return { ok: true, entry: enrichedEntry };
  } catch (err) {
    return { error: err.message };
  }
}

/**
 * Sincroniza el contexto con el estado actual del sistema
 */
export function syncContext() {
  const context = getContext();
  if (!context) return { error: 'No shared context to sync' };

  // Update task board
  const board = readText('.agent/workspace/coordination/TASK_BOARD.md');
  const taskLines = board.split('\n').filter(l => l.startsWith('|') && !l.includes('TASK-ID') && !l.includes('---'));
  const allTasks = taskLines.map(l => l.split('|').slice(1, -1).map(c => c.trim())).filter(c => c.length >= 7);
  const pendingTasks = allTasks.filter(t => t[1] !== 'done').slice(0, 20);

  context.pendingTasks = pendingTasks.map(t => ({
    id: t[0],
    status: t[1],
    owner: t[2],
    scope: t[3],
    files: t[4],
    goal: t[5],
  }));

  context.timestamp = new Date().toISOString();
  context.aurora.tasks = {
    total: allTasks.length,
    done: allTasks.length - pendingTasks.length,
    pending: pendingTasks.length,
  };

  writeJson('.agent/workspace/coordination/shared-context.json', context);
  return { ok: true, tasks: pendingTasks.length, timestamp: context.timestamp };
}

/**
 * Obtiene el estado de salud actualizado
 */
export function getHealthStatus() {
  const context = getContext();
  if (!context) return { error: 'No context available' };

  return {
    health: context.health,
    aurora: context.aurora,
    timestamp: context.timestamp,
  };
}

/**
 * Busca conocimiento por query
 */
export function searchKnowledge(query, limit = 10) {
  const lower = query.toLowerCase();
  const files = [
    { path: '.agent/brain/db/heuristics.jsonl', type: 'heuristic' },
    { path: '.agent/brain/db/patterns.jsonl', type: 'pattern' },
    { path: '.agent/brain/db/anti_patterns.jsonl', type: 'anti_pattern' },
    { path: '.agent/brain/db/error_catalog.jsonl', type: 'error' },
    { path: '.agent/brain/db/teamwork_knowledge.jsonl', type: 'teamwork' },
    { path: '.agent/brain/db/ideas.jsonl', type: 'idea' },
    { path: '.agent/brain/db/references.jsonl', type: 'reference' },
  ];

  const results = [];
  for (const { path: filePath, type } of files) {
    const entries = readJsonl(filePath);
    for (const entry of entries) {
      if (JSON.stringify(entry).toLowerCase().includes(lower)) {
        results.push({ ...entry, type });
        if (results.length >= limit) break;
      }
    }
    if (results.length >= limit) break;
  }

  return results;
}

/**
 * Obtiene las surfaces relevantes para un dominio
 */
export function getRelevantSurfaces(domain) {
  const context = getContext();
  if (!context) return [];

  const lower = domain.toLowerCase();
  return context.surfaces?.filter(s =>
    s.id.toLowerCase().includes(lower) ||
    s.goal.toLowerCase().includes(lower)
  ) || [];
}

/**
 * Obtiene los skills aplicables a un tipo de tarea
 */
export function getApplicableSkills(taskType) {
  const context = getContext();
  if (!context) return [];

  const lower = taskType.toLowerCase();
  return context.skills?.filter(s =>
    s.domains?.some(d => lower.includes(d)) ||
    s.autoTrigger?.some(t => lower.includes(t))
  ) || [];
}

/**
 * Registra una acción en el contexto compartido
 */
export function logAction(action) {
  const context = getContext();
  if (!context) return { error: 'No context available' };

  if (!context.actions) context.actions = [];
  context.actions.push({
    ...action,
    timestamp: new Date().toISOString(),
  });

  writeJson('.agent/workspace/coordination/shared-context.json', context);
  return { ok: true };
}

/**
 * Obtiene el historial de acciones recientes
 */
export function getRecentActions(limit = 20) {
  const context = getContext();
  if (!context) return [];

  return (context.actions || []).slice(-limit);
}

/**
 * Obtiene los modelos AI disponibles
 */
export function getAvailableModels() {
  const context = getContext();
  if (!context) return [];

  return context.aiModels?.filter(m => m.status === 'active') || [];
}

/**
 * Obtiene los conectores activos
 */
export function getActiveConnectors() {
  const context = getContext();
  if (!context) return { apis: [], mcps: [] };

  return context.connectors || { apis: [], mcps: [] };
}

/**
 * Genera un resumen ejecutivo del estado actual
 */
export function getExecutiveSummary() {
  const context = getContext();
  if (!context) return { error: 'No context available' };

  return {
    identity: context.identity,
    health: context.health,
    tasks: context.aurora.tasks,
    pendingTasks: context.pendingTasks?.slice(0, 5) || [],
    surfaces: context.surfaces?.length || 0,
    skills: context.skills?.length || 0,
    knowledge: context.aurora.knowledge,
    connectors: context.aurora.connectors,
    models: context.aiModels?.length || 0,
    timestamp: context.timestamp,
  };
}
