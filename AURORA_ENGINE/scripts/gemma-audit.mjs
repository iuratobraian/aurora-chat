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
  gitDiff = execSync('git diff HEAD~3 --name-only', { cwd: rootDir, encoding: 'utf8' });
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
  const tb = await readFile(path.join(rootDir, '.agent/workspace/coordination/TASK_BOARD.md'), 'utf8');
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

const prompt = `Eres GEMMA-4, arquitecta senior de software especializada en sistemas de trading, React, TypeScript, accesibilidad y performance.

AUDITORÍA COMPLETA DEL PROYECTO TradeShare

## CONTEXTO DE LA SESIÓN (8/4/2026)

Se completó el SPRINT ACTIVO: ESTABILIZACIÓN PRODUCCIÓN con 10/10 tareas verificadas:

### Tareas Completadas:
1. **FIX-002**: Defensa try/catch en convex/products.ts (getUserPurchases)
2. **FIX-003**: Defensa try/catch en convex/communities.ts (getCommunityStats)
3. **FIX-004**: Defensa try/catch en convex/market/economicCalendar.ts (getUpcomingEvents)
4. **FIX-005**: Corregir skip pattern en src/views/CreatorDashboard.tsx
5. **FIX-006**: Null guard JSX en src/views/GraficoView.tsx
6. **FIX-007**: CSP Pusher wildcard → lista explícita en vite.config.ts, server.ts, vercel.json
7. **FIX-008**: YouTube auth Bearer token en src/views/PsicotradingView.tsx
8. **FIX-009**: Eliminar doble disparo RECORD_LOGIN en src/App.tsx (useRef guard)
9. **FIX-010**: Agregar frame-src CSP para bitacora-de-trading.vercel.app

### Build Status:
- npm run build: ✅ 13.28s, 0 errores
- Vercel deploy: ✅ https://trade-share-three.vercel.app
- Convex deploy: ⚠️ PENDIENTE (CONVEX_DEPLOY_KEY expirada)

## ARCHIVOS MODIFICADOS RECIENTEMENTE:
${gitDiff}

## GIT STATUS:
${gitStatus}

## TASK_BOARD.md (resumen):
${taskBoard}

## AGENT_LOG.md (resumen):
${agentLog}

---

## VERIFICACIÓN REQUERIDA:

1. **Calidad del código** (clean code, SOLID, DRY)
   - ¿Los try/catch están implementados correctamente?
   - ¿No hay code smells o anti-patrones?

2. **Seguridad** (XSS, injection, data leaks)
   - ¿Auth handlers son seguros?
   - ¿CSP headers están bien configurados?
   - ¿No hay exposición de datos sensibles?

3. **Performance** (memory leaks, re-renders)
   - ¿useRef guard para RECORD_LOGIN es correcto?
   - ¿No hay memory leaks potenciales?

4. **Accesibilidad** (WCAG 2.1 AA)
   - ¿Null guards previenen crashes de accesibilidad?

5. **Mantenibilidad** (tipado, documentación, estructura)
   - ¿Código bien tipado?
   - ¿Documentación actualizada?

6. **Integridad del SPRINT**
   - ¿Las 10 tareas están realmente completas?
   - ¿Falta algo por verificar?

Da un veredicto final: **APROBADO** o **RECHAZADO** con lista de hallazgos críticos.
Responde en español, formato markdown conciso.`;

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ GEMINI_API_KEY no configurada en .env.aurora');
  process.exit(1);
}

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

console.log('🔍 GEMMA-4 AUDITORÍA DE CÓDIGO - SPRINT ESTABILIZACIÓN\n');
console.log('⏳ Consultando a Gemma-4 (timeout 120s)...\n');

const controller = new AbortController();
const timeoutId = setTimeout(() => {
  controller.abort();
  console.error('\n❌ Timeout: La petición excedió los 120000ms');
  process.exit(1);
}, 120000);

try {
  const res = await fetch(`${baseUrl}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

  if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 RESPUESTA DE GEMMA-4:');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(data.candidates[0].content.parts[0].text);
    console.log('\n═══════════════════════════════════════════════════════');
  } else {
    console.log('⚠️ Sin respuesta completa de Gemma:');
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
