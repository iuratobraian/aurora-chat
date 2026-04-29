#!/usr/bin/env node
/**
 * ✦ AST ANALYZER - Analizador de Estructura de Código
 * 
 * Parseo AST simplificado para análisis de código TypeScript/JavaScript.
 * Detecta patrones, complejidad y estructura.
 * 
 * @version 1.0.0
 * @author TradeShare + Aurora AI
 */

import { readFile } from 'node:fs/promises';
import { existsSync, statSync, readdirSync } from 'node:fs';
import { join, resolve, extname, basename } from 'node:path';
import chalk from 'chalk';
import ora from 'ora';

// gemma/src/tools/ -> subir 2 niveles -> gemma/
const GEMMA_DIR = resolve(join(import.meta.dirname, '..', '..'));
// gemma/ -> subir 3 niveles -> raíz del proyecto
const ROOT_DIR = resolve(join(GEMMA_DIR, '..', '..'));

/**
 * Análisis básico de AST sin dependencias externas
 */
function basicASTAnalysis(code) {
  const lines = code.split('\n');
  
  return {
    // Estructura
    lineCount: lines.length,
    blankLines: lines.filter(l => l.trim() === '').length,
    commentLines: lines.filter(l => /^\s*\/\//.test(l) || /^\s*\/\*/.test(l)).length,
    
    // Imports/Exports
    imports: extractImports(code),
    exports: extractExports(code),
    
    // Funciones
    functions: extractFunctions(code),
    arrowFunctions: (code.match(/=>/g) || []).length,
    
    // Clases
    classes: extractClasses(code),
    
    // Complejidad
    conditionals: countPattern(code, /\b(if|else\s+if|switch|case)\b/g),
    loops: countPattern(code, /\b(for|while|do)\b/g),
    tryCatch: countPattern(code, /\b(try|catch|finally)\b/g),
    
    // Variables
    constDecls: countPattern(code, /\bconst\b/g),
    letDecls: countPattern(code, /\blet\b/g),
    varDecls: countPattern(code, /\bvar\b/g),
    
    // Code smells
    longLines: lines.filter(l => l.length > 120).length,
    nestedBlocks: estimateNestingDepth(code),
    magicNumbers: extractMagicNumbers(code)
  };
}

/**
 * Extraer imports
 */
function extractImports(code) {
  const imports = [];
  const regex = /import\s+(?:(?:(\w+)\s*,?\s*)?(?:\{([^}]*)\})?\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = regex.exec(code)) !== null) {
    imports.push({
      default: match[1] || null,
      named: match[2] ? match[2].split(',').map(s => s.trim()) : [],
      source: match[3]
    });
  }
  
  return imports;
}

/**
 * Extraer exports
 */
function extractExports(code) {
  const exports = [];
  const regex = /export\s+(?:(default)\s+)?(?:const|function|class|type|interface|enum)\s+(\w+)/g;
  let match;
  
  while ((match = regex.exec(code)) !== null) {
    exports.push({
      name: match[2],
      isDefault: !!match[1]
    });
  }
  
  return exports;
}

/**
 * Extraer funciones
 */
function extractFunctions(code) {
  const functions = [];
  
  // function declarations
  const funcRegex = /(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g;
  let match;
  while ((match = funcRegex.exec(code)) !== null) {
    functions.push({
      type: 'function',
      name: match[1],
      params: match[2].split(',').filter(p => p.trim()).length,
      async: match[0].includes('async')
    });
  }
  
  // const/let/var arrow functions
  const arrowRegex = /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*(?::\s*\w+\s*)?=>/g;
  while ((match = arrowRegex.exec(code)) !== null) {
    functions.push({
      type: 'arrow',
      name: match[1],
      params: match[2].split(',').filter(p => p.trim()).length,
      async: match[0].includes('async')
    });
  }
  
  return functions;
}

/**
 * Extraer clases
 */
function extractClasses(code) {
  const classes = [];
  const regex = /(?:export\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([\w,\s]+))?/g;
  let match;
  
  while ((match = regex.exec(code)) !== null) {
    const methods = [];
    const classBodyRegex = /(?:async\s+)?(\w+)\s*\(([^)]*)\)\s*(?::\s*[\w<>,\s]+\s*)?\{/g;
    const classStart = match.index;
    const classBodyStart = code.indexOf('{', classStart);
    const classBodyEnd = findMatchingBrace(code, classBodyStart);
    const classBody = code.substring(classBodyStart, classBodyEnd);
    
    let methodMatch;
    while ((methodMatch = classBodyRegex.exec(classBody)) !== null) {
      if (!['if', 'for', 'while', 'switch', 'catch'].includes(methodMatch[1])) {
        methods.push({
          name: methodMatch[1],
          params: methodMatch[2].split(',').filter(p => p.trim()).length,
          async: methodMatch[0].includes('async')
        });
      }
    }
    
    classes.push({
      name: match[1],
      extends: match[2] || null,
      implements: match[3] ? match[3].split(',').map(s => s.trim()) : [],
      methods
    });
  }
  
  return classes;
}

/**
 * Encontrar llave de cierre匹配
 */
function findMatchingBrace(code, openPos) {
  let depth = 0;
  for (let i = openPos; i < code.length; i++) {
    if (code[i] === '{') depth++;
    if (code[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return code.length;
}

/**
 * Contar patrón
 */
function countPattern(code, regex) {
  return (code.match(regex) || []).length;
}

/**
 * Estimar profundidad de anidación
 */
function estimateNestingDepth(code) {
  const lines = code.split('\n');
  let maxDepth = 0;
  let currentDepth = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.endsWith('{') && !trimmed.startsWith('//')) {
      currentDepth++;
      maxDepth = Math.max(maxDepth, currentDepth);
    }
    if (trimmed === '}') {
      currentDepth = Math.max(0, currentDepth - 1);
    }
  }
  
  return maxDepth;
}

/**
 * Extraer números mágicos
 */
function extractMagicNumbers(code) {
  const regex = /(?<![a-zA-Z_\.])\b(\d+\.?\d*)\b(?![^\[]*\])/g;
  const magicNumbers = [];
  let match;
  
  while ((match = regex.exec(code)) !== null) {
    const num = parseFloat(match[1]);
    if (num !== 0 && num !== 1 && !match[0].includes('.')) {
      magicNumbers.push(num);
    }
  }
  
  return [...new Set(magicNumbers)].slice(0, 10);
}

/**
 * Calcular complejidad ciclomática estimada
 */
function estimateCyclomaticComplexity(analysis) {
  // Base: 1
  // +1 por cada decisión
  return 1 + analysis.conditionals + analysis.loops + (analysis.tryCatch / 2);
}

/**
 * Generar reporte de análisis
 */
function generateReport(analysis, filePath) {
  const complexity = estimateCyclomaticComplexity(analysis);
  
  let grade;
  if (complexity <= 5) grade = 'A';
  else if (complexity <= 10) grade = 'B';
  else if (complexity <= 20) grade = 'C';
  else if (complexity <= 30) grade = 'D';
  else grade = 'F';
  
  const codeSmells = [];
  
  if (analysis.longLines > 0) {
    codeSmells.push(`⚠️ ${analysis.longLines} líneas > 120 caracteres`);
  }
  
  if (analysis.nestedBlocks > 4) {
    codeSmells.push(`⚠️ Anidación profunda (${analysis.nestedBlocks} niveles)`);
  }
  
  if (analysis.magicNumbers.length > 0) {
    codeSmells.push(`ℹ️ Números mágicos detectados: ${analysis.magicNumbers.join(', ')}`);
  }
  
  if (analysis.varDecls > 0) {
    codeSmells.push(`⚠️ Usa 'var' ${analysis.varDecls} veces (prefiere const/let)`);
  }
  
  return {
    file: filePath,
    grade,
    complexity,
    metrics: {
      lines: analysis.lineCount,
      codeLines: analysis.lineCount - analysis.blankLines - analysis.commentLines,
      functions: analysis.functions.length,
      classes: analysis.classes.length,
      imports: analysis.imports.length,
      exports: analysis.exports.length
    },
    codeSmells,
    recommendation: grade === 'A' ? '✅ Código limpio' :
                    grade === 'B' ? '👍 Buen código, pequeñas mejoras posibles' :
                    grade === 'C' ? '⚠️ Refactorización recomendada' :
                    grade === 'D' ? '🔴 Refactorización urgente necesaria' :
                    '🚨 Código crítico, reescribir recomendado'
  };
}

/**
 * Función principal: analizar código
 */
export default async function analyzeCode(options) {
  const startTime = Date.now();
  const {
    path,
    metrics: includeMetrics = false,
    report: generateReportFlag = false,
    verbose = false,
    rootDir = ROOT_DIR,
    gemmaDir = GEMMA_DIR
  } = options;

  const spinner = verbose ? null : ora({
    text: chalk.cyan('Analizando código...'),
    color: 'cyan'
  });

  try {
    const filePath = resolve(rootDir, path);
    
    if (!existsSync(filePath)) {
      throw new Error(`Archivo no encontrado: ${filePath}`);
    }

    const stats = statSync(filePath);
    let filesToAnalyze = [];

    if (stats.isFile()) {
      filesToAnalyze.push(filePath);
    } else if (stats.isDirectory()) {
      const entries = readdirSync(filePath);
      for (const entry of entries) {
        const fullPath = join(filePath, entry);
        const entryStats = statSync(fullPath);
        if (entryStats.isFile() && /\.(ts|tsx|js|jsx|mjs)$/.test(entry)) {
          filesToAnalyze.push(fullPath);
        }
      }
    }

    if (filesToAnalyze.length === 0) {
      throw new Error('No se encontraron archivos de código.');
    }

    const results = [];
    for (const file of filesToAnalyze) {
      if (spinner) spinner.text = chalk.cyan(`Analizando ${basename(file)}...`);
      
      const code = await readFile(file, 'utf-8');
      const analysis = basicASTAnalysis(code);
      const report = generateReport(analysis, file);
      results.push({ file, analysis, report });
    }

    const timeMs = Date.now() - startTime;

    // Generar resumen
    const avgComplexity = Math.round(results.reduce((sum, r) => sum + r.report.complexity, 0) / results.length);
    const avgGrade = avgComplexity <= 5 ? 'A' : avgComplexity <= 10 ? 'B' : avgComplexity <= 20 ? 'C' : avgComplexity <= 30 ? 'D' : 'F';

    let summary = `## 📊 Análisis de Código\n\n`;
    summary += `**Archivos analizados:** ${results.length}\n`;
    summary += `**Complejidad promedio:** ${avgComplexity}\n`;
    summary += `**Calificación:** ${avgGrade}\n\n`;

    for (const result of results) {
      summary += `### ${basename(result.file)}\n`;
      summary += `- Líneas: ${result.report.metrics.lines}\n`;
      summary += `- Funciones: ${result.report.metrics.functions}\n`;
      summary += `- Complejidad: ${result.report.complexity}\n`;
      summary += `- Grado: ${result.report.grade}\n`;
      if (result.report.codeSmells.length > 0) {
        summary += `- Problemas:\n`;
        for (const smell of result.report.codeSmells) {
          summary += `  ${smell}\n`;
        }
      }
      summary += '\n';
    }

    return {
      success: true,
      summary,
      results: includeMetrics ? results : null,
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
