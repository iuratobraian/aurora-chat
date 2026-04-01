# 🧠 Aurora AI Framework

> **Always-on AI assistant for development teams**

[![Version](https://img.shields.io/npm/v/@aurora/ai-framework)](https://npmjs.com/package/@aurora/ai-framework)
[![License](https://img.shields.io/npm/l/@aurora/ai-framework)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)

## 🌟 Features

- **🤖 Always-On Daemon** - Aurora runs in background, ready to help instantly
- **🧠 Multi-Provider Support** - Groq (fast), Kimi (quality), OpenRouter (backup)
- **💾 Persistent Memory** - Remembers context across sessions with Dream consolidation
- **🎯 Multi-Agent Orchestration** - Coordinator Mode for complex tasks
- **🔐 Safe Autonomy** - ML-based permission system with risk classification
- **💬 Natural Commands** - `@aurora review`, `@aurora analyze`, `@aurora optimize`
- **🔌 MCP Integration** - 20+ MCP servers for extended capabilities
- **📊 Rich CLI** - Beautiful terminal interface with real-time updates

## 🚀 Quick Start

### Installation

```bash
# Install from npm (coming soon)
npm install -g @aurora/ai-framework

# Or clone from GitHub
git clone https://github.com/iuratobraian/aurora-ai-framework
cd aurora-ai-framework
npm install
```

### Configuration

Create `.env.aurora`:

```bash
# AI Providers
GROQ_API_KEY=gsk_...
NVIDIA_API_KEY=nvapi-...
OPENROUTER_API_KEY=sk-or-...

# Optional: Local models
OLLAMA_BASE_URL=http://127.0.0.1:11434/api/generate

# Optional: Notion integration
NOTION_API_KEY=ntn_...
NOTION_DATABASE_ID=...
```

### Usage

```bash
# Start Aurora daemon (always-on)
npm run daemon

# Interactive shell
npm run shell

# Start API server
npm run api

# One-off commands
aurora review src/App.tsx
aurora analyze ./src
aurora memory check
aurora status
```

## 📖 Documentation

- **[Getting Started](docs/GETTING_STARTED.md)** - Installation and setup
- **[Commands](docs/COMMANDS.md)** - All @aurora commands
- **[Architecture](ARCHITECTURE.md)** - Technical deep dive
- **[MCP Servers](docs/MCP.md)** - MCP integration guide
- **[Memory System](docs/MEMORY.md)** - How Aurora remembers
- **[Multi-Agent](docs/MULTI_AGENT.md)** - Coordinator Mode

## 🎯 Commands

### Code Review
```bash
aurora review src/file.tsx
aurora review:security ./src/components
aurora review:performance src/hooks
```

### Analysis
```bash
aurora analyze ./src
aurora analyze:architecture
aurora analyze:dependencies
```

### Optimization
```bash
aurora optimize
aurora optimize:bundle
aurora optimize:memory
```

### Memory
```bash
aurora memory check
aurora memory report
aurora memory clear
```

### System
```bash
aurora status
aurora tasks
aurora providers
aurora help
```

## 🔌 Integration

### With TradeShare

Aurora powers the AI assistant in TradeShare Super App:

```javascript
// TradeShare component calling Aurora
const review = await fetch('http://localhost:4310/review', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer aurora_key' },
  body: JSON.stringify({ file: 'src/App.tsx' })
});
```

### Via CLI

```bash
# In any project
aurora review $(git diff --name-only HEAD~1)

# In CI/CD
aurora analyze:architecture --output json > report.json
```

### Via API

```javascript
const aurora = require('@aurora/ai-framework');

await aurora.connect('http://localhost:4310', 'aurora_key');

const result = await aurora.review({
  file: 'src/App.tsx',
  focus: ['security', 'performance']
});

console.log(result.findings);
```

## 🏗️ Architecture

```
aurora/
├── core/           # Core Aurora engine
│   ├── daemon/     # Always-on daemon (KAIROS pattern)
│   ├── providers/  # LLM providers (Groq, Kimi, OpenRouter)
│   ├── memory/     # Memory system (Dream consolidation)
│   └── commands/   # Command handler
├── agents/         # Agent system
│   ├── tracker/    # Activity tracking
│   ├── bridge/     # Cross-agent communication
│   ├── functions/  # Reusable functions
│   └── learners/   # Auto-learning
├── mcp/            # MCP integration
│   ├── connectors/ # MCP configurations
│   └── servers/    # Custom MCP servers
├── skills/         # Knowledge & skills
│   ├── patterns/   # Design patterns
│   ├── knowledge/  # Knowledge base
│   └── research/   # Web research
├── cli/            # Command-line interface
├── api/            # HTTP API server
└── scripts/        # Utility scripts
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for full details.

## 🎓 Learnings from Claude Code

Aurora implements patterns extracted from the Claude Code architecture leak (March 31, 2026):

| Pattern | Claude Code | Aurora Implementation |
|---------|-------------|----------------------|
| Always-On Assistant | KAIROS | Aurora Daemon with proactive ticks |
| Multi-Agent | Coordinator Mode | Aurora Coordinator with 4 phases |
| Memory | Dream System | Aurora Dream with consolidation |
| Tools | 40+ tool registry | Aurora Tool Registry with caching |
| Permissions | ML auto-approval | Aurora Permissions with risk classification |
| Companion | Buddy | Aurora Buddy (optional) |

See [docs/CLAUDE_CODE_LEAK_ANALYSIS.md](docs/CLAUDE_CODE_LEAK_ANALYSIS.md) for full analysis.

## 🧪 Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run lint
npm run lint

# Start dev daemon
npm run daemon
```

## 📦 Migration from TradeShare

If you're migrating Aurora from a TradeShare monorepo:

```bash
# Run migration script
npm run migrate

# Verify migration
npm run health

# Test integration
npm run test:integration
```

See [AURORA_MIGRATION_PLAN.md](../AURORA_MIGRATION_PLAN.md) for detailed plan.

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Areas we're looking for help:

- 🧠 New AI provider integrations
- 🔌 MCP server implementations
- 📚 Knowledge base contributions
- 🎨 CLI UI improvements
- 🧪 Test coverage

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Patterns inspired by Claude Code architecture (analyzed from public leak)
- Built with learnings from 100+ AI agent frameworks
- Community contributions from TradeShare team

## 📞 Support

- **GitHub Issues:** https://github.com/iuratobraian/aurora-ai-framework/issues
- **Discord:** [coming soon]
- **Twitter:** [@aurora_ai](https://twitter.com/aurora_ai)

---

**Made with ❤️ by the Aurora Development Team**

*Last updated: 2026-04-01*
