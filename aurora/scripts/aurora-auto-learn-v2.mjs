#!/usr/bin/env node
/**
 * Aurora Auto-Learning Engine
 * Extrae patrones de decisiones exitosas y los agrega al brain
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const HEURISTICS = ".agent/brain/db/heuristics.jsonl";
const PATTERNS = ".agent/brain/db/patterns.jsonl";
const ERRORS = ".agent/brain/db/error_catalog.jsonl";
const TASK_LOG = ".agent/workspace/coordination/AGENT_LOG.md";

const PATTERN_RULES = [
  {
    trigger: /npm run lint/,
    condition: "success",
    extract: (output) => {
      const hints = [];
      if (output.includes("0 errors")) hints.push("lint_always_pass");
      return hints;
    },
  },
  {
    trigger: /convex.*schema/,
    action: "schema_change",
    pattern: "When modifying schema, always check for breaking changes and update dependent mutations/queries",
  },
  {
    trigger: /referral|reward/,
    action: "growth_feature",
    pattern: "Viral growth features need backend tracking + frontend UI + milestone rewards",
  },
  {
    trigger: /leaderboard|xp|gamification/,
    action: "gamification",
    pattern: "Gamification needs XP system + levels + rewards + progress visualization",
  },
];

const ERROR_PATTERNS = [
  {
    error: /spawn EPERM/,
    solution: "Reintentar o reiniciar proceso. Posible conflicto de archivo bloqueado.",
    category: "system",
  },
  {
    error: /TypeError.*undefined/,
    solution: "Verificar que todas las variables estén inicializadas antes de usar.",
    category: "typescript",
  },
  {
    error: /Cannot find module/,
    solution: "Verificar imports, paths y que el módulo esté instalado en node_modules.",
    category: "import",
  },
];

function extractFromTaskLog() {
  if (!fs.existsSync(path.join(ROOT, TASK_LOG))) return [];

  const content = fs.readFileSync(path.join(ROOT, TASK_LOG), "utf8");
  const insights = [];

  const patterns = [
    /✅ (.*?)(?:\n|$)/g,
    /TASK-ID: ([A-Z]+-\d+)/g,
    /Archivos: (.*?)(?:\n|$)/g,
  ];

  let match;
  while ((match = patterns[0].exec(content)) !== null) {
    if (match[1].length > 20) {
      insights.push({
        type: "success_pattern",
        text: match[1].trim(),
        timestamp: Date.now(),
      });
    }
  }

  return insights;
}

function extractFromErrors() {
  const errors = readJsonl(ERRORS);
  return errors.slice(-20).map((e) => ({
    type: "error_pattern",
    error: e.error || e.message || "unknown",
    solution: e.solution || e.fix || "",
    category: e.category || "unknown",
  }));
}

function readJsonl(filePath) {
  const full = path.join(ROOT, filePath);
  if (!fs.existsSync(full)) return [];
  return fs
    .readFileSync(full, "utf8")
    .split("\n")
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

function generateHeuristic(entry) {
  return {
    id: `auto_${Date.now()}`,
    type: "extracted",
    text: entry.pattern || entry.text || entry.solution,
    source: "auto_learning",
    confidence: entry.type === "error_pattern" ? 0.8 : 0.6,
    tags: [entry.action || entry.category || "general"],
    timestamp: Date.now(),
  };
}

function run() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  🧠 AURORA AUTO-LEARNING ENGINE");
  console.log(`  📅 ${new Date().toISOString().slice(0, 10)}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const taskInsights = extractFromTaskLog();
  const errorInsights = extractFromErrors();

  console.log(`📊 Insights extraídos:`);
  console.log(`   - De task log: ${taskInsights.length}`);
  console.log(`   - De errores: ${errorInsights.length}`);

  const newHeuristics = [];
  let patternsAdded = 0;

  for (const insight of taskInsights) {
    if (insight.text.length > 30 && insight.text.length < 200) {
      const heuristic = generateHeuristic({
        type: insight.type,
        text: insight.text,
      });
      newHeuristics.push(heuristic);
      patternsAdded++;
    }
  }

  for (const error of errorInsights) {
    if (error.solution) {
      const heuristic = generateHeuristic({
        type: "error_pattern",
        text: `Error: ${error.error.slice(0, 50)} → ${error.solution.slice(0, 100)}`,
        category: error.category,
      });
      newHeuristics.push(heuristic);
      patternsAdded++;
    }
  }

  if (newHeuristics.length > 0) {
    const heuristicLines = newHeuristics
      .map((h) => JSON.stringify(h))
      .join("\n") + "\n";

    fs.appendFileSync(path.join(ROOT, HEURISTICS), heuristicLines);
    console.log(`\n✅ ${patternsAdded} nuevos patrones agregados a heuristics.jsonl`);
  }

  const patternLines = PATTERN_RULES.map((r) =>
    JSON.stringify({
      id: `rule_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      trigger: r.trigger.source,
      action: r.action,
      pattern: r.pattern,
      type: "pattern_rule",
      timestamp: Date.now(),
    })
  ).join("\n") + "\n";

  fs.appendFileSync(path.join(ROOT, PATTERNS), patternLines);
  console.log(`✅ ${PATTERN_RULES.length} reglas de patrones actualizadas`);

  console.log("\n📈 Stats del brain:");
  const totalHeuristics = readJsonl(HEURISTICS).length;
  const totalPatterns = readJsonl(PATTERNS).length;
  const totalErrors = readJsonl(ERRORS).length;
  console.log(`   - Heurísticas: ${totalHeuristics}`);
  console.log(`   - Patrones: ${totalPatterns}`);
  console.log(`   - Errores catalogados: ${totalErrors}`);

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

run();
