#!/usr/bin/env node
/**
 * ✦ GEMMA REVIEW ENGINE - Motor de Revisión de Código
 * 
 * Revisa calidad del código con análisis estático + IA.
 * Genera score, métricas y sugerencias de mejora.
 * 
 * @version 1.0.0
 * @author TradeShare + Aurora AI
 */

import { readFile } from 'node:fs/promises';
import { existsSync, statSync, readdirSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';
import chalk from 'chalk';
import ora from 'ora';

// gemma/src/core/ -> subir 2 niveles -> gemma/
const GEMMA_DIR = resolve(join(import.meta.dirname, '..', '..'));
// gemma/ -> subir 3 niveles -> raíz del proyecto
const ROOT_DIR = resolve(join(GEMMA_DIR, '..', '..'));

/**
 * Analizar métricas del código
 */
function analyzeMetrics(code, filePath) {
  const lines = code.split('\n');
  const ext = extname(filePath);

  // Métricas básicas
  const lineCount = lines.length;
  const blankLines = lines.filter(l => l.trim() === '').length;
  const commentLines = lines.filter(l => l.trim().startsWith('//') || l.trim().startsWith('/*')).length;
  const codeLines = lineCount - blankLines - commentLines;

  // Complejidad
  const ifCount = (code.match(/\bif\s*\(/g) || []).length;
  const forCount = (code.match(/\bfor\s*\(/g) || []).length;
  const whileCount = (code.match(/\bwhile\s*\(/g) || []).length;
  const switchCount = (code.match(/\bswitch\s*\(/g) || []).length;
  const catchCount = (code.match(/\bcatch\s*\(/g) || []).length;
  const ternaryCount = (code.match(/\?[^?]/g) || []).length;
  
  const conditionals = ifCount + forCount + whileCount + switchCount;
  const errorHandling = catchCount;

  // Funciones
  const functionCount = (code.match(/(?:function |=> |const \w+ = \(|const \w+ = function|async \w+\s*\()/g) || []).length;
  const avgFunctionLength = functionCount > 0 ? Math.round(codeLines / functionCount) : 0;

  // Imports
  const importCount = (code.match(/^import /gm) || []).length;
  const exportCount = (code.match(/^export /gm) || []).length;

  // Code smells
  const codeSmells = [];
  
  if (avgFunctionLength > 30) {
    codeSmells.push({ type: 'long-function', severity: 'warning', message: `Funciones muy largas (${avgFunctionLength} líneas promedio). Considera dividir en funciones más pequeñas.` });
  }
  
  if (conditionals > 10) {
    codeSmells.push({ type: 'high-complexity', severity: 'error', message: `Alta complejidad ciclomática (${conditionals} condicionales). Considera usar polimorfismo o strategy pattern.` });
  }
  
  if (errorHandling === 0 && codeLines > 20) {
    codeSmells.push({ type: 'no-error-handling', severity: 'warning', message: 'No hay manejo de errores. Agrega try/catch en operaciones que pueden fallar.' });
  }
  
  if (ternaryCount > 5) {
    codeSmells.push({ type: 'ternary-abuse', severity: 'info', message: `${ternaryCount} operadores ternarios. Usa if/else para mejor legibilidad.` });
  }

  // Calcular score
  let score = 100;
  score -= codeSmells.filter(s => s.severity === 'error').length * 15;
  score -= codeSmells.filter(s => s.severity === 'warning').length * 8;
  score -= codeSmells.filter(s => s.severity === 'info').length * 3;
  score = Math.max(0, score);

  // Calcular grade
  let grade;
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  else grade = 'F';

  return {
    filePath,
    metrics: {
      lineCount,
      codeLines,
      blankLines,
      commentLines,
      functionCount,
      importCount,
      exportCount,
      conditionals,
      errorHandling,
      avgFunctionLength
    },
    codeSmells,
    score,
    grade
  };
}

/**
 * Construir prompt de review con IA
 */
function buildReviewPrompt(code, metrics) {
  return `Eres GEMMA CODE STUDIO, revisor de código senior experto en calidad.

CÓDIGO A REVISAR:
\`\`\`${extname(metrics.filePath).replace('.', '')}
${code}
\`\`\`

MÉTRICAS AUTOMÁTICAS:
- Líneas de código: ${metrics.metrics.codeLines}
- Funciones: ${metrics.metrics.functionCount}
- Complejidad (condicionales): ${metrics.metrics.conditionals}
- Manejo de errores: ${metrics.metrics.errorHandling}
- Longitud promedio de función: ${metrics.metrics.avgFunctionLength} líneas
- Score actual: ${metrics.score}/100 (Grado: ${metrics.grade})

CODE SMELLS DETECTADOS:
${metrics.codeSmells.map(s => `- [${s.severity.toUpperCase()}] ${s.message}`).join('\n')}

TAREA:
1. Revisa el código buscando problemas de calidad
2. Identifica anti-patrones y malas prácticas
3. Sugiere mejoras específicas con ejemplos de código
4. Evalúa: seguridad, performance, mantenibilidad, legibilidad
5. Da un veredicto final claro

FORMATO DE RESPUESTA:
## 🔍 Revisión de Código

### ✅ Puntos Fuertes
- [lista]

### ⚠️ Problemas Encontrados
- [lista con severidad]

### 💡 Sugerencias de Mejora
- [lista con ejemplos de código]

### 📊 Veredicto Final
[1-2 párrafos con evaluación honesta]

REVISIÓN:`;
}

/**
 * Función principal: revisar código
 */
export default async function reviewCode(options) {
  const startTime = Date.now();
  const {
    path,
    metrics: includeMetrics = false,
    profile: profileName = 'fullstack-senior',
    verbose = false,
    rootDir = ROOT_DIR,
    gemmaDir = GEMMA_DIR
  } = options;

  const spinner = verbose ? null : ora({
    text: chalk.cyan('Analizando métricas del código...'),
    color: 'cyan'
  });

  try {
    // 1. Validar ruta
    const filePath = resolve(rootDir, path);
    if (!existsSync(filePath)) {
      throw new Error(`Archivo no encontrado: ${filePath}`);
    }

    const stats = statSync(filePath);
    let filesToReview = [];

    if (stats.isFile()) {
      filesToReview.push(filePath);
    } else if (stats.isDirectory()) {
      // Escanear archivos en directorio
      const entries = readdirSync(filePath);
      for (const entry of entries) {
        const fullPath = join(filePath, entry);
        const entryStats = statSync(fullPath);
        if (entryStats.isFile() && /\.(ts|tsx|js|jsx|mjs)$/.test(entry)) {
          filesToReview.push(fullPath);
        }
      }
      if (filesToReview.length === 0) {
        throw new Error('No se encontraron archivos de código en el directorio.');
      }
    }

    // 2. Analizar métricas de cada archivo
    if (spinner) spinner.text = chalk.cyan(`Analizando ${filesToReview.length} archivo(s)...`);
    const allMetrics = [];
    let allCode = '';

    for (const file of filesToReview) {
      const code = await readFile(file, 'utf-8');
      const metrics = analyzeMetrics(code, file);
      allMetrics.push({ file, metrics });
      allCode += `\n\n=== ${file} ===\n${code}`;
    }

    // Calcular promedio de scores
    const avgScore = Math.round(allMetrics.reduce((sum, m) => sum + m.metrics.score, 0) / allMetrics.length);
    const avgGrade = avgScore >= 90 ? 'A' : avgScore >= 80 ? 'B' : avgScore >= 70 ? 'C' : avgScore >= 60 ? 'D' : 'F';

    // 3. Llamar a IA para review
    if (spinner) spinner.text = chalk.cyan('Generando review con IA...');
    
    const { fetch } = await import('undici');
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY;
    const useGemini = !!process.env.GEMINI_API_KEY;
    
    const prompt = buildReviewPrompt(allCode, {
      filePath: filesToReview.join(', '),
      metrics: {
        metrics: {
          lineCount: allMetrics.reduce((sum, m) => sum + m.metrics.metrics.lineCount, 0),
          codeLines: allMetrics.reduce((sum, m) => sum + m.metrics.metrics.codeLines, 0),
          functionCount: allMetrics.reduce((sum, m) => sum + m.metrics.metrics.functionCount, 0),
          conditionals: allMetrics.reduce((sum, m) => sum + m.metrics.metrics.conditionals, 0),
          errorHandling: allMetrics.reduce((sum, m) => sum + m.metrics.metrics.errorHandling, 0),
          avgFunctionLength: Math.round(allMetrics.reduce((sum, m) => sum + m.metrics.metrics.avgFunctionLength, 0) / allMetrics.length)
        },
        codeSmells: allMetrics.flatMap(m => m.metrics.codeSmells),
        score: avgScore,
        grade: avgGrade
      }
    });

    let body, url, headers;
    if (useGemini) {
      body = {
        system_instruction: { parts: [{ text: 'Eres GEMMA REVIEW ENGINE. Revisa código y da evaluación honesta con puntos fuertes, problemas y sugerencias.' }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 4096 }
      };
      url = `https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent?key=${apiKey}`;
      headers = { 'Content-Type': 'application/json' };
    } else {
      body = {
        model: 'google/gemma-4-31b-it',
        messages: [
          { role: 'system', content: 'Eres GEMMA REVIEW ENGINE. Revisa código honestamente.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 4096
      };
      url = 'https://openrouter.ai/api/v1/chat/completions';
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Error en API (${response.status})`);
    }

    const data = await response.json();
    let aiResponse;
    if (useGemini) {
      aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
      aiResponse = data.choices?.[0]?.message?.content || '';
    }

    const timeMs = Date.now() - startTime;

    return {
      success: true,
      grade: avgGrade,
      score: avgScore,
      summary: aiResponse,
      filesReviewed: filesToReview.length,
      metrics: includeMetrics ? allMetrics : null,
      timeMs
    };

  } catch (error) {
    const timeMs = Date.now() - startTime;
    return {
      success: false,
      error: error.message,
      timeMs
    };
  }
}
