# Agent Memory MCP Playbook

## Purpose
Persistent memory for AI agents - remember decisions, search runbooks, inspect docs, and reuse operational knowledge.

## Priority
Alta

## Repository
https://github.com/ipiton/agent-memory-mcp

## Setup
```bash
# Install
go install github.com/ipiton/agent-memory-mcp/cmd/agent-memory-mcp@latest

# Configure in connectors.json
{
  "id": "agent_memory_mcp",
  "tipo": "memoria_persistente",
  "uso": "memoria, docs y contexto de repo para agentes de ingenieria"
}
```

## Key Capabilities

### Memory Operations
- Store memories
- Search memories
- Tag and categorize
- Retrieve by context

### Knowledge Management
- Store decisions
- Share runbooks
- Document patterns
- Track learnings

## Usage Patterns

### Store Memory
```javascript
agent_memory.store({
  content: "Decision: Use relay pattern for API keys",
  tags: ["security", "architecture"],
  context: "project-X"
})
```

### Search Memory
```javascript
agent_memory.search({
  query: "API key security patterns",
  tags: ["security"]
})
```

### Retrieve Context
```javascript
agent_memory.get_context({
  project: "tradeportal",
  type: "decisions"
})
```

## Risk Assessment
- **Risk Level**: Low
- **Data Exposure**: Stored memories and decisions
- **Mitigation**: Control access, encrypt sensitive data

## Troubleshooting
- Memory not found → Add more context/tags
- Storage full → Prune old memories
- Sync issues → Check database connection
