# LangGraph Integration - TradeShare

## Overview

This integration adds LangGraph capabilities to enhance the existing `AgentOrchestrator` with:
- Checkpointing & persistence
- Multi-agent collaboration
- Human-in-the-loop review flows
- Workflow definitions

## Installation

```bash
npm install @langchain/langgraph @langchain/core
```

## Architecture

```
src/services/agents/langgraph/
├── types.ts                     # Type definitions
├── LangGraphAgent.ts            # Core agent with retry/checkpointing
├── LangGraphOrchestrator.ts     # High-level API wrapper
├── LangGraphPersistence.ts      # LocalStorage/Session persistence
├── MultiAgentCollaboration.ts   # Multi-agent messaging
├── HumanInTheLoop.ts           # Human review workflows
├── LangGraphWorkflows.ts        # Predefined workflow templates
└── index.ts                    # Exports
```

## Usage

### Basic Agent Execution

```typescript
import { langGraphOrchestrator } from '@/services/agents/langgraph';

const result = await langGraphOrchestrator.executeWithLangGraph(
  'newsfeed',
  { query: 'Bitcoin', taskType: 'searchNews' },
  { maxIterations: 3 }
);

console.log(result.success, result.state.iterations);
```

### Checkpoint Persistence

```typescript
import { langGraphPersistence } from '@/services/agents/langgraph';

// Save checkpoint
langGraphPersistence.save('checkpoint-1', state);

// Load checkpoint
const restored = langGraphPersistence.load('checkpoint-1');

// List all checkpoints
const checkpoints = langGraphPersistence.listIds();
```

### Multi-Agent Collaboration

```typescript
import { multiAgentCollaboration } from '@/services/agents/langgraph';

// Create collaboration session
const sessionId = multiAgentCollaboration.createSession(
  ['newsfeed', 'risk', 'creator'],
  { topic: 'Crypto analysis' }
);

// Run collaborative task
const session = await multiAgentCollaboration.runCollaborative(
  sessionId,
  'Analyze Bitcoin market and create report'
);

console.log(session.result);
```

### Human-in-the-Loop Review

```typescript
import { humanInTheLoop } from '@/services/agents/langgraph';

// Request human review
const request = humanInTheLoop.createReviewRequest(
  'task-123',
  'newsfeed',
  state,
  'user-456',
  'high'
);

// Submit feedback
humanInTheLoop.submitFeedback(
  request.id,
  'reviewer-789',
  'approve',
  'Looks good!'
);

// Wait for review (async)
const feedback = await humanInTheLoop.waitForReview(request.id);
```

### Workflows

```typescript
import { langGraphWorkflow, PREDEFINED_WORKFLOWS } from '@/services/agents/langgraph';

// Use predefined workflow
const state = await langGraphWorkflow.run(
  'research-analyze-report',
  { topic: 'AI stocks' }
);

// Create custom workflow
langGraphWorkflow.registerWorkflow({
  id: 'my-workflow',
  name: 'My Workflow',
  nodes: [...],
  edges: [...]
});
```

## Configuration

### LangGraphConfig

```typescript
interface LangGraphConfig {
  maxIterations: number;        // Max retry attempts (default: 3)
  enableCheckpointing: boolean; // Enable state persistence (default: true)
  enableHumanReview: boolean;   // Allow human intervention (default: false)
  retryOnError: boolean;         // Auto-retry on failure (default: true)
}
```

### CheckpointPersistenceConfig

```typescript
interface CheckpointPersistenceConfig {
  storageKey: string;       // localStorage key (default: 'langgraph_checkpoints')
  maxCheckpoints: number;   // Max checkpoints to store (default: 50)
  ttlMinutes: number;        // Time-to-live in minutes (default: 60)
  storageType: 'localStorage' | 'sessionStorage' | 'memory';
}
```

## React Hook

```typescript
import { useLangGraphAgent } from '@/hooks';

function MyComponent() {
  const { execute, isLoading, lastState } = useLangGraphAgent({
    maxIterations: 3,
    enableCheckpointing: true,
    enableHumanReview: true
  });

  const handleSearch = async () => {
    const result = await execute('newsfeed', { query: 'BTC' });
    console.log(result.state.messages);
  };
}
```

## Tests

```bash
npm run test:run -- __tests__/unit/langGraphAgent.test.ts
npm run test:run -- __tests__/unit/useLangGraphAgent.test.ts
```

## Features Summary

| Feature | Description |
|---------|-------------|
| ✅ Checkpointing | Persist agent state to localStorage/session |
| ✅ Retry Logic | Automatic retry with configurable max iterations |
| ✅ Multi-Agent | Agent-to-agent messaging and collaboration |
| ✅ Human Review | Request, approve/reject/revise workflows |
| ✅ Workflows | Predefined and custom workflow definitions |
| ✅ React Hook | Easy integration with React components |

## Dependencies

- `@langchain/langgraph` - LangGraph core
- `@langchain/core` - LangChain utilities
- Existing `AgentOrchestrator` integration
