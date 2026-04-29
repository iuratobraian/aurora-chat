#!/usr/bin/env node
/**
 * 💎 GEMMA CODE STUDIO - RAW CLI v1.1.0
 * 
 * Interfaz de datos crudos para interoperabilidad entre agentes.
 * Optimizado para captura de stdout.
 */

import { fetch } from 'undici';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { loadENV } from '../../../aurora/scripts/load-aurora-env.mjs';
import { program } from 'commander';
import readline from 'node:readline';

// Load Env
loadENV();

const ROOT_DIR = process.cwd();

// ============================================================================
// CORE AI LOGIC
// ============================================================================

async function readRepoContext() {
  try {
    const agentsFile = path.join(ROOT_DIR, 'AGENTS.md');
    const boardFile = path.join(ROOT_DIR, '.agent/workspace/coordination/TASK_BOARD.md');
    
    const [agents, board] = await Promise.all([
      readFile(agentsFile, 'utf8').catch(() => ''),
      readFile(boardFile, 'utf8').catch(() => '')
    ]);

    return `
ESTADO DEL PROYECTO:
${board.substring(0, 3000)}

PROTOCOLOS CRÍTICOS:
${agents.substring(0, 3000)}
`;
  } catch (e) {
    return "";
  }
}

function cleanAuroraResponse(text) {
  const lines = text.split('\n');
  return lines.filter(line => {
    const l = line.toLowerCase().trim();
    if (/^(\*|\-|\d+\.|\•)?\s*(identity|tone|role|context|user|goal|intro|summary|thinking|thought|plan|draft|requirements|persona|clarification|proposal|greeting)/i.test(l)) return false;
    if (l.startsWith('the user is')) return false;
    if (l.startsWith('i need to')) return false;
    if (l.startsWith('acknowledgment:')) return false;
    if (l.startsWith('initial action:')) return false;
    if (l.includes('╭────') || l.includes('╰────') || l.includes('│')) {
       if (l.includes('thinking') || l.includes('thought')) return false;
    }
    return true;
  }).join('\n').trim();
}

async function callGemma(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return '<<<WRITE_FILE:stdout>>>🔴 ERROR: GEMINI_API_KEY no configurada en .env.aurora<<<END_WRITE_FILE>>>';

  const models = [
    'gemini-2.5-flash', // Primario (Alta demanda)
    'gemma-4-31b-it',   // Secundario (Estable)
    'gemini-2.0-flash', 
    'gemini-1.5-flash'
  ];

  const repoContext = await readRepoContext();
  const profilePath = path.resolve(ROOT_DIR, 'gemma/src/core/profiles/fullstack-senior.md');
  const profile = await readFile(profilePath, 'utf8').catch(() => 'IA Experta en Software de TradeShare.');

  const systemMsg = `${profile}\n\n${repoContext}\n\nREGLA ABSOLUTA: Tu respuesta DEBE ser ÚNICAMENTE bloques de formato <<<WRITE_FILE:ruta>>>contenido<<<END_WRITE_FILE>>>. PROHIBIDO cualquier texto fuera de estos bloques. PROHIBIDO explicaciones, pensamiento, metadatos, listas con asteriscos, o texto adicional. SOLO el formato WRITE_FILE. Si no necesitas crear archivos, responde con <<<WRITE_FILE:stdout>>>tu respuesta<<<END_WRITE_FILE>>>.`;

  const body = {
    system_instruction: {
      parts: [{ text: systemMsg }]
    },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 8192
    }
  };

  let lastError = null;

  for (const model of models) {
    const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    
    try {
      const controller = new AbortController();
      const timeout = parseInt(process.env.AURORA_AI_TIMEOUT || "120000");
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const res = await fetch(`${baseUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await res.json();
      
      if (data.error) {
        if (data.error.message.includes('leaked')) {
          return `<<<WRITE_FILE:stdout>>>🔴 ERROR CRÍTICO: Tu GEMINI_API_KEY ha sido reportada como FILTRADA (Leaked). 
Por favor, genera una nueva key en https://aistudio.google.com/ y actualiza tu .env.aurora.<<<END_WRITE_FILE>>>`;
        }
        
        console.warn(`[GEMMA] Fallo con modelo ${model}: ${data.error.message}. Intentando fallback...`);
        lastError = `<<<WRITE_FILE:stdout>>>❌ Error final de API (${data.error.code}): ${data.error.message}<<<END_WRITE_FILE>>>`;
        continue;
      }

      const rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!rawResponse) {
        console.warn(`[GEMMA] Respuesta vacía de ${model}. Intentando fallback...`);
        continue;
      }
      
      return cleanAuroraResponse(rawResponse);
    } catch (err) {
      if (err.name === 'AbortError') {
        console.warn(`[GEMMA] Timeout con ${model}. Intentando fallback...`);
        lastError = '<<<WRITE_FILE:stdout>>>⚠️ ERROR DE CONEXIÓN: Timeout final - Gemma no respondió.<<<END_WRITE_FILE>>>';
      } else {
        console.warn(`[GEMMA] Error de conexión con ${model}: ${err.message}. Intentando fallback...`);
        lastError = `<<<WRITE_FILE:stdout>>>⚠️ ERROR DE CONEXIÓN: ${err.message}.<<<END_WRITE_FILE>>>`;
      }
      continue;
    }
  }

  return lastError;
}

// ============================================================================
// CLI ACTIONS
// ============================================================================

const actions = {
  chat: async () => {
    console.log('--- MODO CHAT GEMMA ACTIVO (RAW MODE) ---');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'GEMMA> '
    });

    rl.prompt();

    rl.on('line', async (line) => {
      const input = line.trim();
      if (input.toLowerCase() === '/exit') process.exit(0);

      if (input) {
        const response = await callGemma(input);
        const writeRegex = /<<<WRITE_FILE:(.*?)>>>([\s\S]*?)<<<END_WRITE_FILE>>>/g;
        let match;
        while ((match = writeRegex.exec(response)) !== null) {
          const filePath = match[1].trim();
          const content = match[2].trim();
          if (filePath !== 'stdout') {
            const fullPath = path.join(ROOT_DIR, filePath);
            await mkdir(path.dirname(fullPath), { recursive: true });
            await writeFile(fullPath, content, 'utf8');
            console.log(`[FILE_SAVED]: ${filePath}`);
          } else {
            console.log(content);
          }
        }
      }
      rl.prompt();
    });
  },
  
  briefing: async () => {
    const result = await callGemma(`Analiza el TASK_BOARD.md y AGENTS.md. Genera un BRIEFING TÁCTICO DE INGENIERÍA 
    para la próxima tarea pendiente. Identifica riesgos y define el stack técnico necesario. 
    Responde ÚNICAMENTE en formato <<<WRITE_FILE:stdout>>>CONTENIDO<<<END_WRITE_FILE>>>.`);
    
    const writeRegex = /<<<WRITE_FILE:stdout>>>([\s\S]*?)<<<END_WRITE_FILE>>>/g;
    const match = writeRegex.exec(result);
    if (match) console.log(match[1].trim());
    else console.log(result);
  },

  audit: async () => {
    const result = await callGemma(`Realiza una AUDITORÍA FINAL de los últimos cambios realizados. 
    Cruza el AGENT_LOG.md con el código actual y confirma si se han cumplido los protocolos de AGENTS.md. 
    Genera un veredicto de APROBADO o RECHAZADO con justificación técnica.
    Responde ÚNICAMENTE en formato <<<WRITE_FILE:stdout>>>CONTENIDO<<<END_WRITE_FILE>>>.`);
    
    const writeRegex = /<<<WRITE_FILE:stdout>>>([\s\S]*?)<<<END_WRITE_FILE>>>/g;
    const match = writeRegex.exec(result);
    if (match) console.log(match[1].trim());
    else console.log(result);
  }
};

// ============================================================================
// COMMANDER SETUP
// ============================================================================

program
  .name('gemma')
  .description('Gemma Code Studio CLI (Raw Version)')
  .version('1.1.0');

program
  .command('chat')
  .description('Modo interactivo simple')
  .action(actions.chat);

program
  .command('briefing')
  .description('Genera un briefing táctico basado en el TASK_BOARD')
  .action(actions.briefing);

program
  .command('command <cmd>')
  .description('Envía un comando directo a Gemma')
  .action(async (cmd) => {
    const response = await callGemma(cmd);
    const writeRegex = /<<<WRITE_FILE:(.*?)>>>([\s\S]*?)<<<END_WRITE_FILE>>>/g;
    let match;
    while ((match = writeRegex.exec(response)) !== null) {
      const filePath = match[1].trim();
      const content = match[2].trim();
      if (filePath === 'stdout') {
        console.log(content);
      }
    }
  });

program
  .command('audit')
  .description('Realiza una auditoría final de los cambios')
  .action(actions.audit);

program.parse();
