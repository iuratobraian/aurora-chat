#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildExecutionPlan,
  classifyTask,
  detectRisk,
  suggestQuickChecks,
  suggestValidation
} from "./aurora-reasoning.mjs";

const ROOT = process.cwd();
const TASK_BOARD_PATH = ".agent/workspace/coordination/TASK_BOARD.md";
const CURRENT_FOCUS_PATH = ".agent/workspace/coordination/CURRENT_FOCUS.md";
const ROUTING_GUIDE_PATH = ".agent/skills/TRADESHARE_AGENT_ROUTING.md";
const APP_STACK_PATH = ".agent/aurora/app-stack.json";

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
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

function parseRoutingGuide(markdown) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => /^\|\s*\*\*\d+\*\*/.test(line))
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 5)
    .map(([codeCell, type, agents, topology, consensus]) => ({
      code: Number(codeCell.replace(/\*/g, "")),
      taskType: type,
      agents: agents.split(",").map((item) => item.trim()).filter(Boolean),
      topology,
      consensus
    }));
}

function readFocusSummary() {
  const text = readText(CURRENT_FOCUS_PATH);
  return {
    owner: text.match(/^##\s+(.+)$/m)?.[1] || null,
    taskId: text.match(/^- TASK-ID:\s+(.+)$/m)?.[1] || null,
    objective: text.match(/^- Voy a hacer:\s+(.+)$/m)?.[1] || null
  };
}

function detectExplicitFiles(query) {
  const matches = query.match(/[\w./-]+\.(?:ts|tsx|js|jsx|mjs|cjs|json|md)/gi) || [];
  return Array.from(new Set(matches));
}

function detectTaskType(query, classification, risk) {
  const text = query.toLowerCase();

  if (classification.likelyScope === "aurora_ops" || /(aurora|mcp|memory|reason|router|scorecard|drift|context pack|token optimizer)/.test(text)) {
    return 15;
  }
  if (/(test|coverage|vitest|spec|assert|snapshot)/.test(text) || classification.likelyScope === "qa_and_release") {
    return 23;
  }
  if (/(security|auth|permission|idor|token|session|password|secret|internal-api-key|csp|cors)/.test(text) || risk.risks.includes("auth")) {
    return 9;
  }
  if (/(convex|schema|migration|db|database|mutation|query|table|index|webhook)/.test(text)) {
    return 11;
  }
  if (/(perf|performance|bundle|lazy|memo|speed|optimi[sz]|n\+1)/.test(text)) {
    return 7;
  }
  if (/(refactor|split|extract|modular|cleanup|reorganize|partir|desacoplar)/.test(text)) {
    return 5;
  }
  if (/(marketing|growth|ads|campaign|instagram|seo|landing)/.test(text)) {
    return 17;
  }
  if (/(docs|documentation|readme|skill|workflow|guide|playbook)/.test(text)) {
    return 19;
  }
  if (/(mobile|pwa|android|ios|capacitor|service worker)/.test(text)) {
    return 21;
  }
  if (/(feature|create|crear|implement|route|screen|view|component|dashboard|panel|modal)/.test(text)) {
    return 3;
  }

  return 1;
}

function baseComplexityForCode(code) {
  return {
    1: 3,
    3: 6,
    5: 7,
    7: 7,
    9: 9,
    11: 8,
    15: 8,
    17: 5,
    19: 3,
    21: 7,
    23: 6
  }[code] || 4;
}

function scoreComplexity({ query, classification, risk, taskTypeCode, candidateFiles }) {
  const text = query.toLowerCase();
  let score = baseComplexityForCode(taskTypeCode);

  if (classification.complexity === "medium") score += 1;
  if (classification.complexity === "high") score += 2;
  if (risk.severity === "medium") score += 1;
  if (risk.severity === "high") score += 2;
  if (candidateFiles.length >= 3) score += 1;
  if (candidateFiles.length >= 6) score += 1;
  if (/(new feature|nueva feature|refactor|migration|security|auth|schema)/.test(text)) score += 1;
  if (/(payment|deploy|production|webhook|delete|destroy|reset)/.test(text)) score += 1;

  return Math.max(1, Math.min(10, score));
}

function estimateTokens(complexity, candidateFiles) {
  const minimum = 900 + complexity * 450 + candidateFiles.length * 200;
  const maximum = Math.round(minimum * (complexity >= 8 ? 2.4 : complexity >= 5 ? 1.9 : 1.5));

  return {
    min: minimum,
    max: maximum,
    rationale: "estimacion heuristica basada en complejidad, riesgo y cantidad de archivos/contexto"
  };
}

function chooseTier(complexity) {
  if (complexity <= 3) {
    return {
      tier: "local",
      modelClass: "Tier 1",
      rationale: "tarea mecanica o de bajo riesgo; conviene resolver con contexto local y heuristicas"
    };
  }
  if (complexity <= 7) {
    return {
      tier: "haiku",
      modelClass: "Tier 2",
      rationale: "tarea intermedia con algo de razonamiento, sin exigir una capa frontier costosa"
    };
  }

  return {
    tier: "sonnet",
    modelClass: "Tier 3",
    rationale: "tarea compleja, de alto riesgo o multi-modulo; requiere mas profundidad de razonamiento"
  };
}

function shouldUseSwarm({ taskTypeCode, candidateFiles, query }) {
  const text = query.toLowerCase();
  return (
    candidateFiles.length >= 3 ||
    [3, 5, 7, 9, 11, 15, 21, 23].includes(taskTypeCode) ||
    /(new feature|nueva feature|refactor|security|auth|schema|performance|optimi[sz])/.test(text)
  );
}

function deriveProfile(query, classification, taskTypeCode) {
  const appStack = readJson(APP_STACK_PATH);
  const text = query.toLowerCase();
  let scope = classification.likelyScope;
  let domain = classification.likelyDomain;
  let surface = classification.likelySurface;
  let preferredFiles = [...(classification.likelyFiles || [])];

  if (/(payment|payments|checkout|stripe|mercadopago|zenobank|webhook)/.test(text)) {
    scope = "backend_support";
    domain = "payments_runtime";
    surface = "Payments and webhooks";
    preferredFiles = [...appStack.payments.serverRoutes];
  } else if (taskTypeCode === 23) {
    scope = "qa_and_release";
    domain = "quality_assurance";
    surface = "Testing and coverage";
  } else if (taskTypeCode === 11) {
    scope = "backend_support";
    domain = "backend_runtime";
    surface = "Convex and backend";
  } else if (taskTypeCode === 9) {
    scope = "backend_support";
    domain = "security";
    surface = "Security and auth";
  } else if (taskTypeCode === 7) {
    scope = "qa_and_release";
    domain = "performance";
    surface = "Performance and bundle";
  } else if (taskTypeCode === 19) {
    domain = "docs";
    surface = "Docs and skills";
  }

  return {
    scope,
    domain,
    surface,
    preferredFiles
  };
}

function buildContextPack(query, profile, classification, risk, plan, validation, quickChecks, boardTasks) {
  const explicitFiles = detectExplicitFiles(query);
  const dependencyCandidates =
    profile.scope !== classification.likelyScope && profile.preferredFiles.length
      ? profile.preferredFiles
      : plan.dependencies || [];
  const candidateFiles = Array.from(
    new Set([
      ...explicitFiles,
      ...(profile.preferredFiles || []),
      ...dependencyCandidates
    ])
  ).slice(0, 8);

  const matchingBoardTasks = boardTasks
    .filter((task) => task.scope === profile.scope || query.toLowerCase().includes(task.id.toLowerCase()))
    .slice(0, 4)
    .map((task) => ({
      id: task.id,
      status: task.status,
      goal: task.goal,
      acceptance: task.acceptance
    }));

  const executionSteps = [
    "leer board/focus y confirmar ownership del scope",
    candidateFiles.length
      ? `inspeccionar primero ${candidateFiles.slice(0, 3).join(", ")}`
      : "inspeccionar primero los archivos mas cercanos al objetivo",
    dependencyCandidates.length
      ? `revisar dependencias cercanas: ${dependencyCandidates.slice(0, 6).join(", ")}`
      : "ubicar dependencias directas antes de editar",
    "definir cambio minimo reversible"
  ];

  if (risk.severity === "high") {
    executionSteps.push("hacer una pasada explicita de side effects antes de validar");
  }

  executionSteps.push(`validar con ${validation.commands.join(", ")}`);
  executionSteps.push("dejar handoff/log corto con riesgo restante");

  return {
    scope: profile.scope,
    domain: profile.domain,
    surface: profile.surface,
    candidateFiles,
    relatedTasks: classification.relatedTasks,
    matchingBoardTasks,
    executionSteps: executionSteps.slice(0, 6),
    validation: validation.commands,
    quickChecks: quickChecks.checks
  };
}

function buildPreTaskBrief(profile, risk, route, tier, contextPack) {
  return {
    summary: `${route.taskType} sobre ${profile.surface} con scope ${profile.scope}.`,
    whyThisRoute: `Codigo ${route.code} porque la tarea encaja mejor como ${route.taskType.toLowerCase()}.`,
    risk: `${risk.severity} (${risk.risks.join(", ") || "sin riesgos fuertes"})`,
    tier: `${tier.tier} / ${tier.modelClass}`,
    firstMoves: [
      "confirmar ownership en TASK_BOARD y CURRENT_FOCUS",
      contextPack.candidateFiles.length
        ? `abrir primero ${contextPack.candidateFiles.slice(0, 3).join(", ")}`
        : "abrir primero los archivos mas cercanos al objetivo",
      "mantener el cambio dentro del scope declarado"
    ]
  };
}

export function routeTask(query) {
  const normalizedQuery = String(query || "").trim();
  if (!normalizedQuery) {
    throw new Error("Debes pasar una descripcion de tarea. Ejemplo: npm run aurora:task-router -- \"refactor marketplace checkout\"");
  }

  const boardTasks = parseTaskBoard(readText(TASK_BOARD_PATH));
  const focus = readFocusSummary();
  const routingTable = parseRoutingGuide(readText(ROUTING_GUIDE_PATH));
  const classification = classifyTask(normalizedQuery);
  const risk = detectRisk(normalizedQuery);
  const plan = buildExecutionPlan(normalizedQuery);
  const validation = suggestValidation(normalizedQuery);
  const quickChecks = suggestQuickChecks(normalizedQuery);
  const taskTypeCode = detectTaskType(normalizedQuery, classification, risk);
  const profile = deriveProfile(normalizedQuery, classification, taskTypeCode);
  const contextPack = buildContextPack(normalizedQuery, profile, classification, risk, plan, validation, quickChecks, boardTasks);
  const route = routingTable.find((item) => item.code === taskTypeCode) || {
    code: 1,
    taskType: "Bug Fix critico",
    agents: ["coordinator", "researcher", "coder", "tester"],
    topology: "hierarchical",
    consensus: "raft"
  };
  const complexity = scoreComplexity({
    query: normalizedQuery,
    classification,
    risk,
    taskTypeCode,
    candidateFiles: contextPack.candidateFiles
  });
  const estimatedTokens = estimateTokens(complexity, contextPack.candidateFiles);
  const tier = chooseTier(complexity);
  const swarmRequired = shouldUseSwarm({
    taskTypeCode,
    candidateFiles: contextPack.candidateFiles,
    query: normalizedQuery
  });

  return {
    query: normalizedQuery,
    generatedAt: new Date().toISOString(),
    focus,
    classification: {
      scope: profile.scope,
      domain: profile.domain,
      surface: profile.surface
    },
    complexity: {
      score: complexity,
      label: complexity >= 8 ? "high" : complexity >= 5 ? "medium" : "low"
    },
    risk,
    recommendedRoute: {
      code: route.code,
      taskType: route.taskType,
      recommendedAgents: route.agents,
      topology: route.topology,
      consensus: route.consensus,
      swarmRequired,
      swarmInitCommand: swarmRequired
        ? "npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized"
        : null
    },
    estimatedTokens,
    tier,
    contextPack,
    validation,
    quickChecks,
    preTaskBrief: buildPreTaskBrief(profile, risk, route, tier, contextPack)
  };
}

export function printTaskRoute(result) {
  console.log("AURORA TASK ROUTER");
  console.log(`query: ${result.query}`);
  console.log(`complexity: ${result.complexity.score}/10 (${result.complexity.label})`);
  console.log(`route: ${result.recommendedRoute.code} - ${result.recommendedRoute.taskType}`);
  console.log(`agents: ${result.recommendedRoute.recommendedAgents.join(", ")}`);
  console.log(`tier: ${result.tier.tier} (${result.tier.modelClass})`);
  console.log(`tokens: ${result.estimatedTokens.min}-${result.estimatedTokens.max}`);
  console.log(`swarmRequired: ${result.recommendedRoute.swarmRequired ? "yes" : "no"}`);
  console.log("");
  console.log("contextPack");
  console.log(`- scope: ${result.contextPack.scope}`);
  console.log(`- surface: ${result.contextPack.surface}`);
  console.log(`- candidateFiles: ${result.contextPack.candidateFiles.join(", ") || "n/a"}`);
  console.log(`- validation: ${result.validation.commands.join(", ")}`);
}

const ENTRY_FILE = fileURLToPath(import.meta.url);

if (process.argv[1] && path.resolve(process.argv[1]) === ENTRY_FILE) {
  const args = process.argv.slice(2);
  const jsonMode = args.includes("--json");
  const query = args.filter((arg) => arg !== "--json").join(" ").trim();
  const result = routeTask(query);

  if (jsonMode || !process.stdout.isTTY) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printTaskRoute(result);
  }
}
