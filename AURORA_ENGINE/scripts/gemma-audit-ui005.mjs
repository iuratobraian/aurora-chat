#!/usr/bin/env node
/**
 * 💎 GEMMA-4 AUDIT — Tarea UI-005: PublicationCard
 * 
 * Uso: node scripts/gemma-audit-ui005.mjs
 */

import { fetch } from 'undici';
import fs from 'node:fs';
import path from 'node:path';

// Cargar .env.aurora
const lines = fs.readFileSync('.env.aurora', 'utf8').split(/\r?\n/);
lines.forEach(l => {
  const i = l.indexOf('=');
  if (i > 0) {
    const k = l.slice(0, i).trim();
    const v = l.slice(i + 1).trim().replace(/^['"]|['"]$/g, '');
    if (k && process.env[k] === undefined) process.env[k] = v;
  }
});

// Leer el archivo creado
const componentPath = path.join(process.cwd(), 'src/components/marketplace/PublicationCard.tsx');
const componentCode = fs.existsSync(componentPath) ? fs.readFileSync(componentPath, 'utf8') : 'Archivo no encontrado.';

// Leer spec
const specPath = path.join(process.cwd(), '.agent/designs/MARKETPLACE_CARD_SPEC.md');
const spec = fs.existsSync(specPath) ? fs.readFileSync(specPath, 'utf8') : 'Spec no encontrado.';

const prompt = `Eres el auditor de calidad de TradeShare. Realiza una AUDITORÍA del componente PublicationCard recién implementado.

COMPONENTE IMPLEMENTADO:
\`\`\`tsx
${componentCode}
\`\`\`

ESPECIFICACIÓN ORIGINAL:
${spec.substring(0, 2000)}

PROTOCOLOS DEL PROYECTO (AGENTS.md):
- TypeScript estricto
- Tailwind CSS
- Sin mocks ni placeholders
- Sin localStorage como fuente de verdad
- Componentes con nombres PascalCase
- Export default del componente
- Interfaz exportada

REALIZA LA AUDITORÍA Y GENERA UN VEREDICTO:
1. ✅ Cumplimiento del spec
2. ✅ Calidad del código
3. ⚠️ Problemas encontrados
4. 💡 Sugerencias de mejora
5. VEREDICTO FINAL: APROBADO o RECHAZADO (con justificación técnica)

Responde en español, sé conciso y técnico.`;

const key = process.env.GEMINI_API_KEY;
const keyFallback = process.env.GEMINI_API_KEY_FALLBACK;

async function callGemma(promptText, apiKey) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
      }),
      signal: AbortSignal.timeout(60000)
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(`${res.status}: ${JSON.stringify(data.error)}`);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta';
}

console.log('💎 AUDITORÍA GEMMA-4 — UI-005 PublicationCard');
console.log('═'.repeat(60));

try {
  const result = await callGemma(prompt, key);
  console.log(result);
} catch (e1) {
  console.log(`⚠️ Primary key falló (${e1.message}), intentando fallback...`);
  try {
    const result = await callGemma(prompt, keyFallback);
    console.log(result);
  } catch (e2) {
    console.log(`❌ Ambas keys fallaron: ${e2.message}`);
    process.exit(1);
  }
}
