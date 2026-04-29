#!/usr/bin/env node

/**
 * Kimi K2.5 System Audit
 * Protocol: Aurora Mente Maestra
 * Date: 2026-04-07
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const API_KEY = process.env.MOONSHOT_API_KEY;
if (!API_KEY) {
  console.error('ERROR: MOONSHOT_API_KEY environment variable is required');
  process.exit(1);
}
const MODEL = 'kimi-k2-0905-preview';
const BASE_URL = 'https://api.moonshot.ai/v1';

// Collect key file stats
function collectStats() {
  const stats = {};
  
  // Count files by type
  function countFiles(dir, ext) {
    let count = 0;
    try {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
        const fullPath = path.join(dir, entry.fullPath || entry.name);
        if (entry.isDirectory()) {
          count += countFiles(fullPath, ext);
        } else if (entry.name.endsWith(ext)) {
          count++;
        }
      }
    } catch {}
    return count;
  }
  
  stats.tsFiles = countFiles(ROOT, '.ts');
  stats.tsxFiles = countFiles(ROOT, '.tsx');
  stats.mjsFiles = countFiles(ROOT, '.mjs');
  
  // Read key files
  try {
    stats.taskBoardLines = fs.readFileSync(path.join(ROOT, '.agent', 'workspace', 'coordination', 'TASK_BOARD.md'), 'utf8').split('\n').length;
    stats.agentLogLines = fs.readFileSync(path.join(ROOT, 'AGENT_LOG.md'), 'utf8').split('\n').length;
    stats.vaultLines = fs.readFileSync(path.join(ROOT, 'vault', 'TASK_ARCHIVE.md'), 'utf8').split('\n').length;
  } catch {}
  
  // Check convex schema size
  try {
    const schema = fs.readFileSync(path.join(ROOT, 'convex', 'schema.ts'), 'utf8');
    stats.schemaLines = schema.split('\n').length;
    stats.schemaTables = (schema.match(/defineTable/g) || []).length;
  } catch {}
  
  // Check gamification functions
  try {
    const gamification = fs.readFileSync(path.join(ROOT, 'convex', 'gamification.ts'), 'utf8');
    stats.gamificationFunctions = (gamification.match(/export const \w+ = (query|mutation|action)/g) || []).length;
  } catch {}
  
  // Check PremiosView
  try {
    const premios = fs.readFileSync(path.join(ROOT, 'src', 'views', 'PremiosView.tsx'), 'utf8');
    stats.premiosViewLines = premios.split('\n').length;
    stats.premiosViewImports = (premios.match(/^import /gm) || []).length;
  } catch {}
  
  return stats;
}

const stats = collectStats();

const auditPrompt = `
# AUDITORÍA COMPLETA DEL SISTEMA TRADESHARE

Eres Kimi K2.5, arquitecto de código senior. Realiza una auditoría completa del proyecto TradeShare.

## Estadísticas del proyecto:
- Archivos TypeScript (.ts): ${stats.tsFiles}
- Archivos TSX (.tsx): ${stats.tsxFiles}
- Archivos MJS (.mjs): ${stats.mjsFiles}
- Líneas en TASK_BOARD.md: ${stats.taskBoardLines}
- Líneas en AGENT_LOG.md: ${stats.agentLogLines}
- Líneas en vault/TASK_ARCHIVE.md: ${stats.vaultLines}
- Líneas en convex/schema.ts: ${stats.schemaLines}
- Tablas en schema: ${stats.schemaTables}
- Funciones en convex/gamification.ts: ${stats.gamificationFunctions}
- Líneas en src/views/PremiosView.tsx: ${stats.premiosViewLines}
- Imports en PremiosView.tsx: ${stats.premiosViewImports}

## Tareas completadas en esta sesión:
1. REWARDS-002: Catálogo dinámico de premios desde prizes_catalog (DB)
2. REWARDS-003: Historial de canjes en PremiosView con tab completa
3. UI-020: Integrar LogoLoader + PreviousMonthWinnerCard en PremiosView
4. DEPLOY-002: Deploy Vercel producción → https://trade-share-three.vercel.app
5. FIX-003: TradeShareLogo efecto eléctrico con chispas animadas

## Protocolo de verificación:
- Convex First: ¿Todos los datos usan Convex como fuente de verdad?
- No mocks: ¿Hay datos hardcodeados que deberían venir de DB?
- Auth: ¿Las mutations validan identidad/ownership?
- Seguridad: ¿Hay llamadas a internalMutation desde cliente?
- Performance: ¿Hay N+1 queries o collect() masivos?
- Código muerto: ¿Hay funciones/components que nadie usa?
- Consistencia: ¿El frontend y backend comparten el mismo contrato?

## Instrucciones:
1. Analiza el estado actual del sistema basado en las estadísticas
2. Identifica riesgos potenciales basados en los patrones comunes del proyecto
3. Da recomendaciones de mejora priorizadas
4. Verifica que las 5 tareas de la sesión cumplen los criterios de calidad
5. Emite un veredicto: APROBADO o RECHAZADO con justificación técnica

Responde en español, de forma concisa y técnica.
`;

async function askKimi(content) {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: 'Eres Kimi K2.5, arquitecto de código senior. Auditas sistemas full-stack con expertise en Convex, React y TypeScript. Responde en español de forma concisa y técnica.' },
        { role: 'user', content }
      ],
      max_completion_tokens: 4096
    })
  });

  const data = await response.json();
  if (data.error) {
    console.error('❌ Error Kimi:', data.error.message);
    process.exit(1);
  }
  return data.choices[0].message.content;
}

console.log('🔍 Kimi K2.5 - Auditoría del Sistema TradeShare');
console.log('='.repeat(60));
console.log('Analizando', stats.tsFiles, 'archivos .ts,', stats.tsxFiles, '.tsx,', stats.mjsFiles, '.mjs');
console.log('Schema:', stats.schemaTables, 'tablas,', stats.schemaLines, 'líneas');
console.log('Gamificación:', stats.gamificationFunctions, 'funciones');
console.log('');

try {
  const result = await askKimi(auditPrompt);
  console.log(result);
  console.log('\n' + '='.repeat(60));
  console.log('✅ Auditoría Kimi completada');
} catch (err) {
  console.error('❌ Error en auditoría:', err.message);
  process.exit(1);
}
