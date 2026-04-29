import { fetch } from 'undici';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Cargar env
const envFile = path.join(process.cwd(), '.env.aurora');
const env = await readFile(envFile, 'utf8');
env.split('\n').forEach(line => {
  const [key, val] = line.split('=');
  if (key && val) process.env[key.trim()] = val.trim();
});

const prompt = `Eres GEMMA-4, arquitecta senior de software. PLAN DE MIGRACIÓN COMPLETO.

**CONTEXTO:**
Tenemos dos repos separados:
1. TradeShare (app principal, Convex backend, React + TypeScript + Vite)
2. bitacora-de-trading (app separada, Supabase backend, React + TypeScript + Vite)

**La Bitácora es un diario de trading con:**
- Dashboard con estadísticas (PnL, win rate, equity chart, daily PnL)
- Journal completo con importación MT5/Excel
- TradeEntry form (asset, type BUY/SELL, session, timeframe, entry/exit, lot size, RR, pnl, commission, notes, screenshot)
- RiskCalculator
- AdminPanel multi-usuario
- MastermindAI (Gemini)
- CalendarView de trades
- UserSelection con PIN auth

**Conexión MT5:**
- EA ApexConnector.mq5 escanea historial + posiciones abiertas cada 5s
- Envía trades a Supabase REST: POST /rest/v1/app_trades
- storageService hace syncFromCloud() cada 5s desde Supabase → localStorage encriptado

**Tablas Supabase actuales:**
- app_users (auth + perfil)
- app_accounts (cuentas de trading con startingBalance, currency)
- app_trades (ticket, user_id, account_id, asset, type, price, pnl, commission, outcome, timestamp, notes, rr)

**Plan de migración:**
1. Crear tablas Convex: bitacora_trades, bitacora_accounts, bitacora_users
2. Crear convex/bitacora.ts (queries + mutations + HTTP endpoint para MT5 EA)
3. Migrar componentes UI de bitacora a TradeShare como componentes nativos
4. Reemplazar el iframe externo con UI nativa
5. Mantener compatibilidad con el EA de MT5 (cambiar endpoint de Supabase a Convex HTTP)
6. Migrar datos existentes de Supabase a Convex

**Archivos prohibidos:** App.tsx, Navigation.tsx (reglas del repo)
**Archivos a tocar:** convex/schema.ts, convex/bitacora.ts (nuevo), src/views/BitacoraView.tsx (rewrite), src/components/bitacora/ (nuevos componentes)

**Entrega requerida:**
1. Estrategia de implementación paso a paso
2. Riesgos técnicos identificados
3. Stack y patrones recomendados
4. Consideraciones de performance (MT5 envía datos cada 5s, no queremos N+1)
5. Criterios de aceptación claros

Responde en español, formato conciso.`;

const apiKey = process.env.GEMINI_API_KEY;
const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent';

const body = {
  system_instruction: {
    parts: [{ text: 'Eres GEMMA-4, arquitecta senior de software especializada en sistemas de trading, React, TypeScript, accesibilidad y performance. Responde siempre en español.' }]
  },
  contents: [{ role: 'user', parts: [{ text: prompt }] }],
  generationConfig: {
    temperature: 0.2,
    maxOutputTokens: 16384
  }
};

console.log('🧠 GEMMA-4 BRIEFING - PLAN MIGRACIÓN BITÁCORA\n');

const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 300000);

const res = await fetch(`${baseUrl}?key=${apiKey}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
  signal: controller.signal
});

clearTimeout(timeoutId);
const data = await res.json();

if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
  console.log(data.candidates[0].content.parts[0].text);
} else {
  console.log('⚠️ Sin respuesta:', JSON.stringify(data, null, 2).substring(0, 500));
}
