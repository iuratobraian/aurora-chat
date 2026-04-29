#!/usr/bin/env node
/**
 * 💎 GEMMA-4 SINGLE AUDIT
 * Uso: node scripts/gemma-audit-single.mjs <taskId> <file1> [file2...]
 */

import { fetch } from 'undici';
import fs from 'node:fs';

const lines = fs.readFileSync('.env.aurora', 'utf8').split(/\r?\n/);
lines.forEach(l => {
  const i = l.indexOf('=');
  if (i > 0) { const k = l.slice(0, i).trim(); const v = l.slice(i + 1).trim().replace(/^['"]|['"]$/g, ''); if (k && process.env[k] === undefined) process.env[k] = v; }
});

const taskId = process.argv[2];
const files = process.argv.slice(3);

if (!taskId || files.length === 0) {
  console.log('Uso: node scripts/gemma-audit-single.mjs <taskId> <file1> [file2...]');
  process.exit(1);
}

let code = '';
for (const f of files) {
  if (fs.existsSync(f)) code += `\n--- ${f} ---\n${fs.readFileSync(f, 'utf8').substring(0, 6000)}\n`;
}

const prompt = `Audita este código de TradeShare. Tarea ${taskId}.
Protocolos: TypeScript strict, Tailwind correcto, accesible, sin mocks, sin localStorage compartido, export default, manejo errores.
Responde SOLO con:
1. ✅ o ❌ al inicio
2. 3 razones máximo
3. Veredicto: **APROBADO** o **RECHAZADO**

Código:
${code}`;

async function callGemma(key) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent?key=${key}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1, maxOutputTokens: 1024 } }),
    signal: AbortSignal.timeout(60000)
  });
  const d = await res.json();
  return res.ok ? d.candidates?.[0]?.content?.parts?.[0]?.text : null;
}

console.log(`💎 Audit ${taskId}...`);
let result = await callGemma(process.env.GEMINI_API_KEY);
if (!result) result = await callGemma(process.env.GEMINI_API_KEY_FALLBACK);
console.log(result || '❌ Sin respuesta');
