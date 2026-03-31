/**
 * aurora-inicio.mjs — Protocolo de Activación Ruflo v3.5
 *
 * Ejecutar con: node scripts/aurora-inicio.mjs
 * O via npm:    npm run inicio
 *
 * Este script:
 * 1. Muestra el banner de activación
 * 2. Ejecuta el session brief de Aurora
 * 3. Lee el TASK_BOARD y detecta tareas pendientes
 * 4. Determina complejidad y tipo de swarm requerido
 * 5. Imprime las instrucciones de swarm init listas para copiar/ejecutar
 * 6. Muestra la tabla de routing y los hooks a activar
 */

import fs from "node:fs";
import path from "node:path";
import { execSync, spawnSync } from "node:child_process";
import { runSpeedCheck } from "./aurora-speed-check.mjs";
import { buildAuroraSessionBrief } from "./aurora-session-brief.mjs";
import { buildProductSnapshot } from "./aurora-product-intelligence.mjs";
import { runKimiTaskBrief } from "./kimi-task-brief.mjs";

const ROOT = process.cwd();
const RUFLO_BIN = path.join(ROOT, "node_modules", ".bin", process.platform === "win32" ? "ruflo.cmd" : "ruflo");
const CLAUDE_FLOW_BIN = path.join(ROOT, "node_modules", ".bin", process.platform === "win32" ? "claude-flow.cmd" : "claude-flow");
const RUFLO_BOOTSTRAP_FILE = path.join(ROOT, ".agent", "aurora", "ruflo-bootstrap.json");
const AURORA_API_TERMINAL_STATUS_FILE = path.join(ROOT, ".agent", "aurora", "aurora-api-terminal-status.json");
const AURORA_TERMINAL_STATUS_FILE = path.join(ROOT, ".agent", "aurora", "aurora-terminal-status.json");
const AURORA_BROWSER_URL = "http://127.0.0.1:4310/app";
const RUFLO_MAX_AGENTS = Number(process.env.RUFLO_MAX_AGENTS || 20);
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const MAGENTA = "\x1b[35m";
const RED = "\x1b[31m";
const DIM = "\x1b[2m";

function readFile(rel) {
  const full = path.join(ROOT, rel);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}

function readJsonFile(fullPath) {
  if (!fs.existsSync(fullPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(fullPath, "utf8").replace(/^\uFEFF/, ""));
  } catch {
    return null;
  }
}

function compact(text, max = 180) {
  return (text || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function isFreshTimestamp(value, maxAgeMs = 5 * 60 * 1000) {
  if (!value) return false;
  const ts = Date.parse(value);
  if (Number.isNaN(ts)) return false;
  return (Date.now() - ts) <= maxAgeMs;
}

function parseTaskBoard(md) {
  return md
    .split(/\r?\n/)
    .filter((l) => l.startsWith("|") && !l.includes("TASK-ID") && !l.includes("---"))
    .map((l) => l.split("|").slice(1, -1).map((c) => c.trim()))
    .filter((c) => c.length >= 7)
    .map(([id, status, owner, scope, files, goal]) => ({
      id,
      status: normalizeStatus(status),
      owner,
      scope,
      files,
      goal
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

function detectComplexity(task) {
  if (!task) return { code: 0, type: "sin tarea", needsSwarm: false };
  const g = task.goal.toLowerCase();
  const f = task.files.split(",").length;

  if (g.includes("seguridad") || g.includes("auth") || g.includes("sec")) return { code: 9, type: "Security / Auth", needsSwarm: true, agents: "coordinator, security-architect, security-auditor", consensus: "byzantine" };
  if (g.includes("convex") || g.includes("schema") || g.includes("db")) return { code: 11, type: "Convex / DB", needsSwarm: true, agents: "coordinator, researcher, backend-dev, tester", consensus: "raft" };
  if (g.includes("aurora") || g.includes("ia") || g.includes("ai") || g.includes("llm")) return { code: 15, type: "Aurora / AI", needsSwarm: true, agents: "coordinator, ml-developer, coder, tester", consensus: "raft" };
  if (g.includes("señal") || g.includes("signal") || g.includes("trading")) return { code: 13, type: "Trading / Señales", needsSwarm: true, agents: "coordinator, researcher, backend-dev, tester", consensus: "raft" };
  if (g.includes("mobile") || g.includes("pwa") || g.includes("android")) return { code: 21, type: "Mobile / PWA", needsSwarm: true, agents: "coordinator, mobile-dev, coder, tester", consensus: "raft" };
  if (g.includes("performance") || g.includes("bundle") || g.includes("n+1")) return { code: 7, type: "Performance", needsSwarm: true, agents: "coordinator, perf-engineer, coder", consensus: "raft" };
  if (f >= 3 || g.includes("feature") || g.includes("implement") || g.includes("crear")) return { code: 3, type: "Feature", needsSwarm: true, agents: "coordinator, architect, coder, tester, reviewer", consensus: "raft" };
  if (g.includes("fix") || g.includes("bug") || g.includes("corregir") || g.includes("repair")) return { code: 1, type: "Bug Fix", needsSwarm: f >= 3, agents: "coder, tester", consensus: "raft" };
  return { code: 3, type: "Feature general", needsSwarm: true, agents: "coordinator, architect, coder, tester, reviewer", consensus: "raft" };
}

function printBanner() {
  console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${CYAN}║   🌊 TRADESHARE — PROTOCOLO INICIO (Ruflo v3.5)      ║${RESET}`);
  console.log(`${BOLD}${CYAN}╚══════════════════════════════════════════════════════╝${RESET}\n`);
}

function printDivider(label = "") {
  if (label) {
    console.log(`\n${BOLD}${MAGENTA}── ${label} ${"─".repeat(Math.max(0, 48 - label.length))}${RESET}`);
  } else {
    console.log(`\n${DIM}${"─".repeat(56)}${RESET}`);
  }
}

function runSilent(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch {
    return null;
  }
}

function runCommand(cmd) {
  try {
    return {
      ok: true,
      output: execSync(cmd, { cwd: ROOT, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim()
    };
  } catch (error) {
    const output = [
      error?.stdout?.toString?.(),
      error?.stderr?.toString?.(),
      error?.message
    ]
      .filter(Boolean)
      .join("\n")
      .trim();

    return {
      ok: false,
      output: output || "Command failed"
    };
  }
}

function quotePowerShell(value) {
  return `'${String(value || "").replace(/'/g, "''")}'`;
}

function runTool(filePath, args = []) {
  try {
    const result = process.platform === "win32" && filePath.endsWith(".cmd")
      ? spawnSync(
          "powershell.exe",
          [
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-Command",
            `& ${quotePowerShell(filePath)} ${args.map((arg) => quotePowerShell(arg)).join(" ")}`
          ],
          { cwd: ROOT, encoding: "utf8" }
        )
      : spawnSync(filePath, args, { cwd: ROOT, encoding: "utf8" });

    const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    return {
      ok: result.status === 0 && !result.error,
      output: output || result.error?.message || "Command finished without output"
    };
  } catch (error) {
    return {
      ok: false,
      output: error?.message || "Command failed"
    };
  }
}

function parseRufloSwarmId(text) {
  return text?.match(/Swarm ID\s*\|\s*([^\s|]+)/)?.[1]
    || text?.match(/Monitor:\s+claude-flow swarm status (\S+)/)?.[1]
    || null;
}

function parseRufloDeploymentPlan(text) {
  return (text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^\|/.test(line) && !/Role|---/.test(line))
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 4 && /^\d+$/.test(cells[2]))
    .map(([role, type, count, purpose]) => ({
      role,
      type,
      count: Number(count),
      purpose
    }));
}

function parseRufloStatusSummary(text) {
  const active = Number(text?.match(/\|\s*Active\s*\|\s*(\d+)\s*\|/)?.[1] || 0);
  const idle = Number(text?.match(/\|\s*Idle\s*\|\s*(\d+)\s*\|/)?.[1] || 0);
  const total = Number(text?.match(/\|\s*Total\s*\|\s*(\d+)\s*\|/)?.[1] || 0);
  return { active, idle, total };
}

async function activateAurora(initialSpeed, bootState = null, apiTerminalStatus = null) {
  const activation = {
    modules: ["session-brief", "product-intelligence"],
    startAttempt: null,
    speed: initialSpeed,
    brief: null,
    product: null
  };

  if (!initialSpeed?.health) {
    const dedicatedApiLaunched = Boolean(
      ((bootState?.auroraApiTerminal?.launched || bootState?.auroraApiTerminal?.reused) && isFreshTimestamp(bootState?.generatedAt))
      || (apiTerminalStatus && ["booting", "starting", "running"].includes(apiTerminalStatus.phase))
    );

    if (dedicatedApiLaunched) {
      activation.startAttempt = {
        attempted: true,
        success: false,
        external: true,
        output: compact(apiTerminalStatus?.message || `Aurora API lanzada en terminal dedicada (${AURORA_BROWSER_URL}).`)
      };
    } else {
      const output = runSilent("node scripts/aurora-start-api.mjs");
      activation.startAttempt = {
        attempted: true,
        success: Boolean(output && !/Failed to start/i.test(output)),
        output: compact(output || "No hubo salida del helper de arranque.")
      };
    }

    activation.speed = await runSpeedCheck().catch(() => initialSpeed);
    if (activation.startAttempt?.external) {
      activation.startAttempt.success = Boolean(activation.speed?.health);
    }
  }

  activation.brief = buildAuroraSessionBrief();
  activation.product = buildProductSnapshot();
  return activation;
}

function escapeCommandText(text) {
  return String(text || "").replace(/"/g, '\\"');
}

function buildJointTaskQueue(tasks, aurora, speed) {
  const queue = [];
  const seen = new Set();

  function pushTask(task) {
    if (!task || !task.title) return;
    const key = `${task.id || task.title}`;
    if (seen.has(key)) return;
    seen.add(key);
    queue.push(task);
  }

  if (speed?.alerts?.some((alert) => alert.severity === "critical")) {
    pushTask({
      id: "AURORA-BOOT",
      title: "Recuperar salud operativa de Aurora",
      owner: "Aurora + operador",
      source: "health",
      whyNow: speed.alerts.find((alert) => alert.severity === "critical")?.detail || "Aurora no está saludable.",
      validation: ["node scripts/aurora-start-api.mjs", "npm run aurora:speed-check"]
    });
  }

  if (aurora?.brief?.nextAction?.statement) {
    pushTask({
      id: aurora.brief.nextAction.taskId || "AURORA-NEXT",
      title: aurora.brief.nextAction.statement,
      owner: aurora.brief.focus.owner || "Aurora + operador",
      source: aurora.brief.nextAction.source || "session_brief",
      whyNow: aurora.brief.nextAction.whyNow,
      validation: aurora.brief.nextAction.validation || ["npm run aurora:session-brief"]
    });
  }

  for (const recommendation of aurora?.product?.topRecommendations || []) {
    pushTask({
      id: `REC-${recommendation.surfaceId}`,
      title: `${recommendation.surfaceLabel}: ${recommendation.improvement}`,
      owner: recommendation.owner || "Aurora + operador",
      source: "product_intelligence",
      whyNow: `Impacto ${recommendation.impact}, esfuerzo ${recommendation.effort}, prioridad ${recommendation.priority}.`,
      validation: ["npm run aurora:product", "npm run lint"]
    });
    if (queue.length >= 3) break;
  }

  if (queue.length === 0) {
    const openTask = tasks.find((task) => task.status !== "done");
    if (openTask) {
      pushTask({
        id: openTask.id,
        title: openTask.goal,
        owner: openTask.owner,
        source: "board",
        whyNow: "Es la única tarea abierta detectada en el board.",
        validation: ["npm run lint"]
      });
    }
  }

  return queue.slice(0, 3);
}

function activateRuflo(queue) {
  const bootState = readJsonFile(RUFLO_BOOTSTRAP_FILE);
  const auroraApiTerminalStatus = readJsonFile(AURORA_API_TERMINAL_STATUS_FILE);
  const auroraTerminalStatus = readJsonFile(AURORA_TERMINAL_STATUS_FILE);
  const activation = {
    available: bootState?.available ?? (fs.existsSync(RUFLO_BIN) && fs.existsSync(CLAUDE_FLOW_BIN)),
    maxAgents: bootState?.maxAgents ?? RUFLO_MAX_AGENTS,
    objective: bootState?.objective ?? queue[0]?.title ?? "TradeShare inicio coordinado con Aurora",
    init: bootState?.init ?? null,
    start: bootState?.start ?? null,
    status: bootState?.status ?? null,
    swarmId: bootState?.swarmId ?? null,
    auroraApiTerminal: {
      ...(bootState?.auroraApiTerminal || { launched: false, url: AURORA_BROWSER_URL }),
      status: auroraApiTerminalStatus
    },
    auroraTerminal: {
      ...(bootState?.auroraTerminal || { launched: false }),
      status: auroraTerminalStatus
    },
    teamPlan: [],
    statusSummary: null
  };

  if (!activation.available) {
    return activation;
  }

  if (!activation.init || !activation.start) {
    activation.init = runTool(CLAUDE_FLOW_BIN, [
      "swarm",
      "init",
      "--topology",
      "hierarchical",
      "--max-agents",
      String(activation.maxAgents),
      "--strategy",
      "specialized"
    ]);
    activation.swarmId = parseRufloSwarmId(activation.init.output);

    activation.start = runTool(RUFLO_BIN, [
      "swarm",
      "start",
      "-o",
      activation.objective,
      "-s",
      "development"
    ]);
    activation.swarmId = parseRufloSwarmId(activation.start.output) || activation.swarmId;
    activation.status = activation.swarmId
      ? runTool(RUFLO_BIN, ["swarm", "status", activation.swarmId])
      : null;
  }

  activation.swarmId = activation.swarmId
    || parseRufloSwarmId(activation.init?.output)
    || parseRufloSwarmId(activation.start?.output);
  activation.teamPlan = parseRufloDeploymentPlan(activation.start?.output);
  activation.statusSummary = activation.status
    ? parseRufloStatusSummary(activation.status.output)
    : null;

  return activation;
}

function toRoutingTask(queueItem) {
  if (!queueItem) return null;
  return {
    id: queueItem.id,
    status: "suggested",
    owner: queueItem.owner,
    scope: queueItem.source,
    files: queueItem.validation?.join(", ") || "",
    goal: queueItem.title
  };
}

function printContextRecovery(tasks, focused) {
  printDivider("1. CONTEXTO");
  const pending = tasks.filter((t) => t.status === "pending");
  const claimed = tasks.filter((t) => t.status === "claimed" || t.status === "in_progress" || t.status === "review");
  const done = tasks.filter((t) => t.status === "done" || t.status === "completed");

  console.log(`${GREEN}✓${RESET} Tareas totales : ${BOLD}${tasks.length}${RESET} | Pendientes: ${YELLOW}${pending.length}${RESET} | En progreso: ${CYAN}${claimed.length}${RESET} | Done: ${DIM}${done.length}${RESET}`);

  if (focused) {
    console.log(`${GREEN}✓${RESET} Foco actual    : ${BOLD}${focused.id}${RESET} [${focused.status}] — ${focused.owner}`);
    console.log(`  ${DIM}${focused.goal.slice(0, 120)}${RESET}`);
  }

  if (pending.length > 0) {
    console.log(`\n${YELLOW}★ Próximas tareas pending:${RESET}`);
    pending.slice(0, 3).forEach((t) => {
      console.log(`  ${BOLD}${t.id}${RESET} [${t.scope}] — ${t.goal.slice(0, 90)}`);
    });
  }
}

function printOperationalHealth(speed) {
  printDivider("2. SALUD OPERATIVA AURORA");

  if (!speed) {
    console.log(`${RED}✗${RESET} No se pudo leer aurora-speed-check.`);
    return;
  }

  const badge = speed.health ? `${GREEN}SALUDABLE${RESET}` : `${RED}REQUIERE ATENCIÓN${RESET}`;
  console.log(`${CYAN}Estado:${RESET} ${BOLD}${badge}${RESET}`);
  console.log(`${CYAN}API:${RESET} ${speed.healthMessage}`);
  console.log(`${CYAN}Knowledge:${RESET} ${speed.knowledgeEntries} entradas | cobertura estructurada ${speed.structuredCoveragePct}%`);

  if (speed.alerts.length > 0) {
    console.log(`\n${YELLOW}Alertas activas:${RESET}`);
    speed.alerts.forEach((alert) => {
      console.log(`  - ${alert.severity.toUpperCase()}: ${alert.text} — ${alert.detail}`);
    });
  } else {
    console.log(`${GREEN}✓${RESET} Sin alertas activas.`);
  }
}

function printAuroraCompanion(aurora, queue) {
  printDivider("3. AURORA EN CONJUNTO");
  console.log(`${CYAN}Modo:${RESET} ${BOLD}copiloto operativo activo${RESET}`);
  console.log(`${CYAN}Aurora ejecutó:${RESET} ${aurora.modules.join(" + ")}`);
  console.log(`${CYAN}Chat navegador:${RESET} ${AURORA_BROWSER_URL}`);

  if (aurora.startAttempt?.attempted) {
    const status = aurora.startAttempt.success ? `${GREEN}iniciado${RESET}` : `${YELLOW}intento sin confirmación estable${RESET}`;
    console.log(`${CYAN}Arranque API:${RESET} ${status}`);
    console.log(`  ${DIM}${aurora.startAttempt.output}${RESET}`);
  } else {
    console.log(`${CYAN}Arranque API:${RESET} ${DIM}no fue necesario; Aurora ya estaba operativa o trabaja embebida en este inicio.${RESET}`);
  }

  console.log(`${CYAN}Prioridad Aurora:${RESET} ${aurora.brief?.nextAction?.statement || "n/a"}`);
  console.log(`${CYAN}Qué aporta Aurora:${RESET} priorización, contexto, backlog y validación compartida.`);

  if (queue.length > 0) {
    console.log(`\n${YELLOW}Cola conjunta operador + Aurora:${RESET}`);
    queue.forEach((task, index) => {
      console.log(`  ${index + 1}. ${BOLD}${task.title}${RESET}`);
      console.log(`     owner: ${task.owner} | source: ${task.source}`);
      console.log(`     whyNow: ${compact(task.whyNow, 120)}`);
      console.log(`     validación: ${(task.validation || []).join(", ")}`);
    });
  }
}

function printRufloTeam(ruflo, queue) {
  printDivider("4. RUFLO EN EQUIPO");

  if (!ruflo.available) {
    console.log(`${YELLOW}Ruflo local no está disponible en node_modules/.bin.${RESET}`);
    return;
  }

  console.log(`${CYAN}Modo:${RESET} ${BOLD}swarm local integrado al inicio${RESET}`);
  console.log(`${CYAN}Capacidad configurada:${RESET} hasta ${BOLD}${ruflo.maxAgents}${RESET} agentes`);
  console.log(`${CYAN}Objetivo inicial:${RESET} ${ruflo.objective}`);

  if (ruflo.init?.ok) {
    console.log(`${CYAN}Swarm ID:${RESET} ${ruflo.swarmId || "creado"}`);
  } else {
    console.log(`${YELLOW}Init swarm:${RESET} ${compact(ruflo.init?.output || "sin salida")}`);
  }

  if (ruflo.start?.ok) {
    console.log(`${GREEN}✓${RESET} Ruflo ejecutó el arranque del equipo local.`);
  } else {
    console.log(`${YELLOW}Ruflo no confirmó arranque estable del swarm.${RESET}`);
    console.log(`  ${DIM}${compact(ruflo.start?.output || "sin salida", 220)}${RESET}`);
  }

  if (ruflo.teamPlan.length > 0) {
    const totalPlanned = ruflo.teamPlan.reduce((sum, item) => sum + item.count, 0);
    console.log(`\n${YELLOW}Equipo planificado por Ruflo:${RESET}`);
    ruflo.teamPlan.forEach((item) => {
      console.log(`  - ${item.role}: ${item.count} (${item.purpose})`);
    });
    if (ruflo.maxAgents > totalPlanned) {
      console.log(`  ${DIM}Capacidad libre restante: ${ruflo.maxAgents - totalPlanned} agentes para escalar en paralelo.${RESET}`);
    }
  }

  if (ruflo.statusSummary) {
    console.log(`\n${CYAN}Estado observable:${RESET} active=${ruflo.statusSummary.active} idle=${ruflo.statusSummary.idle} total=${ruflo.statusSummary.total}`);
    if (ruflo.statusSummary.total === 0) {
      console.log(`  ${DIM}La CLI local inicializa y arranca el swarm, pero en esta instalación no materializa agentes persistentes en status; la cola conjunta sigue siendo la fuente estable de trabajo.${RESET}`);
    }
  }

  if (queue.length > 0) {
    console.log(`\n${CYAN}Ruflo toma esta cola inicial:${RESET}`);
    queue.forEach((task, index) => {
      console.log(`  ${index + 1}. ${task.title}`);
    });
  }

  if (ruflo.auroraApiTerminal?.launched || ruflo.auroraApiTerminal?.reused) {
    const apiTerminalStatus = ruflo.auroraApiTerminal.status;
    const modeLabel = ruflo.auroraApiTerminal.reused ? "reutilizada" : "nueva";
    console.log(`\n${CYAN}Aurora API terminal:${RESET} PID ${ruflo.auroraApiTerminal.pid} (${modeLabel})`);
    console.log(`  url: ${ruflo.auroraApiTerminal.url || AURORA_BROWSER_URL}`);
    if (apiTerminalStatus) {
      console.log(`  fase: ${apiTerminalStatus.phase} | healthy: ${apiTerminalStatus.healthy ? "yes" : "no"}`);
      console.log(`  ${compact(apiTerminalStatus.message, 140)}`);
    } else if (ruflo.auroraApiTerminal.note) {
      console.log(`  ${compact(ruflo.auroraApiTerminal.note, 140)}`);
    } else {
      console.log(`  ${DIM}La terminal dedicada fue lanzada y el chat local debería quedar disponible en navegador.${RESET}`);
    }
  }

  if (ruflo.auroraTerminal?.launched || ruflo.auroraTerminal?.reused) {
    const terminalStatus = ruflo.auroraTerminal.status;
    const modeLabel = ruflo.auroraTerminal.reused ? "reutilizada" : "nueva";
    console.log(`\n${CYAN}Aurora terminal externa:${RESET} PID ${ruflo.auroraTerminal.pid} (${modeLabel})`);
    if (terminalStatus) {
      console.log(`  fase: ${terminalStatus.phase} | readyForShell: ${terminalStatus.readyForShell ? "yes" : "no"}`);
      console.log(`  ${compact(terminalStatus.message, 140)}`);
    } else if (ruflo.auroraTerminal.note) {
      console.log(`  ${compact(ruflo.auroraTerminal.note, 140)}`);
    } else {
      console.log(`  ${DIM}La terminal fue lanzada y Aurora está empezando su trabajo inicial.${RESET}`);
    }
  }
}

function printSessionHooks(sessionId) {
  printDivider("5. HOOKS DE SESIÓN (Ruflo v3.5)");
  console.log(`${GREEN}Ejecutar de inmediato:${RESET}`);
  console.log(`${DIM}"${CLAUDE_FLOW_BIN}" hooks session-start --session-id "${sessionId}"${RESET}`);
  console.log(`${DIM}"${CLAUDE_FLOW_BIN}" hooks pre-task --description "TradeShare inicio session"${RESET}`);
}

function printSwarmInstructions(task, complexity, ruflo) {
  printDivider("6. SWARM ROUTING");
  console.log(`${CYAN}Tipo detectado:${RESET} ${BOLD}Código ${complexity.code} — ${complexity.type}${RESET}`);
  console.log(`${CYAN}Agentes:${RESET}       ${BOLD}${complexity.agents}${RESET}`);
  console.log(`${CYAN}Consenso:${RESET}      ${BOLD}${complexity.consensus}${RESET}`);

  if (complexity.needsSwarm) {
    if (ruflo?.start?.ok) {
      console.log(`\n${GREEN}→ Swarm local ya inicializado por inicio.${RESET}`);
      console.log(`${DIM}"${CLAUDE_FLOW_BIN}" swarm init --topology hierarchical --max-agents ${ruflo.maxAgents} --strategy specialized${RESET}`);
      console.log(`${DIM}"${RUFLO_BIN}" swarm start -o "${escapeCommandText(ruflo.objective)}" -s development${RESET}`);
    } else {
      console.log(`\n${GREEN}→ SWARM REQUERIDO. Ejecutar en UN solo mensaje:${RESET}\n`);
      console.log(`${DIM}"${CLAUDE_FLOW_BIN}" swarm init --topology hierarchical --max-agents ${RUFLO_MAX_AGENTS} --strategy specialized${RESET}`);
    }
    console.log(`\n${YELLOW}Luego en el mismo mensaje, spawn de agentes:${RESET}`);
    const agents = complexity.agents.split(",").map((a) => a.trim());
    agents.forEach((a) => {
      console.log(`${DIM}Task("${a}", "Rol: ${a}. Task: ${task?.goal?.slice(0, 60) || "siguiente tarea prioritaria"}.", "${a}")${RESET}`);
    });
    console.log(`\n${RED}⚠ Después del spawn: STOP. No agregar más tool calls.${RESET}`);
  } else {
    console.log(`\n${GREEN}→ Edición directa (sin swarm para esta complejidad).${RESET}`);
  }
}

function printRoutingTable() {
  printDivider("TABLA DE ROUTING (referencia)");
  const table = [
    ["1", "Bug Fix",         "coder, tester",                          "raft"],
    ["3", "Feature",         "architect, coder, tester, reviewer",     "raft"],
    ["7", "Performance",     "perf-engineer, coder",                   "raft"],
    ["9", "Seguridad",       "security-architect, auditor",            "byzantine"],
    ["11","Convex/DB",       "backend-dev, tester",                    "raft"],
    ["13","Trading/Señales", "researcher, backend-dev, tester",        "raft"],
    ["15","Aurora/AI",       "ml-developer, coder, tester",            "raft"],
    ["21","Mobile/PWA",      "mobile-dev, coder, tester",              "raft"],
  ];
  console.log(`${DIM}Cód  Tipo               Agentes mínimos                          Consenso${RESET}`);
  console.log(`${DIM}${"─".repeat(72)}${RESET}`);
  table.forEach(([code, type, agents, consensus]) => {
    console.log(`${BOLD}${code.padEnd(5)}${RESET}${type.padEnd(19)}${DIM}${agents.padEnd(41)}${consensus}${RESET}`);
  });
}

function printAMM() {
  printDivider("7. MEJORA PROACTIVA AURORA (AMM)");
  console.log(`${YELLOW}Obligatorio antes de tomar tareas:${RESET}`);
  console.log(`  1. Proponer 1 mejora a Aurora (scripts, scripts/aurora-*.mjs)`);
  console.log(`  2. Ejecutar: ${DIM}node scripts/aurora-integrator.mjs sync${RESET}`);
  console.log(`  3. Anotar la mejora en AGENT_LOG.md`);
}

function printNextSteps(task, complexity, speed, queue) {
  printDivider("8. PRÓXIMOS PASOS");
  console.log(`${GREEN}→ Chat local:${RESET} ${BOLD}${AURORA_BROWSER_URL}${RESET}`);
  if (task) {
    console.log(`${GREEN}→ Reclamar:${RESET} ${BOLD}${task.id}${RESET} en TASK_BOARD.md (status: claimed)`);
    console.log(`${GREEN}→ Actualizar:${RESET} CURRENT_FOCUS.md con archivos a tocar`);
    if (complexity.needsSwarm) {
      console.log(`${GREEN}→ Init swarm:${RESET} Código ${complexity.code} — ver instrucciones arriba`);
    }
    console.log(`${GREEN}→ Ejecutar:${RESET} npm run lint && npm test`);
  } else {
    console.log(`${YELLOW}No hay tareas pendientes en el board.${RESET}`);
    if (queue[0]) {
      console.log(`${GREEN}→ Tomar tarea sugerida por Aurora:${RESET} ${BOLD}${queue[0].title}${RESET}`);
      console.log(`${GREEN}→ Validar con:${RESET} ${(queue[0].validation || []).join(", ")}`);
    } else {
      console.log(`Ejecutar sync final: node scripts/aurora-integrator.mjs sync`);
    }
  }

  if (speed?.alerts?.length) {
    console.log(`\n${YELLOW}Remediación sugerida:${RESET}`);

    if (!speed.health) {
      console.log(`${GREEN}→ Levantar API:${RESET} powershell -ExecutionPolicy Bypass -File scripts/aurora-api-terminal.ps1`);
    }

    if (speed.alerts.some((alert) => alert.text === "Auto-runner desactualizado")) {
      console.log(`${GREEN}→ Refrescar runner:${RESET} npm run auto:runner`);
    }

    if (speed.alerts.some((alert) => alert.text === "Agent learner desactualizado")) {
      console.log(`${GREEN}→ Refrescar learner:${RESET} npm run ops:auto-learn`);
    }
  }

  console.log(`\n${GREEN}→ Hook post-tarea:${RESET} ${DIM}"${CLAUDE_FLOW_BIN}" hooks post-task --task-id "[id]" --success true${RESET}`);
  console.log(`${GREEN}→ Cierre sesión:${RESET}  ${DIM}"${CLAUDE_FLOW_BIN}" hooks session-end --export-metrics true${RESET}`);
}

function printFinalStatus(speed) {
  printDivider();

  if (speed?.alerts?.length) {
    console.log(`\n${BOLD}${YELLOW}⚠ Protocolo INICIO activado con alertas operativas.${RESET}`);
    console.log(`${DIM}Aurora requiere remediación antes de considerarse lista.${RESET}`);
  } else {
    console.log(`\n${BOLD}${GREEN}✅ Protocolo INICIO activado. Aurora está lista y aprendiendo.${RESET}`);
  }

  console.log(`${DIM}Ver protocolo completo: .agent/skills/inicio/inicio.md${RESET}\n`);
}

async function main() {
  printBanner();

  // Generar session ID
  const now = new Date();
  const sessionId = `tradeshare-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}-${String(now.getHours()).padStart(2,"0")}${String(now.getMinutes()).padStart(2,"0")}`;
  console.log(`${DIM}Session ID: ${sessionId}  |  ${now.toLocaleString("es-AR")}${RESET}`);

  // Parsear task board
  const boardMd = readFile(".agent/workspace/coordination/TASK_BOARD.md");
  const tasks = parseTaskBoard(boardMd);
  const bootState = readJsonFile(RUFLO_BOOTSTRAP_FILE);
  const auroraApiTerminalStatus = readJsonFile(AURORA_API_TERMINAL_STATUS_FILE);
  const initialSpeed = await runSpeedCheck().catch(() => null);
  const aurora = await activateAurora(initialSpeed, bootState, auroraApiTerminalStatus);
  const speed = aurora.speed;
  const jointQueue = buildJointTaskQueue(tasks, aurora, speed);
  const ruflo = activateRuflo(jointQueue);

  // Foco actual (claimed/in_progress)
  const focused = tasks.find((t) => t.status === "claimed" || t.status === "in_progress") || null;

  // Siguiente pending
  const nextPending = tasks.find((t) => t.status === "pending") || null;

  // Detectar complejidad
  const targetTask = focused || nextPending || toRoutingTask(jointQueue[0]);
  const complexity = detectComplexity(targetTask);

  let kimiBriefResult = null;
  const statusTag = typeof targetTask?.status === "string" ? targetTask.status.toLowerCase().trim() : "";
  if (targetTask?.id && statusTag !== "done" && statusTag !== "completed") {
    kimiBriefResult = await runKimiTaskBrief({ taskId: targetTask.id, auto: true });
  }

  // Imprimir secciones
  printContextRecovery(tasks, focused);
  printOperationalHealth(speed);
  printAuroraCompanion(aurora, jointQueue);
  printRufloTeam(ruflo, jointQueue);
  printSessionHooks(sessionId);
  printSwarmInstructions(targetTask, complexity, ruflo);
  printRoutingTable();
  printAMM();
  printNextSteps(focused || nextPending, complexity, speed, jointQueue);

  if (kimiBriefResult) {
    console.log(`\n${CYAN}--- Kimi brief ---${RESET}`);
    if (kimiBriefResult.ok) {
      console.log(kimiBriefResult.answer);
      console.log(`${GREEN}Resumen guardado en:${RESET} ${kimiBriefResult.briefPath}`);
    } else {
      console.log(`${YELLOW}No se pudo obtener el brief automático:${RESET}\n${kimiBriefResult.error}`);
    }
  }

  printFinalStatus(speed);
}

main().catch((err) => {
  console.error(`${RED}Error en aurora-inicio:${RESET}`, err.message);
  process.exit(1);
});
