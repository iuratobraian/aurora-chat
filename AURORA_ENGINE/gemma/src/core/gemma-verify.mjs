#!/usr/bin/env node
/**
 * ✦ GEMMA VERIFY PIPELINE - Pipeline de Verificación
 * 
 * Genera tests automáticamente y verifica código.
 * Integra lint, type-check y test execution.
 * 
 * @version 1.0.0
 * @author TradeShare + Aurora AI
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { join, resolve, dirname, extname, basename } from 'node:path';
import { execSync } from 'node:child_process';
import chalk from 'chalk';
import ora from 'ora';

// gemma/src/core/ -> subir 2 niveles -> gemma/
const GEMMA_DIR = resolve(join(import.meta.dirname, '..', '..'));
// gemma/ -> subir 3 niveles -> raíz del proyecto
const ROOT_DIR = resolve(join(GEMMA_DIR, '..', '..'));

/**
 * Analizar código para generar tests apropiados
 */
async function analyzeForTests(filePath) {
  const content = await readFile(filePath, 'utf-8');
  const ext = extname(filePath);
  
  // Detectar funciones exportadas
  const exportedFunctions = [];
  const exportRegex = /export\s+(?:const|function|async function)\s+(\w+)/g;
  let match;
  while ((match = exportRegex.exec(content)) !== null) {
    exportedFunctions.push(match[1]);
  }

  // Detectar clases
  const classes = [];
  const classRegex = /export\s+class\s+(\w+)/g;
  while ((match = classRegex.exec(content)) !== null) {
    classes.push(match[1]);
  }

  // Detectar tipos/interfaces (TypeScript)
  const types = [];
  const typeRegex = /export\s+(?:type|interface)\s+(\w+)/g;
  while ((match = typeRegex.exec(content)) !== null) {
    types.push(match[1]);
  }

  // Detectar dependencias
  const imports = [];
  const importRegex = /import\s+.*from\s+['"]([^'"]+)['"]/g;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return {
    filePath,
    extension: ext,
    exportedFunctions,
    classes,
    types,
    imports,
    hasTypeScript: ext === '.ts' || ext === '.tsx',
    content
  };
}

/**
 * Construir prompt para generación de tests
 */
function buildTestPrompt(analysis) {
  return `Eres GEMMA TEST ENGINEER, ingeniero de QA senior experto en testing.

CÓDIGO A TESTEAR:
\`\`\`${analysis.extension.replace('.', '')}
${analysis.content}
\`\`\`

ELEMENTOS A TESTEAR:
- Funciones exportadas: ${analysis.exportedFunctions.join(', ') || 'Ninguna detectada'}
- Clases: ${analysis.classes.join(', ') || 'Ninguna'}
- Tipos: ${analysis.types.join(', ') || 'Ninguno'}

DEPENDENCIAS:
${analysis.imports.map(i => `- ${i}`).join('\n')}

TAREA:
Genera un archivo de tests COMPLETO usando Vitest que cubra:

1. **Tests unitarios** para cada función exportada
   - Caso feliz (input válido)
   - Casos borde (null, undefined, empty, límites)
   - Casos de error (inputs inválidos)

2. **Tests de integración** si aplica
   - Interacción entre funciones
   - Flujos completos

3. **Mock de dependencias externas**
   - APIs, bases de datos, servicios

4. **Assertions descriptivos**
   - Mensajes claros de qué se está testeando

REGLAS:
- Usa Vitest (import { test, expect, describe } from 'vitest')
- Organiza con describe() por función/módulo
- Nombres de tests descriptivos (it/describe en inglés)
- Mocks con vi.fn() o vi.mock()
- Tests independientes (sin estado compartido)
- 100% coverage objetivo

FORMATO:
SOLO el código del archivo de tests completo, nada más.

TESTS:`;
}

/**
 * Ejecutar lint sobre código generado
 */
async function runLint(code, filePath) {
  try {
    // Escribir código temporal
    const tempPath = `${filePath}.lint-temp`;
    await writeFile(tempPath, code, 'utf-8');

    try {
      execSync(`npx eslint ${tempPath} --no-eslintrc --parser-options=ecmaVersion:2022,sourceType:module 2>&1`, {
        encoding: 'utf-8',
        timeout: 10000
      });
      return { success: true, errors: [] };
    } catch (error) {
      return {
        success: false,
        errors: error.stdout?.split('\n').filter(l => l.trim()) || [error.message]
      };
    } finally {
      // Limpiar archivo temporal
      try {
        const { unlinkSync } = await import('node:fs');
        unlinkSync(tempPath);
      } catch (e) {
        // Ignorar
      }
    }
  } catch (error) {
    return { success: false, errors: [`Error ejecutando lint: ${error.message}`] };
  }
}

/**
 * Ejecutar type-check sobre código generado
 */
async function runTypeCheck(code, filePath) {
  try {
    const tempPath = `${filePath}.typecheck-temp.ts`;
    await writeFile(tempPath, code, 'utf-8');

    try {
      execSync(`npx tsc ${tempPath} --noEmit --skipLibCheck --esModuleInterop --moduleResolution node 2>&1`, {
        encoding: 'utf-8',
        timeout: 15000
      });
      return { success: true, errors: [] };
    } catch (error) {
      return {
        success: false,
        errors: error.stdout?.split('\n').filter(l => l.trim()) || [error.message]
      };
    } finally {
      try {
        const { unlinkSync } = await import('node:fs');
        unlinkSync(tempPath);
        // También limpiar .js si se generó
        const jsPath = tempPath.replace('.ts', '.js');
        if (existsSync(jsPath)) unlinkSync(jsPath);
      } catch (e) {
        // Ignorar
      }
    }
  } catch (error) {
    return { success: false, errors: [`Error ejecutando type-check: ${error.message}`] };
  }
}

/**
 * Ejecutar tests generados
 */
async function runTests(testFilePath) {
  try {
    const output = execSync(`npx vitest run ${testFilePath} --reporter=verbose 2>&1`, {
      encoding: 'utf-8',
      timeout: 30000,
      maxBuffer: 1024 * 1024
    });
    
    const passed = output.includes('✓') && !output.includes('FAIL');
    const testMatch = output.match(/(\d+)\s+tests?/);
    const testCount = testMatch ? parseInt(testMatch[1]) : 0;

    return {
      success: passed,
      output,
      testCount,
      errors: passed ? [] : output.split('\n').filter(l => l.includes('FAIL') || l.includes('×') || l.includes('Error'))
    };
  } catch (error) {
    return {
      success: false,
      output: error.stdout || '',
      testCount: 0,
      errors: [error.message]
    };
  }
}

/**
 * Pipeline de verificación completo
 */
async function verifyPipeline(code, outputPath) {
  const results = {
    lint: null,
    typeCheck: null,
    allPassed: false
  };

  // 1. Lint
  results.lint = await runLint(code, outputPath);

  // 2. Type check (si es TypeScript)
  if (outputPath.endsWith('.ts') || outputPath.endsWith('.tsx')) {
    results.typeCheck = await runTypeCheck(code, outputPath);
  }

  results.allPassed = results.lint.success && (!results.typeCheck || results.typeCheck.success);

  return results;
}

/**
 * Auto-corregir código basado en feedback de verificación
 */
async function autoCorrect(code, verificationResults, originalPrompt) {
  const errors = [];
  
  if (verificationResults.lint && !verificationResults.lint.success) {
    errors.push('Errores de lint:', ...verificationResults.lint.errors.slice(0, 5));
  }
  
  if (verificationResults.typeCheck && !verificationResults.typeCheck.success) {
    errors.push('Errores de tipo:', ...verificationResults.typeCheck.errors.slice(0, 5));
  }

  if (errors.length <= 1) return code; // Solo header

  const correctionPrompt = `El código generado tiene errores. Corrígelos:

CÓDIGO ACTUAL:
\`\`\`
${code}
\`\`\`

ERRORES ENCONTRADOS:
${errors.join('\n')}

SOLO devuelve el código corregido, sin explicaciones.`;

  // Llamar a IA para corrección
  const { fetch } = await import('undici');
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY;
  const useGemini = !!process.env.GEMINI_API_KEY;

  let body, url, headers;
  if (useGemini) {
    body = {
      system_instruction: { parts: [{ text: 'Corrige errores de lint/type-check en el código. SOLO devuelve el código corregido.' }] },
      contents: [{ role: 'user', parts: [{ text: correctionPrompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
    };
    url = `https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent?key=${apiKey}`;
    headers = { 'Content-Type': 'application/json' };
  } else {
    body = {
      model: 'google/gemma-4-31b-it',
      messages: [
        { role: 'system', content: 'Corrige errores de lint/type-check. SOLO el código corregido.' },
        { role: 'user', content: correctionPrompt }
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

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) return code; // Retornar original si falla

    const data = await response.json();
    let aiResponse;
    if (useGemini) {
      aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
      aiResponse = data.choices?.[0]?.message?.content || '';
    }

    // Extraer código
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g;
    const matches = [];
    let match;
    while ((match = codeBlockRegex.exec(aiResponse)) !== null) {
      matches.push(match[1].trim());
    }

    return matches.length > 0 ? matches[0] : code;
  } catch (error) {
    return code; // Retornar original si falla
  }
}

/**
 * Función principal: generar tests
 */
export default async function generateTests(options) {
  const startTime = Date.now();
  const {
    path,
    coverage = false,
    autoFix = false,
    verbose = false,
    rootDir = ROOT_DIR,
    gemmaDir = GEMMA_DIR
  } = options;

  const spinner = verbose ? null : ora({
    text: chalk.cyan('Analizando código para tests...'),
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
      throw new Error('Generación de tests para directorios no soportada aún. Especifica un archivo.');
    }

    // 2. Analizar código
    if (spinner) spinner.text = chalk.cyan('Detectando funciones y clases...');
    const analysis = await analyzeForTests(filePath);

    if (analysis.exportedFunctions.length === 0 && analysis.classes.length === 0) {
      return {
        success: false,
        error: 'No se encontraron funciones exportadas ni clases para testear.'
      };
    }

    // 3. Construir prompt
    if (spinner) spinner.text = chalk.cyan('Preparando generación de tests...');
    const prompt = buildTestPrompt(analysis);

    // 4. Generar tests con IA
    if (spinner) spinner.text = chalk.cyan('Generando tests con IA...');
    
    const { fetch } = await import('undici');
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY;
    const useGemini = !!process.env.GEMINI_API_KEY;

    let body, url, headers;
    if (useGemini) {
      body = {
        system_instruction: { parts: [{ text: 'Eres GEMMA TEST ENGINEER. Genera tests completos con Vitest. SOLO el código.' }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
      };
      url = `https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent?key=${apiKey}`;
      headers = { 'Content-Type': 'application/json' };
    } else {
      body = {
        model: 'google/gemma-4-31b-it',
        messages: [
          { role: 'system', content: 'Eres GEMMA TEST ENGINEER. Genera tests completos con Vitest.' },
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

    // 5. Extraer código de tests
    if (spinner) spinner.text = chalk.cyan('Procesando tests generados...');
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g;
    const matches = [];
    let match;
    while ((match = codeBlockRegex.exec(aiResponse)) !== null) {
      matches.push(match[1].trim());
    }
    
    const testCode = matches.length > 0 ? matches[0] : aiResponse.trim();

    // 6. Determinar ruta del archivo de tests
    const baseName = basename(filePath);
    const dirName = dirname(filePath);
    const ext = extname(baseName);
    const nameWithoutExt = baseName.replace(ext, '');
    const testFilePath = join(dirName, `${nameWithoutExt}.test.ts`);

    // 7. Verificar tests (si autoFix está activo)
    let verificationResults = null;
    let finalTestCode = testCode;

    if (autoFix) {
      if (spinner) spinner.text = chalk.cyan('Verifying tests...');
      verificationResults = await verifyPipeline(testCode, testFilePath);

      if (!verificationResults.allPassed) {
        if (spinner) spinner.text = chalk.yellow('Auto-corrigiendo tests...');
        finalTestCode = await autoCorrect(testCode, verificationResults, prompt);
        
        // Re-verificar
        verificationResults = await verifyPipeline(finalTestCode, testFilePath);
      }
    }

    // 8. Guardar archivo de tests
    await writeFile(testFilePath, finalTestCode, 'utf-8');

    // 9. Contar tests generados
    const testCount = (finalTestCode.match(/(?:test|it)\s*\(/g) || []).length;

    const timeMs = Date.now() - startTime;

    return {
      success: true,
      testFile: testFilePath,
      testCount,
      timeMs,
      verification: verificationResults,
      coverage: coverage ? 'Run `npx vitest run --coverage` for details' : null
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
