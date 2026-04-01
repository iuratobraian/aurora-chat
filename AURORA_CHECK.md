# 🧠 AURORA CHECK - MASTER IMPROVEMENT PLAN

**Created:** 2026-04-01  
**Status:** READY TO START  
**Goal:** 100% Parity with Claude Code  
**Estimated Time:** 34 hours (4-5 days)  
**Sub-Agents:** 10 (Swarm Colony)

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

**Files to Create:**
- `aurora/core/tools/bash-tool.mjs`

**Implementation:**
```javascript
class BashTool {
  async execute(command, options = {}) {
    // - Validate command (block dangerous)
    // - Execute via child_process
    // - Capture stdout/stderr
    // - Return { output, exitCode, error }
  }
}
```

**Safety Checks:**
- [ ] Block: `rm -rf /`, `sudo`, `curl | bash`
- [ ] Validate: file paths, command whitelist
- [ ] Log: all commands before execution
- [ ] Timeout: 5 min max per command

**Acceptance Criteria:**
- [ ] Can execute `ls`, `cat`, `grep`, `npm`, `git`
- [ ] Returns stdout/stderr correctly
- [ ] Handles errors gracefully
- [ ] Respects permission system

---

### **AC-002: GitTool** (3 hours)

**Files to Create:**
- `aurora/core/tools/git-tool.mjs`

**Operations:**
- [ ] `git status` (existing)
- [ ] `git add` / `git reset`
- [ ] `git commit -m`
- [ ] `git push` / `git pull`
- [ ] `git checkout -b` (create branch)
- [ ] `git diff` / `git diff HEAD`
- [ ] `git log --oneline -n`
- [ ] `git stash` / `git stash pop`
- [ ] `git merge`
- [ ] `git rebase`

**Safety Checks:**
- [ ] Preview changes before commit
- [ ] Require commit message
- [ ] Confirm before push
- [ ] Block force push without approval

---

### **AC-003: SelfCorrectLoop** (4 hours)

**Files to Create:**
- `aurora/core/coordinator/self-correct.mjs`

**Implementation:**
```javascript
class SelfCorrectLoop {
  async execute(task) {
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      const result = await coordinator.execute(task);
      
      if (result.verification.passed) {
        return result;
      }
      
      // Auto-correct
      const errors = result.verification.errors;
      const fixPlan = await this.createFixPlan(errors);
      await coordinator.execute(fixPlan);
      
      attempts++;
    }
    
    throw new Error('Max correction attempts reached');
  }
}
```

**Acceptance Criteria:**
- [ ] Detects test failures automatically
- [ ] Creates fix plan from error messages
- [ ] Re-runs verification after fix
- [ ] Gives up after 3 attempts (asks human)

---

### **AC-004: DiffTool** (2 hours)

**Files to Create:**
- `aurora/core/tools/diff-tool.mjs`

**Operations:**
- [ ] Generate diff between files
- [ ] Apply diff/patch
- [ ] Show inline diff (unified format)
- [ ] Create diff from git staging
- [ ] Reverse diff

---

### **AC-005: SearchTool** (2 hours)

**Files to Create:**
- `aurora/core/tools/search-tool.mjs`

**Operations:**
- [ ] Grep search (content)
- [ ] File search (by name)
- [ ] Symbol search (functions, classes)
- [ ] Reference search (usages)
- [ ] Regex search

---

### **AC-006: PlanMode** (2 hours)

**Files to Create:**
- `aurora/core/modes/plan-mode.mjs`

**Implementation:**
```javascript
class PlanMode {
  async create(task) {
    // - Analyze requirements
    // - Create step-by-step plan
    // - Estimate time per step
    // - Identify risks
    // - Wait for user approval
  }
}
```

---

### **AC-007: ResumeContext** (3 hours)

**Files to Create:**
- `aurora/core/context/resume.mjs`

**Features:**
- [ ] Save task state to disk
- [ ] Restore from interrupted task
- [ ] Replay last N actions
- [ ] Continue from checkpoint

---

### **AC-008: PromptCaching** (2 hours)

**Files to Create:**
- `aurora/core/prompt/prompt-cache.mjs`

**Implementation:**
```javascript
const STATIC_PROMPT = cache(`
  You are Aurora AI Framework...
  [Static content - cached]
`);

const DYNAMIC_PROMPT = `
  Current task: ${task.name}
  [Dynamic content - fresh]
`;
```

---

### **AC-009: ULTRAPLAN** (3 hours)

**Files to Create:**
- `aurora/core/ultraplan/aurora-ultraplan.mjs`

**Features:**
- [ ] 30-min remote planning
- [ ] Parallel research workers
- [ ] Strategy synthesis
- [ ] User approval (web/CLI)
- [ ] Teleport result back

---

### **AC-010: BridgeMode** (4 hours)

**Files to Create:**
- `aurora/core/bridge/aurora-bridge.mjs`

**Features:**
- [ ] JWT authentication
- [ ] External AI connection (Kimi/OpenRouter)
- [ ] Session sync
- [ ] Work modes (single-session, worktree)

---

### **AC-011: ComputerUse** (5 hours)

**Files to Create:**
- `aurora/core/computer/aurora-computer.mjs`

**Features:**
- [ ] Screenshot capture
- [ ] Click at coordinates
- [ ] Type text
- [ ] Browser navigation
- [ ] Coordinate transformation

---

### **AC-012: TokenEfficient** (2 hours)

**Files to Modify:**
- `aurora/core/tools/aurora-tool-registry.mjs`

**Implementation:**
```javascript
// Compressed schema format
["file_write", ["path:str!", "content:str!"]]
// Instead of full JSON schema
```

---

### **AC-013: Buddy Companion** (3 hours)

**Files to Create:**
- `aurora/core/companion/aurora-buddy.mjs`

**Features:**
- [ ] 18 species with rarity
- [ ] Gacha system (deterministic)
- [ ] ASCII art animations
- [ ] Personality stats
- [ ] Reaction to user actions

---

### **AC-014: Undercover Mode** (2 hours)

**Files to Create:**
- `aurora/core/security/undercover.mjs`

**Features:**
- [ ] Auto-detect public repos
- [ ] Hide internal codenames
- [ ] Hide "Aurora AI" mentions
- [ ] Block sensitive info in commits

---

### **AC-015: +10 Tools** (5 hours)

**Files to Create:**
- `aurora/core/tools/api-test-tool.mjs`
- `aurora/core/tools/db-query-tool.mjs`
- `aurora/core/tools/browser-tool.mjs`
- `aurora/core/tools/image-tool.mjs`
- `aurora/core/tools/video-tool.mjs`
- `aurora/core/tools/audio-tool.mjs`
- `aurora/core/tools/zip-tool.mjs`
- `aurora/core/tools/crypto-tool.mjs`
- `aurora/core/tools/http-server-tool.mjs`
- `aurora/core/tools/webhook-tool.mjs`

---

### **AC-016: Web Dashboard** (4 hours)

**Files to Create:**
- `aurora/dashboard/server.mjs`
- `aurora/dashboard/client/index.html`

**Features:**
- [ ] Real-time KAIROS ticks
- [ ] Worker activity monitoring
- [ ] Memory consolidation status
- [ ] Health metrics
- [ ] Task progress visualization

---

### **AC-017: VS Code Extension** (5 hours)

**Files to Create:**
- `aurora/vscode-extension/`
- `aurora/vscode-extension/package.json`
- `aurora/vscode-extension/extension.ts`

**Features:**
- [ ] @aurora commands in editor
- [ ] Inline code review
- [ ] Quick actions (context menu)
- [ ] Terminal integration

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
