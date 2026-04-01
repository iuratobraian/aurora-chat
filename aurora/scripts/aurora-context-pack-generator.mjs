#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const HEURISTICS_PATH = path.join(ROOT, ".agent/brain/db/heuristics.jsonl");
const PATTERNS_PATH = path.join(ROOT, ".agent/brain/db/patterns.jsonl");
const ANTI_PATTERNS_PATH = path.join(ROOT, ".agent/brain/db/anti_patterns.jsonl");
const ERROR_CATALOG_PATH = path.join(ROOT, ".agent/brain/db/error_catalog.jsonl");

const TASK_TYPES = {
  feature: {
    domains: ["frontend", "backend", "architecture"],
    include: ["heuristics", "patterns"],
    exclude: ["anti_patterns"],
  },
  fix: {
    domains: ["general", "testing", "security"],
    include: ["error_catalog", "anti_patterns"],
    exclude: [],
  },
  refactor: {
    domains: ["architecture", "general"],
    include: ["patterns", "anti_patterns"],
    exclude: [],
  },
  review: {
    domains: ["security", "architecture", "general"],
    include: ["anti_patterns", "heuristics"],
    exclude: [],
  },
  security: {
    domains: ["security", "backend"],
    include: ["anti_patterns", "heuristics", "patterns"],
    exclude: [],
  },
};

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    })
    .filter(Boolean);
}

function getCollection(type) {
  switch (type) {
    case "heuristics": return readJsonl(HEURISTICS_PATH);
    case "patterns": return readJsonl(PATTERNS_PATH);
    case "anti_patterns": return readJsonl(ANTI_PATTERNS_PATH);
    case "error_catalog": return readJsonl(ERROR_CATALOG_PATH);
    default: return [];
  }
}

function scoreEntry(entry, domains) {
  let score = 0;
  
  if (domains.includes(entry.domain)) {
    score += 50;
  }
  
  score += (entry.confidence || 0.5) * 30;
  score += (entry.trustScore || 50) * 0.2;
  score += (entry.reuseCount || 0) * 2;
  
  return score;
}

function generateContextPack(taskType, options = {}) {
  const config = TASK_TYPES[taskType] || TASK_TYPES.feature;
  const { maxEntries = 10, domains = config.domains } = options;
  
  const entries = [];
  
  for (const collectionType of config.include) {
    const collection = getCollection(collectionType);
    
    for (const entry of collection) {
      if (!domains.includes(entry.domain) && config.domains.length > 0) {
        continue;
      }
      
      const score = scoreEntry(entry, domains);
      entries.push({
        ...entry,
        collectionType,
        score,
      });
    }
  }

  entries.sort((a, b) => b.score - a.score);
  const selected = entries.slice(0, maxEntries);

  const pack = {
    version: 1,
    generatedAt: new Date().toISOString(),
    taskType,
    domains,
    entryCount: selected.length,
    entries: selected.map(e => ({
      type: e.collectionType,
      title: e.title,
      content: e.content,
      domain: e.domain,
      confidence: e.confidence,
      trustScore: e.trustScore,
      tags: e.tags,
    })),
  };

  return pack;
}

function generateSystemPrompt(taskType) {
  const pack = generateContextPack(taskType);
  
  let prompt = `# Context Pack: ${taskType}\n\n`;
  prompt += `Generado: ${pack.generatedAt}\n`;
  prompt += `Entradas: ${pack.entryCount}\n\n`;
  
  for (const entry of pack.entries) {
    prompt += `## [${entry.type}] ${entry.title}\n`;
    prompt += `${entry.content}\n`;
    prompt += `Domain: ${entry.domain} | Confidence: ${Math.round(entry.confidence * 100)}%\n\n`;
  }
  
  return prompt;
}

function main() {
  console.log("🧠 Aurora Context Pack Generator\n");
  console.log("=".repeat(50));

  const args = process.argv.slice(2);
  const taskType = args[0] || "feature";
  const maxEntries = parseInt(args[1]) || 10;

  console.log(`\n📋 Generating context pack`);
  console.log(`   Task type: ${taskType}`);
  console.log(`   Max entries: ${maxEntries}`);

  const pack = generateContextPack(taskType, { maxEntries });
  
  console.log(`\n📊 Pack Summary`);
  console.log(`   Entries: ${pack.entryCount}`);
  console.log(`   Domains: ${pack.domains.join(", ")}`);

  console.log(`\n📝 Generated Entries:`);
  for (const entry of pack.entries) {
    const icon = entry.type === "heuristics" ? "💡" : 
                 entry.type === "anti_patterns" ? "🚫" : 
                 entry.type === "patterns" ? "🔄" : "⚠️";
    console.log(`   ${icon} [${entry.type}] ${entry.title}`);
  }

  if (args.includes("--save")) {
    const outputPath = path.join(ROOT, `.agent/brain/context_packs/${taskType}_${Date.now()}.json`);
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, JSON.stringify(pack, null, 2));
    console.log(`\n✅ Saved to: ${outputPath}`);
  }

  if (args.includes("--prompt")) {
    console.log(`\n📄 System Prompt Preview:`);
    console.log("-".repeat(30));
    console.log(generateSystemPrompt(taskType));
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`\n✨ Available task types: ${Object.keys(TASK_TYPES).join(", ")}`);
  console.log(`   Usage: node aurora-context-pack-generator.mjs <taskType> [maxEntries] [--save] [--prompt]\n`);
}

main();
