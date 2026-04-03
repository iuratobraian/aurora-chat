# Aurora AI Framework - Architecture

**Version:** 1.0.0  
**Last Updated:** 2026-04-01

---

## Vision

Aurora is an **always-on AI assistant framework** for development teams. Unlike chat-based AI that only responds when prompted, Aurora runs continuously in the background, proactively suggesting improvements, detecting issues, and coordinating multi-agent workflows.

---

## Core Design Principles

1. **Always-On** - Aurora is always present, always learning, always ready
2. **Proactive** - Not just reactive; suggests improvements before being asked
3. **Modular** - Every component is swappable (providers, tools, agents)
4. **Memory-Rich** - Remembers context across sessions, gets smarter over time
5. **Safe Autonomy** - Can operate independently with appropriate guardrails
6. **Multi-Modal** - CLI, API, WebSocket, file-based integration

---

## Core Components

### 1. Aurora Core (`/core`)

The heart of Aurora - daemon, providers, memory, commands.

#### Daemon (`/core/daemon`)
```
aurora-daemon.mjs       # Main daemon process
aurora-always-on.mjs    # Always-on presence protocol
aurora-tick.mjs         # Periodic tick handler
aurora-proactive.mjs    # Proactive suggestion engine
```

**Responsibilities:**
- Maintain background process
- Handle tick events (every 5 minutes)
- Detect context changes
- Trigger proactive suggestions
- Manage daemon lifecycle (start/stop/status)

#### Providers (`/core/providers`)
```
provider-base.mjs       # Base provider interface
groq-provider.mjs       # Groq (fast, cheap)
kimi-provider.mjs       # Kimi K2.5 (quality)
openrouter-provider.mjs # OpenRouter (backup)
ollama-provider.mjs     # Ollama local (free)
provider-router.mjs     # Smart routing between providers
```

**Responsibilities:**
- Abstract LLM API differences
- Implement retry logic
- Handle rate limiting
- Cost optimization
- Fallback chains

#### Memory (`/core/memory`)
```
memory-backend.mjs      # Persistent memory storage
aurora-dream.mjs        # Dream consolidation system
memory-index.mjs        # Memory indexing
memory-retrieval.mjs    # Semantic retrieval
```

**Responsibilities:**
- Store session transcripts
- Consolidate memories (Dream system)
- Retrieve relevant context
- Manage memory lifecycle
- Prune old memories

#### Commands (`/core/commands`)
```
command-handler.mjs     # Route commands to tools
aurora-review.mjs       # Code review command
aurora-analyze.mjs      # Deep analysis command
aurora-optimize.mjs     # Optimization command
aurora-memory.mjs       # Memory management
```

**Responsibilities:**
- Parse user commands
- Validate arguments
- Execute tools
- Format responses

---

### 2. Agent System (`/agents`)

Specialized agents for different tasks.

#### Tracker (`/agents/tracker`)
```
agent-tracker.mjs       # Track agent activity
agent-learner.mjs       # Learn from agent actions
agent-metrics.mjs       # Agent performance metrics
```

#### Bridge (`/agents/bridge`)
```
agent-bridge.mjs        # Cross-agent communication
agent-inbox.mjs         # Message inbox
agent-outbox.mjs        # Message outbox
```

#### Functions (`/agents/functions`)
```
agent-functions.mjs     # Reusable agent functions
code-explorer.mjs       # Explore codebase
pattern-matcher.mjs     # Match design patterns
dependency-analyzer.mjs # Analyze dependencies
```

#### Learners (`/agents/learners`)
```
auto-learn.mjs          # Learn from sessions
auto-destil.mjs         # Distill knowledge
knowledge-validator.mjs # Validate learnings
```

---

### 3. MCP Layer (`/mcp`)

Model Context Protocol integration.

#### Connectors (`/mcp/connectors`)
```
connectors.json         # MCP server configurations
connector-loader.mjs    # Load connectors
connector-manager.mjs   # Manage active connectors
```

#### Servers (`/mcp/servers`)
```
filesystem-mcp.mjs      # Filesystem operations
github-mcp.mjs          # GitHub integration
playwright-mcp.mjs      # Browser automation
brave-search-mcp.mjs    # Web search
```

---

### 4. Skills (`/skills`)

Knowledge base and reusable skills.

#### Patterns (`/skills/patterns`)
```
design-patterns.md      # Software design patterns
anti-patterns.md        # Anti-patterns to avoid
aurora-patterns.md      # Aurora-specific patterns
```

#### Knowledge (`/skills/knowledge`)
```
knowledge-base.mjs      # Knowledge management
heuristics.mjs          # Decision heuristics
references.mjs          # Reference materials
```

#### Research (`/skills/research`)
```
web-research.mjs        # Web research tools
doc-search.mjs          # Documentation search
trend-analysis.mjs      # Technology trends
```

---

### 5. CLI (`/cli`)

Command-line interface.

```
aurora-cli.mjs          # Main CLI entry
aurora-shell.mjs        # Interactive shell
commands/               # CLI commands
  review.js
  analyze.js
  optimize.js
  memory.js
  status.js
```

**Features:**
- Interactive terminal UI
- Real-time output streaming
- Command history
- Auto-completion
- Color-coded output

---

### 6. API Server (`/api`)

HTTP API for external integration.

```
aurora-api.mjs          # Express API server
routes/
  chat.js               # POST /chat
  review.js             # POST /review
  analyze.js            # POST /analyze
  optimize.js           # POST /optimize
  memory.js             # GET/POST /memory
  status.js             # GET /status
middleware/
  auth.js               # API key validation
  rate-limit.js         # Rate limiting
  cors.js               # CORS handling
```

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /chat | Send message to Aurora |
| POST | /review | Request code review |
| POST | /analyze | Request analysis |
| POST | /optimize | Request optimization |
| GET | /memory | Get memory state |
| POST | /memory | Store memory |
| GET | /status | Get Aurora status |
| WS | /ws | WebSocket for real-time |

---

### 7. Scripts (`/scripts`)

Utility scripts for operations.

#### Startup (`/scripts/startup`)
```
aurora-startup.mjs      # Startup sequence
aurora-preflight.mjs    # Pre-flight checks
aurora-ensure-port.mjs  # Ensure port available
```

#### Backup (`/scripts/backup`)
```
aurora-backup.mjs       # Backup memory & config
aurora-restore.mjs      # Restore from backup
```

#### Sync (`/scripts/sync`)
```
aurora-notion-sync.mjs  # Sync with Notion
aurora-github-sync.mjs  # Sync with GitHub
aurora-antigravity.mjs  # TradeShare sync
```

---

## Communication Protocols

### External (TradeShare → Aurora)

#### HTTP API
```javascript
POST http://localhost:4310/chat
{
  "message": "@aurora review src/App.tsx",
  "context": {
    "files": ["src/App.tsx"],
    "task": "TSK-001"
  }
}

Response:
{
  "success": true,
  "response": "Review complete...",
  "findings": [...]
}
```

#### CLI
```bash
npm run aurora:shell -- "review src/App.tsx"
# or
aurora review src/App.tsx
```

#### File-Based
```markdown
# .agent/workspace/coordination/TASK_BOARD.md
| TASK-ID | Status | Files |
|---------|--------|-------|
| TSK-001 | in_progress | src/App.tsx |

# Aurora monitors this file for changes
```

### Internal (Agent → Agent)

#### Event Bus
```javascript
// Publish event
eventBus.publish('agent:task:assigned', {
  agentId: 'agent-1',
  task: 'review',
  file: 'src/App.tsx'
});

// Subscribe to events
eventBus.subscribe('agent:task:complete', (event) => {
  console.log(`Agent ${event.agentId} completed ${event.task}`);
});
```

#### Message Queue
```javascript
// Queue message
await messageQueue.send('agent-1', {
  type: 'task',
  payload: { action: 'review', file: 'src/App.tsx' }
});

// Receive messages
const messages = await messageQueue.receive('agent-1', { limit: 10 });
```

#### Shared Memory
```javascript
// Write to shared memory
await sharedMemory.set('coordinator:state', {
  phase: 'research',
  workers: ['agent-1', 'agent-2'],
  findings: []
});

// Read from shared memory
const state = await sharedMemory.get('coordinator:state');
```

---

## Data Flow

```
┌─────────────┐
│ User Input  │
│ (CLI/API)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Command   │
│   Router    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Provider  │
│   Selection │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Memory    │
│   Retrieval │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│     LLM     │
│   (Groq/    │
│    Kimi)    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Response  │
│   + Memory  │
│   Storage   │
└─────────────┘
```

---

## Configuration

### Environment Variables

```bash
# Required
GROQ_API_KEY=gsk_...
NVIDIA_API_KEY=nvapi-...

# Optional
OPENROUTER_API_KEY=sk-or-...
OLLAMA_BASE_URL=http://127.0.0.1:11434

# Integration
NOTION_API_KEY=ntn_...
NOTION_DATABASE_ID=...

# Aurora Settings
AURORA_PORT=4310
AURORA_MEMORY_LIMIT=500MB
AURORA_LOG_LEVEL=info
```

### Connector Config (JSON)

```json
{
  "apis": [
    {
      "id": "groq",
      "tipo": "modelos_externos",
      "estadoEnv": "GROQ_API_KEY",
      "prioridad": "alta"
    }
  ],
  "mcp": [
    {
      "id": "filesystem_mcp",
      "tipo": "filesystem",
      "prioridad": "alta"
    }
  ]
}
```

---

## Security

### API Key Validation
```javascript
// middleware/auth.js
export function requireAuth(req, res, next) {
  const apiKey = req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey || apiKey !== process.env.AURORA_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
}
```

### Command Sandboxing
```javascript
// core/security/sandbox.mjs
export function sandboxCommand(command) {
  // Block dangerous commands
  const blocked = ['rm -rf', 'sudo', 'curl | bash'];
  
  if (blocked.some(b => command.includes(b))) {
    throw new Error('Command blocked for security');
  }
  
  return command;
}
```

### Rate Limiting
```javascript
// middleware/rate-limit.js
const rateLimit = new Map();

export function limitRequests(maxPerMinute = 60) {
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    
    if (!rateLimit.has(ip)) {
      rateLimit.set(ip, []);
    }
    
    const requests = rateLimit.get(ip).filter(t => now - t < 60000);
    
    if (requests.length >= maxPerMinute) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    
    requests.push(now);
    rateLimit.set(ip, requests);
    next();
  };
}
```

---

## Performance

### Targets

| Metric | Target |
|--------|--------|
| Response Time | < 100ms (simple), < 3s (complex) |
| Memory Usage | < 500MB |
| CPU Usage | < 20% idle, < 80% active |
| Daemon Startup | < 2s |

### Optimization Strategies

1. **Memory Caching** - Cache LLM responses, tool schemas
2. **Provider Failover** - Automatic fallback if provider fails
3. **Batch Processing** - Group similar requests
4. **Lazy Loading** - Load modules on demand
5. **Worker Threads** - Offload heavy computation

---

## Testing

### Unit Tests
```javascript
// tests/unit/memory.test.js
import { describe, it, expect } from 'vitest';
import { MemoryBackend } from '../../core/memory/memory-backend.mjs';

describe('MemoryBackend', () => {
  it('should store and retrieve memories', async () => {
    const memory = new MemoryBackend();
    await memory.set('test', { value: 'hello' });
    const result = await memory.get('test');
    expect(result.value).toBe('hello');
  });
});
```

### Integration Tests
```javascript
// tests/integration/api.test.js
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../api/aurora-api.mjs';

describe('Aurora API', () => {
  it('POST /chat should return response', async () => {
    const res = await request(app)
      .post('/chat')
      .set('Authorization', 'Bearer test_key')
      .send({ message: 'hello' });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('response');
  });
});
```

---

## Deployment

### Local Development
```bash
npm install
npm run daemon
npm run api
```

### Production (Docker)
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 4310

CMD ["npm", "run", "api"]
```

### Cloud (Vercel/Render)
```yaml
# render.yaml
services:
  - type: web
    name: aurora-api
    env: node
    buildCommand: npm install
    startCommand: npm run api
    envVars:
      - key: GROQ_API_KEY
        sync: false
      - key: NVIDIa_API_KEY
        sync: false
```

---

## Future Roadmap

### Q2 2026
- [ ] KAIROS proactive assistant
- [ ] Dream memory consolidation
- [ ] Coordinator Mode (multi-agent)
- [ ] Buddy companion (optional)

### Q3 2026
- [ ] Web dashboard
- [ ] Mobile app (React Native)
- [ ] VS Code extension
- [ ] Slack integration

### Q4 2026
- [ ] Self-improving heuristics
- [ ] Multi-modal input (images, audio)
- [ ] Distributed agent network
- [ ] Plugin marketplace

---

**Architecture Version:** 1.0.0  
**Maintained By:** Aurora Development Team  
**Contact:** aurora@tradeshare.app
