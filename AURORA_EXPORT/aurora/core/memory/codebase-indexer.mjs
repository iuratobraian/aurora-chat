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

const EXTS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];
const SKIP_DIRS = new Set([
  "node_modules", ".git", "dist", "build", "convex/_generated",
  ".next", "coverage", "__tests__", "__mocks__", "test", "tests",
  ".agent/brain/db", ".agent/aurora/app", ".claude/skills",
  "android", "ios", ".expo"
]);

const SKIP_FILES = new Set([
  "convex/_generated/api.js", "convex/_generated/dataModel.js"
]);

function walkDir(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name) && !entry.name.startsWith(".")) {
        walkDir(full, files);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (EXTS.includes(ext) && !SKIP_FILES.has(full)) {
        files.push(full);
      }
    }
  }
  return files;
}

function extractSymbols(content, filePath) {
  const symbols = [];
  const rel = path.relative(ROOT, filePath);

  const importRegex = /import\s+(?:(?:\{[^}]+\}|\w+)(?:\s*,\s*(?:\{[^}]+\}|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g;
  let m;
  while ((m = importRegex.exec(content)) !== null) {
    symbols.push({ type: "import", value: m[1], file: rel, line: content.substring(0, m.index).split("\n").length });
  }

  const exportRegex = /export\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var|type|interface)\s+(\w+)/g;
  while ((m = exportRegex.exec(content)) !== null) {
    symbols.push({ type: "export", value: m[1], file: rel, line: content.substring(0, m.index).split("\n").length });
  }

  const funcRegex = /(?:^|\n)(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/gm;
  while ((m = funcRegex.exec(content)) !== null) {
    symbols.push({ type: "function", value: m[1], file: rel, line: content.substring(0, m.index).split("\n").length });
  }

  const classRegex = /(?:^|\n)(?:export\s+)?class\s+(\w+)(?:\s+extends\s+\w+)?(?:\s+implements\s+[\w,\s]+)?\s*\{/gm;
  while ((m = classRegex.exec(content)) !== null) {
    symbols.push({ type: "class", value: m[1], file: rel, line: content.substring(0, m.index).split("\n").length });
  }

  const constRegex = /(?:^|\n)(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=/gm;
  while ((m = constRegex.exec(content)) !== null) {
    if (!["require", "module", "exports"].includes(m[1])) {
      symbols.push({ type: "const", value: m[1], file: rel, line: content.substring(0, m.index).split("\n").length });
    }
  }

  const routeRegex = /(?:app|src)\/([^/]+)\/([^/]+\.(?:ts|tsx|js|jsx))/g;
  while ((m = routeRegex.exec(content)) !== null) {
    const routePath = "/" + m[1].replace(/\[([^\]]+)\]/g, ":$1");
    symbols.push({ type: "route", value: routePath, file: rel, line: parseInt(content.substring(0, m.index).split("\n").length) });
  }

  return symbols;
}

function computeHash(text) {
  return crypto.createHash("sha256").update(text).digest("hex").substring(0, 8);
}

class CodebaseIndexer {
  constructor() {
    this.indexPath = ".agent/brain/db/codebase-index.json";
    this.files = [];
    this.symbols = [];
    this.graph = new Map();
    this.byFile = new Map();
    this.bySymbol = new Map();
    this.byType = new Map();
    this.load();
  }

  load() {
    const full = path.join(ROOT, this.indexPath);
    if (fs.existsSync(full)) {
      try {
        const data = JSON.parse(fs.readFileSync(full, "utf8"));
        this.files = data.files || [];
        this.symbols = data.symbols || [];
        this.graph = new Map(data.graph || []);
        this.byFile = new Map(data.byFile || []);
        this.bySymbol = new Map(data.bySymbol || []);
        this.byType = new Map(data.byTypeEntries || []);
        console.log(`${GREEN}✓${RESET} Loaded codebase index: ${this.files.length} files, ${this.symbols.length} symbols`);
        return true;
      } catch { /* corrupt - rebuild */ }
    }
    return false;
  }

  save() {
    const full = path.join(ROOT, this.indexPath);
    const dir = path.dirname(full);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const data = {
      indexedAt: Date.now(),
      files: this.files,
      symbols: this.symbols,
      graph: Array.from(this.graph.entries()),
      byFile: Array.from(this.byFile.entries()),
      bySymbol: Array.from(this.bySymbol.entries()),
      byTypeEntries: Array.from(this.byType.entries())
    };
    fs.writeFileSync(full, JSON.stringify(data, null, 2));
  }

  index(targetPath = "src") {
    const t0 = Date.now();
    const dir = path.join(ROOT, targetPath);
    console.log(`${CYAN}Indexing ${targetPath}...${RESET}`);

    this.files = [];
    this.symbols = [];
    this.graph = new Map();
    this.byFile = new Map();
    this.bySymbol = new Map();
    this.byType = new Map();

    const filePaths = walkDir(dir);
    console.log(`  Found ${filePaths.length} files`);

    let totalSymbols = 0;
    const symbolSet = new Set();

    for (const filePath of filePaths) {
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const rel = path.relative(ROOT, filePath);
        const syms = extractSymbols(content, filePath);

        this.files.push({ path: rel, size: content.length, lines: content.split("\n").length });
        this.byFile.set(rel, syms);

        for (const sym of syms) {
          const key = `${sym.type}:${sym.value}`;
          if (!symbolSet.has(key)) {
            symbolSet.add(key);
            this.symbols.push(sym);

            if (!this.bySymbol.has(sym.value)) {
              this.bySymbol.set(sym.value, []);
            }
            this.bySymbol.get(sym.value).push({ ...sym, file: rel });

            if (!this.byType.has(sym.type)) {
              this.byType.set(sym.type, []);
            }
            this.byType.get(sym.type).push(sym);
          }
        }

        const imports = syms.filter(s => s.type === "import");
        for (const imp of imports) {
          const absImp = path.resolve(path.dirname(filePath), imp.value).replace(/\\/g, "/");
          if (!this.graph.has(rel)) this.graph.set(rel, []);
          this.graph.get(rel).push({ type: "imports", target: imp.value, abs: absImp });
        }

        totalSymbols += syms.length;
      } catch { /* binary or unreadable */ }
    }

    this.save();
    const ms = Date.now() - t0;
    console.log(`${GREEN}✓${RESET} Indexed ${this.files.length} files, ${totalSymbols} symbols in ${ms}ms`);
    return { files: this.files.length, symbols: totalSymbols, ms };
  }

  search(query, type = null, limit = 10) {
    const q = query.toLowerCase();
    const results = [];

    if (type) {
      const typed = this.byType.get(type) || [];
      for (const sym of typed) {
        if (sym.value.toLowerCase().includes(q)) {
          results.push(sym);
        }
      }
    } else {
      for (const sym of this.symbols) {
        if (sym.value.toLowerCase().includes(q)) {
          results.push(sym);
        }
      }
    }

    return results.slice(0, limit).map(s => ({
      type: s.type,
      name: s.value,
      file: s.file,
      line: s.line
    }));
  }

  getCallers(functionName) {
    const callers = [];
    for (const [file, syms] of this.byFile) {
      for (const sym of syms) {
        if (sym.value === functionName) {
          callers.push({ file, line: sym.line });
        }
      }
    }
    return callers;
  }

  getFileSymbols(filePath) {
    return this.byFile.get(filePath) || [];
  }

  getStats() {
    return {
      files: this.files.length,
      symbols: this.symbols.length,
      byType: Object.fromEntries(this.byType.entries()),
      avgSymbolsPerFile: this.symbols.length / (this.files.length || 1),
      indexedAt: fs.existsSync(path.join(ROOT, this.indexPath))
        ? JSON.parse(fs.readFileSync(path.join(ROOT, this.indexPath), "utf8")).indexedAt
        : null
    };
  }

  getExports(modulePath) {
    const syms = this.byFile.get(modulePath) || [];
    return syms.filter(s => s.type === "export" || s.type === "class" || s.type === "function");
  }

  getImports(filePath) {
    const syms = this.byFile.get(filePath) || [];
    return syms.filter(s => s.type === "import");
  }
}

const indexer = new CodebaseIndexer();
const args = process.argv.slice(2);
const command = args[0] || "stats";

if (command === "index") {
  const target = args[1] || "src";
  console.log(JSON.stringify(indexer.index(target), null, 2));
}
else if (command === "search") {
  const type = args[1] === "--type" ? args[2] : null;
  const query = type ? args.slice(3).join(" ") : args.slice(1).join(" ");
  const results = indexer.search(query, type);
  console.log(JSON.stringify(results, null, 2));
}
else if (command === "stats") {
  console.log(JSON.stringify(indexer.getStats(), null, 2));
}
else if (command === "callers") {
  const fn = args.slice(1).join(" ");
  console.log(JSON.stringify(indexer.getCallers(fn), null, 2));
}
else if (command === "file") {
  const fp = args.slice(1).join("/");
  console.log(JSON.stringify(indexer.getFileSymbols(fp), null, 2));
}
else if (command === "exports") {
  const fp = args.slice(1).join("/");
  console.log(JSON.stringify(indexer.getExports(fp), null, 2));
}
else if (command === "help") {
  console.log(`
${BOLD}Codebase Memory Indexer${RESET}

Usage: node codebase-indexer.mjs <command> [args]

Commands:
  index [path]      Index a directory (default: src)
  search <query>   Search symbols by name
  search --type <type> <query>  Search by type (function/class/const/export/route)
  callers <name>    Find callers of a function
  file <path>      Show all symbols in a file
  exports <path>   Show exported symbols from a module
  stats            Show index statistics
  help             Show this help

Examples:
  node codebase-indexer.mjs index src
  node codebase-indexer.mjs search AuroraMemoryBackend
  node codebase-indexer.mjs search --type class AuroraMemoryBackend
  node codebase-indexer.mjs callers useQuery
  node codebase-indexer.mjs file views/ComunidadView.tsx
  `);
}
else {
  console.log(`${YELLOW}Unknown command: ${command}${RESET}`);
  console.log(`Run 'node codebase-indexer.mjs help' for usage`);
}
