#!/usr/bin/env node
/**
 * 🐋 DEEPSEEK CODE INTELLIGENCE - RAW CLI v1.0.0
 * 
 * Interfaz de razonamiento profundo para auditoría y caza de bugs.
 * Optimizado para captura de stdout y modo "Thinking".
 */

import { fetch } from 'undici';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { program } from 'commander';
import readline from 'node:readline';

// Load Env from Aurora
dotenv.config({ path: '.env.aurora' });

const ROOT_DIR = process.cwd();

// ============================================================================
// CORE AI LOGIC
// ============================================================================

async function readRepoContext() {
  try {
    const agentsFile = path.join(ROOT_DIR, 'AGENTS.md');
    const boardFile = path.join(ROOT_DIR, 'TASK_BOARD.md');
    
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

async function callDeepSeek(prompt, options = {}) {
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;

  if (!deepseekKey && !openrouterKey) {
    return '<<<WRITE_FILE:stdout>>>🔴 ERROR: No se detectó DEEPSEEK_API_KEY ni OPENROUTER_API_KEY en .env.aurora. Configura al menos una para usar DeepSeek V4 Pro de forma gratuita via OpenRouter.<<<END_WRITE_FILE>>>';
  }

  let baseUrl, apiKey, model;

  if (deepseekKey) {
    baseUrl = 'https://api.deepseek.com/v1/chat/completions';
    apiKey = deepseekKey;
    model = options.reasoning ? 'deepseek-v4-pro' : 'deepseek-v4-flash';
  } else {
    baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
    apiKey = openrouterKey;
    // Intentamos usar el modelo Pro directamente
    model = options.reasoning ? 'deepseek/deepseek-v4-pro' : 'deepseek/deepseek-v4-pro';
  }

  const repoContext = await readRepoContext();
  const systemMsg = `Eres DeepSeek V4 Pro, un experto en razonamiento profundo y auditoría de software.
${repoContext}

REGLA ABSOLUTA: Tu respuesta DEBE ser ÚNICAMENTE bloques de formato <<<WRITE_FILE:ruta>>>contenido<<<END_WRITE_FILE>>>. 
PROHIBIDO cualquier texto fuera de estos bloques. 
PROHIBIDO explicaciones, metadatos, o texto adicional. 
SOLO el formato WRITE_FILE. Si no necesitas crear archivos, responde con <<<WRITE_FILE:stdout>>>tu respuesta<<<END_WRITE_FILE>>>.`;

  const body = {
    model: model,
    messages: [
      { role: 'system', content: systemMsg },
      { role: 'user', content: prompt }
    ],
    temperature: options.reasoning ? 0.0 : 0.2,
    max_tokens: 8192
  };

  try {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://trade-share-three.vercel.app', // Required by OpenRouter
        'X-Title': 'TradeShare Aurora'
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    
    if (data.error) {
      return `<<<WRITE_FILE:stdout>>>❌ Error de API (${deepseekKey ? 'DeepSeek' : 'OpenRouter'}): ${data.error.message || JSON.stringify(data.error)}<<<END_WRITE_FILE>>>`;
    }

    return data.choices?.[0]?.message?.content || '';
  } catch (err) {
    return `<<<WRITE_FILE:stdout>>>⚠️ ERROR DE CONEXIÓN: ${err.message}<<<END_WRITE_FILE>>>`;
  }
}

// ============================================================================
// CLI ACTIONS
// ============================================================================

const actions = {
  chat: async (cmd) => {
    const isReasoning = cmd.reasoning || false;
    console.log(`--- MODO CHAT DEEPSEEK ACTIVO (${isReasoning ? 'REASONING' : 'FLASH'}) ---`);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'DEEPSEEK> '
    });

    rl.prompt();

    rl.on('line', async (line) => {
      const input = line.trim();
      if (input.toLowerCase() === '/exit') process.exit(0);

      if (input) {
        const response = await callDeepSeek(input, { reasoning: isReasoning });
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
  
  audit: async () => {
    console.log('⏳ Ejecutando AUDITORÍA PROFUNDA con DeepSeek V4 Pro...');
    const result = await callDeepSeek(`Realiza una AUDITORÍA DE SEGURIDAD Y LÓGICA de los últimos cambios. 
    Usa tu modo de razonamiento profundo para encontrar bugs sutiles, race conditions o fallos en el flujo de datos.
    Responde ÚNICAMENTE en formato <<<WRITE_FILE:stdout>>>CONTENIDO<<<END_WRITE_FILE>>>.`, { reasoning: true });
    
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
  .name('deepseek')
  .description('DeepSeek Code Intelligence CLI')
  .version('1.0.0');

program
  .command('chat')
  .description('Modo interactivo')
  .option('-r, --reasoning', 'Habilitar modo razonamiento profundo (V4 Pro)')
  .action(actions.chat);

program
  .command('audit')
  .description('Realiza una auditoría profunda de los cambios')
  .action(actions.audit);

program.parse();
