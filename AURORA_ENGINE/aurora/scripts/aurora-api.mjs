import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { searchWeb } from "./aurora-web-search.mjs";
import { addAgentToRegistry, getAgentRegistry, getAgentTrackerSnapshot } from "./aurora-agent-tracker.mjs";
import { addRepo, getRepos, setActiveRepo } from "./aurora-repo-manager.mjs";
import { getConnectorStatus } from "./aurora-connectors.mjs";
import { askOllama, getLocalAgentStatus } from "./aurora-local-agents.mjs";
import { listAuroraFunctions, runAuroraFunction } from "./aurora-agent-functions.mjs";
import { researchRepo, recordResearch } from "./aurora-research.mjs";
import { runSpeedCheck } from "./aurora-speed-check.mjs";
import { spawn } from "node:child_process";
import { buildExecutionPlan, buildTaskClosure, reasonTask, summarizeHandoff } from "./aurora-reasoning.mjs";
import { hf } from "../../lib/aurora/hf-tools.mjs";
import {
  buildAuroraDriftReport,
  buildAuroraHandoffBrief,
  buildAuroraHealthSnapshot,
  buildAuroraNextBestStep,
  buildAuroraRiskSignal,
  buildAuroraScorecardDaily,
  buildAuroraTaskContextPack,
  buildAuroraValidationChecklist,
  getAuroraContracts,
  getAuroraSurfaceRegistry,
  getDomainContextPack,
  getHistoricalScores
} from "./aurora-sovereign.mjs";
import { buildAuroraSessionBrief } from "./aurora-session-brief.mjs";
import {
  buildProductSnapshot,
  getSurfaceHealth,
  getProductSurfaces,
  detectProductFailureModes,
  suggestNextBestImprovements
} from "./aurora-product-intelligence.mjs";

const ROOT = process.cwd();
const PORT = Number(process.env.AURORA_PORT || 4310);
const RUNTIME_STATUS_FILE = path.join(ROOT, ".agent/aurora/aurora-api-runtime.json");

const readText = (relativePath) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");

const readJson = (relativePath) =>
  JSON.parse(readText(relativePath));

function safeReadJson(relativePath) {
  const full = path.join(ROOT, relativePath);
  if (!fs.existsSync(full)) return null;
  try {
    return JSON.parse(fs.readFileSync(full, "utf8"));
  } catch {
    return null;
  }
}

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

function writeRuntimeStatus(state, extra = {}) {
  const dir = path.dirname(RUNTIME_STATUS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    RUNTIME_STATUS_FILE,
    JSON.stringify(
      {
        updatedAt: new Date().toISOString(),
        state,
        pid: process.pid,
        port: PORT,
        uptimeSeconds: Math.round(process.uptime()),
        ...extra
      },
      null,
      2
    )
  );
}

function parseTaskBoard(markdown) {
  const lines = markdown.split(/\r?\n/);
  const rows = [];
  for (const line of lines) {
    if (!line.startsWith("|")) continue;
    if (line.includes("TASK-ID") || line.includes("---")) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (cells.length < 7) continue;
    const [id, status, owner, scope, files, goal, acceptance] = cells;
    rows.push({ id, status, owner, scope, files, goal, acceptance });
  }
  return rows;
}

function summarizeSystem() {
  const board = parseTaskBoard(
    readText(".agent/workspace/coordination/TASK_BOARD.md")
  );
  const focus = readText(".agent/workspace/coordination/CURRENT_FOCUS.md");
  const catalog = readJson(".agent/aurora/creation-catalog.json");
  const open = board.filter((task) => !["done"].includes(task.status));
  const critical = open.filter((task) => /^CRIT|^SEC|^PAY|^STAB/.test(task.id));

  return {
    aurora: {
      name: "Aurora Core",
      mode: "terminal-ops",
      status: "ready",
      port: PORT
    },
    tasks: {
      total: board.length,
      open: open.length,
      critical: critical.length
    },
    focusPreview: focus.split(/\r?\n/).slice(0, 20).join("\n"),
    creationCategories: catalog.categories.map((category) => ({
      id: category.id,
      label: category.label,
      count: category.items.length
    }))
  };
}

function getKnowledge(query) {
  const files = [
    ".agent/brain/db/heuristics.jsonl",
    ".agent/brain/db/anti_patterns.jsonl",
    ".agent/brain/db/patterns.jsonl",
    ".agent/brain/db/ideas.jsonl",
    ".agent/brain/db/references.jsonl",
    ".agent/brain/db/error_catalog.jsonl",
    ".agent/brain/db/teamwork_knowledge.jsonl"
  ];
  const all = files.flatMap((relativePath) =>
    readJsonl(relativePath).map((item) => ({
      ...item,
      collection: path.basename(relativePath)
    }))
  );
  if (!query) return all;
  return all.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(query.toLowerCase())
  );
}

function getTeamworkRecords(query = "") {
  const pathToRecords = path.join(ROOT, ".agent/brain/db/teamwork_knowledge.jsonl");
  if (!fs.existsSync(pathToRecords)) return [];
  const records = readJsonl(pathToRecords);
  if (!query) return records;
  return records.filter((record) =>
    JSON.stringify(record).toLowerCase().includes(query.toLowerCase())
  );
}

function appendTeamworkRecord(entry) {
  const pathToRecords = path.join(ROOT, ".agent/brain/db/teamwork_knowledge.jsonl");
  const payload = {
    id: entry.id || `LEARN-${Date.now()}`,
    title: entry.title || "Aurora learning",
    statement: entry.statement,
    tags: entry.tags || ["learn"],
    source: entry.source || "aurora"
  };
  fs.appendFileSync(pathToRecords, JSON.stringify(payload) + "\n");
  return payload;
}

function logActivity(entry) {
  try {
    const dest = path.join(ROOT, ".agent/brain/db/activity_log.jsonl");
    const payload = {
      timestamp: new Date().toISOString(),
      ...entry
    };
    fs.appendFileSync(dest, JSON.stringify(payload) + "\n");
  } catch {
    /* best effort logging */
  }
}

function looksLikeOperationalTask(query) {
  const lower = (query || "").toLowerCase();
  return /(mejorar|arreglar|corregir|implementar|crear|integrar|refactor|optimizar|validar|build|lint|test|feed|comunidad|onboarding|creator|server|convex|api|payment|auth|webhook|deploy|ui|dashboard)/.test(lower);
}

function looksLikeCodingTask(query) {
  const lower = (query || "").toLowerCase();
  return /(fix|bug|error|implementar|crear|agregar|program|codigo|fullstack|frontend|backend|convex|api|component|view|schema|mutation|query|auth|payment|payments|pago|pagos|billing|webhook|script|refactor|route|endpoint|hook|ui)/.test(lower);
}

async function buildFullstackTaskReply(query) {
  const brief = await runAuroraFunction("fullstack-task-brief", query);
  const parts = [
    `Lo trataría como ${brief.scope} sobre ${brief.surface.label}.`,
    `Plan: ${brief.operatingSteps.slice(0, 3).join(" -> ")}.`,
    brief.likelyFiles.length ? `Abrir primero: ${brief.likelyFiles.slice(0, 3).join(", ")}.` : "",
    `Validación mínima: ${brief.validation.join(", ")}.`,
    brief.quickChecks.length ? `Checks rápidos: ${brief.quickChecks.slice(0, 2).join("; ")}.` : "",
    `Riesgo ${brief.risk.severity}: ${brief.risk.recommendation}.`
  ].filter(Boolean);

  return {
    answer: parts.join(" "),
    sources: [
      brief.scope,
      brief.domain,
      brief.surface.id,
      ...brief.likelyFiles.slice(0, 4)
    ].filter(Boolean),
    reasoning: brief,
    mode: "fullstack_task_reply"
  };
}

function buildReasonedTaskReply(query) {
  const reasoning = reasonTask(query);
  const classification = reasoning.classification;
  const risk = reasoning.risk;
  const next = reasoning.next;
  const validation = reasoning.validation;
  const quickChecks = reasoning.quickChecks;
  const plan = reasoning.plan;

  const parts = [
    `Lo trataría como ${classification.likelyScope} sobre ${classification.likelySurface}.`,
    `Plan: ${plan.steps.slice(0, 3).join(" -> ")}.`,
    `Siguiente paso: ${next.nextStep}.`,
    classification.likelyFiles.length ? `Abrir primero: ${classification.likelyFiles.slice(0, 3).join(", ")}.` : "",
    `Validación mínima: ${validation.commands.join(", ")}.`,
    quickChecks.checks.length ? `Checks rápidos: ${quickChecks.checks.slice(0, 2).join("; ")}.` : "",
    risk.severity !== "low" ? `Riesgo ${risk.severity}: ${risk.recommendation}.` : "Riesgo controlado si mantienes el scope chico."
  ].filter(Boolean);

  return {
    answer: parts.join(" "),
    sources: [
      classification.likelyScope,
      classification.likelyDomain,
      ...classification.relatedTasks.map((task) => task.id),
      ...classification.relatedKnowledge
    ].filter(Boolean).slice(0, 8),
    reasoning
  };
}

function looksLikeTaskClosure(query) {
  const lower = (query || "").toLowerCase();
  return /(cerrar|cierra|close|handoff|entregar|finalizar|terminar)\s+[a-z]{2,}-?\d+/i.test(lower);
}

function extractTaskId(query) {
  return query.match(/[A-Z]{2,}-\d+/i)?.[0] || "";
}

function buildClosureReply(query) {
  const taskId = extractTaskId(query);
  const notes = query.replace(taskId, "").trim();
  const closure = buildTaskClosure(taskId, notes);
  if (!closure.found) {
    return {
      answer: closure.summary,
      sources: []
    };
  }

  const parts = [
    closure.closeSummary,
    `Estado sugerido: ${closure.statusSuggestion}.`,
    `Validar: ${closure.handoff.validation.join(", ")}.`,
    closure.handoff.quickChecks.length ? `Checks finales: ${closure.handoff.quickChecks.slice(0, 2).join("; ")}.` : "",
    `Handoff: ${closure.handoff.summary}.`
  ].filter(Boolean);

  return {
    answer: parts.join(" "),
    sources: [taskId, closure.acceptance].filter(Boolean)
  };
}

async function buildChatReply(query, connectorsHint = null, localAgentsHint = null) {
  const q = (query || "").trim();
  const connectors = connectorsHint || getConnectorStatus();
  const localAgents = localAgentsHint || getLocalAgentStatus();
  if (!q) {
    return {
      answer: "Preguntame sobre estado, tareas, creaciones, conocimiento o nuevos incubadores.",
      sources: ["status", "tasks", "creations", "knowledge"]
    };
  }

  const lower = q.toLowerCase();
  const tasks = parseTaskBoard(readText(".agent/workspace/coordination/TASK_BOARD.md"));
  const knowledge = getKnowledge(lower).slice(0, 5);
  const catalog = readJson(".agent/aurora/creation-catalog.json");

  if (lower.includes("task") || lower.includes("tarea") || lower.includes("crit")) {
    const open = tasks.filter((task) => task.status !== "done").slice(0, 5);
    return {
      answer: `Hay ${open.length} tareas abiertas relevantes en la muestra actual. La prioridad fuerte sigue estando en críticos, seguridad, pagos y estabilidad.`,
      sources: open.map((task) => task.id)
    };
  }

  if (lower.includes("crear") || lower.includes("build") || lower.includes("idea")) {
    return {
      answer: `Aurora puede iniciar incubadores para webs, apps móviles, juegos, sistemas de IA y futuros productos. Usa bootstrap si ya tenés una idea con nombre y tipo.`,
      sources: catalog.categories.map((category) => category.label)
    };
  }

  if (looksLikeTaskClosure(q)) {
    return buildClosureReply(q);
  }

  if (looksLikeCodingTask(q)) {
    return await buildFullstackTaskReply(q);
  }

  if (looksLikeOperationalTask(q)) {
    return buildReasonedTaskReply(q);
  }

  if (knowledge.length > 0) {
    return {
      answer: `Encontré ${knowledge.length} piezas de conocimiento relacionadas. La señal principal es: ${knowledge[0].statement || knowledge[0].title || knowledge[0].id}.`,
      sources: knowledge.map((item) => item.title || item.id)
    };
  }

  const teamworkRecords = readJsonl(".agent/brain/db/teamwork_knowledge.jsonl").filter((record) =>
    JSON.stringify(record).toLowerCase().includes(lower)
  );
  if (teamworkRecords.length > 0) {
    return {
      answer: `Dato operativo: ${teamworkRecords[0].statement}. Utiliza /help, /apis y /local para coordinar agentes.`,
      sources: teamworkRecords.map((record) => record.id)
    };
  }

  const open = tasks.filter((task) => task.status !== "done");
  const critical = open.filter((task) => /^CRIT|^SEC|^PAY|^STAB/.test(task.id));
  const focusLine = readText(".agent/workspace/coordination/CURRENT_FOCUS.md").split(/\r?\n/)[0] || "sin foco claro";

  return {
    answer: `Contexto actual: ${open.length} tareas abiertas (${critical.length} críticas). Foco: ${focusLine}. Conectores activos: ${connectors.apis.filter((item) => item.activo).map((item) => item.id).join(", ") || "ninguno"}. Agentes locales: Ollama ${localAgents.ollama.instalado ? "listo" : "no instalado"}, Codex ${localAgents.codex.instalado ? "listo" : "no instalado"}, OpenCode ${localAgents.opencode.instalado ? "listo" : "no instalado"}. Dadme un comando (/help, /apis, /local, /ollama <prompt>, /codex <prompt>) o preguntad por tareas/conocimiento.`,
    sources: open.slice(0, 5).map((task) => task.id)
  };
}

function buildImageBrief(prompt) {
  const subject = (prompt || "concept art").trim();
  return {
    ok: true,
    prompt: subject,
    brief: {
      subject,
      style: "cinematic, high-clarity, product-grade visual language",
      composition: "clear focal point, strong hierarchy, readable silhouette",
      lighting: "soft dramatic lighting with depth",
      negativePrompt: "blurry, deformed hands, duplicated elements, noisy background, unreadable text",
      note: "Este runtime hoy genera briefs de imagen. La generación final debe conectarse a un provider externo antes de considerarse completa."
    }
  };
}

async function buildWebSearchReply(query) {
  return await searchWeb(query);
}

async function buildSmartChatReply(query) {
  const trimmed = (query || "").trim();
  const connectors = getConnectorStatus();
  const localAgents = getLocalAgentStatus();
  if (trimmed === "/help") {
    const response = {
      answer: "Comandos: /help, /apis, /local, /ollama <prompt>, /repos, /agentes, /web <consulta>.",
      sources: ["chat", "local", "connectors"]
    };
    logActivity({ command: "/help", response: response.answer, success: true });
    return response;
  }
  if (trimmed === "/apis") {
    const connectors = getConnectorStatus();
    const activeApis = connectors.apis.filter((item) => item.activo).map((item) => item.id);
    const response = {
      answer: `APIs activas: ${activeApis.length ? activeApis.join(", ") : "ninguna"}. Ollama ${connectors.locales.ollama.instalado ? "detectado" : "no detectado"}. OpenCode ${connectors.locales.opencode.instalado ? "detectado" : "no detectado"}.`,
      sources: activeApis
    };
    logActivity({ command: "/apis", response: response.answer, connectors: activeApis, success: true });
    return response;
  }
  if (trimmed === "/local") {
    const local = getLocalAgentStatus();
    const response = {
      answer: `Ollama ${local.ollama.instalado ? "instalado" : "no instalado"} con ${local.ollama.modelos.length} modelos. OpenCode ${local.opencode.instalado ? "instalado" : "no instalado"}. Codex ${local.codex.instalado ? "instalado" : "no instalado"}.`,
      sources: local.ollama.modelos.map((item) => item.nombre)
    };
    logActivity({ command: "/local", response: response.answer, agents: ["ollama","opencode","codex"], success: true });
    return response;
  }
  if (trimmed.startsWith("/ollama ")) {
    const result = await askOllama(trimmed.slice(8));
    const response = {
      answer: result.answer,
      provider: result.provider,
      sources: result.model ? [result.model] : []
    };
    logActivity({ command: "/ollama", response: response.answer, provider: result.provider, success: result.ok });
    return response;
  }
  if (trimmed.startsWith("/web ")) {
    const term = trimmed.slice(5).trim();
    if (!term) {
      return {
        answer: "Usa /web <consulta> para pedir busqueda activa en internet.",
        sources: []
      };
    }
    const webResult = await searchWeb(term);
    if (webResult.unavailable) {
      return {
        answer: `No pude buscar en internet porque ${webResult.message}. Activá un proveedor configurado o verificá la conexión.`,
        sources: []
      };
    }
    const response = {
      answer: webResult.answer || "Traje resultados web relevantes.",
      provider: webResult.provider,
      sources: (webResult.results || []).map((item) => item.url)
    };
    logActivity({ command: "/web", query: term, provider: webResult.provider, success: !webResult.unavailable });
    return response;
  }

  if (trimmed.startsWith("/research ")) {
    const repo = trimmed.slice(10).trim();
    if (!repo) {
      return {
        answer: "Usa /research <owner/repo> para traer datos de GitHub.",
        sources: []
      };
    }
    const entry = await researchRepo(repo);
    const response = {
      answer: entry.record.statement || `Resumen de ${repo} generado.`,
      sources: [entry.record.source],
      provider: entry.provider
    };
    recordResearch(entry);
    return response;
  }

  const local = await buildChatReply(query, connectors, localAgents);
  if (
    local.sources?.length ||
    /pregúntame|encontré|hay\s+\d+\s+tareas|puede iniciar/i.test(local.answer)
  ) {
    return local;
  }

  const web = await searchWeb(query);
  if (!web.unavailable && (web.answer || web.results?.length)) {
    return {
      answer: web.answer || "No había suficiente señal local; traje resultados web relevantes para seguir avanzando.",
      sources: (web.results || []).map((item) => item.url),
      provider: web.provider,
      mode: "web_fallback"
    };
  }

  const fallbackResponse = {
    ...local,
    note: web.unavailable ? web.message : undefined
  };
  logActivity({
    command: "fallback",
    response: fallbackResponse.answer,
    connectors: connectors.apis.filter((item) => item.activo).map((item) => item.id),
    success: !!(fallbackResponse.sources && fallbackResponse.sources.length)
  });
  return fallbackResponse;
}

function createIncubatorBootstrap(kind, name) {
  const slug = (name || "new-creation")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "new-creation";
  const incubatorDir = path.join(ROOT, ".agent/workspace/incubator", slug);
  fs.mkdirSync(incubatorDir, { recursive: true });

  const spec = `# ${name}\n\n## Metadata\n\n- Kind: ${kind}\n- Slug: ${slug}\n- Created by: Aurora Core API\n\n## Intent\n\n- Problem:\n- User:\n- Outcome:\n- Constraints:\n\n## Product\n\n- Core flow:\n- Modules:\n- Monetization:\n- Risks:\n\n## Architecture\n\n- Frontend:\n- Backend:\n- Data:\n- Integrations:\n\n## Validation\n\n- Acceptance:\n- Fallback:\n- Next step:\n`;
  const tasks = `# ${name} Tasks\n\n| TASK-ID | Status | Owner | Scope | Goal |\n|---|---|---|---|---|\n| ${slug.toUpperCase().replace(/-/g, "_")}-001 | todo | unassigned | ${kind} | Convert initial incubator spec into executable product spec |\n| ${slug.toUpperCase().replace(/-/g, "_")}-002 | todo | unassigned | ${kind} | Define architecture and data model |\n| ${slug.toUpperCase().replace(/-/g, "_")}-003 | todo | unassigned | ${kind} | Define monetization and validation |\n`;
  const notes = `# ${name} Notes\n\n## Why this exists\n\nIncubator scaffold generated by Aurora Core Local Runtime.\n`;

  fs.writeFileSync(path.join(incubatorDir, "SPEC.md"), spec, "utf8");
  fs.writeFileSync(path.join(incubatorDir, "TASKS.md"), tasks, "utf8");
  fs.writeFileSync(path.join(incubatorDir, "NOTES.md"), notes, "utf8");

  return {
    ok: true,
    slug,
    path: `.agent/workspace/incubator/${slug}`
  };
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload, null, 2));
}

function sendFile(res, fullPath, contentType = "text/plain; charset=utf-8") {
  res.writeHead(200, { "Content-Type": contentType });
  res.end(fs.readFileSync(fullPath));
}

function buildRuntimeStatus() {
  return {
    ok: true,
    runtime: {
      pid: process.pid,
      port: PORT,
      uptimeSeconds: Math.round(process.uptime()),
      node: process.version,
      cwd: ROOT
    },
    processStatus: safeReadJson(".agent/aurora/aurora-api-process.json"),
    runtimeStatus: safeReadJson(".agent/aurora/aurora-api-runtime.json")
  };
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://localhost:${PORT}`);

    if (url.pathname === "/health") {
      return sendJson(res, 200, {
        ok: true,
        service: "aurora-api",
        aurora: "Aurora Core"
      });
    }

    if (url.pathname === "/" || url.pathname === "/app") {
      return sendFile(
        res,
        path.join(ROOT, ".agent/aurora/app/index.html"),
        "text/html; charset=utf-8"
      );
    }

    if (url.pathname === "/app/styles.css") {
      return sendFile(
        res,
        path.join(ROOT, ".agent/aurora/app/styles.css"),
        "text/css; charset=utf-8"
      );
    }

    if (url.pathname === "/app/app.js") {
      return sendFile(
        res,
        path.join(ROOT, ".agent/aurora/app/app.js"),
        "application/javascript; charset=utf-8"
      );
    }

    if (url.pathname === "/status") {
      return sendJson(res, 200, summarizeSystem());
    }

    if (url.pathname === "/aurora/surfaces") {
      return sendJson(res, 200, getAuroraSurfaceRegistry());
    }

    if (url.pathname === "/aurora/contracts") {
      const items = getAuroraContracts();
      return sendJson(res, 200, { items, total: items.length });
    }

    if (url.pathname === "/aurora/health-snapshot") {
      return sendJson(res, 200, buildAuroraHealthSnapshot());
    }

    if (url.pathname === "/aurora/runtime-status") {
      return sendJson(res, 200, buildRuntimeStatus());
    }

    if (url.pathname === "/aurora/session-brief") {
      return sendJson(res, 200, buildAuroraSessionBrief());
    }

    if (url.pathname === "/aurora/drift-report") {
      return sendJson(res, 200, buildAuroraDriftReport());
    }

    if (url.pathname === "/aurora/risk-signal") {
      const q = url.searchParams.get("q") || "";
      if (!q) return sendJson(res, 400, { ok: false, error: "q required" });
      return sendJson(res, 200, buildAuroraRiskSignal(q));
    }

    if (url.pathname === "/aurora/validation-checklist") {
      const q = url.searchParams.get("q") || "";
      if (!q) return sendJson(res, 400, { ok: false, error: "q required" });
      return sendJson(res, 200, buildAuroraValidationChecklist(q));
    }

    if (url.pathname === "/aurora/next-best-step") {
      const q = url.searchParams.get("q") || "";
      if (!q) return sendJson(res, 400, { ok: false, error: "q required" });
      return sendJson(res, 200, buildAuroraNextBestStep(q));
    }

    if (url.pathname === "/aurora/scorecard-daily") {
      return sendJson(res, 200, buildAuroraScorecardDaily());
    }

    if (url.pathname === "/aurora/scorecard-history") {
      const days = parseInt(url.searchParams.get("days") || "7");
      return sendJson(res, 200, getHistoricalScores(days));
    }

    if (url.pathname === "/aurora/task-context") {
      const q = url.searchParams.get("q") || "";
      const domain = url.searchParams.get("domain") || null;
      const limit = parseInt(url.searchParams.get("limit") || "10");
      if (!q) return sendJson(res, 400, { ok: false, error: "q required" });
      return sendJson(res, 200, buildAuroraTaskContextPack(q, domain, limit));
    }

    if (url.pathname === "/aurora/domain-context") {
      const domain = url.searchParams.get("domain") || "";
      const limit = parseInt(url.searchParams.get("limit") || "10");
      if (!domain) return sendJson(res, 400, { ok: false, error: "domain required" });
      return sendJson(res, 200, getDomainContextPack(domain, limit));
    }

    if (url.pathname === "/aurora/handoff-brief") {
      const taskId = url.searchParams.get("taskId") || "";
      const notes = url.searchParams.get("notes") || "";
      if (!taskId) return sendJson(res, 400, { ok: false, error: "taskId required" });
      return sendJson(res, 200, buildAuroraHandoffBrief(taskId, notes));
    }

    if (url.pathname === "/aurora/repo-map") {
      return sendJson(res, 200, { ok: true, result: await runAuroraFunction("repo-map") });
    }

    if (url.pathname === "/aurora/stack-brief") {
      const q = url.searchParams.get("q") || "";
      return sendJson(res, 200, { ok: true, result: await runAuroraFunction("architecture-brief", q) });
    }

    if (url.pathname === "/aurora/surface-brief") {
      const q = url.searchParams.get("q") || "";
      if (!q) return sendJson(res, 400, { ok: false, error: "q required" });
      return sendJson(res, 200, { ok: true, result: await runAuroraFunction("surface-brief", q) });
    }

    if (url.pathname === "/aurora/fullstack-task-brief") {
      const q = url.searchParams.get("q") || "";
      if (!q) return sendJson(res, 400, { ok: false, error: "q required" });
      return sendJson(res, 200, { ok: true, result: await runAuroraFunction("fullstack-task-brief", q) });
    }

    if (url.pathname === "/aurora/coding-kickoff") {
      const q = url.searchParams.get("q") || "";
      if (!q) return sendJson(res, 400, { ok: false, error: "q required" });
      return sendJson(res, 200, { ok: true, result: await runAuroraFunction("coding-kickoff", q) });
    }

    if (url.pathname === "/tasks") {
      const tasks = parseTaskBoard(
        readText(".agent/workspace/coordination/TASK_BOARD.md")
      );
      const status = url.searchParams.get("status");
      const filtered = status
        ? tasks.filter((task) => task.status === status)
        : tasks;
      return sendJson(res, 200, { items: filtered, total: filtered.length });
    }

    if (url.pathname === "/agentes") {
      return sendJson(res, 200, getAgentRegistry());
    }

    if (url.pathname === "/agentes/rastreo") {
      return sendJson(res, 200, getAgentTrackerSnapshot());
    }

    if (url.pathname === "/agentes/agregar") {
      const nombre = url.searchParams.get("nombre") || "";
      const tipo = url.searchParams.get("tipo") || "especialista";
      const fortalezas = (url.searchParams.get("fortalezas") || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      return sendJson(res, 200, {
        ok: true,
        agente: addAgentToRegistry({
          nombre,
          tipo,
          origen: "externo",
          estado: "disponible",
          fortalezas
        }),
        total: getAgentRegistry().agentes.length
      });
    }

    if (url.pathname === "/repos") {
      return sendJson(res, 200, getRepos());
    }

    if (url.pathname === "/repos/agregar") {
      const nombre = url.searchParams.get("nombre") || "";
      const ruta = url.searchParams.get("ruta") || "";
      const tipo = url.searchParams.get("tipo") || "general";
      return sendJson(res, 200, {
        ok: true,
        repo: addRepo(nombre, ruta, tipo)
      });
    }

    if (url.pathname === "/learn") {
      const fact = url.searchParams.get("fact") || "";
      if (!fact) {
        return sendJson(res, 400, { ok: false, error: "Fact is required" });
      }
      const record = appendTeamworkRecord({
        statement: fact,
        tags: ["learn"]
      });
      logActivity({ command: "/learn", response: fact, success: true });
      return sendJson(res, 200, { ok: true, record });
    }

    if (url.pathname === "/repos/activar") {
      const nombre = url.searchParams.get("nombre") || "";
      return sendJson(res, 200, {
        ok: true,
        repo: setActiveRepo(nombre)
      });
    }

    if (url.pathname === "/conectores") {
      return sendJson(res, 200, getConnectorStatus());
    }

    if (url.pathname === "/updates") {
      return new Promise((resolve) => {
        const child = spawn("node", ["scripts/aurora-update-pipeline.mjs"], {
          cwd: ROOT,
          stdio: "inherit",
          shell: true
        });
        child.on("close", (code) => {
          if (code === 0) resolve(sendJson(res, 200, { ok: true, message: "Pipeline ejecutado" }));
          else resolve(sendJson(res, 500, { ok: false, error: "Pipeline falló" }));
        });
      });
    }

    if (url.pathname === "/antigravity-sync") {
      return new Promise((resolve) => {
        const child = spawn("node", ["scripts/aurora-antigravity-sync.mjs"], {
          cwd: ROOT,
          stdio: "inherit",
          shell: true
        });
        child.on("close", (code) => {
          if (code === 0) resolve(sendJson(res, 200, { ok: true, message: "Antigravity sync ejecutado" }));
          else resolve(sendJson(res, 500, { ok: false, error: "Antigravity sync falló" }));
        });
      });
    }

    if (url.pathname === "/speed-check") {
      const result = await runSpeedCheck();
      return sendJson(res, 200, result);
    }

    if (url.pathname === "/research") {
      const repo = url.searchParams.get("repo") || "";
      if (!repo) return sendJson(res, 400, { ok: false, error: "repo required" });
      const entry = await researchRepo(repo);
      recordResearch(entry);
      return sendJson(res, 200, { ok: true, entry: entry.record });
    }

    if (url.pathname === "/local-agents") {
      return sendJson(res, 200, getLocalAgentStatus());
    }

    if (url.pathname === "/creations") {
      return sendJson(res, 200, readJson(".agent/aurora/creation-catalog.json"));
    }

    if (url.pathname === "/knowledge") {
      const q = url.searchParams.get("q") || "";
      const items = getKnowledge(q);
      return sendJson(res, 200, { items, total: items.length, query: q });
    }

    if (url.pathname === "/functions") {
      return sendJson(res, 200, { total: listAuroraFunctions().length, items: listAuroraFunctions() });
    }

    if (url.pathname === "/functions/run") {
      const name = url.searchParams.get("name") || "";
      const input = url.searchParams.get("input") || "";
      if (!name) return sendJson(res, 400, { ok: false, error: "name required" });
      const result = await runAuroraFunction(name, input);
      return sendJson(res, 200, { ok: true, name, result });
    }

    if (url.pathname === "/reason/task") {
      const q = url.searchParams.get("q") || "";
      if (!q) return sendJson(res, 400, { ok: false, error: "q required" });
      return sendJson(res, 200, { ok: true, reasoning: reasonTask(q) });
    }

    if (url.pathname === "/reason/plan") {
      const q = url.searchParams.get("q") || "";
      if (!q) return sendJson(res, 400, { ok: false, error: "q required" });
      return sendJson(res, 200, { ok: true, plan: buildExecutionPlan(q) });
    }

    if (url.pathname === "/reason/handoff") {
      const taskId = url.searchParams.get("taskId") || "";
      if (!taskId) return sendJson(res, 400, { ok: false, error: "taskId required" });
      return sendJson(res, 200, { ok: true, handoff: summarizeHandoff(taskId) });
    }

    if (url.pathname === "/reason/close") {
      const taskId = url.searchParams.get("taskId") || "";
      const notes = url.searchParams.get("notes") || "";
      if (!taskId) return sendJson(res, 400, { ok: false, error: "taskId required" });
      return sendJson(res, 200, { ok: true, closure: buildTaskClosure(taskId, notes) });
    }

    if (url.pathname === "/chat") {
      const q = url.searchParams.get("q") || "";
      return sendJson(res, 200, await buildSmartChatReply(q));
    }

    if (url.pathname === "/image/brief") {
      const prompt = url.searchParams.get("prompt") || "";
      return sendJson(res, 200, buildImageBrief(prompt));
    }

    if (url.pathname === "/web/search") {
      const q = url.searchParams.get("q") || "";
      return sendJson(res, 200, await buildWebSearchReply(q));
    }

    if (url.pathname === "/skills") {
      const full = path.join(ROOT, ".agent/skills/README.md");
      return sendJson(res, 200, {
        ok: fs.existsSync(full),
        readme: fs.existsSync(full) ? fs.readFileSync(full, "utf8") : null,
        note: fs.existsSync(full) ? undefined : "README de skills no disponible en este repo."
      });
    }

    if (url.pathname === "/bootstrap") {
      const kind = url.searchParams.get("kind") || "web_platform";
      const name = url.searchParams.get("name") || "new-creation";
      return sendJson(res, 200, createIncubatorBootstrap(kind, name));
    }

    if (url.pathname === "/menu") {
      return sendJson(res, 200, {
        aurora: "Aurora Core",
        options: [
          "status",
          "tasks",
          "agentes",
          "repos",
          "conectores",
          "creations",
          "knowledge",
          "web",
          "bootstrap",
          "skills",
          "health"
        ],
        commands: {
          menu: "npm run aurora:menu",
          status: "npm run aurora:status",
          tasks: "npm run aurora:tasks",
          agentes: "npm run aurora:agentes",
          rastreo: "npm run aurora:rastreo",
          repos: "npm run aurora:repos",
          conectores: "npm run aurora:conectores",
          creations: "npm run aurora:creations",
          knowledge: "npm run aurora:knowledge -- strategy",
          web: "npm run aurora:web -- architecture patterns",
          create: "npm run aurora:create -- --kind web_platform --name \"new platform\"",
          api: "npm run aurora:api"
        }
      });
    }

    if (url.pathname === "/aurora/product-snapshot") {
      return sendJson(res, 200, buildProductSnapshot());
    }

    if (url.pathname === "/aurora/product/surfaces") {
      return sendJson(res, 200, { surfaces: getProductSurfaces() });
    }

    if (url.pathname.startsWith("/aurora/product/surface-health/")) {
      const surfaceId = url.pathname.replace("/aurora/product/surface-health/", "");
      const health = getSurfaceHealth(surfaceId);
      if (!health) return sendJson(res, 404, { ok: false, error: "Surface not found" });
      return sendJson(res, 200, health);
    }

    if (url.pathname === "/aurora/product/failure-modes") {
      const surfaceId = url.searchParams.get("surfaceId") || null;
      return sendJson(res, 200, detectProductFailureModes(surfaceId));
    }

    if (url.pathname === "/aurora/product/next-improvements") {
      const surfaceId = url.searchParams.get("surfaceId") || null;
      return sendJson(res, 200, suggestNextBestImprovements(surfaceId));
    }

    // HF-Agents endpoints
    if (url.pathname === "/hf/tools") {
      return sendJson(res, 200, { tools: hf.tools(), health: hf.health() });
    }
    if (url.pathname === "/hf/scrape") {
      const urlParam = url.searchParams.get("url");
      if (!urlParam) return sendJson(res, 400, { error: "Missing url param" });
      const result = await hf.scrape(urlParam);
      return sendJson(res, 200, result);
    }
    if (url.pathname === "/hf/graph") {
      const text = url.searchParams.get("text") || url.searchParams.get("q");
      if (!text) return sendJson(res, 400, { error: "Missing text or q param" });
      const result = await hf.graph(decodeURIComponent(text));
      return sendJson(res, 200, result);
    }
    if (url.pathname === "/hf/research") {
      const query = url.searchParams.get("q") || url.searchParams.get("query");
      if (!query) return sendJson(res, 400, { error: "Missing q or query param" });
      const result = await hf.research(decodeURIComponent(query));
      return sendJson(res, 200, result);
    }
    if (url.pathname === "/hf/workflow") {
      const name = url.searchParams.get("name");
      if (!name) return sendJson(res, 400, { error: "Missing name param" });
      const result = await hf.workflow(decodeURIComponent(name));
      return sendJson(res, 200, result);
    }
    if (url.pathname === "/hf/agent") {
      const task = url.searchParams.get("task") || url.searchParams.get("q");
      if (!task) return sendJson(res, 400, { error: "Missing task or q param" });
      const result = await hf.agent(decodeURIComponent(task));
      return sendJson(res, 200, result);
    }
    if (url.pathname === "/hf/convert") {
      const from = url.searchParams.get("from");
      const to = url.searchParams.get("to");
      const input = url.searchParams.get("input");
      if (!from || !to || !input) return sendJson(res, 400, { error: "Missing from, to, or input param" });
      const result = await hf.convert(decodeURIComponent(input), from, to);
      return sendJson(res, 200, result);
    }
    if (url.pathname === "/hf/health") {
      return sendJson(res, 200, hf.health());
    }

    return sendJson(res, 404, {
      error: "Not found",
      available: ["/", "/app", "/health", "/status", "/tasks", "/agentes", "/agentes/rastreo", "/agentes/agregar", "/repos", "/repos/agregar", "/repos/activar", "/conectores", "/creations", "/knowledge", "/functions", "/functions/run", "/web/search", "/chat", "/image/brief", "/bootstrap", "/skills", "/menu", "/antigravity-sync", "/reason/task", "/reason/plan", "/reason/handoff", "/reason/close", "/aurora/surfaces", "/aurora/contracts", "/aurora/health-snapshot", "/aurora/runtime-status", "/aurora/session-brief", "/aurora/drift-report", "/aurora/risk-signal", "/aurora/validation-checklist", "/aurora/next-best-step", "/aurora/scorecard-daily", "/aurora/task-context", "/aurora/handoff-brief", "/aurora/repo-map", "/aurora/stack-brief", "/aurora/surface-brief", "/aurora/fullstack-task-brief", "/aurora/coding-kickoff", "/aurora/product-snapshot", "/aurora/product/surfaces", "/aurora/product/surface-health/:id", "/aurora/product/failure-modes", "/aurora/product/next-improvements", "/hf/tools", "/hf/scrape", "/hf/graph", "/hf/research", "/hf/workflow", "/hf/agent", "/hf/convert", "/hf/health"]
    });
  } catch (error) {
    writeRuntimeStatus("error", {
      message: error instanceof Error ? error.message : "Aurora API failure"
    });
    return sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Aurora API failure"
    });
  }
});

server.listen(PORT, () => {
  writeRuntimeStatus("running");
  console.log(`Aurora API listening on http://localhost:${PORT}`);
});

const runtimeHeartbeat = setInterval(() => {
  writeRuntimeStatus("running");
}, 1000);
runtimeHeartbeat.unref();

process.on("uncaughtException", (error) => {
  writeRuntimeStatus("crashed", {
    message: error.message,
    stack: error.stack || ""
  });
  console.error(error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  writeRuntimeStatus("crashed", {
    message: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack || "" : ""
  });
  console.error(reason);
  process.exit(1);
});

process.on("SIGTERM", () => {
  clearInterval(runtimeHeartbeat);
  writeRuntimeStatus("stopped", {
    signal: "SIGTERM"
  });
  process.exit(0);
});

process.on("SIGINT", () => {
  clearInterval(runtimeHeartbeat);
  writeRuntimeStatus("stopped", {
    signal: "SIGINT"
  });
  process.exit(0);
});
