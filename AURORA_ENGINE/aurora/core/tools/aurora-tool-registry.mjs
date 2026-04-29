#!/usr/bin/env node
/**
 * aurora-tool-registry.mjs - Tool Registry with Caching
 * 
 * Patrón extraído de Claude Code leak:
 * - 40+ herramientas registradas
 * - Schema caching para eficiencia
 * - Tool discovery y search
 * 
 * @see docs/CLAUDE_CODE_LEAK_ANALYSIS.md
 */

import fs from 'node:fs';
import path from 'node:path';
import { BashTool, bashToolDefinition } from './bash-tool.mjs';
import { GitTool } from './git-tool.mjs';
import { SelfCorrectLoop } from '../coordinator/self-correct.mjs';
import { DiffTool } from './diff-tool.mjs';
import { SearchTool } from './search-tool.mjs';
import { PlanMode } from '../modes/plan-mode.mjs';
import { ResumeContext } from '../context/resume.mjs';
import { PromptCache } from '../prompt/prompt-cache.mjs';
import { UltraPlan } from '../ultraplan/aurora-ultraplan.mjs';
import { AuroraBridge } from '../bridge/aurora-bridge.mjs';
import { AuroraComputer } from '../computer/aurora-computer.mjs';
import { TokenEfficientTool } from '../token/token-efficient.mjs';
import { UndercoverMode } from '../security/undercover.mjs';
import { AuroraBuddy } from '../buddy/aurora-buddy.mjs';
import { ApiTestTool } from './api-test-tool.mjs';
import { DbQueryTool } from './db-query-tool.mjs';
import { ImageTool } from './image-tool.mjs';
import { ZipTool } from './zip-tool.mjs';
import { CryptoTool } from './crypto-tool.mjs';
import { WebhookTool } from './webhook-tool.mjs';
import { HttpServerTool } from './http-server-tool.mjs';
import { DashboardServer } from '../../dashboard/dashboard-server.mjs';

const TOOL_CACHE = new Map();
const SCHEMA_CACHE = new Map();

// ============================================================================
// TOOL REGISTRY CLASS
// ============================================================================

export class AuroraToolRegistry {
  constructor() {
    this.tools = new Map();
    this.schemaCache = new Map();
    this.callCounts = new Map();
    this.lastCallTime = new Map();
  }

  /**
   * Register a tool
   */
  register(name, tool) {
    this.tools.set(name, tool);
    this.schemaCache.delete(name); // Invalidate cache
    this.callCounts.set(name, 0);
    
    console.log(`🔧 Tool registered: ${name}`);
  }

  /**
   * Get tool by name
   */
  get(name) {
    const tool = this.tools.get(name);
    
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }
    
    // Update call stats
    const count = this.callCounts.get(name) || 0;
    this.callCounts.set(name, count + 1);
    this.lastCallTime.set(name, Date.now());
    
    return tool;
  }

  /**
   * Get compressed schema (token-efficient format)
   * Format: ["name", ["param1:type!", "param2:type"]]
   */
  getCompressedSchema(name) {
    const tool = this.tools.get(name);
    if (!tool || !tool.getSchema) return null;

    const schema = tool.getSchema();
    const compressed = [
      schema.name,
      []
    ];

    // Compress parameters
    if (schema.parameters) {
      for (const [paramName, paramDef] of Object.entries(schema.parameters)) {
        let paramStr = `${paramName}:${paramDef.type}`;
        if (paramDef.required) paramStr += '!';
        compressed[1].push(paramStr);
      }
    }

    return compressed;
  }

  /**
   * Get all compressed schemas
   */
  getAllCompressedSchemas() {
    const schemas = {};
    for (const name of this.tools.keys()) {
      schemas[name] = this.getCompressedSchema(name);
    }
    return schemas;
  }

  /**
   * Get tool schema (cached)
   */
  getSchema(name) {
    if (!this.schemaCache.has(name)) {
      const tool = this.get(name);
      
      if (tool.getSchema) {
        this.schemaCache.set(name, tool.getSchema());
      } else {
        this.schemaCache.set(name, { name, description: tool.description || '' });
      }
    }
    
    return this.schemaCache.get(name);
  }

  /**
   * Get all schemas (for prompt efficiency)
   */
  getAllSchemas() {
    const schemas = {};
    
    for (const name of this.tools.keys()) {
      schemas[name] = this.getSchema(name);
    }
    
    return schemas;
  }

  /**
   * Search tools by keyword
   */
  search(query) {
    const results = [];
    const queryLower = query.toLowerCase();
    
    for (const [name, tool] of this.tools.entries()) {
      const schema = this.getSchema(name);
      const description = (schema.description || '').toLowerCase();
      
      if (name.toLowerCase().includes(queryLower) || 
          description.includes(queryLower)) {
        results.push({
          name,
          schema,
          callCount: this.callCounts.get(name) || 0
        });
      }
    }
    
    return results.sort((a, b) => b.callCount - a.callCount);
  }

  /**
   * Get usage statistics
   */
  getStats() {
    const stats = {
      totalTools: this.tools.size,
      totalCalls: 0,
      mostUsed: [],
      leastUsed: [],
      cacheSize: this.schemaCache.size
    };
    
    let totalCalls = 0;
    const toolStats = [];
    
    for (const [name, count] of this.callCounts.entries()) {
      totalCalls += count;
      toolStats.push({ name, count });
    }
    
    stats.totalCalls = totalCalls;
    stats.mostUsed = toolStats.sort((a, b) => b.count - a.count).slice(0, 5);
    stats.leastUsed = toolStats.sort((a, b) => a.count - b.count).slice(0, 5);
    
    return stats;
  }

  /**
   * Clear schema cache
   */
  clearCache() {
    this.schemaCache.clear();
    console.log('🗑️  Tool schema cache cleared');
  }

  /**
   * Export registry to JSON
   */
  export() {
    return {
      tools: Array.from(this.tools.keys()),
      schemas: this.getAllSchemas(),
      stats: this.getStats()
    };
  }
}

// ============================================================================
// CORE TOOLS
// ============================================================================

/**
 * Code Review Tool
 */
export class CodeReviewTool {
  constructor() {
    this.name = 'review';
    this.description = 'Review code for quality, security, and performance';
  }

  getSchema() {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        file: { type: 'string', required: true, description: 'File to review' },
        focus: { type: 'array', items: 'string', description: 'Focus areas: security, performance, style' }
      },
      returns: {
        findings: 'array',
        score: 'number'
      }
    };
  }

  async execute(params) {
    const { file, focus = ['security', 'performance'] } = params;
    
    // Implementation would call Aurora review logic
    return {
      findings: [],
      score: 0
    };
  }
}

/**
 * Deep Analysis Tool
 */
export class DeepAnalysisTool {
  constructor() {
    this.name = 'analyze';
    this.description = 'Deep analysis of codebase architecture and patterns';
  }

  getSchema() {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        path: { type: 'string', required: true, description: 'Path to analyze' },
        type: { type: 'string', enum: ['architecture', 'dependencies', 'patterns'], description: 'Analysis type' }
      },
      returns: {
        findings: 'array',
        recommendations: 'array'
      }
    };
  }

  async execute(params) {
    const { path, type } = params;
    
    return {
      findings: [],
      recommendations: []
    };
  }
}

/**
 * Performance Optimization Tool
 */
export class PerformanceOptimizationTool {
  constructor() {
    this.name = 'optimize';
    this.description = 'Optimize code for performance and bundle size';
  }

  getSchema() {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        file: { type: 'string', required: true, description: 'File to optimize' },
        target: { type: 'string', enum: ['bundle', 'memory', 'cpu'], description: 'Optimization target' }
      },
      returns: {
        suggestions: 'array',
        estimatedImprovement: 'string'
      }
    };
  }

  async execute(params) {
    const { file, target } = params;
    
    return {
      suggestions: [],
      estimatedImprovement: '0%'
    };
  }
}

/**
 * Memory Leak Detection Tool
 */
export class MemoryLeakDetectionTool {
  constructor() {
    this.name = 'memory';
    this.description = 'Detect memory leaks and suggest fixes';
  }

  getSchema() {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        scope: { type: 'string', enum: ['current', 'full'], description: 'Scope of analysis' }
      },
      returns: {
        leaks: 'array',
        recommendations: 'array'
      }
    };
  }

  async execute(params) {
    const { scope } = params;
    
    return {
      leaks: [],
      recommendations: []
    };
  }
}

/**
 * Web Research Tool
 */
export class WebResearchTool {
  constructor() {
    this.name = 'research';
    this.description = 'Research on the web for documentation and solutions';
  }

  getSchema() {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        query: { type: 'string', required: true, description: 'Search query' },
        sources: { type: 'array', items: 'string', description: 'Preferred sources' }
      },
      returns: {
        results: 'array',
        summary: 'string'
      }
    };
  }

  async execute(params) {
    const { query, sources } = params;
    
    return {
      results: [],
      summary: ''
    };
  }
}

/**
 * MCP Tool Executor
 */
export class MCPTool {
  constructor() {
    this.name = 'mcp';
    this.description = 'Execute MCP (Model Context Protocol) tools';
  }

  getSchema() {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        server: { type: 'string', required: true, description: 'MCP server name' },
        tool: { type: 'string', required: true, description: 'Tool to execute' },
        args: { type: 'object', description: 'Tool arguments' }
      },
      returns: {
        result: 'any'
      }
    };
  }

  async execute(params) {
    const { server, tool, args } = params;
    
    return { result: null };
  }
}

/**
 * File Read Tool
 */
export class FileReadTool {
  constructor() {
    this.name = 'file_read';
    this.description = 'Read file contents';
  }

  getSchema() {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        path: { type: 'string', required: true, description: 'File path' },
        limit: { type: 'number', description: 'Max lines to read' }
      },
      returns: {
        content: 'string',
        lines: 'number'
      }
    };
  }

  async execute(params) {
    const { path: filePath, limit } = params;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      return {
        content: limit ? lines.slice(0, limit).join('\n') : content,
        lines: lines.length
      };
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }
}

/**
 * File Write Tool
 */
export class FileWriteTool {
  constructor() {
    this.name = 'file_write';
    this.description = 'Write content to file';
  }

  getSchema() {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        path: { type: 'string', required: true, description: 'File path' },
        content: { type: 'string', required: true, description: 'Content to write' }
      },
      returns: {
        success: 'boolean',
        bytes: 'number'
      }
    };
  }

  async execute(params) {
    const { path: filePath, content } = params;
    
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      
      return {
        success: true,
        bytes: Buffer.byteLength(content, 'utf8')
      };
    } catch (error) {
      throw new Error(`Failed to write file: ${error.message}`);
    }
  }
}

/**
 * Git Status Tool
 */
export class GitStatusTool {
  constructor() {
    this.name = 'git_status';
    this.description = 'Get git status of repository';
  }

  getSchema() {
    return {
      name: this.name,
      description: this.description,
      parameters: {},
      returns: {
        modified: 'array',
        added: 'array',
        deleted: 'array'
      }
    };
  }

  async execute(params) {
    const { execSync } = await import('node:child_process');
    
    try {
      const output = execSync('git status --porcelain', { encoding: 'utf8' });
      
      const modified = [];
      const added = [];
      const deleted = [];
      
      for (const line of output.trim().split('\n')) {
        if (!line) continue;
        
        const status = line.substring(0, 2).trim();
        const file = line.substring(3).trim();
        
        if (status.includes('M')) modified.push(file);
        if (status.includes('A')) added.push(file);
        if (status.includes('D')) deleted.push(file);
      }
      
      return { modified, added, deleted };
    } catch (error) {
      return { modified: [], added: [], deleted: [] };
    }
  }
}

/**
 * Task Create Tool
 */
export class TaskCreateTool {
  constructor() {
    this.name = 'task_create';
    this.description = 'Create a new task in TASK_BOARD.md';
  }

  getSchema() {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        title: { type: 'string', required: true, description: 'Task title' },
        type: { type: 'string', enum: ['feat', 'fix', 'docs', 'refactor'], description: 'Task type' },
        priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'], description: 'Priority' }
      },
      returns: {
        taskId: 'string',
        created: 'boolean'
      }
    };
  }

  async execute(params) {
    const { title, type, priority } = params;
    
    // Implementation would add to TASK_BOARD.md
    return {
      taskId: `TSK-${Date.now()}`,
      created: true
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let registryInstance = null;

export function getToolRegistry() {
  if (!registryInstance) {
    registryInstance = new AuroraToolRegistry();
    
    // Register core tools
    registryInstance.register('review', new CodeReviewTool());
    registryInstance.register('analyze', new DeepAnalysisTool());
    registryInstance.register('optimize', new PerformanceOptimizationTool());
    registryInstance.register('memory', new MemoryLeakDetectionTool());
    registryInstance.register('research', new WebResearchTool());
    registryInstance.register('mcp', new MCPTool());
    registryInstance.register('file_read', new FileReadTool());
    registryInstance.register('file_write', new FileWriteTool());
    registryInstance.register('git_status', new GitStatusTool());
    registryInstance.register('task_create', new TaskCreateTool());
    registryInstance.register('bash', new BashTool());
    registryInstance.register('git', new GitTool());
    registryInstance.register('self_correct', new SelfCorrectLoop());
    registryInstance.register('diff', new DiffTool());
    registryInstance.register('search', new SearchTool());
    registryInstance.register('plan', new PlanMode());
    registryInstance.register('resume', new ResumeContext());
    registryInstance.register('prompt_cache', new PromptCache());
    registryInstance.register('ultraplan', new UltraPlan());
    registryInstance.register('bridge', new AuroraBridge());
    registryInstance.register('computer_use', new AuroraComputer());
    registryInstance.register('token_efficient', new TokenEfficientTool());
    registryInstance.register('undercover', new UndercoverMode());
    registryInstance.register('buddy', new AuroraBuddy());
    registryInstance.register('api_test', new ApiTestTool());
    registryInstance.register('db_query', new DbQueryTool());
    registryInstance.register('image', new ImageTool());
    registryInstance.register('zip', new ZipTool());
    registryInstance.register('crypto', new CryptoTool());
    registryInstance.register('webhook', new WebhookTool());
    registryInstance.register('http_server', new HttpServerTool());
    registryInstance.register('dashboard', new DashboardServer());
  }
  
  return registryInstance;
}

// ============================================================================
// CLI MODE
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const registry = getToolRegistry();
  
  if (command === 'list') {
    console.log('🔧 Aurora Tool Registry\n');
    
    for (const [name, tool] of registry.tools.entries()) {
      const schema = registry.getSchema(name);
      console.log(`${name.padEnd(20)} - ${schema.description}`);
    }
    
  } else if (command === 'search') {
    const query = args[1];
    
    if (!query) {
      console.log('Usage: node aurora-tool-registry.mjs search <query>');
      process.exit(1);
    }
    
    const results = registry.search(query);
    
    console.log(`\n🔍 Search results for "${query}":\n`);
    
    for (const result of results) {
      console.log(`${result.name.padEnd(20)} - ${result.schema.description} (${result.callCount} calls)`);
    }
    
  } else if (command === 'stats') {
    const stats = registry.getStats();
    
    console.log('📊 Tool Registry Statistics\n');
    console.log(`Total tools: ${stats.totalTools}`);
    console.log(`Total calls: ${stats.totalCalls}`);
    console.log(`Cache size: ${stats.cacheSize}`);
    
    console.log('\nMost used:');
    for (const tool of stats.mostUsed) {
      console.log(`  ${tool.name}: ${tool.count} calls`);
    }
    
  } else {
    console.log('Aurora Tool Registry\n');
    console.log('Usage:');
    console.log('  node aurora-tool-registry.mjs list     - List all tools');
    console.log('  node aurora-tool-registry.mjs search <query> - Search tools');
    console.log('  node aurora-tool-registry.mjs stats    - Show statistics');
  }
}
