#!/usr/bin/env node
/**
 * notion-task-action.mjs — Marcar tareas en Notion desde terminal
 *
 * Uso:
 *   node scripts/notion-task-action.mjs list                    - Listar todas las tareas
 *   node scripts/notion-task-action.mjs progress <taskName>     - Marcar "En progreso"
 *   node scripts/notion-task-action.mjs done <taskName>         - Marcar "Listo"
 *   node scripts/notion-task-action.mjs ready <taskName>        - Marcar "Ready"
 *   node scripts/notion-task-action.mjs backlog <taskName>      - Marcar "Backlog"
 *
 * Ejemplos:
 *   node scripts/notion-task-action.mjs progress "Implementar login JWT"
 *   node scripts/notion-task-action.mjs done "Crear tabla users"
 *   node scripts/notion-task-action.mjs list
 */

import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

const headers = {
  'Authorization': `Bearer ${NOTION_API_KEY}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
};

const STATUS_MAP = {
  'progress': 'En progreso',
  'done': 'Listo',
  'ready': 'Ready',
  'backlog': 'Backlog',
};

const COLORS = {
  'En progreso': '\x1b[36m',
  'Listo': '\x1b[32m',
  'Ready': '\x1b[33m',
  'Backlog': '\x1b[2m',
};

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

async function fetchAllTasks() {
  let allTasks = [];
  let hasMore = true;
  let cursor = undefined;

  while (hasMore) {
    const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers,
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
    url: page.url || '',
  }));
}

function findTask(tasks, query) {
  const q = query.toLowerCase();
  return tasks.find(t => t.name.toLowerCase().includes(q));
}

async function updateTaskStatus(taskId, status) {
  const res = await fetch(`https://api.notion.com/v1/pages/${taskId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      properties: {
        Status: { select: { name: status } },
      },
    }),
  });

  if (!res.ok) throw new Error(`Failed to update: ${await res.text()}`);
  return await res.json();
}

async function listTasks() {
  const tasks = await fetchAllTasks();
  
  console.log(`\n${BOLD}Tareas en Notion:${RESET}\n`);
  
  const groups = {
    'En progreso': tasks.filter(t => t.status === 'En progreso'),
    'Ready': tasks.filter(t => t.status === 'Ready'),
    'Backlog': tasks.filter(t => t.status === 'Backlog'),
    'Listo': tasks.filter(t => t.status === 'Listo'),
  };

  for (const [status, statusTasks] of Object.entries(groups)) {
    if (statusTasks.length === 0) continue;
    const color = COLORS[status] || RESET;
    console.log(`${color}${BOLD}${status} (${statusTasks.length}):${RESET}`);
    statusTasks.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.name}`);
    });
    console.log('');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const action = args[0]?.toLowerCase();
  const taskName = args.slice(1).join(' ');

  if (!action) {
    console.log('Uso: node scripts/notion-task-action.mjs <action> [taskName]');
    console.log('Actions: list, progress, done, ready, backlog');
    console.log('\nEjemplos:');
    console.log('  node scripts/notion-task-action.mjs list');
    console.log('  node scripts/notion-task-action.mjs progress "Implementar login JWT"');
    console.log('  node scripts/notion-task-action.mjs done "Crear tabla users"');
    process.exit(0);
  }

  if (action === 'list') {
    await listTasks();
    return;
  }

  const targetStatus = STATUS_MAP[action];
  if (!targetStatus) {
    console.log(`Acción no válida: ${action}`);
    console.log('Acciones válidas: list, progress, done, ready, backlog');
    process.exit(1);
  }

  if (!taskName) {
    console.log(`Falta el nombre de la tarea.`);
    console.log(`Uso: node scripts/notion-task-action.mjs ${action} "<nombre de tarea>"`);
    process.exit(1);
  }

  console.log(`\nBuscando tarea: "${taskName}"...`);
  const tasks = await fetchAllTasks();
  const task = findTask(tasks, taskName);

  if (!task) {
    console.log(`❌ Tarea no encontrada: "${taskName}"`);
    console.log('\nTareas disponibles:');
    tasks.forEach(t => console.log(`  - ${t.name} [${t.status}]`));
    process.exit(1);
  }

  console.log(`✓ Encontrada: "${task.name}" [${task.status}]`);
  console.log(`→ Cambiando a: ${targetStatus}...`);

  await updateTaskStatus(task.id, targetStatus);

  const color = COLORS[targetStatus] || RESET;
  console.log(`\n${color}${BOLD}✓ Tarea "${task.name}" marcada como "${targetStatus}"${RESET}`);
  console.log(`  URL: ${task.url}\n`);
}

main().catch(err => {
  console.error(`❌ Error: ${err.message}`);
  process.exit(1);
});
