# 🧠 AURORA PRO KNOWLEDGE BASE

**Classification:** PRO / ADVANCED  
**Date Created:** 2026-04-01  
**Last Updated:** 2026-04-01  
**Version:** 1.0.0

---

## 📚 KNOWLEDGE CATEGORIES

### 1. ARCHITECTURE PATTERNS

#### KAIROS Pattern (Always-On Assistant)
**Source:** Claude Code leak analysis  
**Implementation:** `aurora/core/kairos/aurora-kairos.mjs`

**Key Concepts:**
- Tick-based monitoring (5 min intervals)
- Proactive change detection (git, tasks, errors, files)
- Brief mode for minimal terminal flooding
- 15-second action timeout for non-blocking suggestions

**When to Use:**
- When you need proactive AI assistance
- When context continuity across sessions is critical
- When automatic suggestions add value

**Configuration:**
```javascript
{
  tickIntervalMs: 300000,        // 5 minutes
  actionTimeoutMs: 15000,        // 15 seconds
  briefMode: true,               // Minimal output
  enableNotifications: true,     // Show suggestions
  watchPaths: ['src/', 'convex/'] // Paths to monitor
}
```

**Pro Tips:**
- Adjust tick interval based on project activity
- Use brief mode in production, verbose in development
- Combine with Dream for memory persistence

---

#### Dream Pattern (Memory Consolidation)
**Source:** Claude Code leak analysis  
**Implementation:** `aurora/core/dream/aurora-dream.mjs`

**Key Concepts:**
- 4-phase consolidation: Orient → Gather → Consolidate → Prune
- Three-gate trigger: Time (24h) + Sessions (5) + Lock
- Maintains MEMORY.md under 200 lines / 25KB
- Automatic session tracking

**When to Use:**
- When long-term memory is needed
- When context grows too large for single session
- When knowledge distillation is valuable

**Configuration:**
```javascript
{
  timeGateMs: 86400000,          // 24 hours
  sessionGateCount: 5,           // Minimum sessions
  preventConcurrentDreams: true, // No parallel dreams
  maxMemoryLines: 200,           // Prune threshold
  maxMemorySizeKB: 25            // Size threshold
}
```

**Pro Tips:**
- Run dream during low-activity periods
- Keep sessions structured for better consolidation
- Review MEMORY.md periodically for accuracy

---

#### Coordinator Pattern (Multi-Agent Orchestration)
**Source:** Claude Code leak analysis  
**Implementation:** `aurora/core/coordinator/aurora-coordinator.mjs`

**Key Concepts:**
- 4-phase execution: Research → Synthesis → Implementation → Verification
- Parallel worker spawning (max 5 concurrent)
- Shared state via scratch directory
- Configurable timeouts per phase

**When to Use:**
- Complex multi-step tasks
- When parallel execution adds value
- When verification is critical

**Configuration:**
```javascript
{
  phaseTimeouts: {
    research: 1800000,           // 30 min
    synthesis: 900000,           // 15 min
    implementation: 3600000,     // 60 min
    verification: 1200000        // 20 min
  },
  maxParallelWorkers: 5,         // Concurrent workers
  maxRetries: 2,                 // Failed worker retries
  useRealWorkers: true           // Real processes vs mock
}
```

**Worker Roles:**
- **Research:** codebase-explorer, pattern-matcher, dependency-analyzer, error-detector
- **Implementation:** implementer
- **Verification:** lint-checker, test-runner, type-checker, security-scanner

**Pro Tips:**
- Use mock workers for development/testing
- Adjust timeouts based on task complexity
- Monitor scratch directory for debugging

---

### 2. INTEGRATION PATTERNS

#### Compatibility Wrapper Pattern
**Purpose:** Maintain backward compatibility during separation

**Implementation:**
```javascript
// trade-share/scripts/aurora-inicio.mjs
import auroraInicio from '../../aurora/cli/aurora-inicio.mjs';
export default auroraInicio;
```

**When to Use:**
- When separating monolithic codebases
- When zero breaking changes required
- During gradual migration

**Pro Tips:**
- Add deprecation warnings in wrappers
- Document redirect paths clearly
- Plan wrapper removal timeline

---

#### HTTP API Integration Pattern
**Purpose:** External systems call Aurora

**Implementation:**
```javascript
POST http://localhost:4310/review
{
  file: 'src/App.tsx',
  context: { task: 'TSK-001' }
}
```

**Endpoints:**
- `/chat` - General chat
- `/review` - Code review
- `/analyze` - Deep analysis
- `/optimize` - Performance optimization
- `/memory` - Memory operations
- `/status` - System status

**Pro Tips:**
- Always include auth headers
- Use WebSocket for real-time updates
- Implement rate limiting

---

### 3. SEPARATION PATTERNS

#### Project Separation Strategy
**Source:** Aurora separation from TradeShare (2026-04-01)

**Phases:**
1. **Research** - Analyze what to separate
2. **Architecture** - Design new structure
3. **Migration** - Move files (131 files)
4. **Wrappers** - Create compatibility layer (20 wrappers)
5. **Documentation** - Write guides (5 docs)
6. **Sync Guide** - Team onboarding

**Metrics:**
- Files migrated: 131
- Wrappers created: 20
- Documentation pages: 5
- Breaking changes: 0
- Downtime: 0 minutes

**Pro Tips:**
- Commit frequently during migration
- Test after each phase
- Keep rollback option available

---

### 4. CLAUDE CODE LEARNINGS

**Source:** March 31, 2026 leak analysis  
**Repository:** Kuberwastaken/claude-code (4.2k stars)

**Extracted Patterns:**
1. **KAIROS** - Always-on proactive assistant
2. **Dream** - Background memory consolidation
3. **Coordinator** - Multi-agent orchestration
4. **Tool Registry** - 40+ tools with caching
5. **Permission System** - ML-based auto-approval
6. **Buddy** - Tamagotchi-style companion (optional)
7. **Undercover Mode** - Identity management for public repos

**Legal Considerations:**
- Do NOT copy exact code
- Adapt patterns, not implementations
- Clean room implementation required
- Document independent creation

---

### 5. PERFORMANCE PATTERNS

#### Memory Management
- Limit: 500MB heap
- Monitoring: Every tick
- Action: Suggest cleanup at 80%

#### Response Time Targets
- Simple commands: < 100ms
- Complex analysis: < 3s
- Multi-agent tasks: < 30 min

#### Caching Strategy
- Tool schemas: Cache indefinitely
- LLM responses: Cache 24h
- File reads: Cache until change detected

---

### 6. SECURITY PATTERNS

#### API Key Management
- Store in `.env.aurora`
- Never commit to git
- Rotate every 90 days

#### Command Sandboxing
- Block dangerous commands (`rm -rf`, `sudo`)
- Validate file paths
- Rate limit requests

#### Permission Levels
- **LOW:** Auto-approve
- **MEDIUM:** Prompt user
- **HIGH:** Require explicit confirmation

---

### 7. DEBUGGING PATTERNS

#### Common Issues

**Error: "Cannot find module"**
- Cause: Wrappers can't find Aurora
- Fix: Verify aurora/ directory exists, run `npm install`

**Error: "API_KEY not found"**
- Cause: Missing .env.aurora
- Fix: Copy .env.aurora.example, add keys

**Error: "Port already in use"**
- Cause: Aurora API already running
- Fix: Kill process or change port

**Error: "Dream not triggering"**
- Cause: Gates not passed
- Fix: Wait 24h + 5 sessions, or use `npm run dream:force`

---

### 8. BEST PRACTICES

#### Development
- Use mock workers for testing
- Enable debug logging
- Run dream manually after major changes

#### Production
- Enable brief mode
- Set appropriate memory limits
- Monitor health metrics

#### Team Coordination
- Sync with Notion for task tracking
- Use AGENT_LOG.md for activity log
- Create CURRENT_FOCUS.md for active work

---

## 📖 REFERENCES

- `docs/CLAUDE_CODE_LEAK_ANALYSIS.md` - Full leak analysis
- `aurora/ARCHITECTURE.md` - Technical architecture
- `aurora/README.md` - User documentation
- `AURORA_SEPARATION_COMPLETE.md` - Separation summary
- `AURORA_SEPARATION_SYNC_GUIDE.md` - Team sync guide

---

**Knowledge Base Version:** 1.0.0  
**Maintained By:** Aurora Development Team  
**Access Level:** PRO
