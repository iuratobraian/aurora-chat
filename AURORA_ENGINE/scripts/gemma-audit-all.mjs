#!/usr/bin/env node
/**
 * 💎 GEMMA-4 AUDIT BATCH — Auditoría de TODAS las tareas realizadas
 * 
 * Uso: node scripts/gemma-audit-all.mjs
 */

import { fetch } from 'undici';
import fs from 'node:fs';
import path from 'node:path';

const lines = fs.readFileSync('.env.aurora', 'utf8').split(/\r?\n/);
lines.forEach(l => {
  const i = l.indexOf('=');
  if (i > 0) { const k = l.slice(0, i).trim(); const v = l.slice(i + 1).trim().replace(/^['"]|['"]$/g, ''); if (k && process.env[k] === undefined) process.env[k] = v; }
});

const tasks = [
  {
    id: 'UI-006',
    name: 'VerificationCodeInput',
    files: ['src/components/auth/VerificationCodeInput.tsx'],
    desc: '6-digit verification input with auto-tab, backspace, timer countdown'
  },
  {
    id: 'UI-007',
    name: 'PaymentActionButton',
    files: ['src/components/payment/PaymentActionButton.tsx'],
    desc: 'Animated payment button with expand on hover'
  },
  {
    id: 'UI-010',
    name: 'ProductCard',
    files: ['src/components/marketplace/ProductCard.tsx'],
    desc: 'Product card with image, price, size selector, add to cart'
  },
  {
    id: 'UI-013',
    name: 'PurchaseSwitch',
    files: ['src/components/marketplace/PurchaseSwitch.tsx'],
    desc: 'Toggle switch for download vs purchase'
  },
  {
    id: 'UI-014',
    name: 'TVToggleButton',
    files: ['src/components/ui/TVToggleButton.tsx'],
    desc: 'Cosmic TV toggle button with on/off animation'
  },
  {
    id: 'UI-015',
    name: 'SidebarSearch',
    files: ['src/components/ui/SidebarSearch.tsx'],
    desc: 'Premium search input with animated multicolor borders'
  },
  {
    id: 'UI-016',
    name: 'ErrorAlert',
    files: ['src/components/ui/ErrorAlert.tsx'],
    desc: 'Error toast notification with red icon and close button'
  },
  {
    id: 'UI-018',
    name: 'PreviousMonthWinnerCard',
    files: ['src/components/ui/PreviousMonthWinnerCard.tsx'],
    desc: 'Golden winner card with rank, username, score display'
  },
  {
    id: 'UI-012',
    name: 'LogoLoader',
    files: ['src/components/ui/LogoLoader.tsx'],
    desc: 'Animated logo loader with words cycle animation'
  },
  {
    id: 'AUDIT-001',
    name: 'deviceFingerprint validation',
    files: ['convex/authJwt.ts', 'src/services/authBase.ts'],
    desc: 'Device fingerprint validation to prevent token replay attacks'
  },
  {
    id: 'AUDIT-002',
    name: 'idempotency keys in payments',
    files: ['convex/schema.ts', 'convex/paymentOrchestrator.ts'],
    desc: 'Idempotency keys to prevent double-spending in payments'
  },
  {
    id: 'AUDIT-004',
    name: 'WebSocket cleanup',
    files: ['src/hooks/useSignalWebSocket.ts'],
    desc: 'Fix WebSocket memory leak with isUnmountedRef and callbacksRef'
  },
  {
    id: 'AUDIT-006',
    name: 'localStorage → sessionStorage',
    files: ['src/utils/sessionManager.ts', 'src/services/authBase.ts'],
    desc: 'Move tokens from localStorage to sessionStorage with BroadcastChannel sync'
  },
  {
    id: 'AUDIT-007',
    name: 'Eliminate internal calls from client',
    files: ['src/services/authBase.ts', 'src/services/auth/sessionPersistence.ts', 'src/hooks/useSessionPersistence.ts'],
    desc: 'Replace api.authInternal calls with public api.profiles.getProfile'
  },
  {
    id: 'AUDIT-009',
    name: 'Notification subscription leak fix',
    files: ['src/hooks/useNotifications.ts'],
    desc: 'Add push notification cleanup on beforeunload'
  },
  {
    id: 'AUDIT-011',
    name: 'Rate limiting in moderation',
    files: ['convex/moderation.ts'],
    desc: 'Rate limit 5 reports/hour in reportContent mutation'
  },
  {
    id: 'AUDIT-016',
    name: 'Circuit breaker in market data',
    files: ['src/services/marketDataService.ts'],
    desc: 'Circuit breaker with 5 failures threshold + 30s recovery'
  },
  {
    id: 'AUDIT-017',
    name: 'Persist circuit breaker state',
    files: ['src/lib/circuitBreaker.ts'],
    desc: 'SessionStorage persistence with 5min TTL for circuit breaker state'
  },
];

async function callGemma(prompt, maxTokens = 2048) {
  for (const key of [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_FALLBACK]) {
    if (!key) continue;
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: maxTokens }
          }),
          signal: AbortSignal.timeout(90000)
        }
      );
      const data = await res.json();
      if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
    } catch {}
  }
  return null;
}

// Protocolo AGENTS.md
const protocols = `- TypeScript estricto, sin any leaks
- Tailwind CSS correcto
- Accesible (aria-label, role)
- Sin mocks ni placeholders activos
- Sin localStorage como fuente de verdad compartida
- Export default del componente
- Manejo de errores y edge cases
- Código limpio y profesional`;

console.log('💎 GEMMA-4 AUDIT BATCH — Auditoría de TODAS las tareas');
console.log('═'.repeat(70));
console.log(`Tareas a auditar: ${tasks.length}`);
console.log('');

let passed = 0;
let failed = 0;
const results = [];

for (let i = 0; i < tasks.length; i++) {
  const task = tasks[i];
  console.log(`\n${'─'.repeat(70)}`);
  console.log(`[${i + 1}/${tasks.length}] AUDITANDO: ${task.id} — ${task.name}`);
  console.log(`Archivos: ${task.files.join(', ')}`);
  console.log('─'.repeat(70));

  let code = '';
  for (const f of task.files) {
    const fp = path.join(process.cwd(), f);
    if (fs.existsSync(fp)) {
      code += `\n--- ${f} ---\n${fs.readFileSync(fp, 'utf8')}\n`;
    } else {
      code += `\n--- ${f} ---\n⚠️ Archivo no encontrado\n`;
    }
  }

  const prompt = `Eres el auditor de calidad SUPREMO de TradeShare. Realiza AUDITORÍA FINAL de código.

TAREA ${task.id}: ${task.name}
DESCRIPCIÓN: ${task.desc}

PROTOCOLOS OBLIGATORIOS:
${protocols}

CÓDIGO A AUDITAR:
${code.substring(0, 8000)}

INSTRUCCIONES:
1. Revisa CADA línea de código contra los protocolos
2. Identifica problemas de seguridad, calidad, accesibilidad
3. Verifica que cumple la descripción de la tarea
4. Genera VEREDICTO FINAL: **APROBADO** o **RECHAZADO**
5. Si RECHAZADO: lista EXACTA de correcciones necesarias
6. Responde en español, conciso y técnico
7. NO uses bloques WRITE_FILE. Texto plano directo.`;

  const result = await callGemma(prompt, 4096);
  if (result) {
    const isApproved = result.includes('**APROBADO**') || result.includes('APROBADO');
    const isRejected = result.includes('**RECHAZADO**') || result.includes('RECHAZADO');

    console.log(isApproved ? '✅ APROBADO' : isRejected ? '❌ RECHAZADO' : '⚠️ Sin veredicto claro');
    console.log(result.substring(0, 500));
    if (result.length > 500) console.log('... (truncado)');

    results.push({ id: task.id, name: task.name, passed: isApproved, verdict: isApproved ? 'APROBADO' : isRejected ? 'RECHAZADO' : 'SIN_VEREDICTO' });
    if (isApproved) passed++; else failed++;
  } else {
    console.log('❌ ERROR — Gemma no respondió');
    results.push({ id: task.id, name: task.name, passed: false, verdict: 'ERROR' });
    failed++;
  }

  // Delay entre tareas para evitar rate limiting
  await new Promise(r => setTimeout(r, 3000));
}

console.log('\n' + '═'.repeat(70));
console.log('RESUMEN FINAL DE AUDITORÍA');
console.log('═'.repeat(70));
console.log(`Total: ${tasks.length} | ✅ APROBADAS: ${passed} | ❌ FALLADAS: ${failed}`);
console.log('');
for (const r of results) {
  console.log(`${r.passed ? '✅' : '❌'} ${r.id}: ${r.name} — ${r.verdict}`);
}

// Guardar reporte
fs.writeFileSync('docs/GEMMA_AUDIT_REPORT.md', `# Gemma-4 Audit Report\n\nFecha: ${new Date().toISOString()}\n\n${results.map(r => `## ${r.passed ? '✅' : '❌'} ${r.id}: ${r.name}\nVeredicto: **${r.verdict}**`).join('\n\n')}\n`, 'utf8');
console.log('\n📄 Reporte guardado en docs/GEMMA_AUDIT_REPORT.md');
