#!/usr/bin/env node
/**
 * 🧠 Aurora AI MCP Server
 * 
 * MCP Server unificado para Groq, Kimi (NVIDIA), y OpenRouter
 * 
 * Uso en .mcp.json:
 * {
 *   "mcpServers": {
 *     "aurora-ai": {
 *       "command": "node",
 *       "args": ["scripts/aurora-ai-mcp.mjs"],
 *       "env": {
 *         "GROQ_API_KEY": "gsk_...",
 *         "NVIDIA_API_KEY": "nvapi-...",
 *         "OPENROUTER_API_KEY": "sk-or-..."
 *       }
 *     }
 *   }
 * }
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ToolSchema
} from '@modelcontextprotocol/sdk/types.js';
import { fetch } from 'undici';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const CONFIG = {
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/models',
    models: {
      quality: 'gemini-2.5-pro',
      fast: 'gemini-2.5-flash-lite'
    }
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1/chat/completions',
    models: {
      fast: 'llama-3.1-8b-instant',
      quality: 'llama-3.3-70b-versatile'
    }
  },
  kimi: {
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1/chat/completions',
    models: {
      quality: 'moonshotai/kimi-k2-instruct'
    }
  },
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1/chat/completions',
    models: {
      code: 'qwen/qwen-2.5-coder-32b-instruct',
      quality: 'anthropic/claude-3.5-sonnet'
    }
  }
};

// ============================================================================
// AI PROVIDER FUNCTIONS
// ============================================================================

async function callGroq(prompt, modelType = 'quality', systemPrompt = '') {
  const provider = CONFIG.groq;
  const model = provider.models[modelType];

  if (!provider.apiKey) {
    throw new Error('Groq API key no configurada');
  }

  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });

  const response = await fetch(provider.baseURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 4000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return {
    provider: 'groq',
    model: data.model,
    content: data.choices[0]?.message?.content || '',
    usage: data.usage
  };
}

async function callGemini(prompt, modelType = 'quality', systemPrompt = '') {
  const provider = CONFIG.gemini;
  const model = provider.models[modelType];

  if (!provider.apiKey) {
    throw new Error('Gemini API key no configurada');
  }

  const url = `${provider.baseURL}/${model}:generateContent?key=${provider.apiKey}`;

  const body = {
    contents: [{ role: 'user', parts: [{ text: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt }] }],
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.7,
      topP: 0.95,
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return {
    provider: 'gemini',
    model,
    content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
    usage: data.usageMetadata || {}
  };
}

async function callKimi(prompt, systemPrompt = '') {
  const provider = CONFIG.kimi;
  const model = provider.models.quality;

  if (!provider.apiKey) {
    throw new Error('NVIDIA API key no configurada');
  }

  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });

  const response = await fetch(provider.baseURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`,
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 4000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`NVIDIA API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return {
    provider: 'kimi',
    model: data.model,
    content: data.choices[0]?.message?.content || '',
    usage: data.usage
  };
}

async function callOpenRouter(prompt, modelType = 'code', systemPrompt = '') {
  const provider = CONFIG.openrouter;
  const model = provider.models[modelType];

  if (!provider.apiKey) {
    throw new Error('OpenRouter API key no configurada');
  }

  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });

  const response = await fetch(provider.baseURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`,
      'HTTP-Referer': 'https://tradeportal.io',
      'X-Title': 'Aurora AI MCP'
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 4000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return {
    provider: 'openrouter',
    model: data.model,
    content: data.choices[0]?.message?.content || '',
    usage: data.usage
  };
}

// ============================================================================
// TASK CLASSIFIER
// ============================================================================

const TASK_PATTERNS = {
  codeReview: {
    keywords: ['analiza', 'revisa', 'review', 'bug', 'error', 'mejora', 'refactor'],
    provider: 'kimi',
    reason: '🧠 Code review profundo'
  },
  architecture: {
    keywords: ['arquitectura', 'diseña', 'estructura', 'patrón', 'sistema'],
    provider: 'kimi',
    reason: '🏗️ Arquitectura compleja'
  },
  snippet: {
    keywords: ['genera', 'crea', 'función', 'componente', 'hook'],
    provider: 'groq',
    model: 'quality',
    reason: '🚀 Código rápido'
  },
  debugging: {
    keywords: ['debug', 'depura', 'falla', 'no funciona'],
    provider: 'groq',
    model: 'quality',
    reason: '⚡ Debugging'
  },
  quick: {
    keywords: ['rápido', 'simple'],
    provider: 'groq',
    model: 'fast',
    reason: '⚡ Máxima velocidad'
  }
};

function classifyTask(prompt) {
  const lowerPrompt = prompt.toLowerCase();

  for (const [type, pattern] of Object.entries(TASK_PATTERNS)) {
    if (pattern.keywords.some(kw => lowerPrompt.includes(kw))) {
      return {
        type,
        provider: pattern.provider,
        model: pattern.model || 'quality',
        reason: pattern.reason
      };
    }
  }

  return {
    type: 'general',
    provider: 'groq',
    model: 'fast',
    reason: '⚡ Tarea general'
  };
}

// ============================================================================
// MCP SERVER SETUP
// ============================================================================

const server = new Server(
  {
    name: 'aurora-ai',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'ai_chat',
        description: 'Chat con AI multi-provider (Gemini 2.5 Pro, Groq, Kimi, OpenRouter). Gemini es el provider principal con 2M de contexto.',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Tu pregunta o solicitud'
            },
            provider: {
              type: 'string',
              enum: ['auto', 'gemini', 'groq', 'kimi', 'openrouter'],
              description: 'Proveedor (auto = selección automática, gemini = Gemini 2.5 Pro)'
            },
            model: {
              type: 'string',
              enum: ['fast', 'quality', 'code'],
              description: 'Tipo de modelo (fast=velocidad, quality=calidad, code=código)'
            },
            systemPrompt: {
              type: 'string',
              description: 'System prompt personalizado'
            }
          },
          required: ['prompt']
        }
      },
      {
        name: 'ai_code_review',
        description: 'Code review profundo con Kimi K2 Instruct. Identifica bugs, sugiere mejoras y reescribe código.',
        inputSchema: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: 'Código a revisar'
            },
            language: {
              type: 'string',
              description: 'Lenguaje del código (typescript, javascript, python, etc.)'
            },
            focus: {
              type: 'string',
              description: 'Enfoque específico (security, performance, best-practices)'
            }
          },
          required: ['code']
        }
      },
      {
        name: 'ai_generate_code',
        description: 'Genera código ultra-rápido con Groq Llama 3.3 70B.',
        inputSchema: {
          type: 'object',
          properties: {
            description: {
              type: 'string',
              description: 'Descripción del código a generar'
            },
            language: {
              type: 'string',
              description: 'Lenguaje (typescript, javascript, python, etc.)'
            },
            fast: {
              type: 'boolean',
              description: 'Usar modelo fast (menos preciso pero más rápido)'
            }
          },
          required: ['description']
        }
      },
      {
        name: 'ai_status',
        description: 'Verifica el estado de los providers disponibles',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'ai_chat': {
        const { prompt, provider = 'auto', model = 'quality', systemPrompt = '' } = args;

        if (!prompt) {
          throw new Error('El prompt es requerido');
        }

        let result;
        
        if (provider === 'auto') {
          // Clasificación automática
          const classification = classifyTask(prompt);
          console.error(`[Aurora AI] ${classification.reason} → ${classification.provider}/${classification.model}`);

          switch (classification.provider) {
            case 'gemini':
              result = await callGemini(prompt, classification.model, systemPrompt);
              break;
            case 'groq':
              result = await callGroq(prompt, classification.model, systemPrompt);
              break;
            case 'kimi':
              result = await callKimi(prompt, systemPrompt);
              break;
            case 'openrouter':
              result = await callOpenRouter(prompt, classification.model, systemPrompt);
              break;
            default:
              throw new Error(`Proveedor desconocido: ${classification.provider}`);
          }
        } else {
          // Proveedor forzado
          switch (provider) {
            case 'gemini':
              result = await callGemini(prompt, model, systemPrompt);
              break;
            case 'groq':
              result = await callGroq(prompt, model, systemPrompt);
              break;
            case 'kimi':
              result = await callKimi(prompt, systemPrompt);
              break;
            case 'openrouter':
              result = await callOpenRouter(prompt, model, systemPrompt);
              break;
            default:
              throw new Error(`Proveedor desconocido: ${provider}`);
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: `[${result.provider.toUpperCase()}] ${result.model}\n⚡ Tokens: ${result.usage?.total_tokens || 'N/A'}\n\n${result.content}`
            }
          ]
        };
      }

      case 'ai_code_review': {
        const { code, language = 'typescript', focus = 'general' } = args;

        if (!code) {
          throw new Error('El código es requerido');
        }

        const systemPrompt = `Eres un experto en code review de ${language}. Enfócate en: ${focus}.
Identifica bugs, problemas de seguridad, performance, y sugiere mejoras concretas con código.`;

        const prompt = `Revisa este código ${language}:

\`\`\`${language}
${code}
\`\`\`

Proporciona:
1. Bugs o problemas identificados
2. Mejoras sugeridas
3. Código reescrito con las mejoras aplicadas`;

        const result = await callKimi(prompt, systemPrompt);

        return {
          content: [
            {
              type: 'text',
              text: `🧠 Kimi K2 Code Review\n⚡ Tokens: ${result.usage?.total_tokens || 'N/A'}\n\n${result.content}`
            }
          ]
        };
      }

      case 'ai_generate_code': {
        const { description, language = 'typescript', fast = false } = args;

        if (!description) {
          throw new Error('La descripción es requerida');
        }

        const systemPrompt = `Eres un experto desarrollador de ${language}. Genera código limpio, tipado y siguiendo best practices.`;

        const prompt = `Genera código ${language} para: ${description}

Devuelve solo el código, sin explicaciones.`;

        const result = await callGroq(prompt, fast ? 'fast' : 'quality', systemPrompt);

        return {
          content: [
            {
              type: 'text',
              text: `⚡ Groq ${fast ? 'Fast' : 'Quality'}\n⚡ ${result.usage?.total_tokens || 'N/A'} tokens\n\n${result.content}`
            }
          ]
        };
      }

      case 'ai_status': {
        const status = {
          groq: { available: !!CONFIG.groq.apiKey, models: Object.keys(CONFIG.groq.models) },
          kimi: { available: !!CONFIG.kimi.apiKey, models: Object.keys(CONFIG.kimi.models) },
          openrouter: { available: !!CONFIG.openrouter.apiKey, models: Object.keys(CONFIG.openrouter.models) }
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(status, null, 2)
            }
          ]
        };
      }

      default:
        throw new Error(`Herramienta desconocida: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

// ============================================================================
// START SERVER
// ============================================================================

async function main() {
  console.error('🧠 Aurora AI MCP Server iniciando...');
  console.error('Providers configurados:');
  console.error(`  - Groq: ${CONFIG.groq.apiKey ? '✅' : '❌'}`);
  console.error(`  - Kimi: ${CONFIG.kimi.apiKey ? '✅' : '❌'}`);
  console.error(`  - OpenRouter: ${CONFIG.openrouter.apiKey ? '✅' : '❌'}`);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('✅ Aurora AI MCP Server listo\n');
}

main().catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
