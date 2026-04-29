#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const DB_DIR = path.join(ROOT, ".agent/brain/db");
const INDEX_PATH = path.join(DB_DIR, "codebase-index.jsonl");
const GRAPH_PATH = path.join(DB_DIR, "codebase-graph.json");

const SCAN_DIRS = ["src", "convex", "lib", "services", "scripts", "server.ts"];
const EXTENSIONS = [".ts", ".tsx", ".js", ".mjs", ".cjs"];
const IGNORE_PATTERNS = ["node_modules", "dist", "coverage", ".git", "__tests__", ".agent/brain/db", "bitacora-de-trading"];

const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) return [];
  return text.split(/\r?\n/).filter(Boolean).map(line => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
}

function writeJsonl(filePath, records) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, records.map(r => JSON.stringify(r)).join("\n") + "\n");
}

function walkDir(dir, extensions = EXTENSIONS) {
  const files = [];
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(ROOT, fullPath).replace(/\\/g, "/");

    if (IGNORE_PATTERNS.some(p => relPath.startsWith(p))) continue;

    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath, extensions));
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      files.push({ path: relPath, fullPath, name: entry.name });
    }
  }
  return files;
}

function extractEntities(filePath, content) {
  const entities = [];
  const relPath = filePath.replace(/\\/g, "/");
  const lines = content.split("\n");

  // Extract exports (named + default)
  const exportFnRegex = /export\s+(?:async\s+)?(?:function|const|let|var)\s+(\w+)/g;
  const exportClassRegex = /export\s+(?:default\s+)?(?:abstract\s+)?class\s+(\w+)/g;
  const exportInterfaceRegex = /export\s+(?:default\s+)?interface\s+(\w+)/g;
  const exportTypeRegex = /export\s+(?:default\s+)?type\s+(\w+)/g;
  const defaultExportRegex = /export\s+default\s+(?:function\s+)?(\w+)?/g;

  let match;

  while ((match = exportFnRegex.exec(content)) !== null) {
    const lineNum = content.substring(0, match.index).split("\n").length;
    entities.push({
      type: "function",
      name: match[1],
      file: relPath,
      line: lineNum,
      exported: true,
      hash: crypto.createHash("md5").update(`${relPath}:${match[1]}`).digest("hex").slice(0, 8)
    });
  }

  while ((match = exportClassRegex.exec(content)) !== null) {
    const lineNum = content.substring(0, match.index).split("\n").length;
    entities.push({
      type: "class",
      name: match[1],
      file: relPath,
      line: lineNum,
      exported: true,
      hash: crypto.createHash("md5").update(`${relPath}:${match[1]}`).digest("hex").slice(0, 8)
    });
  }

  while ((match = exportInterfaceRegex.exec(content)) !== null) {
    const lineNum = content.substring(0, match.index).split("\n").length;
    entities.push({
      type: "interface",
      name: match[1],
      file: relPath,
      line: lineNum,
      exported: true,
      hash: crypto.createHash("md5").update(`${relPath}:${match[1]}`).digest("hex").slice(0, 8)
    });
  }

  while ((match = exportTypeRegex.exec(content)) !== null) {
    const lineNum = content.substring(0, match.index).split("\n").length;
    entities.push({
      type: "type",
      name: match[1],
      file: relPath,
      line: lineNum,
      exported: true,
      hash: crypto.createHash("md5").update(`${relPath}:${match[1]}`).digest("hex").slice(0, 8)
    });
  }

  // Extract internal functions (not exported)
  const fnRegex = /(?:^|\n)\s*(?:async\s+)?function\s+(\w+)/g;
  const constFnRegex = /(?:^|\n)\s*const\s+(\w+)\s*=\s*(?:async\s+)?\(/g;

  while ((match = fnRegex.exec(content)) !== null) {
    const name = match[1];
    if (!entities.some(e => e.name === name && e.file === relPath)) {
      const lineNum = content.substring(0, match.index).split("\n").length;
      entities.push({
        type: "function",
        name,
        file: relPath,
        line: lineNum,
        exported: false,
        hash: crypto.createHash("md5").update(`${relPath}:${name}`).digest("hex").slice(0, 8)
      });
    }
  }

  while ((match = constFnRegex.exec(content)) !== null) {
    const name = match[1];
    if (!entities.some(e => e.name === name && e.file === relPath)) {
      const lineNum = content.substring(0, match.index).split("\n").length;
      entities.push({
        type: "function",
        name,
        file: relPath,
        line: lineNum,
        exported: false,
        hash: crypto.createHash("md5").update(`${relPath}:${name}`).digest("hex").slice(0, 8)
      });
    }
  }

  // Extract imports (dependency edges)
  const imports = [];
  const importRegex = /import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
  while ((match = importRegex.exec(content)) !== null) {
    const importedNames = match[1] ? match[1].split(",").map(s => s.trim().split(" ")[0]) : [match[2]];
    const source = match[3];
    imports.push({ names: importedNames, source, file: relPath });
  }

  // Extract Convex mutations/queries
  const convexMutationRegex = /export\s+(?:const|async function)\s+(\w+)\s*=\s*(?:mutation|query|internalMutation|internalQuery)/g;
  const convexEntities = [];
  while ((match = convexMutationRegex.exec(content)) !== null) {
    const lineNum = content.substring(0, match.index).split("\n").length;
    convexEntities.push({
      name: match[1],
      line: lineNum,
      file: relPath
    });
  }

  return { entities, imports, convexEntities };
}

function buildDependencyGraph(files) {
  const graph = { nodes: {}, edges: [] };
  const allEntities = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(file.fullPath, "utf8");
      const { entities, imports, convexEntities } = extractEntities(file.path, content);

      for (const entity of entities) {
        graph.nodes[entity.hash] = entity;
        allEntities.push(entity);
      }

      for (const imp of imports) {
        for (const name of imp.names) {
          graph.edges.push({
            from: imp.file,
            to: imp.source,
            name,
            type: "import"
          });
        }
      }

      for (const ce of convexEntities) {
        const hash = crypto.createHash("md5").update(`${ce.file}:${ce.name}`).digest("hex").slice(0, 8);
        if (graph.nodes[hash]) {
          graph.nodes[hash].convexFunction = true;
        }
      }

      file.entities = entities;
      file.imports = imports;
      file.convexEntities = convexEntities;
    } catch {
      // Skip unreadable files
    }
  }

  return { graph, allEntities, files };
}

function indexToKnowledgeBase(files) {
  const records = [];
  const now = Date.now();

  for (const file of files) {
    if (!file.entities) continue;

    for (const entity of file.entities) {
      records.push({
        id: `code_${entity.hash}`,
        hash: entity.hash,
        content: `${entity.type} ${entity.name} in ${entity.file} (line ${entity.line})`,
        type: entity.type,
        name: entity.name,
        file: entity.file,
        line: entity.line,
        exported: entity.exported,
        convexFunction: entity.convexFunction || false,
        source: "codebase-index",
        createdAt: now,
        updatedAt: now,
        accessCount: 0,
        freshnessScore: 100,
        domain: file.path.split("/")[0]
      });
    }
  }

  return records;
}

function findCallers(targetName, graph) {
  const callers = [];
  for (const edge of graph.edges) {
    if (edge.name === targetName) {
      callers.push({ file: edge.from, source: edge.to, type: edge.type });
    }
  }
  return callers;
}

function findUnusedExports(graph) {
  const exported = Object.values(graph.nodes).filter(n => n.exported);
  const imported = new Set(graph.edges.map(e => e.name));
  return exported.filter(e => !imported.has(e.name));
}

function searchCodebase(query, graph) {
  const q = query.toLowerCase();
  const results = [];

  for (const [, node] of Object.entries(graph.nodes)) {
    const nameMatch = node.name.toLowerCase().includes(q);
    const fileMatch = node.file.toLowerCase().includes(q);
    const contentMatch = node.content?.toLowerCase().includes(q);

    if (nameMatch || fileMatch || contentMatch) {
      results.push({
        ...node,
        score: nameMatch ? 1.0 : fileMatch ? 0.7 : 0.5,
        matchType: nameMatch ? "name" : fileMatch ? "file" : "content"
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 20);
}

// CLI
const command = process.argv[2];
const args = process.argv.slice(3);

if (command === "build" || command === "index") {
  console.log(`${CYAN}Indexing codebase...${RESET}`);

  const allFiles = [];
  for (const dir of SCAN_DIRS) {
    const dirPath = path.join(ROOT, dir);
    if (fs.existsSync(dirPath)) {
      if (fs.statSync(dirPath).isFile()) {
        allFiles.push({ path: dir, fullPath: dirPath, name: path.basename(dir) });
      } else {
        allFiles.push(...walkDir(dirPath));
      }
    }
  }

  console.log(`${GREEN}✓${RESET} Found ${allFiles.length} files`);

  const { graph, allEntities, files } = buildDependencyGraph(allFiles);
  console.log(`${GREEN}✓${RESET} Extracted ${allEntities.length} entities`);

  const knowledgeRecords = indexToKnowledgeBase(files);
  const existingRecords = readJsonl(INDEX_PATH);
  const existingHashes = new Set(existingRecords.map(r => r.hash));

  const newRecords = knowledgeRecords.filter(r => !existingHashes.has(r.hash));
  const updatedRecords = existingRecords.map(r => {
    const fresh = knowledgeRecords.find(nr => nr.hash === r.hash);
    if (fresh) {
      return { ...r, updatedAt: Date.now(), freshnessScore: 100 };
    }
    const age = Date.now() - (r.updatedAt || r.createdAt);
    const freshness = Math.max(0, 100 - (age / (24 * 60 * 60 * 1000)) * 5);
    return { ...r, freshnessScore: Math.round(freshness) };
  });

  const mergedRecords = [...updatedRecords, ...newRecords];
  writeJsonl(INDEX_PATH, mergedRecords);

  fs.writeFileSync(GRAPH_PATH, JSON.stringify({
    nodes: Object.values(graph.nodes),
    edges: graph.edges,
    stats: {
      totalFiles: allFiles.length,
      totalEntities: allEntities.length,
      totalEdges: graph.edges.length,
      newRecords: newRecords.length,
      totalRecords: mergedRecords.length,
      timestamp: new Date().toISOString()
    }
  }, null, 2));

  console.log(`${GREEN}✓${RESET} Indexed: ${newRecords.length} new, ${mergedRecords.length} total`);
  console.log(`${GREEN}✓${RESET} Graph: ${graph.edges.length} dependency edges`);

  // Convex functions
  const convexFns = allEntities.filter(e => e.convexFunction);
  if (convexFns.length > 0) {
    console.log(`${GREEN}✓${RESET} Convex functions: ${convexFns.length}`);
  }
} else if (command === "search") {
  const query = args.join(" ");
  if (!query) {
    console.log("Usage: aurora-codebase-index.mjs search <query>");
    process.exit(1);
  }

  let graph;
  if (fs.existsSync(GRAPH_PATH)) {
    graph = JSON.parse(fs.readFileSync(GRAPH_PATH, "utf8"));
    graph.nodes = Object.fromEntries(graph.nodes.map(n => [n.hash, n]));
  } else {
    console.log(`${YELLOW}⚠${RESET} No index found. Run 'build' first.`);
    process.exit(1);
  }

  const results = searchCodebase(query, graph);
  console.log(JSON.stringify(results, null, 2));
} else if (command === "callers") {
  const targetName = args[0];
  if (!targetName) {
    console.log("Usage: aurora-codebase-index.mjs callers <functionName>");
    process.exit(1);
  }

  const graphData = JSON.parse(fs.readFileSync(GRAPH_PATH, "utf8"));
  const graph = { nodes: Object.fromEntries(graphData.nodes.map(n => [n.hash, n])), edges: graphData.edges };
  const callers = findCallers(targetName, graph);
  console.log(JSON.stringify(callers, null, 2));
} else if (command === "unused") {
  const graphData = JSON.parse(fs.readFileSync(GRAPH_PATH, "utf8"));
  const graph = { nodes: Object.fromEntries(graphData.nodes.map(n => [n.hash, n])), edges: graphData.edges };
  const unused = findUnusedExports(graph);
  console.log(`${BOLD}Potentially unused exports:${RESET}`);
  unused.forEach(e => console.log(`  ${e.name} (${e.file}:${e.line})`));
  console.log(`\nTotal: ${unused.length}`);
} else if (command === "stats") {
  if (!fs.existsSync(GRAPH_PATH)) {
    console.log(`${YELLOW}⚠${RESET} No index found. Run 'build' first.`);
    process.exit(1);
  }

  const graphData = JSON.parse(fs.readFileSync(GRAPH_PATH, "utf8"));
  const knowledgeRecords = readJsonl(INDEX_PATH);
  const fresh = knowledgeRecords.filter(r => (r.freshnessScore || 0) >= 50).length;

  console.log(JSON.stringify({
    graph: graphData.stats,
    knowledge: {
      totalRecords: knowledgeRecords.length,
      fresh,
      stale: knowledgeRecords.length - fresh,
      overallFreshness: knowledgeRecords.length > 0 ? Math.round((fresh / knowledgeRecords.length) * 100) : 0
    }
  }, null, 2));
} else if (command === "graph") {
  if (!fs.existsSync(GRAPH_PATH)) {
    console.log(`${YELLOW}⚠${RESET} No index found. Run 'build' first.`);
    process.exit(1);
  }

  const graphData = JSON.parse(fs.readFileSync(GRAPH_PATH, "utf8"));
  console.log(JSON.stringify(graphData.stats, null, 2));
  console.log(`\n${BOLD}Top exported entities:${RESET}`);
  graphData.nodes
    .filter(n => n.exported)
    .slice(0, 20)
    .forEach(n => console.log(`  ${n.type} ${n.name} → ${n.file}:${n.line}`));
} else {
  console.log(`
${BOLD}Aurora Codebase Index${RESET}

Usage: node aurora-codebase-index.mjs <command> [args]

Commands:
  build               Scan repo and build codebase index + dependency graph
  search <query>      Search entities by name/file/content
  callers <name>      Find callers of a function
  unused              Find potentially unused exports
  stats               Show index statistics
  graph               Show dependency graph overview

Examples:
  node aurora-codebase-index.mjs build
  node aurora-codebase-index.mjs search "rateLimit"
  node aurora-codebase-index.mjs callers "mapConvexPost"
  node aurora-codebase-index.mjs unused
  `);
}
