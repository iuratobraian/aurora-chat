#!/usr/bin/env node
/**
 * free-provider-router.mjs - Smart Router for FREE AI Providers
 * 
 * Automatically selects the best free provider for each task
 * with automatic fallback if a provider fails
 * 
 * FREE PROVIDERS:
 * - Gemini (Google) - 2M context, highest quality
 * - Groq - Fastest (0.7s), 70B
 * - NVIDIA/Kimi - Opus-level quality
 * - DeepSeek - Opus-level, free beta
 * - OpenRouter - 50+ models backup
 * - Fireworks - 1M tokens/month
 * - Together AI - $25 credit
 * - Cohere - 100 calls/day
 * - Ollama - Local, unlimited
 */

import axios from 'axios';

// ============================================================================
// FREE PROVIDERS CONFIGURATION
// ============================================================================

export const FREE_PROVIDERS = {
  // TIER 1: BEST QUALITY (Completely free)
  gemini: {
    name: 'Google Gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    models: {
      'gemini-2.5-pro': { context: 2097152, speed: 'medium', quality: 'highest' },
      'gemini-2.0-flash': { context: 1048576, speed: 'fast', quality: 'high' }
    },
    env: 'GEMINI_API_KEY',
    free: true,
    requiresCard: false,
    limits: { rpm: 15, rpd: 1500 }
  },

  // TIER 2: FASTEST
  groq: {
    name: 'Groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    models: {
      'llama-3.3-70b-versatile': { context: 128000, speed: 'fastest', quality: 'high' },
      'mixtral-8x7b': { context: 32000, speed: 'fastest', quality: 'good' }
    },
    env: 'GROQ_API_KEY',
    free: true,
    requiresCard: false,
    limits: { rpm: 30, rpd: 'unlimited' }
  },

  // TIER 3: OPUS-LEVEL QUALITY
  nvidia_kimi: {
    name: 'NVIDIA Kimi',
    endpoint: 'https://integrate.api.nvidia.com/v1/chat/completions',
    models: {
      'moonshotai/kimi-k2-instruct': { context: 128000, speed: 'medium', quality: 'opus-level' }
    },
    env: 'NVIDIA_API_KEY',
    free: true,
    requiresCard: false,
    limits: { rpm: 10, rpd: 500 }
  },

  deepseek: {
    name: 'DeepSeek',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    models: {
      'deepseek-chat-v3': { context: 128000, speed: 'medium', quality: 'opus-level' }
    },
    env: 'DEEPSEEK_API_KEY',
    free: true,
    requiresCard: false,
    limits: { rpm: 10, rpd: 500 }
  },

  // TIER 4: BACKUP (Multiple models)
  openrouter: {
    name: 'OpenRouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    models: {
      'qwen/qwen-2.5-coder-32b-instruct': { context: 32000, speed: 'fast', quality: 'high' }
    },
    env: 'OPENROUTER_API_KEY',
    free: true,
    requiresCard: false,
    limits: { rpm: 20, rpd: 1000 }
  },

  fireworks: {
    name: 'Fireworks AI',
    endpoint: 'https://api.fireworks.ai/inference/v1/chat/completions',
    models: {
      'llama-v3p1-70b-instruct': { context: 128000, speed: 'fast', quality: 'high' }
    },
    env: 'FIREWORKS_API_KEY',
    free: true,
    requiresCard: false,
    limits: { rpm: 60, rpd: '1M tokens/month' }
  },

  together: {
    name: 'Together AI',
    endpoint: 'https://api.together.xyz/v1/chat/completions',
    models: {
      'Qwen/Qwen2.5-Coder-32B-Instruct': { context: 32000, speed: 'fast', quality: 'high' }
    },
    env: 'TOGETHER_API_KEY',
    free: true,
    requiresCard: false,
    limits: { rpm: 20, rpd: '$25 credit' }
  },

  cohere: {
    name: 'Cohere',
    endpoint: 'https://api.cohere.ai/v1/chat',
    models: {
      'command-r-plus': { context: 128000, speed: 'medium', quality: 'high' }
    },
    env: 'COHERE_API_KEY',
    free: true,
    requiresCard: false,
    limits: { rpm: 10, rpd: 100 }
  },

  // TIER 5: LOCAL (Unlimited)
  ollama: {
    name: 'Ollama Local',
    endpoint: 'http://127.0.0.1:11434/api/generate',
    models: {
      'qwen-2.5-7b': { context: 32000, speed: 'fast', quality: 'good', ram: '4GB' },
      'llama-3.2-3b': { context: 128000, speed: 'fastest', quality: 'decent', ram: '2GB' }
    },
    env: 'OLLAMA_BASE_URL',
    free: true,
    requiresCard: false,
    limits: { rpm: 'unlimited', rpd: 'unlimited' }
  }
};

// ============================================================================
// PROVIDER ROUTER CLASS
// ============================================================================

export class FreeProviderRouter {
  constructor(options = {}) {
    this.providers = FREE_PROVIDERS;
    this.apiKeys = this.loadApiKeys();
    this.fallbackChain = options.fallbackChain || ['gemini', 'groq', 'nvidia_kimi', 'deepseek', 'openrouter', 'ollama'];
    this.strategy = options.strategy || 'quality_first'; // quality_first, speed_first, cost_first
    this.cache = new Map();
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      byProvider: {}
    };
  }

  /**
   * Load API keys from environment
   */
  loadApiKeys() {
    return {
      gemini: process.env.GEMINI_API_KEY,
      groq: process.env.GROQ_API_KEY,
      nvidia_kimi: process.env.NVIDIA_API_KEY,
      deepseek: process.env.DEEPSEEK_API_KEY,
      openrouter: process.env.OPENROUTER_API_KEY,
      fireworks: process.env.FIREWORKS_API_KEY,
      together: process.env.TOGETHER_API_KEY,
      cohere: process.env.COHERE_API_KEY,
      ollama: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434'
    };
  }

  /**
   * Select best provider for task
   */
  selectProvider(task) {
    const { complexity, urgency, contextLength, cost } = task;

    // Long context (>100K tokens)
    if (contextLength > 100000) {
      return 'gemini'; // 1M-2M context
    }

    // High complexity reasoning
    if (complexity === 'high') {
      return 'deepseek'; // Opus-level quality
    }

    // Fast response needed
    if (urgency === 'high') {
      return 'groq'; // Fastest (~0.7s)
    }

    // Strategy-based selection
    if (this.strategy === 'quality_first') {
      return 'gemini';
    } else if (this.strategy === 'speed_first') {
      return 'groq';
    } else {
      return 'ollama'; // Local, unlimited
    }
  }

  /**
   * Execute with automatic fallback
   */
  async execute(task) {
    const provider = this.selectProvider(task);
    this.stats.totalRequests++;

    console.log(`\n🤖 Provider Router: Selecting ${provider} for task\n`);

    try {
      const result = await this.callProvider(provider, task);
      this.stats.successfulRequests++;
      this.updateProviderStats(provider, 'success');
      return result;
    } catch (error) {
      console.log(`⚠️  Provider ${provider} failed: ${error.message}`);
      console.log('🔄 Trying fallback chain...\n');

      this.stats.failedRequests++;
      this.updateProviderStats(provider, 'failure');

      // Try fallback chain
      for (const fallback of this.fallbackChain) {
        if (fallback !== provider) {
          try {
            console.log(`   Trying ${fallback}...`);
            const result = await this.callProvider(fallback, task);
            this.stats.successfulRequests++;
            this.updateProviderStats(fallback, 'success');
            console.log(`   ✅ ${fallback} succeeded!\n`);
            return result;
          } catch (e) {
            console.log(`   ❌ ${fallback} failed: ${e.message}`);
            this.updateProviderStats(fallback, 'failure');
          }
        }
      }

      throw new Error('All free providers failed');
    }
  }

  /**
   * Call specific provider
   */
  async callProvider(provider, task) {
    const config = this.providers[provider];
    const apiKey = this.apiKeys[provider];

    if (!apiKey && provider !== 'ollama') {
      throw new Error(`API key not configured for ${provider}`);
    }

    switch (provider) {
      case 'gemini':
        return await this.callGemini(task, apiKey);
      case 'groq':
        return await this.callGroq(task, apiKey);
      case 'nvidia_kimi':
        return await this.callNvidia(task, apiKey);
      case 'deepseek':
        return await this.callDeepSeek(task, apiKey);
      case 'openrouter':
        return await this.callOpenRouter(task, apiKey);
      case 'ollama':
        return await this.callOllama(task);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Call Gemini API
   */
  async callGemini(task, apiKey) {
    const model = task.model || 'gemini-2.0-flash';
    const url = `${this.providers.gemini.endpoint}/${model}:generateContent?key=${apiKey}`;

    const response = await axios.post(url, {
      contents: [{ parts: [{ text: task.prompt }] }],
      generationConfig: {
        maxOutputTokens: task.maxTokens || 8192,
        temperature: task.temperature || 0.7
      }
    });

    return {
      provider: 'gemini',
      content: response.data.candidates[0].content.parts[0].text,
      usage: response.data.usageMetadata
    };
  }

  /**
   * Call Groq API
   */
  async callGroq(task, apiKey) {
    const model = task.model || 'llama-3.3-70b-versatile';

    const response = await axios.post(this.providers.groq.endpoint, {
      model,
      messages: [{ role: 'user', content: task.prompt }],
      max_tokens: task.maxTokens || 8192,
      temperature: task.temperature || 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      provider: 'groq',
      content: response.data.choices[0].message.content,
      usage: response.data.usage
    };
  }

  /**
   * Call NVIDIA Kimi API
   */
  async callNvidia(task, apiKey) {
    const model = task.model || 'moonshotai/kimi-k2-instruct';

    const response = await axios.post(this.providers.nvidia_kimi.endpoint, {
      model,
      messages: [{ role: 'user', content: task.prompt }],
      max_tokens: task.maxTokens || 8192,
      temperature: task.temperature || 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      provider: 'nvidia_kimi',
      content: response.data.choices[0].message.content,
      usage: response.data.usage
    };
  }

  /**
   * Call DeepSeek API
   */
  async callDeepSeek(task, apiKey) {
    const model = task.model || 'deepseek-chat-v3';

    const response = await axios.post(this.providers.deepseek.endpoint, {
      model,
      messages: [{ role: 'user', content: task.prompt }],
      max_tokens: task.maxTokens || 8192,
      temperature: task.temperature || 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      provider: 'deepseek',
      content: response.data.choices[0].message.content,
      usage: response.data.usage
    };
  }

  /**
   * Call OpenRouter API
   */
  async callOpenRouter(task, apiKey) {
    const model = task.model || 'qwen/qwen-2.5-coder-32b-instruct';

    const response = await axios.post(this.providers.openrouter.endpoint, {
      model,
      messages: [{ role: 'user', content: task.prompt }],
      max_tokens: task.maxTokens || 8192,
      temperature: task.temperature || 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/iuratobraian/trade-share',
        'X-Title': 'Aurora AI'
      }
    });

    return {
      provider: 'openrouter',
      content: response.data.choices[0].message.content,
      usage: response.data.usage
    };
  }

  /**
   * Call Ollama Local
   */
  async callOllama(task) {
    const model = task.model || 'qwen-2.5-7b';

    const response = await axios.post(this.providers.ollama.endpoint, {
      model,
      prompt: task.prompt,
      stream: false,
      options: {
        num_predict: task.maxTokens || 8192,
      }
    });

    return {
      provider: 'ollama',
      content: response.data.response,
      usage: { total_tokens: response.data.eval_count || 0 }
    };
  }

  /**
   * Update provider stats
   */
  updateProviderStats(provider, status) {
    if (!this.stats.byProvider[provider]) {
      this.stats.byProvider[provider] = { success: 0, failure: 0 };
    }
    this.stats.byProvider[provider][status]++;
  }

  /**
   * Get router stats
   */
  getStats() {
    return {
      totalRequests: this.stats.totalRequests,
      successRate: `${Math.round((this.stats.successfulRequests / this.stats.totalRequests) * 100)}%`,
      byProvider: this.stats.byProvider,
      fallbackChain: this.fallbackChain,
      strategy: this.strategy
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let routerInstance = null;

export function getFreeProviderRouter(options = {}) {
  if (!routerInstance) {
    routerInstance = new FreeProviderRouter(options);
  }
  return routerInstance;
}

export async function executeWithFreeProvider(task, options = {}) {
  const router = getFreeProviderRouter(options);
  return await router.execute(task);
}

// ============================================================================
// CLI MODE
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🤖 Free Provider Router - Test All Providers\n');

  const router = getFreeProviderRouter();
  const testTask = {
    prompt: 'Say "Hello from [provider name]!" in one sentence.',
    maxTokens: 100,
    temperature: 0.7
  };

  // Test each provider
  for (const provider of router.fallbackChain) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing ${provider}...\n`);

    try {
      const result = await router.callProvider(provider, testTask);
      console.log(`✅ ${provider} SUCCESS`);
      console.log(`   Response: ${result.content.substring(0, 100)}...\n`);
    } catch (error) {
      console.log(`❌ ${provider} FAILED: ${error.message}\n`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Provider Router Stats:');
  console.log(JSON.stringify(router.getStats(), null, 2));
  console.log('\n');
}
