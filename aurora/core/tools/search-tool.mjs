#!/usr/bin/env node
/**
 * search-tool.mjs - Advanced Codebase Search Tool
 * 
 * Allows Aurora to search codebases by:
 * - Grep search (content search)
 * - File search (by name/pattern)
 * - Symbol search (functions, classes)
 * - Reference search (usages)
 * - Regex search
 * 
 * @see docs/CLAUDE_CODE_LEAK_ANALYSIS.md - Tool Registry Pattern
 * @see aurora/core/tools/bash-tool.mjs - Base tool template
 * @see aurora/core/coordinator/worker.mjs - walkDirectory reference
 */

import { exec } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { getBashTool } from './bash-tool.mjs';

// ============================================================================
// CONFIGURATION
// ============================================================================

const SEARCH_TOOL_CONFIG = {
  // Max files to search (5000)
  maxFiles: 5000,
  
  // Max file size to search (500KB)
  maxFileSize: 500 * 1024,
  
  // Max results to return (100)
  maxResults: 100,
  
  // File extensions to skip (binary)
  skipExtensions: [
    '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.svg',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx',
    '.zip', '.tar', '.gz', '.rar', '.7z',
    '.exe', '.dll', '.so', '.dylib',
    '.mp3', '.mp4', '.avi', '.mov', '.wav',
    '.lock', '.min.js', '.min.css', '.map'
  ],
  
  // Directories to skip
  skipDirectories: [
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    '.next',
    'vendor',
    'bin',
    'obj',
    '.vscode',
    '.idea'
  ],
  
  // Search timeout (30 seconds)
  timeoutMs: 30 * 1000
};

// ============================================================================
// SEARCH TOOL CLASS
// ============================================================================

export class SearchTool {
  constructor(options = {}) {
    this.config = { ...SEARCH_TOOL_CONFIG, ...options };
    this.bashTool = getBashTool();
    this.searchHistory = [];
  }

  /**
   * Get tool schema (for Tool Registry)
   */
  getSchema() {
    return {
      name: 'search',
      description: 'Advanced codebase search with multiple strategies',
      parameters: {
        type: {
          type: 'string',
          required: true,
          enum: ['grep', 'file', 'symbol', 'reference', 'regex'],
          description: 'Search type'
        },
        query: {
          type: 'string',
          required: true,
          description: 'Search query'
        },
        path: {
          type: 'string',
          description: 'Search path (default: current directory)'
        },
        include: {
          type: 'array',
          items: 'string',
          description: 'File patterns to include'
        },
        exclude: {
          type: 'array',
          items: 'string',
          description: 'File patterns to exclude'
        },
        caseSensitive: {
          type: 'boolean',
          description: 'Case sensitive search (default: false)'
        },
        maxResults: {
          type: 'number',
          description: 'Max results (default: 100)'
        }
      },
      returns: {
        results: 'array',
        total: 'number',
        searchTime: 'number'
      }
    };
  }

  /**
   * Execute search
   */
  async execute(type, options = {}) {
    const {
      query,
      path = process.cwd(),
      include = [],
      exclude = [],
      caseSensitive = false,
      maxResults = this.config.maxResults
    } = options;

    // Log search
    this.logSearch(type, query, path);

    // Validate
    if (!query) {
      return {
        results: [],
        total: 0,
        error: 'Search query is required'
      };
    }

    // Execute search
    const startTime = Date.now();
    let results = [];

    switch (type) {
      case 'grep':
        results = await this.grepSearch(query, path, include, exclude, caseSensitive, maxResults);
        break;
      
      case 'file':
        results = await this.fileSearch(query, path, include, exclude, maxResults);
        break;
      
      case 'symbol':
        results = await this.symbolSearch(query, path, maxResults);
        break;
      
      case 'reference':
        results = await this.referenceSearch(query, path, maxResults);
        break;
      
      case 'regex':
        results = await this.regexSearch(query, path, include, exclude, maxResults);
        break;
      
      default:
        return {
          results: [],
          total: 0,
          error: `Unknown search type: ${type}`
        };
    }

    const searchTime = Date.now() - startTime;

    return {
      results,
      total: results.length,
      searchTime,
      type,
      query,
      path
    };
  }

  /**
   * Grep search - search for text in files
   */
  async grepSearch(query, searchPath, include = [], exclude = [], caseSensitive = false, maxResults = 100) {
    const results = [];
    
    // Build grep command
    const flags = ['-n', '-H']; // line numbers, with filename
    if (!caseSensitive) flags.push('-i');
    if (maxResults) flags.push(`-m${maxResults}`);

    // Add include patterns
    const includeFlags = include.length > 0 
      ? include.map(p => `--include="${p}"`).join(' ')
      : '--include="*.{ts,tsx,js,jsx,mjs,css,scss,html,json,md}"';

    // Add exclude patterns
    const excludeFlags = exclude.length > 0
      ? exclude.map(p => `--exclude="${p}"`).join(' ')
      : this.config.skipDirectories.map(d => `--exclude-dir="${d}"`).join(' ');

    const command = `grep ${flags.join(' ')} ${includeFlags} ${excludeFlags} "${query}" "${searchPath}"`;

    const result = await this.bashTool.execute(command, { timeout: this.config.timeoutMs });

    if (result.exitCode !== 0 && result.exitCode !== 1) {
      return [];
    }

    // Parse grep output
    const lines = result.output.split('\n').filter(l => l.trim());
    
    for (const line of lines) {
      const match = line.match(/^(.+?):(\d+):(.*)$/);
      if (match) {
        results.push({
          file: match[1],
          line: parseInt(match[2]),
          content: match[3],
          type: 'grep'
        });
      }
    }

    return results.slice(0, maxResults);
  }

  /**
   * File search - search for files by name
   */
  async fileSearch(query, searchPath, include = [], exclude = [], maxResults = 100) {
    const results = [];

    // Build find command
    const namePattern = query.includes('*') ? query : `*${query}*`;
    
    // Build exclude patterns
    const excludePatterns = exclude.length > 0
      ? exclude.map(p => `-not -path "${p}"`).join(' ')
      : this.config.skipDirectories.map(d => `-not -path "*/${d}/*"`).join(' ');

    const command = `find "${searchPath}" -name "${namePattern}" -type f ${excludePatterns} -maxdepth 5`;

    const result = await this.bashTool.execute(command, { timeout: this.config.timeoutMs });

    if (result.exitCode !== 0) {
      return [];
    }

    // Parse find output
    const lines = result.output.split('\n').filter(l => l.trim());
    
    for (const line of lines.slice(0, maxResults)) {
      const relativePath = path.relative(searchPath, line);
      results.push({
        file: line,
        relativePath,
        type: 'file'
      });
    }

    return results;
  }

  /**
   * Symbol search - search for functions, classes, etc.
   */
  async symbolSearch(query, searchPath, maxResults = 100) {
    const results = [];

    // Search for function/class definitions
    const patterns = [
      // TypeScript/JavaScript function
      `(export\s+)?(async\s+)?function\s+${query}`,
      // Class
      `(export\s+)?class\s+${query}`,
      // Const function
      `const\s+${query}\s*=`,
      // Export
      `export\s+(default\s+)?${query}`,
      // Interface/Type
      `(export\s+)?(interface|type)\s+${query}`
    ];

    for (const pattern of patterns) {
      const grepResults = await this.grepSearch(pattern, searchPath, [], [], false, maxResults - results.length);
      
      for (const result of grepResults) {
        // Avoid duplicates
        if (!results.some(r => r.file === result.file && r.line === result.line)) {
          result.type = 'symbol';
          result.symbol = query;
          results.push(result);
        }
      }

      if (results.length >= maxResults) break;
    }

    return results;
  }

  /**
   * Reference search - find usages of a symbol
   */
  async referenceSearch(query, searchPath, maxResults = 100) {
    const results = [];

    // Search for usages (not definitions)
    const patterns = [
      // Function call
      `${query}\\s*\\(`,
      // Property access
      `\\.\\s*${query}\\b`,
      // Import
      `import.*${query}.*from`,
      // Variable usage
      `\\b${query}\\b`
    ];

    for (const pattern of patterns) {
      const grepResults = await this.regexSearch(pattern, searchPath, [], [], maxResults - results.length);
      
      for (const result of grepResults) {
        // Avoid duplicates
        const exists = results.some(r => 
          r.file === result.file && r.line === result.line
        );
        
        if (!exists) {
          result.type = 'reference';
          result.symbol = query;
          results.push(result);
        }
      }

      if (results.length >= maxResults) break;
    }

    return results;
  }

  /**
   * Regex search - search with regular expressions
   */
  async regexSearch(pattern, searchPath, include = [], exclude = [], maxResults = 100) {
    const results = [];

    // Build grep command with extended regex
    const flags = ['-n', '-H', '-E'];
    if (maxResults) flags.push(`-m${maxResults}`);

    const includeFlags = include.length > 0
      ? include.map(p => `--include="${p}"`).join(' ')
      : '--include="*.{ts,tsx,js,jsx,mjs}"';

    const excludeFlags = exclude.length > 0
      ? exclude.map(p => `--exclude="${p}"`).join(' ')
      : this.config.skipDirectories.map(d => `--exclude-dir="${d}"`).join(' ');

    const command = `grep ${flags.join(' ')} ${includeFlags} ${excludeFlags} "${pattern}" "${searchPath}"`;

    const result = await this.bashTool.execute(command, { timeout: this.config.timeoutMs });

    if (result.exitCode !== 0 && result.exitCode !== 1) {
      return [];
    }

    // Parse grep output
    const lines = result.output.split('\n').filter(l => l.trim());
    
    for (const line of lines.slice(0, maxResults)) {
      const match = line.match(/^(.+?):(\d+):(.*)$/);
      if (match) {
        results.push({
          file: match[1],
          line: parseInt(match[2]),
          content: match[3],
          type: 'regex',
          pattern
        });
      }
    }

    return results;
  }

  /**
   * Log search to history
   */
  logSearch(type, query, searchPath) {
    this.searchHistory.push({
      type,
      query,
      path: searchPath,
      timestamp: Date.now(),
      status: 'pending'
    });
  }

  /**
   * Get search history
   */
  getHistory(limit = 10) {
    return this.searchHistory.slice(-limit);
  }

  /**
   * Clear search history
   */
  clearHistory() {
    this.searchHistory = [];
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let searchToolInstance = null;

export function getSearchTool() {
  if (!searchToolInstance) {
    searchToolInstance = new SearchTool();
  }
  return searchToolInstance;
}

export async function executeSearch(type, options = {}) {
  const searchTool = getSearchTool();
  return await searchTool.execute(type, options);
}

// ============================================================================
// CLI MODE
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const type = args[0];
  const query = args[1];

  if (!type || !query) {
    console.log('SearchTool - Advanced codebase search\n');
    console.log('Usage: node search-tool.mjs <type> <query> [options]');
    console.log('\nSearch Types:');
    console.log('  grep       - Search for text in files');
    console.log('  file       - Search for files by name');
    console.log('  symbol     - Search for function/class definitions');
    console.log('  reference  - Find usages of a symbol');
    console.log('  regex      - Search with regular expressions\n');
    console.log('Options:');
    console.log('  --path <dir>      - Search path (default: .)');
    console.log('  --include <pat>   - Include pattern (e.g., "*.ts")');
    console.log('  --exclude <pat>   - Exclude pattern');
    console.log('  --case-sensitive  - Case sensitive search');
    console.log('  --max <n>         - Max results (default: 100)\n');
    console.log('Examples:');
    console.log('  node search-tool.mjs grep "console.log"');
    console.log('  node search-tool.mjs file "package.json"');
    console.log('  node search-tool.mjs symbol "useEffect" --include "*.tsx"');
    console.log('  node search-tool.mjs reference "myFunction"');
    console.log('  node search-tool.mjs regex "\\bconst\\s+\\w+\\s*=" --max 50\n');
    process.exit(0);
  }

  const searchTool = getSearchTool();
  const options = {};

  // Parse arguments
  for (let i = 2; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--path' && args[i + 1]) {
      options.path = args[++i];
    } else if (arg === '--include' && args[i + 1]) {
      options.include = options.include || [];
      options.include.push(args[++i]);
    } else if (arg === '--exclude' && args[i + 1]) {
      options.exclude = options.exclude || [];
      options.exclude.push(args[++i]);
    } else if (arg === '--case-sensitive') {
      options.caseSensitive = true;
    } else if (arg === '--max' && args[i + 1]) {
      options.maxResults = parseInt(args[++i]);
    }
  }

  console.log(`🔍 Search: ${type} "${query}"\n`);

  searchTool.execute(type, options)
    .then(result => {
      if (result.error) {
        console.error('❌ Error:', result.error);
        process.exit(1);
      }

      console.log(`📊 Results: ${result.total} found in ${result.searchTime}ms\n`);

      if (result.results.length === 0) {
        console.log('No results found.\n');
        process.exit(0);
      }

      // Group by file
      const byFile = {};
      for (const r of result.results) {
        if (!byFile[r.file]) byFile[r.file] = [];
        byFile[r.file].push(r);
      }

      // Display results
      for (const [file, matches] of Object.entries(byFile)) {
        console.log(`\n📁 ${file}`);
        console.log('─'.repeat(60));
        
        for (const match of matches.slice(0, 5)) {
          console.log(`  ${match.line}:${match.content.trim()}`);
        }
        
        if (matches.length > 5) {
          console.log(`  ... and ${matches.length - 5} more`);
        }
      }

      console.log('\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    });
}
