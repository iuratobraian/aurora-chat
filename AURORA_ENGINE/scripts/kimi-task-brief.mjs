import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { askKimiWithContext } from "./aurora-kimi-agent.mjs";

const ROOT = process.cwd();
const TASK_BOARD = path.join(ROOT, ".agent/workspace/coordination/TASK_BOARD.md");
const AGENT_LOG = path.join(ROOT, ".agent/workspace/coordination/AGENT_LOG.md");
const BRIEFS_DIR = path.join(ROOT, ".agent/kimi/briefs");

function readFile(relPath) {
  try {
    return fs.existsSync(relPath) ? fs.readFileSync(relPath, "utf8") : "";
  } catch {
    return "";
  }
}

function parseTaskBoard(md) {
  if (!md) return [];
  return md
    .split(/\r?\n/)
    .filter((l) => l.startsWith("|") && !l.includes("TASK-ID") && !l.includes("---"))
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 7)
    .map(([id, status, owner, scope, files, goal]) => ({
      id,
      status: status?.toLowerCase()?.trim() || "unknown",
      owner,
      scope,
      files,
      goal
    }));
}

function normalizeTaskStatus(raw) {
  if (!raw) return "";
  return raw.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function pickTargetTask(board, preferredId) {
  if (!board.length) return null;
  if (preferredId) {
    const matched = board.find((task) => task.id === preferredId);
    if (matched) return matched;
  }
  return board.find((task) => normalizeTaskStatus(task.status) === "pending") || board[0];
}

function buildTaskContext(task) {
  if (!task) return "";
  const lines = [`Task: ${task.id || "n/a"} — ${task.goal || "sin objetivo"}`];
  if (task.scope) lines.push(`Scope: ${task.scope}`);
  if (task.files) lines.push(`Archivos: ${task.files}`);
  if (task.owner) lines.push(`Owner: ${task.owner}`);
  return lines.join("\n");
}

function summarizeLogs() {
  const raw = readFile(AGENT_LOG);
  if (!raw) return "Sin histórico disponible.";
  const lines = raw.split(/\r?\n/).filter(Boolean);
  return `Últimos registros:\n${lines.slice(-16).join("\n")}`;
}

function ensureBriefsDir() {
  if (!fs.existsSync(BRIEFS_DIR)) {
    fs.mkdirSync(BRIEFS_DIR, { recursive: true });
  }
}

export async function runKimiTaskBrief({ taskId = null, plan = null, auto = false } = {}) {
  const boardMd = readFile(TASK_BOARD);
  const board = parseTaskBoard(boardMd);
  if (!board.length) {
    return { ok: false, error: "TASK_BOARD.md no contiene tareas." };
  }

  const target = pickTargetTask(board, taskId);
  if (!target) {
    return { ok: false, error: "No se pudo determinar un task válido para consultar a Kimi." };
  }

  const planText =
    plan ||
    `Planeo abordar la tarea "${target.goal?.slice(0, 90) || "sin descripción"}" enfocándome en ${target.scope ||
      "el scope descrito"}.`;

  const context = [
    buildTaskContext(target),
    `Plan inicial: ${planText}`,
    summarizeLogs(),
    auto ? "Modo automático: el sistema solicitó el brief previo." : "Modo manual: el agente solicitó el brief."
  ].join("\n\n");

  try {
    const result = await askKimiWithContext(
      `Antes de tocar los archivos, dime riesgos visibles, pasos críticos, validaciones imprescindibles y datos faltantes para la siguiente ejecución:\n\n${context}\n\nRespóndeme con un encabezado claramente marcado como "Kimi says:" y cierra con una línea "FIN KIMI".`,
      {
        currentTask: `${target.id} — ${target.goal}`,
        filesToEdit: target.files ? target.files.split(",").map((f) => f.trim()) : [],
        forbidden: ["node_modules", "dist", ".git"]
      }
    );

    if (!result.ok) {
      return { ok: false, error: result.answer };
    }

    ensureBriefsDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const sanitizedId = target.id.replace(/[^\w-]/g, "_");
    const briefFilename = `${sanitizedId}-${timestamp}.md`;
    const briefPath = path.join(BRIEFS_DIR, briefFilename);
    const relativeBriefPath = path.relative(ROOT, briefPath);
    const briefContent = [
      `# Kimi Brief — ${target.id}`,
      `Fecha: ${new Date().toISOString()}`,
      "",
      "## Contexto",
      buildTaskContext(target),
      "",
      "## Plan inicial",
      planText,
      "",
      "## Conversación Kimi",
      result.answer.trim()
    ].join("\n");

    fs.writeFileSync(briefPath, briefContent, "utf8");
    fs.appendFileSync(
      AGENT_LOG,
      [
        `### ${new Date().toISOString().split("T")[0]} - KIMI-BRIEF ${target.id}`,
        `- Plan: ${planText}`,
        `- Brief: ${relativeBriefPath}`,
        `- Fuente: Kimi (${result.model || "moonshotai/kimi-k2.5"})`,
        `- Validación: ${result.ok ? "recibido" : "fallido"}`,
        "",
        "---",
        ""
      ].join("\n"),
      "utf8"
    );

    return { ok: true, answer: result.answer, briefPath: relativeBriefPath, plan: planText, taskId: target.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

function parseCliArgs() {
  const args = process.argv.slice(2);
  const opts = { taskId: null, plan: null, auto: false };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--task" && args[i + 1]) {
      opts.taskId = args[++i];
      continue;
    }
    if (arg.startsWith("--task=")) {
      opts.taskId = arg.replace("--task=", "");
      continue;
    }
    if (arg === "--plan" && args[i + 1]) {
      opts.plan = args[++i];
      continue;
    }
    if (arg.startsWith("--plan=")) {
      opts.plan = arg.replace("--plan=", "");
      continue;
    }
    if (arg === "--auto") {
      opts.auto = true;
    }
  }
  return opts;
}

async function cliMain() {
  const opts = parseCliArgs();
  const result = await runKimiTaskBrief(opts);
  if (!result.ok) {
    console.error("No se pudo obtener el brief de Kimi:", result.error);
    process.exit(1);
  }
  console.log(`Kimi says (resumen guardado en ${result.briefPath}):`);
  console.log(result.answer);
}

const SCRIPT_PATH = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  cliMain();
}
