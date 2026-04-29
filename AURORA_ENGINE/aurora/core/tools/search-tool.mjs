/**
 * search-tool.mjs - Advanced Code Search para Aurora
 *
 * Tipos de búsqueda:
 *  1. grep - Búsqueda de contenido en archivos
 *  2. file - Búsqueda por nombre de archivo
 *  3. symbol - Búsqueda de funciones/clases
 *  4. reference - Búsqueda de usos de un símbolo
 *  5. regex - Búsqueda con expresiones regulares
 *
 * Uso:
 *   const { SearchTool } = await import('./search-tool.mjs');
 *   const tool = new SearchTool();
 *   const results = await tool.execute({ type: 'grep', pattern: 'import logger' });
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';

const execAsync = promisify(exec);

// ============================================================================
// SEARCH ENGINE
// ============================================================================

const SEARCH_CACHE = new Map();
const CACHE_TTL = 60000; // 1 minute

function getCached(key) {
  const entry = SEARCH_CACHE.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  SEARCH_CACHE.delete(key);
  return null;
}

function setCache(key, data) {
  SEARCH_CACHE.set(key, { data, timestamp: Date.now() });
}

function getAllFiles(dir, extensions = null) {
  const results = [];
  const ignoreDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage', 'vendor'];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (!ignoreDirs.includes(entry.name)) walk(fullPath);
      } else {
        if (!extensions || extensions.includes(path.extname(entry.name))) {
          results.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return results;
}

function walkDirectory(dir) {
  const cached = getCached(`files:${dir}`);
  if (cached) return cached;
  const files = getAllFiles(dir);
  setCache(`files:${dir}`, files);
  return files;
}

// ============================================================================
// SEARCH TYPES
// ============================================================================

/**
 * 1. Grep - Content search in files
 */
async function grepSearch(pattern, options = {}) {
  const { cwd, filePattern, maxResults = 50, caseSensitive = false } = options;

  // Use ripgrep if available, fallback to manual
  try {
    const flags = caseSensitive ? '' : '-i';
    const globArg = filePattern ? `--glob "${filePattern}"` : '';
    const { stdout } = await execAsync(`rg ${flags} ${globArg} -n --no-heading "${pattern}" "${cwd || '.'}" 2>/dev/null || grep -rn ${flags} "${pattern}" "${cwd || '.'}" | head -${maxResults}`, {
      timeout: 10000,
      maxBuffer: 1024 * 1024 * 5,
    });

    const results = [];
    for (const line of stdout.trim().split('\n').filter(Boolean)) {
      const match = line.match(/^(.+?):(\d+):(.+)$/);
      if (match) {
        results.push({
          file: match[1],
          line: parseInt(match[2]),
          content: match[3].trim(),
        });
      }
    }

    return { results, total: results.length, truncated: results.length >= maxResults };
  } catch {
    // Fallback to manual search
    const files = walkDirectory(cwd || process.cwd());
    const results = [];
    const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), caseSensitive ? 'g' : 'gi');

    for (const file of files) {
      if (filePattern && !file.match(filePattern)) continue;
      try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        for (let i = 0; i < lines.length && results.length < maxResults; i++) {
          regex.lastIndex = 0; // Reset before each test
          if (regex.test(lines[i])) {
            results.push({ file, line: i + 1, content: lines[i].trim() });
          }
        }
      } catch { /* skip binary files */ }
    }

    return { results, total: results.length };
  }
}

/**
 * 2. File search - By name pattern
 */
async function fileSearch(pattern, options = {}) {
  const { cwd, maxResults = 50 } = options;
  const files = walkDirectory(cwd || process.cwd());
  const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  const results = files
    .filter(f => regex.test(path.basename(f)))
    .slice(0, maxResults)
    .map(f => ({
      file: f,
      name: path.basename(f),
      extension: path.extname(f),
      size: fs.statSync(f).size,
    }));

  return { results, total: results.length };
}

/**
 * 3. Symbol search - Functions, classes, variables
 */
async function symbolSearch(symbol, options = {}) {
  const { cwd, maxResults = 50 } = options;

  // Search for function/class/interface declarations
  const patterns = [
    `function\\s+${symbol}\\s*\\(`,
    `class\\s+${symbol}\\s*[{(]`,
    `interface\\s+${symbol}\\s*[{(]`,
    `const\\s+${symbol}\\s*=`,
    `let\\s+${symbol}\\s*=`,
    `export\\s+(default\\s+)?(function|class|const)\\s+${symbol}`,
    `def\\s+${symbol}\\s*\\(`,  // Python
  ];

  const allResults = [];
  for (const pattern of patterns) {
    const result = await grepSearch(pattern, { cwd, maxResults });
    allResults.push(...result.results);
  }

  // Deduplicate
  const seen = new Set();
  const unique = allResults.filter(r => {
    const key = `${r.file}:${r.line}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { results: unique.slice(0, maxResults), total: unique.length };
}

/**
 * 4. Reference search - Where is a symbol used
 */
async function referenceSearch(symbol, options = {}) {
  const { cwd, maxResults = 100, excludeDef = true } = options;

  // Search for usages (not definitions)
  const patterns = [
    `\\b${symbol}\\b`,  // Word boundary match
  ];

  const results = [];
  for (const pattern of patterns) {
    const result = await grepSearch(pattern, { cwd, maxResults });
    results.push(...result.results);
  }

  // Filter out definitions if requested
  let filtered = results;
  if (excludeDef) {
    filtered = results.filter(r => {
      const content = r.content;
      return !content.match(new RegExp(`^(export\\s+)?(function|class|const|let|var|interface|type|def)\\s+${symbol}\\s*[({=]`));
    });
  }

  return { results: filtered.slice(0, maxResults), total: filtered.length };
}

/**
 * 5. Regex search
 */
async function regexSearch(pattern, options = {}) {
  const { cwd, maxResults = 50 } = options;

  try {
    // Validate regex
    new RegExp(pattern);
  } catch (e) {
    return { results: [], total: 0, error: `Invalid regex: ${e.message}` };
  }

  return grepSearch(pattern, { ...options, caseSensitive: true });
}

// ============================================================================
// SEARCH TOOL CLASS
// ============================================================================

export class SearchTool {
  constructor(options = {}) {
    this.cwd = options.cwd || process.cwd();
    this.history = [];
    this.maxResults = options.maxResults || 50;
  }

  async execute(params) {
    const { type, ...args } = params;
    args.cwd = args.cwd || this.cwd;
    args.maxResults = args.maxResults || this.maxResults;

    try {
      let result;
      switch (type) {
        case 'grep': result = await grepSearch(args.pattern, args); break;
        case 'file': result = await fileSearch(args.pattern, args); break;
        case 'symbol': result = await symbolSearch(args.symbol, args); break;
        case 'reference': result = await referenceSearch(args.symbol, args); break;
        case 'regex': result = await regexSearch(args.pattern, args); break;
        default:
          return { success: false, error: `Unknown search type: ${type}` };
      }

      this.history.push({ type, query: args.pattern || args.symbol, timestamp: Date.now(), count: result.total });
      return { success: true, ...result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear search cache
   */
  clearCache() {
    SEARCH_CACHE.clear();
    return { cleared: true };
  }

  /**
   * Get search history
   */
  getHistory(limit = 20) {
    return this.history.slice(-limit);
  }

  /**
   * Schema for Aurora registry
   */
  getSchema() {
    return {
      name: 'search',
      description: 'Advanced code search. Types: grep (content), file (name), symbol (functions/classes), reference (usages), regex (pattern)',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['grep', 'file', 'symbol', 'reference', 'regex'],
          },
          pattern: { type: 'string' },
          symbol: { type: 'string' },
          filePattern: { type: 'string' },
          maxResults: { type: 'number' },
          cwd: { type: 'string' },
          caseSensitive: { type: 'boolean' },
          excludeDef: { type: 'boolean' },
        },
        required: ['type'],
      },
    };
  }
}
