#!/usr/bin/env node
/**
 * Aurora Qwen Agent - Consultor de Código
 * 
 * Integración con Qwen (Alibaba Cloud) para code review y consultas pre-implementación
 */

import { config } from 'dotenv';
import { readFileSync, statSync } from 'fs';

config();

const QWEN_API_KEY = process.env.QWEN_API_KEY;
const QWEN_API_URL = process.env.QWEN_API_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';
const QWEN_MODEL = process.env.QWEN_MODEL || 'qwen-plus';
const MAX_FILE_SIZE = 500 * 1024; // 500KB por archivo
const MAX_TOTAL_CONTEXT = 4 * 1024 * 1024; // 4MB total de contexto

interface QwenOptions {
  files?: string[];
  focus?: string;
  context?: Record<string, any>;
}

interface QwenResponse {
  success: boolean;
  answer: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Consultar a Qwen con contexto del proyecto (OpenAI-compatible interface)
 */
export async function askQwen(
  question: string,
  options: QwenOptions = {}
): Promise<QwenResponse> {
  if (!QWEN_API_KEY) {
    console.warn('⚠️ QWEN_API_KEY no configurada. Usando modo simulación.');
    return simulateQwenResponse(question, options);
  }

  const systemPrompt = buildSystemPrompt(options);
  
  try {
    const response = await fetch(`${QWEN_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${QWEN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: QWEN_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Qwen API error: ${response.status} - ${text.substring(0, 200)}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      answer: data.choices?.[0]?.message?.content || data.output?.text || 'Sin respuesta',
      usage: data.usage,
    };
  } catch (error) {
    console.error('❌ Error consultando a Qwen:', error);
    return {
      success: false,
      answer: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Code review de archivos
 */
export async function askQwenCodeReview(
  files: string[],
  focus: string = 'Seguridad, Performance, Best Practices'
): Promise<QwenResponse> {
  let totalSize = 0;
  const fileContentParts: string[] = [];

  for (const file of files) {
    if (totalSize > MAX_TOTAL_CONTEXT) {
      fileContentParts.push(`=== ${file} ===\n[OMITIDO: Límite de contexto total alcanzado]`);
      continue;
    }

    try {
      const stats = statSync(file);
      if (stats.size > MAX_FILE_SIZE) {
        fileContentParts.push(`=== ${file} ===\n[TRUNCADO: Archivo demasiado grande (${(stats.size/1024).toFixed(1)}KB)]`);
        const content = readFileSync(file, 'utf-8').substring(0, MAX_FILE_SIZE);
        fileContentParts.push(content + '\n... [fin de truncado]');
        totalSize += MAX_FILE_SIZE;
        continue;
      }

      const content = readFileSync(file, 'utf-8');
      fileContentParts.push(`=== ${file} ===\n${content}`);
      totalSize += stats.size;
    } catch (err) {
      fileContentParts.push(`=== ${file} ===\n[ERROR: No se pudo leer el archivo]`);
    }
  }

  const fileContents = fileContentParts.join('\n\n');

  const question = `REALIZA UN CODE REVIEW DETALLADO de los siguientes archivos.

Focus: ${focus}

${fileContents}

Responde en formato markdown con:
1. **Resumen ejecutivo** (2-3 líneas)
2. **Issues encontrados** (tabla con severidad, archivo, línea, problema, sugerencia)
3. **Aprobación** (✅ Aprobado / ❌ Necesita cambios)
4. **Sugerencias de mejora** (si hay)
`;

  return askQwen(question, { files, focus });
}

/**
 * Consultar antes de implementar
 */
export async function askQwenPreImpl(
  task: string,
  filesToEdit: string[],
  constraints: string[]
): Promise<QwenResponse> {
  const question = `Eres un ARQUITECTO DE SOFTWARE SENIOR. 

Analiza el siguiente task y detecta:
1. Problemas de diseño o arquitectura
2. Posibles vulnerabilidades de seguridad
3. Issues de performance
4. Mejores prácticas a seguir

**TASK:** ${task}

**Archivos a editar:**
${filesToEdit.map(f => `- ${f}`).join('\n')}

**Restricciones:**
${constraints.map(c => `- ${c}`).join('\n')}

Responde con:
1. **Análisis** (problemas detectados)
2. **Enfoque recomendado** (pasos)
3. **Advertencias** (cosas a evitar)
4. **Checks de seguridad** (validaciones necesarias)
`;

  return askQwen(question, { files: filesToEdit });
}

/**
 * Construir prompt de sistema basado en contexto
 */
function buildSystemPrompt(options: QwenOptions): string {
  let prompt = `Eres QWEN, un CONSULTOR DE CÓDIGO SENIOR especializado en:

- **Code Review** - Detectar code smells, vulnerabilidades, issues de performance
- **Best Practices** - Patrones de diseño, TypeScript, React, Node.js
- **Seguridad** - OWASP, validación de inputs, auth, permisos
- **Performance** - Optimización de queries, índices, caché
- **Arquitectura** - Clean code, SOLID, patrones

IDIOMA: Responde en español (excepto código).
FORMATO: Usa markdown para estructurar respuestas.
TIPO: Sé directo y técnico, sin rodeos.`;

  if (options.focus) {
    prompt += `\n\nFOCUS ACTUAL: ${options.focus}`;
  }

  if (options.files && options.files.length > 0) {
    prompt += `\n\nARCHIVOS RELACIONADOS: ${options.files.join(', ')}`;
  }

  prompt += `

CONTEXTO DEL PROYECTO (TradeShare 2.0):
- Stack: TypeScript, React, Vite, Convex (backend), TailwindCSS
- Arquitectura: Services layer con Convex, hooks personalizados
- Auth: Convex auth con email/password y Google OAuth
- DB: Convex (vector DB), MercadoPago para pagos
- Estructura: src/services/*, src/hooks/*, src/components/*, src/views/*

REGLAS DE ANÁLISIS:
1. Severidades: 🔴 CRÍTICA, 🟡 MEDIA, 🟢 MENOR
2. Para cada issue, indica: qué, dónde, por qué es problema, cómo corregirlo
3. Prioriza seguridad > performance > mantenibilidad
4. Si el código está bien, dilo claramente`;

  return prompt;
}

/**
 * Simulación cuando no hay API key
 */
async function simulateQwenResponse(question: string, options: QwenOptions): Promise<QwenResponse> {
  console.log('🤖 [QWEN SIMULADO] Procesando consulta...');
  
  const isCodeReview = question.includes('CODE REVIEW');
  const isPreImpl = question.includes('ARQUITECTO DE SOFTWARE');

  if (isCodeReview) {
    return {
      success: true,
      answer: `## 🔍 Code Review Simulado

⚠️ **NOTA:** QWEN_API_KEY no configurada. Esta es una respuesta simulada.

### Issues Simulados Detectados:

| Severidad | Archivo | Issue | Sugerencia |
|-----------|---------|-------|------------|
| 🟡 Media | - | Verificar configuración real | Configurar QWEN_API_KEY |

### Recomendación:
Configure la API key de Qwen para obtener análisis real.

\`\`\`bash
# Agregar a .env.local
QWEN_API_KEY=tu_api_key_aqui
\`\`\`
`,
    };
  }

  if (isPreImpl) {
    return {
      success: true,
      answer: `## 📋 Análisis Pre-Implementación Simulado

⚠️ **NOTA:** QWEN_API_KEY no configurada.

### Análisis:
Para obtener análisis real, configure QWEN_API_KEY en .env.local

### Checks recomendados:
1. ✅ Validar ownership en mutations
2. ✅ Verificar auth en queries
3. ✅ Usar Convex en vez de localStorage
4. ✅ Documentar contratos frontend/backend
`,
    };
  }

  return {
    success: true,
    answer: `⚠️ QWEN en modo simulación.

Para activar Qwen real, configure:
\`\`\`bash
QWEN_API_KEY=your_api_key
\`\`\``,
  };
}

/**
 * Verificar configuración
 */
export function checkQwenStatus(): { configured: boolean; message: string } {
  if (!QWEN_API_KEY) {
    return {
      configured: false,
      message: '❌ QWEN_API_KEY no configurada. Agregar a .env.local',
    };
  }

  return {
    configured: true,
    message: `✅ Qwen configurado (${QWEN_MODEL})`,
  };
}

// CLI usage
if (process.argv[1] && process.argv[1].includes('aurora-qwen-agent')) {
  const question = process.argv.slice(2).join(' ');
  
  if (!question) {
    console.log('Uso: node aurora-qwen-agent.mjs "<pregunta>"');
    process.exit(1);
  }

  askQwen(question).then(result => {
    console.log(result.answer);
    process.exit(result.success ? 0 : 1);
  });
}
