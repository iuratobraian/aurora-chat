#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const KNOWLEDGE_PATH = path.join(ROOT, ".agent/brain/db");

const COLLECTIONS = {
  heuristics: path.join(KNOWLEDGE_PATH, "heuristics.jsonl"),
  anti_patterns: path.join(KNOWLEDGE_PATH, "anti_patterns.jsonl"),
  patterns: path.join(KNOWLEDGE_PATH, "patterns.jsonl"),
  ideas: path.join(KNOWLEDGE_PATH, "ideas.jsonl"),
  references: path.join(KNOWLEDGE_PATH, "references.jsonl"),
  error_catalog: path.join(KNOWLEDGE_PATH, "error_catalog.jsonl"),
};

const CONTENT_FIELDS = {
  heuristics: ["content", "statement"],
  anti_patterns: ["content", "statement"],
  patterns: ["content", "statement"],
  ideas: ["content", "title"],
  references: ["content", "title", "url"],
  error_catalog: ["content", "statement", "description"],
};

function generateId() {
  return crypto.randomUUID();
}

function getContent(entry, collection) {
  for (const field of CONTENT_FIELDS[collection] || ["content"]) {
    if (entry[field]) {
      return entry[field];
    }
  }
  return null;
}

function normalizeEntry(entry, collection) {
  const normalized = { ...entry };

  if (!normalized.id) {
    normalized.id = generateId();
  }

  const content = getContent(entry, collection);
  if (content && !normalized.content) {
    normalized.content = content;
  }

  if (!normalized.createdAt) {
    normalized.createdAt = Date.now();
  }

  if (!normalized.freshness) {
    normalized.freshness = normalized.createdAt;
  }

  if (!normalized.domain) {
    const domainMap = {
      heuristics: "general",
      anti_patterns: "architecture",
      patterns: "architecture",
      error_catalog: "general",
      ideas: "general",
      references: "general",
    };
    normalized.domain = domainMap[collection] || "general";
  }

  if (normalized.confidence === undefined) {
    normalized.confidence = 0.8;
  }

  if (normalized.trustScore === undefined) {
    normalized.trustScore = 70;
  }

  if (!normalized.validatedBy) {
    normalized.validatedBy = [];
  }

  if (normalized.reuseCount === undefined) {
    normalized.reuseCount = 0;
  }

  if (!normalized.tags) {
    normalized.tags = [];
  }

  normalized.type = collection.replace("_catalog", "");
  
  return normalized;
}

function validateEntry(entry) {
  const errors = [];
  const warnings = [];

  if (!entry.content || entry.content.length < 5) {
    errors.push("Content too short or missing");
  }

  if (!entry.domain) {
    warnings.push("Missing domain");
  }

  if (entry.confidence !== undefined && (entry.confidence < 0 || entry.confidence > 1)) {
    errors.push("Confidence must be between 0 and 1");
  }

  if (entry.trustScore !== undefined && (entry.trustScore < 0 || entry.trustScore > 100)) {
    errors.push("Trust score must be between 0 and 100");
  }

  return { errors, warnings };
}

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return fs
    .readFileSync(filePath, "utf8")
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

function writeJsonl(filePath, entries) {
  const content = entries.map((e) => JSON.stringify(e)).join("\n") + "\n";
  fs.writeFileSync(filePath, content);
}

function findDuplicates(entries) {
  const hashMap = new Map();
  const duplicates = [];

  for (const entry of entries) {
    const content = entry.content || "";
    if (!content) continue;
    
    const hash = crypto.createHash("md5").update(content.toLowerCase().trim()).digest("hex");
    
    if (hashMap.has(hash)) {
      duplicates.push({
        existing: hashMap.get(hash),
        current: entry,
      });
    } else {
      hashMap.set(hash, entry);
    }
  }

  return duplicates;
}

function main() {
  console.log("🧠 Aurora Knowledge Validator\n");
  console.log("=".repeat(50));

  let totalEntries = 0;
  let totalErrors = 0;
  let totalWarnings = 0;
  let totalDuplicates = 0;
  let totalMigrated = 0;
  const collectionStats = {};

  for (const [name, filePath] of Object.entries(COLLECTIONS)) {
    console.log(`\n📂 ${name}`);
    console.log("-".repeat(30));

    const entries = readJsonl(filePath);
    totalEntries += entries.length;
    console.log(`   Total entries: ${entries.length}`);

    const validatedEntries = [];
    const duplicates = findDuplicates(entries);
    totalDuplicates += duplicates.length;

    if (duplicates.length > 0) {
      console.log(`   ⚠️  Duplicates found: ${duplicates.length}`);
    }

    let collectionErrors = 0;
    let collectionWarnings = 0;
    let collectionMigrated = 0;

    for (const entry of entries) {
      const normalized = normalizeEntry(entry, name);
      const { errors, warnings } = validateEntry(normalized);
      
      const originalKeys = Object.keys(entry).length;
      const newKeys = Object.keys(normalized).length;
      if (newKeys > originalKeys) {
        collectionMigrated++;
        totalMigrated++;
      }
      
      if (errors.length > 0) {
        console.log(`   ❌ ${entry.id}: ${errors.join(", ")}`);
        collectionErrors++;
        totalErrors += errors.length;
      }
      
      collectionWarnings += warnings.length;
      totalWarnings += warnings.length;

      validatedEntries.push(normalized);
    }

    collectionStats[name] = {
      entries: entries.length,
      errors: collectionErrors,
      warnings: collectionWarnings,
      migrated: collectionMigrated,
    };

    if (collectionMigrated > 0) {
      writeJsonl(filePath, validatedEntries);
      console.log(`   ✅ Migrated ${collectionMigrated} entries`);
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 Knowledge Base Summary");
  console.log("=".repeat(50));

  for (const [name, stats] of Object.entries(collectionStats)) {
    const status = stats.errors === 0 ? "✅" : "❌";
    console.log(`   ${status} ${name}: ${stats.entries} entries, ${stats.errors} errors`);
  }

  console.log("\n" + "-".repeat(50));
  console.log(`   Total entries: ${totalEntries}`);
  console.log(`   Total errors: ${totalErrors}`);
  console.log(`   Total warnings: ${totalWarnings}`);
  console.log(`   Total duplicates: ${totalDuplicates}`);
  console.log(`   Total migrated: ${totalMigrated}`);

  const healthScore = Math.max(0, 100 - (totalErrors * 10) - (totalWarnings * 1) - (totalDuplicates * 5));
  console.log(`\n   🟢 Knowledge Health Score: ${healthScore}/100`);

  if (healthScore >= 90) {
    console.log("   ✅ Excellent! Knowledge base is healthy.");
  } else if (healthScore >= 70) {
    console.log("   ⚠️  Good, but room for improvement.");
  } else if (healthScore >= 40) {
    console.log("   🔴 Needs attention. Fix errors to improve score.");
  } else {
    console.log("   🔴 Critical! Knowledge base needs urgent attention.");
  }

  console.log("\n✨ Validation complete!\n");
}

main();
