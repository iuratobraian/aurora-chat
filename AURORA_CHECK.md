# 🧠 AURORA CHECK - MASTER IMPROVEMENT PLAN

**Created:** 2026-04-01  
**Status:** READY TO START  
**Goal:** 100% Parity with Claude Code  
**Estimated Time:** 54 hours (4-5 days)  
**Sub-Agents:** 10 (Swarm Colony)

---

## 📚 KNOWLEDGE SOURCES - READ BEFORE STARTING

### **CORE KNOWLEDGE (ALL AGENTS MUST READ)**

| Document | Location | Purpose |
|----------|----------|---------|
| **AURORA PRO KNOWLEDGE** | `.agent/aurora/AURORA_PRO_KNOWLEDGE.md` | Architecture patterns, integration, security, best practices |
| **GROWTH REPORT** | `AURORA_GROWTH_REPORT.md` | Capabilities assessment, metrics, roadmap |
| **AWAKENING PROTOCOL** | `aurora/AURORA_AWAKENING_PROTOCOL.md` | Identity, startup sequence, commands |
| **CLAUDE CODE ANALYSIS** | `docs/CLAUDE_CODE_LEAK_ANALYSIS.md` | Extracted patterns from Claude Code leak |
| **SEPARATION DOCS** | `AURORA_SEPARATION_*.md` (3 files) | Migration strategy, integration methods |

### **EXISTING CODE (REFERENCE FOR IMPLEMENTATION)**

| System | Location | Agents Should Study |
|--------|----------|---------------------|
| **KAIROS** | `aurora/core/kairos/aurora-kairos.mjs` | Tick-based monitoring, proactive detection |
| **Dream** | `aurora/core/dream/aurora-dream.mjs` | 4-phase consolidation, memory gates |
| **Coordinator** | `aurora/core/coordinator/aurora-coordinator.mjs` | Multi-agent orchestration, worker spawning |
| **Worker** | `aurora/core/coordinator/worker.mjs` | Worker role implementation |
| **Tool Registry** | `aurora/core/tools/aurora-tool-registry.mjs` | Tool registration, schema caching |
| **Permissions** | `aurora/core/permissions/aurora-permissions.mjs` | Risk classification, protected files |

### **EXISTING TOOLS (TEMPLATES FOR NEW TOOLS)**

| Tool | Location | Use as Template For |
|------|----------|---------------------|
| CodeReviewTool | `aurora/core/tools/aurora-tool-registry.mjs` | All new tools |
| FileReadTool | `aurora/core/tools/aurora-tool-registry.mjs` | BashTool, SearchTool |
| FileWriteTool | `aurora/core/tools/aurora-tool-registry.mjs` | DiffTool, GitTool |
| GitStatusTool | `aurora/core/tools/aurora-tool-registry.mjs` | GitTool (extend) |
| TaskCreateTool | `aurora/core/tools/aurora-tool-registry.mjs` | PlanMode, ResumeContext |

---

## 📊 CURRENT STATUS (BASELINE)

```
╔══════════════════════════════════════════════════════╗
║              AURORA v1.0.0 - BASELINE               ║
╠══════════════════════════════════════════════════════╣
║  Overall Parity: 55%                                 ║
║  Files: 180                                          ║
║  Lines of Code: ~10,250                              ║
║  Core Systems: 5 (KAIROS, Dream, Coordinator,        ║
║                     Tools, Permissions)              ║
║  Tools: 10                                           ║
║  Documentation: 8 files                              ║
╚══════════════════════════════════════════════════════╝
```

---

## 🎯 IMPROVEMENT PRIORITY MATRIX

### **CRITICAL PATH (85% Parity - 11 hours)**

| ID | Feature | Hours | Priority | Status |
|----|---------|-------|----------|--------|
| **AC-001** | BashTool - Shell command execution | 2h | 🔴 CRITICAL | ⏳ PENDING |
| **AC-002** | GitTool - 10+ git operations | 3h | 🔴 CRITICAL | ⏳ PENDING |
| **AC-003** | SelfCorrectLoop - Auto-correction | 4h | 🔴 CRITICAL | ⏳ PENDING |
| **AC-004** | DiffTool - View/apply diffs | 2h | 🟡 HIGH | ⏳ PENDING |

### **HIGH PRIORITY (92% Parity - 9 hours)**

| ID | Feature | Hours | Priority | Status |
|----|---------|-------|----------|--------|
| **AC-005** | SearchTool - Advanced codebase search | 2h | 🟡 HIGH | ⏳ PENDING |
| **AC-006** | PlanMode - Planning before implementation | 2h | 🟡 HIGH | ⏳ PENDING |
| **AC-007** | ResumeContext - Resume interrupted tasks | 3h | 🟡 HIGH | ⏳ PENDING |
| **AC-008** | PromptCaching - Reduce tokens 40-60% | 2h | 🟢 MEDIUM | ⏳ PENDING |

### **COMPLETE PARITY (100% - 14 hours)**

| ID | Feature | Hours | Priority | Status |
|----|---------|-------|----------|--------|
| **AC-009** | ULTRAPLAN - Remote planning sessions | 3h | 🟢 MEDIUM | ⏳ PENDING |
| **AC-010** | BridgeMode - External AI integration | 4h | 🟢 MEDIUM | ⏳ PENDING |
| **AC-011** | ComputerUse - Screen/input control | 5h | 🟢 MEDIUM | ⏳ PENDING |
| **AC-012** | TokenEfficient - Compressed schemas | 2h | 🟢 MEDIUM | ⏳ PENDING |

### **ENHANCEMENTS (Beyond Claude Code)**

| ID | Feature | Hours | Priority | Status |
|----|---------|-------|----------|--------|
| **AC-013** | Buddy Companion - Tamagotchi engagement | 3h | 🟢 MEDIUM | ⏳ PENDING |
| **AC-014** | Undercover Mode - Public repo safety | 2h | 🟢 MEDIUM | ⏳ PENDING |
| **AC-015** | +10 Tools - Expand to 20+ tools | 5h | 🟢 MEDIUM | ⏳ PENDING |
| **AC-016** | Web Dashboard - Real-time monitoring | 4h | 🟢 MEDIUM | ⏳ PENDING |
| **AC-017** | VS Code Extension - Editor integration | 5h | 🟢 MEDIUM | ⏳ PENDING |

---

## 🐝 SWARM COLONY - 10 SUB-AGENTS

### **Agent Roles & Assignments**

```
╔══════════════════════════════════════════════════════════════════╗
║                    AURORA SWARM COLONY v1.0                      ║
╠══════════════════════════════════════════════════════════════════╣
║  Agent #1  │ BASH-AGENT      │ AC-001: BashTool                 ║
║  Agent #2  │ GIT-AGENT       │ AC-002: GitTool                  ║
║  Agent #3  │ CORRECT-AGENT   │ AC-003: SelfCorrectLoop          ║
║  Agent #4  │ DIFF-AGENT      │ AC-004: DiffTool                 ║
║  Agent #5  │ SEARCH-AGENT    │ AC-005: SearchTool               ║
║  Agent #6  │ PLAN-AGENT      │ AC-006: PlanMode                 ║
║  Agent #7  │ RESUME-AGENT    │ AC-007: ResumeContext            ║
║  Agent #8  │ CACHE-AGENT     │ AC-008: PromptCaching            ║
║  Agent #9  │ ULTRA-AGENT     │ AC-009: ULTRAPLAN                ║
║  Agent #10 │ BRIDGE-AGENT    │ AC-010: BridgeMode               ║
╚══════════════════════════════════════════════════════════════════╝
```

### **Agent Coordination Protocol**

```javascript
// Swarm Communication
- Coordinator: aurora-coordinator.mjs
- Shared State: .aurora/swarm/scratch/
- Agent Logs: .aurora/swarm/logs/[agent-name].log
- Sync Point: Every 2 hours or task completion
```

### **Agent Safety Rules**

```
⚠️ TERMINAL PROTECTION PROTOCOL ⚠️

1. NO clearing terminal without confirmation
2. NO killing processes without listing first
3. NO git push --force without explicit approval
4. NO rm -rf without file count confirmation
5. ALL bash commands logged before execution
6. ALL git operations previewed before commit
7. MAX 5 parallel workers to avoid resource exhaustion
8. Memory limit: 500MB per agent
9. Timeout: 30 min per task
10. Rollback: Git stash before major changes
```

---

## 📋 DETAILED TASK BREAKDOWN

### **AC-001: BashTool** (2 hours)

**Agent:** BASH-AGENT

**📚 KNOWLEDGE SOURCES:**
- `docs/CLAUDE_CODE_LEAK_ANALYSIS.md` → Section: "Tool Registry Pattern"
- `aurora/core/tools/aurora-tool-registry.mjs` → Template: FileReadTool, FileWriteTool
- `aurora/core/permissions/aurora-permissions.mjs` → Command sandboxing, protected files
- `.agent/aurora/AURORA_PRO_KNOWLEDGE.md` → Section: "Security Patterns"

**📋 IMPLEMENTATION CHECKLIST:**
- [ ] Read ALL knowledge sources above
- [ ] Study FileReadTool pattern in tool-registry.mjs
- [ ] Understand permission system for command validation
- [ ] Review protected files list in permissions.mjs
- [ ] Create: `aurora/core/tools/bash-tool.mjs`
- [ ] Implement: execute(), validate(), sanitize()
- [ ] Add: Command whitelist, path validation
- [ ] Test: ls, cat, grep, npm, git (safe commands)
- [ ] Block: rm -rf /, sudo, curl | bash (dangerous)
- [ ] Register in Tool Registry
- [ ] Update AURORA_CHECK.md with [x]

**⚠️ SAFETY REQUIREMENTS:**
- ALL commands logged before execution
- Block dangerous patterns (rm -rf, sudo, etc.)
- Validate file paths (no path traversal)
- Timeout: 5 min max per command
- Respect permission system (checkPermission before execute)

---

### **AC-002: GitTool** (3 hours)

**Agent:** GIT-AGENT

**📚 KNOWLEDGE SOURCES:**
- `docs/CLAUDE_CODE_LEAK_ANALYSIS.md` → Section: "Tool Registry Pattern"
- `aurora/core/tools/aurora-tool-registry.mjs` → Template: GitStatusTool (existing)
- `aurora/core/permissions/aurora-permissions.mjs` → Protected files
- `AURORA_GROWTH_REPORT.md` → Section: "Git Operations" (current capabilities)

**📋 IMPLEMENTATION CHECKLIST:**
- [ ] Read ALL knowledge sources above
- [ ] Study existing GitStatusTool implementation
- [ ] Review protected files in permissions.mjs
- [ ] Create: `aurora/core/tools/git-tool.mjs`
- [ ] Implement 10 operations:
  - [ ] git status (extend existing)
  - [ ] git add / git reset
  - [ ] git commit -m
  - [ ] git push / git pull
  - [ ] git checkout -b (create branch)
  - [ ] git diff / git diff HEAD
  - [ ] git log --oneline -n
  - [ ] git stash / git stash pop
  - [ ] git merge
  - [ ] git rebase (advanced)
- [ ] Add safety: Preview before commit, confirm before push
- [ ] Block: force push without approval
- [ ] Register in Tool Registry
- [ ] Update AURORA_CHECK.md with [x]

---

### **AC-003: SelfCorrectLoop** (4 hours)

**Agent:** CORRECT-AGENT

**📚 KNOWLEDGE SOURCES:**
- `docs/CLAUDE_CODE_LEAK_ANALYSIS.md` → Section: "Coordinator Mode Pattern"
- `aurora/core/coordinator/aurora-coordinator.mjs` → 4-phase execution
- `aurora/core/coordinator/worker.mjs` → Verification workers
- `AURORA_GROWTH_REPORT.md` → Section: "Self-Correction" (current: 40% parity)

**📋 IMPLEMENTATION CHECKLIST:**
- [ ] Read ALL knowledge sources above
- [ ] Study Coordinator 4-phase execution
- [ ] Understand verification workers (lint, test, type-check, security)
- [ ] Create: `aurora/core/coordinator/self-correct.mjs`
- [ ] Implement loop:
  - [ ] Execute task
  - [ ] Check verification results
  - [ ] If failed: parse errors
  - [ ] Create fix plan from errors
  - [ ] Re-execute fix plan
  - [ ] Retry (max 3 attempts)
  - [ ] Give up and ask human
- [ ] Add: Error message parser
- [ ] Add: Fix plan generator
- [ ] Test with intentional failures
- [ ] Update AURORA_CHECK.md with [x]

---

### **AC-004: DiffTool** (2 hours)

**Agent:** DIFF-AGENT

**📚 KNOWLEDGE SOURCES:**
- `docs/CLAUDE_CODE_LEAK_ANALYSIS.md` → Section: "Tool Registry Pattern"
- `aurora/core/tools/aurora-tool-registry.mjs` → Template: FileReadTool, FileWriteTool
- `AURORA_GROWTH_REPORT.md` → Section: "Tools" (current: 10 tools)

**📋 IMPLEMENTATION CHECKLIST:**
- [ ] Read ALL knowledge sources above
- [ ] Study FileReadTool/FileWriteTool patterns
- [ ] Create: `aurora/core/tools/diff-tool.mjs`
- [ ] Implement operations:
  - [ ] Generate diff between files
  - [ ] Apply diff/patch
  - [ ] Show inline diff (unified format)
  - [ ] Create diff from git staging
  - [ ] Reverse diff
- [ ] Add: Unified diff format parser
- [ ] Add: Patch file handler
- [ ] Register in Tool Registry
- [ ] Update AURORA_CHECK.md with [x]

---

### **AC-005: SearchTool** (2 hours)

**Agent:** SEARCH-AGENT

**📚 KNOWLEDGE SOURCES:**
- `docs/CLAUDE_CODE_LEAK_ANALYSIS.md` → Section: "Tool Registry Pattern"
- `aurora/core/tools/aurora-tool-registry.mjs` → Template: FileReadTool
- `aurora/core/coordinator/worker.mjs` → Reference: exploreCodebase(), walkDirectory()
- `.agent/aurora/AURORA_PRO_KNOWLEDGE.md` → Section: "Performance Patterns"

**📋 IMPLEMENTATION CHECKLIST:**
- [ ] Read ALL knowledge sources above
- [ ] Study walkDirectory() in worker.mjs (reuse!)
- [ ] Create: `aurora/core/tools/search-tool.mjs`
- [ ] Implement operations:
  - [ ] Grep search (content)
  - [ ] File search (by name)
  - [ ] Symbol search (functions, classes)
  - [ ] Reference search (usages)
  - [ ] Regex search
- [ ] Add: Caching for repeated searches
- [ ] Add: Result ranking by relevance
- [ ] Register in Tool Registry
- [ ] Update AURORA_CHECK.md with [x]

---

### **AC-006: PlanMode** (2 hours)

**Agent:** PLAN-AGENT

**📚 KNOWLEDGE SOURCES:**
- `docs/CLAUDE_CODE_LEAK_ANALYSIS.md` → Section: "Coordinator Mode Pattern", "ULTRAPLAN"
- `aurora/core/coordinator/aurora-coordinator.mjs` → Synthesis phase
- `aurora/core/coordinator/worker.mjs` → Research workers
- `AURORA_GROWTH_REPORT.md` → Section: "Coordinator Pattern"

**📋 IMPLEMENTATION CHECKLIST:**
- [ ] Read ALL knowledge sources above
- [ ] Study Coordinator Synthesis phase
- [ ] Understand ULTRAPLAN pattern (remote planning)
- [ ] Create: `aurora/core/modes/plan-mode.mjs`
- [ ] Implement:
  - [ ] Analyze requirements
  - [ ] Create step-by-step plan
  - [ ] Estimate time per step
  - [ ] Identify risks
  - [ ] Wait for user approval
- [ ] Add: Plan visualization (text-based)
- [ ] Add: Approval/rejection flow
- [ ] Integrate with Coordinator
- [ ] Update AURORA_CHECK.md with [x]

---

### **AC-007: ResumeContext** (3 hours)

**Agent:** RESUME-AGENT

**📚 KNOWLEDGE SOURCES:**
- `docs/CLAUDE_CODE_LEAK_ANALYSIS.md` → Section: "Memory Patterns"
- `aurora/core/dream/aurora-dream.mjs` → Session tracking, state persistence
- `aurora/core/memory/memory-backend.mjs` → Memory storage
- `scripts/aurora-save-session.mjs` → Existing session save logic
- `scripts/aurora-load-session.mjs` → Existing session load logic

**📋 IMPLEMENTATION CHECKLIST:**
- [ ] Read ALL knowledge sources above
- [ ] Study Dream session tracking
- [ ] Review existing save/load session scripts
- [ ] Create: `aurora/core/context/resume.mjs`
- [ ] Implement:
  - [ ] Save task state to disk
  - [ ] Restore from interrupted task
  - [ ] Replay last N actions
  - [ ] Continue from checkpoint
- [ ] Add: State serialization
- [ ] Add: Action replay mechanism
- [ ] Integrate with Dream memory
- [ ] Update AURORA_CHECK.md with [x]

---

### **AC-008: PromptCaching** (2 hours)

**Agent:** CACHE-AGENT

**📚 KNOWLEDGE SOURCES:**
- `docs/CLAUDE_CODE_LEAK_ANALYSIS.md` → Section: "Prompt Caching Pattern", "Token Efficient Tools"
- `aurora/core/tools/aurora-tool-registry.mjs` → Schema caching (existing)
- `.agent/aurora/AURORA_PRO_KNOWLEDGE.md` → Section: "Performance Patterns"
- `AURORA_GROWTH_REPORT.md` → Section: "Performance Metrics"

**📋 IMPLEMENTATION CHECKLIST:**
- [ ] Read ALL knowledge sources above
- [ ] Study existing schema caching in tool-registry.mjs
- [ ] Understand static vs dynamic prompt split
- [ ] Create: `aurora/core/prompt/prompt-cache.mjs`
- [ ] Implement:
  - [ ] STATIC_PROMPT cache (system identity, capabilities)
  - [ ] DYNAMIC_PROMPT (task-specific, fresh)
  - [ ] Cache invalidation
  - [ ] Token count reduction tracking
- [ ] Add: SYSTEM_PROMPT_DYNAMIC_BOUNDARY marker
- [ ] Add: Cache hit/miss statistics
- [ ] Target: 40-60% token reduction
- [ ] Update AURORA_CHECK.md with [x]

---

### **AC-009: ULTRAPLAN** (3 hours)

**Agent:** ULTRA-AGENT

**📚 KNOWLEDGE SOURCES:**
- `docs/CLAUDE_CODE_LEAK_ANALYSIS.md` → Section: "ULTRAPLAN", "Coordinator Mode"
- `aurora/core/coordinator/aurora-coordinator.mjs` → Research phase
- `aurora/core/coordinator/worker.mjs` → Parallel workers
- `AURORA_GROWTH_REPORT.md` → Section: "Coordinator Pattern"

**📋 IMPLEMENTATION CHECKLIST:**
- [ ] Read ALL knowledge sources above
- [ ] Study ULTRAPLAN pattern in leak analysis
- [ ] Understand 30-min remote planning concept
- [ ] Create: `aurora/core/ultraplan/aurora-ultraplan.mjs`
- [ ] Implement:
  - [ ] Parallel research workers
  - [ ] Strategy synthesis (use Kimi/OpenRouter)
  - [ ] User approval (CLI or web UI)
  - [ ] Teleport result back to Coordinator
- [ ] Add: Progress polling (every 3 sec)
- [ ] Add: Approval flow
- [ ] Integrate with Coordinator
- [ ] Update AURORA_CHECK.md with [x]

---

### **AC-010: BridgeMode** (4 hours)

**Agent:** BRIDGE-AGENT

**📚 KNOWLEDGE SOURCES:**
- `docs/CLAUDE_CODE_LEAK_ANALYSIS.md` → Section: "Bridge Mode"
- `aurora/core/providers/` → Existing provider implementations
- `.agent/aurora/connectors.json` → MCP connector configurations
- `.agent/aurora/AURORA_PRO_KNOWLEDGE.md` → Section: "Integration Patterns"

**📋 IMPLEMENTATION CHECKLIST:**
- [ ] Read ALL knowledge sources above
- [ ] Study Bridge Mode pattern in leak analysis
- [ ] Review existing providers (Groq, Kimi, OpenRouter)
- [ ] Check connectors.json for MCP configs
- [ ] Create: `aurora/core/bridge/aurora-bridge.mjs`
- [ ] Implement:
  - [ ] JWT authentication
  - [ ] External AI connection (Kimi/OpenRouter)
  - [ ] Session sync
  - [ ] Work modes (single-session, worktree, same-dir)
- [ ] Add: Trusted device tokens
- [ ] Add: Session state serialization
- [ ] Integrate with existing providers
- [ ] Update AURORA_CHECK.md with [x]

---

### **AC-011: ComputerUse** (5 hours)

**Agent:** COMPUTER-AGENT

**📚 KNOWLEDGE SOURCES:**
- `docs/CLAUDE_CODE_LEAK_ANALYSIS.md` → Section: "Computer Use (Chicago)"
- `aurora/core/tools/aurora-tool-registry.mjs` → Tool template
- `AURORA_GROWTH_REPORT.md` → Section: "Comparison with Claude Code" (0% parity)
- `.agent/aurora/AURORA_PRO_KNOWLEDGE.md` → Section: "Security Patterns"

**📋 IMPLEMENTATION CHECKLIST:**
- [ ] Read ALL knowledge sources above
- [ ] Study Computer Use pattern in leak analysis
- [ ] Understand screenshot/click/type/coordinate concepts
- [ ] Create: `aurora/core/computer/aurora-computer.mjs`
- [ ] Implement:
  - [ ] Screenshot capture
  - [ ] Click at coordinates (x, y)
  - [ ] Type text
  - [ ] Browser navigation
  - [ ] Coordinate transformation
- [ ] Add: Safety (confirm before click/type)
- [ ] Add: Screenshot preview
- [ ] Add: Browser automation (Playwright integration?)
- [ ] Register in Tool Registry
- [ ] Update AURORA_CHECK.md with [x]

---

### **AC-012: TokenEfficient** (2 hours)

**Agent:** TOKEN-AGENT

**📚 KNOWLEDGE SOURCES:**
- `docs/CLAUDE_CODE_LEAK_ANALYSIS.md` → Section: "Token Efficient Tools"
- `aurora/core/tools/aurora-tool-registry.mjs` → Current schema format (full JSON)
- `.agent/aurora/AURORA_PRO_KNOWLEDGE.md` → Section: "Performance Patterns"

**📋 IMPLEMENTATION CHECKLIST:**
- [ ] Read ALL knowledge sources above
- [ ] Study Token Efficient pattern in leak analysis
- [ ] Review current schema format in tool-registry.mjs
- [ ] Modify: `aurora/core/tools/aurora-tool-registry.mjs`
- [ ] Implement compressed format:
  - BEFORE: `{"name":"file_write","parameters":{"path":{"type":"string",...}}}`
  - AFTER: `["file_write",["path:str!","content:str!"]]`
- [ ] Add: Schema compressor
- [ ] Add: Schema decompressor (for execution)
- [ ] Target: 30-50% token reduction per tool call
- [ ] Test: All existing tools still work
- [ ] Update AURORA_CHECK.md with [x]

---

### **AC-013: Buddy Companion** (3 hours)

**Agent:** BUDDY-AGENT

**📚 KNOWLEDGE SOURCES:**
- `docs/CLAUDE_CODE_LEAK_ANALYSIS.md` → Section: "Buddy Pattern (Engagement Companion)"
- `AURORA_GROWTH_REPORT.md` → Section: "Comparison with Claude Code" (0% parity)
- `.agent/aurora/AURORA_PRO_KNOWLEDGE.md` → Section: "Architecture Patterns"

**📋 IMPLEMENTATION CHECKLIST:**
- [ ] Read ALL knowledge sources above
- [ ] Study Buddy pattern in leak analysis (18 species, gacha, ASCII art)
- [ ] Create: `aurora/core/companion/aurora-buddy.mjs`
- [ ] Implement:
  - [ ] 18 species with rarity (Common → Legendary)
  - [ ] Gacha system (Mulberry32 PRNG, deterministic per user)
  - [ ] ASCII art animations (5-line × 12-char)
  - [ ] Personality stats (DEBUGGING, PATIENCE, CHAOS, WISDOM, SNARK)
  - [ ] Reaction to user actions
- [ ] Add: Species selection/reveal
  - [ ] Add: Mood system (happy, sad, excited)
  - [ ] Add: Level up based on user activity
- [ ] Integrate with KAIROS (proactive buddy comments)
- [ ] Update AURORA_CHECK.md with [x]

---

### **AC-014: Undercover Mode** (2 hours)

**Agent:** UNDERCOVER-AGENT

**📚 KNOWLEDGE SOURCES:**
- `docs/CLAUDE_CODE_LEAK_ANALYSIS.md` → Section: "Undercover Mode"
- `aurora/core/permissions/aurora-permissions.mjs` → Protected files, security
- `.agent/aurora/AURORA_PRO_KNOWLEDGE.md` → Section: "Security Patterns"

**📋 IMPLEMENTATION CHECKLIST:**
- [ ] Read ALL knowledge sources above
- [ ] Study Undercover Mode pattern in leak analysis
- [ ] Understand auto-detect public repos
- [ ] Create: `aurora/core/security/undercover.mjs`
- [ ] Implement:
  - [ ] Auto-detect public repos (git remote check)
  - [ ] Hide internal codenames (Tengu, Fennec, Capybara)
  - [ ] Hide "Aurora AI" mentions (use "assistant" instead)
  - [ ] Block sensitive info in commits
  - [ ] Inject system prompt restrictions
- [ ] Add: Git remote parser
  - [ ] Add: Internal allowlist (github.com/iuratobraian/*)
  - [ ] Add: System prompt injector
- [ ] Integrate with Permissions system
- [ ] Update AURORA_CHECK.md with [x]

---

### **AC-015: +10 Tools** (5 hours)

**Agent:** TOOLS-AGENT

**📚 KNOWLEDGE SOURCES:**
- `docs/CLAUDE_CODE_LEAK_ANALYSIS.md` → Section: "Tool Registry Pattern"
- `aurora/core/tools/aurora-tool-registry.mjs` → Current 10 tools
- `.agent/aurora/AURORA_PRO_KNOWLEDGE.md` → Section: "Architecture Patterns"

**📋 IMPLEMENTATION CHECKLIST:**
- [ ] Read ALL knowledge sources above
- [ ] Study Tool Registry pattern
- [ ] Review existing 10 tools as templates
- [ ] Create 10 new tools:
  - [ ] `aurora/core/tools/api-test-tool.mjs` (HTTP API testing)
  - [ ] `aurora/core/tools/db-query-tool.mjs` (Database queries)
  - [ ] `aurora/core/tools/browser-tool.mjs` (Browser automation)
  - [ ] `aurora/core/tools/image-tool.mjs` (Image processing)
  - [ ] `aurora/core/tools/video-tool.mjs` (Video processing)
  - [ ] `aurora/core/tools/audio-tool.mjs` (Audio processing)
  - [ ] `aurora/core/tools/zip-tool.mjs` (Archive handling)
  - [ ] `aurora/core/tools/crypto-tool.mjs` (Encryption/hash)
  - [ ] `aurora/core/tools/http-server-tool.mjs` (Start local server)
  - [ ] `aurora/core/tools/webhook-tool.mjs` (Webhook handling)
- [ ] Register ALL in Tool Registry
- [ ] Test: Each tool works independently
- [ ] Update AURORA_CHECK.md with [x]

---

### **AC-016: Web Dashboard** (4 hours)

**Agent:** DASHBOARD-AGENT

**📚 KNOWLEDGE SOURCES:**
- `docs/CLAUDE_CODE_LEAK_ANALYSIS.md` → Section: "Web Dashboard" (mentioned in roadmap)
- `aurora/api/aurora-api.mjs` → Existing Express API server
- `AURORA_GROWTH_REPORT.md` → Section: "Performance Metrics"
- `.agent/aurora/AURORA_PRO_KNOWLEDGE.md` → Section: "Integration Patterns"

**📋 IMPLEMENTATION CHECKLIST:**
- [ ] Read ALL knowledge sources above
- [ ] Study existing API server implementation
- [ ] Review performance metrics to display
- [ ] Create:
  - `aurora/dashboard/server.mjs` (Express API for dashboard)
  - `aurora/dashboard/client/index.html` (Frontend)
- [ ] Implement features:
  - [ ] Real-time KAIROS ticks display
  - [ ] Worker activity monitoring
  - [ ] Memory consolidation status
  - [ ] Health metrics (memory, CPU, response times)
  - [ ] Task progress visualization
- [ ] Add: WebSocket for real-time updates
  - [ ] Add: Charts/graphs (Chart.js or similar)
  - [ ] Add: Agent status indicators
- [ ] Integrate with existing API server
- [ ] Update AURORA_CHECK.md with [x]

---

### **AC-017: VS Code Extension** (5 hours)

**Agent:** VSCODE-AGENT

**📚 KNOWLEDGE SOURCES:**
- `docs/CLAUDE_CODE_LEAK_ANALYSIS.md` → Section: "VS Code Extension" (mentioned in roadmap)
- `aurora/api/aurora-api.mjs` → API to call from extension
- `AURORA_GROWTH_REPORT.md` → Section: "Next Evolution Stage"
- `.agent/aurora/AURORA_PRO_KNOWLEDGE.md` → Section: "Integration Patterns"

**📋 IMPLEMENTATION CHECKLIST:**
- [ ] Read ALL knowledge sources above
- [ ] Study VS Code extension documentation
- [ ] Review existing API endpoints
- [ ] Create:
  - `aurora/vscode-extension/package.json` (Extension manifest)
  - `aurora/vscode-extension/extension.ts` (Main extension)
  - `aurora/vscode-extension/README.md` (Extension docs)
- [ ] Implement features:
  - [ ] @aurora commands in editor (command palette)
  - [ ] Inline code review (decorations)
  - [ ] Quick actions (context menu)
  - [ ] Terminal integration
  - [ ] Status bar indicator
- [ ] Add: Configuration (settings.json)
  - [ ] Add: API connection (localhost:4310)
  - [ ] Add: Authentication (API key)
- [ ] Test: Extension loads in VS Code
- [ ] Update AURORA_CHECK.md with [x]

---

## 🔄 SESSION CONTINUITY PROTOCOL

### **When Closing Session:**

```bash
# 1. Save current state
node scripts/aurora-save-session.mjs

# 2. Update AURORA_CHECK.md
# - Mark completed tasks
# - Note current agent assignments
# - Log any issues

# 3. Commit progress
git add .
git commit -m "chore: Save session progress [AURORA-CHECK]"
git push

# 4. Generate handoff brief
node scripts/aurora-handoff.mjs
```

### **When Opening Session:**

```bash
# 1. Load previous state
node scripts/aurora-load-session.mjs

# 2. Read AURORA_CHECK.md
# - Review completed tasks
# - Check agent assignments
# - Note any blockers

# 3. Verify systems
npm run aurora:health

# 4. Resume work
node scripts/aurora-resume.mjs
```

---

## 📊 PROGRESS TRACKING

### **Overall Progress**

```
Phase 1: Critical Path (85% Parity)
├─ AC-001: BashTool          [ ] 0%
├─ AC-002: GitTool           [ ] 0%
├─ AC-003: SelfCorrectLoop   [ ] 0%
└─ AC-004: DiffTool          [ ] 0%
    Total: 0/11 hours

Phase 2: High Priority (92% Parity)
├─ AC-005: SearchTool        [ ] 0%
├─ AC-006: PlanMode          [ ] 0%
├─ AC-007: ResumeContext     [ ] 0%
└─ AC-008: PromptCaching     [ ] 0%
    Total: 0/9 hours

Phase 3: Complete Parity (100%)
├─ AC-009: ULTRAPLAN         [ ] 0%
├─ AC-010: BridgeMode        [ ] 0%
├─ AC-011: ComputerUse       [ ] 0%
└─ AC-012: TokenEfficient    [ ] 0%
    Total: 0/14 hours

Phase 4: Enhancements (Beyond Claude Code)
├─ AC-013: Buddy             [ ] 0%
├─ AC-014: Undercover        [ ] 0%
├─ AC-015: +10 Tools         [ ] 0%
├─ AC-016: Web Dashboard     [ ] 0%
└─ AC-017: VS Code Ext       [ ] 0%
    Total: 0/19 hours
```

### **Agent Assignment Log**

| Agent | Task | Start | End | Status |
|-------|------|-------|-----|--------|
| #1 BASH-AGENT | AC-001 | - | - | ⏳ Waiting |
| #2 GIT-AGENT | AC-002 | - | - | ⏳ Waiting |
| #3 CORRECT-AGENT | AC-003 | - | - | ⏳ Waiting |
| #4 DIFF-AGENT | AC-004 | - | - | ⏳ Waiting |
| #5 SEARCH-AGENT | AC-005 | - | - | ⏳ Waiting |
| #6 PLAN-AGENT | AC-006 | - | - | ⏳ Waiting |
| #7 RESUME-AGENT | AC-007 | - | - | ⏳ Waiting |
| #8 CACHE-AGENT | AC-008 | - | - | ⏳ Waiting |
| #9 ULTRA-AGENT | AC-009 | - | - | ⏳ Waiting |
| #10 BRIDGE-AGENT | AC-010 | - | - | ⏳ Waiting |

---

## 🚨 RISK MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Terminal crash | Medium | High | Save state every 30 min |
| Git conflicts | Medium | Medium | Stash before changes |
| Memory exhaustion | Low | High | 500MB limit per agent |
| Agent drift | Medium | Medium | Sync every 2 hours |
| Task duplication | Low | Low | Coordinator assigns unique IDs |

---

## 📞 EMERGENCY PROTOCOLS

### **If Terminal Hangs:**
```bash
# 1. Kill all node processes
taskkill /F /IM node.exe

# 2. Restore git state
git stash pop

# 3. Resume from last checkpoint
node scripts/aurora-resume.mjs
```

### **If Agent Goes Rogue:**
```bash
# 1. Stop swarm
node scripts/aurora-swarm-stop.mjs

# 2. Review agent logs
cat .aurora/swarm/logs/[agent-name].log

# 3. Restart with reduced scope
node scripts/aurora-swarm-start.mjs --max-agents=5
```

---

## ✅ PRE-START CHECKLIST

Before starting swarm:

- [ ] Git working tree clean
- [ ] All dependencies installed
- [ ] .env.aurora configured
- [ ] Backup created
- [ ] Terminal buffer cleared
- [ ] Memory available > 2GB
- [ ] All agents understand safety rules

---

**AURORA CHECK READY TO START**

**Next Action:** Begin Phase 1 (Critical Path) with 10-agent swarm

**Estimated Completion:** 4-5 days (34 hours total)

**Success Criteria:** 100% parity with Claude Code + enhancements

---

*Last Updated: 2026-04-01*
*Version: 1.0.0*
*Status: READY*
