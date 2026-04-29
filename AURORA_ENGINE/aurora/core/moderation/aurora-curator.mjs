#!/usr/bin/env node
/**
 * aurora-curator.mjs - Aurora AI Content Moderation System
 * 
 * Sistema de moderación automática con IA para el feed de TradeShare.
 * 
 * Características:
 * - Detección automática de spam
 * - Filtro de lenguaje inapropiado
 * - Auto-clasificación de posts
 * - Análisis de sentimiento
 * - Detección de scams/trading fraudulento
 * 
 * Uso:
 *   import { AuroraCurator } from './aurora-curator.mjs';
 *   const curator = new AuroraCurator();
 *   const result = await curator.moderateContent(content, userId);
 */

import { EventEmitter } from 'node:events';
import fetch from 'node-fetch';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const AURORA_CURATOR_CONFIG = {
  // Providers de IA para moderación
  providers: {
    groq: {
      url: 'https://api.groq.com/openai/v1/chat/completions',
      model: 'llama-3.3-70b-versatile',
      key: process.env.GROQ_API_KEY,
    },
    kimi: {
      url: 'https://api.moonshot.cn/v1/chat/completions',
      model: 'moonshotai/kimi-k2-instruct',
      key: process.env.NVIDIA_API_KEY,
    },
  },

  // Umbrales de moderación
  thresholds: {
    spamScore: 0.7,        // 70% = spam confirmado
    scamScore: 0.8,        // 80% = posible scam
    toxicityScore: 0.6,    // 60% = contenido tóxico
    promotionalScore: 0.7, // 70% = contenido promocional
  },

  // Categorías de moderación
  categories: [
    'spam',
    'scam',
    'toxic',
    'promotional',
    'trading_signal',
    'educational',
    'news',
    'discussion',
  ],

  // Palabras clave de trading scam
  tradingScamKeywords: [
    'garantizado', 'garantized', '100% win', 'sin riesgo', 'no risk',
    'duplicar dinero', 'double money', 'retorno seguro', 'safe return',
    'señal vip', 'vip signal', 'grupo premium', 'premium group',
    'bot trading', 'trading bot', 'ia trading', 'ai trading',
    'rendimiento diario', 'daily return', 'interes compuesto', 'compound interest',
  ],
};

// ============================================================================
// AURORA CURATOR CLASS
// ============================================================================

export class AuroraCurator extends EventEmitter {
  constructor(options = {}) {
    super();
    this.config = { ...AURORA_CURATOR_CONFIG, ...options };
    this.moderationQueue = [];
    this.isProcessing = false;
    this.stats = {
      totalModerated: 0,
      spamDetected: 0,
      scamDetected: 0,
      toxicDetected: 0,
      approved: 0,
    };
  }

  /**
   * Moderar contenido con IA
   * 
   * @param {string} content - Contenido a moderar
   * @param {string} userId - ID del usuario
   * @param {object} metadata - Metadata adicional (titulo, categoria, etc.)
   * @returns {Promise<ModerationResult>}
   */
  async moderateContent(content, userId, metadata = {}) {
    const startTime = Date.now();
    
    try {
      // Análisis con IA
      const aiAnalysis = await this.analyzeWithAI(content, metadata);
      
      // Análisis de patrones locales
      const patternAnalysis = this.analyzePatterns(content);
      
      // Combinar resultados
      const result = this.combineAnalysis(aiAnalysis, patternAnalysis, metadata);
      
      // Actualizar estadísticas
      this.updateStats(result);
      
      // Emitir evento
      this.emit('moderation', {
        contentId: metadata.id || 'unknown',
        userId,
        result,
        duration: Date.now() - startTime,
      });
      
      return result;
    } catch (error) {
      console.error('[Aurora Curator] Error moderating content:', error);
      
      // Fallback: moderación básica
      return this.fallbackModeration(content, metadata);
    }
  }

  /**
   * Analizar contenido con IA
   */
  async analyzeWithAI(content, metadata = {}) {
    const prompt = this.buildModerationPrompt(content, metadata);
    
    // Intentar con Groq primero (más rápido)
    try {
      return await this.callGroqAPI(prompt);
    } catch (groqError) {
      console.warn('[Aurora Curator] Groq failed, trying Kimi:', groqError.message);
      
      // Fallback a Kimi
      try {
        return await this.callKimiAPI(prompt);
      } catch (kimiError) {
        console.error('[Aurora Curator] All providers failed:', kimiError.message);
        throw new Error('AI analysis failed');
      }
    }
  }

  /**
   * Construir prompt para IA
   */
  buildModerationPrompt(content, metadata = {}) {
    return `
Eres Aurora Curator, sistema de moderación de contenido para TradeShare (comunidad de trading).

Analiza el siguiente contenido y determina:

1. **Categoría principal**: spam, scam, toxic, promotional, trading_signal, educational, news, discussion
2. **Scores** (0-1): spamScore, scamScore, toxicityScore, promotionalScore
3. **Acción recomendada**: allow, flag, block
4. **Razón**: Explicación breve

**Contenido a analizar:**
Título: ${metadata.titulo || 'Sin título'}
Categoría: ${metadata.categoria || 'General'}
Contenido: ${content.substring(0, 2000)}

**Contexto adicional:**
- Es una comunidad de trading
- Se permiten señales de trading legítimas
- NO se permiten promesas de ganancias garantizadas
- NO se permiten enlaces a grupos VIP de pago
- NO se permite lenguaje tóxico o insultos

Responde SOLO en formato JSON:
{
  "category": "categoria_principal",
  "scores": {
    "spamScore": 0.0,
    "scamScore": 0.0,
    "toxicityScore": 0.0,
    "promotionalScore": 0.0
  },
  "action": "allow|flag|block",
  "reason": "razón breve",
  "confidence": 0.0
}
`.trim();
  }

  /**
   * Llamar a Groq API
   */
  async callGroqAPI(prompt) {
    const provider = this.config.providers.groq;
    
    const response = await fetch(provider.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          {
            role: 'system',
            content: 'Eres Aurora Curator, moderador de contenido para TradeShare. Responde SOLO en JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = JSON.parse(data.choices[0].message.content);
    
    return this.parseAIResponse(aiResponse);
  }

  /**
   * Llamar a Kimi API
   */
  async callKimiAPI(prompt) {
    const provider = this.config.providers.kimi;
    
    const response = await fetch(provider.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          {
            role: 'system',
            content: 'Eres Aurora Curator, moderador de contenido para TradeShare. Responde SOLO en JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`Kimi API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = JSON.parse(data.choices[0].message.content);
    
    return this.parseAIResponse(aiResponse);
  }

  /**
   * Parsear respuesta de IA
   */
  parseAIResponse(aiResponse) {
    return {
      category: aiResponse.category || 'discussion',
      scores: {
        spamScore: Math.max(0, Math.min(1, aiResponse.scores?.spamScore || 0)),
        scamScore: Math.max(0, Math.min(1, aiResponse.scores?.scamScore || 0)),
        toxicityScore: Math.max(0, Math.min(1, aiResponse.scores?.toxicityScore || 0)),
        promotionalScore: Math.max(0, Math.min(1, aiResponse.scores?.promotionalScore || 0)),
      },
      action: aiResponse.action || 'allow',
      reason: aiResponse.reason || 'Análisis completado',
      confidence: aiResponse.confidence || 0.5,
      source: 'ai',
    };
  }

  /**
   * Analizar patrones locales
   */
  analyzePatterns(content) {
    const normalized = content.toLowerCase();
    
    // Detectar palabras de scam de trading
    const scamKeywordsFound = this.config.tradingScamKeywords.filter(
      keyword => normalized.includes(keyword)
    );
    
    // Detectar enlaces sospechosos
    const hasSuspiciousLinks = /https?:\/\/[^\s]*\.(ru|cn|tk|ml|ga|cf|gq)/i.test(content);
    const hasShorteners = /bit\.ly|goo\.gl|tinyurl|t\.co/i.test(content);
    const hasTelegram = /t\.me|telegram\.me/i.test(content);
    
    // Detectar exceso de mayúsculas
    const letters = content.replace(/[^a-zA-Z]/g, '');
    const upperCount = letters.replace(/[^A-Z]/g, '').length;
    const capsRatio = letters.length > 0 ? upperCount / letters.length : 0;
    
    // Calcular scores basados en patrones
    const patternScores = {
      spamScore: (hasShorteners ? 0.3 : 0) + (capsRatio > 0.7 ? 0.2 : 0),
      scamScore: (scamKeywordsFound.length > 0 ? 0.5 : 0) + (hasSuspiciousLinks ? 0.3 : 0),
      toxicityScore: 0, // Se maneja por separado
      promotionalScore: (hasTelegram ? 0.4 : 0) + (scamKeywordsFound.length > 2 ? 0.3 : 0),
    };
    
    return {
      scores: patternScores,
      flags: {
        hasSuspiciousLinks,
        hasShorteners,
        hasTelegram,
        capsRatio,
        scamKeywordsFound,
      },
      source: 'pattern',
    };
  }

  /**
   * Combinar análisis de IA y patrones
   */
  combineAnalysis(aiAnalysis, patternAnalysis, metadata = {}) {
    const thresholds = this.config.thresholds;
    
    // Combinar scores (IA tiene más peso)
    const combinedScores = {
      spamScore: (aiAnalysis.scores.spamScore * 0.7) + (patternAnalysis.scores.spamScore * 0.3),
      scamScore: (aiAnalysis.scores.scamScore * 0.7) + (patternAnalysis.scores.scamScore * 0.3),
      toxicityScore: aiAnalysis.scores.toxicityScore,
      promotionalScore: (aiAnalysis.scores.promotionalScore * 0.7) + (patternAnalysis.scores.promotionalScore * 0.3),
    };
    
    // Determinar acción
    let action = 'allow';
    const reasons = [];
    
    if (combinedScores.scamScore >= thresholds.scamScore) {
      action = 'block';
      reasons.push('Posible scam de trading');
    } else if (combinedScores.spamScore >= thresholds.spamScore) {
      action = 'block';
      reasons.push('Contenido spam');
    } else if (combinedScores.toxicityScore >= thresholds.toxicityScore) {
      action = 'flag';
      reasons.push('Contenido tóxico');
    } else if (combinedScores.promotionalScore >= thresholds.promotionalScore) {
      action = 'flag';
      reasons.push('Contenido promocional excesivo');
    }
    
    return {
      category: aiAnalysis.category,
      scores: combinedScores,
      action,
      reason: reasons.join('. ') || aiAnalysis.reason,
      confidence: aiAnalysis.confidence,
      flags: patternAnalysis.flags,
      metadata: {
        aiSource: 'groq',
        patternSource: 'local',
        timestamp: Date.now(),
        ...metadata,
      },
    };
  }

  /**
   * Fallback moderation (cuando IA falla)
   */
  fallbackModeration(content, metadata = {}) {
    const patternAnalysis = this.analyzePatterns(content);
    
    const thresholds = this.config.thresholds;
    let action = 'allow';
    const reasons = [];
    
    if (patternAnalysis.scores.scamScore >= thresholds.scamScore) {
      action = 'flag';
      reasons.push('Posible scam (análisis básico)');
    }
    
    return {
      category: 'discussion',
      scores: patternAnalysis.scores,
      action,
      reason: reasons.join('. ') || 'Moderación básica (IA no disponible)',
      confidence: 0.5,
      flags: patternAnalysis.flags,
      metadata: {
        aiSource: 'none',
        patternSource: 'local',
        timestamp: Date.now(),
        ...metadata,
      },
    };
  }

  /**
   * Actualizar estadísticas
   */
  updateStats(result) {
    this.stats.totalModerated++;
    
    if (result.action === 'block') {
      if (result.scores.spamScore >= this.config.thresholds.spamScore) {
        this.stats.spamDetected++;
      }
      if (result.scores.scamScore >= this.config.thresholds.scamScore) {
        this.stats.scamDetected++;
      }
    }
    
    if (result.scores.toxicityScore >= this.config.thresholds.toxicityScore) {
      this.stats.toxicDetected++;
    }
    
    if (result.action === 'allow') {
      this.stats.approved++;
    }
  }

  /**
   * Obtener estadísticas
   */
  getStats() {
    return {
      ...this.stats,
      approvalRate: this.stats.totalModerated > 0
        ? (this.stats.approved / this.stats.totalModerated) * 100
        : 0,
    };
  }

  /**
   * Resetear estadísticas
   */
  resetStats() {
    this.stats = {
      totalModerated: 0,
      spamDetected: 0,
      scamDetected: 0,
      toxicDetected: 0,
      approved: 0,
    };
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

let curatorInstance = null;

export function getAuroraCurator() {
  if (!curatorInstance) {
    curatorInstance = new AuroraCurator();
  }
  return curatorInstance;
}

// ============================================================================
// CLI MODE
// ============================================================================

if (process.argv[1]?.includes('aurora-curator')) {
  const curator = getAuroraCurator();
  
  console.log('🧠 Aurora Curator - Sistema de Moderación IA\n');
  console.log('Comandos:');
  console.log('  test <contenido> - Probar moderación\n');
  
  const command = process.argv[2];
  const content = process.argv.slice(3).join(' ');
  
  if (command === 'test' && content) {
    console.log('Analizando contenido...\n');
    
    curator.moderateContent(content, 'test-user', { titulo: 'Test' })
      .then(result => {
        console.log('Resultado:');
        console.log(JSON.stringify(result, null, 2));
        console.log('\nEstadísticas:', curator.getStats());
      })
      .catch(err => {
        console.error('Error:', err.message);
      });
  } else {
    console.log('Uso: node aurora-curator.mjs test "contenido a moderar"');
  }
}
