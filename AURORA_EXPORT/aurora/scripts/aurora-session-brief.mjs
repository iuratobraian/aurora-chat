import fs from "node:fs";
import path from "node:path";
import { getConnectorStatus } from "./aurora-connectors.mjs";
import { getLocalAgentStatus } from "./aurora-local-agents.mjs";
import { suggestNextBestImprovements } from "./aurora-product-intelligence.mjs";
import {
  buildAuroraDriftReport,
  buildAuroraHealthSnapshot,
  buildAuroraScorecardDaily,
  getAuroraSurfaceRegistry
} from "./aurora-sovereign.mjs";

const ROOT = process.cwd();
const TASK_BOARD_PATH = ".agent/workspace/coordination/TASK_BOARD.md";
const CURRENT_FOCUS_PATH = ".agent/workspace/coordination/CURRENT_FOCUS.md";
const RESEARCH_PATH = ".agent/brain/db/oss_ai_repos.jsonl";
const GROWTH_REPOS_PATH = ".agent/aurora/professional-growth-repos.json";

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
      status: normalizeStatus(status),
      owner,
      scope,
      files,
      goal,
      acceptance
    }));
}

function normalizeStatus(status) {
  return (status || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getTasks() {
  return parseTaskBoard(readText(TASK_BOARD_PATH));
}

function buildFocusSummary() {
  const text = readText(CURRENT_FOCUS_PATH);
  const owner = text.match(/^##\s+(.+)$/m)?.[1] || null;
  const taskId = text.match(/^- TASK-ID:\s+(.+)$/m)?.[1] || null;
  const status = text.match(/^- Estado:\s+(.+)$/m)?.[1] || null;
  const objective = text.match(/^- Voy a hacer:\s+(.+)$/m)?.[1] || null;

  return {
    owner,
    taskId,
    status,
    objective
  };
}

function compact(text, max = 220) {
  return (text || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function rankMcp(item) {
  const readinessScore = {
    installed: 6,
    ready: 5,
    configured: 5,
    pending: 4,
    research: 3,
    not_configured: 2,
    unknown: 1
  }[item.readiness || "unknown"] || 1;
  const priorityScore = {
    alta: 4,
    media: 2,
    baja: 1
  }[item.prioridad || "media"] || 1;
  const actionBonus =
    item.id === "agent_memory_mcp" ? 3 :
    item.id === "context_graph_mcp" ? 2 :
    item.id === "filesystem_mcp" ? 2 :
    item.id === "acontext" ? 2 :
    0;

  return readinessScore + priorityScore + actionBonus;
}

function describeMcpRole(item) {
  if (item.id === "filesystem_mcp") return "leer y operar el repo sin fricción";
  if (item.id === "agent_memory_mcp") return "recordar decisiones y runbooks entre sesiones";
  if (item.id === "context_graph_mcp") return "relacionar archivos, decisiones y conceptos";
  if (item.id === "playwright_mcp") return "validar flujos reales y smoke tests";
  if (item.id === "github_mcp") return "cerrar el loop entre board, PRs e issues";
  if (item.id === "acontext") return "destilar sesiones en memoria reusable tipo skill";
  return item.uso || "ampliar las capacidades operativas de Aurora";
}

function selectMcpStack(connectors) {
  const all = (connectors.mcp || [])
    .map((item) => ({
      id: item.id,
      prioridad: item.prioridad,
      readiness: item.readiness || "unknown",
      role: describeMcpRole(item),
      whyNow:
        item.id === "context_graph_mcp"
          ? "Aurora ya tiene memoria y retrieval; falta unir relaciones entre cambios y decisiones."
          : item.id === "agent_memory_mcp"
            ? "Ya figura instalado y es la pieza mas inmediata para reutilizar aprendizaje operativo."
            : item.id === "filesystem_mcp"
              ? "Todo inicio requiere inspeccion local segura y rapida del repo."
              : item.id === "acontext"
                ? "Sirve para destilar sesiones en skills, pero todavia esta en fase research."
                : item.uso,
      score: rankMcp(item)
    }))
    .sort((a, b) => b.score - a.score);

  const selected = [];
  for (const preferred of ["filesystem_mcp", "agent_memory_mcp", "context_graph_mcp"]) {
    const match = all.find((item) => item.id === preferred);
    if (match) selected.push(match);
  }

  const nextCandidate = all.find((item) => !selected.some((selectedItem) => selectedItem.id === item.id)) || null;

  return {
    selected,
    nextCandidate
  };
}

function buildResearchInsight(selectedMcpStack) {
  const cached = readJsonl(RESEARCH_PATH)
    .filter((item) => item.domain === "aurora_ops" && item.validated && item.statement)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0];

  if (cached) {
    const repo = String(cached.source || "").replace(/^github\.com\//, "");
    return {
      repo,
      source: "cached_research",
      insight: compact(cached.statement),
      application:
        repo === "QwenLM/qwen-agent"
          ? "Tomar su foco en tool use y guardrails, pero mantener validacion local antes de convertir cualquier hallazgo en contrato."
          : "Usar el hallazgo como referencia operativa, no como source of truth por encima del repo."
    };
  }

  const growth = readJson(GROWTH_REPOS_PATH);
  const track = growth.tracks.find((item) => item.id === "coding_agents") || growth.tracks[0];
  const repo = track?.repos?.[0] || "langchain-ai/langgraph";
  const candidate = selectedMcpStack.nextCandidate?.id === "acontext" ? "memodb-io/Acontext" : repo;

  return {
    repo: candidate,
    source: "curated_growth_catalog",
    insight: `Repositorio priorizado desde el track ${track?.label || "Agent Runtime"} para seguir profesionalizando tooling, memoria y orchestration.`,
    application: "Investigar este repo cuando haya conector web activo o usarlo como backlog curado de research."
  };
}

function chooseProactiveImprovement({ drift, selectedMcpStack, focus }) {
  const hasCoordinationDrift = drift.summary.totalSignals > 0;
  const relationalGap = selectedMcpStack.selected.find((item) => item.id === "context_graph_mcp");

  if (hasCoordinationDrift) {
    return {
      title: "Arranque operativo determinista",
      statement: "Convertir `inicio` en un brief ejecutable para reducir drift entre board, focus, conectores y backlog.",
      whyNow: `Aurora detecta ${drift.summary.totalSignals} señales de drift y hoy el contexto de arranque sigue disperso entre varios archivos.`,
      execution: focus.taskId?.includes("OPS-063")
        ? "OPS-063 en curso: exponer el brief por script, API y shell."
        : "Agregar el brief al flujo de entrada y usarlo como primera salida obligatoria."
    };
  }

  return {
    title: "Memoria relacional operativa",
    statement: "Subir `context_graph_mcp` a readiness usable para conectar decisiones, archivos y tareas.",
    whyNow: relationalGap?.whyNow || "Aurora ya tiene suficiente memoria plana; falta grafo operativo.",
    execution: "Preparar playbook, comando de chequeo y validacion de relaciones clave."
  };
}

function chooseNextAction(tasks, focus, selectedMcpStack) {
  const claimed = tasks.find((task) => task.id === focus.taskId) || tasks.find((task) => task.status === "claimed");
  if (claimed) {
    return {
      taskId: claimed.id,
      source: "board",
      statement: `${claimed.id}: ${claimed.goal}`,
      whyNow: `Ya existe owner (${claimed.owner}) y scope delimitado; el costo marginal mas bajo es cerrarlo bien.`,
      validation: ["npm run aurora:session-brief", "npm run aurora:drift", "npm run lint"]
    };
  }

  const pendingMemoryGap = selectedMcpStack.selected.find((item) => item.readiness === "pending" || item.readiness === "research");
  if (pendingMemoryGap) {
    return {
      taskId: pendingMemoryGap.id,
      source: "memory_gap",
      statement: `Operacionalizar ${pendingMemoryGap.id}`,
      whyNow: "Es el gap mas directo entre la memoria actual de Aurora y una capa realmente acumulativa.",
      validation: ["npm run aurora:conectores", "npm run aurora:health-snapshot"]
    };
  }

  const nextOpen = tasks.find((task) => task.status === "pending") || tasks.find((task) => task.status !== "done");
  if (nextOpen) {
    return {
      taskId: nextOpen.id || null,
      source: "board",
      statement: `${nextOpen.id}: ${nextOpen.goal}`,
      whyNow: "Es la siguiente entrada disponible del backlog canónico.",
      validation: ["npm run aurora:drift"]
    };
  }

  const recommendation = suggestNextBestImprovements().recommendations[0] || null;
  if (recommendation) {
    return {
      taskId: `AURORA-${recommendation.surfaceId}`,
      source: "product_intelligence",
      statement: `${recommendation.surfaceLabel}: ${recommendation.improvement}`,
      whyNow: `Aurora detecta una mejora ${recommendation.impact}/${recommendation.effort} sobre ${recommendation.surfaceId} con prioridad ${recommendation.priority}.`,
      validation: ["npm run aurora:product", "node scripts/aurora-session-brief.mjs --json", "npm run lint"]
    };
  }

  return {
    taskId: null,
    source: "fallback",
    statement: "Sin tarea abierta clara en el board",
    whyNow: "Hace falta reconciliar board y foco.",
    validation: ["npm run aurora:drift"]
  };
}

function buildCodingModeSummary() {
  const stack = readJson(".agent/aurora/app-stack.json");
  return {
    available: true,
    mode: "fullstack_interactive_shell",
    commands: ["/stack", "/repo-map", "/surface <id>", "/code-task <tarea>", "/fullstack <tarea>"],
    stack: `${stack.frontend.framework} + ${stack.frontend.bundler} + ${stack.frontend.styling} | ${stack.backend.server} | ${stack.data.primary}`,
    repoAreas: ["views/", "components/", "services/", "convex/", "server.ts", "scripts/"]
  };
}

export function buildAuroraSessionBrief() {
  const tasks = getTasks();
  const focus = buildFocusSummary();
  const health = buildAuroraHealthSnapshot();
  const drift = buildAuroraDriftReport();
  const scorecard = buildAuroraScorecardDaily();
  const connectors = getConnectorStatus();
  const localAgents = getLocalAgentStatus();
  const surfaceRegistry = getAuroraSurfaceRegistry();
  const selectedMcpStack = selectMcpStack(connectors);
  const research = buildResearchInsight(selectedMcpStack);
  const proactiveImprovement = chooseProactiveImprovement({
    drift,
    selectedMcpStack,
    focus
  });
  const nextAction = chooseNextAction(tasks, focus, selectedMcpStack);

  return {
    generatedAt: new Date().toISOString(),
    mode: "inicio",
    summary: {
      health: health.health,
      openTasks: tasks.filter((task) => task.status !== "done").length,
      driftSignals: drift.summary.totalSignals,
      auroraFunctions: health.auroraFunctions,
      connectorsReady: health.connectorsReady,
      localAgentsReady: [localAgents.ollama, localAgents.opencode, localAgents.codex].filter((agent) => agent?.instalado).length,
      overallScore: scorecard.metrics.overallScore
    },
    focus,
    proactiveImprovement,
    mcpSelection: selectedMcpStack,
    research,
    codingMode: buildCodingModeSummary(),
    context: {
      keySurface: surfaceRegistry.surfaces.find((surface) => surface.surfaceId === "operator_experience") || surfaceRegistry.surfaces[0],
      scorecard: scorecard.metrics
    },
    nextAction,
    validation: ["node scripts/aurora-session-brief.mjs --json", "npm run aurora:drift", "npm run aurora:health-snapshot"]
  };
}

export function printAuroraSessionBrief(brief = buildAuroraSessionBrief()) {
  console.log("AURORA SESSION BRIEF");
  console.log(`generatedAt: ${brief.generatedAt}`);
  console.log(`health: ${brief.summary.health} | openTasks: ${brief.summary.openTasks} | drift: ${brief.summary.driftSignals} | score: ${brief.summary.overallScore}`);
  console.log("");
  console.log("focus");
  console.log(`- owner: ${brief.focus.owner || "n/a"}`);
  console.log(`- task: ${brief.focus.taskId || "n/a"}`);
  console.log(`- objective: ${brief.focus.objective || "n/a"}`);
  console.log("");
  console.log("proactiveImprovement");
  console.log(`- ${brief.proactiveImprovement.title}: ${brief.proactiveImprovement.statement}`);
  console.log(`- whyNow: ${brief.proactiveImprovement.whyNow}`);
  console.log(`- execution: ${brief.proactiveImprovement.execution}`);
  console.log("");
  console.log("selectedMcpStack");
  for (const item of brief.mcpSelection.selected) {
    console.log(`- ${item.id} [${item.readiness}] -> ${item.role}`);
  }
  if (brief.mcpSelection.nextCandidate) {
    console.log(`- nextCandidate: ${brief.mcpSelection.nextCandidate.id} [${brief.mcpSelection.nextCandidate.readiness}]`);
  }
  console.log("");
  console.log("research");
  console.log(`- repo: ${brief.research.repo}`);
  console.log(`- source: ${brief.research.source}`);
  console.log(`- insight: ${brief.research.insight}`);
  console.log(`- application: ${brief.research.application}`);
  console.log("");
  console.log("codingMode");
  console.log(`- mode: ${brief.codingMode.mode}`);
  console.log(`- stack: ${brief.codingMode.stack}`);
  console.log(`- commands: ${brief.codingMode.commands.join(", ")}`);
  console.log("");
  console.log("nextAction");
  console.log(`- ${brief.nextAction.statement}`);
  console.log(`- whyNow: ${brief.nextAction.whyNow}`);
  console.log(`- validation: ${brief.nextAction.validation.join(", ")}`);
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  const brief = buildAuroraSessionBrief();
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(brief, null, 2));
  } else {
    printAuroraSessionBrief(brief);
  }
}
