import { fetch } from 'undici';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Cargar variables de entorno
const envFile = path.join(rootDir, '.env.aurora');
try {
  const env = await readFile(envFile, 'utf8');
  env.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) process.env[key.trim()] = val.trim();
  });
} catch (e) {
  console.error('⚠️  No se pudo leer .env.aurora:', e.message);
  process.exit(1);
}

// Obtener cambios recientes de git
let gitDiff = '';
try {
  gitDiff = execSync('git diff HEAD~5 --stat', { cwd: rootDir, encoding: 'utf8' });
} catch (e) {
  gitDiff = '(no se pudo obtener diff de git)';
}

// Obtener estado actual
let gitStatus = '';
try {
  gitStatus = execSync('git status --short', { cwd: rootDir, encoding: 'utf8' });
} catch (e) {
  gitStatus = '(no se pudo obtener git status)';
}

// Leer TASK_BOARD.md resumido
let taskBoard = '';
try {
  const tb = await readFile(path.join(rootDir, 'TASK_BOARD.md'), 'utf8');
  taskBoard = tb.substring(0, 3000);
} catch (e) {
  taskBoard = '(no se pudo leer TASK_BOARD.md)';
}

// Leer AGENT_LOG.md resumido
let agentLog = '';
try {
  const al = await readFile(path.join(rootDir, 'AGENT_LOG.md'), 'utf8');
  agentLog = al.substring(0, 2000);
} catch (e) {
  agentLog = '(no se pudo leer AGENT_LOG.md)';
}

const prompt = `Eres DEEPSEEK V4 PRO, el modelo de razonamiento más avanzado del mundo. 
Tu tarea es realizar una AUDITORÍA PROFUNDA de los últimos cambios en el proyecto TradeShare.

## RECIENTES CAMBIOS (Git Diff):
${gitDiff}

## ESTADO DE LA SESIÓN:
${gitStatus}

## TASK_BOARD (Contexto):
${taskBoard}

## AGENT_LOG (Acciones):
${agentLog}

---

## OBJETIVOS DE LA AUDITORÍA PROFUNDA:
1. **Lógica Compleja**: Detectar race conditions, fallos en el manejo de estado de React o errores en mutaciones de Convex.
2. **Seguridad Crítica**: Verificar que no haya fugas de datos, fallos en RLS o problemas de validación de identidad.
3. **Optimización de Razonamiento**: Identificar si hay una forma más elegante o eficiente de resolver los problemas planteados.

Entrega un informe detallado con:
- ** Hallazgos Críticos**: Errores que deben corregirse inmediatamente.
- ** Sugerencias de Razonamiento**: Mejoras arquitectónicas.
- ** Veredicto**: APROBADO o RECHAZADO (con justificación).

Responde en español, usando tu capacidad máxima de razonamiento (modo thinking).`;

const deepseekKey = process.env.DEEPSEEK_API_KEY;
const openrouterKey = process.env.OPENROUTER_API_KEY;

if (!deepseekKey && !openrouterKey) {
  console.error('❌ No se detectó DEEPSEEK_API_KEY ni OPENROUTER_API_KEY en .env.aurora');
  process.exit(1);
}

let baseUrl, apiKey, model;

if (deepseekKey) {
  baseUrl = 'https://api.deepseek.com/v1/chat/completions';
  apiKey = deepseekKey;
  model = 'deepseek-v4-pro';
} else {
  baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
  apiKey = openrouterKey;
  model = 'deepseek/deepseek-v4-pro';
}

const body = {
  model: model,
  messages: [
    { role: 'system', content: 'Eres DEEPSEEK V4 PRO, experto en auditoría profunda y arquitectura de software. Responde siempre en español.' },
    { role: 'user', content: prompt }
  ],
  temperature: 0.1,
  max_tokens: 8192
};

console.log('🐋 DEEPSEEK V4 PRO AUDITORÍA PROFUNDA - AURORA MASTERMIND\n');
console.log(`⏳ Consultando a DeepSeek V4 Pro vía ${deepseekKey ? 'DeepSeek' : 'OpenRouter'} (Razonamiento profundo activo)...\n`);

const controller = new AbortController();
const timeoutId = setTimeout(() => {
  controller.abort();
  console.error('\n❌ Timeout: DeepSeek no respondió a tiempo');
  process.exit(1);
}, 180000); // 180s for deep reasoning

try {
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://trade-share-three.vercel.app',
        'X-Title': 'TradeShare Aurora'
    },
    body: JSON.stringify(body),
    signal: controller.signal
  });

  clearTimeout(timeoutId);

  if (!res.ok) {
    console.error(`❌ Error HTTP ${res.status}: ${res.statusText}`);
    const errorText = await res.text();
    console.error('Detalles:', errorText.substring(0, 500));
    process.exit(1);
  }

  const data = await res.json();

  if (data.choices?.[0]?.message?.content) {
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 AUDITORÍA DE DEEPSEEK V4 PRO:');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(data.choices[0].message.content);
    console.log('\n═══════════════════════════════════════════════════════');
  } else {
    console.log('⚠️ Sin respuesta completa de DeepSeek:');
    console.log(JSON.stringify(data, null, 2).substring(0, 1000));
  }
} catch (error) {
  clearTimeout(timeoutId);
  if (error.name === 'AbortError') {
    console.error('\n❌ Timeout: La petición fue abortada');
  } else {
    console.error('\n❌ Error inesperado:', error.message);
  }
  process.exit(1);
}
