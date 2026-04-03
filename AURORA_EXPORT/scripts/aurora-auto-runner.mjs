import fs from "node:fs";
import path from "node:path";
import fetch from "node-fetch";
import { runAgentLearner as runAgentLearnerInProcess } from "./aurora-agent-learner.mjs";
import { buildAuroraTaskContextPack } from "./aurora-sovereign.mjs";
import { getLocalAgentStatus } from "./aurora-local-agents.mjs";
import { getConnectorStatus } from "./aurora-connectors.mjs";

const ROOT = process.cwd();
const logPath = path.join(ROOT, ".agent/brain/db/activity_log.jsonl");
const pointerPath = path.join(ROOT, ".agent/aurora/auto-runner.pointer");
const apiUrl = process.env.AURORA_AUTO_RUNNER_API_URL || "http://127.0.0.1:4310/chat";
const hookLogPath = path.join(ROOT, ".agent/brain/db/hook_log.jsonl");
const ossResearchPath = path.join(ROOT, ".agent/brain/db/oss_ai_repos.jsonl");
const growthReposPath = path.join(ROOT, ".agent/aurora/professional-growth-repos.json");

function logHook(hookType, taskId, data) {
  const entry = {
    timestamp: new Date().toISOString(),
    type: hookType,
    taskId,
    ...data
  };
  fs.appendFileSync(hookLogPath, JSON.stringify(entry) + "\n", "utf8");
}

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return fs.readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

export function preTaskHook(taskId, query) {
  const context = buildAuroraTaskContextPack(query || taskId, null, 5);
  const preTaskData = {
    contextLoaded: context.matchedTask !== null || context.surface !== null,
    validation: context.validation,
    relatedFiles: context.relatedFiles.slice(0, 3),
    checks: [
      "git status --short",
      "npm run lint",
      "cat .agent/workspace/coordination/CURRENT_FOCUS.md | head -20"
    ]
  };
  logHook("pre-task", taskId, preTaskData);
  return preTaskData;
}

export function postTaskHook(taskId, result) {
  const postTaskData = {
    filesModified: result?.filesModified || [],
    testsPassed: result?.testsPassed ?? null,
    lintPassed: result?.lintPassed ?? null,
    validationCommands: result?.validationCommands || ["npm run lint"],
    learned: result?.learned || false,
    nextSteps: result?.nextSteps || []
  };
  logHook("post-task", taskId, postTaskData);
  
  if (postTaskData.learned) {
    console.log(`[Aurora Auto-Runner] Aprendizaje registrado para ${taskId}`);
  }
  
  return postTaskData;
}

export function getHookHistory(taskId = null, limit = 20) {
  if (!fs.existsSync(hookLogPath)) return [];
  return fs.readFileSync(hookLogPath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => {
      try { return JSON.parse(line); } catch { return null; }
    })
    .filter(Boolean)
    .filter(entry => !taskId || entry.taskId === taskId)
    .slice(-limit);
}

function runAgentLearner() {
  try {
    runAgentLearnerInProcess();
  } catch (error) {
    console.error("Aurora Agent Learner falló:", error.message);
  }
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

function getFallbackStatus() {
  const tasks = parseTaskBoard(
    fs.readFileSync(path.join(ROOT, ".agent/workspace/coordination/TASK_BOARD.md"), "utf8")
  );
  const open = tasks.filter((task) => task.status !== "done");
  const critical = open.filter((task) => /^CRIT|^SEC|^PAY|^STAB/.test(task.id));
  return { open: open.length, critical: critical.length };
}

function findCachedResearch(query) {
  const lower = (query || "").toLowerCase();
  const records = readJsonl(ossResearchPath)
    .filter((item) =>
      JSON.stringify(item).toLowerCase().includes(lower)
    )
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  return records[0] || null;
}

function findCuratedRepo(query) {
  if (!fs.existsSync(growthReposPath)) return null;
  const data = JSON.parse(fs.readFileSync(growthReposPath, "utf8"));
  const lower = (query || "").toLowerCase();
  for (const track of data.tracks || []) {
    for (const repo of track.repos || []) {
      if (repo.toLowerCase().includes(lower)) {
        return {
          repo,
          track: track.label,
          goal: track.goal
        };
      }
    }
  }
  const firstTrack = (data.tracks || [])[0];
  const firstRepo = firstTrack?.repos?.[0];
  return firstRepo
    ? { repo: firstRepo, track: firstTrack.label, goal: firstTrack.goal }
    : null;
}

function buildLocalFallback(command, errorMessage) {
  const local = getLocalAgentStatus();
  const connectors = getConnectorStatus();
  const activeApis = connectors.apis.filter((item) => item.activo).map((item) => item.id);
  const activeMcp = connectors.mcp.filter((item) => item.readiness === "installed" || item.readiness === "ready").map((item) => item.id);
  const normalized = (command || "").trim();
  const [baseCommand, ...args] = normalized.split(/\s+/);
  const query = args.join(" ").trim();

  if (baseCommand === "/local") {
    return {
      mode: "local_fallback",
      answer: `Fallback local: Ollama ${local.ollama.instalado ? "instalado" : "no instalado"} con ${local.ollama.modelos.length} modelos. OpenCode ${local.opencode.instalado ? "instalado" : "no instalado"}. Codex ${local.codex.instalado ? "instalado" : "no instalado"}.`
    };
  }

  if (baseCommand === "/apis" || baseCommand === "/connectors") {
    return {
      mode: "local_fallback",
      answer: `Fallback local: APIs activas ${activeApis.join(", ") || "ninguna"}. MCPs listos ${activeMcp.join(", ") || "ninguno"}. Ollama ${local.ollama.instalado ? "detectado" : "no detectado"}.`
    };
  }

  if (baseCommand === "/status") {
    const status = getFallbackStatus();
    return {
      mode: "local_fallback",
      answer: `Fallback local: ${status.open} tareas abiertas, ${status.critical} críticas. APIs activas: ${activeApis.join(", ") || "ninguna"}.`
    };
  }

  if (baseCommand === "/help") {
    return {
      mode: "local_fallback",
      answer: "Fallback local: usa /status, /local, /apis, /connectors y /session-brief cuando la API esté disponible."
    };
  }

  if (baseCommand === "/research") {
    const cached = findCachedResearch(query);
    if (cached) {
      return {
        mode: "local_fallback",
        answer: `Fallback local research: ${cached.source || cached.title}. ${cached.statement || "Hay cache local pero sin resumen útil."}`
      };
    }
    const curated = findCuratedRepo(query);
    if (curated) {
      return {
        mode: "local_fallback",
        answer: `Fallback local research: no hay cache específica para "${query || "la consulta"}". Repo curado sugerido: ${curated.repo} (${curated.track}). Objetivo: ${curated.goal}.`
      };
    }
    return {
      mode: "local_fallback",
      answer: `Fallback local research: no hay cache ni repos curados para "${query || "la consulta"}". Error original: ${errorMessage}`
    };
  }

  if (baseCommand === "/web") {
    return {
      mode: "local_fallback",
      answer: `Fallback local web: no se pudo usar la capa de chat. Proveedores web activos: ${activeApis.join(", ") || "ninguno"}. Si la consulta es crítica, reintentar con la API levantada o usar /research con cache local.`
    };
  }

  return {
    mode: "local_fallback",
    answer: `Aurora API no disponible para ${normalized}. Se aplicó fallback local para no bloquear el runner. Error: ${errorMessage}`
  };
}

function advancePointer(timestamp) {
  fs.writeFileSync(pointerPath, String(new Date(timestamp).getTime()));
}

function logAutoRunnerResult(command, mode, answer, error = null) {
  logHook("auto-runner", "AUTO-RUNNER", {
    command,
    mode,
    answer,
    error
  });
}

const pointer = fs.existsSync(pointerPath) ? Number(fs.readFileSync(pointerPath, "utf8")) : 0;

if (!fs.existsSync(logPath)) {
  console.log("No hay actividad registrada.");
  process.exit(0);
}

runAgentLearner();

const entries = fs
  .readFileSync(logPath, "utf8")
  .split(/\r?\n/)
  .map((line) => {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  })
  .filter(Boolean)
  .filter((entry) => (entry.timestamp ? new Date(entry.timestamp).getTime() : 0) > pointer)
  .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

if (!entries.length) {
  console.log("No hay entradas nuevas para procesar.");
} else {
  const entry = entries[entries.length - 1];
  let command = entry.command || "";
  if (entry.note && entry.note.includes("/local")) {
    command = "/local";
  }
  if (!command || command === "fallback") {
    command = "/help";
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  fetch(`${apiUrl}?q=${encodeURIComponent(command)}`, { signal: controller.signal })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((data) => {
      console.log("Auto-run command:", command);
      console.log("Response:", data.answer);
      advancePointer(entry.timestamp);
      logAutoRunnerResult(command, "api", data.answer || "Sin respuesta");
    })
    .catch((error) => {
      const fallback = buildLocalFallback(command, error.message);
      console.warn("Auto-run fallback:", command);
      console.warn("Response:", fallback.answer);
      advancePointer(entry.timestamp);
      logAutoRunnerResult(command, fallback.mode, fallback.answer, error.message);
    })
    .finally(() => {
      clearTimeout(timeout);
    });
}
