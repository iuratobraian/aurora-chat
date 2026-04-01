import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readJsonl(relativePath) {
  const full = path.join(ROOT, relativePath);
  if (!fs.existsSync(full)) return [];
  return fs
    .readFileSync(full, "utf8")
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

function parseTaskBoard(markdown) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => line.startsWith("|") && !line.includes("TASK-ID") && !line.includes("---"))
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 7)
    .map(([id, status, owner, scope, files, goal, acceptance]) => ({
      id, status, owner, scope, files, goal, acceptance
    }));
}

function scoreKeywords(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.reduce((score, keyword) => score + (lower.includes(keyword) ? 1 : 0), 0);
}

function getContext() {
  return {
    board: parseTaskBoard(readText(".agent/workspace/coordination/TASK_BOARD.md")),
    focus: readText(".agent/workspace/coordination/CURRENT_FOCUS.md"),
    surfaces: readJson(".agent/aurora/product-surfaces.json").prioritySurfaces,
    knowledge: readJsonl(".agent/brain/db/teamwork_knowledge.jsonl"),
    appStack: readJson(".agent/aurora/app-stack.json")
  };
}

function getFilesForScope(scope, ctx) {
  switch (scope) {
    case "community_feed":
      return ctx.surfaces.find((surface) => surface.id === "community_feed")?.files || ctx.appStack.communityCore.views;
    case "auth_and_onboarding":
      return ["server.ts", "services/storage.ts", ...ctx.appStack.communityCore.views.slice(0, 2)];
    case "backend_support":
      return [ctx.appStack.backend.apiEntry, ctx.appStack.data.schemas, ...ctx.appStack.communityCore.convexModules.slice(0, 3)];
    case "pricing_and_conversion":
      return ["server.ts", "convex/payments.ts", "convex/paymentOrchestrator.ts", "convex/webhooks.ts", "views/CreatorDashboard.tsx"];
    case "qa_and_release":
      return ["package.json", "vitest.config.ts", "server.ts"];
    case "aurora_ops":
      return ctx.appStack.aiLayer.localRuntime;
    case "design_system":
      return ctx.appStack.communityCore.views;
    default:
      return ctx.appStack.communityCore.views.slice(0, 3);
  }
}

function detectDependencies(query, classification, ctx) {
  const text = query.toLowerCase();
  const dependencies = [];

  if (classification.likelyScope === "community_feed") {
    dependencies.push("services/posts/postService.ts", "services/feed/feedRanker.ts");
  }
  if (classification.likelyScope === "auth_and_onboarding") {
    dependencies.push("services/auth/authService.ts", "services/storage.ts");
  }
  if (classification.likelyScope === "backend_support") {
    dependencies.push("server.ts", "convex/schema.ts");
  }
  if (classification.likelyScope === "pricing_and_conversion") {
    dependencies.push("convex/payments.ts", "views/CreatorDashboard.tsx");
  }
  if (/(payment|payments|pago|pagos|billing|checkout|stripe|mercadopago|zenobank)/.test(text)) {
    dependencies.push("server.ts", "convex/payments.ts", "convex/paymentOrchestrator.ts", "convex/webhooks.ts");
  }
  if (/(convex|mutation|query|schema|db)/.test(text)) {
    dependencies.push(...ctx.appStack.communityCore.convexModules.slice(0, 3));
  }
  if (/(server|api|endpoint|ruta|websocket|webhook|express|backend)/.test(text)) {
    dependencies.push(ctx.appStack.backend.apiEntry);
  }
  if (/(react|view|component|tailwind|ui|dashboard|feed|onboarding)/.test(text)) {
    dependencies.push(...ctx.appStack.communityCore.views.slice(0, 2));
  }
  if (/(aurora|reason|shell|sync|knowledge)/.test(text)) {
    dependencies.push(...ctx.appStack.aiLayer.localRuntime);
  }

  return Array.from(new Set(dependencies)).slice(0, 6);
}

export function classifyTask(query) {
  const ctx = getContext();
  const lower = query.toLowerCase();
  const isAuroraTask = /(aurora|ops-05\d|ops-06\d|shell|reason|context pack|drift|scorecard|retrieval|handoff|connector|mcp|memory architecture|control plane)/.test(lower);
  const surfaceScores = ctx.surfaces.map((surface) => ({
    ...surface,
    score: scoreKeywords(query, [surface.id, surface.label.toLowerCase(), ...surface.signals.map((item) => item.toLowerCase())])
  }));
  const bestSurface = surfaceScores.sort((a, b) => b.score - a.score)[0];
  const hasStrongSurface = (bestSurface?.score || 0) > 0;

  const scopeRules = [
    { scope: "community_feed", keywords: ["feed", "comunidad", "coment", "post", "ranking"] },
    { scope: "auth_and_onboarding", keywords: ["onboarding", "registro", "login", "activar", "auth"] },
    { scope: "backend_support", keywords: ["server", "express", "convex", "webhook", "api", "schema", "endpoint", "ruta", "backend"] },
    { scope: "pricing_and_conversion", keywords: ["pricing", "plan", "checkout", "upgrade", "conversion", "pago", "pagos", "billing", "suscripcion", "stripe", "mercadopago", "zenobank"] },
    { scope: "qa_and_release", keywords: ["test", "lint", "build", "deploy", "release", "ci"] },
    { scope: "aurora_ops", keywords: ["aurora", "shell", "reason", "context", "drift", "scorecard", "retrieval", "handoff", "connector", "mcp", "memory", "control plane"] },
    { scope: "design_system", keywords: ["ui", "css", "tailwind", "layout", "visual"] }
  ];

  const bestScope = scopeRules
    .map((rule) => ({ ...rule, score: scoreKeywords(query, rule.keywords) }))
    .sort((a, b) => b.score - a.score)[0];

  let likelyScope = bestScope?.scope || "project_os";
  if (isAuroraTask) {
    likelyScope = "aurora_ops";
  } else if (hasStrongSurface && bestSurface?.id === "onboarding_activation") likelyScope = "auth_and_onboarding";
  else if (hasStrongSurface && (bestSurface?.id === "community_feed" || bestSurface?.id === "trust_reputation")) likelyScope = "community_feed";
  else if (hasStrongSurface && bestSurface?.id === "creator_monetization") likelyScope = "pricing_and_conversion";
  else if (hasStrongSurface && bestSurface?.id === "moderation_safety") likelyScope = "backend_support";

  if (!isAuroraTask && likelyScope === "qa_and_release" && /(onboarding|comunidad|feed|creator|perfil|moderaci)/.test(lower)) {
    likelyScope = hasStrongSurface && bestSurface?.domain === "community_product" ? "community_feed" : likelyScope;
  }

  const complexityScore =
    scoreKeywords(query, ["server", "schema", "payment", "payments", "pago", "pagos", "auth", "webhook", "migration", "deploy", "endpoint", "backend"]) * 2 +
    scoreKeywords(query, ["ui", "feed", "creator", "onboarding", "chat", "bug", "feature", "vista"]);

  const complexity = complexityScore >= 6 ? "high" : complexityScore >= 3 ? "medium" : "low";

  const relatedTasks = ctx.board
    .filter((task) => JSON.stringify(task).toLowerCase().includes(query.toLowerCase()) || (bestScope?.scope && task.scope === bestScope.scope))
    .slice(0, 5)
    .map((task) => ({
      id: task.id,
      status: task.status,
      scope: task.scope,
      goal: task.goal
    }));

  const relatedKnowledge = ctx.knowledge
    .filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()) || (bestSurface?.domain && item.domain === bestSurface.domain))
    .slice(0, 5)
    .map((item) => item.title || item.id);

  return {
    query,
    likelyScope,
    likelyDomain:
      isAuroraTask
        ? "aurora_system"
        : hasStrongSurface
          ? bestSurface?.domain || "general"
          : likelyScope === "pricing_and_conversion"
            ? "growth"
            : likelyScope === "backend_support"
              ? "security"
              : "general",
    likelySurface:
      isAuroraTask
        ? "Aurora Operations"
        : hasStrongSurface
          ? bestSurface?.label || "general"
          : likelyScope,
    complexity,
    likelyFiles: isAuroraTask ? ctx.appStack.aiLayer.localRuntime : getFilesForScope(likelyScope, ctx),
    relatedTasks,
    relatedKnowledge,
    rationale: [
      isAuroraTask ? "se parece a una operación del runtime Aurora" : bestSurface?.label ? `se parece a la superficie "${bestSurface.label}"` : "sin superficie fuerte",
      likelyScope ? `el scope más probable es "${likelyScope}"` : "sin scope fuerte",
      `la complejidad estimada es ${complexity}`
    ]
  };
}

export function detectRisk(query) {
  const text = query.toLowerCase();
  const risks = [];
  if (/(payment|payments|pago|pagos|billing|suscripcion|stripe|mercadopago|zenobank|checkout|webhook)/.test(text)) risks.push("payments");
  if (/(auth|token|session|login|password|internal-api-key)/.test(text)) risks.push("auth");
  if (/(server|schema|convex|migration|endpoint|ruta|backend|delete|destroy|reset)/.test(text)) risks.push("data_or_runtime");
  if (/(comunidadview|app\.tsx|navigation|pricingview)/.test(text)) risks.push("guarded_file");
  if (/(deploy|release|production|ci)/.test(text)) risks.push("release");

  const severity = risks.includes("payments") || risks.includes("auth") || risks.includes("data_or_runtime")
    ? "high"
    : risks.length
      ? "medium"
      : "low";

  return {
    severity,
    risks,
    recommendation:
      severity === "high"
        ? "leer contexto, limitar scope, validar localmente y evitar cambios sin claim claro"
        : severity === "medium"
          ? "mantener scope chico y validar antes de cerrar"
          : "riesgo controlado si se mantiene disciplina operativa"
  };
}

export function suggestNextStep(query) {
  const classification = classifyTask(query);
  const risk = detectRisk(query);
  const steps = [
    "leer TASK_BOARD.md y CURRENT_FOCUS.md para confirmar ownership",
    classification.likelyFiles.length
      ? `abrir primero: ${classification.likelyFiles.join(", ")}`
      : "abrir primero los archivos más cercanos al objetivo",
    "identificar criterio de aceptación antes de editar"
  ];

  if (classification.complexity !== "low") {
    steps.push("separar trabajo en lectura -> cambio -> validación");
  }
  if (risk.severity === "high") {
    steps.push("limitar el cambio a un scope mínimo y validar side effects explícitamente");
  }

  return {
    query,
    nextStep: steps[0],
    sequence: steps
  };
}

export function suggestValidation(query) {
  const text = query.toLowerCase();
  const commands = ["npm run lint"];
  if (/(ui|view|component|feed|community|creator|dashboard)/.test(text)) commands.push("npm run build");
  if (/(aurora|shell|api|reason|knowledge|sync)/.test(text)) commands.push("npm run aurora:scorecard");
  if (/(aurora|shell|api|reason|knowledge|sync|drift|retrieval|context|handoff|ops-05\d|ops-06\d)/.test(text)) commands.push("npm run aurora:drift");
  if (/(payment|payments|pago|pagos|billing|checkout|webhook|auth|server|convex|endpoint|api)/.test(text)) commands.push("npm run test:run");
  return {
    query,
    commands: Array.from(new Set(commands)),
    note: "ajusta la validación al scope real; lint no reemplaza pruebas de flujo"
  };
}

export function suggestQuickChecks(query) {
  const text = query.toLowerCase();
  const checks = ["confirmar scope y archivo owner antes de editar"];

  if (/(feed|comunidad|coment|post|ranking)/.test(text)) {
    checks.push("verificar shape de posts/comentarios y estados vacíos");
  }
  if (/(onboarding|auth|login|registro|session|token)/.test(text)) {
    checks.push("verificar fallback sin sesión y manejo de errores del flujo");
  }
  if (/(server|api|endpoint|ruta|webhook|payment|payments|pago|pagos|billing|convex|schema)/.test(text)) {
    checks.push("revisar side effects y compatibilidad de payloads/contratos");
  }
  if (/(ui|tailwind|component|dashboard|layout)/.test(text)) {
    checks.push("confirmar jerarquía visual y que no rompa mobile");
  }
  if (/(aurora|shell|reason|sync|knowledge)/.test(text)) {
    checks.push("probar comando o endpoint real además del typecheck");
  }

  return {
    query,
    checks: Array.from(new Set(checks))
  };
}

export function buildExecutionPlan(query) {
  const ctx = getContext();
  const classification = classifyTask(query);
  const risk = detectRisk(query);
  const validation = suggestValidation(query);
  const quickChecks = suggestQuickChecks(query);
  const dependencies = detectDependencies(query, classification, ctx);

  const steps = [
    "leer board/focus y confirmar ownership del scope",
    classification.likelyFiles.length
      ? `inspeccionar primero ${classification.likelyFiles.slice(0, 3).join(", ")}`
      : "inspeccionar primero los archivos más cercanos al objetivo",
    dependencies.length
      ? `revisar dependencias cercanas: ${dependencies.join(", ")}`
      : "ubicar dependencias directas antes de editar",
    "definir cambio mínimo reversible",
    `validar con ${validation.commands.join(", ")}`,
    "dejar handoff/log corto con riesgo restante"
  ];

  if (risk.severity === "high") {
    steps.splice(4, 0, "hacer una pasada explícita de side effects antes de validar");
  }

  return {
    query,
    summary: `Plan corto para ${classification.likelyScope} sobre ${classification.likelySurface}.`,
    scope: classification.likelyScope,
    surface: classification.likelySurface,
    complexity: classification.complexity,
    dependencies,
    quickChecks: quickChecks.checks,
    steps
  };
}

export function summarizeHandoff(taskId) {
  const ctx = getContext();
  const task = ctx.board.find((item) => item.id.toLowerCase() === taskId.toLowerCase());
  const relatedKnowledge = ctx.knowledge
    .filter((item) => JSON.stringify(item).toLowerCase().includes(taskId.toLowerCase()))
    .slice(0, 3)
    .map((item) => item.statement || item.title || item.id);

  if (!task) {
    return {
      taskId,
      found: false,
      summary: "No encontré la tarea en el board."
    };
  }

  return {
    taskId,
    found: true,
    summary: `Tarea ${task.id} en estado ${task.status} bajo scope ${task.scope}. Objetivo: ${task.goal}.`,
    acceptance: task.acceptance,
    files: task.files,
    relatedKnowledge
  };
}

export function buildTaskClosure(taskId, notes = "") {
  const ctx = getContext();
  const task = ctx.board.find((item) => item.id.toLowerCase() === taskId.toLowerCase());
  const noteText = notes.trim();
  const querySeed = [task?.goal, task?.scope, noteText].filter(Boolean).join(" ");
  const plan = querySeed ? buildExecutionPlan(querySeed) : null;
  const validation = querySeed ? suggestValidation(querySeed) : { commands: ["npm run lint"] };
  const quickChecks = querySeed ? suggestQuickChecks(querySeed) : { checks: [] };

  if (!task) {
    return {
      taskId,
      found: false,
      summary: "No encontré la tarea en el board para generar cierre."
    };
  }

  return {
    taskId,
    found: true,
    closeSummary: `Cerrar ${task.id} bajo scope ${task.scope}. Objetivo: ${task.goal}.`,
    statusSuggestion: /done|cerrad|terminad|listo/.test(noteText.toLowerCase()) ? "done" : "review",
    acceptance: task.acceptance,
    files: task.files,
    handoff: {
      nextOwner: "review-or-next-agent",
      summary: noteText || `Validar ${task.id} contra criterio de aceptación y side effects del scope.`,
      validation: validation.commands,
      quickChecks: quickChecks.checks
    },
    learnings: plan
      ? [
          `scope=${task.scope}`,
          `surface=${plan.surface}`,
          `complexity=${plan.complexity}`
        ]
      : []
  };
}

export function reasonTask(query) {
  const classification = classifyTask(query);
  const risk = detectRisk(query);
  const next = suggestNextStep(query);
  const validation = suggestValidation(query);
  const quickChecks = suggestQuickChecks(query);
  const plan = buildExecutionPlan(query);
  
  const nextBestSystemStep = classification.likelyScope === "aurora_ops"
    ? `npm run aurora:${classification.complexity === "low" ? "context" : "scorecard"}`
    : classification.complexity === "high"
      ? `npm run lint && npx convex deploy && npm run build`
      : classification.likelyScope === "qa_and_release"
        ? `npm run lint && npm run build && npm test`
        : `npm run lint && git status --short`;
  
  return {
    classification: classifyTask(query),
    risk: detectRisk(query),
    next: suggestNextStep(query),
    validation: suggestValidation(query),
    quickChecks: suggestQuickChecks(query),
    plan: buildExecutionPlan(query),
    nextBestSystemStep,
    handoff: {
      to: classification.likelyScope === "aurora_ops" ? "CODEX-LEAD" : "OPENCODE",
      reason: `${classification.likelyScope} scope con complejidad ${classification.complexity}`
    }
  };
}
