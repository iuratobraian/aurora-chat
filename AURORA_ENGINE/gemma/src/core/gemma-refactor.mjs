#!/usr/bin/env node
/**
 * ✦ GEMMA REFACTOR ENGINE - Motor de Refactorización
 * 
 * Analiza código existente y lo refactoriza usando IA.
 * Preserva funcionalidad mientras mejora calidad.
 * 
 * @version 1.0.0
 * @author TradeShare + Aurora AI
 */

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { join, resolve, dirname, extname } from 'node:path';
import chalk from 'chalk';
import ora from 'ora';

// gemma/src/core/ -> subir 2 niveles -> gemma/
const GEMMA_DIR = resolve(join(import.meta.dirname, '..', '..'));
// gemma/ -> subir 3 niveles -> raíz del proyecto
const ROOT_DIR = resolve(join(GEMMA_DIR, '..', '..'));

/**
 * Analizar código con AST (simplificado)
 */
async function analyzeWithAST(filePath) {
  const content = await readFile(filePath, 'utf-8');
  const ext = extname(filePath);
  
  const analysis = {
    filePath,
    extension: ext,
    lineCount: content.split('\n').length,
    charCount: content.length,
    importCount: (content.match(/^import /gm) || []).length,
    exportCount: (content.match(/^export /gm) || []).length,
    functionCount: (content.match(/(?:function |=> |const \w+ = \(|const \w+ = function)/g) || []).length,
    classCount: (content.match(/class \w+/g) || []).length,
    hasTypeScript: ext === '.ts' || ext === '.tsx',
    hasComments: (content.match(/\/\//gm) || []).length,
    complexity: estimateComplexity(content)
  };

  return { content, analysis };
}

/**
 * Estimar complejidad del código
 */
function estimateComplexity(code) {
  let score = 0;
  
  // Anidación
  const nestingDepth = (code.match(/\{\s*\n/g) || []).length;
  score += nestingDepth * 2;
  
  // Condicionales
  score += (code.match(/\bif\s*\(/g) || []).length * 3;
  score += (code.match(/\belse\b/g) || []).length * 2;
  score += (code.match(/\bswitch\s*\(/g) || []).length * 4;
  
  // Bucles
  score += (code.match(/\bfor\s*\(/g) || []).length * 3;
  score += (code.match(/\bwhile\s*\(/g) || []).length * 3;
  
  // Try/catch
  score += (code.match(/\btry\s*\{/g) || []).length * 2;
  score += (code.match(/\bcatch\s*\(/g) || []).length * 2;
  
  if (score < 10) return { level: 'Bajo', score, grade: 'A' };
  if (score < 25) return { level: 'Medio', score, grade: 'B' };
  if (score < 50) return { level: 'Alto', score, grade: 'C' };
  return { level: 'Muy Alto', score, grade: 'D' };
}

/**
 * Construir prompt de refactorización
 */
function buildRefactorPrompt(code, options, astAnalysis) {
  const { focus, profile } = options;

  return `Eres GEMMA CODE STUDIO, ingeniero de software senior experto en refactorización.

CÓDIGO ACTUAL:
\`\`\`${astAnalysis.extension.replace('.', '')}
${code}
\`\`\`

ANÁLISIS DEL CÓDIGO:
- Líneas: ${astAnalysis.lineCount}
- Imports: ${astAnalysis.importCount}
- Funciones: ${astAnalysis.functionCount}
- Complejidad: ${astAnalysis.complexity.level} (${astAnalysis.complexity.grade})

OBJETIVO DE REFACTORIZACIÓN:
${focus}

REGLAS:
1. MANTENER funcionalidad exacta (sin breaking changes)
2. Mejorar legibilidad y mantenibilidad
3. Reducir complejidad donde sea posible
4. Extraer funciones/métodos si son muy largos
5. Mejorar nombres si son confusos
6. Agregar manejo de errores si falta
7. Tipado estricto si es TypeScript
8. Código production-ready

RESPUESTA:
- SOLO el código refactorizado completo
- Sin explicaciones ni preámbulos
- Mantener mismo formato de imports/exports

PERFIL:
${profile}

REFACTORIZA AHORA:`;
}

/**
 * Llamar a IA (reutilizar de gemma-coder)
 */
async function callAI(prompt) {
  const { callAI: callAIFromCoder } = await import('./gemma-coder.mjs');
  return callAIFromCoder(prompt);
}

/**
 * Función principal: refactorizar código
 */
export default async function refactorCode(options) {
  const startTime = Date.now();
  const {
    path,
    focus = 'mejorar calidad del código',
    profile: profileName = 'refactor-master',
    dryRun = false,
    verbose = false,
    rootDir = ROOT_DIR,
    gemmaDir = GEMMA_DIR
  } = options;

  const spinner = verbose ? null : ora({
    text: chalk.cyan('Analizando código con AST...'),
    color: 'cyan'
  });

  try {
    // 1. Validar archivo
    const filePath = resolve(rootDir, path);
    if (!existsSync(filePath)) {
      throw new Error(`Archivo no encontrado: ${filePath}`);
    }

    const stats = statSync(filePath);
    if (stats.isDirectory()) {
      throw new Error('Refactor de directorios no soportado aún. Especifica un archivo.');
    }

    // 2. Analizar con AST
    if (spinner) spinner.text = chalk.cyan('Analizando estructura del código...');
    const { content: originalCode, analysis } = await analyzeWithAST(filePath);

    // 3. Cargar perfil
    const { readFile: readFileAsync } = await import('node:fs/promises');
    const profilePath = join(gemmaDir, 'profiles', `${profileName}.md`);
    const profile = existsSync(profilePath) 
      ? await readFileAsync(profilePath, 'utf-8')
      : 'Refactoriza mejorando calidad sin cambiar funcionalidad.';

    // 4. Construir prompt
    if (spinner) spinner.text = chalk.cyan('Preparando refactorización...');
    const prompt = buildRefactorPrompt(originalCode, { focus, profile }, analysis);

    // 5. Llamar a IA
    if (spinner) spinner.text = chalk.cyan('Refactorizando con IA...');
    
    // Llamar directamente a la API
    const { fetch } = await import('undici');
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY;
    const useGemini = !!process.env.GEMINI_API_KEY;

    let body, url, headers;
    if (useGemini) {
      body = {
        system_instruction: { parts: [{ text: 'Eres GEMMA REFACTOR MASTER. Refactoriza código mejorando calidad sin cambiar funcionalidad. SOLO devuelve el código.' }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
      };
      url = `https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent?key=${apiKey}`;
      headers = { 'Content-Type': 'application/json' };
    } else {
      body = {
        model: 'google/gemma-4-31b-it',
        messages: [
          { role: 'system', content: 'Eres GEMMA REFACTOR MASTER. SOLO devuelve el código refactorizado.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 8192
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

    // 6. Extraer código
    if (spinner) spinner.text = chalk.cyan('Procesando resultado...');
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g;
    const matches = [];
    let match;
    while ((match = codeBlockRegex.exec(aiResponse)) !== null) {
      matches.push(match[1].trim());
    }
    
    const refactoredCode = matches.length > 0 ? matches[0] : aiResponse.trim();

    // 7. Calcular diferencias
    const originalLines = originalCode.split('\n').length;
    const refactoredLines = refactoredCode.split('\n').length;
    const changesCount = Math.abs(refactoredLines - originalLines);

    // 8. Guardar (si no es dry-run)
    if (!dryRun) {
      // Crear backup
      const backupPath = `${filePath}.backup`;
      await writeFile(backupPath, originalCode, 'utf-8');
      
      // Escribir refactorizado
      await writeFile(filePath, refactoredCode, 'utf-8');
    }

    const timeMs = Date.now() - startTime;

    return {
      success: true,
      filePath,
      changesCount,
      timeMs,
      dryRun,
      analysis: {
        original: analysis,
        originalLines,
        refactoredLines
      }
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
