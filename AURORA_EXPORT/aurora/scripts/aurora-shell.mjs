import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { spawn } from "node:child_process";
import { searchWeb } from "./aurora-web-search.mjs";
import { getRepos } from "./aurora-repo-manager.mjs";
import { getAgentRegistry, getAgentTrackerSnapshot } from "./aurora-agent-tracker.mjs";
import { getConnectorStatus } from "./aurora-connectors.mjs";
import { askOllama, getLocalAgentStatus } from "./aurora-local-agents.mjs";
import { runCodexCloudList, runCodexExec } from "./aurora-agent-bridge.mjs";
import { listAuroraFunctions, runAuroraFunction } from "./aurora-agent-functions.mjs";
import { buildExecutionPlan, buildTaskClosure, reasonTask, summarizeHandoff } from "./aurora-reasoning.mjs";
import { hf } from "../lib/aurora/hf-tools.mjs";
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
  getAuroraSurfaceRegistry
} from "./aurora-sovereign.mjs";
import { buildAuroraSessionBrief, printAuroraSessionBrief } from "./aurora-session-brief.mjs";

const ROOT = process.cwd();
const COLOR = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
  gray: "\x1b[90m",
  bold: "\x1b[1m"
};
const menuOptions = [
  { key: "1", label: "Actualizar pipeline completo", command: "/updates" },
  { key: "2", label: "Mostrar conectores", command: "/connectors" },
  { key: "3", label: "Revisar estado local de agentes", command: "/local" },
  { key: "4", label: "Investigar repo OSS", command: "/research QwenLM/qwen-agent" },
  { key: "5", label: "Sembrar app", command: "/console npm run aurora:seed-app-learning" },
  { key: "6", label: "Scorecard", command: "/console npm run aurora:scorecard" },
  { key: "7", label: "Antigravity sync", command: "/antigravity-sync" },
  { key: "8", label: "Brief de inicio", command: "/session-brief" },
  { key: "9", label: "Kickoff fullstack", command: "/stack" }
];
const apiBase = "http://localhost:4310";
const CODING_TASK_PATTERN = /(fix|bug|error|implementar|crear|agregar|program|codigo|fullstack|frontend|backend|convex|api|component|view|schema|mutation|query|auth|payment|webhook|script|refactor|route|endpoint|hook|ui)/i;

const readText = (relativePath) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");

const readJson = (relativePath) =>
  JSON.parse(readText(relativePath));

function readJsonl(relativePath) {
  const full = path.join(ROOT, relativePath);
  if (!fs.existsSync(full)) return [];
  const text = fs.readFileSync(full, "utf8").trim();
  if (!text) return [];
  return text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}
function paint(color, value) {
  return `${color}${value}${COLOR.reset}`;
}
function divider(label = "") {
  const base = "────────────────────────────────────────────────────────";
  if (!label) return paint(COLOR.gray, base);
  return paint(COLOR.gray, `${base} ${label}`);
}
function panel(title, lines) {
  console.log(paint(COLOR.bold + COLOR.cyan, `\n${title}`));
  lines.forEach((line) => console.log(`  ${line}`));
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

function getKnowledge(query = "") {
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

function createIncubatorBootstrap(kind, name) {
  const slug = (name || "new-creation")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "new-creation";
  const incubatorDir = path.join(ROOT, ".agent/workspace/incubator", slug);
  fs.mkdirSync(incubatorDir, { recursive: true });

  const spec = `# ${name}\n\n## Metadata\n\n- Kind: ${kind}\n- Slug: ${slug}\n- Created by: Aurora Shell\n\n## Intent\n\n- Problem:\n- User:\n- Outcome:\n- Constraints:\n\n## Product\n\n- Core flow:\n- Modules:\n- Monetization:\n- Risks:\n\n## Architecture\n\n- Frontend:\n- Backend:\n- Data:\n- Integrations:\n\n## Validation\n\n- Acceptance:\n- Fallback:\n- Next step:\n`;
  const tasks = `# ${name} Tasks\n\n| TASK-ID | Status | Owner | Scope | Goal |\n|---|---|---|---|---|\n| ${slug.toUpperCase().replace(/-/g, "_")}-001 | todo | unassigned | ${kind} | Convert initial incubator spec into executable product spec |\n| ${slug.toUpperCase().replace(/-/g, "_")}-002 | todo | unassigned | ${kind} | Define architecture and data model |\n| ${slug.toUpperCase().replace(/-/g, "_")}-003 | todo | unassigned | ${kind} | Define monetization and validation |\n`;
  const notes = `# ${name} Notes\n\n## Why this exists\n\nIncubator scaffold generated by Aurora Shell.\n`;

  fs.writeFileSync(path.join(incubatorDir, "SPEC.md"), spec, "utf8");
  fs.writeFileSync(path.join(incubatorDir, "TASKS.md"), tasks, "utf8");
  fs.writeFileSync(path.join(incubatorDir, "NOTES.md"), notes, "utf8");

  return `.agent/workspace/incubator/${slug}`;
}

async function chatReply(query) {
  const lower = query.toLowerCase();
  const tasks = getTasks();
  const catalog = readJson(".agent/aurora/creation-catalog.json");
  const knowledge = getKnowledge(lower).slice(0, 5);

  if (lower.includes("status") || lower.includes("estado")) {
    const open = tasks.filter((task) => task.status !== "done").length;
    const critical = tasks.filter((task) => task.status !== "done" && /^CRIT|^SEC|^PAY|^STAB/.test(task.id)).length;
    return `Aurora status: ${open} tareas abiertas, ${critical} críticas abiertas.`;
  }
  if (lower.includes("create") || lower.includes("crear")) {
    return `Aurora puede iniciar ${catalog.categories.map((c) => c.label).join(", ")}. Usa: /create <kind> <name>.`;
  }
  if (knowledge.length > 0) {
    return `Señal encontrada: ${knowledge[0].statement || knowledge[0].title || knowledge[0].id}`;
  }
  const web = await searchWeb(query);
  if (!web.unavailable && (web.answer || web.results?.length)) {
    const first = web.results?.[0];
    return web.answer || `No había señal local suficiente. Primer resultado web: ${first?.title || "sin título"} ${first?.url || ""}`;
  }
  return "Consulta no resuelta en la base local. Intentá con /help, /status, /tasks, /knowledge <query>, /web <query> o /create <kind> <name>.";
}

function looksLikeCodingTask(input) {
  return CODING_TASK_PATTERN.test(input) && input.trim().length >= 12;
}

function printSectionList(title, items) {
  if (!items?.length) return;
  console.log(divider(title));
  items.forEach((item) => console.log(`- ${item}`));
}

async function printStackBrief(query = "") {
  const result = await runAuroraFunction("architecture-brief", query);
  panel("Stack", [
    `producto: ${result.product}`,
    `frontend: ${result.frontend}`,
    `backend: ${result.backend}`,
    `data: ${result.data}`,
    `realtime: ${result.realtime}`,
    `testing: ${result.testing}`,
    `ai: ${result.ai}`,
    `surface probable: ${result.likelySurface}`
  ]);
  printSectionList("archivos probables", result.likelyFiles || []);
}

async function printRepoMapBrief() {
  const result = await runAuroraFunction("repo-map");
  panel("Repo Map", [
    `root: ${result.root}`,
    `server.ts: ${result.purpose["server.ts"]}`,
    `views/: ${result.purpose["views/"]}`,
    `components/: ${result.purpose["components/"]}`,
    `services/: ${result.purpose["services/"]}`,
    `convex/: ${result.purpose["convex/"]}`,
    `scripts/: ${result.purpose["scripts/"]}`,
    `.agent/: ${result.purpose[".agent/"]}`
  ]);
  printSectionList("key areas", result.keyAreas || []);
}

async function printSurfaceDetail(query = "") {
  const result = await runAuroraFunction("surface-brief", query);
  if (!result.found) {
    console.log("No encontré esa surface. Disponibles:");
    (result.available || []).forEach((item) => console.log(`- ${item.id} | ${item.label}`));
    return;
  }

  panel("Surface", [
    `id: ${result.id}`,
    `label: ${result.label}`,
    `domain: ${result.domain}`,
    `goal: ${result.goal}`
  ]);
  printSectionList("signals", result.signals || []);
  printSectionList("files", result.files || []);
  printSectionList(
    "knowledge",
    (result.relatedKnowledge || []).map((item) => `${item.id}: ${item.statement || item.title}`)
  );
}

async function printFullstackKickoff(query) {
  const result = await runAuroraFunction("fullstack-task-brief", query);
  panel("Fullstack Kickoff", [
    `tarea: ${result.query}`,
    `scope: ${result.scope}`,
    `surface: ${result.surface.label}`,
    `complexity: ${result.complexity}`,
    `risk: ${result.risk.severity}`
  ]);
  panel("Stack Slice", [
    `frontend: ${result.stack.frontend}`,
    `backend: ${result.stack.backend}`,
    `data: ${result.stack.data}`,
    `testing: ${result.stack.testing}`,
    `payments: ${result.stack.payments}`,
    `ai: ${result.stack.ai}`
  ]);
  printSectionList("likely files", result.likelyFiles || []);
  printSectionList("frontend areas", result.frontendAreas || []);
  printSectionList("backend areas", result.backendAreas || []);
  printSectionList("data areas", result.dataAreas || []);
  printSectionList("operating steps", result.operatingSteps || []);
  printSectionList("validation", result.validation || []);
  printSectionList("quick checks", result.quickChecks || []);
  printSectionList(
    "knowledge",
    (result.relatedKnowledge || []).map((item) => `${item.id}: ${item.statement || item.title}`)
  );
}

function printHeader() {
  console.clear();
  const repos = getRepos();
  const activeRepo = repos.activo || "sin-repo";
  const connectors = getConnectorStatus();
  const local = getLocalAgentStatus();
  const activeApis = connectors.apis.filter((item) => item.activo).length;
  const openTasks = getTasks().filter((task) => task.status !== "done").length;
  console.log(paint(COLOR.bold + COLOR.magenta, "AURORA TERMINAL / ANTIGRAVITY MODE"));
  console.log(paint(COLOR.gray, "Console for coding, fullstack context and app creation"));
  console.log(divider());
  panel("Session", [
    `repo: ${paint(COLOR.green, activeRepo)}`,
    `open tasks: ${paint(COLOR.yellow, String(openTasks))}`,
    `active apis: ${paint(COLOR.green, String(activeApis))}`,
    `ollama: ${local.ollama.instalado ? paint(COLOR.green, "ready") : paint(COLOR.yellow, "missing")}`,
    `codex: ${local.codex.instalado ? paint(COLOR.green, "ready") : paint(COLOR.yellow, "missing")}`,
    `opencode: ${local.opencode.instalado ? paint(COLOR.green, "ready") : paint(COLOR.yellow, "missing")}`
  ]);
  console.log(divider("quick actions"));
  menuOptions.forEach((option) => {
    console.log(` ${paint(COLOR.blue, option.key + ".")} ${option.label}`);
  });
  console.log(divider("flash commands"));
  console.log(` ${paint(COLOR.gray, "/help")} ${paint(COLOR.gray, "/local")} ${paint(COLOR.gray, "/research owner/repo")} ${paint(COLOR.gray, "/web topic")} ${paint(COLOR.gray, "/learn fact")} ${paint(COLOR.magenta, "/hf:scrape")}`);
  console.log("");
}

function printHelp() {
  console.log("/help                  Muestra ayuda");
  console.log("/status                Resume estado de Aurora y backlog");
  console.log("/tasks                 Lista tareas abiertas");
  console.log("/agents                Lista agentes registrados");
  console.log("/track                 Muestra rastreo local seguro");
  console.log("/repos                 Lista repositorios gestionados");
  console.log("/connectors            Lista APIs y MCP disponibles para Aurora");
  console.log("/local                 Muestra estado de Ollama y OpenCode");
  console.log("/agent add <nombre> <tipo>  Registra otro agente externo");
  console.log("/ollama <prompt>       Consulta directa al modelo local de Ollama");
  console.log("/codex <prompt>        Ejecuta Codex no interactivo sobre el repo activo");
  console.log("/codex-cloud           Lista tareas de Codex Cloud");
  console.log("/research <repo>       Trae datos de GitHub y los añade al conocimiento");
  console.log("/autolearn             Ejecuta el auto-learn sobre activity_log");
  console.log("/console <comando>     Ejecuta un comando permitido en el repo activo");
  console.log("/creations             Lista catálogo de creaciones");
  console.log("/knowledge <query>     Busca en la base de conocimiento");
  console.log("/web <query>           Busca en internet si hay provider configurado");
  console.log("/functions             Lista las 100 funciones de Aurora");
  console.log(divider("HF-Agents"));
  console.log("/hf-agents list        Lista todos los 24 agentes HF");
  console.log("/hf-agent <nombre>     Muestra detalles de un agente");
  console.log("/hf:scrape <url>       Scrapea website a markdown (HF web-scraper)");
  console.log("/hf:graph <texto>      Construye knowledge graph (HF knowledge-graph)");
  console.log("/hf:research <query>   Deep research multi-agente (HF deep-research)");
  console.log("/hf:workflow <name>    Ejecuta workflow automatizado (HF workflow-builder)");
  console.log("/hf:agent <task>       Ejecuta CodeAgent (smolagents)");
  console.log("/hf:convert <f> <t>    Convierte archivos entre formatos");
  console.log("/hf:tools              Lista herramientas HF disponibles");
  console.log("/fn <name> <input>     Ejecuta una función de Aurora por nombre");
  console.log("/stack [texto]         Resume stack y foco técnico del repo o de una tarea");
  console.log("/repo-map              Muestra las áreas clave del repo y su propósito");
  console.log("/surface <id|texto>    Describe una surface del producto con archivos y señal");
  console.log("/code-task <texto>     Convierte una tarea técnica en kickoff fullstack");
  console.log("/fullstack <texto>     Alias de /code-task");
  console.log("/reason <texto>        Clasifica tarea, riesgo, siguiente paso y validación");
  console.log("/plan <texto>          Genera plan corto de ejecución antes de tocar código");
  console.log("/handoff <task-id>     Resume handoff operativo de una tarea");
  console.log("/close-task <id> [notas] Genera cierre y handoff sugerido para una tarea");
  console.log("/surfaces              Muestra el registro soberano de surfaces de Aurora");
  console.log("/contracts             Muestra los contratos soberanos activos");
  console.log("/drift                 Emite el drift report de Aurora");
  console.log("/risk <texto>          Emite un risk signal estructurado");
  console.log("/validate <texto>      Emite un validation checklist estructurado");
  console.log("/next <texto>          Emite el next best step estructurado");
  console.log("/scorecard             Muestra el scorecard diario de Aurora");
  console.log("/health-snapshot       Muestra el health snapshot soberano");
  console.log("/session-brief         Muestra el brief operativo de inicio");
  console.log("/context <query>       Devuelve el context pack minimo para una tarea o consulta");
  console.log("/handoff-brief <id> [notas] Emite un handoff brief estructurado");
  console.log("/antigravity-sync      Ejecuta el sync completo de Antigravity");
  console.log("/chat <message>        Habla con Aurora desde terminal");
  console.log("/create <kind> <name>  Crea un incubador nuevo");
  console.log("/focus                 Muestra focus actual");
  console.log("/exit                  Cierra la shell");
}

function printStatus() {
  const tasks = getTasks();
  const open = tasks.filter((task) => task.status !== "done");
  const critical = open.filter((task) => /^CRIT|^SEC|^PAY|^STAB/.test(task.id));
  panel("Status", [
    `open: ${paint(COLOR.yellow, String(open.length))}`,
    `critical: ${paint(COLOR.yellow, String(critical.length))}`,
    `total: ${paint(COLOR.green, String(tasks.length))}`
  ]);
  printHFAgentsSummary();
}

function printHFAgentsSummary() {
  const hfAgents = [
    { name: 'Dify', stars: 130000, type: 'platform' },
    { name: 'LangChain', stars: 122850, type: 'framework' },
    { name: 'MetaGPT', stars: 61919, type: 'multi-agent' },
    { name: 'OpenClaw', stars: 60000, type: 'coding' },
    { name: 'AutoGen', stars: 52927, type: 'multi-agent' },
    { name: 'LlamaIndex', stars: 46100, type: 'rag' },
    { name: 'Claude Code', stars: 40800, type: 'coding' },
    { name: 'smolagents', stars: 30000, type: 'framework' },
    { name: 'CrewAI', stars: 22000, type: 'multi-agent' },
    { name: 'Mem0', stars: 14000, type: 'memory' }
  ];
  
  console.log(divider("HF-Agents (Top 10 by GitHub Stars)"));
  hfAgents.slice(0, 5).forEach((a, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
    console.log(`  ${medal} ${paint(COLOR.cyan, a.name.padEnd(12))} ${paint(COLOR.gray, String(a.stars).padStart(8))} ⭐`);
  });
  console.log(paint(COLOR.dim, `  ... y 15+ más agentes disponibles`));
  console.log(paint(COLOR.gray, `  Usa ${paint(COLOR.magenta, "/hf-agents list")} para ver todos`));
  console.log(paint(COLOR.gray, `  Usa ${paint(COLOR.magenta, "/hf-agent <nombre>")} para detalles`));
}

const hfAgentsRegistry = [
  { name: 'Dify', stars: 130000, type: 'platform', desc: 'No-code LLM app builder', install: 'pip install dify', category: 'Top GitHub' },
  { name: 'LangChain', stars: 122850, type: 'framework', desc: 'LLM app framework', install: 'pip install langchain', category: 'Top GitHub' },
  { name: 'MetaGPT', stars: 61919, type: 'multi-agent', desc: 'Multi-agent software company', install: 'pip install metagpt', category: 'Top GitHub' },
  { name: 'OpenClaw', stars: 60000, type: 'coding', desc: 'Coding agent', install: 'npx openclaw', category: 'Top GitHub' },
  { name: 'AutoGen', stars: 52927, type: 'multi-agent', desc: 'Multi-agent LLM framework', install: 'pip install autogen', category: 'Top GitHub' },
  { name: 'LlamaIndex', stars: 46100, type: 'rag', desc: 'Data framework for LLMs', install: 'pip install llama-index', category: 'Top GitHub' },
  { name: 'Claude Code', stars: 40800, type: 'coding', desc: 'Anthropic CLI coding agent', install: 'npm install -g @anthropic-ai/claude-code', category: 'Top GitHub' },
  { name: 'smolagents', stars: 30000, type: 'framework', desc: 'HuggingFace agent framework', install: 'pip install smolagents', category: 'Top GitHub' },
  { name: 'CrewAI', stars: 22000, type: 'multi-agent', desc: 'Multi-agent orchestration', install: 'pip install crewai', category: 'Top GitHub' },
  { name: 'Mem0', stars: 14000, type: 'memory', desc: 'Universal memory for AI', install: 'pip install mem0ai', category: 'Top GitHub' },
  { name: 'Letta', stars: 11000, type: 'memory', desc: 'LLM memory server', install: 'pip install letta', category: 'Memory' },
  { name: 'n8n', stars: 45000, type: 'workflow', desc: 'Workflow automation', install: 'npm install -g n8n', category: 'Automation' },
  { name: 'Cognee', stars: 14500, type: 'memory', desc: 'Graph + vector memory', install: 'pip install cognee', category: 'Memory' },
  { name: 'Goose', stars: 18000, type: 'coding', desc: 'Open source coding agent', install: 'pip install goose', category: 'Coding' },
  { name: 'AgentScope', stars: 8000, type: 'multi-agent', desc: 'Multi-agent platform', install: 'pip install agentscope', category: 'Multi-Agent' },
  { name: 'Gemini CLI', stars: 12000, type: 'coding', desc: 'Google CLI agent', install: 'npm install -g @google/gemini-cli', category: 'Coding' },
  { name: 'computer-use', stars: 900, type: 'hf-space', desc: 'Browser automation agent', install: 'pip install smolagents', category: 'HF Spaces' },
  { name: 'web-scraper', stars: 100, type: 'hf-space', desc: 'Web scraping MCP', install: 'npm install -g @agents-mcp-hackathon/web-scraper', category: 'HF Spaces' },
  { name: 'knowledge-graph', stars: 19, type: 'hf-space', desc: 'Graph builder MCP', install: 'npm install -g @agents-mcp-hackathon/knowledge-graph-builder', category: 'HF Spaces' },
  { name: 'deep-research', stars: 20, type: 'hf-space', desc: 'Multi-agent research', install: 'npm install -g @agents-mcp-hackathon/multi-agent-deep-research', category: 'HF Spaces' },
  { name: 'fish-agent', stars: 139, type: 'hf-space', desc: 'Voice agent', install: 'Access via HF Space', category: 'HF Spaces' },
  { name: 'workflow-builder', stars: 65, type: 'hf-space', desc: 'Visual workflow builder', install: 'npm install -g @agents-mcp-hackathon/workflow-builder', category: 'HF Spaces' },
  { name: 'agent-ui', stars: 35, type: 'hf-space', desc: 'Agent chat interface', install: 'Access via HF Space', category: 'HF Spaces' },
  { name: 'file-converter', stars: 50, type: 'hf-space', desc: 'Document converter', install: 'Access via HF Space', category: 'HF Spaces' }
];

function printHFAgentsFullList() {
  console.log(paint(COLOR.bold + COLOR.magenta, "\n📦 HF-Agents Registry (24 agents)"));
  const categories = {};
  for (const agent of hfAgentsRegistry) {
    if (!categories[agent.category]) categories[agent.category] = [];
    categories[agent.category].push(agent);
  }
  for (const [cat, agents] of Object.entries(categories)) {
    console.log(divider(cat));
    for (const a of agents) {
      const stars = paint(COLOR.yellow, String(a.stars).padStart(7));
      console.log(`  ${paint(COLOR.cyan, a.name.padEnd(15))} ${stars} ⭐  ${paint(COLOR.gray, a.desc)}`);
    }
  }
  console.log(divider());
  console.log(paint(COLOR.gray, `Usa ${paint(COLOR.magenta, "/hf-agent <nombre>")} para ver detalles de un agente`));
}

function printHFAgentDetail(name) {
  const agent = hfAgentsRegistry.find(a => a.name.toLowerCase() === name || a.name.toLowerCase().includes(name));
  if (!agent) {
    console.log(paint(COLOR.yellow, `Agente "${name}" no encontrado.`));
    console.log(paint(COLOR.gray, `Disponibles: ${hfAgentsRegistry.map(a => a.name).join(", ")}`));
    return;
  }
  console.log(divider(agent.name));
  console.log(`${paint(COLOR.cyan, "Stars:")} ${paint(COLOR.yellow, String(agent.stars))} ⭐`);
  console.log(`${paint(COLOR.cyan, "Type:")} ${agent.type}`);
  console.log(`${paint(COLOR.cyan, "Category:")} ${agent.category}`);
  console.log(`${paint(COLOR.cyan, "Description:")} ${agent.desc}`);
  console.log(`${paint(COLOR.green, "Install:")} ${agent.install}`);
  console.log(divider());
}

function printTasks() {
  const open = getTasks().filter((task) => task.status !== "done").slice(0, 20);
  console.log(divider("open tasks"));
  for (const task of open) {
    console.log(`${paint(COLOR.green, task.id)} | ${task.status} | ${task.owner} | ${task.scope}`);
    console.log(`  ${paint(COLOR.gray, task.goal)}`);
  }
}

function printCreations() {
  const catalog = readJson(".agent/aurora/creation-catalog.json");
  for (const category of catalog.categories) {
    console.log(`${category.label}:`);
    for (const item of category.items) console.log(`  - ${item}`);
  }
}

function printKnowledge(query) {
  const results = getKnowledge(query).slice(0, 15);
  console.log(divider(`knowledge results ${results.length}`));
  for (const item of results) {
    console.log(`[${paint(COLOR.blue, item.collection)}] ${item.title || item.id}`);
    if (item.statement || item.url || item.status) {
      console.log(`  ${paint(COLOR.gray, item.statement || item.url || item.status)}`);
    }
  }
}

function printFocus() {
  console.log(readText(".agent/workspace/coordination/CURRENT_FOCUS.md"));
}

function printAgents() {
  const registry = getAgentRegistry();
  for (const agent of registry.agentes) {
    console.log(`${agent.nombre} | ${agent.tipo} | ${agent.estado}`);
    console.log(`  Fortalezas: ${(agent.fortalezas || []).join(", ")}`);
  }
}

function printTrack() {
  console.log(JSON.stringify(getAgentTrackerSnapshot(), null, 2));
}

function printRepos() {
  const repos = getRepos();
  console.log(`Repo activo: ${repos.activo}`);
  for (const repo of repos.repositorios) {
    console.log(`${repo.nombre} | ${repo.estado} | ${repo.tipo}`);
    console.log(`  ${repo.ruta}`);
  }
}

function printConnectors() {
  const data = getConnectorStatus();
  console.log(divider("apis"));
  for (const item of data.apis) {
    console.log(`- ${item.id} | ${item.tipo} | ${item.activo ? paint(COLOR.green, "activo") : paint(COLOR.gray, "inactivo")}`);
  }
  console.log(divider("mcp"));
  for (const item of data.mcp) {
    console.log(`- ${item.id} | ${item.tipo}`);
  }
  console.log(divider("local agents"));
  console.log(`- ollama | ${data.locales.ollama.instalado ? "instalado" : "no detectado"} | modelos: ${data.locales.ollama.modelos.length}`);
  console.log(`- opencode | ${data.locales.opencode.instalado ? "instalado" : "no detectado"}`);
  console.log(`- codex | ${data.locales.codex.instalado ? "instalado" : "no detectado"} | cloud: ${data.locales.codex.cloud ? "si" : "no"}`);
  if (data.aiModels?.length) {
    console.log(divider("ai models"));
    data.aiModels.forEach((model) => {
      console.log(`- ${model.name} (${model.provider}) | ${model.capabilities.join(", ")} | ${model.status}`);
    });
  }
}

function printLocalAgents() {
  console.log(JSON.stringify(getLocalAgentStatus(), null, 2));
}

function runAllowedConsoleCommand(input) {
  const repos = getRepos();
  const active = repos.repositorios.find((repo) => repo.nombre === repos.activo);
  if (!active) {
    console.log("No hay un repositorio activo configurado.");
    return Promise.resolve();
  }
  const trimmed = input.trim();
  const allowed = [
    "git status",
    "npm run",
    "npm test",
    "node --version",
    "rg ",
    "dir",
    "Get-ChildItem"
  ];
  if (!allowed.some((item) => trimmed === item || trimmed.startsWith(item))) {
    console.log("Comando no permitido en la consola Aurora. Usa comandos de inspeccion o scripts npm del repo activo.");
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const child = spawn("powershell", ["-NoLogo", "-NoProfile", "-Command", trimmed], {
      cwd: active.ruta,
      stdio: "inherit"
    });
    child.on("close", () => resolve());
  });
}

async function handleCommand(input) {
  let trimmed = input.trim();
  if (!trimmed) return;

  const preset = menuOptions.find((item) => item.key === trimmed);
  if (preset) {
    console.log(`Ejecutando atajo: ${preset.label}`);
    trimmed = preset.command;
  }

  if (!trimmed.startsWith("/")) {
    if (looksLikeCodingTask(trimmed)) {
      await printFullstackKickoff(trimmed);
    } else {
      console.log(await chatReply(trimmed));
    }
    return;
  }

  const [command, ...rest] = trimmed.split(" ");
  switch (command) {
    case "/help":
      printHelp();
      break;
    case "/status":
      printStatus();
      break;
    case "/tasks":
      printTasks();
      break;
    case "/agents":
      printAgents();
      break;
    case "/track":
      printTrack();
      break;
    case "/repos":
      printRepos();
      break;
    case "/connectors":
      printConnectors();
      break;
    case "/local":
      printLocalAgents();
      break;
    case "/ollama": {
      const result = await askOllama(rest.join(" "));
      console.log(result.answer);
      break;
    }
    case "/codex":
      await runCodexExec(rest.join(" "));
      break;
    case "/codex-cloud":
      await runCodexCloudList();
      break;
    case "/research": {
      const repo = rest.join(" ").trim();
      if (!repo) {
        console.log("Usa /research <owner/repo>");
        break;
      }
      const res = await fetch(`http://localhost:4310/research?repo=${encodeURIComponent(repo)}`);
      const body = await res.json();
      if (body.ok) {
        console.log(paint(COLOR.green, `Investigación guardada: ${body.entry.id}`));
      } else {
        console.log(paint(COLOR.yellow, `No se pudo investigar: ${body.error}`));
      }
      break;
    }
    case "/agent": {
      if (rest[0] === "add") {
        const name = rest[1];
        const type = rest[2] || "especialista";
        if (!name) {
          console.log("Sintaxis: /agent add <nombre> <tipo>");
          break;
        }
        await fetch(`${apiBase}/agentes/agregar?nombre=${encodeURIComponent(name)}&tipo=${encodeURIComponent(type)}`);
        console.log(paint(COLOR.green, `Agente ${name} añadido como ${type}.`));
      } else {
        console.log("Comando de agentes: /agent add <nombre> <tipo>");
      }
      break;
    }
    case "/autolearn": {
      console.log("Corriendo auto-aprendizaje...");
      await runAllowedConsoleCommand("npm run ops:auto-learn");
      break;
    }
    // HF-Agents commands
    case "/hf:scrape": {
      const url = rest.join(" ").trim();
      if (!url) {
        console.log("Usa /hf:scrape <url>");
        break;
      }
      console.log(paint(COLOR.magenta, `🔍 HF: Scrapeando ${url}...`));
      const result = await hf.scrape(url);
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    case "/hf:graph": {
      const text = rest.join(" ").trim();
      if (!text) {
        console.log("Usa /hf:graph <texto>");
        break;
      }
      console.log(paint(COLOR.magenta, `🔷 HF: Construyendo knowledge graph...`));
      const result = await hf.graph(text);
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    case "/hf:research": {
      const query = rest.join(" ").trim();
      if (!query) {
        console.log("Usa /hf:research <query>");
        break;
      }
      console.log(paint(COLOR.magenta, `🔬 HF: Deep research sobre "${query}"...`));
      const result = await hf.research(query);
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    case "/hf:workflow": {
      const name = rest.join(" ").trim();
      if (!name) {
        console.log("Usa /hf:workflow <nombre> (code-review, data-analysis, research)");
        break;
      }
      console.log(paint(COLOR.magenta, `⚙️ HF: Ejecutando workflow "${name}"...`));
      const result = await hf.workflow(name);
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    case "/hf:agent": {
      const task = rest.join(" ").trim();
      if (!task) {
        console.log("Usa /hf:agent <tarea>");
        break;
      }
      console.log(paint(COLOR.magenta, `🤖 HF: Ejecutando CodeAgent...`));
      const result = await hf.agent(task);
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    case "/hf:tools": {
      const tools = hf.tools();
      console.log(paint(COLOR.magenta, "\n🤖 HF Tools Disponibles:"));
      tools.forEach(t => {
        console.log(`  ${paint(COLOR.cyan, t.name)} ${t.description}`);
        console.log(`    Params: ${t.params}`);
      });
      console.log(`\n${paint(COLOR.green, "✅ HF status:")}`, hf.health());
      break;
    }
    case "/hf:convert": {
      const parts = rest.join(" ").split(" ");
      const [from, to, ...contentParts] = parts;
      if (!from || !to || !contentParts.length) {
        console.log("Usa /hf:convert <from> <to> <contenido>");
        console.log("Ejemplo: /hf:convert json yaml '{\"key\": \"value\"}'");
        break;
      }
      console.log(paint(COLOR.magenta, `🔄 HF: Convirtiendo ${from} → ${to}...`));
      const result = await hf.convert(contentParts.join(" "), from, to);
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    case "/hf-agents": {
      const subcmd = rest[0]?.toLowerCase();
      if (subcmd === "list" || !subcmd) {
        printHFAgentsFullList();
      } else {
        console.log("Usa /hf-agents list");
      }
      break;
    }
    case "/hf-agent": {
      const name = rest.join(" ").trim().toLowerCase();
      if (!name) {
        console.log("Usa /hf-agent <nombre>");
        console.log("Ejemplo: /hf-agent dify, langchain, smolagents, crewai, mem0");
        break;
      }
      printHFAgentDetail(name);
      break;
    }
    case "/console":
      await runAllowedConsoleCommand(rest.join(" "));
      break;
    case "/creations":
      printCreations();
      break;
    case "/knowledge":
      printKnowledge(rest.join(" "));
      break;
    case "/stack":
      await printStackBrief(rest.join(" ").trim());
      break;
    case "/repo-map":
      await printRepoMapBrief();
      break;
    case "/surface": {
      const query = rest.join(" ").trim();
      if (!query) {
        console.log("Usa /surface <id|texto>");
        break;
      }
      await printSurfaceDetail(query);
      break;
    }
    case "/code-task":
    case "/fullstack": {
      const query = rest.join(" ").trim();
      if (!query) {
        console.log("Usa /code-task <tarea técnica>");
        break;
      }
      await printFullstackKickoff(query);
      break;
    }
    case "/surfaces":
      console.log(JSON.stringify(getAuroraSurfaceRegistry(), null, 2));
      break;
    case "/contracts":
      console.log(JSON.stringify({ total: getAuroraContracts().length, items: getAuroraContracts() }, null, 2));
      break;
    case "/drift":
      console.log(JSON.stringify(buildAuroraDriftReport(), null, 2));
      break;
    case "/risk": {
      const query = rest.join(" ").trim();
      if (!query) {
        console.log("Usa /risk <texto>");
        break;
      }
      console.log(JSON.stringify(buildAuroraRiskSignal(query), null, 2));
      break;
    }
    case "/validate": {
      const query = rest.join(" ").trim();
      if (!query) {
        console.log("Usa /validate <texto>");
        break;
      }
      console.log(JSON.stringify(buildAuroraValidationChecklist(query), null, 2));
      break;
    }
    case "/next": {
      const query = rest.join(" ").trim();
      if (!query) {
        console.log("Usa /next <texto>");
        break;
      }
      console.log(JSON.stringify(buildAuroraNextBestStep(query), null, 2));
      break;
    }
    case "/scorecard":
      console.log(JSON.stringify(buildAuroraScorecardDaily(), null, 2));
      break;
    case "/health-snapshot":
      console.log(JSON.stringify(buildAuroraHealthSnapshot(), null, 2));
      break;
    case "/session-brief":
      printAuroraSessionBrief(buildAuroraSessionBrief());
      break;
    case "/context": {
      const query = rest.join(" ").trim();
      if (!query) {
        console.log("Usa /context <task-id o consulta>");
        break;
      }
      console.log(JSON.stringify(buildAuroraTaskContextPack(query), null, 2));
      break;
    }
    case "/handoff-brief": {
      const taskId = rest[0]?.trim();
      const notes = rest.slice(1).join(" ").trim();
      if (!taskId) {
        console.log("Usa /handoff-brief <task-id> [notas]");
        break;
      }
      console.log(JSON.stringify(buildAuroraHandoffBrief(taskId, notes), null, 2));
      break;
    }
    case "/web": {
      const result = await searchWeb(rest.join(" "));
      if (result.unavailable) {
        console.log(result.message);
      } else {
        console.log(`Provider: ${result.provider}`);
        if (result.answer) console.log(`Answer: ${result.answer}`);
        for (const item of result.results || []) {
          console.log(`- ${item.title}`);
          console.log(`  ${item.url}`);
        }
      }
      break;
    }
    case "/functions": {
      console.log(JSON.stringify({ total: listAuroraFunctions().length, items: listAuroraFunctions() }, null, 2));
      break;
    }
    case "/fn": {
      const name = rest[0]?.trim();
      const input = rest.slice(1).join(" ").trim();
      if (!name) {
        console.log("Usa /fn <name> <input>");
        break;
      }
      try {
        const result = await runAuroraFunction(name, input);
        console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        console.log(`No se pudo ejecutar la función: ${error.message}`);
      }
      break;
    }
    case "/reason": {
      const query = rest.join(" ").trim();
      if (!query) {
        console.log("Usa /reason <texto de tarea>");
        break;
      }
      const result = reasonTask(query);
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    case "/plan": {
      const query = rest.join(" ").trim();
      if (!query) {
        console.log("Usa /plan <texto de tarea>");
        break;
      }
      const result = buildExecutionPlan(query);
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    case "/handoff": {
      const taskId = rest.join(" ").trim();
      if (!taskId) {
        console.log("Usa /handoff <task-id>");
        break;
      }
      const result = summarizeHandoff(taskId);
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    case "/close-task": {
      const taskId = rest[0]?.trim();
      const notes = rest.slice(1).join(" ").trim();
      if (!taskId) {
        console.log("Usa /close-task <task-id> [notas]");
        break;
      }
      const result = buildTaskClosure(taskId, notes);
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    case "/antigravity-sync": {
      addConsoleNotice("Ejecutando antigravity sync...");
      try {
        const res = await fetch(`${apiBase}/antigravity-sync`);
        const body = await res.json();
        console.log(body.message || body.error || "Antigravity sync ejecutado");
      } catch (error) {
        console.log(`No se pudo ejecutar antigravity sync: ${error.message}`);
      }
      break;
    }
    case "/chat":
      console.log(await chatReply(rest.join(" ")));
      break;
    case "/create": {
      const kind = rest[0] || "web_platform";
      const name = rest.slice(1).join(" ") || "new creation";
      console.log(`Created incubator: ${createIncubatorBootstrap(kind, name)}`);
      break;
    }
    case "/focus":
      printFocus();
      break;
    case "/learn": {
      const fact = rest.join(" ").trim();
      if (!fact) {
        console.log("Usa /learn <hecho> para alimentar el conocimiento.");
        break;
      }
      try {
        const res = await fetch(`http://localhost:4310/learn?fact=${encodeURIComponent(fact)}`);
        const body = await res.json();
        if (body.ok) {
          console.log(paint(COLOR.green, `Entrada guardada: ${body.record.id}`));
        } else {
          console.log(paint(COLOR.yellow, `No se guardó: ${body.error}`));
        }
      } catch (error) {
        console.log(paint(COLOR.yellow, `Error al guardar: ${error.message}`));
      }
      break;
    }
    case "/exit":
      return false;
    default:
      console.log("Comando no reconocido. Usa /help.");
  }
  return true;
}

function addConsoleNotice(message) {
  console.log(paint(COLOR.cyan, message));
}

printHeader();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: `\n${paint(COLOR.magenta, "aurora")}:${paint(COLOR.green, getRepos().activo || "repo")} ${paint(COLOR.gray, "›")} `
});
let shellClosed = false;

rl.prompt();
rl.on("line", (line) => {
  Promise.resolve(handleCommand(line)).then((keepRunning) => {
    if (keepRunning === false) {
      shellClosed = true;
      rl.close();
      return;
    }
    if (!shellClosed && !rl.closed) {
      rl.prompt();
    }
  }).catch((error) => {
    console.log(`Error en Aurora shell: ${error.message}`);
    if (!shellClosed && !rl.closed) {
      rl.prompt();
    }
  });
}).on("close", () => {
  shellClosed = true;
  console.log("Aurora Core shell closed.");
});
