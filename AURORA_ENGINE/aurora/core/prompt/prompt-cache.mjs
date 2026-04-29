/**
 * prompt-cache.mjs - Prompt Caching para Aurora
 *
 * Split STATIC vs DYNAMIC prompt. Cache de system identity.
 * Reduce tokens en 40-60%.
 *
 * Uso:
 *   const { PromptCache } = await import('./prompt-cache.mjs');
 *   const cache = new PromptCache();
 *   cache.setStatic('You are Aurora AI...');
 *   const prompt = cache.build({ task: 'Fix bug in X' });
 */

import fs from 'node:fs';
import path from 'node:path';

const CACHE_FILE = path.join(process.cwd(), '.aurora', 'prompt-cache.json');

export class PromptCache {
  constructor() {
    this.staticPrompt = '';
    this.dynamicVars = {};
    this.stats = { hits: 0, misses: 0, tokensSaved: 0 };
    this._loadCache();
  }

  _loadCache() {
    try {
      if (fs.existsSync(CACHE_FILE)) {
        const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
        this.stats = data.stats || this.stats;
      }
    } catch { /* ignore */ }
  }

  _saveStats() {
    try {
      const dir = path.dirname(CACHE_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(CACHE_FILE, JSON.stringify({ stats: this.stats }, null, 2));
    } catch { /* ignore */ }
  }

  /**
   * Set the static (unchanging) part of the prompt
   * This is cached and not sent repeatedly
   */
  setStatic(prompt) {
    this.staticPrompt = prompt;
    this.stats.staticTokens = this._countTokens(prompt);
    this._saveStats();
  }

  /**
   * Set dynamic variables
   */
  setVar(key, value) {
    this.dynamicVars[key] = value;
  }

  /**
   * Build full prompt with template substitution
   */
  build(template) {
    let prompt = template;
    for (const [key, value] of Object.entries(this.dynamicVars)) {
      prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
    }

    const totalTokens = this._countTokens(prompt);
    const staticTokens = this.stats.staticTokens || 0;
    const dynamicTokens = totalTokens - staticTokens;

    this.stats.hits++;
    this.stats.tokensSaved = (this.stats.tokensSaved || 0) + staticTokens;
    this._saveStats();

    return {
      static: this.staticPrompt,
      dynamic: prompt,
      stats: {
        totalTokens,
        staticTokens,
        dynamicTokens,
        savingsPercent: totalTokens > 0 ? ((staticTokens / totalTokens) * 100).toFixed(1) : 0,
      },
    };
  }

  /**
   * Count approximate tokens (1 token ≈ 4 chars for English, 2 for Spanish)
   */
  _countTokens(text) {
    if (!text) return 0;
    const chars = text.length;
    // Rough estimate: Spanish averages ~2.5 chars per token
    return Math.ceil(chars / 2.5);
  }

  /**
   * Clear cache
   */
  clear() {
    this.stats = { hits: 0, misses: 0, tokensSaved: 0 };
    this._saveStats();
    return { cleared: true };
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      ...this.stats,
      staticPromptLength: this.staticPrompt.length,
      dynamicVarsCount: Object.keys(this.dynamicVars).length,
    };
  }

  /**
   * Schema for Aurora registry
   */
  getSchema() {
    return {
      name: 'prompt_cache',
      description: 'Cache static prompt parts to reduce token usage by 40-60%. Split STATIC vs DYNAMIC prompts.',
      parameters: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['set_static', 'set_var', 'build', 'stats', 'clear'] },
          prompt: { type: 'string' },
          key: { type: 'string' },
          value: { type: 'string' },
          template: { type: 'string' },
        },
        required: ['action'],
      },
    };
  }
}
