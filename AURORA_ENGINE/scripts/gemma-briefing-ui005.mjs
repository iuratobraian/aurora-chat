#!/usr/bin/env node
/**
 * 🧠 GEMMA-4 BRIEFING — Tarea UI-005: PublicationCard
 * 
 * Uso: node scripts/gemma-briefing-ui005.mjs
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

// Leer spec
const specPath = path.join(process.cwd(), '.agent/designs/MARKETPLACE_CARD_SPEC.md');
const spec = fs.existsSync(specPath) ? fs.readFileSync(specPath, 'utf8') : 'Spec no encontrado.';

const prompt = `Eres el arquitecto técnico de TradeShare. Necesito un BRIEFING TÁCTICO para implementar el componente PublicationCard.

CONTEXTO:
- Archivo a crear: src/components/marketplace/PublicationCard.tsx
- Descripción: Card con logo, status badge, features, botones para el marketplace
- Stack: React + TypeScript + Tailwind CSS
- Colores del diseño: Primary #3b82f6, Signal Green #10b981, Card Dark #1a1a2e, Background #0f1115
- Componentes glass = backdrop-blur-xl + border-white/10, card = rounded-2xl + bg-card-dark

SPEC:
${spec.substring(0, 3000)}

REGLAS:
1. Responde en español
2. Dame: estrategia de implementación, riesgos técnicos, props interface, estructura del componente
3. NO uses bloques WRITE_FILE. Responde texto plano directamente.
4. Sé conciso y técnico.`;

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

console.log('🧠 BRIEFING GEMMA-4 — UI-005 PublicationCard');
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
