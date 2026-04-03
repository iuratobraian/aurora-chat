#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.cwd();

const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const CYAN = "\x1b[36m";
const MAGENTA = "\x1b[35m";

const readText = (relativePath) => {
  const full = path.join(ROOT, relativePath);
  if (!fs.existsSync(full)) return "";
  return fs.readFileSync(full, "utf8");
};

function readJsonl(relativePath) {
  const full = path.join(ROOT, relativePath);
  if (!fs.existsSync(full)) return [];
  const text = fs.readFileSync(full, "utf8").trim();
  if (!text) return [];
  return text.split(/\r?\n/).filter(Boolean).map(line => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
}

function appendJsonl(relativePath, record) {
  const full = path.join(ROOT, relativePath);
  const dir = path.dirname(full);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(full, JSON.stringify(record) + "\n");
}

function ensureDir(relativePath) {
  const full = path.join(ROOT, relativePath);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
}

const workers = {
  async audit() {
    console.log(`${CYAN}🔍 WORKER: audit${RESET}`);
    
    const findings = [];
    
    const taskBoard = readText(".agent/workspace/coordination/TASK_BOARD.md");
    const pendingMatches = taskBoard.match(/\| \S+ \| pending \|/g);
    const pendingCount = pendingMatches ? pendingMatches.length : 0;
    
    findings.push({
      worker: "audit",
      timestamp: new Date().toISOString(),
      finding: "pending_tasks",
      count: pendingCount,
      severity: pendingCount > 10 ? "high" : "low",
      message: `${pendingCount} pending tasks in TASK_BOARD`
    });
    
    const currentFocus = readText(".agent/workspace/coordination/CURRENT_FOCUS.md");
    const claimedMatches = currentFocus.match(/Estado: claimed|in_progress/gi);
    const claimedCount = claimedMatches ? claimedMatches.length : 0;
    
    findings.push({
      worker: "audit",
      timestamp: new Date().toISOString(),
      finding: "claimed_tasks",
      count: claimedCount,
      severity: "info",
      message: `${claimedCount} claimed/in_progress entries in CURRENT_FOCUS`
    });
    
    const lint = readText("package.json");
    const hasLint = lint.includes('"lint"');
    findings.push({
      worker: "audit",
      timestamp: new Date().toISOString(),
      finding: "lint_configured",
      value: hasLint,
      severity: hasLint ? "info" : "high",
      message: hasLint ? "Lint configured" : "Lint NOT configured"
    });
    
    console.log(`  Found ${findings.length} audit items`);
    return findings;
  },
  
  async testgaps() {
    console.log(`${CYAN}🧪 WORKER: testgaps${RESET}`);
    
    const gaps = [];
    
    const srcFiles = [];
    const convexFiles = [];
    
    const srcDir = path.join(ROOT, "src");
    if (fs.existsSync(srcDir)) {
      const walk = (dir, arr) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory() && !entry.name.startsWith(".")) {
            walk(full, arr);
          } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
            arr.push(full);
          }
        }
      };
      walk(srcDir, srcFiles);
    }
    
    const convexDir = path.join(ROOT, "convex");
    if (fs.existsSync(convexDir)) {
      for (const file of fs.readdirSync(convexDir)) {
        if (file.endsWith(".ts") && !file.startsWith("_")) {
          convexFiles.push(path.join(convexDir, file));
        }
      }
    }
    
    const testDir = path.join(ROOT, "__tests__");
    const testFiles = [];
    if (fs.existsSync(testDir)) {
      const walk = (dir, arr) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            walk(full, arr);
          } else if (entry.isFile() && entry.name.endsWith(".test.ts")) {
            arr.push(full);
          }
        }
      };
      walk(testDir, testFiles);
    }
    
    const testedFiles = new Set();
    for (const testFile of testFiles) {
      const content = readText(testFile);
      const imports = content.match(/from ['"](@[\w/-]+|[\w./]+)['"]/g) || [];
      for (const imp of imports) {
        const mod = imp.replace(/from ['"]/g, "").replace(/['"]/g, "");
        testedFiles.add(mod);
      }
    }
    
    const srcCoverage = srcFiles.length > 0 
      ? Math.round((testFiles.filter(t => t.includes("/src/")).length / srcFiles.length) * 100)
      : 0;
    
    gaps.push({
      worker: "testgaps",
      timestamp: new Date().toISOString(),
      metric: "src_coverage",
      value: srcCoverage,
      total_files: srcFiles.length,
      tested_files: testFiles.filter(t => t.includes("/src/")).length,
      message: `Source coverage: ${srcCoverage}% (${testFiles.filter(t => t.includes("/src/")).length}/${srcFiles.length} files)`
    });
    
    gaps.push({
      worker: "testgaps",
      timestamp: new Date().toISOString(),
      metric: "convex_coverage",
      value: 0,
      total_files: convexFiles.length,
      tested_files: testFiles.filter(t => t.includes("/convex/")).length,
      message: `Convex coverage needs manual assessment (${testFiles.filter(t => t.includes("/convex/")).length} tests)`
    });
    
    console.log(`  Analyzed ${srcFiles.length} source files, ${testFiles.length} tests`);
    return gaps;
  },
  
  async map() {
    console.log(`${CYAN}🗺️ WORKER: map${RESET}`);
    
    const structure = {
      worker: "map",
      timestamp: new Date().toISOString(),
      directories: {},
      fileTypes: {}
    };
    
    const countFiles = (dir, depth = 0) => {
      if (depth > 3) return;
      const full = path.join(ROOT, dir);
      if (!fs.existsSync(full)) return;
      
      structure.directories[dir] = { files: 0, dirs: 0 };
      
      for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
        if (entry.name.startsWith(".") && entry.name !== ".git") continue;
        
        if (entry.isDirectory()) {
          structure.directories[dir].dirs++;
          countFiles(path.join(dir, entry.name), depth + 1);
        } else {
          structure.directories[dir].files++;
          const ext = path.extname(entry.name);
          structure.fileTypes[ext] = (structure.fileTypes[ext] || 0) + 1;
        }
      }
    };
    
    countFiles("src");
    countFiles("convex");
    countFiles("scripts");
    countFiles(".agent");
    
    console.log(`  Mapped ${Object.keys(structure.directories).length} directories`);
    return [structure];
  },
  
  async consolidate() {
    console.log(`${CYAN}📚 WORKER: consolidate${RESET}`);
    
    const consolidations = [];
    
    const heuristicFiles = [
      ".agent/brain/db/heuristics.jsonl",
      ".agent/brain/db/patterns.jsonl",
      ".agent/brain/db/error_catalog.jsonl"
    ];
    
    let totalRecords = 0;
    for (const file of heuristicFiles) {
      const records = readJsonl(file);
      totalRecords += records.length;
    }
    
    consolidations.push({
      worker: "consolidate",
      timestamp: new Date().toISOString(),
      metric: "knowledge_records",
      value: totalRecords,
      message: `${totalRecords} total knowledge records across heuristics, patterns, and error catalog`
    });
    
    const connectorsPath = ".agent/aurora/connectors.json";
    if (fs.existsSync(connectorsPath)) {
      try {
        const connectors = JSON.parse(readText(connectorsPath));
        const mcpCount = connectors.mcp?.length || 0;
        const apiCount = connectors.apis?.length || 0;
        
        consolidations.push({
          worker: "consolidate",
          timestamp: new Date().toISOString(),
          metric: "aurora_connectors",
          mcp_count: mcpCount,
          api_count: apiCount,
          message: `Aurora has ${mcpCount} MCPs and ${apiCount} APIs configured`
        });
      } catch {}
    }
    
    console.log(`  Consolidated ${consolidations.length} knowledge summaries`);
    return consolidations;
  },
  
  async refactor() {
    console.log(`${CYAN}🔧 WORKER: refactor${RESET}`);
    
    const suggestions = [];
    
    const srcDir = path.join(ROOT, "src");
    if (fs.existsSync(srcDir)) {
      let largeFiles = [];
      
      const checkSize = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory() && !entry.name.startsWith(".")) {
            checkSize(full);
          } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
            const stats = fs.statSync(full);
            if (stats.size > 15000) {
              largeFiles.push({ path: full.replace(ROOT + "/", ""), size: stats.size });
            }
          }
        }
      };
      
      checkSize(srcDir);
      
      for (const file of largeFiles.slice(0, 5)) {
        suggestions.push({
          worker: "refactor",
          timestamp: new Date().toISOString(),
          finding: "large_file",
          file: file.path,
          size_kb: Math.round(file.size / 1024),
          suggestion: "Consider splitting into smaller modules",
          priority: file.size > 30000 ? "high" : "medium"
        });
      }
    }
    
    const logs = readText(".agent/brain/db/hook_log.jsonl");
    const logEntries = logs.trim().split("\n").length;
    
    if (logEntries > 1000) {
      suggestions.push({
        worker: "refactor",
        timestamp: new Date().toISOString(),
        finding: "large_hook_log",
        entries: logEntries,
        suggestion: "Consider archiving old hook log entries",
        priority: "medium"
      });
    }
    
    console.log(`  Generated ${suggestions.length} refactor suggestions`);
    return suggestions;
  }
};

async function runWorker(name) {
  if (!workers[name]) {
    console.error(`${RED}Unknown worker: ${name}${RESET}`);
    return [];
  }
  
  try {
    return await workers[name]();
  } catch (e) {
    console.error(`${RED}Worker ${name} failed: ${e.message}${RESET}`);
    return [{
      worker: name,
      timestamp: new Date().toISOString(),
      error: e.message
    }];
  }
}

async function runAllWorkers() {
  console.log(`\n${BOLD}🧠 Aurora Background Workers${RESET}\n`);
  
  const workerNames = ["audit", "testgaps", "map", "consolidate", "refactor"];
  const allResults = [];
  
  for (const name of workerNames) {
    const results = await runWorker(name);
    allResults.push(...results);
    console.log("");
  }
  
  ensureDir(".agent/brain/db/workers");
  
  const outputFile = ".agent/brain/db/workers/latest.jsonl";
  appendJsonl(outputFile, {
    timestamp: new Date().toISOString(),
    workers_run: workerNames.length,
    total_findings: allResults.length,
    results: allResults
  });
  
  console.log("=".repeat(50));
  console.log(`\n${BOLD}📊 Worker Summary:${RESET}`);
  console.log(`  Workers run: ${workerNames.length}`);
  console.log(`  Total findings: ${allResults.length}`);
  console.log(`\n${GREEN}✅ All workers completed${RESET}`);
  console.log(`  Output: ${outputFile}\n`);
  
  return allResults;
}

const workerName = process.argv[2];
if (workerName) {
  runWorker(workerName).then(results => {
    console.log(JSON.stringify(results, null, 2));
  }).catch(console.error);
} else {
  runAllWorkers().catch(console.error);
}
