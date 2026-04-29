/**
 * AURORA - Integración con Kimi K2.5
 * 
 * Cómo consultar a Kimi cuando necesito ayuda extra
 */

import { askKimi, askKimiWithContext, getKimiStatus } from "../../scripts/aurora-kimi-agent.mjs";

/**
 * Consultar a Kimi para ayuda con lógica de negocio
 * 
 * @param {string} question - Pregunta para Kimi
 * @returns {Promise<string>} Respuesta de Kimi
 */
export async function consultKimi(question) {
  try {
    const result = await askKimi(question);
    return result.answer;
  } catch (error) {
    console.error('Error consultando Kimi:', error);
    return null;
  }
}

/**
 * Consultar a Kimi con contexto del proyecto
 */
export async function consultKimiWithContext(question, context) {
  try {
    const result = await askKimiWithContext(question, {
      currentTask: context.task,
      filesToEdit: context.files || [],
      forbidden: context.forbidden || [],
    });
    return result.answer;
  } catch (error) {
    console.error('Error consultando Kimi:', error);
    return null;
  }
}

/**
 * Cuándo usar Kimi:
 * - Explicar conceptos de trading/finanzas
 * - Revisar lógica de negocio compleja
 * - Generación de ideas/estrategia
 * - Explicar algoritmos
 * 
 * Cuándo NO usar Kimi:
 * - Código directo (YO soy mejor)
 * - Archivos del proyecto
 * - Deploy y configuración
 */

export const KIMI_USE_CASES = {
  good: [
    'Cómo implementar un algoritmo de trading',
    'Explícame conceptos de risk management',
    'Estrategia para generar ingresos pasivos',
    'Cómo diseñar un sistema de señales',
  ],
  bad: [
    'Crear componente React',
    'Fix bug en convex',
    'Deploy a vercel',
  ]
};
