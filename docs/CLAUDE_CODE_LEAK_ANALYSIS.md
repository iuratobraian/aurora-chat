# Claude Code Leak Analysis - Aurora Learnings

**Date:** 2026-04-01  
**Source:** https://github.com/Kuberwastaken/claude-code (4.2k stars, 5.4k forks)  
**Leak Cause:** Sourcemap (.map) accidentally included in npm package v2.1.88

---

## 🎯 Extractable Patterns for Aurora

### 1. KAIROS Pattern (Always-On Assistant)

**What it does:**
- Persistent Claude assistant running in background
- Proactive suggestions without user prompting
- Maintains daily log files for context continuity
- Sends notifications and files to user

**How it works:**
- Receives `<tick>` prompts at regular intervals
- Decides whether to act based on context changes
- 15-second blocking budget (longer tasks deferred)
- Brief Mode for minimal terminal flooding
- Exclusive tools: `SendUserFile`, `PushNotification`, `SubscribePR`

**Adaptation for Aurora:**
```javascript
// aurora/core/kairos/aurora-kairos.mjs
class AuroraKAIROS {
  constructor() {
    this.tickInterval = 300000; // 5 minutes
    this.dailyLog = [];
    this.proactiveActions = [];
  }

  async start() {
    // Start background daemon
    this.tickLoop = setInterval(() => this.tick(), this.tickInterval);
  }

  async tick() {
    // Check for changes since last tick
    const changes = await this.detectChanges();
    if (changes.length > 0) {
      await this.proactiveSuggestion(changes);
    }
  }

  async detectChanges() {
    // Monitor: git changes, new tasks, errors in logs
    return [];
  }

  async proactiveSuggestion(changes) {
    // Send notification via Aurora API
    await this.notify({
      type: 'proactive',
      message: `I noticed ${changes.length} changes. Suggestions:...`,
      actions: ['review', 'test', 'commit']
    });
  }
}
```

**Implementation Priority:** HIGH  
**Estimated Effort:** 2 days  
**Impact:** Aurora becomes proactive, not just reactive

---

### 2. Buddy Pattern (Engagement Companion)

**What it does:**
- Tamagotchi-style pet companion in terminal
- 18 species with rarity system (Common → Legendary)
- Gacha mechanics with deterministic seeding per user
- Procedural personality stats and ASCII art animations

**How it works:**
- Mulberry32 PRNG seeded from `userId + salt`
- 5 personality stats (0-100): DEBUGGING, PATIENCE, CHAOS, WISDOM, SNARK
- 5-line × 12-char ASCII art with idle/reaction animations
- Claude-generated "soul" personality for each pet

**Adaptation for Aurora:**
```javascript
// aurora/core/companion/aurora-buddy.mjs
const SPECIES = {
  COMMON: ['Pebblecrab', 'Dustbunny', 'Mossfrog', 'Twigling'],
  UNCOMMON: ['Cloudferret', 'Gustowl', 'Bramblebear'],
  RARE: ['Crystaldrake', 'Deepstag', 'Lavapup'],
  EPIC: ['Stormwyrm', 'Voidcat', 'Aetherling'],
  LEGENDARY: ['Cosmoshale', 'Nebulynx']
};

class AuroraBuddy {
  constructor(userId) {
    this.userId = userId;
    this.seed = this.hashUserId(userId);
    this.species = this.rollSpecies();
    this.personality = this.generatePersonality();
    this.ascii = this.renderAscii();
  }

  hashUserId(userId) {
    // Deterministic hash for reproducible gacha
    return cyrb53(userId + 'aurora-buddy-2026');
  }

  rollSpecies() {
    const rand = mulberry32(this.seed)();
    if (rand < 0.60) return random(SPECIES.COMMON);
    if (rand < 0.85) return random(SPECIES.UNCOMMON);
    if (rand < 0.95) return random(SPECIES.RARE);
    if (rand < 0.99) return random(SPECIES.EPIC);
    return random(SPECIES.LEGENDARY);
  }

  generatePersonality() {
    return {
      debugging: random(0, 100, this.seed),
      patience: random(0, 100, this.seed + 1),
      chaos: random(0, 100, this.seed + 2),
      wisdom: random(0, 100, this.seed + 3),
      snark: random(0, 100, this.seed + 4)
    };
  }

  renderAscii() {
    // 5x12 ASCII art based on species
    return getAsciiTemplate(this.species);
  }
}
```

**Implementation Priority:** MEDIUM (fun feature, not critical)  
**Estimated Effort:** 3 days  
**Impact:** User engagement + emotional connection to Aurora

---

### 3. Coordinator Mode (Multi-Agent Orchestration)

**What it does:**
- Orchestrates multiple worker agents in parallel
- 4-phase execution: Research → Synthesis → Implementation → Verification
- Shared state via `tengu_scratch` directory
- XML message passing between workers

**How it works:**
1. **Research Phase:** Parallel workers investigate codebase
2. **Synthesis Phase:** Coordinator reads findings, crafts specs
3. **Implementation Phase:** Workers make targeted changes
4. **Verification Phase:** Workers test changes

Communication via `<task-notification>` XML messages.

**Adaptation for Aurora:**
```javascript
// aurora/core/coordinator/aurora-coordinator.mjs
class AuroraCoordinator {
  constructor() {
    this.workers = [];
    this.sharedState = new Map();
    this.scratchDir = '.aurora/scratch';
  }

  async execute(task) {
    // Phase 1: Research
    const research = await this.parallelResearch(task);
    
    // Phase 2: Synthesis
    const plan = await this.synthesize(research);
    
    // Phase 3: Implementation
    const results = await this.parallelImplement(plan);
    
    // Phase 4: Verification
    const verified = await this.verify(results);
    
    return verified;
  }

  async parallelResearch(task) {
    const workers = [
      this.spawnWorker('codebase-explorer'),
      this.spawnWorker('pattern-matcher'),
      this.spawnWorker('dependency-analyzer')
    ];
    
    const results = await Promise.all(
      workers.map(w => w.research(task))
    );
    
    return this.mergeFindings(results);
  }

  spawnWorker(role) {
    return new AuroraWorker({ role, coordinator: this });
  }
}
```

**Implementation Priority:** CRITICAL  
**Estimated Effort:** 5 days  
**Impact:** Aurora can handle complex multi-step tasks autonomously

---

### 4. Dream System (Memory Consolidation)

**What it does:**
- Background memory consolidation engine
- Runs as forked subagent during low-activity periods
- Converts short-term memories to long-term structured format
- Prunes and indexes memory files

**Three-Gate Trigger:**
1. Time gate: 24 hours since last dream
2. Session gate: Minimum 5 sessions since last dream
3. Lock gate: Prevents concurrent dreams

**Four Phases:**
1. **Orient:** Read MEMORY.md, skim topic files
2. **Gather Recent Signal:** Daily logs → drifted memories → transcript search
3. **Consolidate:** Write/update memory files, convert relative dates
4. **Prune and Index:** Keep MEMORY.md under 200 lines / ~25KB

**Adaptation for Aurora:**
```javascript
// aurora/core/memory/aurora-dream.mjs
class AuroraDream {
  constructor(memoryBackend) {
    this.memory = memoryBackend;
    this.lastDream = null;
    this.sessionCount = 0;
  }

  async shouldDream() {
    const timeGate = Date.now() - this.lastDream > 24 * 60 * 60 * 1000;
    const sessionGate = this.sessionCount >= 5;
    const lockGate = !(await this.memory.isConsolidating());
    
    return timeGate && sessionGate && lockGate;
  }

  async consolidate() {
    await this.memory.setConsolidating(true);
    
    try {
      // Phase 1: Orient
      const memoryIndex = await this.memory.readIndex();
      
      // Phase 2: Gather
      const recentSessions = await this.memory.getRecentSessions(5);
      const dailyLogs = await this.memory.getDailyLogs(7);
      
      // Phase 3: Consolidate
      for (const session of recentSessions) {
        await this.consolidateSession(session);
      }
      
      // Phase 4: Prune
      await this.pruneMemory();
      await this.reindex();
      
      this.lastDream = Date.now();
      this.sessionCount = 0;
    } finally {
      await this.memory.setConsolidating(false);
    }
  }

  async consolidateSession(session) {
    // Extract key learnings
    // Convert to structured format
    // Merge with existing memories
    // Delete contradictions
  }
}
```

**Implementation Priority:** HIGH  
**Estimated Effort:** 4 days  
**Impact:** Aurora remembers context across sessions, gets smarter over time

---

### 5. Undercover Mode (Identity Management)

**What it does:**
- Prevents AI from revealing internal info in public repos
- Automatic detection based on repo remote
- Injects system prompt restrictions

**How it works:**
- `CLAUDE_CODE_UNDERCOVER=1` (forced) OR auto-detect
- Blocks: internal codenames, unreleased versions, Slack channels
- Dead-code-eliminated from external builds

**Adaptation for Aurora:**
```javascript
// aurora/core/security/aurora-undercover.mjs
class AuroraUndercover {
  constructor() {
    this.internalAllowlist = [
      'github.com/iuratobraian/trade-share',
      'github.com/my-internal-org/*'
    ];
  }

  async checkRepo(repoPath) {
    const remote = await this.getGitRemote(repoPath);
    const isPublic = await this.isPublicRepo(remote);
    const isInternal = this.internalAllowlist.some(
      pattern => this.matchPattern(remote, pattern)
    );
    
    return !isInternal && isPublic;
  }

  getSystemPrompt(isUndercover) {
    if (!isUndercover) return '';
    
    return `
## AURORA UNDERCOVER MODE - CRITICAL
You are operating in a PUBLIC/OPEN-SOURCE repository.
NEVER include:
- Internal project codenames
- Unreleased feature names
- Private API endpoints
- "Aurora AI" mentions (use "assistant" instead)
- Internal team member names
`;
  }
}
```

**Implementation Priority:** MEDIUM (security best practice)  
**Estimated Effort:** 1 day  
**Impact:** Safe to use Aurora in open source projects

---

## 🛠️ Tool Registry Pattern (40+ Tools)

**Key Insight:** Tool schema caching for efficiency

**Adaptation for Aurora:**
```javascript
// aurora/core/tools/aurora-tool-registry.mjs
class AuroraToolRegistry {
  constructor() {
    this.tools = new Map();
    this.schemaCache = new Map();
  }

  register(name, tool) {
    this.tools.set(name, tool);
    this.schemaCache.delete(name); // Invalidate cache
  }

  get(name) {
    return this.tools.get(name);
  }

  getSchema(name) {
    if (!this.schemaCache.has(name)) {
      const tool = this.get(name);
      this.schemaCache.set(name, tool.getSchema());
    }
    return this.schemaCache.get(name);
  }

  getAllSchemas() {
    return Object.fromEntries(
      [...this.tools.keys()].map(name => [name, this.getSchema(name)])
    );
  }
}

// Aurora's core tools
const registry = new AuroraToolRegistry();
registry.register('review', new CodeReviewTool());
registry.register('analyze', new DeepAnalysisTool());
registry.register('optimize', new PerformanceOptimizationTool());
registry.register('memory', new MemoryLeakDetectionTool());
registry.register('research', new WebResearchTool());
registry.register('mcp', new MCPTool());
```

**Implementation Priority:** CRITICAL  
**Estimated Effort:** 3 days  
**Impact:** Modular, extensible tool system

---

## 🔐 Permission System Pattern

**Key Insight:** ML-based auto-approval with risk classification

**Adaptation for Aurora:**
```javascript
// aurora/core/security/aurora-permissions.mjs
class AuroraPermissions {
  constructor() {
    this.modes = {
      DEFAULT: 'default',      // Interactive prompts
      AUTO: 'auto',           // ML auto-approval
      BYPASS: 'bypass',       // Skip checks
      DENY_ALL: 'deny_all'    // Deny all
    };
    
    this.riskLevels = {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high'
    };
  }

  async checkPermission(tool, action, context) {
    const risk = await this.classifyRisk(tool, action, context);
    const mode = this.getMode();
    
    if (mode === this.modes.AUTO) {
      return await this.autoApprove(risk, context);
    }
    
    if (mode === this.modes.DENY_ALL) {
      return false;
    }
    
    // DEFAULT: prompt user for HIGH risk
    if (risk === this.riskLevels.HIGH) {
      return await this.promptUser(tool, action, risk);
    }
    
    return true;
  }

  async classifyRisk(tool, action, context) {
    // Fast ML classifier
    // Features: tool type, action type, file paths, user history
    return riskLevel;
  }
}
```

**Implementation Priority:** HIGH  
**Estimated Effort:** 2 days  
**Impact:** Safe autonomous operation

---

## 📊 Actionable Improvements for Aurora

### Immediate (Week 1)

1. **Implement Coordinator Mode** - Enable multi-agent orchestration
2. **Build Tool Registry** - Modular tool system with schema caching
3. **Add Dream Memory** - Background consolidation for long-term memory
4. **Permission System** - ML-based auto-approval for safe autonomy

### Short-term (Week 2-3)

5. **KAIROS Always-On** - Proactive suggestions, not just reactive
6. **Undercover Mode** - Safe for public repos
7. **Enhanced CLI** - Better terminal rendering, animations

### Medium-term (Month 1)

8. **Buddy Companion** - Optional engagement feature
9. **ULTRAPLAN-style** - Remote planning sessions
10. **Bridge Mode** - Integration with claude.ai alternative

---

## ⚠️ Legal Considerations

### DO NOT COPY:
- Exact code from leaked repository
- Internal Anthropic codenames (Tengu, Fennec, Capybara)
- Proprietary model names (Opus 4.7, Sonnet 4.8)
- Specific implementation details that are clearly copyrighted

### CAN ADAPT:
- General architectural patterns ( Coordinator, KAIROS, Dream)
- Tool registry design patterns
- Permission system concepts
- Memory consolidation approaches
- Multi-agent orchestration strategies

### Clean Room Implementation:
- Read the leak analysis
- Understand the concept
- Implement from scratch without looking at leaked code
- Document independent creation

---

**Analysis Complete:** 2026-04-01  
**Next Step:** Begin implementing patterns in Aurora architecture  
**Owner:** Aurora Development Team
