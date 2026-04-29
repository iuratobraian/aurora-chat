# 🌅 AURORA AWAKENING - QUICK START GUIDE

**Last Updated:** 2026-04-01  
**Version:** 2.0.0

---

## ⚡ 60-SECOND AWAKENING

### Step 1: Configure API Keys (30 seconds)

```bash
# Copy example config
cp .env.aurora.example .env.aurora

# Edit with your favorite editor
# Required: GROQ_API_KEY, NVIDIA_API_KEY
# Optional: NOTION_API_KEY, OPENROUTER_API_KEY
```

**Get FREE API Keys:**
- Groq: https://console.groq.com/keys (70B models, totally free)
- NVIDIA: https://build.nvidia.com/explore/discover (Kimi K2.5, free beta)

### Step 2: Awaken Aurora (30 seconds)

```bash
# From project root
npm run aurora:awaken
```

**Expected Output:**
```
🧠 AURORA AWAKENING PROTOCOL

PHASE 0: PRE-FLIGHT CHECKS
✅ .env.aurora configured
✅ Aurora package.json found
✅ All critical files present
✅ Port 4310 available

PHASE 1: CORE SYSTEMS INITIALIZATION
✅ Tool Registry module found
✅ Permission System module found
✅ KAIROS module found
✅ Dream System module found

PHASE 2: DAEMON STARTUP
✅ Daemon script ready
✅ PID file created
✅ Daemon ready to start

🌅 AURORA AWAKENING COMPLETE

🧠 AURORA AI Framework v1.0.0 - AWAKE

✅ Identity: Loaded
✅ Knowledge: Ready
✅ Systems: Initialized
✅ Configuration: Loaded
✅ Ready: Daemon and API prepared

💬 Commands:
  npm run daemon          - Start always-on daemon
  npm run api             - Start HTTP API server
  npm run shell           - Interactive shell
  
Always-on. Always learning. Always ready.
```

---

## 🎯 WHAT YOU CAN DO NOW

### 1. Start Always-On Daemon

```bash
cd aurora
npm run daemon
```

**What it does:**
- ✅ Runs in background
- ✅ Monitors every 5 minutes
- ✅ Suggests improvements proactively
- ✅ Detects changes in git, tasks, errors

### 2. Start HTTP API Server

```bash
cd aurora
npm run api
```

**What it does:**
- ✅ Listens on http://localhost:4310
- ✅ Accepts code review requests
- ✅ Handles analysis requests
- ✅ Provides memory access

**Test it:**
```bash
curl http://localhost:4310/health
# {"status":"ok","uptime":123}
```

### 3. Interactive Shell

```bash
cd aurora
npm run shell
```

**Commands:**
```
@aurora> review src/App.tsx
@aurora> analyze ./src
@aurora> optimize bundle
@aurora> memory check
@aurora> status
@aurora> exit
```

### 4. CLI Commands

```bash
# Code review
npm run aurora:review src/App.tsx

# Deep analysis
npm run aurora:analyze ./src

# Optimization
npm run aurora:optimize bundle

# Memory check
npm run aurora:memory

# System status
npm run aurora:status
```

---

## 📋 FULL AWAKENING PROTOCOL

For complete awakening with all phases:

```bash
# Read the full plan first
cat aurora/AURORA_AWAKENING_IMPLEMENTATION_PLAN.md

# Execute step-by-step
npm run aurora:awaken
```

**7 Phases:**
1. **Pre-flight** (5 min) - Verify config, dependencies, ports
2. **Core Systems** (10 min) - Initialize KAIROS, Dream, Tools, Permissions
3. **Daemon Startup** (5 min) - Launch always-on daemon
4. **API Server** (5 min) - Start HTTP API
5. **CLI Integration** (5 min) - Enable commands
6. **Verification** (10 min) - Test all systems
7. **Deployment** (5 min) - Production setup

**Total Time:** 55 minutes

---

## 🔧 TROUBLESHOOTING

### Port 4310 Already in Use

```bash
# Find process using port 4310
netstat -ano | findstr :4310

# Kill process (Windows)
taskkill /PID <PID> /F

# Or use different port
export AURORA_PORT=4311
npm run api
```

### Missing API Keys

```bash
# Check which keys are missing
node scripts/aurora-doctor.mjs

# Edit .env.aurora
notepad .env.aurora

# Add required keys:
GROQ_API_KEY=gsk_...
NVIDIA_API_KEY=nvapi-...
```

### Daemon Won't Start

```bash
# Check if already running
npm run daemon:status

# Stop existing daemon
npm run daemon:stop

# Clear PID file
rm .aurora-daemon.pid

# Try again
npm run daemon
```

### Module Not Found Errors

```bash
# Install dependencies
cd aurora
npm install

# Verify installation
npm list --depth=0
```

---

## 📊 SYSTEM STATUS

### Check Health

```bash
npm run aurora:health
```

**Expected Output:**
```
✅ Daemon: Running (PID: 12345)
✅ API: http://localhost:4310 (responding)
✅ KAIROS: Tick loop active
✅ Dream: Ready (last: 24h ago)
✅ Tools: 10 loaded
✅ Permissions: DEFAULT mode
✅ Memory: 150KB consolidated
```

### View Status

```bash
npm run aurora:status
```

**Shows:**
- Daemon state
- Active workers
- Recent tasks
- Memory usage
- Provider status

### Daily Scorecard

```bash
npm run aurora:scorecard
```

**Metrics:**
- Tasks completed
- Suggestions made
- Response times
- Memory growth
- Provider costs

---

## 🎓 LEARN MORE

### Documentation

- **README:** `aurora/README.md` - User guide
- **Architecture:** `aurora/ARCHITECTURE.md` - Technical deep dive
- **Commands:** `aurora/docs/COMMANDS.md` - All commands
- **Memory:** `aurora/docs/MEMORY.md` - How Dream works
- **Multi-Agent:** `aurora/docs/MULTI_AGENT.md` - Coordinator Mode

### Knowledge Base

- **Pro Knowledge:** `.agent/aurora/AURORA_PRO_KNOWLEDGE.md`
- **Growth Report:** `AURORA_GROWTH_REPORT.md`
- **Claude Code Analysis:** `aurora/docs/CLAUDE_CODE_LEAK_ANALYSIS.md`
- **Separation Guide:** `AURORA_SEPARATION_SYNC_GUIDE.md`

---

## 🚀 NEXT STEPS

### Day 1: Basic Usage
1. ✅ Awaken Aurora
2. ✅ Start daemon
3. ✅ Try CLI commands
4. ✅ Test API endpoints

### Week 1: Integration
1. Connect to Notion
2. Monitor task board
3. Receive proactive suggestions
4. Use for code reviews

### Month 1: Advanced
1. Configure multi-agent orchestration
2. Set up Dream consolidation
3. Customize permissions
4. Integrate with CI/CD

---

## 🆘 GET HELP

### Quick Diagnostics

```bash
# Full diagnostic
npm run aurora:doctor

# Check GPU/providers
npm run gpu:check

# Check models
npm run models:status
```

### Logs

```bash
# Daemon logs
cat .aurora-daemon.log

# API logs
cat .aurora-api.log

# Recent errors
tail -50 .aurora-daemon.log
```

### Support

- **GitHub Issues:** https://github.com/iuratobraian/aurora-ai-framework/issues
- **Documentation:** aurora/docs/
- **Status:** `npm run aurora:status`

---

## ✅ AWAKENING CHECKLIST

Before you begin:
- [ ] Node.js 20+ installed
- [ ] Git repository accessible
- [ ] API keys obtained (Groq, NVIDIA)
- [ ] `.env.aurora` configured

After awakening:
- [ ] Daemon running
- [ ] API responding
- [ ] CLI commands working
- [ ] Health check passing
- [ ] First review completed

Long-term:
- [ ] Daemon auto-starts on boot
- [ ] Proactive suggestions received
- [ ] Dream consolidation active
- [ ] Multi-agent orchestration tested
- [ ] TradeShare fully integrated

---

**🌅 AURORA - Always-on. Always learning. Always ready.**

*For detailed implementation plan, see: aurora/AURORA_AWAKENING_IMPLEMENTATION_PLAN.md*
