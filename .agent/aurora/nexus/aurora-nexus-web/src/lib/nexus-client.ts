// Aurora Nexus Web - API Client for Nexus Server
export interface NexusConfig {
  apiUrl: string;
  wsUrl: string;
  reconnectInterval: number;
  heartbeatInterval: number;
}

export const NEXUS_CONFIG: NexusConfig = {
  apiUrl: process.env.NEXUS_API_URL || 'http://localhost:3000',
  wsUrl: process.env.NEXUS_WS_URL || 'ws://localhost:3000',
  reconnectInterval: 5000,
  heartbeatInterval: 15000,
};

export interface Agent {
  id: string;
  name: string;
  type: 'opencode' | 'minimax' | 'aurora' | 'gemini' | 'custom';
  status: 'online' | 'offline' | 'busy' | 'starting' | 'error';
  startedAt?: number;
  lastHeartbeat?: number;
  capabilities: string[];
}

export interface Task {
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

export interface SharedMemoryEntry {
  key: string;
  value: any;
  updatedAt: number;
  updatedBy?: string;
}

export interface NexusHealth {
  status: string;
  uptime: number;
  agents: {
    total: number;
    online: number;
    busy: number;
  };
  tasks: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
  memory: {
    entries: number;
  };
  timestamp: number;
}

export class NexusClient {
  private ws: WebSocket | null = null;
  private config: NexusConfig;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor(config: Partial<NexusConfig> = {}) {
    this.config = { ...NEXUS_CONFIG, ...config };
  }

  // WebSocket connection
  connect(agentId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${this.config.wsUrl}?agentId=${encodeURIComponent(agentId)}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('[Nexus] Connected to server');
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.emit(message.type, message);
          } catch (e) {
            console.error('[Nexus] Failed to parse message:', e);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[Nexus] WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[Nexus] Disconnected from server');
          this.stopHeartbeat();
          this.scheduleReconnect(agentId);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private scheduleReconnect(agentId: string): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect(agentId).catch(console.error);
    }, this.config.reconnectInterval);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: 'heartbeat' });
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  // Event handling
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach(cb => cb(data));
    this.listeners.get('*')?.forEach(cb => cb({ event, ...data }));
  }

  // Agent methods
  async listAgents(): Promise<Agent[]> {
    const response = await fetch(`${this.config.apiUrl}/api/agents/list`);
    const data = await response.json();
    return data.agents;
  }

  async spawnAgent(agentId: string, agentType?: string, command?: string): Promise<any> {
    const response = await fetch(`${this.config.apiUrl}/api/agents/spawn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, agentType, command }),
    });
    return response.json();
  }

  async killAgent(agentId: string): Promise<any> {
    const response = await fetch(`${this.config.apiUrl}/api/agents/kill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId }),
    });
    return response.json();
  }

  async sendCommand(agentId: string, command: string): Promise<any> {
    const response = await fetch(`${this.config.apiUrl}/api/agents/${agentId}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    });
    return response.json();
  }

  // Task methods
  async listTasks(filters?: { status?: string; assignedAgent?: string; priority?: string }): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assignedAgent) params.append('assignedAgent', filters.assignedAgent);
    if (filters?.priority) params.append('priority', filters.priority);
    
    const response = await fetch(`${this.config.apiUrl}/api/tasks/list?${params}`);
    const data = await response.json();
    return data.tasks;
  }

  async submitTask(title: string, description?: string, priority?: string, assignedAgent?: string): Promise<Task> {
    const response = await fetch(`${this.config.apiUrl}/api/tasks/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, priority, assignedAgent }),
    });
    const data = await response.json();
    return data.task;
  }

  async getTaskStatus(taskId: string): Promise<Task> {
    const response = await fetch(`${this.config.apiUrl}/api/tasks/status/${taskId}`);
    return response.json();
  }

  async assignTask(taskId: string, agentId: string): Promise<any> {
    const response = await fetch(`${this.config.apiUrl}/api/tasks/${taskId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId }),
    });
    return response.json();
  }

  async updateTaskStatus(taskId: string, status: string, result?: string): Promise<any> {
    const response = await fetch(`${this.config.apiUrl}/api/tasks/${taskId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, result }),
    });
    return response.json();
  }

  // Memory methods
  async getMemory(key?: string, pattern?: string): Promise<SharedMemoryEntry | SharedMemoryEntry[]> {
    const params = new URLSearchParams();
    if (key) params.append('key', key);
    if (pattern) params.append('pattern', pattern);
    
    const response = await fetch(`${this.config.apiUrl}/api/memory/shared?${params}`);
    return response.json();
  }

  async setMemory(key: string, value: any, agentId?: string): Promise<SharedMemoryEntry> {
    const response = await fetch(`${this.config.apiUrl}/api/memory/shared`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value, agentId }),
    });
    const data = await response.json();
    return data.entry;
  }

  async deleteMemory(key: string): Promise<any> {
    const response = await fetch(`${this.config.apiUrl}/api/memory/shared/${key}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  // Health methods
  async getHealth(): Promise<NexusHealth> {
    const response = await fetch(`${this.config.apiUrl}/api/health`);
    return response.json();
  }

  async getStatus(): Promise<any> {
    const response = await fetch(`${this.config.apiUrl}/api/status`);
    return response.json();
  }
}

// Singleton instance
export const nexusClient = new NexusClient();
export default nexusClient;
