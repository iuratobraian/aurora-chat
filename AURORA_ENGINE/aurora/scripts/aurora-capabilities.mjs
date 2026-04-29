import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));

const readText = (relativePath) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");

function countJsonl(relativePath) {
  const text = readText(relativePath).trim();
  if (!text) return 0;
  return text.split(/\r?\n/).filter(Boolean).length;
}

const catalog = readJson(".agent/aurora/creation-catalog.json");
const dbIndex = readJson(".agent/brain/db/knowledge_index.json");

const summary = {
  aurora: "Aurora Core",
  capabilities: [
    "Terminal API",
    "CLI menu",
    "Task orchestration",
    "Creation catalog",
    "Knowledge DB",
    "Noise filtering",
    "Error prevention",
    "Prompt library",
    "Future product lab",
    "Game factory",
    "Web factory",
    "Marketing and monetization systems"
  ],
  creationCategories: catalog.categories.map((category) => ({
    label: category.label,
    items: category.items.length
  })),
  knowledgeDb: {
    collections: dbIndex.collections.length,
    heuristics: countJsonl(".agent/brain/db/heuristics.jsonl"),
    antiPatterns: countJsonl(".agent/brain/db/anti_patterns.jsonl"),
    patterns: countJsonl(".agent/brain/db/patterns.jsonl"),
    ideas: countJsonl(".agent/brain/db/ideas.jsonl"),
    references: countJsonl(".agent/brain/db/references.jsonl"),
    errors: countJsonl(".agent/brain/db/error_catalog.jsonl")
  }
};

console.log("Aurora Core Capabilities");
console.log("========================");
console.log(`System: ${summary.aurora}`);
console.log("");
console.log("Capabilities:");
for (const capability of summary.capabilities) {
  console.log(`- ${capability}`);
}
console.log("");
console.log("Creation categories:");
for (const category of summary.creationCategories) {
  console.log(`- ${category.label}: ${category.items}`);
}
console.log("");
console.log("Knowledge DB:");
for (const [key, value] of Object.entries(summary.knowledgeDb)) {
  console.log(`- ${key}: ${value}`);
}
