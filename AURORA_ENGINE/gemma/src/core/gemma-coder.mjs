#!/usr/bin/env node
/**
 * ✦ GEMMA CODE ENGINE - Motor de Generación de Código
 * 
 * Motor principal que genera código profesional usando IA.
 * Integra contexto del proyecto, plantillas y perfiles especializados.
 * 
 * @version 1.0.0
 * @author TradeShare + Aurora AI
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { join, resolve, dirname, extname, basename } from 'node:path';
import { fetch } from 'undici';
import chalk from 'chalk';
import ora from 'ora';

// Constantes
// gemma/src/core/ -> subir 2 niveles -> gemma/
const GEMMA_DIR = resolve(join(import.meta.dirname, '..', '..'));
// gemma/ -> subir 3 niveles -> raíz del proyecto
const ROOT_DIR = resolve(join(GEMMA_DIR, '..', '..'));
const AURORA_DIR = resolve(join(ROOT_DIR, 'aurora'));

// Perfil por defecto
const DEFAULT_PROFILE = 'fullstack-senior';

/**
 * Cargar perfil de coder
 */
async function loadProfile(profileName) {
  const profilePath = join(GEMMA_DIR, 'profiles', `${profileName}.md`);
  
  if (!existsSync(profilePath)) {
    console.warn(chalk.yellow(`⚠ Perfil "${profileName}" no encontrado, usando ${DEFAULT_PROFILE}`));
    profileName = DEFAULT_PROFILE;
  }

  const content = await readFile(profilePath, 'utf-8');
  return {
    name: profileName,
    prompt: content
  };
}

/**
 * Cargar plantilla según tipo
 */
async function loadTemplate(type) {
  const templatePath = join(GEMMA_DIR, 'src', 'templates', `${type}.mjs`);
  
  if (!existsSync(templatePath)) {
    return null;
  }

  const module = await import(`file://${templatePath}`);
  return module.default;
}

/**
 * Escanear contexto del proyecto
 */
async function scanProjectContext(rootDir, targetPath = null) {
  const context = {
    projectRoot: rootDir,
    structure: {},
    dependencies: {},
    patterns: {},
    targetFile: null
  };

  try {
    // Detectar estructura principal
    const mainFiles = ['package.json', 'tsconfig.json', 'tailwind.config.js', 'convex.config.ts'];
    
    for (const file of mainFiles) {
      const filePath = join(rootDir, file);
      if (existsSync(filePath)) {
        try {
          const content = await readFile(filePath, 'utf-8');
          if (file === 'package.json') {
            const pkg = JSON.parse(content);
            context.dependencies = {
              dependencies: pkg.dependencies || {},
              devDependencies: pkg.devDependencies || {}
            };
            context.projectName = pkg.name;
            context.projectType = detectProjectType(pkg);
          }
          if (file === 'tsconfig.json') {
            context.typescript = true;
            context.tsConfig = JSON.parse(content);
          }
        } catch (e) {
          // Ignorar errores de parseo
        }
      }
    }

    // Si hay target path, cargar archivo objetivo
    if (targetPath && existsSync(targetPath)) {
      context.targetFile = {
        path: targetPath,
        content: await readFile(targetPath, 'utf-8'),
        extension: extname(targetPath)
      };
    }

    // Detectar archivos relevantes cercanos
    const relevantFiles = [];
    if (targetPath) {
      const dir = dirname(targetPath);
      try {
        const { glob } = await import('glob');
        const files = await glob('**/*.{ts,tsx,js,jsx}', { 
          cwd: dir, 
          maxDepth: 2,
          ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**']
        });
        relevantFiles.push(...files.slice(0, 10));
      } catch (e) {
        // glob no disponible, continuar sin él
      }
    }
    context.relevantFiles = relevantFiles;

  } catch (error) {
    console.warn(chalk.yellow(`⚠ Error escaneando contexto: ${error.message}`));
  }

  return context;
}

/**
 * Detectar tipo de proyecto
 */
function detectProjectType(pkg) {
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  if (deps['react'] || deps['next']) return 'react';
  if (deps['express'] || deps['fastify'] || deps['hono']) return 'node-api';
  if (deps['convex']) return 'convex';
  
  return 'unknown';
}

/**
 * Construir prompt especializado
 */
async function buildPrompt(options, context, profile, template) {
  const {
    description,
    type = 'react',
    dryRun = false,
    verbose = false
  } = options;

  // Contexto del proyecto
  let projectContext = '';
  if (context.projectName) {
    projectContext += `\nProyecto: ${context.projectName}`;
  }
  if (context.projectType) {
    projectContext += `\nTipo: ${context.projectType}`;
  }
  if (context.typescript) {
    projectContext += '\nTypeScript: SÍ';
  }
  if (context.dependencies.dependencies?.react) {
    projectContext += `\nReact: ${context.dependencies.dependencies.react}`;
  }
  if (context.dependencies.dependencies?.convex) {
    projectContext += `\nConvex: ${context.dependencies.dependencies.convex}`;
  }

  // Archivo objetivo si existe
  let targetContext = '';
  if (context.targetFile) {
    targetContext = `

ARCHIVO ACTUAL (${context.targetFile.path}):
\`\`\`${context.targetFile.extension.replace('.', '')}
${context.targetFile.content.substring(0, 2000)}
\`\`\``;
  }

  // Archivos relevantes
  let relevantFilesContext = '';
  if (context.relevantFiles && context.relevantFiles.length > 0) {
    relevantFilesContext = `

ARCHIVOS RELACIONADOS EN EL DIRECTORIO:
${context.relevantFiles.map(f => `- ${f}`).join('\n')}`;
  }

  // Plantilla si existe
  let templateContext = '';
  if (template) {
    templateContext = `

PLANTILLA A SEGUIR:
${template.prompt}`;
  }

  // Construir system prompt completo
  const systemPrompt = `Eres un generador de código. NO piensas en voz alta. NO explicas tu proceso. NO haces planes.

DIRECTAMENTE genera el código FINAL y completo.

CONTEXTO DEL PROYECTO:${projectContext}
${targetContext}
${relevantFilesContext}
${templateContext}

REGLAS ABSOLUTAS:
- NO expliques nada
- NO hagas planes ni outlines
- NO digas "vamos a implementar" ni nada similar
- EMPIEZA directamente con el bloque de código \`\`\`tsx o \`\`\`ts
- El código debe ser PRODUCTION-READY
- Manejo de errores completo
- Tipado estricto TypeScript
- Imports organizados
- Sin TODOs ni placeholders

PERFIL:
${profile.prompt}

TAREA: ${description}

Genera el código AHORA. SOLO el código. Sin preámbulos:`;

  return systemPrompt;
}

/**
 * Llamar a la IA — Gemini API con modelo Gemma 4 (31b)
 */
async function callAI(prompt, options = {}) {
  const { profile, verbose = false } = options;
  
  // Leer API key de Gemini directamente del .env.aurora
  let apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    try {
      const envContent = await readFile(join(ROOT_DIR, '.env.aurora'), 'utf-8');
      for (const line of envContent.split('\n')) {
        const trimmed = line.trim();
        if (trimmed.startsWith('GEMINI_API_KEY=')) {
          apiKey = trimmed.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
          break;
        }
      }
    } catch (e) {
      console.error(chalk.red(`⚠ Error leyendo .env.aurora: ${e.message}`));
    }
  }

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no configurada. Agrega la key a .env.aurora');
  }

  // Temperatura baja para código determinista
  const temperature = 0.1;

  // Usar Gemini 2.5 Flash (free tier, mejor para código que Gemma 4 directo)
  // Gemma 4 via Gemini API = mismo modelo, mejor infraestructura
  const model = 'gemini-2.5-flash';

  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { 
      temperature, 
      maxOutputTokens: 8192,
      topP: 0.95,
      topK: 64
    }
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const headers = { 'Content-Type': 'application/json' };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

/**
 * Extraer código del resultado de la IA
 */
function extractCode(aiResponse) {
  // Buscar bloques de código ```lang ... ```
  const codeBlockRegex = /```(?:tsx|typescript|ts|jsx|js|css|html)?\s*\n([\s\S]*?)```/g;
  const matches = [];
  let match;

  while ((match = codeBlockRegex.exec(aiResponse)) !== null) {
    const code = match[1].trim();
    if (code.length > 20) { // Ignorar bloques muy pequeños
      matches.push(code);
    }
  }

  if (matches.length > 0) {
    // Unir todos los bloques encontradosos
    return matches.join('\n\n');
  }

  // Si no hay bloques de código, devolver todo limpio
  return aiResponse
    .replace(/^[\s]*(thinking|plan|let'|ok|sure|here|great|alright)[\s\S]*?\n/gi, '')
    .trim();
}

/**
 * Determinar extensión del archivo según tipo
 */
function getExtension(type) {
  const extensions = {
    'react': '.tsx',
    'convex': '.ts',
    'api': '.ts',
    'test': '.test.ts',
    'type': '.ts',
    'hook': '.ts',
    'service': '.ts',
    'util': '.ts'
  };
  return extensions[type] || '.ts';
}

/**
 * Función principal: generar código
 */
export default async function generateCode(options) {
  const startTime = Date.now();
  const {
    description,
    type = 'react',
    profile: profileName = DEFAULT_PROFILE,
    output = null,
    dryRun = false,
    verbose = false,
    rootDir = ROOT_DIR,
    gemmaDir = GEMMA_DIR
  } = options;

  const spinner = verbose ? null : ora({
    text: chalk.cyan('Preparando contexto del proyecto...'),
    color: 'cyan'
  });

  try {
    // 1. Cargar perfil
    if (spinner) spinner.text = chalk.cyan(`Cargando perfil: ${profileName}`);
    const profile = await loadProfile(profileName);

    // 2. Cargar plantilla
    if (spinner) spinner.text = chalk.cyan('Cargando plantilla...');
    const template = await loadTemplate(type);

    // 3. Escanear contexto del proyecto
    if (spinner) spinner.text = chalk.cyan('Escaneando proyecto...');
    const context = await scanProjectContext(rootDir);

    // 4. Construir prompt
    if (spinner) spinner.text = chalk.cyan('Construyendo prompt especializado...');
    const prompt = await buildPrompt(
      { description, type, dryRun, verbose },
      context,
      profile,
      template
    );

    // 5. Llamar a IA
    if (spinner) spinner.text = chalk.cyan('Generando código con IA...');
    const aiResponse = await callAI(prompt, { profile, verbose });

    // 6. Extraer código
    if (spinner) spinner.text = chalk.cyan('Procesando resultado...');
    const code = extractCode(aiResponse);
    const extension = getExtension(type);

    // 7. Determinar ruta de salida
    let outputPath;
    if (output) {
      outputPath = resolve(rootDir, output);
    } else {
      // Generar nombre basado en descripción
      const safeName = description
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 50);
      
      const targetDir = type === 'react' ? 'src/components' : 
                        type === 'convex' ? 'convex' :
                        type === 'api' ? 'src/routes' :
                        type === 'test' ? 'tests' : 'src';
      
      outputPath = resolve(rootDir, targetDir, `${safeName}${extension}`);
    }

    // 8. Guardar archivo (si no es dry-run)
    if (!dryRun) {
      const dir = dirname(outputPath);
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
      await writeFile(outputPath, code, 'utf-8');
    }

    const timeMs = Date.now() - startTime;

    return {
      success: true,
      code,
      filePath: dryRun ? null : outputPath,
      lineCount: code.split('\n').length,
      timeMs,
      dryRun
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

/**
 * Modo chat interactivo
 */
export async function runChat(options) {
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });

  const profile = await loadProfile(options.profile);
  const ask = (q) => new Promise(resolve => rl.question(q, resolve));

  console.log('\n' + chalk.cyanBright.bold('✦ GEMMA CHAT - Modo Interactivo ✦'));
  console.log(chalk.dim('Escribe tu solicitud de código o /exit para salir\n'));

  while (true) {
    const input = await ask(chalk.cyan('✦ › '));

    if (!input.trim()) continue;
    if (input === '/exit') {
      rl.close();
      process.exit(0);
    }

    const spinner = ora({ text: chalk.gray('Generando...'), color: 'cyan' }).start();
    
    try {
      const result = await generateCode({
        description: input,
        profile: options.profile,
        verbose: options.verbose,
        rootDir: options.rootDir,
        gemmaDir: options.gemmaDir
      });

      spinner.stop();

      if (result.success) {
        console.log('\n' + chalk.greenBright('✓ Código generado:'));
        console.log(chalk.white(result.code));
        console.log(chalk.dim(`\n(${result.lineCount} líneas, ${result.timeMs}ms)`));
      } else {
        console.log(chalk.redBright(`✗ Error: ${result.error}`));
      }
    } catch (error) {
      spinner.stop();
      console.log(chalk.redBright(`✗ Error: ${error.message}`));
    }

    console.log('\n' + chalk.dim('---\n'));
  }
}
