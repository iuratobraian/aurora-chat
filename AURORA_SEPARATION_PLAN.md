# 🧠 AURORA SEPARATION PLAN

## Objective
Separate Aurora AI Framework from TradeShare into its own independent project while maintaining compatibility.

## Current State (2026-04-01)
- **89 Aurora files** scattered across:
  - `scripts/aurora*` (70+ files)
  - `lib/aurora/` (memory, codebase-indexer)
  - `.agent/aurora/` (connectors, nexus, scripts)
  - `src/components/` (AuroraSupportSection, AuroraIdeaHub)

## Target Architecture

```
aurora/                         # Aurora AI Framework (INDEPENDENT)
├── package.json                # Independent NPM package
├── README.md                   # Aurora documentation
├── core/                       # Núcleo de Aurora
│   ├── daemon/                 # Always-on daemon (aurora-always-on.mjs)
│   ├── providers/              # Groq, Kimi, OpenRouter providers
│   ├── commands/               # @aurora commands handler
│   └── memory/                 # Memory system (memory-backend.mjs)
├── agents/                     # Agentes especializados
│   ├── tracker/                # Agent tracking
│   ├── bridge/                 # Agent bridge
│   ├── functions/              # Agent functions
│   └── learners/               # Auto-learning agents
├── mcp/                        # MCP servers & connectors
│   ├── connectors.json         # MCP configuration
│   └── servers/                # MCP server implementations
├── skills/                     # Knowledge & skills
│   ├── patterns/               # Design patterns
│   ├── knowledge/              # Knowledge base
│   └── research/               # Research tools
├── cli/                        # Aurora CLI
│   ├── aurora-cli.mjs          # Main CLI entry
│   └── commands/               # CLI commands
├── api/                        # Aurora API local
│   ├── aurora-api.mjs          # API server
│   └── routes/                 # API routes
├── scripts/                    # Utility scripts
│   ├── startup/                # Startup scripts
│   ├── backup/                 # Backup scripts
│   └── sync/                   # Sync scripts (Notion, GitHub)
├── lib/                        # Shared libraries
│   ├── utils/                  # Utility functions
│   └── types/                  # TypeScript types
└── tests/                      # Test suite
    ├── unit/                   # Unit tests
    └── integration/            # Integration tests

trade-share/                    # TradeShare (Super App)
├── src/                        # Frontend code
├── convex/                     # Backend (Convex)
├── server.ts                   # Express server
├── package.json
└── .env.local                  # Environment variables (includes Aurora keys)

shared/                         # Código compartido (opcional)
└── utils/
```

## Migration Strategy

### Phase 1: Research (COMPLETED)
- [x] Investigate Claude Code leak
- [x] Extract KAIROS, Buddy, Coordinator Mode patterns
- [x] Document learnings

### Phase 2: Architecture Design (IN PROGRESS)
- [ ] Define clear boundaries TradeShare ↔ Aurora
- [ ] Design communication API between projects
- [ ] Plan gradual migration

### Phase 3: Skeleton Creation
- [ ] Create `aurora/` directory structure
- [ ] Move core scripts (aurora-inicio, aurora-always-on, aurora-api)
- [ ] Update package.json with dependencies
- [ ] Create Aurora README.md

### Phase 4: Enhancement with Claude Code Learnings
- [ ] Implement KAIROS-style always-on assistant
- [ ] Add Dream memory consolidation system
- [ ] Build Coordinator Mode for multi-agents
- [ ] Add Buddy-style companion system (optional)

## Communication Protocol

### TradeShare → Aurora
```javascript
// Via Aurora API (HTTP)
POST http://localhost:4310/chat
{
  message: "@aurora review src/file.tsx",
  context: { files: [...], task: "..." }
}

// Via CLI
npm run aurora:shell -- "review src/file.tsx"
```

### Aurora → TradeShare
```javascript
// Via Convex mutations
await convex.mutation('aurora:findings:create', {
  source: 'aurora-code-review',
  findings: [...]
})

// Via file system (for now)
.agent/workspace/coordination/TASK_BOARD.md
AGENT_LOG.md
```

## Files to Move (Priority Order)

### CRITICAL (Must move first)
1. `scripts/aurora-inicio.mjs` - Entry point
2. `scripts/aurora-always-on.mjs` - Daemon
3. `scripts/aurora-api.mjs` - API server
4. `scripts/aurora-cli.mjs` - CLI
5. `scripts/aurora-shell.mjs` - Terminal interface
6. `lib/aurora/memory-backend.mjs` - Memory system
7. `.agent/aurora/connectors.json` - MCP connectors

### HIGH (Core functionality)
8. `scripts/aurora-ai-agent.mjs` - AI agent logic
9. `scripts/aurora-notion-sync.mjs` - Notion integration
10. `scripts/aurora-task-router.mjs` - Task routing
11. `scripts/aurora-agent-*.mjs` - All agent scripts
12. `scripts/aurora-memory*.mjs` - Memory sync scripts

### MEDIUM (Supporting features)
13. `scripts/aurora-research*.mjs` - Research tools
14. `scripts/aurora-knowledge*.mjs` - Knowledge management
15. `scripts/aurora-metrics*.mjs` - Metrics dashboard
16. `scripts/aurora-doctor.mjs` - Health checks

### LOW (Can stay in TradeShare temporarily)
17. `scripts/aurora-antigravity-sync.mjs` - TradeShare specific
18. `scripts/aurora-product-intelligence.mjs` - TradeShare specific
19. `src/components/AuroraSupportSection.tsx` - UI component (stays)

## Compatibility Layer

During migration, maintain backward compatibility:

```javascript
// trade-share/scripts/aurora-inicio.mjs (wrapper)
import auroraInicio from '../../aurora/cli/aurora-inicio.mjs';
await auroraInicio.run();
```

## Success Criteria

- [ ] Aurora runs independently (`cd aurora && npm run start`)
- [ ] TradeShare can call Aurora via API/CLI
- [ ] All 89 Aurora files relocated and organized
- [ ] No functionality lost during migration
- [ ] Documentation updated
- [ ] Tests passing

## Timeline

| Phase | Duration | End Date |
|-------|----------|----------|
| Phase 1: Research | 1 day | 2026-04-01 |
| Phase 2: Architecture | 1 day | 2026-04-02 |
| Phase 3: Skeleton | 2 days | 2026-04-04 |
| Phase 4: Enhancement | 3 days | 2026-04-07 |

---

**Created:** 2026-04-01
**Status:** IN PROGRESS
**Owner:** Aurora Development Team
