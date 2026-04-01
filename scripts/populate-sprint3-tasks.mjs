#!/usr/bin/env node
/**
 * populate-sprint3-tasks.mjs
 * Crea las tareas del Sprint 3 en Notion
 * Sprint 3: Production Readiness (7 tareas)
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
  { name: "[S3-001] Configurar Sentry correctamente", status: "Ready", type: "Infra", priority: "High", domain: "DevOps", order: 26,
    notes: `📂 ARCHIVOS A EDITAR:\n- vite.config.ts\n- src/sentry.ts\n- .env.example\n\n🚫 ARCHIVOS PROHIBIDOS:\n- Ninguno\n\n📝 DETALLE:\nAuth token faltante, source maps no se suben. Configurar SENTRY_AUTH_TOKEN, sentry release, upload source maps.\n\n✅ DONE CUANDO:\nSentry captura errores en prod con source maps` },

  { name: "[S3-002] Tests E2E - Flujos críticos", status: "Ready", type: "Test", priority: "High", domain: "Testing", order: 27,
    notes: `📂 ARCHIVOS A EDITAR:\n- __tests__/e2e/ (crear: login.spec.ts, navigation.spec.ts, community.spec.ts)\n\n🚫 ARCHIVOS PROHIBIDOS:\n- convex/schema.ts\n\n📝 DETALLE:\nSin cobertura E2E de flujos reales. Tests para login, post creation, navigation, community join, payments.\n\n✅ DONE CUANDO:\nTests E2E para flujos críticos pasan en CI` },

  { name: "[S3-003] Tests unitarios - Servicios core", status: "Ready", type: "Test", priority: "Medium", domain: "Testing", order: 28,
    notes: `📂 ARCHIVOS A EDITAR:\n- __tests__/unit/ (crear: postService.test.ts, userService.test.ts, paymentOrchestrator.test.ts)\n\n🚫 ARCHIVOS PROHIBIDOS:\n- Ninguno\n\n📝 DETALLE:\nServicios sin tests unitarios. Tests para postService, userService, paymentOrchestrator, ranking.\n\n✅ DONE CUANDO:\n>80% coverage en servicios core` },

  { name: "[S3-004] Health check endpoint", status: "Ready", type: "Feature", priority: "High", domain: "Backend", order: 29,
    notes: `📂 ARCHIVOS A EDITAR:\n- server.ts (mejorar /api/health)\n\n🚫 ARCHIVOS PROHIBIDOS:\n- convex/schema.ts\n\n📝 DETALLE:\nEndpoint actual solo reporta clients. Debe reportar estado de Convex, WebSocket, DB, providers.\n\n✅ DONE CUANDO:\n/api/health reporta Convex, WS, DB, providers con status ok/error` },

  { name: "[S3-005] Rate limiting production", status: "Ready", type: "Security", priority: "High", domain: "Backend", order: 30,
    notes: `📂 ARCHIVOS A EDITAR:\n- server.ts\n- lib/auth/rateLimit.ts\n\n🚫 ARCHIVOS PROHIBIDOS:\n- convex/schema.ts\n\n📝 DETALLE:\nRate limiting básico, no adaptativo. Rate limiting por IP, por usuario, por endpoint, con headers.\n\n✅ DONE CUANDO:\nRate limiting por IP/usuario/endpoint con headers X-RateLimit-*` },

  { name: "[S3-006] Backup automático", status: "Ready", type: "Infra", priority: "Medium", domain: "DevOps", order: 31,
    notes: `📂 ARCHIVOS A EDITAR:\n- server.ts (scheduler)\n- convex/backup.ts\n- scripts/backup-auto.mjs (crear)\n\n🚫 ARCHIVOS PROHIBIDOS:\n- Ninguno\n\n📝 DETALLE:\nBackups manuales. Backup automático diario con retención configurable.\n\n✅ DONE CUANDO:\nBackup automático diario, retención 7/30/90 días` },

  { name: "[S3-007] CI/CD pipeline", status: "Ready", type: "Infra", priority: "High", domain: "DevOps", order: 32,
    notes: `📂 ARCHIVOS A EDITAR:\n- .github/workflows/ci.yml (crear)\n- .github/workflows/deploy.yml (crear)\n\n🚫 ARCHIVOS PROHIBIDOS:\n- Ninguno\n\n📝 DETALLE:\nDeploy manual. GitHub Actions: lint → test → build → deploy en push a main.\n\n✅ DONE CUANDO:\nPush a main ejecuta CI/CD completo` },
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
  console.log('📋 Creando tareas del Sprint 3 en Notion...\n');
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
  console.log('║  ✅ Sprint 3 creado en Notion                    ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`\n  📊 Resumen:`);
  console.log(`     - Creadas: ${created}`);
  console.log(`     - Errores: ${errors}`);
  console.log(`     - Total: ${tasks.length}`);
  console.log('\n  Iniciando Sprint 3...\n');
}

main().catch(err => {
  console.error('❌ Error fatal:', err.message);
  process.exit(1);
});
