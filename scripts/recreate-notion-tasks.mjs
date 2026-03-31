#!/usr/bin/env node
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

const headers = {
  'Authorization': `Bearer ${NOTION_API_KEY}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
};

// All tasks to recreate
const tasks = [
  { name: "XP por eventos", status: "Backlog", type: "Feature", priority: "Medium", domain: "Gamification" },
  { name: "Crear comunidad", status: "Backlog", type: "Feature", priority: "High", domain: "Communities" },
  { name: "Realtime señales", status: "Backlog", type: "Feature", priority: "Critical", domain: "Realtime" },
  { name: "Sistema gamification base", status: "Backlog", type: "Infra", priority: "Medium", domain: "Gamification" },
  { name: "Implementar webhooks", status: "Backlog", type: "Feature", priority: "High", domain: "Payments" },
  { name: "Sistema de comentarios", status: "Backlog", type: "Feature", priority: "Medium", domain: "Community" },
  { name: "Sistema notificaciones", status: "Backlog", type: "Feature", priority: "Medium", domain: "Notifications" },
  { name: "Implementar login JWT", status: "Backlog", type: "Feature", priority: "Critical", domain: "Auth" },
  { name: "Event Bus base", status: "Backlog", type: "Infra", priority: "High", domain: "Core" },
  { name: "Implementar registro", status: "Backlog", type: "Feature", priority: "Critical", domain: "Auth" },
  { name: "Lifecycle señal", status: "Backlog", type: "Feature", priority: "High", domain: "Signals" },
  { name: "Crear tabla user_meta", status: "Backlog", type: "Infra", priority: "Medium", domain: "Database" },
  { name: "Configurar variables de entorno", status: "Backlog", type: "Infra", priority: "High", domain: "DevOps" },
  { name: "Setup estructura base backend", status: "Backlog", type: "Infra", priority: "Critical", domain: "Backend" },
  { name: "Crear tabla post_metrics", status: "Backlog", type: "Infra", priority: "Medium", domain: "Database" },
  { name: "Crear tabla signal_subscriptions", status: "Backlog", type: "Infra", priority: "High", domain: "Database" },
  { name: "Configurar Convex + Express", status: "Backlog", type: "Infra", priority: "Critical", domain: "Backend" },
  { name: "Integrar MercadoPago", status: "Backlog", type: "Feature", priority: "Critical", domain: "Payments" },
  { name: "Crear tabla post_interactions", status: "Backlog", type: "Infra", priority: "Medium", domain: "Database" },
  { name: "Crear tabla users", status: "Backlog", type: "Infra", priority: "Critical", domain: "Database" },
  { name: "Acceso señales premium", status: "Backlog", type: "Feature", priority: "High", domain: "Signals" },
  { name: "Crear tabla communities", status: "Backlog", type: "Infra", priority: "High", domain: "Database" },
  { name: "Crear tabla signal_results", status: "Backlog", type: "Infra", priority: "Medium", domain: "Database" },
  { name: "Sistema de likes", status: "Backlog", type: "Feature", priority: "Medium", domain: "Community" },
  { name: "Crear tabla payments", status: "Backlog", type: "Infra", priority: "High", domain: "Database" },
  { name: "Persistencia de sesión", status: "Backlog", type: "Feature", priority: "High", domain: "Auth" },
  { name: "Feed con paginación", status: "Backlog", type: "Feature", priority: "High", domain: "Community" },
  { name: "Crear tabla notifications", status: "Backlog", type: "Infra", priority: "Medium", domain: "Database" },
  { name: "WebSockets base", status: "Backlog", type: "Infra", priority: "High", domain: "Realtime" },
  { name: "Crear tabla community_members", status: "Backlog", type: "Infra", priority: "High", domain: "Database" },
  { name: "Crear tabla signal_updates", status: "Backlog", type: "Infra", priority: "Medium", domain: "Database" },
  { name: "Unirse a comunidad", status: "Backlog", type: "Feature", priority: "High", domain: "Communities" },
  { name: "Crear señal", status: "Backlog", type: "Feature", priority: "High", domain: "Signals" },
  { name: "Crear tabla user_settings", status: "Backlog", type: "Infra", priority: "Medium", domain: "Database" },
  { name: "Crear post", status: "Backlog", type: "Feature", priority: "High", domain: "Community" },
  { name: "Crear tabla posts", status: "Backlog", type: "Infra", priority: "Critical", domain: "Database" },
  { name: "Crear chat", status: "Backlog", type: "Feature", priority: "Medium", domain: "Community" },
  { name: "Listeners por dominio", status: "Backlog", type: "Feature", priority: "Medium", domain: "Core" },
  { name: "Crear tabla subscriptions", status: "Backlog", type: "Infra", priority: "High", domain: "Database" },
  { name: "Crear tabla signals", status: "Backlog", type: "Infra", priority: "High", domain: "Database" },
  { name: "Remove floating AI from AdminView.tsx, full-width, stats", status: "Backlog", type: "Feature", priority: "Low", domain: "UI" },
  { name: "Global Styling: Icons, business avatars, L/D modes, Negocios cards", status: "Backlog", type: "Feature", priority: "Medium", domain: "UI" },
  { name: "Consolidate bottom controls to ONE floating Menu button", status: "Backlog", type: "Feature", priority: "High", domain: "UI" },
  { name: "Move Mi Comunidad/Observatory to Creator Admin Panel", status: "Backlog", type: "Feature", priority: "Medium", domain: "UI" },
  { name: "Señales & Trading: Dynamic background, Neon loaders, VIP style", status: "Backlog", type: "Feature", priority: "Medium", domain: "UI" },
  { name: "Bitácora Native & User Profiles: Sync Bitácora, premium style", status: "Backlog", type: "Feature", priority: "Medium", domain: "UI" },
  { name: "Noticias: Newspaper styling, Economic Calendar", status: "Backlog", type: "Feature", priority: "Medium", domain: "UI" },
  { name: "Ads Engine: Rotating banners (Sidebar, Feed, Discover)", status: "Backlog", type: "Feature", priority: "High", domain: "Growth" },
  { name: "Rename Marketplace to Negocios, move Publicidad inside", status: "Backlog", type: "Feature", priority: "Medium", domain: "UI" },
  { name: "Reconfigure top menu sections (remove/move sections)", status: "Backlog", type: "Feature", priority: "Medium", domain: "UI" },
  { name: "Hide Pricing from nav, rename to Suscripciones, integrate", status: "Backlog", type: "Feature", priority: "Medium", domain: "UI" },
  { name: "Remove floating AI icons from Navigation.tsx", status: "Backlog", type: "Feature", priority: "Low", domain: "UI" },
  { name: "Premios (ex-Ranking): Token prize redemptions", status: "Backlog", type: "Feature", priority: "Medium", domain: "Gamification" },
];

async function createTask(task, index) {
  const statusMap = {
    'Backlog': 'Backlog',
    'Ready': 'Ready',
    'En progreso': 'En progreso',
    'Listo': 'Listo',
    'In Progress': 'In Progress',
    'Done': 'Done',
  };

  const body = {
    parent: { database_id: NOTION_DATABASE_ID },
    properties: {
      Name: {
        title: [{ text: { content: task.name } }]
      },
      Status: {
        select: { name: statusMap[task.status] || 'Backlog' }
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
        number: index + 1
      },
      "Auto Generated": {
        checkbox: true
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
  console.log('📋 Recreando tareas en Notion...\n');
  console.log(`Database: ${NOTION_DATABASE_ID}`);
  console.log(`Total tareas: ${tasks.length}\n`);

  let created = 0;
  let errors = 0;

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    try {
      await createTask(task, i);
      created++;
      process.stdout.write(`\r  ✅ Progreso: ${created}/${tasks.length} - ${task.name}`);
    } catch (err) {
      errors++;
      console.error(`\n  ❌ Error creando "${task.name}": ${err.message}`);
    }
  }

  console.log('\n');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  ✅ Tareas recreadas exitosamente        ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`\n  📊 Resumen:`);
  console.log(`     - Creadas: ${created}`);
  console.log(`     - Errores: ${errors}`);
  console.log(`     - Total: ${tasks.length}`);
  console.log('\n  Todas las tareas están en estado "Backlog" listas para trabajar.\n');
}

main().catch(err => {
  console.error('❌ Error fatal:', err.message);
  process.exit(1);
});
