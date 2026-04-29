import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { runSpeedCheck } from "./aurora-speed-check.mjs";
import {
  buildExecutionPlan,
  buildTaskClosure,
  classifyTask,
  detectRisk,
  reasonTask,
  suggestNextStep,
  suggestQuickChecks,
  suggestValidation,
  summarizeHandoff
} from "./aurora-reasoning.mjs";

const ROOT = process.cwd();

function readText(relativePath) {
  const full = path.join(ROOT, relativePath);
  if (!fs.existsSync(full)) return "";
  return fs.readFileSync(full, "utf8");
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
      id,
      status,
      owner,
      scope,
      files,
      goal,
      acceptance
    }));
}

function getContext() {
  const board = parseTaskBoard(readText(".agent/workspace/coordination/TASK_BOARD.md"));
  const focus = readText(".agent/workspace/coordination/CURRENT_FOCUS.md");
  const handoffsPath = ".agent/workspace/coordination/HANDOFFS.md";
  const handoffs = fs.existsSync(path.join(ROOT, handoffsPath)) ? readText(handoffsPath) : "";
  const skills = readText(".agent/skills/README.md");
  const stack = readJson(".agent/aurora/app-stack.json");
  const surfaces = readJson(".agent/aurora/product-surfaces.json").prioritySurfaces;
  const knowledge = readJsonl(".agent/brain/db/teamwork_knowledge.jsonl");
  const errors = readJsonl(".agent/brain/db/error_catalog.jsonl");
  return { board, focus, handoffs, skills, stack, surfaces, knowledge, errors };
}

function scoreKeywords(text, keywords) {
  const lower = (text || "").toLowerCase();
  return keywords.reduce((acc, keyword) => acc + (lower.includes(keyword.toLowerCase()) ? 1 : 0), 0);
}

function findTask(taskId) {
  if (!taskId) return null;
  return getContext().board.find((task) => task.id.toLowerCase() === taskId.toLowerCase()) || null;
}

function getRepoMap() {
  return {
    root: ".",
    keyAreas: [
      "server.ts",
      "views/",
      "components/",
      "services/",
      "convex/",
      "lib/ai/",
      "scripts/",
      ".agent/"
    ],
    purpose: {
      "server.ts": "backend express + webhooks + ai relay",
      "views/": "superficies principales del producto",
      "components/": "ui reusable",
      "services/": "servicios de dominio y adapters",
      "convex/": "datos, queries, mutations y tiempo real",
      "lib/ai/": "capas IA del producto",
      "scripts/": "runtime y automatización de Aurora",
      ".agent/": "project os, memoria, coordinación y planes"
    }
  };
}

function getKnowledgeMatches(input = "") {
  const lower = input.toLowerCase();
  return getContext().knowledge.filter((item) => JSON.stringify(item).toLowerCase().includes(lower)).slice(0, 8);
}

function buildTaskContextPack(input = "") {
  const ctx = getContext();
  const taskId = input.match(/[A-Z]{2,}-\d+/i)?.[0];
  const task = taskId ? findTask(taskId) : null;
  const query = task ? `${task.goal} ${task.scope}` : input;
  const reasoning = query ? reasonTask(query) : null;
  const relatedKnowledge = query ? getKnowledgeMatches(query) : [];
  return {
    task: task || null,
    reasoning,
    focusPreview: ctx.focus.split(/\r?\n/).slice(0, 20),
    handoffPreview: taskId ? ctx.handoffs.split(/\r?\n/).filter((line) => line.includes(taskId)).slice(0, 8) : [],
    relatedKnowledge
  };
}

function buildArchitectureBrief(input = "") {
  const ctx = getContext();
  const classification = input ? classifyTask(input) : null;
  return {
    product: ctx.stack.product,
    frontend: `${ctx.stack.frontend.framework} + ${ctx.stack.frontend.bundler} + ${ctx.stack.frontend.styling}`,
    backend: `${ctx.stack.backend.server} sobre ${ctx.stack.backend.runtime}`,
    data: ctx.stack.data.primary,
    realtime: ctx.stack.backend.realtime,
    testing: ctx.stack.testing.unit,
    ai: ctx.stack.aiLayer.productAi.join(", "),
    likelySurface: classification?.likelySurface || "general",
    likelyFiles: classification?.likelyFiles || []
  };
}

function deriveValidationExpanded(input = "") {
  const base = suggestValidation(input);
  const risk = detectRisk(input);
  const commands = [...base.commands];
  if (risk.severity === "high") {
    commands.push("revisar side effects manualmente");
  }
  if (!commands.includes("npm run build") && /(ui|component|view|dashboard|feed|onboarding)/i.test(input)) {
    commands.push("npm run build");
  }
  return { query: input, commands: Array.from(new Set(commands)), risk: risk.severity };
}

function buildUiChecklist(input = "") {
  return {
    query: input,
    checks: [
      "loading, empty state y error state visibles",
      "mobile y desktop sin quiebres evidentes",
      "jerarquía visual clara",
      "sin overflow ni texto roto",
      "acción principal entendible"
    ]
  };
}

function buildSecurityCheck(input = "") {
  const risk = detectRisk(input);
  return {
    query: input,
    severity: risk.severity,
    checks: [
      "no exponer secretos en cliente o logs",
      "revisar auth/permiso si toca server o rutas sensibles",
      "validar payloads externos antes de confiar",
      "revisar headers, keys internas e inputs inseguros"
    ]
  };
}

function buildReleaseReadiness(input = "") {
  const validation = deriveValidationExpanded(input);
  const risk = detectRisk(input);
  return {
    query: input,
    readyFor: risk.severity === "high" ? "review" : "review_or_done",
    required: validation.commands,
    note: risk.severity === "high" ? "no cerrar sin revisión explícita" : "puede cerrarse si cumple validación y aceptación"
  };
}

function buildErrorCatalogMatch(input = "") {
  const ctx = getContext();
  const lower = input.toLowerCase();
  return {
    query: input,
    matches: ctx.errors
      .filter((item) => JSON.stringify(item).toLowerCase().includes(lower))
      .slice(0, 5)
  };
}

function buildScopeAssignment(input = "") {
  const classification = classifyTask(input);
  const map = {
    community_feed: "AGENT-FEED",
    auth_and_onboarding: "AGENT-ONBOARDING",
    backend_support: "AGENT-BACKEND",
    pricing_and_conversion: "AGENT-REVENUE",
    qa_and_release: "AGENT-QA",
    design_system: "AGENT-DESIGN"
  };
  return {
    query: input,
    suggestedAgent: map[classification.likelyScope] || "CODEX",
    scope: classification.likelyScope
  };
}

function buildParallelSplitSuggest(input = "") {
  const classification = classifyTask(input);
  return {
    query: input,
    split: [
      `worker_a: lectura y cambio principal en ${classification.likelyScope}`,
      "worker_b: validación y smoke checks",
      "worker_c: handoff/review brief y knowledge distill"
    ]
  };
}

function buildSurfacePriorityRank() {
  const ctx = getContext();
  return {
    priorities: ctx.surfaces.map((surface, index) => ({
      rank: index + 1,
      id: surface.id,
      label: surface.label,
      goal: surface.goal
    }))
  };
}

function buildSurfaceBrief(input = "") {
  const ctx = getContext();
  const query = input.trim().toLowerCase();
  const surface = ctx.surfaces.find((item) =>
    [item.id, item.label, item.domain, ...(item.signals || [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query)
  ) || null;

  if (!surface) {
    return {
      query: input,
      found: false,
      available: ctx.surfaces.map((item) => ({
        id: item.id,
        label: item.label
      }))
    };
  }

  return {
    query: input,
    found: true,
    id: surface.id,
    label: surface.label,
    domain: surface.domain,
    goal: surface.goal,
    signals: surface.signals,
    files: surface.files,
    relatedKnowledge: ctx.knowledge
      .filter((item) => item.domain === surface.domain || JSON.stringify(item).toLowerCase().includes(surface.id.toLowerCase()))
      .slice(0, 5)
      .map((item) => ({
        id: item.id,
        title: item.title || item.id,
        statement: item.statement || ""
      }))
  };
}

function buildFullstackTaskBrief(input = "") {
  const ctx = getContext();
  const classification = classifyTask(input);
  const risk = detectRisk(input);
  const plan = buildExecutionPlan(input);
  const validation = deriveValidationExpanded(input);
  const quickChecks = suggestQuickChecks(input);
  const matchedSurface = ctx.surfaces.find((item) =>
    item.label === classification.likelySurface ||
    item.id === classification.likelySurface ||
    item.files.some((file) => classification.likelyFiles.includes(file))
  ) || null;
  const frontendAreas = Array.from(new Set([
    ...(matchedSurface?.files || []).filter((file) => /views\/|components\//i.test(file)),
    ...classification.likelyFiles.filter((file) => /views\/|components\//i.test(file)),
    ...ctx.stack.communityCore.views.filter((file) =>
      input && file.toLowerCase().includes(input.toLowerCase().split(" ")[0] || "")
    )
  ])).slice(0, 6);
  const backendAreas = Array.from(new Set([
    ...(matchedSurface?.files || []).filter((file) => /server\.ts|convex\/|services\//i.test(file)),
    ...classification.likelyFiles.filter((file) => /server\.ts|convex\/|services\//i.test(file)),
    ctx.stack.backend.apiEntry,
    ...ctx.stack.communityCore.convexModules.slice(0, 4)
  ])).slice(0, 6);
  const dataAreas = Array.from(new Set([
    ctx.stack.data.schemas,
    ctx.stack.data.generatedApi,
    ...ctx.stack.communityCore.convexModules.slice(0, 4)
  ])).slice(0, 6);

  return {
    mode: "fullstack_programming",
    query: input,
    scope: classification.likelyScope,
    domain: classification.likelyDomain,
    surface: matchedSurface
      ? {
          id: matchedSurface.id,
          label: matchedSurface.label,
          goal: matchedSurface.goal
        }
      : {
          id: classification.likelyScope,
          label: classification.likelySurface,
          goal: "resolver la tarea con el menor cambio útil posible"
        },
    complexity: classification.complexity,
    risk,
    stack: {
      frontend: `${ctx.stack.frontend.framework} + ${ctx.stack.frontend.bundler} + ${ctx.stack.frontend.styling}`,
      backend: `${ctx.stack.backend.server} sobre ${ctx.stack.backend.runtime}`,
      data: `${ctx.stack.data.primary} con ${ctx.stack.data.clientPattern}`,
      testing: `${ctx.stack.testing.unit} + ${ctx.stack.testing.dom}`,
      payments: ctx.stack.payments.providers.join(", "),
      ai: ctx.stack.aiLayer.productAi.join(", ")
    },
    likelyFiles: Array.from(new Set([
      ...classification.likelyFiles,
      ...(matchedSurface?.files || [])
    ])).slice(0, 8),
    frontendAreas,
    backendAreas,
    dataAreas,
    operatingSteps: plan.steps,
    validation: validation.commands,
    quickChecks: quickChecks.checks,
    starterCommands: [
      "npm run aurora:seed-app-tech",
      `/surface ${(matchedSurface?.id || "aurora_utility")}`,
      `/stack ${input}`.trim(),
      `/code-task ${input}`.trim(),
      "npm run lint"
    ],
    relatedKnowledge: getKnowledgeMatches(input).map((item) => ({
      id: item.id,
      title: item.title || item.id,
      statement: item.statement || "",
      domain: item.domain || "general"
    })),
    repoMap: getRepoMap()
  };
}

function buildFeatureGapDetect(input = "") {
  const classification = classifyTask(input);
  return {
    query: input,
    surface: classification.likelySurface,
    gaps: [
      "contratos de validación más explícitos",
      "más trazabilidad entre tarea, cambio y aprendizaje",
      "más smoke checks por superficie"
    ]
  };
}

function buildNextBestSystemStep() {
  return {
    step: "convertir las funciones prioritarias faltantes en comandos reales de Aurora con salida observable",
    why: "es la forma más rápida de pasar de documentación a inteligencia operativa reutilizable",
    nextCandidates: ["repo-map", "entrypoint-trace", "task-context-pack", "error-catalog-match", "next-best-system-step"]
  };
}

const FUNCTION_DEFINITIONS = [
  ["repo-map", "comprensión", "mapa corto del repo"],
  ["stack-detect", "comprensión", "detectar stack del producto"],
  ["entrypoint-trace", "comprensión", "mostrar entrypoints principales"],
  ["feature-surface-map", "comprensión", "mapear superficies de producto"],
  ["dependency-neighbors", "comprensión", "detectar dependencias cercanas"],
  ["critical-file-guard", "comprensión", "marcar archivos sensibles"],
  ["ownership-check", "comprensión", "confirmar ownership del scope"],
  ["scope-infer", "comprensión", "inferir scope probable"],
  ["source-of-truth-check", "comprensión", "mostrar fuente de verdad"],
  ["architecture-brief", "comprensión", "resumen corto de arquitectura"],
  ["task-context-pack", "contexto", "reunir contexto operativo para una tarea"],
  ["recent-change-scan", "contexto", "escanear cambios recientes relevantes"],
  ["file-summary", "contexto", "resumir propósito de archivo o área"],
  ["cross-file-explain", "contexto", "explicar conexiones entre archivos"],
  ["unused-context-filter", "contexto", "separar contexto útil de ruido"],
  ["naming-normalizer", "contexto", "detectar naming inconsistente"],
  ["todo-hotspots", "contexto", "ubicar hotspots con TODO/FIXME"],
  ["error-hotspots", "contexto", "relacionar errores y archivos"],
  ["signal-vs-noise-rank", "contexto", "priorizar señal útil"],
  ["repo-faq", "contexto", "responder preguntas frecuentes del repo"],
  ["classify-task", "reasoning", "clasificar una tarea"],
  ["complexity-estimate", "reasoning", "estimar complejidad"],
  ["risk-detect", "reasoning", "detectar riesgo"],
  ["suggest-next-step", "reasoning", "proponer siguiente paso"],
  ["build-execution-plan", "reasoning", "crear plan corto"],
  ["quick-checks", "reasoning", "checks rápidos"],
  ["dependency-impact", "reasoning", "mostrar impacto de dependencias"],
  ["acceptance-extract", "reasoning", "extraer criterio de salida"],
  ["rollback-think", "reasoning", "pensar rollback"],
  ["minimal-change-path", "reasoning", "ruta mínima de cambio"],
  ["file-open-order", "programación", "orden de apertura de archivos"],
  ["surface-brief", "programación", "detallar una surface del producto"],
  ["fullstack-task-brief", "programación", "traducir una tarea a kickoff fullstack"],
  ["coding-kickoff", "programación", "arranque de programación con stack, archivos y validación"],
  ["implementation-skeleton", "programación", "esqueleto de implementación"],
  ["contract-check", "programación", "revisar contratos"],
  ["adapter-detect", "programación", "detectar adapters y mappers"],
  ["service-call-trace", "programación", "seguir flujo de llamadas"],
  ["schema-awareness", "programación", "detectar impacto en schema"],
  ["frontend-impact-view", "programación", "mostrar impacto frontend"],
  ["backend-impact-view", "programación", "mostrar impacto backend"],
  ["dependency-install-hint", "programación", "sugerir dependencias"],
  ["code-style-align", "programación", "alinear con estilo del repo"],
  ["validation-minimum", "validación", "validación mínima"],
  ["validation-expanded", "validación", "validación ampliada"],
  ["build-relevance-check", "validación", "si hace falta build"],
  ["test-target-suggest", "validación", "sugerir tests"],
  ["runtime-smoke-check", "validación", "smoke checks runtime"],
  ["api-check", "validación", "validar endpoints"],
  ["ui-checklist", "validación", "checklist ui"],
  ["data-integrity-check", "validación", "revisar integridad de datos"],
  ["security-check", "validación", "check rápido de seguridad"],
  ["release-readiness-check", "validación", "preparación para release"],
  ["error-catalog-match", "errores", "relacionar con catálogo de errores"],
  ["guarded-pattern-alert", "errores", "detectar patrones peligrosos"],
  ["anti-regression-list", "errores", "lista de regresiones típicas"],
  ["unsafe-edit-warning", "errores", "avisar edición riesgosa"],
  ["missing-validation-warning", "errores", "detectar validación faltante"],
  ["scope-drift-alert", "errores", "detectar deriva de scope"],
  ["hidden-coupling-alert", "errores", "detectar coupling oculto"],
  ["fallback-check", "errores", "revisar fallback"],
  ["null-state-check", "errores", "revisar empty/error/loading states"],
  ["production-risk-note", "errores", "nota de riesgo productivo"],
  ["knowledge-ingest", "memoria", "ingesta de conocimiento"],
  ["knowledge-dedupe", "memoria", "dedupe de conocimiento"],
  ["knowledge-retrieval", "memoria", "buscar conocimiento"],
  ["knowledge-confidence", "memoria", "confianza del conocimiento"],
  ["knowledge-reuse-score", "memoria", "reuso de conocimiento"],
  ["episodic-memory", "memoria", "memoria episódica"],
  ["semantic-memory", "memoria", "memoria semántica"],
  ["learning-distill", "memoria", "destilar aprendizaje"],
  ["noise-reject", "memoria", "rechazar ruido"],
  ["daily-digest", "memoria", "digest diario"],
  ["agent-registry", "coordinación", "registro de agentes"],
  ["scope-assignment", "coordinación", "asignación sugerida de scope"],
  ["claim-check", "coordinación", "verificar si se puede reclamar"],
  ["handoff-summary", "coordinación", "resumen de handoff"],
  ["handoff-close", "coordinación", "cierre con handoff"],
  ["blocked-status-report", "coordinación", "reportar bloqueo"],
  ["parallel-split-suggest", "coordinación", "dividir trabajo paralelo"],
  ["merge-risk-note", "coordinación", "notar riesgo de merge"],
  ["review-brief", "coordinación", "brief de revisión"],
  ["team-context-bridge", "coordinación", "traducir contexto al equipo"],
  ["antigravity-sync", "automatización", "sync operativo de Aurora"],
  ["pre-task-plan", "automatización", "plan pre tarea"],
  ["post-task-close", "automatización", "cierre post tarea"],
  ["speed-check", "automatización", "salud del sistema"],
  ["scorecard-report", "automatización", "reporte de scorecard"],
  ["auto-learn-runner", "automatización", "estado de auto aprendizaje"],
  ["seed-product-context", "automatización", "seed de producto"],
  ["seed-tech-context", "automatización", "seed técnico"],
  ["ops-batch-run", "automatización", "batch operativo"],
  ["always-on-guardrails", "automatización", "guardrails always-on"],
  ["surface-priority-rank", "producto", "prioridad de superficies"],
  ["onboarding-clarity-check", "producto", "claridad onboarding"],
  ["community-utility-check", "producto", "utilidad de comunidad"],
  ["creator-loop-check", "producto", "loop creators"],
  ["trust-layer-check", "producto", "trust layer"],
  ["moderation-safety-check", "producto", "seguridad y moderación"],
  ["growth-signal-check", "producto", "señales de growth"],
  ["feature-gap-detect", "producto", "detectar gaps"],
  ["team-enablement-pack", "producto", "pack de enablement técnico"],
  ["next-best-system-step", "producto", "siguiente mejor paso"]
];

export function listAuroraFunctions() {
  return FUNCTION_DEFINITIONS.map(([name, category, description]) => ({
    name,
    category,
    description
  }));
}

export async function runAuroraFunction(name, input = "") {
  const ctx = getContext();
  const taskId = input.match(/[A-Z]{2,}-\d+/i)?.[0] || "";
  const task = taskId ? findTask(taskId) : null;
  const classification = input ? classifyTask(input) : null;
  const plan = input ? buildExecutionPlan(input) : null;
  const risk = input ? detectRisk(input) : null;

  switch (name) {
    case "repo-map":
      return getRepoMap();
    case "stack-detect":
      return ctx.stack;
    case "entrypoint-trace":
      return { app: "index.html -> src/main.* -> React app", server: "server.ts", aurora: "scripts/start-aurora-antigravity.ps1 -> scripts/aurora-api.mjs + scripts/aurora-shell.mjs" };
    case "feature-surface-map":
      return { surfaces: ctx.surfaces };
    case "dependency-neighbors":
    case "dependency-impact":
    case "file-open-order":
      return plan;
    case "critical-file-guard":
      return { guarded: ["App.tsx", "Navigation.tsx", "ComunidadView.tsx", "PricingView.tsx"], note: "requieren claim explícito" };
    case "ownership-check":
    case "claim-check":
      return { task, canClaim: !!task && !["claimed", "in_progress"].includes(task.status), owner: task?.owner || null, status: task?.status || "not_found" };
    case "scope-infer":
    case "classify-task":
      return classification;
    case "source-of-truth-check":
      return { data: ctx.stack.data.primary, apiEntry: ctx.stack.backend.apiEntry, candidateFiles: classification?.likelyFiles || [] };
    case "architecture-brief":
      return buildArchitectureBrief(input);
    case "task-context-pack":
      return buildTaskContextPack(input);
    case "recent-change-scan":
      return { hotspots: ctx.board.filter((item) => item.status !== "done").slice(0, 10) };
    case "file-summary":
    case "cross-file-explain":
      return { query: input, summary: "Usa el scope inferido, las dependencias cercanas y el architecture brief para resumir la lectura relevante.", classification, architecture: buildArchitectureBrief(input) };
    case "surface-brief":
      return buildSurfaceBrief(input);
    case "unused-context-filter":
    case "signal-vs-noise-rank":
      return { highSignal: ["TASK_BOARD.md", "CURRENT_FOCUS.md", "AURORA_100_AGENT_FUNCTIONS.md", "AURORA_MULTI_AGENT_ENABLEMENT_PLAN.md", "app-stack.json", "product-surfaces.json"], lowSignal: ["documentación no ligada a una tarea activa", "logs sin metadata útil"] };
    case "naming-normalizer":
      return { query: input, note: "buscar términos duplicados entre scope, superficie y servicios antes de renombrar" };
    case "todo-hotspots":
      return { note: "usar rg TODO|FIXME sobre services/, views/, convex/ y scripts/", targets: ["services/", "views/", "convex/", "scripts/"] };
    case "error-hotspots":
    case "error-catalog-match":
      return buildErrorCatalogMatch(input);
    case "repo-faq":
      return { faq: ["Dónde arranca Aurora: scripts/start-aurora-antigravity.ps1", "Dónde está el board: .agent/workspace/coordination/TASK_BOARD.md", "Dónde está el stack: .agent/aurora/app-stack.json", "Dónde está el plan de crecimiento multiagente: .agent/workspace/plans/AURORA_MULTI_AGENT_ENABLEMENT_PLAN.md"] };
    case "complexity-estimate":
      return { query: input, complexity: classification?.complexity || "low" };
    case "risk-detect":
      return risk;
    case "suggest-next-step":
      return suggestNextStep(input);
    case "build-execution-plan":
    case "pre-task-plan":
      return plan;
    case "quick-checks":
      return suggestQuickChecks(input);
    case "acceptance-extract":
      return { query: input, acceptance: task?.acceptance || "dejar resultado observable, validado y con riesgo restante claro" };
    case "rollback-think":
      return { query: input, rollback: "mantener cambio pequeño, registrar archivos tocados y revertir solo el scope propio si falla la validación" };
    case "minimal-change-path":
      return { query: input, path: plan?.steps?.slice(0, 4) || [] };
    case "fullstack-task-brief":
      return buildFullstackTaskBrief(input);
    case "coding-kickoff":
      return {
        query: input,
        firstMove: plan?.steps?.[0] || "leer board/focus y confirmar ownership",
        brief: buildFullstackTaskBrief(input)
      };
    case "implementation-skeleton":
      return { query: input, skeleton: ["leer contratos", "cambiar mínima unidad", "validar", "dejar log/handoff"] };
    case "contract-check":
      return { query: input, check: ["types", "payloads", "queries/mutations", "props", "respuestas API"] };
    case "adapter-detect":
      return { query: input, candidates: ["services/posts/postService.ts", "services/feed/feedRanker.ts", "views/comunidad/helpers.ts", "utils/postMapper.ts"] };
    case "service-call-trace":
      return { query: input, trace: ["view/component", "service", "convex/server", "storage/cache/fallback"] };
    case "schema-awareness":
      return { query: input, touchesSchema: /(schema|convex|mutation|query|db|table)/i.test(input), modules: ctx.stack.communityCore.convexModules };
    case "frontend-impact-view":
      return { views: ctx.stack.communityCore.views, likelyFiles: classification?.likelyFiles || [] };
    case "backend-impact-view":
      return { apiEntry: ctx.stack.backend.apiEntry, modules: ctx.stack.communityCore.convexModules };
    case "dependency-install-hint":
      return { query: input, note: "no instalar dependencias nuevas salvo necesidad explícita y compatibilidad clara con el stack actual" };
    case "code-style-align":
      return { style: ["TypeScript ESM", "cambios pequeños y reversibles", "sin any si se puede evitar", "usar apply_patch para ediciones manuales"] };
    case "validation-minimum":
      return suggestValidation(input);
    case "validation-expanded":
      return deriveValidationExpanded(input);
    case "build-relevance-check":
      return { query: input, shouldBuild: /(ui|view|component|tailwind|feed|community|dashboard|onboarding)/i.test(input) };
    case "test-target-suggest":
      return { query: input, targets: /(server|auth|payment|webhook|convex)/i.test(input) ? ["npm run test:run"] : ["npm run lint", "npm run build si toca UI"] };
    case "runtime-smoke-check":
      return { query: input, checks: ["abrir flujo afectado", "probar caso feliz", "probar error/empty state", "ver logs o respuesta real"] };
    case "api-check":
      return { query: input, checks: ["probar endpoint con payload mínimo", "revisar status code", "revisar shape de respuesta", "revisar auth si aplica"] };
    case "ui-checklist":
      return buildUiChecklist(input);
    case "data-integrity-check":
      return { query: input, checks: ["shape de datos", "filtros", "null/undefined", "fallback cache vs source of truth", "contrato de persistencia"] };
    case "security-check":
      return buildSecurityCheck(input);
    case "release-readiness-check":
      return buildReleaseReadiness(input);
    case "guarded-pattern-alert":
      return { alerts: ["no tocar archivos guardados sin claim", "no expandir scope sin actualizar focus", "no mezclar cambios de producto con infra sin razón"] };
    case "anti-regression-list":
      return { regressions: ["romper auth", "romper Convex contracts", "romper empty states", "romper mobile", "romper build/lint"] };
    case "unsafe-edit-warning":
      return { query: input, unsafe: risk?.severity === "high", reason: risk?.recommendation || "scope normal" };
    case "missing-validation-warning":
      return { query: input, warning: suggestValidation(input).commands.length < 2 ? "la validación parece corta para este cambio" : "validación base razonable" };
    case "scope-drift-alert":
      return { query: input, driftRisk: /(y|ademas|tambien|plus|extra)/i.test(input), recommendation: "si aparecen varios objetivos, partir la tarea antes de editar" };
    case "hidden-coupling-alert":
      return { query: input, couplings: ["server.ts <-> auth/payment/webhooks", "views <-> services <-> convex", "scripts Aurora <-> knowledge/focus/board"] };
    case "fallback-check":
      return { query: input, checks: ["sin datos", "sin sesión", "provider caído", "API lenta", "cache stale"] };
    case "null-state-check":
      return { query: input, checks: ["loading", "empty", "error", "success parcial"] };
    case "production-risk-note":
      return { query: input, note: risk?.severity === "high" ? "no asumir listo para producción sin review y validación ampliada" : "riesgo productivo moderado si cumple validación" };
    case "knowledge-ingest":
      return { note: "usar teamwork_knowledge.jsonl con sourceType, taskId, domain, confidence, reuseScore y validated" };
    case "knowledge-dedupe":
      return { note: "comparar title, statement y domain antes de agregar conocimiento nuevo" };
    case "knowledge-retrieval":
      return { query: input, results: getKnowledgeMatches(input) };
    case "knowledge-confidence":
      return { query: input, confidence: getKnowledgeMatches(input).map((item) => ({ id: item.id, confidence: item.confidence ?? 0.7 })) };
    case "knowledge-reuse-score":
      return { query: input, reuse: getKnowledgeMatches(input).map((item) => ({ id: item.id, reuseScore: item.reuseScore ?? 0 })) };
    case "episodic-memory":
      return { latest: ctx.knowledge.slice(-5) };
    case "semantic-memory":
      return { domains: Array.from(new Set(ctx.knowledge.map((item) => item.domain).filter(Boolean))).slice(0, 12) };
    case "learning-distill":
      return { note: "convertir activity/log en statement corto, reusable y validado" };
    case "noise-reject":
      return { reject: ["duplicación", "teoría sin impacto operativo", "logs sin metadata"], keep: ["errores repetidos", "playbooks", "hechos técnicos útiles"] };
    case "daily-digest":
      return { digest: ctx.knowledge.slice(-3).map((item) => item.statement || item.title || item.id) };
    case "agent-registry":
      return readJson(".agent/aurora/agent-registry.json");
    case "scope-assignment":
      return buildScopeAssignment(input);
    case "handoff-summary":
      return summarizeHandoff(taskId || input);
    case "handoff-close":
    case "post-task-close":
      return buildTaskClosure(taskId || input, input);
    case "blocked-status-report":
      return { query: input, report: "si falta ownership, contexto, acceso o validación mínima, el trabajo está bloqueado operativamente" };
    case "parallel-split-suggest":
      return buildParallelSplitSuggest(input);
    case "merge-risk-note":
      return { query: input, note: "si dos tareas tocan el mismo archivo crítico o el mismo scope activo, alto riesgo de colisión" };
    case "review-brief":
      return { query: input, brief: ["objetivo", "archivos tocados", "validación", "riesgo restante", "preguntas abiertas"] };
    case "team-context-bridge":
      return { query: input, bridge: "traducir hallazgo técnico a impacto de producto, riesgo y siguiente paso" };
    case "antigravity-sync":
      return { command: "npm run aurora:antigravity-sync", note: "ejecuta seed, scorecard, activity, auto-runner, train-loop y research-batch" };
    case "speed-check":
      return await runSpeedCheck();
    case "scorecard-report":
      return { command: "npm run aurora:scorecard", note: "mide calidad estructural del aprendizaje" };
    case "auto-learn-runner":
      return { commands: ["npm run ops:auto-learn", "npm run auto:runner"], note: "ingesta y destilación de actividad" };
    case "seed-product-context":
      return { command: "npm run aurora:seed-app-learning", surfaces: ctx.surfaces.map((item) => item.id) };
    case "seed-tech-context":
      return { command: "npm run aurora:seed-app-tech", stack: buildArchitectureBrief(input) };
    case "ops-batch-run":
      return { commands: ["npm run aurora:scorecard", "npm run aurora:speed-check", "npm run ops:activity", "npm run auto:runner"] };
    case "always-on-guardrails":
      return { guardrails: ["stop si hay riesgo alto no revisado", "stop si falla speed-check crítico", "stop si no hay ownership claro", "stop si la validación mínima no corre"] };
    case "surface-priority-rank":
      return buildSurfacePriorityRank();
    case "onboarding-clarity-check":
      return { surface: "onboarding", checks: ["primer valor en minutos", "fricción baja", "feedback claro", "camino a comunidad visible"] };
    case "community-utility-check":
      return { surface: "community", checks: ["posts útiles", "comentarios legibles", "ranking con señal", "empty state sano"] };
    case "creator-loop-check":
      return { surface: "creator", checks: ["activación", "analytics", "retorno", "monetización", "distribución"] };
    case "trust-layer-check":
      return { surface: "trust", checks: ["reputación", "señales de calidad", "visibilidad de autor", "filtros contra ruido"] };
    case "moderation-safety-check":
      return { surface: "moderation", checks: ["spam", "abuso", "falsos positivos", "acciones auditables"] };
    case "growth-signal-check":
      return { surface: "growth", signals: ["engagement", "retención", "saves", "comments", "conversion", "negative feedback"] };
    case "feature-gap-detect":
      return buildFeatureGapDetect(input);
    case "team-enablement-pack":
      return {
        stack: ctx.stack,
        surfaces: ctx.surfaces,
        boardTop: ctx.board.filter((item) => item.status !== "done").slice(0, 8),
        docs: [
          ".agent/workspace/coordination/TASK_BOARD.md",
          ".agent/workspace/coordination/CURRENT_FOCUS.md",
          ".agent/workspace/plans/AURORA_MULTI_AGENT_ENABLEMENT_PLAN.md",
          ".agent/aurora/app-stack.json",
          ".agent/aurora/product-surfaces.json"
        ]
      };
    case "next-best-system-step":
      return buildNextBestSystemStep();
    default:
      throw new Error(`Unknown Aurora function: ${name}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const mode = process.argv[2] || "list";
  const arg1 = process.argv[3] || "";
  const rest = process.argv.slice(4).join(" ");
  if (mode === "list") {
    console.log(JSON.stringify({ total: listAuroraFunctions().length, functions: listAuroraFunctions() }, null, 2));
  } else if (mode === "run") {
    runAuroraFunction(arg1, rest)
      .then((result) => console.log(JSON.stringify({ ok: true, name: arg1, result }, null, 2)))
      .catch((error) => {
        console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
        process.exitCode = 1;
      });
  } else {
    console.error(`Unknown mode: ${mode}`);
    process.exitCode = 1;
  }
}
