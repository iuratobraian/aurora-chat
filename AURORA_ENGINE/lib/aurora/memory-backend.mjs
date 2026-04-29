#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.cwd();

const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const CYAN = "\x1b[36m";

const KB = 1024;
const MAX_MEMORY_ITEMS = 10000;
const HNSW_M = 16;
const HNSW_EF = 64;

function readJsonl(relativePath) {
  const full = path.join(ROOT, relativePath);
  if (!fs.existsSync(full)) return [];
  const text = fs.readFileSync(full, "utf8").trim();
  if (!text) return [];
  return text.split(/\r?\n/).filter(Boolean).map((line) => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
}

function writeJsonl(relativePath, records) {
  const full = path.join(ROOT, relativePath);
  const dir = path.dirname(full);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(full, records.map(r => JSON.stringify(r)).join("\n") + "\n");
}

function computeHash(text) {
  return crypto.createHash('sha256').update(text).digest('hex').substring(0, 16);
}

function simpleEmbedding(text) {
  const words = text.toLowerCase().split(/\s+/);
  const vector = new Array(128).fill(0);
  words.forEach((word, i) => {
    const hash = crypto.createHash('md5').update(word).digest();
    for (let j = 0; j < 128; j++) {
      vector[j] += (hash[j % hash.length] / 255) * Math.exp(-i * 0.1);
    }
  });
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return magnitude > 0 ? vector.map(v => v / magnitude) : vector;
}

function cosineSimilarity(a, b) {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10);
}

class HNSWIndex {
  constructor(m = HNSW_M, efConstruction = HNSW_EF, maxLayers = 6, vectorSize = 128) {
    this.M = m;
    this.efConstruction = efConstruction;
    this.maxLayers = maxLayers;
    this.vectorSize = vectorSize;
    this.vectors = new Map();
    this.entryPoints = new Array(maxLayers).fill(null);
    this.maxLayer = -1;
    this.levels = new Map();
    this.graphs = [];
    for (let i = 0; i < maxLayers; i++) {
      this.graphs.push(new Map());
    }
  }

  _randomLevel() {
    let level = 0;
    while (Math.random() < 0.5 && level < this.maxLayers - 1) {
      level++;
    }
    return level;
  }

  _distance(a, b) {
    return 1 - cosineSimilarity(a, b);
  }

  _searchLayer(queryVector, ep, ef, level) {
    const graph = this.graphs[level];
    if (!graph || graph.size === 0) return [];

    const visited = new Set([ep]);
    const candidates = [{ id: ep, dist: this._distance(queryVector, this.vectors.get(ep)), level }];
    const result = [{ id: ep, dist: this._distance(queryVector, this.vectors.get(ep)) }];

    while (candidates.length > 0) {
      candidates.sort((a, b) => a.dist - b.dist);
      const current = candidates.shift();

      if (result[result.length - 1].dist > current.dist) {
        result.pop();
        result.push(current);
        result.sort((a, b) => a.dist - b.dist);
      }

      const neighbors = graph.get(current.id) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          const dist = this._distance(queryVector, this.vectors.get(neighbor));
          if (result.length < ef || dist < result[result.length - 1].dist) {
            candidates.push({ id: neighbor, dist, level });
          }
        }
      }
    }

    return result;
  }

  _searchLayerBatch(queryVector, eps, ef, level) {
    const graph = this.graphs[level];
    if (!graph || graph.size === 0) return [];

    const visited = new Set(eps.map(e => e.id));
    const candidates = [...eps];
    const result = [...eps].sort((a, b) => a.dist - b.dist);

    while (candidates.length > 0) {
      candidates.sort((a, b) => a.dist - b.dist);
      const current = candidates.shift();

      if (result[result.length - 1].dist > current.dist) {
        result.pop();
        result.push(current);
        result.sort((a, b) => a.dist - b.dist);
      }

      const neighbors = graph.get(current.id) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          const dist = this._distance(queryVector, this.vectors.get(neighbor));
          if (result.length < ef || dist < result[result.length - 1].dist) {
            candidates.push({ id: neighbor, dist });
          }
        }
      }
    }

    return result.slice(0, ef);
  }

  insert(id, vector) {
    if (this.vectors.has(id)) return;
    this.vectors.set(id, vector);

    const level = this._randomLevel();
    this.levels.set(id, level);

    for (let l = 0; l <= level; l++) {
      if (!this.graphs[l].has(id)) {
        this.graphs[l].set(id, []);
      }
    }

    if (this.maxLayer < 0) {
      this.maxLayer = level;
      for (let l = 0; l <= level; l++) {
        this.entryPoints[l] = id;
      }
      return;
    }

    let currentEp = this.entryPoints[this.maxLayer];
    for (let l = this.maxLayer; l > level; l--) {
      if (this.entryPoints[l] !== null) {
        currentEp = this.entryPoints[l];
        break;
      }
    }

    for (let l = this.maxLayer; l > level; l--) {
      const results = this._searchLayer(vector, currentEp, 1, l);
      currentEp = results[0]?.id ?? currentEp;
      this.entryPoints[l] = currentEp;
    }

    for (let l = Math.min(level, this.maxLayer); l >= 0; l--) {
      const ep = this.entryPoints[l] ?? id;
      const results = this._searchLayer(vector, ep, this.efConstruction, l);

      const neighbors = [];
      for (const candidate of results) {
        if (candidate.id !== id) {
          neighbors.push(candidate.id);
        }
      }

      for (const neighborId of neighbors) {
        const neighborLevel = this.levels.get(neighborId) ?? 0;
        if (neighborLevel >= l) {
          const ng = this.graphs[l].get(neighborId) || [];
          if (ng.length < this.M) {
            ng.push(id);
            this.graphs[l].set(neighborId, ng);
          }
        }
      }

      this.graphs[l].set(id, neighbors);

      if (neighbors.length > this.M) {
        const keepNeighbors = this._selectBestNeighbors(vector, neighbors, this.M, l);
        this.graphs[l].set(id, keepNeighbors);
      }

      for (const neighborId of neighbors) {
        const neighborLevel = this.levels.get(neighborId) ?? 0;
        if (neighborLevel >= l) {
          const ng = this.graphs[l].get(neighborId) || [];
          if (!ng.includes(id)) {
            if (ng.length < this.M) {
              ng.push(id);
              this.graphs[l].set(neighborId, ng);
            } else {
              const updatedNg = this._selectBestNeighbors(this.vectors.get(neighborId), ng, this.M, l);
              this.graphs[l].set(neighborId, updatedNg);
            }
          }
        }
      }
    }

    if (level > this.maxLayer) {
      for (let l = this.maxLayer + 1; l <= level; l++) {
        this.entryPoints[l] = id;
      }
      this.maxLayer = level;
    }
  }

  _selectBestNeighbors(queryVector, neighborIds, m, level) {
    const scored = neighborIds.map(id => ({
      id,
      dist: this._distance(queryVector, this.vectors.get(id))
    }));
    scored.sort((a, b) => a.dist - b.dist);
    return scored.slice(0, m).map(s => s.id);
  }

  search(queryVector, k = 5) {
    if (this.vectors.size === 0) return [];

    let ep = this.entryPoints[this.maxLayer];
    if (ep === null) return [];

    for (let l = this.maxLayer; l > 0; l--) {
      if (this.entryPoints[l] !== null) {
        ep = this.entryPoints[l];
        break;
      }
    }

    for (let l = this.maxLayer; l > 0; l--) {
      const results = this._searchLayer(queryVector, ep, 1, l);
      ep = results[0]?.id ?? ep;
    }

    const results = this._searchLayer(queryVector, ep, k, 0);
    return results.slice(0, k).map(r => {
      const entry = {
        id: r.id,
        score: 1 - r.dist,
        level: this.levels.get(r.id) ?? 0
      };
      return entry;
    });
  }

  searchAsync(queryVector, k = 5) {
    return new Promise(resolve => {
      const results = this.search(queryVector, k);
      resolve(results);
    });
  }

  getStats() {
    let totalEdges = 0;
    for (let l = 0; l < this.maxLayers; l++) {
      const g = this.graphs[l];
      for (const [, neighbors] of g) {
        totalEdges += (neighbors || []).length;
      }
    }
    return {
      totalNodes: this.vectors.size,
      maxLayer: this.maxLayer,
      edgesByLayer: this.graphs.map((g, i) => ({
        layer: i,
        nodes: g.size,
        edges: Array.from(g.values()).reduce((sum, n) => sum + (n || []).length, 0)
      })),
      avgConnections: this.vectors.size > 0 ? (totalEdges / this.vectors.size).toFixed(2) : 0
    };
  }

  save(filepath) {
    const data = {
      M: this.M,
      efConstruction: this.efConstruction,
      maxLayers: this.maxLayers,
      vectorSize: this.vectorSize,
      maxLayer: this.maxLayer,
      vectors: Array.from(this.vectors.entries()),
      levels: Array.from(this.levels.entries()),
      graphs: this.graphs.map(g => Array.from(g.entries()))
    };
    fs.writeFileSync(filepath, JSON.stringify(data));
  }

  load(filepath) {
    if (!fs.existsSync(filepath)) return false;
    try {
      const data = JSON.parse(fs.readFileSync(filepath, "utf8"));
      this.M = data.M;
      this.efConstruction = data.efConstruction;
      this.maxLayers = data.maxLayers;
      this.vectorSize = data.vectorSize;
      this.maxLayer = data.maxLayer;
      this.vectors = new Map(data.vectors);
      this.levels = new Map(data.levels);
      this.graphs = data.graphs.map(g => new Map(g));
      this.entryPoints = new Array(this.maxLayers).fill(null);
      for (let l = 0; l <= this.maxLayer; l++) {
        const g = this.graphs[l];
        if (g.size > 0) {
          this.entryPoints[l] = g.keys().next().value;
        }
      }
      return true;
    } catch {
      return false;
    }
  }
}

class AuroraMemoryBackend {
  constructor() {
    this.index = new HNSWIndex();
    this.entries = new Map();
    this.indexPath = '.agent/brain/db/memory-index.json';
    this.metadataPath = '.agent/brain/db/memory-metadata.json';
    this.load();
  }

  load() {
    if (this.index.load(path.join(ROOT, this.indexPath))) {
      console.log(`${GREEN}✓${RESET} Loaded HNSW index with ${this.index.vectors.size} entries`);
    }
    const metaPath = path.join(ROOT, this.metadataPath);
    if (fs.existsSync(metaPath)) {
      try {
        const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
        this.entries = new Map(meta);
        console.log(`${GREEN}✓${RESET} Loaded ${this.entries.size} metadata entries`);
      } catch { /* ignore */ }
    }
  }

  save() {
    this.index.save(path.join(ROOT, this.indexPath));
    fs.writeFileSync(path.join(ROOT, this.metadataPath), JSON.stringify(Array.from(this.entries.entries())));
  }

  addMemory(content, metadata = {}) {
    const hash = computeHash(content);
    for (const [, entry] of this.entries) {
      if (entry.hash === hash) {
        return { status: 'duplicate', id: entry.id };
      }
    }

    const vector = simpleEmbedding(content);
    const id = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const entry = {
      id,
      hash,
      content,
      ...metadata,
      createdAt: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now()
    };

    this.entries.set(id, entry);
    this.index.insert(id, vector);
    this.save();

    return { status: 'added', id, entry };
  }

  search(query, k = 5) {
    const t0 = Date.now();
    const queryVector = simpleEmbedding(query);
    const results = this.index.search(queryVector, k);
    const searchMs = Date.now() - t0;

    results.forEach(r => {
      const entry = this.entries.get(r.id);
      if (entry) {
        entry.accessCount++;
        entry.lastAccessed = Date.now();
      }
    });
    this.save();

    return results.map(r => {
      const entry = this.entries.get(r.id) || {};
      return {
        id: r.id,
        score: r.score,
        level: r.level,
        content: entry.content || '',
        hash: entry.hash || '',
        accessCount: entry.accessCount || 0,
        createdAt: entry.createdAt || 0,
        searchMs
      };
    });
  }

  searchAsync(query, k = 5) {
    return new Promise(resolve => {
      resolve(this.search(query, k));
    });
  }

  getStats() {
    const now = Date.now();
    const entries = Array.from(this.entries.values());
    const idxStats = this.index.getStats();
    return {
      total: entries.length,
      avgAccessCount: entries.length > 0
        ? entries.reduce((sum, e) => sum + (e.accessCount || 0), 0) / entries.length
        : 0,
      lastWeek: entries.filter(e => now - (e.lastAccessed || e.createdAt) < 7 * 24 * 60 * 60 * 1000).length,
      lastMonth: entries.filter(e => now - (e.lastAccessed || e.createdAt) < 30 * 24 * 60 * 60 * 1000).length,
      neverAccessed: entries.filter(e => !e.lastAccessed || e.accessCount === 0).length,
      hnsw: idxStats
    };
  }

  buildFromJsonl(jsonlPath, contentField = 'content') {
    const records = readJsonl(jsonlPath);
    let added = 0;
    let duplicates = 0;
    let t0 = Date.now();

    for (const record of records) {
      const content = record[contentField] || JSON.stringify(record);
      const result = this.addMemory(content, record);
      if (result.status === 'added') added++;
      else duplicates++;
    }

    return {
      added,
      duplicates,
      total: records.length,
      buildMs: Date.now() - t0,
      hnswStats: this.index.getStats()
    };
  }

  consolidate(lowAccessThreshold = 1) {
    const now = Date.now();
    const toRemove = [];
    for (const [id, entry] of this.entries) {
      if (
        (entry.accessCount || 0) <= lowAccessThreshold &&
        now - entry.createdAt > 30 * 24 * 60 * 60 * 1000
      ) {
        toRemove.push(id);
      }
    }
    if (toRemove.length === 0) {
      return { removed: 0, remaining: this.entries.size };
    }

    const newIndex = new HNSWIndex();
    const newEntries = new Map();

    for (const [id, entry] of this.entries) {
      if (!toRemove.includes(id)) {
        newEntries.set(id, entry);
        const vec = this.index.vectors.get(id);
        if (vec) newIndex.insert(id, vec);
      }
    }

    this.entries = newEntries;
    this.index = newIndex;
    this.save();
    return { removed: toRemove.length, remaining: this.entries.size };
  }
}

const memory = new AuroraMemoryBackend();

const args = process.argv.slice(2);
const command = args[0] || 'stats';

if (command === 'add') {
  const content = args.slice(1).join(' ');
  const result = memory.addMemory(content, { source: 'cli' });
  console.log(JSON.stringify(result, null, 2));
} 
else if (command === 'search') {
  const query = args.slice(1).join(' ');
  const results = memory.search(query);
  console.log(JSON.stringify(results, null, 2));
}
else if (command === 'stats') {
  const stats = memory.getStats();
  console.log(JSON.stringify(stats, null, 2));
}
else if (command === 'consolidate') {
  const result = memory.consolidate();
  console.log(JSON.stringify(result, null, 2));
}
else if (command === 'build') {
  const jsonlPath = args[1] || '.agent/brain/db/knowledge.jsonl';
  const result = memory.buildFromJsonl(jsonlPath);
  console.log(JSON.stringify(result, null, 2));
}
else if (command === 'benchmark') {
  const k = parseInt(args[1] || '5', 10);
  const n = parseInt(args[2] || '1000', 10);
  console.log(`${CYAN}Benchmarking HNSW search:${RESET}`);
  console.log(`  Entries: ${memory.entries.size}`);
  console.log(`  k: ${k}, iterations: ${n}`);

  const queries = [
    "react hooks performance optimization",
    "typescript type safety patterns",
    "machine learning vector embeddings",
    "api rate limiting best practices",
    "security authentication middleware"
  ];

  const totalStart = Date.now();
  let totalResults = 0;
  for (let i = 0; i < n; i++) {
    const q = queries[i % queries.length];
    const results = memory.search(q, k);
    totalResults += results.length;
  }
  const totalMs = Date.now() - totalStart;
  const avgMs = (totalMs / n).toFixed(3);

  console.log(`${GREEN}✓${RESET} ${n} searches completed`);
  console.log(`${GREEN}✓${RESET} Total: ${totalMs}ms, Avg: ${avgMs}ms per search`);
  console.log(`${GREEN}✓${RESET} Throughput: ${(n / (totalMs / 1000)).toFixed(1)} searches/sec`);
  if (parseFloat(avgMs) < 10) {
    console.log(`${GREEN}✓${RESET} ${CYAN}<10ms target MET${RESET}`);
  } else {
    console.log(`${YELLOW}⚠${RESET} ${CYAN}${avgMs}ms > 10ms target${RESET}`);
  }
}
else if (command === 'help') {
  console.log(`
${BOLD}Aurora Memory Backend (HNSW)${RESET}

Usage: node memory-backend.mjs <command> [args]

Commands:
  add <content>       Add a memory entry
  search <query>      Search memories (returns top 5)
  stats               Show memory + HNSW statistics
  consolidate         Remove low-access memories
  build [path]       Build index from JSONL file
  benchmark [k] [n]  Benchmark search speed (default: k=5, n=1000)
  help                Show this help

Examples:
  node memory-backend.mjs add "Aurora learned about HNSW indexing"
  node memory-backend.mjs search "memory indexing"
  node memory-backend.mjs stats
  node memory-backend.mjs benchmark 5 1000
  `);
}
else if (command === 'consolidate') {
  const result = memory.consolidate();
  console.log(JSON.stringify(result, null, 2));
}
else if (command === 'build') {
  const jsonlPath = args[1] || '.agent/brain/db/knowledge.jsonl';
  const result = memory.buildFromJsonl(jsonlPath);
  console.log(JSON.stringify(result, null, 2));
}
else if (command === 'help') {
  console.log(`
${BOLD}Aurora Memory Backend (HNSW)${RESET}

Usage: node memory-backend.mjs <command> [args]

Commands:
  add <content>     Add a memory entry
  search <query>    Search memories (returns top 5)
  stats             Show memory statistics
  consolidate       Remove low-access memories
  build [path]      Build index from JSONL file
  help              Show this help

Examples:
  node memory-backend.mjs add "Aurora learned about HNSW indexing"
  node memory-backend.mjs search "memory indexing"
  node memory-backend.mjs stats
  `);
}
else {
  console.log(`${YELLOW}Unknown command: ${command}${RESET}`);
  console.log(`Run 'node memory-backend.mjs help' for usage`);
}
