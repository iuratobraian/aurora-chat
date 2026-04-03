import fs from "node:fs";
import path from "node:path";
import { listAuroraFunctions } from "./aurora-agent-functions.mjs";
import { getConnectorStatus } from "./aurora-connectors.mjs";
import { getLocalAgentStatus } from "./aurora-local-agents.mjs";
import { buildTaskClosure, reasonTask, summarizeHandoff } from "./aurora-reasoning.mjs";

const ROOT = process.cwd();

const readText = (relativePath) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");

const readJson = (relativePath) =>
  JSON.parse(readText(relativePath));

function readJsonl(relativePath) {
  const full = path.join(ROOT, relativePath);
  if (!fs.existsSync(full)) return [];
  const text = fs.readFileSync(full, "utf8").trim();
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function parseTaskBoard(markdown) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => line.startsWith("|") && !line.includes("TASK-ID") && !line.includes("---"))
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 7)
    .map(([id, status, owner, scope, files, goal, acceptance]) => ({
      id,
      status,
      owner,
      scope,
      files,
      goal,
      acceptance
    }));
}

function getTasks() {
  return parseTaskBoard(readText(".agent/workspace/coordination/TASK_BOARD.md"));
}

function getFocusText() {
  return readText(".agent/workspace/coordination/CURRENT_FOCUS.md");
}

function getAgentLogText() {
  return readText(".agent/workspace/coordination/AGENT_LOG.md");
}

function getReleaseBlockers() {
  return readText(".agent/workspace/coordination/RELEASE_BLOCKERS.md")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, ""));
}

function getKnowledgeRecords() {
  const files = [
    ".agent/brain/db/heuristics.jsonl",
    ".agent/brain/db/patterns.jsonl",
    ".agent/brain/db/error_catalog.jsonl",
    ".agent/brain/db/teamwork_knowledge.jsonl"
  ];
  return files.flatMap((relativePath) =>
    readJsonl(relativePath).map((item) => ({
      ...item,
      collection: path.basename(relativePath)
    }))
  );
}

export function getAuroraSurfaceRegistry() {
  return readJson(".agent/aurora/aurora_surface_registry.json");
}

export function getAuroraContracts() {
  const contractsDir = path.join(ROOT, ".agent/aurora/contracts");
  if (!fs.existsSync(contractsDir)) return [];
  return fs.readdirSync(contractsDir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => readJson(path.join(".agent/aurora/contracts", name)));
}

export function buildAuroraDriftReport() {
  const tasks = getTasks();
  const focus = getFocusText();
  const log = getAgentLogText();
  const releaseBlockers = getReleaseBlockers();
  const signals = [];

  for (const task of tasks.filter((item) => item.status === "claimed")) {
    if (!focus.includes(task.id)) {
      signals.push({
        id: `focus-missing-${task.id}`,
        severity: "high",
        domain: "coordination",
        title: `Claim sin focus activo: ${task.id}`,
        statement: `La tarea ${task.id} figura claimed pero no aparece en CURRENT_FOCUS.`,
        recommendedAction: "Agregar o reconciliar el focus antes de seguir"
      });
    }
  }

  for (const blocker of releaseBlockers) {
    const found = tasks.find((task) => task.id === blocker);
    if (!found) {
      signals.push({
        id: `missing-blocker-${blocker}`,
        severity: "medium",
        domain: "release",
        title: `Release blocker ausente del board: ${blocker}`,
        statement: `RELEASE_BLOCKERS referencia ${blocker} pero no se encontró como tarea en TASK_BOARD.`,
        recommendedAction: "Crear o reconciliar la tarea bloqueante"
      });
      continue;
    }
    if (found.status !== "done") {
      signals.push({
        id: `open-blocker-${blocker}`,
        severity: "medium",
        domain: "release",
        title: `Release blocker abierto: ${blocker}`,
        statement: `${blocker} sigue en estado ${found.status}.`,
        recommendedAction: "Mantener fuera de release hasta cerrarlo"
      });
    }
  }

  const auroraTasks = tasks.filter((task) => /^OPS-05\d|^OPS-06\d/.test(task.id));
  const pendingAurora = auroraTasks.filter((task) => task.status === "pending").length;
  const openAurora = auroraTasks.filter((task) => task.status !== "done").length;

  if (pendingAurora > 0 && !/(OPS-051|OPS-062)/.test(log)) {
    signals.push({
      id: "aurora-program-not-yet-tracked-in-log",
      severity: "low",
      domain: "aurora_ops",
      title: "Programa Aurora sin trazabilidad histórica suficiente",
      statement: "Existen tareas soberanas de Aurora abiertas pero el AGENT_LOG aún no refleja iteraciones del programa.",
      recommendedAction: "Registrar hitos de ejecución conforme se vayan cerrando"
    });
  }

  const coordFiles = [
    ".agent/workspace/coordination/TASK_BOARD.md",
    ".agent/workspace/coordination/CURRENT_FOCUS.md",
    ".agent/workspace/coordination/AGENT_LOG.md"
  ];
  
  const fileTimestamps = coordFiles.map(f => ({
    file: f,
    mtime: fs.existsSync(path.join(ROOT, f)) ? fs.statSync(path.join(ROOT, f)).mtime : null
  }));
  
  for (let i = 0; i < coordFiles.length; i++) {
    for (let j = i + 1; j < coordFiles.length; j++) {
      const f1 = fileTimestamps[i];
      const f2 = fileTimestamps[j];
      if (f1.mtime && f2.mtime) {
        const diffHours = Math.abs(f1.mtime.getTime() - f2.mtime.getTime()) / (1000 * 60 * 60);
        if (diffHours > 48) {
          signals.push({
            id: `file-drift-${f1.file.split("/").pop()}-${f2.file.split("/").pop()}`,
            severity: diffHours > 168 ? "high" : "medium",
            domain: "coordination",
            title: `Drift de timestamp entre ${f1.file.split("/").pop()} y ${f2.file.split("/").pop()}`,
            statement: `${diffHours.toFixed(1)} horas de diferencia. Posible desincronización.`,
            recommendedAction: "Verificar que todos los archivos estén actualizados"
          });
        }
      }
    }
  }

  const tasksWithoutOwner = tasks.filter((t) => t.status === "pending" && (!t.owner || t.owner === "unassigned"));
  if (tasksWithoutOwner.length > 5) {
    signals.push({
      id: "missing-owners",
      severity: "medium",
      domain: "coordination",
      title: `${tasksWithoutOwner.length} tareas sin owner asignado`,
      statement: tasksWithoutOwner.slice(0, 3).map(t => t.id).join(", ") + "...",
      recommendedAction: "Asignar owners a las tareas pending"
    });
  }

  const focusMatchesTask = tasks.some(t => t.id.includes("OPS-051") && focus.includes(t.id));
  if (!focusMatchesTask && openAurora > 0) {
    signals.push({
      id: "focus-aurora-mismatch",
      severity: "low",
      domain: "aurora_ops",
      title: "CURRENT_FOCUS no referencia tareas Aurora",
      statement: "Hay tareas de Aurora abiertas pero CURRENT_FOCUS no las menciona.",
      recommendedAction: "Actualizar CURRENT_FOCUS con las tareas Aurora en progreso"
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalSignals: signals.length,
      openAuroraTasks: openAurora,
      filesAnalyzed: coordFiles.length,
      driftScore: Math.min(100, signals.length * 10)
    },
    fileTimestamps: fileTimestamps.map(f => ({
      file: f.file.split("/").pop(),
      lastModified: f.mtime ? f.mtime.toISOString() : null
    })),
    signals,
    recommendedActions: signals.map((signal) => signal.recommendedAction)
  };
}

export function buildAuroraRiskSignal(query = "") {
  const reasoning = reasonTask(query || "aurora_ops");
  const { classification, risk } = reasoning;

  return {
    id: `risk-${Date.now()}`,
    severity: risk.severity,
    domain: classification.likelyDomain || "general",
    title: `Riesgo para ${classification.likelyScope || "aurora_ops"}`,
    statement: `La consulta se clasifica como ${classification.likelyScope || "general"} sobre ${classification.likelySurface || "general"} con severidad ${risk.severity}. Riesgos: ${(risk.risks || []).join(", ") || "ninguno"}.`,
    recommendedAction: risk.recommendation
  };
}

export function buildAuroraValidationChecklist(query = "") {
  const tasks = getTasks();
  const reasoning = reasonTask(query || "aurora_ops");
  const matchedTask = tasks.find((task) => task.id === query) || null;
  const minimumValidation = Array.from(new Set(reasoning.validation.commands || ["npm run lint"]));
  const expandedValidation = [...minimumValidation];

  if (!expandedValidation.includes("npm run aurora:drift")) {
    expandedValidation.push("npm run aurora:drift");
  }
  if ((reasoning.risk.severity === "high" || query.toLowerCase().includes("aurora")) && !expandedValidation.includes("npm run aurora:scorecard-daily")) {
    expandedValidation.push("npm run aurora:scorecard-daily");
  }

  return {
    taskId: matchedTask?.id || null,
    domain: reasoning.classification.likelyDomain || "general",
    checks: Array.from(new Set([
      "confirmar ownership y focus antes de editar",
      ...(reasoning.quickChecks.checks || [])
    ])),
    minimumValidation,
    expandedValidation
  };
}

export function buildAuroraNextBestStep(query = "") {
  const context = buildAuroraTaskContextPack(query || "aurora_ops");
  const validation = buildAuroraValidationChecklist(query || "aurora_ops");
  const matchedTask = context.matchedTask;
  const domain = context.surface?.surfaceId || context.matchedTask?.scope || "aurora_ops";

  return {
    domain,
    statement: matchedTask
      ? `Trabajar ${matchedTask.id}: ${matchedTask.goal}`
      : `Trabajar el siguiente paso sobre ${domain}`,
    whyNow: matchedTask
      ? `Está en estado ${matchedTask.status} y ya tiene contexto mínimo disponible para avanzar con bajo costo de coordinación.`
      : "Aurora ya tiene suficiente contexto para producir una acción siguiente concreta sin depender de más exploración.",
    validation: validation.minimumValidation
  };
}

export function buildAuroraHandoffBrief(taskId = "", notes = "") {
  const closure = buildTaskClosure(taskId, notes);
  const handoff = summarizeHandoff(taskId);

  if (!closure.found || !handoff.found) {
    return {
      taskId,
      summary: "No encontré la tarea para generar un handoff estructurado.",
      touchedFiles: [],
      validation: [],
      remainingRisk: "Falta reconciliar la tarea con el board.",
      nextOwner: "CODEX-LEAD"
    };
  }

  return {
    taskId,
    summary: handoff.summary,
    touchedFiles: handoff.files.split(",").map((item) => item.trim()).filter(Boolean),
    validation: closure.handoff.validation,
    remainingRisk: closure.handoff.quickChecks[0] || "Sin riesgo adicional explícito.",
    nextOwner: closure.handoff.nextOwner
  };
}

export function buildAuroraHealthSnapshot() {
  const tasks = getTasks();
  const connectors = getConnectorStatus();
  const localAgents = getLocalAgentStatus();
  const drift = buildAuroraDriftReport();
  const auroraTasks = tasks.filter((task) => task.scope === "aurora_ops");
  const openTasks = auroraTasks.filter((task) => task.status !== "done");
  const criticalTasks = openTasks.filter((task) => /^OPS-05\d|^OPS-06\d/.test(task.id));
  const connectorsReady = [
    ...(connectors.apis || []),
    ...(connectors.mcp || [])
  ].filter((item) => item.prioridad === "alta").length;

  const focus = getFocusText();
  const activeRepo = readJson(".agent/aurora/repos.json").activo || null;

  return {
    generatedAt: new Date().toISOString(),
    repo: activeRepo,
    openTasks: openTasks.length,
    criticalTasks: criticalTasks.length,
    focusActive: /OPS-062/.test(focus),
    connectorsReady,
    localAgentsReady: [localAgents.ollama, localAgents.opencode, localAgents.codex]
      .filter((agent) => agent?.instalado).length,
    auroraFunctions: listAuroraFunctions().length,
    driftSignals: drift.summary.totalSignals,
    health: drift.summary.totalSignals === 0 ? "green" : drift.summary.totalSignals <= 3 ? "yellow" : "red"
  };
}

export function buildAuroraScorecardDaily() {
  const knowledge = getKnowledgeRecords();
  const registry = getAuroraSurfaceRegistry();
  const drift = buildAuroraDriftReport();
  const connectors = getConnectorStatus();
  const highPriorityConnectors = [
    ...(connectors.apis || []),
    ...(connectors.mcp || [])
  ].filter((item) => item.prioridad === "alta");

  const validatedKnowledge = knowledge.filter((item) => item.validated).length;
  const reusableKnowledge = knowledge.filter((item) => Number(item.reuseScore || 0) >= 0.7).length;
  
  const tasks = getTasks();
  const taskStats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "done").length,
    pending: tasks.filter((t) => t.status === "pending").length,
    claimed: tasks.filter((t) => t.status === "claimed").length
  };

  const historicalScores = getHistoricalScores(7);
  
  const utilityScore = Math.min(100, 40 + validatedKnowledge + registry.surfaces.length * 3);
  const reuseScore = Math.round(reusableKnowledge / Math.max(1, knowledge.length) * 100);
  const driftScore = Math.min(100, drift.summary.totalSignals * 10);
  const contextPrecision = Math.min(100, registry.surfaces.length * 12);
  const overallScore = Math.round(utilityScore * 0.3 + reuseScore * 0.2 + (100 - driftScore) * 0.3 + contextPrecision * 0.2);

  return {
    generatedAt: new Date().toISOString(),
    metrics: {
      utilityScore,
      reuseScore,
      driftScore,
      contextPrecision,
      overallScore
    },
    taskStats,
    utilityScore: overallScore,
    reuseScore: Math.round(reuseScore),
    driftCount: drift.summary.totalSignals,
    contextReadiness: registry.surfaces.length,
    connectorReadiness: highPriorityConnectors.length,
    functionCoverage: listAuroraFunctions().length,
    historicalScores
  };
}

export function getHistoricalScores(days = 7) {
  const scoresDir = path.join(ROOT, ".agent/aurora/scores");
  if (!fs.existsSync(scoresDir)) return [];
  const files = fs.readdirSync(scoresDir).filter((f) => f.startsWith("score-") && f.endsWith(".json"));
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  
  return files
    .map((file) => {
      const filePath = path.join(scoresDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      return { date: file.replace("score-", "").replace(".json", ""), metrics: data.metrics, taskStats: data.taskStats };
    })
    .filter((s) => new Date(s.date).getTime() > cutoff)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

const COLLECTION_WEIGHTS = {
  heuristics: 3,
  patterns: 2,
  error_catalog: 2,
  anti_patterns: 2,
  teamwork_knowledge: 1,
  references: 1,
  ideas: 1
};

export function buildAuroraTaskContextPack(query = "", domain = null, limit = 10) {
  const tasks = getTasks();
  const surfaces = getAuroraSurfaceRegistry().surfaces;
  const knowledge = getKnowledgeRecords();
  const task = tasks.find((item) => item.id === query) ||
    tasks.find((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()));
  const surface = surfaces.find((item) =>
    JSON.stringify(item).toLowerCase().includes(query.toLowerCase()) ||
    (task && JSON.stringify(item.dependencies).toLowerCase().includes((task.scope || "").toLowerCase()))
  ) || null;
  
  const queryLower = query.toLowerCase();
  const targetDomain = domain || (task ? task.scope : null);
  
  const scoredKnowledge = knowledge
    .map((item) => {
      const collection = item.collection || "teamwork_knowledge";
      const baseWeight = COLLECTION_WEIGHTS[collection] || 1;
      const reuseScore = item.reuseScore || 0;
      const freshnessScore = item.freshnessScore || 0;
      const confidence = item.confidence || 0.5;
      const domainMatch = targetDomain && (item.domain === targetDomain || (item.tags && item.tags.includes(targetDomain))) ? 1.5 : 1;
      const queryMatch = JSON.stringify(item).toLowerCase().includes(queryLower) ? 2 : 0.5;
      const score = baseWeight * (reuseScore * 0.3 + freshnessScore / 100 * 0.2 + confidence * 0.2) * domainMatch * queryMatch;
      return { ...item, relevanceScore: Math.round(score * 100) / 100 };
    })
    .sort((a, b) => b.reuseScore - a.reuseScore);
  
  const matchedKnowledge = scoredKnowledge.slice(0, limit);
  const reasoning = reasonTask(query || task?.goal || "aurora_ops");

  return {
    query,
    domain: targetDomain,
    matchedTask: task || null,
    surface,
    relatedFiles: surface?.dependencies || (task?.files ? task.files.split(",").map((item) => item.trim()) : []),
    knowledge: matchedKnowledge,
    knowledgeByCollection: Object.fromEntries(
      matchedKnowledge.reduce((acc, item) => {
        const col = item.collection || "other";
        if (!acc[col]) acc[col] = [];
        acc[col].push({ id: item.id, title: item.title, reuseScore: item.reuseScore });
        return acc;
      }, {})
    ),
    risks: reasoning.risks || [],
    nextAction: reasoning.nextStep || null,
    validation: reasoning.validation || [],
    precision: matchedKnowledge.length > 0 ? Math.round((matchedKnowledge.reduce((sum, k) => sum + k.reuseScore, 0) / matchedKnowledge.length) * 100) : 0
  };
}

export function getDomainContextPack(domain, limit = 10) {
  const knowledge = getKnowledgeRecords();
  const scoredKnowledge = knowledge
    .filter((item) => item.domain === domain || (item.tags && item.tags.includes(domain)))
    .map((item) => {
      const collection = item.collection || "teamwork_knowledge";
      const baseWeight = COLLECTION_WEIGHTS[collection] || 1;
      const reuseScore = item.reuseScore || 0;
      const freshnessScore = item.freshnessScore || 0;
      const confidence = item.confidence || 0.5;
      const score = baseWeight * (reuseScore * 0.4 + freshnessScore / 100 * 0.3 + confidence * 0.3);
      return { ...item, relevanceScore: Math.round(score * 100) / 100 };
    })
    .sort((a, b) => b.reuseScore - a.reuseScore)
    .slice(0, limit);

  return {
    domain,
    knowledge: scoredKnowledge,
    count: scoredKnowledge.length,
    avgReuseScore: scoredKnowledge.length > 0
      ? Math.round(scoredKnowledge.reduce((sum, k) => sum + (k.reuseScore || 0), 0) / scoredKnowledge.length * 100) / 100
      : 0
  };
}
