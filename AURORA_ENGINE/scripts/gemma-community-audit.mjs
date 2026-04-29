import { fetch } from 'undici';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cargar variables de entorno
const envFile = path.join(__dirname, '..', '.env.aurora');
const env = await readFile(envFile, 'utf8');
env.split('\n').forEach(line => {
  const [key, val] = line.split('=');
  if (key && val) process.env[key.trim()] = val.trim();
});

const prompt = `Eres GEMMA-4, arquitecta senior de software. AUDITORÍA COMPLETA del sistema de comunidades TradeShare.

## CAMBIOS REALIZADOS EN ESTA SESIÓN:

### 1. NUEVAS TABLAS SCHEMA (convex/schema.ts)
- affiliateBrokers, academyAffiliations, academyPricingTiers
- communityLanguages, communityTranslations, supportedLanguages
- globalRevenueSharing
- communityServices, communityFlyers, communityServiceSubscriptions
- communityXpSettings, xpRedemptions
- communityStreams, streamViewers, streamAds, streamAnalytics
- streamScheduleSlots, streamScheduleApplications, streamerCommitments
- communityReviews (expandido con 10+ campos nuevos)
- communityEngagement, communityRecommendations
- communityPricingTiers, communityRevenueAnalytics, creatorBenefits

### 2. BACKEND NUEVO (convex/)
- academyPricing.ts: pricing calculator, revenue share, affiliate brokers, admin mutations
- multiLanguage.ts: traducciones, detección idioma, seed 8 idiomas
- communityServices.ts: CRUD servicios modulares + flyers + XP settings
- communityStreams.ts: streaming en vivo con ads automáticos
- streamSchedule.ts: programación con sorteos automáticos
- communityReviews.ts: reviews detallados con métricas
- subcommunities.ts: CRUD completo de subcomunidades

### 3. BACKEND MODIFICADO
- convex/communities.ts: 
  - createCommunity ahora crea servicios/flyers/XP defaults automáticamente
  - FIX: updateCommunity pasaba userId a assertOwnershipOrAdmin
  - FIX: deleteCommunity usa assertOwnershipOrAdmin en vez de requireCommunityOwnerOrPlatformAdmin
  - FIX: createPost ya no depende de ctx.auth.getUserIdentity()
  - FIX: getUserCommunities ya no depende de ctx.auth.getUserIdentity()
  - Agregado category al schema + createCommunity
- convex/marketing/connections.ts: FIX missing import mutation

### 4. FRONTEND NUEVO
- src/views/CommunityLandingView.tsx: Landing para no-suscritos con flyers y servicios
- src/components/LanguageSelector.tsx: 4 variantes (dropdown, inline, icon, buttons)
- src/components/WelcomeGlobal.tsx: bienvenida multilingüe
- src/components/TranslatedContent.tsx: wrapper traducciones
- src/i18n/i18n.ts: sistema i18n con 8 idiomas (EN, ES, PT, FR, DE, ZH, JA, AR)
- src/components/admin/sections/AdminPricingPanel.tsx: panel admin para pricing tiers + brokers + recomendaciones AI

### 5. FRONTEND MODIFICADO
- src/views/AdminView.tsx: Agregada sección 'pricing'
- src/components/admin/AdminTopNav.tsx: Agregado 'pricing' al tipo AdminSection + nav group Sistema
- src/views/comunidad/Modals.tsx: Agregados xpRedemptionEnabled, streamingEnabled states
- convex/schema.ts: Agregado campo category a communities + index

### 6. FIXES DE BUGS CRÍTICOS
- FIX-1: getUserCommunities retornaba [] siempre por ctx.auth.getUserIdentity()
- FIX-2: Campo category no existía en schema de communities
- FIX-3: Botón "Crear Comunidad" navegaba a /creator-studio (inexistente)
- FIX-4: xpRedemptionEnabled se capturaba pero no se enviaba

### 7. SISTEMA ECONÓMICO
- Pricing tiers: Starter($8), Growth($6), Scale($4), Enterprise($3), Global($2)
- Descuentos: XP(-10%), streaming(-5-25%), broker affiliate(-15-40%)
- 3 brokers afiliados seed: Exness, IC Markets, XM
- Revenue share platform 30% / creator 70%

## VERIFICA:

### SEGURIDAD
1. ¿Hay algún endpoint sin validación de ownership/identity?
2. ¿Hay llamadas a internalMutation/internalAction desde UI?
3. ¿Hay datos sensibles expuestos?
4. ¿Hay riesgo de IDOR en alguna mutation?
5. ¿Las queries exponen datos de otros usuarios?

### INTEGRIDAD
6. ¿Hay campos del schema que no se usan en ninguna mutation?
7. ¿Hay funciones Convex que referencian tablas inexistentes?
8. ¿Hay imports rotos o dependencias circulares?
9. ¿Los tipos de las mutations coinciden con los args del frontend?
10. ¿Hay índices duplicados o innecesarios?

### FUNCIONALIDAD
11. ¿El flujo createCommunity → servicios defaults → flyers defaults funciona completo?
12. ¿Los sorting de flyers y servicios es correcto (sortOrder)?
13. ¿El sistema de sorteos de streaming funciona lógicamente?
14. ¿Las traducciones tienen fallback si el idioma no existe?
15. ¿El pricing calculator calcula correctamente con los descuentos acumulables?

### PERFORMANCE
16. ¿Hay queries que hacen collect() de tablas grandes?
17. ¿Hay N+1 en alguna función?
18. ¿Los índices están bien elegidos para las queries más frecuentes?
19. ¿Hay useEffect sin cleanup que causen memory leaks?

### ACCESIBILIDAD
20. ¿Los componentes nuevos tienen ARIA labels?
21. ¿Los colores tienen contraste suficiente?
22. ¿Los botones tienen text alternativo?

### CONSISTENCIA
23. ¿Los nombres de tablas son consistentes (snake_case vs camelCase)?
24. ¿Los timestamps usan Date.now() consistentemente?
25. ¿Hay código duplicado entre archivos?

Da un veredicto: APROBADO o RECHAZADO con lista de hallazgos críticos por categoría.
Responde en español, formato markdown conciso.`;

const apiKey = process.env.GEMINI_API_KEY;
const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent';

const body = {
  system_instruction: {
    parts: [{ text: 'Eres GEMMA-4, arquitecta senior de software especializada en sistemas de trading, React, TypeScript, Convex, accesibilidad y performance. Responde siempre en español. Sé exhaustiva y crítica en tu auditoría.' }]
  },
  contents: [{ role: 'user', parts: [{ text: prompt }] }],
  generationConfig: {
    temperature: 0.2,
    maxOutputTokens: 16384
  }
};

console.log('🔍 GEMMA-4 AUDITORÍA COMPLETA DEL SISTEMA DE COMUNIDADES\n');
console.log('⏳ Consultando a Gemma-4 (timeout 120s)...\n');

const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 120000);

try {
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
    console.log('⚠️ Sin respuesta:', JSON.stringify(data, null, 2).substring(0, 1000));
  }
} catch (err) {
  clearTimeout(timeoutId);
  console.log(`❌ Error: ${err.message}`);
}
