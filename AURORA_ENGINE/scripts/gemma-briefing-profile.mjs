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

const prompt = `Eres GEMMA-4, arquitecta senior de software. BRIEFING ESTRATÉGICO para la siguiente tarea:

**TASK-ID: FIX-PROFILE-SYSTEM** - Refactorizar sistema de perfiles

**Problemas identificados:**
1. PerfilView.tsx (695 líneas, todo en una línea) usa StorageService (localStorage) como fuente de verdad para datos del perfil. Debe usar Convex queries (api.profiles.getProfile).
2. PerfilView.tsx es monolítico y NO usa los componentes ya creados: ProfileHeader.tsx, ProfileTabs.tsx, ProfilePostsTab.tsx, ProfileMedalsTab.tsx, ProfileCommunitiesTab.tsx, ProfileConfigTab.tsx. Renderiza todo inline duplicando funcionalidad.
3. ProfileComprasTab.tsx tiene datos HARDCODED (Plan Pro, Curso de Price Action). Debe conectar con Convex: api.paymentOrchestrator.getUserPayments y api.products.getUserPurchases.
4. ProfileModTab.tsx tiene handleDeleteComment simulado (solo muestra toast "en beta"). Debe tener mutation real de Convex para eliminar comentarios.
5. ProfileVisitModal.tsx es skeleton (solo muestra "User ID: {userId}"). Debe mostrar datos reales del perfil.
6. followMutation usa api.users.toggleFollow pero la mutation real está en api.profiles.toggleFollow.

**Archivos a modificar:**
- src/views/PerfilView.tsx (refactor completo)
- src/views/profile/ProfileComprasTab.tsx (conectar con Convex)
- src/views/profile/ProfileModTab.tsx (implementar deleteComment real)
- src/components/ProfileVisitModal.tsx (implementar con datos reales)

**Archivos prohibidos:**
- convex/schema.ts (no modificar schema)
- App.tsx, Navigation.tsx (prohibidos por regla del repo)
- AGENTS.md, TASK_BOARD.md

**Entrega requerida:**
1. Estrategia de implementación paso a paso
2. Riesgos técnicos identificados
3. Stack y patrones recomendados
4. Consideraciones de performance y seguridad
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

console.log('🧠 GEMMA-4 BRIEFING - FIX-PROFILE-SYSTEM\n');

const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 120000);

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
