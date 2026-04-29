#!/usr/bin/env node
/**
 * aurora-team-coordinator.mjs — Coordinación en Tiempo Real
 *
 * Coordina el trabajo entre Aurora y el agente en tiempo real.
 * Gestiona asignación de tareas, handoffs, y sincronización de estado.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const COORD_DIR = path.join(ROOT, '.agent/workspace/coordination');

function readText(filePath) {
  try { return fs.readFileSync(path.join(ROOT, filePath), 'utf8'); }
  catch { return ''; }
}

function readJson(filePath) {
  try { return JSON.parse(readText(filePath)); }
  catch { return null; }
}

function writeJson(filePath, data) {
  fs.writeFileSync(path.join(ROOT, filePath), JSON.stringify(data, null, 2), 'utf8');
}

function writeText(filePath, content) {
  fs.writeFileSync(path.join(ROOT, filePath), content, 'utf8');
}

/**
 * Registra que el agente está tomando una tarea
 */
export function claimTask(taskId, agentName = 'OpenCode') {
  const boardPath = path.join(COORD_DIR, '..', '..', 'TASK_BOARD.md');
  const board = readText('.agent/workspace/coordination/TASK_BOARD.md');

  // Update task status in board
  const updated = board.replace(
    new RegExp(`(\\|\\s*${taskId}\\s*\\|\\s*)(\\w+)(\\s*\\|\\s*)(\\w+)`, 'i'),
    `$1in_progress$3${agentName}`
  );

  writeText('.agent/workspace/coordination/TASK_BOARD.md', updated);

  // Update current focus
  const focusEntry = `\n## ${new Date().toISOString()} — ${taskId}\n\n- **Tarea:** ${taskId}\n- **Agente:** ${agentName}\n- **Estado:** En progreso\n- **Inicio:** ${new Date().toLocaleString('es-AR')}\n`;

  const focusPath = path.join(COORD_DIR, 'CURRENT_FOCUS.md');
  try {
    const existing = readText('.agent/workspace/coordination/CURRENT_FOCUS.md');
    writeText('.agent/workspace/coordination/CURRENT_FOCUS.md', focusEntry + '\n' + existing);
  } catch {
    writeText('.agent/workspace/coordination/CURRENT_FOCUS.md', focusEntry);
  }

  // Log action
  logAgentAction('claim', taskId, agentName);

  return { ok: true, taskId, agent: agentName, status: 'in_progress' };
}

/**
 * Marca una tarea como completada
 */
export function completeTask(taskId, agentName = 'OpenCode', notes = '') {
  const board = readText('.agent/workspace/coordination/TASK_BOARD.md');

  // Update task status in board
  const updated = board.replace(
    new RegExp(`(\\|\\s*${taskId}\\s*\\|\\s*)(\\w+)(\\s*\\|\\s*)(\\w+)`, 'i'),
    `$1done$3${agentName}`
  );

  writeText('.agent/workspace/coordination/TASK_BOARD.md', updated);

  // Update agent log
  const logEntry = `\n## ${new Date().toISOString()} — ${taskId} COMPLETADA\n\n- **Tarea:** ${taskId}\n- **Agente:** ${agentName}\n- **Estado:** Done\n- **Notas:** ${notes}\n`;

  const logPath = path.join(COORD_DIR, 'AGENT_LOG.md');
  try {
    const existing = readText('.agent/workspace/coordination/AGENT_LOG.md');
    writeText('.agent/workspace/coordination/AGENT_LOG.md', logEntry + existing);
  } catch {
    writeText('.agent/workspace/coordination/AGENT_LOG.md', logEntry);
  }

  // Log action
  logAgentAction('complete', taskId, agentName, notes);

  return { ok: true, taskId, agent: agentName, status: 'done' };
}

/**
 * Crea un handoff entre agentes
 */
export function createHandoff(fromAgent, toAgent, taskId, context = '') {
  const handoff = {
    id: `handoff_${Date.now()}`,
    from: fromAgent,
    to: toAgent,
    taskId,
    context,
    timestamp: new Date().toISOString(),
    status: 'pending',
  };

  const handoffsPath = path.join(COORD_DIR, 'HANDOFFS.md');
  const entry = `\n## ${handoff.id}\n\n- **De:** ${fromAgent}\n- **Para:** ${toAgent}\n- **Tarea:** ${taskId}\n- **Contexto:** ${context}\n- **Hora:** ${handoff.timestamp}\n- **Estado:** Pendiente\n`;

  try {
    const existing = readText('.agent/workspace/coordination/HANDOFFS.md');
    writeText('.agent/workspace/coordination/HANDOFFS.md', entry + existing);
  } catch {
    writeText('.agent/workspace/coordination/HANDOFFS.md', entry);
  }

  logAgentAction('handoff', taskId, fromAgent, `→ ${toAgent}: ${context}`);

  return handoff;
}

/**
 * Obtiene las tareas disponibles para trabajar
 */
export function getAvailableTasks(limit = 10) {
  const board = readText('.agent/workspace/coordination/TASK_BOARD.md');
  const taskLines = board.split('\n').filter(l => l.startsWith('|') && !l.includes('TASK-ID') && !l.includes('---'));
  const allTasks = taskLines.map(l => l.split('|').slice(1, -1).map(c => c.trim())).filter(c => c.length >= 7);

  return allTasks
    .filter(t => t[1] !== 'done')
    .slice(0, limit)
    .map(t => ({
      id: t[0],
      status: t[1],
      owner: t[2],
      scope: t[3],
      files: t[4],
      goal: t[5],
    }));
}

/**
 * Obtiene el estado actual del equipo
 */
export function getTeamStatus() {
  const board = readText('.agent/workspace/coordination/TASK_BOARD.md');
  const taskLines = board.split('\n').filter(l => l.startsWith('|') && !l.includes('TASK-ID') && !l.includes('---'));
  const allTasks = taskLines.map(l => l.split('|').slice(1, -1).map(c => c.trim())).filter(c => c.length >= 7);

  const status = {
    total: allTasks.length,
    done: allTasks.filter(t => t[1] === 'done').length,
    inProgress: allTasks.filter(t => t[1] === 'in_progress').length,
    claimed: allTasks.filter(t => t[1] === 'claimed').length,
    pending: allTasks.filter(t => !['done', 'in_progress', 'claimed'].includes(t[1])).length,
    agents: [...new Set(allTasks.filter(t => t[2] && t[2] !== '-').map(t => t[2]))],
    timestamp: new Date().toISOString(),
  };

  return status;
}

/**
 * Registra una acción del agente
 */
function logAgentAction(type, taskId, agent, details = '') {
  const actionsPath = path.join(COORD_DIR, 'agent-actions.jsonl');
  const entry = {
    type,
    taskId,
    agent,
    details,
    timestamp: new Date().toISOString(),
  };

  try {
    const existing = fs.readFileSync(actionsPath, 'utf8').trim();
    fs.writeFileSync(actionsPath, existing + '\n' + JSON.stringify(entry), 'utf8');
  } catch {
    fs.writeFileSync(actionsPath, JSON.stringify(entry), 'utf8');
  }
}

/**
 * Obtiene el historial de acciones recientes
 */
export function getRecentActions(limit = 20) {
  const actionsPath = path.join(COORD_DIR, 'agent-actions.jsonl');
  try {
    const text = fs.readFileSync(actionsPath, 'utf8').trim();
    if (!text) return [];
    return text.split('\n').map(l => JSON.parse(l)).slice(-limit);
  } catch {
    return [];
  }
}

/**
 * Genera un reporte de productividad
 */
export function generateProductivityReport() {
  const status = getTeamStatus();
  const actions = getRecentActions();

  const completedToday = actions.filter(a => {
    const date = new Date(a.timestamp);
    const now = new Date();
    return a.type === 'complete' &&
      date.toDateString() === now.toDateString();
  });

  const completionRate = status.total > 0
    ? Math.round((status.done / status.total) * 100)
    : 0;

  return {
    summary: {
      totalTasks: status.total,
      completed: status.done,
      inProgress: status.inProgress,
      pending: status.pending,
      completionRate: `${completionRate}%`,
      completedToday: completedToday.length,
    },
    agents: status.agents,
    recentActions: actions.slice(-10),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Sincroniza con Notion (si está configurado)
 */
export async function syncWithNotion() {
  const NOTION_API_KEY = process.env.NOTION_API_KEY;
  const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

  if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
    return { ok: false, msg: 'Notion not configured' };
  }

  try {
    // Get tasks from Notion
    const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page_size: 100 }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const tasks = data.results.map(page => ({
      id: page.id,
      name: page.properties?.Name?.title?.[0]?.plain_text || 'Untitled',
      status: page.properties?.Status?.select?.name || 'Backlog',
      url: page.url || '',
    }));

    return { ok: true, tasks, count: tasks.length };
  } catch (err) {
    return { ok: false, msg: err.message };
  }
}

/**
 * Actualiza el estado de una tarea en Notion
 */
export async function updateNotionTask(taskId, newStatus) {
  const NOTION_API_KEY = process.env.NOTION_API_KEY;

  if (!NOTION_API_KEY) {
    return { ok: false, msg: 'Notion not configured' };
  }

  try {
    const res = await fetch(`https://api.notion.com/v1/pages/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          Status: {
            select: { name: newStatus },
          },
        },
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { ok: true, taskId, status: newStatus };
  } catch (err) {
    return { ok: false, msg: err.message };
  }
}
