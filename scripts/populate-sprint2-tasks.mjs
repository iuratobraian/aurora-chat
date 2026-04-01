#!/usr/bin/env node
/**
 * populate-sprint2-tasks.mjs
 * Crea las tareas del Sprint 2 en Notion
 * Sprint 2: Feature Completion (7 tareas)
 */
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

const headers = {
  'Authorization': `Bearer ${NOTION_API_KEY}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
};

const tasks = [
  { name: "[S2-001] Instagram E2E - Cerrar gestión completa", status: "Ready", type: "Feature", priority: "High", domain: "Backend", order: 19,
    notes: `📂 ARCHIVOS A EDITAR:\n- src/views/InstagramMarketingView.tsx\n- src/views/instagram/InstagramDashboard.tsx\n- server.ts (endpoints de Instagram)\n\n🚫 ARCHIVOS PROHIBIDOS:\n- convex/schema.ts\n\n📝 DETALLE:\nAcciones "en desarrollo" para manage/refresh/disconnect/upload/delete. Completar flujo E2E contra API real de Instagram.\n\n✅ DONE CUANDO:\nTodas las acciones funcionan contra API real de Instagram` },

  { name: "[S2-002] News Feed - Fuente real sin mocks", status: "Ready", type: "Feature", priority: "High", domain: "Frontend", order: 20,
    notes: `📂 ARCHIVOS A EDITAR:\n- src/services/newsService.ts\n- src/hooks/useNews.ts\n- src/services/storage.ts\n- src/services/agents/newsAgentService.ts\n\n🚫 ARCHIVOS PROHIBIDOS:\n- convex/schema.ts\n\n📝 DETALLE:\nEliminar SAMPLE_NEWS, NOTICIAS_MOCK, mockAnalysis. Una sola fuente cloud/API real o degradación explícita visible.\n\n✅ DONE CUANDO:\nNo hay mocks/placeholders en news, fuente real o degradación visible` },

  { name: "[S2-003] Creator Dashboard - Métricas reales", status: "Ready", type: "Feature", priority: "High", domain: "Frontend", order: 21,
    notes: `📂 ARCHIVOS A EDITAR:\n- src/views/CreatorDashboard.tsx\n- src/services/analytics/communityAnalytics.ts\n\n🚫 ARCHIVOS PROHIBIDOS:\n- convex/schema.ts\n\n📝 DETALLE:\nactiveMembers/growthRate por estimación, Distribution/Calendar estáticos. Todas las métricas deben venir de queries Convex reales.\n\n✅ DONE CUANDO:\nTodas las métricas vienen de queries Convex reales` },

  { name: "[S2-004] Signals - Feature flags y permisos", status: "Ready", type: "Feature", priority: "High", domain: "Fullstack", order: 22,
    notes: `📂 ARCHIVOS A EDITAR:\n- convex/signals.ts\n- src/views/SignalsView.tsx\n\n🚫 ARCHIVOS PROHIBIDOS:\n- Ninguno\n\n📝 DETALLE:\nsignalsFeatureEnabled hardcodeado true, mezcla role/rol. Feature flags desde Convex config, permisos consistentes.\n\n✅ DONE CUANDO:\nFeature flags desde Convex config, permisos consistentes` },

  { name: "[S2-005] Perfil/Creator público real", status: "Ready", type: "Feature", priority: "Medium", domain: "Frontend", order: 23,
    notes: `📂 ARCHIVOS A EDITAR:\n- src/views/CreatorView.tsx\n- src/views/PerfilView.tsx\n\n🚫 ARCHIVOS PROHIBIDOS:\n- convex/schema.ts\n\n📝 DETALLE:\nCopy/cálculos estimados, compras hardcodeadas. Perfil público desde Convex, historial real de suscripciones.\n\n✅ DONE CUANDO:\nPerfil público desde Convex, historial real de suscripciones` },

  { name: "[S2-006] Community Feed - Cloud-first", status: "Ready", type: "Feature", priority: "High", domain: "Frontend", order: 24,
    notes: `📂 ARCHIVOS A EDITAR:\n- src/views/ComunidadView.tsx\n- src/components/feed/CommunityFeed.tsx\n\n🚫 ARCHIVOS PROHIBIDOS:\n- convex/schema.ts\n\n📝 DETALLE:\nFallback local a 5s, leaderboard/ads/herramientas no cloud-first. Source cloud-first, consistencia cross-browser en post/like/follow.\n\n✅ DONE CUANDO:\nSource cloud-first, consistencia cross-browser` },

  { name: "[S2-007] Payments - Unificar superficie", status: "Ready", type: "Feature", priority: "High", domain: "Fullstack", order: 25,
    notes: `📂 ARCHIVOS A EDITAR:\n- src/views/PricingView.tsx\n- src/components/payments/PaymentModal.tsx\n- src/components/payments/UserWallet.tsx\n- src/services/paymentOrchestrator.ts\n\n🚫 ARCHIVOS PROHIBIDOS:\n- convex/schema.ts\n\n📝 DETALLE:\nFlujos legacy por fetch directo, billing cycle no soportado. Todo usa paymentOrchestrator, monthly/annual real, sin flujos legacy.\n\n✅ DONE CUANDO:\nTodo usa paymentOrchestrator, monthly/annual real, sin flujos legacy` },
];

async function createTask(task, index) {
  const body = {
    parent: { database_id: NOTION_DATABASE_ID },
    properties: {
      Name: {
        title: [{ text: { content: task.name } }]
      },
      Status: {
        select: { name: task.status }
      },
      Type: {
        select: { name: task.type }
      },
      Priority: {
        select: { name: task.priority }
      },
      Domain: {
        rich_text: [{ text: { content: task.domain || '' } }]
      },
      "Execution Order": {
        number: task.order || index + 1
      },
      "Auto Generated": {
        checkbox: true
      },
      "Tech Notes": {
        rich_text: [{ text: { content: task.notes || '' } }]
      }
    }
  };

  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to create task "${task.name}": ${err}`);
  }

  return await response.json();
}

async function main() {
  console.log('📋 Creando tareas del Sprint 2 en Notion...\n');
  console.log(`Database: ${NOTION_DATABASE_ID}`);
  console.log(`Total tareas: ${tasks.length}\n`);

  let created = 0;
  let errors = 0;

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    try {
      await createTask(task, i);
      created++;
      process.stdout.write(`\r  ✅ Progreso: ${created}/${tasks.length} - ${task.name.substring(0, 50)}...`);
    } catch (err) {
      errors++;
      console.error(`\n  ❌ Error creando "${task.name}": ${err.message}`);
    }
  }

  console.log('\n');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  ✅ Sprint 2 creado en Notion                    ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`\n  📊 Resumen:`);
  console.log(`     - Creadas: ${created}`);
  console.log(`     - Errores: ${errors}`);
  console.log(`     - Total: ${tasks.length}`);
  console.log('\n  Ejecutar "node scripts/aurora-inicio.mjs" para ver el tablero actualizado.\n');
}

main().catch(err => {
  console.error('❌ Error fatal:', err.message);
  process.exit(1);
});
