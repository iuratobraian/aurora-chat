// Aurora Nexus Server - Central Agent Orchestration API
import express, { Request, Response } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import cors from 'cors';
import { spawn, ChildProcess, execSync } from 'child_process';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

interface AgentConnection {
  id: string;
  name: string;
  type: 'opencode' | 'minimax' | 'aurora' | 'gemini' | 'custom';
  ws: WebSocket | null;
  process?: ChildProcess;
  status: 'online' | 'offline' | 'busy' | 'starting' | 'error';
  startedAt?: number;
  lastHeartbeat?: number;
  capabilities: string[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  assignedAgent?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  createdAt: number;
  updatedAt: number;
  result?: string;
  logs: string[];
}

interface SharedMemory {
  key: string;
  value: any;
  updatedAt: number;
  updatedBy?: string;
}

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ port: 3000 });

const agents: Map<string, AgentConnection> = new Map();
const tasks: Map<string, Task> = new Map();
const sharedMemory: Map<string, SharedMemory> = new Map();
const taskQueue: string[] = [];

const PROJECT_PATH = process.env.PROJECT_PATH || 'C:\\Users\\iurato\\Downloads\\tradeportal-2025-platinum';

app.use(cors());
app.use(express.json());

// WebSocket handling
wss.on('connection', (ws: WebSocket, req) => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const agentId = url.searchParams.get('agentId');
  const token = url.searchParams.get('token');
  
  if (!agentId) {
    ws.close(4001, 'Missing agentId');
    return;
  }
  
  console.log(`[Nexus] Agent connected: ${agentId}`);
  
  agents.set(agentId, {
    id: agentId,
    name: agentId,
    type: getAgentType(agentId),
    ws,
    status: 'online',
    startedAt: Date.now(),
    lastHeartbeat: Date.now(),
    capabilities: getAgentCapabilities(agentId)
  });
  
  broadcastAgentStatus();
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleAgentMessage(agentId, message);
    } catch (e) {
      console.error(`[Nexus] Invalid message from ${agentId}:`, e);
    }
  });
  
  ws.on('close', () => {
    const agent = agents.get(agentId);
    if (agent) {
      agent.status = 'offline';
      agent.ws = null;
      broadcastAgentStatus();
    }
  });
  
  ws.on('error', (err) => {
    console.error(`[Nexus] WebSocket error for ${agentId}:`, err);
  });
});

function getAgentType(id: string): AgentConnection['type'] {
  const lower = id.toLowerCase();
  if (lower.includes('opencode') || lower.includes('bigpickle')) return 'opencode';
  if (lower.includes('minimax')) return 'minimax';
  if (lower.includes('aurora')) return 'aurora';
  if (lower.includes('gemini')) return 'gemini';
  return 'custom';
}

function getAgentCapabilities(id: string): string[] {
  const lower = id.toLowerCase();
  if (lower.includes('opencode')) return ['coding', 'debugging', 'refactoring', 'testing'];
  if (lower.includes('minimax')) return ['analysis', 'code_review', 'strategy'];
  if (lower.includes('aurora')) return ['orchestration', 'learning', 'memory', 'reasoning'];
  if (lower.includes('gemini')) return ['design', 'creativity', 'images', 'ui'];
  return ['general'];
}

function handleAgentMessage(agentId: string, message: any) {
  const agent = agents.get(agentId);
  if (!agent) return;
  
  agent.lastHeartbeat = Date.now();
  
  switch (message.type) {
    case 'heartbeat':
      agent.ws?.send(JSON.stringify({ type: 'heartbeat_ack', timestamp: Date.now() }));
      break;
      
    case 'status_update':
      agent.status = message.status || 'online';
      broadcastAgentStatus();
      break;
      
    case 'task_update':
      updateTaskStatus(message.taskId, message.status, message.result);
      break;
      
    case 'task_log':
      addTaskLog(message.taskId, message.log);
      break;
      
    case 'memory_update':
      updateSharedMemory(message.key, message.value, agentId);
      break;
      
    case 'memory_request':
      const mem = sharedMemory.get(message.key);
      agent.ws?.send(JSON.stringify({
        type: 'memory_response',
        key: message.key,
        value: mem?.value
      }));
      break;
  }
}

function broadcastAgentStatus() {
  const statuses = Array.from(agents.values()).map(a => ({
    id: a.id,
    name: a.name,
    type: a.type,
    status: a.status,
    startedAt: a.startedAt,
    capabilities: a.capabilities
  }));
  
  const payload = JSON.stringify({ type: 'agentStatus', agents: statuses, timestamp: Date.now() });
  
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// ============ AGENT ENDPOINTS ============

app.get('/api/agents/list', (req: Request, res: Response) => {
  const statuses = Array.from(agents.values()).map(a => ({
    id: a.id,
    name: a.name,
    type: a.type,
    status: a.status,
    startedAt: a.startedAt,
    lastHeartbeat: a.lastHeartbeat,
    capabilities: a.capabilities
  }));
  res.json({ agents: statuses, total: statuses.length });
});

app.post('/api/agents/spawn', async (req: Request, res: Response) => {
  const { agentId, agentType = 'custom', command } = req.body;
  
  if (!agentId) {
    return res.status(400).json({ error: 'agentId required' });
  }
  
  const existing = agents.get(agentId);
  if (existing?.status === 'online') {
    return res.status(409).json({ error: 'Agent already running', agentId });
  }
  
  const agent: AgentConnection = {
    id: agentId,
    name: agentId,
    type: agentType as AgentConnection['type'],
    ws: null,
    status: 'starting',
    startedAt: Date.now(),
    capabilities: getAgentCapabilities(agentId)
  };
  
  agents.set(agentId, agent);
  
  try {
    if (command) {
      const childProcess = spawn(command, [], {
        shell: true,
        cwd: PROJECT_PATH,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      agent.process = childProcess;
      
      childProcess.stdout?.on('data', (data) => {
        broadcastToAgent(agentId, { type: 'output', data: data.toString() });
      });
      
      childProcess.stderr?.on('data', (data) => {
        broadcastToAgent(agentId, { type: 'error', data: data.toString() });
      });
      
      childProcess.on('exit', (code) => {
        const ag = agents.get(agentId);
        if (ag) {
          ag.status = code === 0 ? 'offline' : 'error';
          broadcastAgentStatus();
        }
      });
    }
    
    agent.status = 'online';
    broadcastAgentStatus();
    
    res.json({ success: true, agentId, status: agent.status });
  } catch (error) {
    agent.status = 'error';
    broadcastAgentStatus();
    res.status(500).json({ error: 'Failed to spawn agent', details: String(error) });
  }
});

app.post('/api/agents/kill', (req: Request, res: Response) => {
  const { agentId } = req.body;
  
  if (!agentId) {
    return res.status(400).json({ error: 'agentId required' });
  }
  
  const agent = agents.get(agentId);
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  if (agent.process) {
    agent.process.kill();
  }
  
  if (agent.ws) {
    agent.ws.close();
  }
  
  agents.delete(agentId);
  broadcastAgentStatus();
  
  res.json({ success: true, agentId });
});

app.get('/api/agents/:id', (req: Request, res: Response) => {
  const agent = agents.get(req.params.id);
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  res.json({
    id: agent.id,
    name: agent.name,
    type: agent.type,
    status: agent.status,
    startedAt: agent.startedAt,
    lastHeartbeat: agent.lastHeartbeat,
    capabilities: agent.capabilities
  });
});

app.post('/api/agents/:id/command', (req: Request, res: Response) => {
  const { id } = req.params;
  const { command } = req.body;
  
  const agent = agents.get(id);
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  broadcastToAgent(id, { type: 'command', command, timestamp: Date.now() });
  
  res.json({ success: true, agentId: id });
});

function broadcastToAgent(agentId: string, message: any) {
  const agent = agents.get(agentId);
  if (agent?.ws?.readyState === WebSocket.OPEN) {
    agent.ws.send(JSON.stringify(message));
  }
}

// ============ TASK ENDPOINTS ============

app.post('/api/tasks/submit', (req: Request, res: Response) => {
  const { title, description, priority = 'medium', assignedAgent } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'title required' });
  }
  
  const taskId = randomUUID();
  const task: Task = {
    id: taskId,
    title,
    description: description || '',
    priority,
    assignedAgent,
    status: assignedAgent ? 'pending' : 'pending',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    logs: []
  };
  
  tasks.set(taskId, task);
  taskQueue.push(taskId);
  
  if (assignedAgent) {
    assignTaskToAgent(taskId, assignedAgent);
  }
  
  broadcastTaskUpdate();
  
  res.json({ success: true, task });
});

app.get('/api/tasks/list', (req: Request, res: Response) => {
  const { status, assignedAgent, priority } = req.query;
  
  let taskList = Array.from(tasks.values());
  
  if (status) {
    taskList = taskList.filter(t => t.status === status);
  }
  if (assignedAgent) {
    taskList = taskList.filter(t => t.assignedAgent === assignedAgent);
  }
  if (priority) {
    taskList = taskList.filter(t => t.priority === priority);
  }
  
  taskList.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  res.json({ tasks: taskList, total: taskList.length, queue: taskQueue });
});

app.get('/api/tasks/status/:id', (req: Request, res: Response) => {
  const task = tasks.get(req.params.id);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  res.json(task);
});

app.put('/api/tasks/:id/status', (req: Request, res: Response) => {
  const { status, result } = req.body;
  
  const task = tasks.get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  if (status) {
    task.status = status as Task['status'];
  }
  if (result !== undefined) {
    task.result = result;
  }
  task.updatedAt = Date.now();
  
  broadcastTaskUpdate();
  
  res.json({ success: true, task });
});

app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  const taskId = req.params.id;
  
  if (!tasks.has(taskId)) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  tasks.delete(taskId);
  taskQueue.splice(taskQueue.indexOf(taskId), 1);
  
  broadcastTaskUpdate();
  
  res.json({ success: true });
});

app.post('/api/tasks/:id/assign', (req: Request, res: Response) => {
  const { agentId } = req.body;
  const taskId = req.params.id;
  
  const task = tasks.get(taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const agent = agents.get(agentId);
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  assignTaskToAgent(taskId, agentId);
  
  res.json({ success: true, task });
});

function assignTaskToAgent(taskId: string, agentId: string) {
  const task = tasks.get(taskId);
  const agent = agents.get(agentId);
  
  if (!task || !agent) return;
  
  task.assignedAgent = agentId;
  task.status = 'in_progress';
  task.updatedAt = Date.now();
  
  broadcastToAgent(agentId, {
    type: 'task',
    task: {
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority
    },
    timestamp: Date.now()
  });
  
  agent.status = 'busy';
  broadcastAgentStatus();
  broadcastTaskUpdate();
}

function updateTaskStatus(taskId: string, status: string, result?: string) {
  const task = tasks.get(taskId);
  if (!task) return;
  
  task.status = status as Task['status'];
  task.updatedAt = Date.now();
  if (result) task.result = result;
  
  if (status === 'completed' || status === 'failed' || status === 'cancelled') {
    const agent = agents.get(task.assignedAgent || '');
    if (agent) {
      agent.status = 'online';
    }
  }
  
  broadcastTaskUpdate();
}

function addTaskLog(taskId: string, log: string) {
  const task = tasks.get(taskId);
  if (!task) return;
  
  task.logs.push(`[${new Date().toISOString()}] ${log}`);
  task.updatedAt = Date.now();
  
  broadcastTaskUpdate();
}

function broadcastTaskUpdate() {
  const taskList = Array.from(tasks.values());
  const payload = JSON.stringify({ type: 'taskUpdate', tasks: taskList, timestamp: Date.now() });
  
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// ============ MEMORY ENDPOINTS ============

app.get('/api/memory/shared', (req: Request, res: Response) => {
  const { key, pattern } = req.query;
  
  if (key) {
    const mem = sharedMemory.get(key as string);
    if (!mem) {
      return res.status(404).json({ error: 'Key not found' });
    }
    return res.json(mem);
  }
  
  let memList = Array.from(sharedMemory.values());
  
  if (pattern) {
    const regex = new RegExp(pattern as string, 'i');
    memList = memList.filter(m => regex.test(m.key));
  }
  
  res.json({ entries: memList, total: memList.length });
});

app.post('/api/memory/shared', (req: Request, res: Response) => {
  const { key, value, agentId } = req.body;
  
  if (!key) {
    return res.status(400).json({ error: 'key required' });
  }
  
  const mem = updateSharedMemory(key, value, agentId);
  
  broadcastMemoryUpdate(key);
  
  res.json({ success: true, entry: mem });
});

app.delete('/api/memory/shared/:key', (req: Request, res: Response) => {
  const { key } = req.params;
  
  if (!sharedMemory.has(key)) {
    return res.status(404).json({ error: 'Key not found' });
  }
  
  sharedMemory.delete(key);
  broadcastMemoryUpdate(key);
  
  res.json({ success: true });
});

function updateSharedMemory(key: string, value: any, agentId?: string): SharedMemory {
  const mem: SharedMemory = {
    key,
    value,
    updatedAt: Date.now(),
    updatedBy: agentId
  };
  
  sharedMemory.set(key, mem);
  return mem;
}

function broadcastMemoryUpdate(key: string) {
  const mem = sharedMemory.get(key);
  const payload = JSON.stringify({ type: 'memoryUpdate', key, entry: mem, timestamp: Date.now() });
  
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// ============ HEALTH & STATUS ============

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    agents: {
      total: agents.size,
      online: Array.from(agents.values()).filter(a => a.status === 'online').length,
      busy: Array.from(agents.values()).filter(a => a.status === 'busy').length
    },
    tasks: {
      total: tasks.size,
      pending: Array.from(tasks.values()).filter(t => t.status === 'pending').length,
      inProgress: Array.from(tasks.values()).filter(t => t.status === 'in_progress').length,
      completed: Array.from(tasks.values()).filter(t => t.status === 'completed').length
    },
    memory: {
      entries: sharedMemory.size
    },
    timestamp: Date.now()
  });
});

app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    nexus: 'Aurora Nexus Server',
    version: '1.0.0',
    endpoints: {
      agents: {
        list: 'GET /api/agents/list',
        spawn: 'POST /api/agents/spawn',
        kill: 'POST /api/agents/kill',
        command: 'POST /api/agents/:id/command'
      },
      tasks: {
        submit: 'POST /api/tasks/submit',
        list: 'GET /api/tasks/list',
        status: 'GET /api/tasks/status/:id',
        assign: 'POST /api/tasks/:id/assign'
      },
      memory: {
        shared: 'GET /api/memory/shared',
        set: 'POST /api/memory/shared',
        delete: 'DELETE /api/memory/shared/:key'
      }
    },
    websocket: `ws://localhost:${process.env.PORT || 3000}`,
    timestamp: Date.now()
  });
});

// Heartbeat checker
setInterval(() => {
  const now = Date.now();
  const timeout = 30000;
  
  agents.forEach((agent, id) => {
    if (agent.status === 'online' && agent.lastHeartbeat && now - agent.lastHeartbeat > timeout) {
      console.log(`[Nexus] Agent ${id} heartbeat timeout`);
      agent.status = 'offline';
      broadcastAgentStatus();
    }
  });
}, 10000);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Aurora Nexus Server running on port ${PORT}`);
  console.log(`📡 WebSocket available at ws://localhost:${PORT}`);
  console.log(`📋 API endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/status`);
  console.log(`   GET  /api/agents/list`);
  console.log(`   POST /api/agents/spawn`);
  console.log(`   POST /api/agents/kill`);
  console.log(`   POST /api/tasks/submit`);
  console.log(`   GET  /api/tasks/list`);
  console.log(`   GET  /api/memory/shared`);
  console.log(`   POST /api/memory/shared`);
});

export default app;
