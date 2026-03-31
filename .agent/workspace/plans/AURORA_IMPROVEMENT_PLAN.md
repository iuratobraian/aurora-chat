# Aurora Intelligence - Plan de Mejoras 2026
## TradePortal - BIG-PICKLE Analysis

---

## ESTADO ACTUAL (2026-03-23)

### Arquitectura Implementada
```
Aurora System
├── Control Plane
│   ├── aurora-sovereign.mjs (9 artefactos soberanos)
│   ├── aurora-scorecard.mjs
│   └── aurora-health-snapshot.mjs
├── Memory System
│   ├── brain/db/ (7 colecciones JSONL)
│   ├── heuristics.jsonl (4 entries)
│   ├── error_catalog.jsonl (7 errors)
│   ├── teamwork_knowledge.jsonl (139+ entries)
│   └── activity_log.jsonl (434+ entries)
├── Retrieval Engine
│   ├── aurora-knowledge.mjs
│   └── semantic retrieval (PENDIENTE)
├── Reasoning Layer
│   ├── aurora-reasoning.mjs
│   └── 100 funciones implementadas
├── Execution Support
│   ├── aurora-auto-runner.mjs
│   ├── aurora-agent-learner.mjs
│   └── aurora-auto-learn.mjs
├── Connectors
│   ├── 9 APIs configuradas
│   └── 5 MCPs activos
└── Operator Experience
    ├── aurora-api.mjs (40+ endpoints)
    ├── aurora-shell.mjs (30+ comandos)
    └── aurora/app/ (web interface)
```

### Métricas Actuales
- **Knowledge**: 139+ registros de aprendizaje
- **Activity**: 434+ entradas
- **Functions**: 100/100 implementadas
- **Connectors**: 7 APIs + 5 MCPs
- **Health**: Verde (API corriendo en puerto 4310)

---

## PROBLEMAS IDENTIFICADOS

### P1: Retrieval Basado en Keywords
**Síntoma**: Búsqueda por texto match no captura contexto semántico
**Impacto**: Conocimiento relevante no aparece en queries relacionadas
**Solución**: Implementar embedding-based retrieval con Ollama

### P2: Sin Validación Automática de Conocimiento
**Síntoma**: 139+ registros sin verificar contra código real
**Impacto**: Conocimiento obsoleto puede mislead agentes
**Solución**: Pipeline de validación con comparison automática

### P3: Reasoning Aislado de Memory
**Síntoma**: classifyTask/riskDetect no consultan knowledge base
**Impacto**: Razonamiento sin contexto histórico
**Solución**: Integrar retrieval en reasoning layer

### P4: Health Snapshot Manual
**Síntoma**: Solo se genera bajo demanda
**Impacto**: Problemas no detectados hasta revisión manual
**Solución**: Monitor continuo con alertas

### P5: Drift Detection Reactivo
**Síntoma**: Contradicciones detectadas manualmente
**Impacto**: Bugs por desincronización board/código
**Solución**: Comparación automática de estados

### P6: Handoffs Manuales
**Síntoma**: Agentes escriben handoffs a mano
**Impacto**: Información inconsistente, transfers incompletas
**Solución**: Generación automática al cerrar tarea

### P7: Web Dashboard Básico
**Síntoma**: Solo muestra status básico
**Impacto**: Operator experience limitada
**Solución**: Dashboard operativo completo con real-time

### P8: Sin Métricas de Precisión
**Síntoma**: No medimos calidad de outputs de funciones
**Impacto**: No sabemos qué funciona y qué no
**Solución**: A/B testing y precision tracking

---

## PLAN DE MEJORAS (8 Semanas)

### SEMANA 1-2: Memory System

#### IMP-001: Semantic Retrieval (5 días)
**Archivos:**
- Crear: `lib/aurora/semantic-retriever.mjs`
- Crear: `lib/aurora/embeddings-store.jsonl`

**Implementación:**
```javascript
// core function
async function semanticSearch(query, topK = 5) {
  // 1. Generate query embedding via Ollama
  const queryEmbedding = await generateEmbedding(query);
  
  // 2. Load pre-computed embeddings
  const store = await loadEmbeddingsStore();
  
  // 3. Calculate cosine similarity
  const results = store.entries
    .map(e => ({
      ...e,
      similarity: cosineSimilarity(queryEmbedding, e.embedding)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
  
  return results;
}

// Pre-compute embeddings for all knowledge entries
async function computeEmbeddings() {
  const entries = await loadKnowledgeEntries();
  for (const entry of entries) {
    const embedding = await generateEmbedding(entry.statement);
    await saveEmbedding(entry.id, embedding);
  }
}
```

**Validación:** `npm run semantic:test`

#### IMP-002: Knowledge Validation Pipeline (3 días)
**Archivos:**
- Crear: `scripts/aurora-validate-knowledge.mjs`

**Implementación:**
```javascript
async function validateKnowledge() {
  const entries = await loadKnowledgeEntries();
  const results = { validated: [], needs_review: [], outdated: [] };
  
  for (const entry of entries) {
    // 1. Check if related files still exist
    const filesExist = await checkFilesExist(entry.relatedFiles);
    
    // 2. Verify statement against current code
    const stillValid = await verifyStatement(entry);
    
    // 3. Calculate confidence
    entry.confidence = calculateConfidence(filesExist, stillValid);
    entry.lastValidatedAt = new Date().toISOString();
    
    if (entry.confidence > 0.8) results.validated.push(entry);
    else if (entry.confidence > 0.5) results.needs_review.push(entry);
    else results.outdated.push(entry);
  }
  
  await saveResults(results);
  return results;
}
```

**Validación:** `node scripts/aurora-validate-knowledge.mjs`

---

### SEMANA 2-3: Reasoning Layer

#### IMP-003: Chain-of-Thought with Memory (5 días)
**Archivos:**
- Modificar: `lib/aurora/reasoning.mjs`

**Implementación:**
```javascript
// Nuevo export
async function reasonWithContext(query) {
  // 1. Load task context (existing)
  const context = await buildTaskContextPack(query);
  
  // 2. Semantic search in knowledge base
  const relevantKnowledge = await semanticSearch(query, topK = 3);
  
  // 3. Load similar past tasks
  const pastTasks = await findSimilarTasks(query);
  
  // 4. Build enhanced prompt
  const prompt = buildReasoningPrompt({
    query,
    context,
    knowledge: relevantKnowledge,
    pastTasks
  });
  
  // 5. Generate structured output
  return await generateStructuredOutput(prompt);
}
```

**Validación:** Test con queries conocidas

#### IMP-004: Risk Matrix Cuantitativa (3 días)
**Archivos:**
- Crear: `lib/aurora/risk-matrix.mjs`
- Modificar: `scripts/aurora-sovereign.mjs`

**Implementación:**
```javascript
// Risk matrix schema
{
  risks: [{
    id: "risk-001",
    severity: "critical|high|medium|low",
    likelihood: 0.0-1.0,
    impact: {
      security: 0-10,
      revenue: 0-10,
      ux: 0-10,
      compliance: 0-10
    },
    exposure: likelihood * max(impact),
    mitigation: "string",
    owner: "agent_id",
    status: "open|in_progress|mitigated|accepted",
    createdAt: "ISO",
    updatedAt: "ISO"
  }]
}

// Calculate exposure automatically
function calculateExposure(risk) {
  const maxImpact = Math.max(
    risk.impact.security,
    risk.impact.revenue,
    risk.impact.ux,
    risk.impact.compliance
  );
  return risk.likelihood * maxImpact;
}
```

---

### SEMANA 3-4: Control Plane

#### IMP-005: Health Monitor Continuo (3 días)
**Archivos:**
- Crear: `scripts/aurora-health-monitor.mjs`
- Modificar: `scripts/aurora-sovereign.mjs`

**Implementación:**
```javascript
// Run as daemon/cron
import { spawn } from 'child_process';

const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 min

async function healthMonitorLoop() {
  while (true) {
    const health = await buildAuroraHealthSnapshot();
    
    // Store health history
    await storeHealthRecord(health);
    
    // Alert if degraded
    if (health.status === 'red') {
      await alertOperators(health);
    }
    
    // Auto-heal if possible
    if (health.driftSignals.length > 0) {
      await attemptAutoHeal(health);
    }
    
    await sleep(HEALTH_CHECK_INTERVAL);
  }
}

// Run as background process
const monitor = spawn('node', ['scripts/aurora-health-monitor.mjs'], {
  detached: true,
  stdio: 'ignore'
});
monitor.unref();
```

**Validación:** Monitor corriendo + alertas funcionando

#### IMP-006: Drift Detection Automática (4 días)
**Archivos:**
- Crear: `lib/aurora/drift-detector.mjs`
- Modificar: `scripts/aurora-sovereign.mjs`

**Implementación:**
```javascript
async function detectDrift() {
  const signals = [];
  
  // 1. TASK_BOARD vs CURRENT_FOCUS
  const boardTasks = parseTaskBoard();
  const focusTask = parseCurrentFocus();
  if (boardTasks.status !== focusTask.status) {
    signals.push({
      type: 'board_focus_mismatch',
      severity: 'high',
      message: `Board: ${boardTasks.status}, Focus: ${focusTask.status}`
    });
  }
  
  // 2. AGENT_LOG vs TASK_BOARD completion
  const completedInLog = extractCompletedFromLog();
  const completedInBoard = extractCompletedFromBoard();
  const missing = completedInLog.filter(t => !completedInBoard.includes(t));
  if (missing.length > 0) {
    signals.push({
      type: 'completion_drift',
      severity: 'medium',
      message: `${missing.length} tasks completed but not marked done`
    });
  }
  
  // 3. Code vs ownership registry
  const unregisteredChanges = await findUnregisteredChanges();
  if (unregisteredChanges.length > 0) {
    signals.push({
      type: 'ownership_drift',
      severity: 'low',
      message: `${unregisteredChanges.length} files changed without ownership update`
    });
  }
  
  return { signals, recommendedActions: generateFixes(signals) };
}
```

---

### SEMANA 4-5: Operator Experience

#### IMP-007: Web Dashboard Completo (5 días)
**Archivos:**
- Modificar: `agent/aurora/app/index.html`
- Modificar: `agent/aurora/app/app.js`
- Modificar: `agent/aurora/app/styles.css`

**Features:**
```html
<!-- New sections -->
<div id="health-widget">
  <div class="status-indicator" [green|yellow|red]></div>
  <div class="metrics">
    <div class="metric">Tasks: <span>12</span></div>
    <div class="metric">Health: <span>98%</span></div>
    <div class="metric">Drift: <span>0</span></div>
  </div>
</div>

<div id="drift-feed">
  <div class="alert critical">
    <span class="icon">⚠️</span>
    <span class="message">Board/Focus mismatch detected</span>
    <button class="fix">Auto-fix</button>
  </div>
</div>

<div id="knowledge-browser">
  <input type="search" placeholder="Search knowledge...">
  <div class="results">
    <!-- Semantic search results -->
  </div>
</div>

<div id="scorecard-charts">
  <canvas id="utility-chart"></canvas>
  <canvas id="drift-chart"></canvas>
</div>
```

**Validación:** Dashboard carga + datos en tiempo real

#### IMP-008: Natural Language Interface (3 días)
**Archivos:**
- Modificar: `scripts/aurora-shell.mjs`

**Implementación:**
```javascript
// Nuevo comando: /chat
const chatCommand = {
  pattern: /^\/chat\s+(.+)$/,
  handler: async (query) => {
    // 1. Classify intent
    const intent = await classifyIntent(query);
    
    // 2. Extract entities
    const entities = extractEntities(query);
    
    // 3. Build context
    const context = await buildChatContext(intent, entities);
    
    // 4. Generate response
    const response = await generateChatResponse({
      query,
      intent,
      entities,
      context,
      knowledge: await semanticSearch(query)
    });
    
    // 5. Suggest actions
    const actions = suggestActions(intent, entities);
    
    return { response, actions };
  }
};
```

**Ejemplos:**
```
/chat what was the last task completed?
/chat show me tasks related to auth
/chat help me fix the instagram oauth bug
```

---

### SEMANA 5-6: Evaluation

#### IMP-009: Precision Metrics (4 días)
**Archivos:**
- Crear: `lib/aurora/eval.mjs`
- Modificar: `scripts/aurora-scorecard.mjs`

**Implementación:**
```javascript
const evalMetrics = {
  // Precision: How correct are our outputs?
  precision: {
    classifyTask: await trackAccuracy('classifyTask'),
    riskDetect: await trackAccuracy('riskDetect'),
    suggestNextStep: await trackAccuracy('suggestNextStep'),
    buildExecutionPlan: await trackAccuracy('buildExecutionPlan')
  },
  
  // Latency: How fast are responses?
  latency: {
    avgResponseTime: await calculateAvgLatency(),
    p95ResponseTime: await calculateP95Latency()
  },
  
  // Utility: Is the output useful?
  utility: {
    thumbsUpRate: await calculateThumbsUpRate(),
    autoAcceptRate: await calculateAutoAcceptRate()
  },
  
  // Drift: Are we getting worse over time?
  driftRate: await calculateDriftRate()
};

// Track accuracy over time
async function trackAccuracy(functionName) {
  const history = await loadEvalHistory(functionName);
  const recent = history.slice(-100); // Last 100 calls
  
  const correct = recent.filter(h => h.outcome === 'correct').length;
  return {
    accuracy: correct / recent.length,
    sampleSize: recent.length,
    trend: calculateTrend(recent)
  };
}
```

#### IMP-010: Quality Gate en Auto-Learn (2 días)
**Archivos:**
- Modificar: `scripts/aurora-auto-learn.mjs`

**Implementación:**
```javascript
async function qualityGatedLearn(entry) {
  // 1. Schema validation
  if (!validateKnowledgeSchema(entry)) {
    return { rejected: true, reason: 'invalid_schema' };
  }
  
  // 2. Duplicate detection
  const hash = await sha256(entry.statement);
  if (await isDuplicate(hash)) {
    return { rejected: true, reason: 'duplicate' };
  }
  
  // 3. Novelty scoring
  const novelty = await scoreNovelty(entry);
  if (novelty < 0.3) {
    return { flagged: true, reason: 'low_novelty', review: true };
  }
  
  // 4. Confidence calibration
  const calibrated = calibrateConfidence(entry);
  
  // 5. Save with metadata
  await saveKnowledgeEntry({
    ...calibrated,
    hash,
    novelty,
    qualityGatePassed: true,
    ingestedAt: new Date().toISOString()
  });
  
  return { accepted: true };
}
```

---

### SEMANA 6-7: Connectors

#### IMP-011: MCP Playbooks (3 días)
**Archivos:**
- Modificar: `agent/aurora/connectors.json`

**Implementación:**
```json
{
  "github_mcp": {
    "purpose": "Issue management, PR reviews, code search",
    "playbook": {
      "on_task_create": [
        "search_related_issues",
        "link_existing_issues",
        "create_tracking_issue"
      ],
      "on_task_done": [
        "close_related_issue",
        "update_issue_timeline",
        "notify_stakeholders"
      ],
      "on_pr_open": [
        "run_ci_checks",
        "request_reviews",
        "check_coverage"
      ]
    },
    "risk_level": "medium",
    "fallback": "gh cli commands",
    "required_env": ["GITHUB_TOKEN"]
  },
  "playwright_mcp": {
    "purpose": "Smoke tests, E2E validation, visual regression",
    "playbook": {
      "on_validation": [
        "run_smoke_test",
        "check_key_flows",
        "capture_screenshots"
      ]
    },
    "risk_level": "low",
    "fallback": "manual browser testing"
  }
}
```

---

### SEMANA 7-8: Autonomy

#### IMP-012: Pre-Task Automation (3 días)
**Archivos:**
- Modificar: `scripts/aurora-auto-runner.mjs`

**Implementación:**
```javascript
async function preTaskAutomation(taskId) {
  // 1. Load task details
  const task = await loadTask(taskId);
  
  // 2. Build context pack
  const contextPack = await buildTaskContextPack(task.description);
  
  // 3. Pre-fetch knowledge
  const relevantKnowledge = await semanticSearch(task.description, topK = 5);
  
  // 4. Find similar past tasks
  const pastTasks = await findSimilarTasks(task.description, limit = 3);
  
  // 5. Generate task brief
  const brief = {
    taskId,
    description: task.description,
    context: contextPack,
    knowledge: relevantKnowledge,
    pastSolutions: pastTasks,
    warnings: await detectWarnings(task),
    suggestedApproach: await suggestApproach(task)
  };
  
  // 6. Deliver to agent
  await deliverBriefToAgent(task.owner, brief);
  
  return brief;
}
```

#### IMP-013: Post-Task Closure (3 días)
**Archivos:**
- Modificar: `scripts/aurora-auto-runner.mjs`

**Implementación:**
```javascript
async function postTaskClosure(taskId, outcome) {
  // 1. Extract learnings
  const learnings = await extractLearnings(taskId, outcome);
  
  // 2. Validate against code
  const validation = await validateChanges(taskId);
  
  // 3. Generate handoff brief
  const handoff = await buildAuroraHandoffBrief(taskId, {
    outcome,
    learnings,
    validation,
    artifacts: await collectArtifacts(taskId)
  });
  
  // 4. Update knowledge base
  for (const learning of learnings) {
    await qualityGatedLearn(learning);
  }
  
  // 5. Update task board
  await markTaskComplete(taskId, handoff);
  
  // 6. Notify stakeholders
  await notifyHandoff(handoff);
  
  // 7. Schedule follow-up if needed
  if (validation.warnings.length > 0) {
    await scheduleFollowUp(taskId, validation.warnings);
  }
  
  return handoff;
}
```

#### IMP-014: Self-Improvement Loop (2 días)
**Archivos:**
- Crear: `scripts/aurora-self-improve.mjs`

**Implementación:**
```javascript
async function selfImprovement() {
  // 1. Analyze failures
  const failures = await analyzeFailedPredictions();
  
  // 2. Identify gaps
  const gaps = await identifyKnowledgeGaps(failures);
  
  // 3. Generate proposals
  const proposals = await generateImprovementProposals(gaps);
  
  // 4. Apply safe changes automatically
  const applied = [];
  for (const proposal of proposals) {
    if (proposal.risk === 'low' && proposal.confidence > 0.8) {
      await applyChange(proposal);
      applied.push(proposal);
    }
  }
  
  // 5. Flag complex changes for review
  const flagged = proposals.filter(p => 
    p.risk !== 'low' || p.confidence <= 0.8
  );
  
  // 6. Report
  return {
    week: getWeekNumber(),
    applied: applied.length,
    flagged: flagged.length,
    details: { applied, flagged }
  };
}

// Run weekly
cron('0 9 * * 1', () => selfImprovement());
```

---

## METRICAS DE ÉXITO

### Memory System (Semana 1-2)
- [ ] Semantic retrieval con >80% precision en recall
- [ ] 100% de knowledge entries validadas
- [ ] Freshness score calculado para todos los entries

### Reasoning Layer (Semana 2-3)
- [ ] reasonWithContext usa knowledge base
- [ ] Risk matrix con exposure cuantificado
- [ ] < 500ms latency en razonamiento

### Control Plane (Semana 3-4)
- [ ] Health monitor 99.9% uptime
- [ ] Drift detection en < 1 minuto
- [ ] Auto-handoff en < 30 segundos

### Operator Experience (Semana 4-5)
- [ ] Dashboard carga en < 100ms
- [ ] /chat responde en < 2 segundos
- [ ] 100% de métricas visibles

### Evaluation (Semana 5-6)
- [ ] Precision tracking para todas las funciones
- [ ] Quality gate rechaza > 90% de ruido
- [ ] Tendencias identificables

### Connectors (Semana 6-7)
- [ ] 100% de MCPs con playbooks
- [ ] Fallbacks documentados
- [ ] Risk levels asignados

### Autonomy (Semana 7-8)
- [ ] Pre-task context en < 10 segundos
- [ ] Post-task closure automático
- [ ] Self-improvement weekly

---

## TIMELINE

```
SEMANA 1-2:     [====Memory System====]
                    ├── IMP-001: Semantic Retrieval (5d)
                    └── IMP-002: Validation Pipeline (3d)
                    
SEMANA 2-3:     [====Reasoning Layer====]
                    ├── IMP-003: Chain-of-Thought (5d)
                    └── IMP-004: Risk Matrix (3d)
                    
SEMANA 3-4:     [====Control Plane====]
                    ├── IMP-005: Health Monitor (3d)
                    └── IMP-006: Drift Detection (4d)
                    
SEMANA 4-5:     [====Operator Experience====]
                    ├── IMP-007: Web Dashboard (5d)
                    └── IMP-008: Chat Interface (3d)
                    
SEMANA 5-6:     [====Evaluation====]
                    ├── IMP-009: Precision Metrics (4d)
                    └── IMP-010: Quality Gate (2d)
                    
SEMANA 6-7:     [====Connectors====]
                    └── IMP-011: MCP Playbooks (3d)
                    
SEMANA 7-8:     [====Autonomy====]
                    ├── IMP-012: Pre-Task (3d)
                    ├── IMP-013: Post-Task (3d)
                    └── IMP-014: Self-Improve (2d)
```

---

## PRIORIDADES RECOMENDADAS

| Prioridad | Implementación | Razón |
|-----------|---------------|-------|
| 1 (CRÍTICO) | IMP-001 Semantic Retrieval | Base para todo lo demás |
| 2 (CRÍTICO) | IMP-006 Drift Detection | Evita bugs en producción |
| 3 (ALTA) | IMP-012 Pre-Task | Mejora productividad inmediata |
| 4 (ALTA) | IMP-010 Quality Gate | Evita contaminación de knowledge |
| 5 (MEDIA) | IMP-007 Web Dashboard | Mejor UX para operators |

---

## CONCLUSIÓN

Este plan transforma Aurora de un sistema reactivo a uno proactivo con:
- **Memoria inteligente** que sabe qué sabe y qué no
- **Razonamiento contextual** que consulta conocimiento histórico
- **Control automatizado** que detecta y corrige drift
- **UX de nivel production** con dashboard y chat
- **Evaluación continua** que mide y mejora precisión
- **Autonomía real** con pre/post task automation

La implementación completa toma ~8 semanas con un solo developer dedicado o ~4 semanas con 2 developers en paralelo.

---

*Creado: 2026-03-23*
*Versión: 2.0*
*Autor: BIG-PICKLE*
*Basado en análisis de arquitectura Aurora*
