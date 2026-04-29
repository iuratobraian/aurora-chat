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

const prompt = `Eres KIMI K2.5, socio de código senior. Necesito análisis y código para refactorizar el sistema de perfiles de TradeShare.

**TAREA: FIX-PROFILE-SYSTEM**

**Contexto actual:**
- PerfilView.tsx es un componente monolítico de 695 líneas (todo en una línea minificada) que usa StorageService (localStorage) en vez de Convex.
- Ya existen componentes extraídos pero NO se usan: ProfileHeader.tsx, ProfileTabs.tsx, ProfilePostsTab.tsx, ProfileMedalsTab.tsx, ProfileCommunitiesTab.tsx, ProfileConfigTab.tsx, ProfileComprasTab.tsx, ProfileBibliotecaTab.tsx, ProfileModTab.tsx.
- ProfileComprasTab tiene datos hardcoded.
- ProfileModTab tiene función simulada.
- ProfileVisitModal es skeleton.
- followMutation apunta a api.users.toggleFollow pero debería ser api.profiles.toggleFollow.

**Backend Convex disponible:**
- api.profiles.getProfile({ userId }) - query
- api.profiles.toggleFollow({ followerId, targetId }) - mutation
- api.profiles.updateProfile({ id, userId, nombre?, biografia?, avatar?, banner?, instagram? }) - mutation
- api.paymentOrchestrator.getUserPayments({ userId }) - query
- api.products.getUserPurchases({ userId }) - query
- api.communities.getUserCommunities({ userId }) - query
- api.traderVerification.getVerificationStatus({ userId }) - query
- api.strategies.getUserBookLibrary({ userId }) - query

**Schema profiles (campos clave):**
userId, nombre, usuario, email, avatar, banner, biografia, instagram, rol, role, esPro, esVerificado, xp, level, seguidores[], siguiendo[], badges[], medallas[], streakDays, diasActivos, avatarFrame, createdAt, updatedAt

**PREGUNTAS ESPECÍFICAS PARA KIMI:**

1. ¿Cuál es la mejor estrategia para migrar PerfilView de localStorage a Convex sin romper la UI?
2. ¿Cómo estructurar el nuevo PerfilView para que use los componentes existentes como children?
3. ¿Qué patrón de loading/error manejar para las múltiples queries de Convex?
4. Para ProfileComprasTab: ¿cómo combinar payments + purchases en una vista coherente?
5. Para ProfileModTab: ¿qué mutation de Convex existe para deleteComment o hay que crearla?
6. ¿Cómo manejar la transición entre perfil propio y perfil ajeno con Convex?

Genera el código completo de:
- Nuevo PerfilView.tsx (limpio, bien formateado, usando los componentes existentes)
- ProfileComprasTab.tsx (con datos reales de Convex)
- ProfileModTab.tsx (con deleteComment real o nota si necesita backend nuevo)
- ProfileVisitModal.tsx (con datos reales)

Responde conciso con correcciones críticas si las hay. Código TypeScript + React + Tailwind.`;

const apiKey = process.env.NVIDIA_API_KEY;
const baseUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';

const body = {
  model: 'moonshotai/kimi-k2-instruct',
  messages: [
    { role: 'system', content: 'Eres KIMI K2.5, un experto desarrollador full-stack especializado en React, TypeScript, Convex y sistemas de trading. Responde siempre en español con código preciso y conciso.' },
    { role: 'user', content: prompt }
  ],
  temperature: 0.2,
  max_tokens: 16384
};

console.log('💜 KIMI K2.5 - ANÁLISIS FIX-PROFILE-SYSTEM\n');

const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutos para KIMI

const res = await fetch(baseUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify(body),
  signal: controller.signal
});

clearTimeout(timeoutId);
const data = await res.json();

if (data.choices?.[0]?.message?.content) {
  console.log(data.choices[0].message.content);
} else {
  console.log('⚠️ Sin respuesta:', JSON.stringify(data, null, 2).substring(0, 500));
}
