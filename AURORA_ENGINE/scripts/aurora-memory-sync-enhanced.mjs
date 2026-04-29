#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";
import crypto from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.cwd();

const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const CYAN = "\x1b[36m";

const DB_DIR = path.join(ROOT, ".agent/brain/db");

const COLLECTIONS = [
  { name: "heuristics", path: "heuristics.jsonl", weight: 3 },
  { name: "anti_patterns", path: "anti_patterns.jsonl", weight: 2 },
  { name: "patterns", path: "patterns.jsonl", weight: 2 },
  { name: "error_catalog", path: "error_catalog.jsonl", weight: 2 },
  { name: "teamwork_knowledge", path: "teamwork_knowledge.jsonl", weight: 1 },
  { name: "references", path: "references.jsonl", weight: 1 },
  { name: "ideas", path: "ideas.jsonl", weight: 1 },
  { name: "knowledge", path: "knowledge.jsonl", weight: 2 },
  { name: "validated_knowledge", path: "validated-knowledge.jsonl", weight: 3 }
];

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) return [];
  return text.split(/\r?\n/).filter(Boolean).map(line => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
}

function writeJsonl(filePath, entries) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, entries.map(e => JSON.stringify(e)).join("\n") + "\n", "utf8");
}

function computeHash(content) {
  return crypto.createHash("sha256").update(content).digest("hex").substring(0, 16);
}

function normalizeContent(entry) {
  return JSON.stringify({
    statement: entry.statement || entry.title || entry.content || "",
    domain: entry.domain || entry.category || ""
  }).toLowerCase().trim();
}

function computeSemanticHash(entry) {
  const normalized = normalizeContent(entry);
  return computeHash(normalized);
}

function calculateFreshnessScore(entry) {
  const now = Date.now();
  const createdAt = entry.createdAt || entry.timestamp || now;
  const updatedAt = entry.updatedAt || entry.lastUsed || entry.lastRefreshed || createdAt;
  const age = now - createdAt;
  const lastUpdate = now - updatedAt;
  const accessCount = entry.accessCount || 0;

  const ageDays = age / (24 * 60 * 60 * 1000);
  const updateDays = lastUpdate / (24 * 60 * 60 * 1000);

  let freshness = 100;

  if (ageDays > 90) freshness -= 40;
  else if (ageDays > 30) freshness -= 25;
  else if (ageDays > 7) freshness -= 10;

  if (updateDays > 60) freshness -= 30;
  else if (updateDays > 30) freshness -= 20;
  else if (updateDays > 14) freshness -= 10;
  else if (updateDays <= 1) freshness += 5;

  if (accessCount > 10) freshness += 10;
  else if (accessCount > 5) freshness += 5;
  else if (accessCount === 0) freshness -= 15;

  return Math.max(0, Math.min(100, Math.round(freshness)));
}

function calculateReuseScore(entry) {
  const accessCount = entry.accessCount || 0;
  const reuseCount = entry.reuseCount || 0;
  const reuseScore = entry.reuseScore || 0;

  const base = accessCount * 0.3 + reuseCount * 0.5;
  const trending = accessCount > 0 ? (reuseCount / accessCount) * 20 : 0;

  return Math.round((base + trending + reuseScore * 0.3) * 10) / 10;
}

function isNoise(entry) {
  const statement = (entry.statement || entry.title || entry.content || "").toLowerCase();
  const noisePatterns = [
    /^test\s/i, /^tmp\s/i, /^fixme\s/i, /^hack\s/i,
    /lorem ipsum/i, /^todo\s/i, /sample text/i,
    /placeholder/i, /^dummy\s/i
  ];
  return noisePatterns.some(p => p.test(statement));
}

function isDuplicate(a, b) {
  const hashA = computeSemanticHash(a);
  const hashB = computeSemanticHash(b);
  if (hashA === hashB) return true;

  const contentA = normalizeContent(a);
  const contentB = normalizeContent(b);
  if (contentA === contentB) return true;

  return false;
}

function deduplicateCollection(collection, useSemantic = false) {
  const filePath = path.join(DB_DIR, collection.path);
  const entries = readJsonl(filePath);
  if (entries.length === 0) {
    return { name: collection.name, original: 0, afterDedup: 0, duplicates: 0, semanticDups: 0, noiseRemoved: 0 };
  }

  const seen = new Map();
  const duplicates = [];
  const noiseRemoved = [];

  for (const entry of entries) {
    const hash = computeSemanticHash(entry);

    if (isNoise(entry)) {
      noiseRemoved.push(entry);
      continue;
    }

    if (seen.has(hash)) {
      const existing = seen.get(hash);
      const merged = mergeEntries(existing, entry);
      seen.set(hash, merged);
      duplicates.push(entry);
    } else {
      seen.set(hash, entry);
    }
  }

  const result = {
    name: collection.name,
    original: entries.length,
    afterDedup: seen.size,
    duplicates: duplicates.length,
    semanticDups: duplicates.length,
    noiseRemoved: noiseRemoved.length,
    kept: seen.size
  };

  if (duplicates.length > 0 || noiseRemoved.length > 0) {
    writeJsonl(filePath, Array.from(seen.values()));
  }

  return result;
}

function mergeEntries(a, b) {
  const updated = b.updatedAt && a.createdAt
    ? new Date(b.updatedAt) > new Date(a.createdAt)
    : b.createdAt > a.createdAt;

  const base = updated ? { ...b } : { ...a };
  base.createdAt = Math.min(a.createdAt || Infinity, b.createdAt || Infinity);
  base.updatedAt = Math.max(a.updatedAt || 0, b.updatedAt || 0);
  base.accessCount = (a.accessCount || 0) + (b.accessCount || 0);
  base.reuseCount = (a.reuseCount || 0) + (b.reuseCount || 0);

  if (a.freshnessScore !== undefined || b.freshnessScore !== undefined) {
    base.freshnessScore = Math.max(a.freshnessScore || 0, b.freshnessScore || 0);
  }
  if (a.reuseScore !== undefined || b.reuseScore !== undefined) {
    base.reuseScore = Math.max(a.reuseScore || 0, b.reuseScore || 0);
  }

  if (a.validatedBy && b.validatedBy) {
    base.validatedBy = [...new Set([...a.validatedBy, ...b.validatedBy])];
  } else if (a.validatedBy) {
    base.validatedBy = a.validatedBy;
  } else if (b.validatedBy) {
    base.validatedBy = b.validatedBy;
  }

  return base;
}

function refreshFreshnessScores(collection) {
  const filePath = path.join(DB_DIR, collection.path);
  const entries = readJsonl(filePath);
  let updated = 0;
  let totalFreshness = 0;

  for (const entry of entries) {
    const oldScore = entry.freshnessScore;
    const newScore = calculateFreshnessScore(entry);
    const reuseScore = calculateReuseScore(entry);
    entry.reuseScore = reuseScore;

    if (oldScore !== newScore) {
      entry.freshnessScore = newScore;
      entry.lastRefreshed = Date.now();
      updated++;
    }
    totalFreshness += newScore;
  }

  if (updated > 0) {
    writeJsonl(filePath, entries);
  }

  return {
    collection: collection.name,
    entries: entries.length,
    updated,
    avgFreshness: entries.length > 0 ? Math.round(totalFreshness / entries.length) : 0
  };
}

function autoCleanup(collection, threshold = 30) {
  const filePath = path.join(DB_DIR, collection.path);
  const entries = readJsonl(filePath);
  const toRemove = [];
  const toKeep = [];

  for (const entry of entries) {
    const freshness = entry.freshnessScore ?? calculateFreshnessScore(entry);
    const age = Date.now() - (entry.createdAt || entry.timestamp || Date.now());
    const ageDays = age / (24 * 60 * 60 * 1000);
    const accessCount = entry.accessCount || 0;

    if (freshness < threshold && ageDays > 60 && accessCount === 0) {
      toRemove.push(entry);
    } else {
      toKeep.push(entry);
    }
  }

  if (toRemove.length > 0) {
    writeJsonl(filePath, toKeep);
  }

  return {
    collection: collection.name,
    removed: toRemove.length,
    kept: toKeep.length,
    threshold
  };
}

function getSyncStats() {
  const stats = {};
  let totalEntries = 0;
  let totalFresh = 0;
  let totalDuplicates = 0;
  let totalNoise = 0;

  for (const collection of COLLECTIONS) {
    const filePath = path.join(DB_DIR, collection.path);
    const entries = readJsonl(filePath);
    const fresh = entries.filter(e => (e.freshnessScore || 0) >= 50).length;

    stats[collection.name] = {
      total: entries.length,
      fresh,
      stale: entries.length - fresh,
      avgFreshness: entries.length > 0
        ? Math.round(entries.reduce((sum, e) => sum + (e.freshnessScore || 0), 0) / entries.length)
        : 0,
      weight: collection.weight
    };
    totalEntries += entries.length;
    totalFresh += fresh;
    totalDuplicates += entries.length - fresh;
    totalNoise += entries.filter(isNoise).length;
  }

  const weightedFreshness = COLLECTIONS.reduce((sum, c) => {
    const s = stats[c.name];
    return sum + (s.avgFreshness * c.weight);
  }, 0) / COLLECTIONS.reduce((sum, c) => sum + c.weight, 0);

  return {
    totalEntries,
    totalFresh,
    totalStale: totalEntries - totalFresh,
    overallFreshness: totalEntries > 0 ? Math.round((totalFresh / totalEntries) * 100) : 0,
    weightedFreshness: Math.round(weightedFreshness),
    totalDuplicates,
    totalNoise,
    collections: stats,
    timestamp: new Date().toISOString()
  };
}

function runFullSync() {
  const t0 = Date.now();
  const results = { deduplication: [], freshness: [], cleanup: [], stats: null };

  console.log(`${CYAN}[MemorySync] Running full sync...${RESET}`);

  for (const collection of COLLECTIONS) {
    const dedup = deduplicateCollection(collection);
    results.deduplication.push(dedup);
    console.log(`  ${GREEN}✓${RESET} ${dedup.name}: ${dedup.original}→${dedup.afterDedup} (-${dedup.duplicates} dup, -${dedup.noiseRemoved} noise)`);

    const freshness = refreshFreshnessScores(collection);
    results.freshness.push(freshness);
    console.log(`  ${GREEN}✓${RESET} ${freshness.collection}: avg=${freshness.avgFreshness}/100, ${freshness.updated} refreshed`);

    const cleanup = autoCleanup(collection);
    results.cleanup.push(cleanup);
    if (cleanup.removed > 0) {
      console.log(`  ${YELLOW}⚠${RESET} ${cleanup.collection}: removed ${cleanup.removed} stale entries`);
    }
  }

  results.stats = getSyncStats();
  const elapsed = Date.now() - t0;

  console.log(`\n${GREEN}✓${RESET} Full sync completed in ${elapsed}ms`);
  console.log(`  Total: ${results.stats.totalEntries} entries`);
  console.log(`  Freshness: ${results.stats.overallFreshness}% overall, ${results.stats.weightedFreshness}/100 weighted`);
  console.log(`  Stale: ${results.stats.totalStale} | Noise: ${results.stats.totalNoise}`);

  return results;
}

const args = process.argv.slice(2);
const command = args[0] || "stats";

if (command === "sync") {
  const result = runFullSync();
  console.log(JSON.stringify(result, null, 2));
}
else if (command === "dedupe") {
  const results = [];
  for (const collection of COLLECTIONS) {
    results.push(deduplicateCollection(collection));
  }
  console.log(JSON.stringify(results, null, 2));
}
else if (command === "freshness") {
  const results = [];
  for (const collection of COLLECTIONS) {
    results.push(refreshFreshnessScores(collection));
  }
  console.log(JSON.stringify(results, null, 2));
}
else if (command === "cleanup") {
  const threshold = parseInt(args[1] || "30", 10);
  const results = [];
  for (const collection of COLLECTIONS) {
    results.push(autoCleanup(collection, threshold));
  }
  console.log(JSON.stringify(results, null, 2));
}
else if (command === "stats") {
  const stats = getSyncStats();
  console.log(JSON.stringify(stats, null, 2));
}
else if (command === "collection") {
  const name = args[1];
  const collection = COLLECTIONS.find(c => c.name === name);
  if (!collection) {
    console.log(`${RED}Unknown collection: ${name}${RESET}`);
    console.log("Available:", COLLECTIONS.map(c => c.name).join(", "));
    process.exit(1);
  }
  const dedup = deduplicateCollection(collection);
  const freshness = refreshFreshnessScores(collection);
  const cleanup = autoCleanup(collection);
  console.log(JSON.stringify({ ...dedup, ...freshness, ...cleanup }, null, 2));
}
else if (command === "help") {
  console.log(`
${BOLD}Aurora Memory Sync (Enhanced)${RESET}

Usage: node aurora-memory-sync.mjs <command> [args]

Commands:
  sync              Run full sync: dedupe + freshness + cleanup
  dedupe            Deduplicate all collections (exact + semantic)
  freshness         Refresh freshness scores for all collections
  cleanup [n]       Auto-cleanup entries with freshness < n (default: 30)
  stats             Show global sync statistics
  collection <name> Show stats for a specific collection
  help              Show this help

Examples:
  node aurora-memory-sync.mjs sync
  node aurora-memory-sync.mjs dedupe
  node aurora-memory-sync.mjs freshness
  node aurora-memory-sync.mjs cleanup 40
  node aurora-memory-sync.mjs collection heuristics
  `);
}
else {
  console.log(`${YELLOW}Unknown command: ${command}${RESET}`);
  console.log(`Run 'node aurora-memory-sync.mjs help' for usage`);
}
