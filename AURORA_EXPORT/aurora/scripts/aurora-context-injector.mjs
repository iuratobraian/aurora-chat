#!/usr/bin/env node
/**
 * Aurora Context Injector
 * Genera context packs inteligentes basados en la tarea actual
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const CONTEXT_TEMPLATES = {
  bug_fix: {
    files: ["convex/schema.ts", "package.json", "AGENTS.md"],
    hints: [
      "Revisar errores recientes en lint",
      "Buscar patrones similares en error_catalog.jsonl",
      "Consultar heuristics.jsonl para fixes comunes"
    ],
  },
  feature: {
    files: ["views/*.tsx", "components/*.tsx", "convex/schema.ts"],
    hints: [
      "Revisar convenciones en AGENTS.md",
      "Buscar patrones similares en patterns.jsonl",
      "Consultar team knowledge para decisiones previas"
    ],
  },
  backend: {
    files: ["convex/*.ts", "convex/schema.ts", "server.ts"],
    hints: [
      "Revisar schema de Convex",
      "Consultar api.ts para endpoints",
      "Buscar mutations relacionadas"
    ],
  },
  refactor: {
    files: ["AGENTS.md"],
    hints: [
      "Mantener backward compatibility",
      "Documentar breaking changes",
      "Agregar tests si no existen"
    ],
  },
};

const PRIORITY_FILES = [
  "AGENTS.md",
  "convex/schema.ts",
  "package.json",
  ".env.example",
];

function findRelevantFiles(task) {
  const lower = task.toLowerCase();
  const files = [];

  if (/bug|fix|error|wrong|incorrect/.test(lower)) {
    files.push(...CONTEXT_TEMPLATES.bug_fix.files);
  } else if (/feature|new|add|create/.test(lower)) {
    files.push(...CONTEXT_TEMPLATES.feature.files);
  } else if (/backend|convex|api|db|schema/.test(lower)) {
    files.push(...CONTEXT_TEMPLATES.backend.files);
  } else if (/refactor|clean|optimize/.test(lower)) {
    files.push(...CONTEXT_TEMPLATES.refactor.files);
  }

  if (/(referral|premio|reward|viral)/.test(lower)) {
    files.push("convex/referrals.ts", "views/LeaderboardView.tsx");
  }
  if (/(signal|trading|forex)/.test(lower)) {
    files.push("convex/signals.ts", "views/SignalsView.tsx");
  }
  if (/(community|feed|post)/.test(lower)) {
    files.push("views/ComunidadView.tsx", "services/feed/feedRanker.ts");
  }
  if (/(aurora|brain|agent)/.test(lower)) {
    files.push(".agent/aurora/runtime-config.json", ".agent/brain/README.md");
  }

  files.push(...PRIORITY_FILES);
  return [...new Set(files)];
}

function readFileContent(filePath) {
  const fullPath = path.join(ROOT, filePath);
  if (!fs.existsSync(fullPath)) return null;

  try {
    const stats = fs.statSync(fullPath);
    if (stats.size > 50000) {
      return `// ${filePath} (${(stats.size / 1024).toFixed(1)}KB - demasiado grande para inline)`;
    }
    return fs.readFileSync(fullPath, "utf8");
  } catch {
    return null;
  }
}

function generateContextPack(task) {
  const files = findRelevantFiles(task);
  const pack = {
    task,
    generated: new Date().toISOString(),
    files: [],
    hints: [],
    priorityFiles: [],
  };

  for (const file of files) {
    const content = readFileContent(file);
    if (content) {
      pack.files.push({ path: file, content });
    }
  }

  const lower = task.toLowerCase();
  for (const [key, template] of Object.entries(CONTEXT_TEMPLATES)) {
    if (lower.includes(key.replace("_", " "))) {
      pack.hints.push(...template.hints);
    }
  }

  pack.priorityFiles = files.filter((f) => PRIORITY_FILES.includes(f));

  return pack;
}

function run() {
  const args = process.argv.slice(2);
  const task = args.join(" ") || "general task";

  console.log(`\n🧠 Generando Context Pack para: "${task}"\n`);

  const pack = generateContextPack(task);

  console.log(`📁 Archivos relevantes (${pack.files.length}):`);
  pack.files.forEach((f) => console.log(`   - ${f.path}`));

  if (pack.hints.length > 0) {
    console.log(`\n💡 Hints:`);
    pack.hints.forEach((h) => console.log(`   - ${h}`));
  }

  const outputPath = ".agent/brain/current_context_pack.json";
  fs.writeFileSync(path.join(ROOT, outputPath), JSON.stringify(pack, null, 2));
  console.log(`\n✅ Guardado en: ${outputPath}`);

  return pack;
}

run();
