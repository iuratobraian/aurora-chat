import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const command = process.argv[2] || "menu";

const readText = (relativePath) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");

const readJson = (relativePath) =>
  JSON.parse(readText(relativePath));

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

function printMenu() {
  console.log("Aurora Core Terminal");
  console.log("====================");
  console.log("1. Estado general        -> npm run aurora:status");
  console.log("2. Tareas abiertas       -> npm run aurora:tasks");
  console.log("3. Agentes registrados   -> npm run aurora:agentes");
  console.log("4. Rastreo local seguro  -> npm run aurora:rastreo");
  console.log("5. Repositorios Aurora   -> npm run aurora:repos");
  console.log("6. Conectores y MCP      -> npm run aurora:conectores");
  console.log("7. Catálogo de creaciones-> npm run aurora:creations");
  console.log("8. Base de conocimiento  -> npm run aurora:knowledge -- strategy");
  console.log("9. Búsqueda web          -> npm run aurora:web -- architecture patterns");
  console.log("10. Crear incubador      -> npm run aurora:create -- --kind web_platform --name \"mi plataforma\"");
  console.log("11. Capacidades Aurora   -> npm run aurora:capabilities");
  console.log("12. Shell terminal       -> npm run aurora:shell");
  console.log("13. UI local             -> npm run aurora:ui");
  console.log("14. App de escritorio    -> npm run aurora:desktop");
  console.log("15. Levantar API local   -> npm run aurora:api");
  console.log("");
  console.log("Acceso rápido:");
  console.log("- skills canónicas: .agent/skills/README.md");
  console.log("- board: .agent/workspace/coordination/TASK_BOARD.md");
  console.log("- focus: .agent/workspace/coordination/CURRENT_FOCUS.md");
  console.log("- chat archive: .agent/workspace/archives/CHAT_SESSION_MASTER_ARCHIVE_2026-03-20.md");
}

function printStatus() {
  const tasks = parseTaskBoard(readText(".agent/workspace/coordination/TASK_BOARD.md"));
  const open = tasks.filter((task) => task.status !== "done");
  const critical = open.filter((task) => /^CRIT|^SEC|^PAY|^STAB/.test(task.id));
  console.log("Aurora Core Status");
  console.log("==================");
  console.log(`Total tasks: ${tasks.length}`);
  console.log(`Open tasks: ${open.length}`);
  console.log(`Critical open tasks: ${critical.length}`);
  console.log("");
  console.log("Current focus preview:");
  console.log(readText(".agent/workspace/coordination/CURRENT_FOCUS.md").split(/\r?\n/).slice(0, 12).join("\n"));
}

function printTasks() {
  const tasks = parseTaskBoard(readText(".agent/workspace/coordination/TASK_BOARD.md"));
  const open = tasks.filter((task) => task.status !== "done");
  console.log("Open Tasks");
  console.log("==========");
  for (const task of open.slice(0, 25)) {
    console.log(`${task.id} | ${task.status} | ${task.owner} | ${task.scope}`);
    console.log(`  Goal: ${task.goal}`);
  }
}

function printCreations() {
  const catalog = readJson(".agent/aurora/creation-catalog.json");
  console.log("Aurora Creation Catalog");
  console.log("=======================");
  for (const category of catalog.categories) {
    console.log(`${category.label}`);
    for (const item of category.items) {
      console.log(`- ${item}`);
    }
    console.log("");
  }
}

function printKnowledge() {
  const files = [
    ".agent/brain/db/heuristics.jsonl",
    ".agent/brain/db/anti_patterns.jsonl",
    ".agent/brain/db/patterns.jsonl",
    ".agent/brain/db/ideas.jsonl",
    ".agent/brain/db/references.jsonl",
    ".agent/brain/db/error_catalog.jsonl"
  ];
  const all = files.flatMap((relativePath) => {
    const full = path.join(ROOT, relativePath);
    if (!fs.existsSync(full)) return [];
    const text = fs.readFileSync(full, "utf8").trim();
    if (!text) return [];
    return text
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .map((item) => ({ ...item, collection: path.basename(relativePath) }));
  });
  console.log("Aurora Knowledge Preview");
  console.log("========================");
  for (const item of all.slice(0, 15)) {
    const title = item.title || item.id;
    const statement = item.statement || item.url || item.status || "";
    console.log(`[${item.collection}] ${title}`);
    if (statement) console.log(`  ${statement}`);
  }
}

function printUi() {
  console.log("Aurora Local UI");
  console.log("===============");
  console.log("1. Start the API: npm run aurora:api");
  console.log("2. Open in browser: http://localhost:4310/app");
}

function printFunctions() {
  console.log("Aurora Functions");
  console.log("================");
  console.log("List: npm run aurora:functions");
  console.log("Run:  node scripts/aurora-agent-functions.mjs run repo-map");
  console.log("API:  /functions y /functions/run?name=repo-map");
  console.log("Shell: /functions y /fn repo-map");
}

switch (command) {
  case "menu":
    printMenu();
    break;
  case "status":
    printStatus();
    break;
  case "tasks":
    printTasks();
    break;
  case "creations":
    printCreations();
    break;
  case "knowledge":
    printKnowledge();
    break;
  case "ui":
    printUi();
    break;
  case "functions":
    printFunctions();
    break;
  default:
    console.error(`Unknown Aurora command: ${command}`);
    process.exitCode = 1;
}
