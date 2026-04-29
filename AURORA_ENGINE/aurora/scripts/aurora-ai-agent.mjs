#!/usr/bin/env node
/**
 * 🧠 AURORA AI AGENT - Multi-Provider Orchestrator
 * 
 * Selecciona automáticamente el mejor modelo según la tarea:
 * - Groq (Llama 3.3 70B): Tareas rápidas, snippets, debugging
 * - Kimi K2 Instruct: Code review, arquitectura, análisis profundo
 * - OpenRouter (Qwen2.5): Backup económico
 * - Ollama (qwen2.5-coder): Offline/local
 * 
 * Uso:
 *   node aurora-ai-agent.mjs                    # Interactive
 *   node aurora-ai-agent.mjs "tu pregunta"      # Single query
 *   node aurora-ai-agent.mjs --status           # Ver estado
 *   node aurora-ai-agent.mjs --model groq       # Forzar modelo
 */

import { fetch } from 'undici';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { loadENV } from './load-aurora-env.mjs';

// Cargar variables de entorno desde .env.nvidia
loadENV();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

// ============================================================================
// CONFIGURACIÓN DE PROVIDERS
// ============================================================================

const PROVIDERS = {
  gemini: {
    name: 'Gemini 2.5 Pro (Google AI Studio)',
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/models',
    models: {
      quality: 'gemini-2.5-pro',          // 🧠 2M contexto, máxima calidad
      fast: 'gemini-2.5-flash-lite'       // ⚡ Rápido y potente
    },
    color: '\x1b[34m', // Blue
    priority: 1,
    costPer1k: 0.0000, // Free tier generoso
    isGemini: true
  },
  groq: {
    name: 'Groq',
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1/chat/completions',
    models: {
      fast: 'llama-3.1-8b-instant',      // ⚡ 1.3s, barato
      quality: 'llama-3.3-70b-versatile'  // 🚀 0.7s, mejor calidad
    },
    color: '\x1b[32m', // Green
    priority: 2,
    costPer1k: 0.0004
  },
  kimi: {
    name: 'Kimi K2 (NVIDIA)',
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1/chat/completions',
    models: {
      quality: 'moonshotai/kimi-k2-instruct'  // 🧠 3-5s, mejor análisis
    },
    color: '\x1b[35m', // Magenta
    priority: 3,
    costPer1k: 0.0005
  },
  glm: {
    name: 'GLM-4 (NVIDIA)',
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1/chat/completions',
    models: {
      quality: 'thudm/chatglm3-6b'  // 🎯 GLM disponible, gratuito
    },
    color: '\x1b[34m', // Blue
    priority: 4,
    costPer1k: 0.0000  // ¡GRATIS!
  },
  claude: {
    name: 'Claude 3.5 Sonnet',
    apiKey: process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN,
    baseURL: 'https://api.anthropic.com/v1/messages',
    models: {
      quality: 'claude-3-5-sonnet-20241022'  // ⭐ Premium máximo
    },
    color: '\x1b[33m', // Orange
    priority: 5,
    costPer1k: 0.003
  },
  deepseek: {
    name: 'DeepSeek V3',
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com/chat/completions',
    models: {
      quality: 'deepseek-chat'  // 💎 Excelente código, barato
    },
    color: '\x1b[36m', // Cyan
    priority: 6,
    costPer1k: 0.00027
  },
  openrouter: {
    name: 'OpenRouter',
    apiKey: process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1/chat/completions',
    models: {
      free: 'qwen/qwen-2.5-coder-32b-instruct',  // 💰 Económico
      quality: 'anthropic/claude-3.5-sonnet'     // ⭐ Premium (sin créditos)
    },
    color: '\x1b[96m', // Light Cyan
    priority: 7,
    costPer1k: 0.0002
  },
  ollama: {
    name: 'Ollama (Local)',
    apiKey: null,
    baseURL: 'http://localhost:11434/api/generate',
    models: {
      local: 'qwen2.5-coder:latest'  // 🔒 Offline
    },
    color: '\x1b[33m', // Yellow
    priority: 8,
    costPer1k: 0.0000  // Free local
  }
};

// ============================================================================
// TASK CLASSIFIER - Detecta el tipo de tarea y selecciona el mejor modelo
// ============================================================================

const TASK_PATTERNS = {
  codeReview: {
    keywords: ['analiza', 'revisa', 'code review', 'bug', 'error', 'problema', 'mejora', 'refactor', 'optimiza'],
    provider: 'gemini',
    model: 'quality',
    reason: '🧠 Code review profundo (Gemini 2.5 Pro)',
    subagents: ['security-audit', 'performance-analyzer']
  },
  architecture: {
    keywords: ['arquitectura', 'diseña', 'estructura', 'patrón', 'sistema', 'mejor práctica'],
    provider: 'gemini',
    model: 'quality',
    reason: '🏗️ Arquitectura compleja (Gemini 2M contexto)',
    subagents: ['system-designer', 'pattern-expert']
  },
  security: {
    keywords: ['seguridad', 'vulnerabilidad', 'xss', 'csrf', 'inyección', 'auth'],
    provider: 'gemini',
    model: 'quality',
    reason: '🔒 Análisis de seguridad (Gemini 2.5 Pro)',
    subagents: ['security-audit', 'penetration-tester']
  },
  snippet: {
    keywords: ['genera', 'crea', 'función', 'componente', 'hook', 'clase'],
    provider: 'gemini',
    model: 'fast',
    reason: '🚀 Código rápido (Gemini Flash Lite)',
    subagents: []
  },
  debugging: {
    keywords: ['debug', 'depura', 'por qué falla', 'error', 'no funciona'],
    provider: 'groq',
    model: 'quality',
    reason: '⚡ Debugging ultra-rápido',
    subagents: ['bug-hunter']
  },
  explanation: {
    keywords: ['explica', 'qué hace', 'cómo funciona', 'documenta'],
    provider: 'gemini',
    model: 'quality',
    reason: '💎 Explicación detallada (Gemini 2.5 Pro)',
    subagents: []
  },
  learning: {
    keywords: ['enséñame', 'tutorial', 'guía', 'aprende', 'curso'],
    provider: 'gemini',
    model: 'quality',
    reason: '📚 Explicación didáctica (Gemini 2.5 Pro)',
    subagents: ['tutor']
  },
  quick: {
    keywords: ['rápido', 'simple', 'básico'],
    provider: 'groq',
    model: 'fast',
    reason: '⚡ Máxima velocidad',
    subagents: []
  },
  free: {
    keywords: ['gratis', 'free', 'sin costo'],
    provider: 'glm',
    model: 'quality',
    reason: '💎 Modelo gratuito',
    subagents: []
  },
  premium: {
    keywords: ['premium', 'máxima calidad', 'producción'],
    provider: 'claude',
    model: 'quality',
    reason: '⭐ Calidad máxima (Claude 3.5)',
    subagents: ['senior-reviewer']
  }
};

// Subagentes especializados
const SUBAGENTS = {
  'security-audit': {
    name: 'Security Auditor',
    description: 'Auditoría de seguridad y vulnerabilidades',
    prompt: 'Eres un experto en seguridad de aplicaciones. Identifica vulnerabilidades OWASP, problemas de autenticación, XSS, CSRF, inyecciones, y sugiere mitigaciones.'
  },
  'performance-analyzer': {
    name: 'Performance Analyzer',
    description: 'Análisis y optimización de performance',
    prompt: 'Eres un experto en optimización. Identifica bottlenecks, sugiere mejoras de performance, caching, lazy loading, y optimización de queries.'
  },
  'system-designer': {
    name: 'System Designer',
    description: 'Diseño de sistemas y arquitectura',
    prompt: 'Eres un arquitecto de software senior. Diseña sistemas escalables, define patrones arquitectónicos, y establece mejores prácticas.'
  },
  'pattern-expert': {
    name: 'Pattern Expert',
    description: 'Experto en patrones de diseño',
    prompt: 'Eres un experto en patrones de diseño (GoF, arquitectónicos, de integración). Sugiere el patrón más adecuado para cada caso.'
  },
  'bug-hunter': {
    name: 'Bug Hunter',
    description: 'Cazador de bugs especializado',
    prompt: 'Eres un experto en debugging. Encuentra la raíz del problema, identifica edge cases, y propone soluciones definitivas.'
  },
  'tutor': {
    name: 'Technical Tutor',
    description: 'Tutor para aprendizaje',
    prompt: 'Eres un tutor paciente y didáctico. Explica conceptos complejos de forma simple, con ejemplos prácticos y analogías.'
  },
  'senior-reviewer': {
    name: 'Senior Code Reviewer',
    description: 'Review de código nivel senior',
    prompt: 'Eres un desarrollador senior con 10+ años de experiencia. Revisa código buscando calidad, mantenibilidad, y adherence a best practices.'
  },
  'test-generator': {
    name: 'Test Generator',
    description: 'Generación de tests automáticos',
    prompt: 'Eres un experto en testing. Genera tests unitarios, de integración y E2E con cobertura completa.'
  }
};

function classifyTask(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  for (const [type, pattern] of Object.entries(TASK_PATTERNS)) {
    if (pattern.keywords.some(kw => lowerPrompt.includes(kw))) {
      return {
        type,
        provider: pattern.provider,
        model: pattern.model,
        reason: pattern.reason
      };
    }
  }
  
  // Default: Groq fast para tareas generales
  return {
    type: 'general',
    provider: 'groq',
    model: 'fast',
    reason: '⚡ Tarea general'
  };
}

// ============================================================================
// AI PROVIDER FUNCTIONS
// ============================================================================

async function callGroq(prompt, modelType = 'quality', systemPrompt = '') {
  const provider = PROVIDERS.groq;
  const model = provider.models[modelType];
  
  if (!provider.apiKey) {
    throw new Error('Groq API key no configurada. Agrega GROQ_API_KEY a .env.nvidia');
  }
  
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
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
  const provider = PROVIDERS.gemini;
  const model = provider.models[modelType];

  if (!provider.apiKey) {
    throw new Error('Gemini API key no configurada. Agrega GEMINI_API_KEY a .env.aurora');
  }

  const systemInstruction = systemPrompt
    ? { role: 'user', parts: [{ text: systemPrompt }] }
    : null;

  const url = `${provider.baseURL}/${model}:generateContent?key=${provider.apiKey}`;

  const body = {
    contents: [
      ...(systemInstruction ? [{ role: 'user', parts: [{ text: systemPrompt + '\n\n' + prompt }] }] : [{ role: 'user', parts: [{ text: prompt }] }]),
    ],
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

async function callKimi(prompt, modelType = 'quality', systemPrompt = '') {
  const provider = PROVIDERS.kimi;
  const model = provider.models[modelType];
  
  if (!provider.apiKey) {
    throw new Error('NVIDIA API key no configurada. Agrega NVIDIA_API_KEY a .env.nvidia');
  }
  
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
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

async function callGLM(prompt, systemPrompt = '') {
  const provider = PROVIDERS.glm;
  const model = provider.models.quality;
  
  if (!provider.apiKey) {
    throw new Error('NVIDIA API key no configurada para GLM-4.7');
  }
  
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
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
    throw new Error(`NVIDIA GLM API error (${response.status}): ${error}`);
  }
  
  const data = await response.json();
  return {
    provider: 'glm',
    model: data.model,
    content: data.choices[0]?.message?.content || '',
    usage: data.usage
  };
}

async function callClaude(prompt, systemPrompt = '') {
  const provider = PROVIDERS.claude;
  const model = provider.models.quality;
  
  if (!provider.apiKey) {
    throw new Error('Anthropic API key no configurada');
  }
  
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });
  
  const response = await fetch(provider.baseURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': provider.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      messages
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${error}`);
  }
  
  const data = await response.json();
  return {
    provider: 'claude',
    model: data.model || model,
    content: data.content?.[0]?.text || '',
    usage: data.usage
  };
}

async function callDeepSeek(prompt, systemPrompt = '') {
  const provider = PROVIDERS.deepseek;
  const model = provider.models.quality;
  
  if (!provider.apiKey) {
    throw new Error('DeepSeek API key no configurada');
  }
  
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
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
    throw new Error(`DeepSeek API error (${response.status}): ${error}`);
  }
  
  const data = await response.json();
  return {
    provider: 'deepseek',
    model: data.model,
    content: data.choices[0]?.message?.content || '',
    usage: data.usage
  };
}

async function callOpenRouter(prompt, modelType = 'free', systemPrompt = '') {
  const provider = PROVIDERS.openrouter;
  const model = provider.models[modelType];
  
  if (!provider.apiKey) {
    throw new Error('OpenRouter API key no configurada');
  }
  
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });
  
  const response = await fetch(provider.baseURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`,
      'HTTP-Referer': 'https://tradeportal.io',
      'X-Title': 'Aurora AI Agent'
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

async function callOllama(prompt, systemPrompt = '') {
  const provider = PROVIDERS.ollama;
  const model = provider.models.local;
  
  const requestBody = {
    model,
    prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
    stream: false
  };
  
  const response = await fetch(provider.baseURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama API error (${response.status}): ${error}`);
  }
  
  const data = await response.json();
  return {
    provider: 'ollama',
    model: data.model || model,
    content: data.response || '',
    usage: { total_tokens: 0 } // Ollama no reporta tokens
  };
}

// ============================================================================
// MAIN ORCHESTRATOR
// ============================================================================

class AuroraAIAgent {
  constructor() {
    this.conversationHistory = [];
    this.systemPrompt = this.buildSystemPrompt();
  }
  
  buildSystemPrompt() {
    return `Eres Aurora AI Agent - Asistente de código experto para TradeShare 2025.

STACK TÉCNICO:
- Frontend: React 18 + TypeScript + Vite + TailwindCSS
- Backend: Convex (real-time database)
- PWA con service workers
- Glassmorphism UI

CAPACIDADES:
1. Generación de código TypeScript/React limpio y tipado
2. Code review con identificación de bugs y mejoras
3. Refactoring siguiendo best practices
4. Debugging y resolución de errores
5. Explicaciones claras y didácticas

CONVENCIONES:
- Usa ES Modules (import/export)
- Tipado TypeScript explícito (evita 'any')
- Tailwind CSS para estilos
- Componentes funcionales con hooks
- Imports absolutos desde src/

Cuando escribas código:
- Sé conciso pero completo
- Incluye comentarios solo cuando sea necesario
- Sigue principios SOLID
- Prioriza legibilidad`;
  }
  
  async chat(prompt, options = {}) {
    const {
      forceProvider = null,
      forceModel = null,
      useSystemPrompt = true
    } = options;
    
    const startTime = Date.now();
    
    // Clasificar tarea si no hay proveedor forzado
    const classification = forceProvider 
      ? { provider: forceProvider, model: forceModel || 'quality', reason: '🎯 Forzado por usuario', type: 'forced' }
      : classifyTask(prompt);
    
    console.log(`\n\x1b[90m[AI Agent] ${classification.reason}\x1b[0m`);
    console.log(`\x1b[90m[Task Type] ${classification.type}\x1b[0m`);
    
    // Seleccionar provider
    const providerName = classification.provider;
    const modelType = classification.model;
    
    try {
      let result;
      const systemPrompt = useSystemPrompt ? this.systemPrompt : '';
      
      switch (providerName) {
        case 'gemini':
          result = await callGemini(prompt, modelType, systemPrompt);
          break;
        case 'groq':
          result = await callGroq(prompt, modelType, systemPrompt);
          break;
        case 'kimi':
          result = await callKimi(prompt, modelType, systemPrompt);
          break;
        case 'glm':
          result = await callGLM(prompt, systemPrompt);
          break;
        case 'claude':
          result = await callClaude(prompt, systemPrompt);
          break;
        case 'deepseek':
          result = await callDeepSeek(prompt, systemPrompt);
          break;
        case 'openrouter':
          result = await callOpenRouter(prompt, modelType, systemPrompt);
          break;
        case 'ollama':
          result = await callOllama(prompt, systemPrompt);
          break;
        default:
          throw new Error(`Proveedor desconocido: ${providerName}`);
      }

      // Ejecutar subagentes si están definidos
      const subagentNames = classification.subagents || [];
      let subagentResults = [];

      if (subagentNames.length > 0) {
        console.log(`\x1b[90m[Subagents] Activando ${subagentNames.length} subagente(s)...\x1b[0m`);

        for (const subagentName of subagentNames) {
          const subagent = SUBAGENTS[subagentName];
          if (subagent) {
            console.log(`\x1b[90m  → ${subagent.name}\x1b[0m`);

            // Ejecutar subagente con el mismo provider principal
            let subagentResult;
            switch (providerName) {
              case 'gemini':
                subagentResult = await callGemini(`${subagent.prompt}\n\nAnaliza: ${prompt}`, modelType, '');
                break;
              case 'groq':
                subagentResult = await callGroq(`${subagent.prompt}\n\nAnaliza: ${prompt}`, modelType, '');
                break;
              case 'kimi':
                subagentResult = await callKimi(`${subagent.prompt}\n\nAnaliza: ${prompt}`, modelType, '');
                break;
              case 'glm':
                subagentResult = await callGLM(`${subagent.prompt}\n\nAnaliza: ${prompt}`, '');
                break;
              default:
                subagentResult = await callGemini(`${subagent.prompt}\n\nAnaliza: ${prompt}`, 'quality', '');
            }
            
            subagentResults.push({
              name: subagent.name,
              result: subagentResult.content
            });
          }
        }
      }
      
      const latency = Date.now() - startTime;
      
      // Calcular costo estimado
      const tokens = result.usage?.total_tokens || 0;
      const providerCost = PROVIDERS[result.provider]?.costPer1k || 0;
      const estimatedCost = (tokens / 1000) * providerCost;
      
      // Guardar en historial
      this.conversationHistory.push({
        role: 'user',
        content: prompt,
        timestamp: new Date().toISOString()
      });
      this.conversationHistory.push({
        role: 'assistant',
        content: result.content,
        provider: result.provider,
        model: result.model,
        subagents: subagentResults,
        timestamp: new Date().toISOString()
      });
      
      // Limitar historial a últimos 10 mensajes
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }
      
      return {
        success: true,
        provider: result.provider,
        model: result.model,
        content: result.content,
        latency,
        usage: result.usage,
        subagents: subagentResults,
        cost: estimatedCost
      };
      
    } catch (error) {
      // Fallback automático al siguiente provider disponible
      console.log(`\x1b[31m[Error] ${error.message}\x1b[0m`);
      console.log('\x1b[90m[Try fallback...]\x1b[0m');
      
      const fallbackOrder = ['groq', 'kimi', 'openrouter', 'ollama'];
      const currentIndex = fallbackOrder.indexOf(providerName);
      
      for (let i = currentIndex + 1; i < fallbackOrder.length; i++) {
        const fallbackProvider = fallbackOrder[i];
        try {
          console.log(`\x1b[90mTrying fallback: ${fallbackProvider}...\x1b[0m`);
          
          let fallbackResult;
          switch (fallbackProvider) {
            case 'groq':
              fallbackResult = await callGroq(prompt, 'quality', systemPrompt);
              break;
            case 'kimi':
              fallbackResult = await callKimi(prompt, 'quality', systemPrompt);
              break;
            case 'openrouter':
              fallbackResult = await callOpenRouter(prompt, 'free', systemPrompt);
              break;
            case 'ollama':
              fallbackResult = await callOllama(prompt, systemPrompt);
              break;
          }
          
          const latency = Date.now() - startTime;
          
          return {
            success: true,
            provider: fallbackProvider,
            model: fallbackResult.model,
            content: fallbackResult.content,
            latency,
            usage: fallbackResult.usage,
            fallback: true
          };
          
        } catch (fallbackError) {
          continue;
        }
      }
      
      return {
        success: false,
        error: `Todos los providers fallaron. Último error: ${error.message}`
      };
    }
  }
  
  async readFile(filePath) {
    try {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(PROJECT_ROOT, filePath);
      const content = await readFile(fullPath, 'utf8');
      return { success: true, content, path: fullPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  getStatus() {
    return {
      providers: Object.entries(PROVIDERS).map(([key, provider]) => ({
        id: key,
        name: provider.name,
        available: !!provider.apiKey || key === 'ollama',
        models: Object.keys(provider.models)
      })),
      conversationLength: this.conversationHistory.length,
      projectRoot: PROJECT_ROOT
    };
  }
  
  clearHistory() {
    this.conversationHistory = [];
    return { success: true, message: 'Historial limpiado' };
  }
}

// ============================================================================
// INTERACTIVE MODE
// ============================================================================

async function runInteractive() {
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });
  
  const agent = new AuroraAIAgent();
  
  console.log('\n\x1b[36m╔══════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[36m║     🧠 AURORA AI AGENT - Multi-Provider       ║\x1b[0m');
  console.log('\x1b[36m╚══════════════════════════════════════════════╝\x1b[0m');
  console.log('\nEstado:', agent.getStatus().providers.filter(p => p.available).length, '/', agent.getStatus().providers.length, 'providers disponibles');
  console.log('\n\x1b[90mProviders:\x1b[0m');
  agent.getStatus().providers.forEach(p => {
    const status = p.available ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';
    console.log(`  ${status} ${p.name} (${p.models.join(', ')})`);
  });
  
  console.log('\n\x1b[90mComandos:\x1b[0m');
  console.log('  /status     - Ver estado de providers');
  console.log('  /model      - Forzar modelo (groq|kimi|openrouter|ollama)');
  console.log('  /clear      - Limpiar historial');
  console.log('  /read       - Leer archivo');
  console.log('  /help       - Mostrar ayuda');
  console.log('  /exit       - Salir');
  console.log('\n\x1b[90mEjemplos:\x1b[0m');
  console.log('  "Genera un hook useFetch con retry"');
  console.log('  "Analiza este código y busca bugs: ..."');
  console.log('  "Explica cómo funciona useEffect"');
  console.log('\n\x1b[32m══════════════════════════════════════════════\x1b[0m\n');
  
  const prompt = (query) => new Promise((resolve) => rl.question(query, resolve));
  
  let forcedProvider = null;
  
  while (true) {
    const input = await prompt('\x1b[36m🧠 Aurora > \x1b[0m');
    const trimmed = input.trim();
    
    if (!trimmed) continue;
    
    if (trimmed === '/exit' || trimmed === '/quit') {
      console.log('\n\x1b[36m👋 ¡Hasta luego! Aurora AI Agent apagándose...\x1b[0m\n');
      rl.close();
      process.exit(0);
    }
    
    if (trimmed === '/status') {
      console.log('\n\x1b[36m[Estado de Providers]\x1b[0m');
      console.log(JSON.stringify(agent.getStatus(), null, 2));
      continue;
    }
    
    if (trimmed === '/clear') {
      const result = agent.clearHistory();
      console.log('\n\x1b[32m[OK]\x1b[0m', result.message);
      continue;
    }
    
    if (trimmed === '/help') {
      console.log('\n\x1b[36m[Comandos Disponibles]\x1b[0m');
      console.log('  /status     - Ver estado de providers');
      console.log('  /model      - Forzar modelo (groq|kimi|openrouter|ollama)');
      console.log('  /clear      - Limpiar historial');
      console.log('  /read       - Leer archivo');
      console.log('  /exit       - Salir');
      continue;
    }
    
    if (trimmed.startsWith('/model ')) {
      forcedProvider = trimmed.replace('/model ', '').trim();
      if (forcedProvider && !Object.keys(PROVIDERS).includes(forcedProvider)) {
        console.log(`\x1b[31m[Error] Provider "${forcedProvider}" no existe. Usa: groq, kimi, openrouter, ollama\x1b[0m`);
        forcedProvider = null;
      } else {
        console.log(`\x1b[32m[OK] Modelo forzado: ${forcedProvider || 'auto (selección automática)'}\x1b[0m`);
      }
      continue;
    }
    
    if (trimmed.startsWith('/read ')) {
      const filePath = trimmed.replace('/read ', '').trim();
      const result = await agent.readFile(filePath);
      if (result.success) {
        console.log('\n\x1b[36m[Archivo: ' + result.path + ']\x1b[0m');
        console.log(result.content.substring(0, 2000) + (result.content.length > 2000 ? '\n... (truncado)' : ''));
      } else {
        console.log(`\x1b[31m[Error] ${result.error}\x1b[0m`);
      }
      continue;
    }
    
    console.log('\x1b[90m[Pensando...]\x1b[0m\n');
    
    const result = await agent.chat(trimmed, { forceProvider: forcedProvider });
    
    if (result.success) {
      const providerColor = PROVIDERS[result.provider]?.color || '\x1b[0m';
      console.log(`\n${providerColor}══════════════════════════════════════════════\x1b[0m`);
      console.log(`${providerColor}[${result.provider.toUpperCase()}] ${result.model}\x1b[0m`);
      console.log(`${providerColor}⚡ ${result.latency}ms | Tokens: ${result.usage?.total_tokens || 'N/A'}\x1b[0m`);
      
      // Mostrar costo estimado
      if (result.cost > 0) {
        console.log(`${providerColor}💰 Costo: $${result.cost.toFixed(6)} USD\x1b[0m`);
      } else {
        console.log(`${providerColor}🆓 ¡GRATIS!\x1b[0m`);
      }
      
      // Mostrar subagentes
      if (result.subagents && result.subagents.length > 0) {
        console.log(`${providerColor}🤖 Subagents: ${result.subagents.map(s => s.name).join(', ')}\x1b[0m`);
      }
      
      if (result.fallback) {
        console.log(`\x1b[33m⚠️ Fallback usado (provider original falló)\x1b[0m`);
      }
      console.log(`${providerColor}══════════════════════════════════════════════\x1b[0m\n`);
      
      // Mostrar resultado principal
      console.log(result.content);
      
      // Mostrar resultados de subagentes si existen
      if (result.subagents && result.subagents.length > 0) {
        console.log(`\n\x1b[36m══════════════════════════════════════════════\x1b[0m`);
        console.log(`\x1b[36m[SUBAGENTS RESULTS]\x1b[0m`);
        console.log(`\x1b[36m══════════════════════════════════════════════\x1b[0m\n`);
        
        for (const subagent of result.subagents) {
          console.log(`\x1b[33m[${subagent.name}]\x1b[0m`);
          console.log(subagent.result);
          console.log('');
        }
      }
      
      console.log('');
    } else {
      console.log('\x1b[31m[Error]\x1b[0m', result.error);
    }
  }
}

// ============================================================================
// CLI MODE
// ============================================================================

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(`
\x1b[36m╔══════════════════════════════════════════════╗\x1b[0m
\x1b[36m║     🧠 AURORA AI AGENT - Multi-Provider       ║\x1b[0m
\x1b[36m╚══════════════════════════════════════════════╝\x1b[0m

Uso:
  node aurora-ai-agent.mjs                    # Modo interactivo
  node aurora-ai-agent.mjs "tu pregunta"     # Pregunta única
  node aurora-ai-agent.mjs --status          # Ver estado
  node aurora-ai-agent.mjs --model groq      # Forzar modelo

Providers disponibles:
  - Groq (Llama 3.3 70B)     ⚡ Ultra-rápido (700ms)
  - Kimi K2 (NVIDIA)         🧠 Mejor análisis (3-5s)
  - GLM-4.7 (NVIDIA)         💎 ¡GRATIS! Excelente
  - Claude 3.5 Sonnet        ⭐ Premium máximo
  - DeepSeek V3              💎 Excelente código
  - OpenRouter (Qwen2.5)     💰 Económico
  - Ollama (qwen2.5-coder)   🔒 Offline

Selección automática:
  - Code review, arquitectura → Kimi K2
  - Seguridad, auditoría      → Kimi K2 + subagents
  - Snippets, debugging       → Groq Llama 3.3
  - Explicaciones, tutoriales → GLM-4.7 (¡GRATIS!)
  - Premium, producción       → Claude 3.5
  - Offline                   → Ollama

Subagents especializados:
  - security-audit           → Auditoría de seguridad
  - performance-analyzer     → Optimización
  - system-designer          → Arquitectura
  - bug-hunter               → Debugging profundo
  - tutor                    → Explicaciones didácticas

Configuración:
  Agrega a .env.nvidia:
  GROQ_API_KEY=gsk_...
  NVIDIA_API_KEY=nvapi-...
  ANTHROPIC_API_KEY=sk-ant-...
  DEEPSEEK_API_KEY=sk_...
  OPENROUTER_API_KEY=sk-or-...
`);
  process.exit(0);
}

if (args[0] === '--status') {
  const agent = new AuroraAIAgent();
  console.log(JSON.stringify(agent.getStatus(), null, 2));
  process.exit(0);
}

if (args[0] === '--model' && args[1]) {
  const forcedProvider = args[1];
  const prompt = args.slice(2).join(' ');
  
  if (!prompt) {
    console.error('\x1b[31m[Error] Debes proporcionar un prompt después de --model\x1b[0m');
    process.exit(1);
  }
  
  const agent = new AuroraAIAgent();
  console.log(`\x1b[90m[Forzando provider: ${forcedProvider}]\x1b[0m\n`);
  
  agent.chat(prompt, { forceProvider: forcedProvider }).then((result) => {
    if (result.success) {
      console.log(result.content);
      console.log(`\n\x1b[90m[${result.provider} | ${result.model} | ${result.latency}ms]\x1b[0m`);
      process.exit(0);
    } else {
      console.error('\x1b[31m[Error]\x1b[0m', result.error);
      process.exit(1);
    }
  });
} else {
  // Single query mode
  const prompt = args.join(' ');
  
  const agent = new AuroraAIAgent();
  console.log('\x1b[90m[Aurora AI Agent responde...]\x1b[0m\n');
  
  agent.chat(prompt).then((result) => {
    if (result.success) {
      console.log(result.content);
      console.log(`\n\x1b[90m[${result.provider} | ${result.model} | ${result.latency}ms | Tokens: ${result.usage?.total_tokens || 'N/A'}]\x1b[0m`);
      process.exit(0);
    } else {
      console.error('\x1b[31m[Error]\x1b[0m', result.error);
      process.exit(1);
    }
  });
}

// Interactive mode if no args
if (args.length === 0) {
  runInteractive().catch(console.error);
}

export { AuroraAIAgent };
