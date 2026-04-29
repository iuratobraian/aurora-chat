#!/usr/bin/env node
/**
 * aurora-api-server.mjs
 * Servidor Aurora API autónomo — Puerto 4310
 * 
 * Provee:
 * - GET /health        → Health check del daemon
 * - GET /api/status    → Estado del enjambre
 * - GET /api/tasks     → Tareas pendientes desde TASK_BOARD.md
 * - GET /app           → Redirige al dashboard en la app
 * - WebSocket :4310    → Transmisiones en tiempo real
 * 
 * Reemplaza la dependencia rota de ../../aurora/api/aurora-api.mjs
 */

import { createServer } from 'http';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PORT = parseInt(process.env.AURORA_PORT || '4310', 10);
const START_TIME = Date.now();
const AGENT_ID = `aurora-api-${process.pid}`;
const RUNTIME_STATUS_PATH = join(ROOT, '.agent', 'aurora', 'aurora-api-runtime.json');

// ── Helpers ──────────────────────────────────────────────────
function safeReadJson(filePath) {
  try {
    if (!existsSync(filePath)) return null;
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function writeRuntimeStatus(healthy) {
  try {
    const dir = join(ROOT, '.agent', 'aurora');
    if (!existsSync(dir)) {
      import('fs').then(fs => fs.mkdirSync(dir, { recursive: true }));
    }
    writeFileSync(RUNTIME_STATUS_PATH, JSON.stringify({
      pid: process.pid,
      port: PORT,
      startedAt: new Date(START_TIME).toISOString(),
      healthy,
      agentId: AGENT_ID,
      uptime: Math.round((Date.now() - START_TIME) / 1000),
    }, null, 2));
  } catch { /* no-op */ }
}

function getHiveStatus() {
  const taskBoard = safeReadJson(join(ROOT, '.agent', 'workspace', 'coordination', 'TASK_BOARD.json'));
  const hiveBrain = safeReadJson(join(ROOT, '.agent', 'aurora', 'ruflo-bootstrap.json'));
  const activityLog = (() => {
    try {
      const raw = readFileSync(join(ROOT, '.agent', 'brain', 'db', 'activity_log.jsonl'), 'utf8');
      return raw.trim().split('\n').slice(-20).map(l => {
        try { return JSON.parse(l); } catch { return null; }
      }).filter(Boolean).reverse();
    } catch { return []; }
  })();

  return {
    daemon: {
      status: 'running',
      pid: process.pid,
      port: PORT,
      uptime: Math.round((Date.now() - START_TIME) / 1000),
      startedAt: new Date(START_TIME).toISOString(),
    },
    swarm: hiveBrain || { available: false, note: 'No swarm bootstrap found' },
    activity: activityLog,
    taskBoard: taskBoard || {},
  };
}

// ── HTTP Server ──────────────────────────────────────────────
const clients = new Set();

const server = createServer((req, res) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  const path = url.pathname;

  // Health check
  if (path === '/health') {
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({
      status: 'ok',
      daemon: 'aurora-api',
      pid: process.pid,
      port: PORT,
      uptime: Math.round((Date.now() - START_TIME) / 1000),
      timestamp: new Date().toISOString(),
    }));
    return;
  }

  // Estado completo del hive
  if (path === '/api/status') {
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify(getHiveStatus(), null, 2));
    return;
  }

  // Transmisión a todos los clientes WS conectados
  if (path === '/api/broadcast' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const msg = JSON.parse(body);
        const payload = JSON.stringify({ ...msg, timestamp: new Date().toISOString() });
        clients.forEach(client => {
          if (client.readyState === 1) client.send(payload);
        });
        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({ ok: true, sent: clients.size }));
      } catch {
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // Redirect al dashboard visual en la app
  if (path === '/app' || path === '/') {
    res.writeHead(302, { Location: 'http://localhost:4177/admin/aurora-hive' });
    res.end();
    return;
  }

  // 404
  res.writeHead(404, corsHeaders);
  res.end(JSON.stringify({ error: 'Not found', path }));
});

// ── WebSocket Server ─────────────────────────────────────────
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify({
    type: 'connected',
    agentId: AGENT_ID,
    message: '✨ Conectado al Aurora Hive Neural Bus',
    timestamp: new Date().toISOString(),
  }));

  // Heartbeat cada 30s
  const heartbeat = setInterval(() => {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({
        type: 'heartbeat',
        uptime: Math.round((Date.now() - START_TIME) / 1000),
        clients: clients.size,
        timestamp: new Date().toISOString(),
      }));
    }
  }, 30000);

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      // Rebroadcast a todos los demás clientes
      clients.forEach(client => {
        if (client !== ws && client.readyState === 1) {
          client.send(JSON.stringify({ ...msg, relayed: true }));
        }
      });
    } catch { /* no-op */ }
  });

  ws.on('close', () => {
    clearInterval(heartbeat);
    clients.delete(ws);
  });
});

// ── Start ────────────────────────────────────────────────────
server.listen(PORT, '127.0.0.1', () => {
  writeRuntimeStatus(true);
  console.log(`\n✨ Aurora API Server activo`);
  console.log(`   → http://127.0.0.1:${PORT}/health`);
  console.log(`   → http://127.0.0.1:${PORT}/api/status`);
  console.log(`   → WebSocket ws://127.0.0.1:${PORT}`);
  console.log(`   → PID: ${process.pid}\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Puerto ${PORT} ya en uso. Aurora API ya puede estar corriendo.\n`);
    process.exit(0);
  }
  throw err;
});

// Graceful shutdown
process.on('SIGTERM', () => { writeRuntimeStatus(false); server.close(); });
process.on('SIGINT', () => { writeRuntimeStatus(false); server.close(); process.exit(0); });
