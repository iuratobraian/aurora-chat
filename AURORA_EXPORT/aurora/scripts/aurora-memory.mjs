import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";

const ROOT = process.cwd();
const DB_DIR = path.join(ROOT, ".agent/brain/db");
const COLLECTIONS = [
  { name: "heuristics", path: "heuristics.jsonl", weight: 3 },
  { name: "anti_patterns", path: "anti_patterns.jsonl", weight: 2 },
  { name: "patterns", path: "patterns.jsonl", weight: 2 },
  { name: "error_catalog", path: "error_catalog.jsonl", weight: 2 },
  { name: "teamwork_knowledge", path: "teamwork_knowledge.jsonl", weight: 1 },
  { name: "references", path: "references.jsonl", weight: 1 },
  { name: "ideas", path: "ideas.jsonl", weight: 1 }
];

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) return [];
  return text
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
  fs.writeFileSync(filePath, entries.map(e => JSON.stringify(e)).join("\n") + "\n", "utf8");
}

function hashContent(entry) {
  const content = JSON.stringify({
    statement: entry.statement || entry.title || "",
    domain: entry.domain || ""
  }).toLowerCase();
  return crypto.createHash("sha256").update(content).digest("hex").slice(0, 16);
}

function calculateFreshnessScore(entry) {
  const now = Date.now();
  const createdAt = entry.createdAt || entry.timestamp || now;
  const updatedAt = entry.updatedAt || entry.lastUsed || createdAt;
  const age = now - createdAt;
  const lastUpdate = now - updatedAt;
  
  if (age === 0) return 100;
  
  const freshness = Math.max(0, 100 - (lastUpdate / (24 * 60 * 60 * 1000)) * 10);
  return Math.round(freshness);
}

function deduplicateCollection(collection) {
  const entries = readJsonl(path.join(DB_DIR, collection.path));
  const seen = new Map();
  const duplicates = [];
  
  for (const entry of entries) {
    const hash = hashContent(entry);
    if (seen.has(hash)) {
      const existing = seen.get(hash);
      if ((entry.updatedAt || 0) > (existing.updatedAt || 0)) {
        seen.set(hash, { ...entry, duplicates: [...(existing.duplicates || []), existing.id || existing.title || "unknown"] });
        duplicates.push(existing);
      } else {
        duplicates.push(entry);
      }
    } else {
      seen.set(hash, entry);
    }
  }
  
  return {
    original: entries.length,
    afterDedup: seen.size,
    duplicates: duplicates.length,
    entries: Array.from(seen.values())
  };
}

export function deduplicateAll() {
  const results = {};
  let totalDuplicates = 0;
  let totalSaved = 0;
  
  for (const collection of COLLECTIONS) {
    const result = deduplicateCollection(collection);
    results[collection.name] = result;
    totalDuplicates += result.duplicates;
    totalSaved += result.original - result.afterDedup;
    
    if (result.duplicates > 0) {
      writeJsonl(path.join(DB_DIR, collection.path), result.entries);
    }
  }
  
  return {
    collections: results,
    totalDuplicates,
    totalSaved,
    timestamp: new Date().toISOString()
  };
}

export function refreshFreshnessScores() {
  const results = {};
  
  for (const collection of COLLECTIONS) {
    const entries = readJsonl(path.join(DB_DIR, collection.path));
    let updated = 0;
    
    for (const entry of entries) {
      const oldScore = entry.freshnessScore;
      const newScore = calculateFreshnessScore(entry);
      if (oldScore !== newScore) {
        entry.freshnessScore = newScore;
        entry.lastRefreshed = Date.now();
        updated++;
      }
    }
    
    if (updated > 0) {
      writeJsonl(path.join(DB_DIR, collection.path), entries);
    }
    
    results[collection.name] = { entries: entries.length, updated };
  }
  
  return {
    collections: results,
    timestamp: new Date().toISOString()
  };
}

export function getMemoryStats() {
  const stats = {};
  let totalEntries = 0;
  let totalFresh = 0;
  
  for (const collection of COLLECTIONS) {
    const entries = readJsonl(path.join(DB_DIR, collection.path));
    const fresh = entries.filter(e => (e.freshnessScore || 0) >= 50).length;
    stats[collection.name] = {
      total: entries.length,
      fresh,
      stale: entries.length - fresh,
      avgFreshness: entries.length > 0 ? Math.round(entries.reduce((sum, e) => sum + (e.freshnessScore || 0), 0) / entries.length) : 0
    };
    totalEntries += entries.length;
    totalFresh += fresh;
  }
  
  return {
    totalEntries,
    totalFresh,
    overallFreshness: totalEntries > 0 ? Math.round((totalFresh / totalEntries) * 100) : 0,
    collections: stats,
    timestamp: new Date().toISOString()
  };
}

export function getReusableKnowledge(minReuseScore = 0.7) {
  const results = [];
  
  for (const collection of COLLECTIONS) {
    const entries = readJsonl(path.join(DB_DIR, collection.path));
    for (const entry of entries) {
      const reuseScore = entry.reuseScore || 0;
      if (reuseScore >= minReuseScore) {
        results.push({
          ...entry,
          collection: collection.name,
          weight: collection.weight
        });
      }
    }
  }
  
  return results.sort((a, b) => (b.reuseScore || 0) - (a.reuseScore || 0));
}

const SESSIONS_DIR = path.join(ROOT, ".agent/brain/memory/sessions");
const SHARED_DIR = path.join(ROOT, ".agent/brain/memory/shared");
const CONTEXT_DIR = path.join(ROOT, ".agent/brain/memory/context");

function getSessionMemoryStats() {
  const stats = { sessions: 0, entries: 0, fresh: 0, agents: [] };
  if (!fs.existsSync(SESSIONS_DIR)) return stats;

  const files = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith(".jsonl"));
  for (const file of files) {
    const entries = readJsonl(path.join(SESSIONS_DIR, file));
    const agentId = file.replace(".jsonl", "");
    const fresh = entries.filter(e => {
      const age = Date.now() - new Date(e.timestamp).getTime();
      return age < 72 * 60 * 60 * 1000;
    }).length;
    stats.sessions++;
    stats.entries += entries.length;
    stats.fresh += fresh;
    stats.agents.push({ agentId, entries: entries.length, fresh });
  }
  return stats;
}

function getSharedMemoryStats() {
  const sharedFile = path.join(SHARED_DIR, "shared_memory.jsonl");
  if (!fs.existsSync(sharedFile)) return { entries: 0, fresh: 0 };
  const entries = readJsonl(sharedFile);
  const fresh = entries.filter(e => {
    const age = Date.now() - new Date(e.lastUpdated).getTime();
    return age < 72 * 60 * 60 * 1000;
  }).length;
  return { entries: entries.length, fresh };
}

export function getUnifiedStats() {
  const knowledgeStats = getMemoryStats();
  const sessionStats = getSessionMemoryStats();
  const sharedStats = getSharedMemoryStats();

  const codebaseIndex = path.join(DB_DIR, "codebase-index.jsonl");
  const codebaseRecords = fs.existsSync(codebaseIndex) ? readJsonl(codebaseIndex) : [];
  const codebaseFresh = codebaseRecords.filter(r => (r.freshnessScore || 0) >= 50).length;

  const totalItems = knowledgeStats.totalEntries + sessionStats.entries + sharedStats.entries + codebaseRecords.length;
  const totalFresh = knowledgeStats.totalFresh + sessionStats.fresh + sharedStats.fresh + codebaseFresh;

  return {
    overall: {
      totalItems,
      totalFresh,
      overallFreshness: totalItems > 0 ? Math.round((totalFresh / totalItems) * 100) : 0,
      targetMet: totalItems > 0 ? (totalFresh / totalItems) >= 0.8 : true
    },
    knowledge: knowledgeStats,
    sessions: sessionStats,
    shared: sharedStats,
    codebase: {
      totalRecords: codebaseRecords.length,
      fresh: codebaseFresh,
      stale: codebaseRecords.length - codebaseFresh
    },
    timestamp: new Date().toISOString()
  };
}

export function autoCleanup(targetFreshness = 80) {
  const results = { removed: 0, archived: 0, deduped: 0 };

  // 1. Deduplicate knowledge collections
  const dedupResult = deduplicateAll();
  results.deduped = dedupResult.totalDuplicates;

  // 2. Refresh freshness scores
  refreshFreshnessScores();

  // 3. Remove stale knowledge entries (freshness < 10 and age > 30 days)
  for (const collection of COLLECTIONS) {
    const filePath = path.join(DB_DIR, collection.path);
    const entries = readJsonl(filePath);
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const kept = entries.filter(e => {
      const freshness = calculateFreshnessScore(e);
      const createdAt = e.createdAt || e.timestamp || Date.now();
      if (freshness < 10 && createdAt < thirtyDaysAgo) {
        results.removed++;
        return false;
      }
      return true;
    });
    if (kept.length < entries.length) {
      writeJsonl(filePath, kept);
    }
  }

  // 4. Archive old sessions (>72h)
  if (fs.existsSync(SESSIONS_DIR)) {
    const sessionFiles = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith(".jsonl"));
    const archiveDir = path.join(ROOT, ".agent/brain/memory/archive");
    if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });

    for (const file of sessionFiles) {
      const entries = readJsonl(path.join(SESSIONS_DIR, file));
      const cutoff = Date.now() - 72 * 60 * 60 * 1000;
      const toArchive = entries.filter(e => new Date(e.timestamp).getTime() < cutoff);
      const toKeep = entries.filter(e => new Date(e.timestamp).getTime() >= cutoff);

      if (toArchive.length > 0) {
        const archiveFile = path.join(archiveDir, `${file.replace(".jsonl", "")}_${Date.now()}.jsonl`);
        writeJsonl(archiveFile, toArchive);
        writeJsonl(path.join(SESSIONS_DIR, file), toKeep);
        results.archived += toArchive.length;
      }
    }
  }

  // 5. Clean stale shared memory entries
  const sharedFile = path.join(SHARED_DIR, "shared_memory.jsonl");
  if (fs.existsSync(sharedFile)) {
    const entries = readJsonl(sharedFile);
    const cutoff = Date.now() - 168 * 60 * 60 * 1000; // 7 days
    const kept = entries.filter(e => new Date(e.lastUpdated).getTime() >= cutoff);
    const removed = entries.length - kept.length;
    if (removed > 0) {
      writeJsonl(sharedFile, kept);
      results.removed += removed;
    }
  }

  // 6. Refresh codebase index freshness
  const codebaseIndex = path.join(DB_DIR, "codebase-index.jsonl");
  if (fs.existsSync(codebaseIndex)) {
    const records = readJsonl(codebaseIndex);
    let changed = false;
    for (const r of records) {
      const age = Date.now() - (r.updatedAt || r.createdAt);
      const newFreshness = Math.max(0, 100 - (age / (24 * 60 * 60 * 1000)) * 5);
      if (r.freshnessScore !== Math.round(newFreshness)) {
        r.freshnessScore = Math.round(newFreshness);
        changed = true;
      }
    }
    if (changed) writeJsonl(codebaseIndex, records);
  }

  // Verify target
  const finalStats = getUnifiedStats();
  results.finalFreshness = finalStats.overall.overallFreshness;
  results.targetMet = finalStats.overall.targetMet;

  return results;
}

// ============================================================================
// AMM IMPROVEMENT: Memory Compression System
// Reduces storage by ~70% for archived entries while maintaining searchability
// ============================================================================

const COMPRESSION_LEVEL = zlib.constants.Z_BEST_COMPRESSION;
const ARCHIVE_DIR = path.join(ROOT, ".agent/brain/memory/archive");
const COMPRESSED_DIR = path.join(ROOT, ".agent/brain/memory/compressed");

function ensureCompressedDir() {
  if (!fs.existsSync(COMPRESSED_DIR)) {
    fs.mkdirSync(COMPRESSED_DIR, { recursive: true });
  }
}

export function compressArchive(fileName, keepOriginal = false) {
  ensureCompressedDir();
  const archivePath = path.join(ARCHIVE_DIR, fileName);
  if (!fs.existsSync(archivePath)) return { success: false, error: "File not found" };

  const entries = readJsonl(archivePath);
  if (entries.length === 0) return { success: false, error: "Empty file" };

  const jsonStr = JSON.stringify(entries);
  const compressed = zlib.deflateSync(jsonStr, { level: COMPRESSION_LEVEL });
  const compressedPath = path.join(COMPRESSED_DIR, `${fileName}.gz`);

  fs.writeFileSync(compressedPath, compressed);

  if (!keepOriginal) {
    fs.unlinkSync(archivePath);
  }

  const compressionRatio = ((jsonStr.length - compressed.length) / jsonStr.length * 100).toFixed(1);

  return {
    success: true,
    originalSize: jsonStr.length,
    compressedSize: compressed.length,
    compressionRatio: `${compressionRatio}%`,
    entries: entries.length,
    compressedPath,
    timestamp: new Date().toISOString()
  };
}

export function decompressArchive(compressedFileName) {
  const compressedPath = path.join(COMPRESSED_DIR, compressedFileName);
  if (!fs.existsSync(compressedPath)) return { success: false, error: "Compressed file not found" };

  const compressed = fs.readFileSync(compressedPath);
  const decompressed = zlib.inflateSync(compressed);
  const entries = JSON.parse(decompressed.toString());

  return {
    success: true,
    entries,
    count: entries.length,
    timestamp: new Date().toISOString()
  };
}

export function searchCompressedArchives(query, options = {}) {
  const { maxResults = 10, decompress = false } = options;
  const results = [];

  if (!fs.existsSync(COMPRESSED_DIR)) return { results: [], total: 0 };

  const files = fs.readdirSync(COMPRESSED_DIR).filter(f => f.endsWith(".gz"));
  const queryLower = query.toLowerCase();

  for (const file of files) {
    const decompressed = decompressArchive(file);
    if (!decompressed.success) continue;

    const matches = decompressed.entries.filter(entry => {
      const content = JSON.stringify(entry).toLowerCase();
      return content.includes(queryLower);
    });

    if (matches.length > 0) {
      results.push({
        archive: file,
        matches: decompress ? matches : matches.map(m => ({ id: m.id, title: m.title || "N/A", timestamp: m.timestamp })),
        matchCount: matches.length
      });
    }

    if (results.length >= maxResults) break;
  }

  return {
    results,
    total: results.reduce((sum, r) => sum + r.matchCount, 0),
    archivesSearched: files.length
  };
}

export function getCompressionStats() {
  ensureCompressedDir();

  const archiveFiles = fs.existsSync(ARCHIVE_DIR)
    ? fs.readdirSync(ARCHIVE_DIR).filter(f => f.endsWith(".jsonl"))
    : [];

  const compressedFiles = fs.readdirSync(COMPRESSED_DIR).filter(f => f.endsWith(".gz"));

  let totalOriginalSize = 0;
  let totalCompressedSize = 0;

  for (const file of compressedFiles) {
    const compressedPath = path.join(COMPRESSED_DIR, file);
    const stats = fs.statSync(compressedPath);
    totalCompressedSize += stats.size;

    // Estimate original size (stored in filename or calculate from decompression)
    const decompressed = decompressArchive(file);
    if (decompressed.success) {
      totalOriginalSize += JSON.stringify(decompressed.entries).length;
    }
  }

  const savings = totalOriginalSize > 0
    ? ((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(1)
    : 0;

  return {
    uncompressedArchives: archiveFiles.length,
    compressedArchives: compressedFiles.length,
    totalOriginalSize: `${(totalOriginalSize / 1024).toFixed(2)} KB`,
    totalCompressedSize: `${(totalCompressedSize / 1024).toFixed(2)} KB`,
    spaceSavings: `${savings}%`,
    compressionRatio: totalOriginalSize > 0 ? (totalOriginalSize / totalCompressedSize).toFixed(2) : "N/A",
    timestamp: new Date().toISOString()
  };
}

export function batchCompressAllArchives(keepOriginal = false) {
  ensureCompressedDir();
  if (!fs.existsSync(ARCHIVE_DIR)) return { compressed: 0, results: [] };

  const files = fs.readdirSync(ARCHIVE_DIR).filter(f => f.endsWith(".jsonl"));
  const results = [];

  for (const file of files) {
    const result = compressArchive(file, keepOriginal);
    results.push({ file, ...result });
  }

  const successful = results.filter(r => r.success);
  const totalSavings = successful.reduce((sum, r) =>
    sum + (r.originalSize - r.compressedSize), 0);

  return {
    compressed: successful.length,
    failed: results.length - successful.length,
    totalSavings: `${(totalSavings / 1024).toFixed(2)} KB`,
    results,
    timestamp: new Date().toISOString()
  };
}

if (process.argv[1] && process.argv[1].endsWith("aurora-memory.mjs")) {
  const action = process.argv[2] || "stats";

  if (action === "dedupe") {
    console.log("Running dedupe...");
    console.log(JSON.stringify(deduplicateAll(), null, 2));
  } else if (action === "refresh") {
    console.log("Refreshing freshness scores...");
    console.log(JSON.stringify(refreshFreshnessScores(), null, 2));
  } else if (action === "stats") {
    console.log("Memory stats:");
    console.log(JSON.stringify(getMemoryStats(), null, 2));
  } else if (action === "unified") {
    console.log("Unified memory stats:");
    console.log(JSON.stringify(getUnifiedStats(), null, 2));
  } else if (action === "maintain" || action === "cleanup") {
    console.log("Running unified maintenance...");
    console.log(JSON.stringify(autoCleanup(), null, 2));
  } else if (action === "reusable") {
    console.log("Reusable knowledge:");
    console.log(JSON.stringify(getReusableKnowledge(), null, 2));
  } else if (action === "compress") {
    const fileName = process.argv[3];
    if (!fileName) {
      console.log("Compressing all archives...");
      console.log(JSON.stringify(batchCompressAllArchives(true), null, 2));
    } else {
      console.log(`Compressing ${fileName}...`);
      console.log(JSON.stringify(compressArchive(fileName), null, 2));
    }
  } else if (action === "decompress") {
    const fileName = process.argv[3];
    if (!fileName) {
      console.log("Usage: aurora-memory.mjs decompress <filename.gz>");
    } else {
      console.log(JSON.stringify(decompressArchive(fileName), null, 2));
    }
  } else if (action === "search") {
    const query = process.argv.slice(3).join(" ");
    if (!query) {
      console.log("Usage: aurora-memory.mjs search <query>");
    } else {
      console.log(`Searching for "${query}"...`);
      console.log(JSON.stringify(searchCompressedArchives(query), null, 2));
    }
  } else if (action === "compression-stats") {
    console.log("Compression stats:");
    console.log(JSON.stringify(getCompressionStats(), null, 2));
  } else {
    console.log("Usage: aurora-memory.mjs [dedupe|refresh|stats|unified|maintain|reusable|compress|decompress|search|compression-stats]");
    console.log("");
    console.log("AMM v3.5 - Compression System Commands:");
    console.log("  compress [file]     - Compress archive(s) to save ~70% space");
    console.log("  decompress <file>   - Decompress a .gz archive");
    console.log("  search <query>      - Search across compressed archives");
    console.log("  compression-stats   - Show compression savings");
  }
}
