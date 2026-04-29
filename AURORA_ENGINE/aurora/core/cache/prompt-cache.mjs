#!/usr/bin/env node
/**
 * prompt-cache.mjs - Prompt Caching for Token Efficiency
 * 
 * Reduces token usage by:
 * - Caching static prompt sections
 * - Splitting static vs dynamic content
 * - Cache invalidation strategies
 * - Token count tracking
 * 
 * @see docs/CLAUDE_CODE_LEAK_ANALYSIS.md - Prompt Caching Pattern, Token Efficient Tools
 * @see aurora/core/tools/aurora-tool-registry.mjs - Schema caching
 */

import crypto from 'node:crypto';

const PROMPT_CACHE_CONFIG = {
  // Cache TTL (ms)
  defaultTTL: 60 * 60 * 1000, // 1 hour
  
  // Max cache entries
  maxEntries: 100,
  
  // Token reduction target
  targetReduction: 0.5 // 50% reduction
};

export class PromptCache {
  constructor(options = {}) {
    this.config = { ...PROMPT_CACHE_CONFIG, ...options };
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      tokensSaved: 0,
      tokensUsed: 0
    };
  }

  /**
   * Get tool schema
   */
  getSchema() {
    return {
      name: 'prompt_cache',
      description: 'Cache static prompt sections to reduce token usage',
      parameters: {
        operation: {
          type: 'string',
          required: true,
          enum: ['set', 'get', 'invalidate', 'stats', 'clear'],
          description: 'Cache operation'
        },
        key: {
          type: 'string',
          description: 'Cache key'
        },
        value: {
          type: 'string',
          description: 'Value to cache'
        },
        ttl: {
          type: 'number',
          description: 'TTL in ms (default: 1 hour)'
        }
      },
      returns: {
        success: 'boolean',
        value: 'string',
        cached: 'boolean',
        stats: 'object'
      }
    };
  }

  /**
   * Execute cache operation
   */
  async execute(operation, options = {}) {
    switch (operation) {
      case 'set':
        return this.set(options.key, options.value, options.ttl);
      case 'get':
        return this.get(options.key);
      case 'invalidate':
        return this.invalidate(options.key);
      case 'stats':
        return this.getStats();
      case 'clear':
        return this.clear();
      default:
        return { success: false, error: `Unknown operation: ${operation}` };
    }
  }

  /**
   * Set cache value
   */
  set(key, value, ttl = this.config.defaultTTL) {
    if (!key || !value) {
      return { success: false, error: 'Key and value required' };
    }

    const hash = this.hashKey(key);
    const now = Date.now();

    this.cache.set(hash, {
      key,
      value,
      createdAt: now,
      expiresAt: now + ttl,
      accessCount: 0
    });

    // Cleanup if over limit
    if (this.cache.size > this.config.maxEntries) {
      this.cleanup();
    }

    const tokens = this.countTokens(value);
    this.stats.tokensUsed += tokens;

    console.log(`💾 Cached: ${key.substring(0, 50)}...`);
    console.log(`   Tokens: ${tokens}`);
    console.log(`   TTL: ${ttl / 60000} min\n`);

    return {
      success: true,
      key,
      tokens,
      cached: true
    };
  }

  /**
   * Get cached value
   */
  get(key) {
    if (!key) {
      return { success: false, error: 'Key required' };
    }

    const hash = this.hashKey(key);
    const entry = this.cache.get(hash);

    if (!entry) {
      this.stats.misses++;
      return { success: true, cached: false, value: null };
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(hash);
      this.stats.misses++;
      return { success: true, cached: false, value: null };
    }

    // Update access count
    entry.accessCount++;
    this.stats.hits++;

    const tokensSaved = this.countTokens(entry.value);
    this.stats.tokensSaved += tokensSaved;

    console.log(`✅ Cache hit: ${key.substring(0, 50)}...`);
    console.log(`   Tokens saved: ${tokensSaved}\n`);

    return {
      success: true,
      cached: true,
      value: entry.value,
      tokensSaved
    };
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key) {
    if (!key) {
      return { success: false, error: 'Key required' };
    }

    const hash = this.hashKey(key);
    const deleted = this.cache.delete(hash);

    if (deleted) {
      console.log(`🗑️  Invalidated: ${key.substring(0, 50)}...\n`);
    }

    return {
      success: true,
      invalidated: deleted
    };
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const totalTokens = this.stats.tokensUsed + this.stats.tokensSaved;
    const reductionPercent = totalTokens > 0
      ? Math.round((this.stats.tokensSaved / totalTokens) * 100)
      : 0;

    return {
      success: true,
      stats: {
        entries: this.cache.size,
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: `${Math.round((this.stats.hits / (this.stats.hits + this.stats.misses || 1)) * 100)}%`,
        tokensUsed: this.stats.tokensUsed,
        tokensSaved: this.stats.tokensSaved,
        reduction: `${reductionPercent}%`,
        targetReduction: `${Math.round(this.config.targetReduction * 100)}%`
      }
    };
  }

  /**
   * Clear cache
   */
  clear() {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      tokensSaved: 0,
      tokensUsed: 0
    };

    console.log('🧹 Cache cleared\n');

    return {
      success: true,
      cleared: true
    };
  }

  /**
   * Cleanup old entries
   */
  cleanup() {
    const now = Date.now();
    let deleted = 0;

    for (const [hash, entry] of this.cache.entries()) {
      if (now > entry.expiresAt || entry.accessCount === 0) {
        this.cache.delete(hash);
        deleted++;
      }
    }

    // If still over limit, remove least accessed
    if (this.cache.size > this.config.maxEntries) {
      const sorted = Array.from(this.cache.entries())
        .sort((a, b) => a[1].accessCount - b[1].accessCount);

      const toDelete = sorted.slice(0, this.cache.size - this.config.maxEntries);
      for (const [hash] of toDelete) {
        this.cache.delete(hash);
        deleted++;
      }
    }

    if (deleted > 0) {
      console.log(`🧹 Cleaned up ${deleted} old entries\n`);
    }
  }

  /**
   * Hash key for storage
   */
  hashKey(key) {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  /**
   * Count tokens (approximate)
   */
  countTokens(text) {
    if (!text) return 0;
    // Rough estimate: 1 token ≈ 4 characters
    return Math.round(text.length / 4);
  }

  /**
   * Build prompt with caching
   */
  buildPrompt(staticSections, dynamicSections) {
    let prompt = '';
    let tokensSaved = 0;

    // Static sections (cached)
    for (const [key, content] of Object.entries(staticSections)) {
      const cached = this.get(key);
      
      if (cached.cached) {
        prompt += cached.value;
        tokensSaved += this.countTokens(content);
      } else {
        this.set(key, content);
        prompt += content;
      }
    }

    // Dynamic sections (not cached)
    for (const content of Object.values(dynamicSections)) {
      prompt += content;
    }

    return {
      prompt,
      tokensSaved,
      cached: true
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let promptCacheInstance = null;

export function getPromptCache() {
  if (!promptCacheInstance) {
    promptCacheInstance = new PromptCache();
  }
  return promptCacheInstance;
}

export async function executePromptCache(operation, options = {}) {
  const promptCache = getPromptCache();
  return await promptCache.execute(operation, options);
}

// ============================================================================
// CLI MODE
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const operation = args[0];

  if (!operation) {
    console.log('PromptCache - Reduce token usage with caching\n');
    console.log('Usage: node prompt-cache.mjs <operation> [options]');
    console.log('\nOperations:');
    console.log('  set <key> <value>  - Cache value');
    console.log('  get <key>          - Get cached value');
    console.log('  invalidate <key>   - Invalidate cache entry');
    console.log('  stats              - Show cache statistics');
    console.log('  clear              - Clear entire cache\n');
    console.log('Options:');
    console.log('  --ttl <ms>         - TTL in milliseconds\n');
    process.exit(0);
  }

  const promptCache = getPromptCache();
  const options = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--ttl' && args[i + 1]) {
      options.ttl = parseInt(args[++i]);
    } else if (!arg.startsWith('-')) {
      if (!options.key) {
        options.key = arg;
      } else if (options.value === undefined) {
        options.value = args[++i];
      }
    }
  }

  console.log(`💾 PromptCache: ${operation}\n`);

  promptCache.execute(operation, options)
    .then(result => {
      if (result.error) {
        console.error('❌ Error:', result.error);
        process.exit(1);
      }

      if (result.stats) {
        console.log('📊 Cache Statistics:\n');
        console.log(`  Entries: ${result.stats.entries}`);
        console.log(`  Hits: ${result.stats.hits}`);
        console.log(`  Misses: ${result.stats.misses}`);
        console.log(`  Hit Rate: ${result.stats.hitRate}`);
        console.log(`  Tokens Used: ${result.stats.tokensUsed}`);
        console.log(`  Tokens Saved: ${result.stats.tokensSaved}`);
        console.log(`  Reduction: ${result.stats.reduction} (target: ${result.stats.targetReduction})\n`);
      }

      if (result.value !== undefined) {
        console.log('Value:', result.value?.substring(0, 200) || 'null');
        console.log('Cached:', result.cached ? '✅ Yes' : '❌ No');
      }

      if (result.invalidated !== undefined) {
        console.log('Invalidated:', result.invalidated ? '✅ Yes' : '❌ No');
      }

      console.log('\n✅ Success\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    });
}
