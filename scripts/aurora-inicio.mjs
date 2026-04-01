#!/usr/bin/env node
/**
 * aurora-inicio.mjs — Aurora Session Starter
 *
 * Inicia sesión de Aurora con verificación de Notion
 * Todos los comandos @aurora están disponibles
 *
 * Uso: npm run inicio
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

// Load .env.aurora
function loadEnv(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    content.split('\n').forEach(line => {
      line = line.trim();
      if (!line || line.startsWith('#')) return;
      const eqIdx = line.indexOf('=');
      if (eqIdx === -1) return;
      let key = line.slice(0, eqIdx).trim();
      let val = line.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    });
  } catch { /* file not found, skip */ }
}
loadEnv('.env.aurora');

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const ROOT = process.cwd();

// Colors
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const MAGENTA = '\x1b[35m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';
const WHITE = '\x1b[37m';

function banner() {
  console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${CYAN}║   🌊 @aurora — INICIO DE SESIÓN                      ║${RESET}`);
  console.log(`${BOLD}${CYAN}║   Agente Integrador Principal                        ║${RESET}`);
  console.log(`${BOLD}${CYAN}║   Fuente de verdad: Notion                           ║${RESET}`);
  console.log(`${BOLD}${CYAN}╚══════════════════════════════════════════════════════╝${RESET}\n`);
  console.log(`${DIM}Fecha: ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}${RESET}\n`);
  
  // Aurora AI Presence Banner
  console.log(`${BOLD}${MAGENTA}╔══════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${MAGENTA}║   🤖 AURORA AI PRESENCE ACTIVADA                    ║${RESET}`);
  console.log(`${BOLD}${MAGENTA}║   Comandos disponibles:                              ║${RESET}`);
  console.log(`${BOLD}${MAGENTA}║   @aurora help     → Mostrar comandos               ║${RESET}`);
  console.log(`${BOLD}${MAGENTA}║   @aurora review   → Code review                     ║${RESET}`);
  console.log(`${BOLD}${MAGENTA}║   @aurora analyze  → Análisis profundo               ║${RESET}`);
  console.log(`${BOLD}${MAGENTA}║   @aurora optimize → Optimización                    ║${RESET}`);
  console.log(`${BOLD}${MAGENTA}║   @aurora memory   → Memory leak detection           ║${RESET}`);
  console.log(`${BOLD}${MAGENTA}║   @aurora status   → Estado del sistema              ║${RESET}`);
  console.log(`${BOLD}${MAGENTA}║   @aurora tasks    → Ver tareas pendientes           ║${RESET}`);
  console.log(`${BOLD}${MAGENTA}╚══════════════════════════════════════════════════════╝${RESET}\n`);
  
  console.log(`${BOLD}${RED}🚫 PROHIBIDO: TurboQuant eliminado permanentemente. No referenciar.${RESET}`);
  console.log(`${DIM}────────────────────────────────────────────────────────${RESET}\n`);
}

async function main() {
  banner();
  
  // Git pull
  console.log(`${DIM}🔄 Sincronizando con Git...${RESET}`);
  try {
    execSync('git pull origin main', { cwd: ROOT, stdio: 'ignore' });
    console.log(`${GREEN}✓ Repositorio actualizado${RESET}\n`);
  } catch (err) {
    console.log(`${YELLOW}⚠ Git pull omitido${RESET}\n`);
  }
  
  // Check Notion
  if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
    console.log(`${YELLOW}⚠ Notion no configurado (opcional)${RESET}\n`);
  } else {
    console.log(`${GREEN}✓ Notion: Configurado${RESET}\n`);
  }
  
  // Check Providers
  console.log(`${BOLD}🤖 AI Providers Disponibles:${RESET}\n`);
  
  const providers = [];
  if (process.env.GEMINI_API_KEY) providers.push('Gemini (Google)');
  if (process.env.GROQ_API_KEY) providers.push('Groq (70B)');
  if (process.env.NVIDIA_API_KEY) providers.push('NVIDIA/Kimi');
  if (process.env.DEEPSEEK_API_KEY) providers.push('DeepSeek (Opus)');
  if (process.env.OPENROUTER_API_KEY) providers.push('OpenRouter');
  if (process.env.OLLAMA_BASE_URL) providers.push('Ollama (Local)');
  
  if (providers.length === 0) {
    console.log(`${YELLOW}⚠ No hay providers configurados${RESET}`);
    console.log(`   Editar .env.aurora para agregar API keys\n`);
  } else {
    providers.forEach(p => console.log(`  ✅ ${p}`));
    console.log(`\n${GREEN}✓ ${providers.length} providers activos${RESET}\n`);
  }
  
  console.log(`${BOLD}💡 Comandos Útiles:${RESET}`);
  console.log(`  npm run aurora:status   → Ver estado del sistema`);
  console.log(`  npm run aurora:health   → Health check`);
  console.log(`  npm run aurora:shell    → Terminal interactivo`);
  console.log(`  npm run aurora:api      → Iniciar API server\n`);
  
  console.log(`${DIM}────────────────────────────────────────────────────────${RESET}`);
  console.log(`${DIM}📚 Docs: aurora/README.md, AURORA_GROWTH_REPORT.md${RESET}`);
  console.log(`${DIM}🔧 Providers: .agent/aurora/connectors.json${RESET}\n`);
}

main().catch(console.error);
