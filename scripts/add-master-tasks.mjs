#!/usr/bin/env node
/**
 * add-master-tasks.mjs — Agregar plan maestro a Notion
 *
 * Ejecutar: node scripts/add-master-tasks.mjs
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

// Master task plan organized by sector
const masterTasks = [
  // ═══════════════════════════════════════════
  // SECTOR 1: AUTH & USER MANAGEMENT
  // ═══════════════════════════════════════════
  { name: "Revisar y corregir sistema de Login JWT", status: "Backlog", type: "Feature", priority: "Critical", domain: "Auth", order: 1, notes: "Verificar flujo completo de autenticación, tokens, sesiones persistentes" },
  { name: "Revisar y corregir sistema de Registro", status: "Backlog", type: "Feature", priority: "Critical", domain: "Auth", order: 2, notes: "Verificar validaciones, email, verificación, flujo completo" },
  { name: "Perfiles estilo Landing Page con bio, stats y links", status: "Backlog", type: "Feature", priority: "High", domain: "Profiles", order: 3, notes: "Diseño elegante tipo landing page con info del usuario, seguidores, cursos, comunidades" },
  { name: "Sistema de Follow/Seguir usuarios", status: "Backlog", type: "Feature", priority: "High", domain: "Profiles", order: 4, notes: "Seguir/dejar de seguir, contador de seguidores, feed de seguidos" },
  { name: "Links compartibles de perfiles y comunidades", status: "Backlog", type: "Feature", priority: "High", domain: "Profiles", order: 5, notes: "URLs amigables /u/username y /c/community para compartir" },
  { name: "Perfiles premium para usuarios con bitácora verificada", status: "Backlog", type: "Feature", priority: "Medium", domain: "Profiles", order: 6, notes: "Badge premium, datos de trading verificados, perfil destacado" },
  { name: "Prompt de suscripción para visitantes no registrados", status: "Backlog", type: "Feature", priority: "High", domain: "Auth", order: 7, notes: "Si un no registrado cae en perfil de creador, mostrar promo de suscripción" },

  // ═══════════════════════════════════════════
  // SECTOR 2: COMMUNITIES & SUBCOMMUNITIES
  // ═══════════════════════════════════════════
  { name: "Revisar y corregir creación de comunidades", status: "Backlog", type: "Feature", priority: "Critical", domain: "Communities", order: 10, notes: "Flujo completo de crear comunidad, configuración, pricing" },
  { name: "Revisar y corregir creación de subcomunidades", status: "Backlog", type: "Feature", priority: "High", domain: "Communities", order: 11, notes: "Subcomunidades dentro de comunidades principales" },
  { name: "Publicar posts en comunidades (miembros)", status: "Backlog", type: "Feature", priority: "Critical", domain: "Communities", order: 12, notes: "Solo miembros suscritos pueden publicar en la comunidad" },
  { name: "Publicar posts en subcomunidades (miembros)", status: "Backlog", type: "Feature", priority: "High", domain: "Communities", order: 13, notes: "Solo miembros de la subcomunidad pueden publicar" },
  { name: "Comentarios en posts de comunidades", status: "Backlog", type: "Feature", priority: "High", domain: "Communities", order: 14, notes: "Sistema de comentarios anidados en posts de comunidades" },
  { name: "Comentarios en posts de subcomunidades", status: "Backlog", type: "Feature", priority: "Medium", domain: "Communities", order: 15, notes: "Sistema de comentarios en subcomunidades" },
  { name: "Botones de Like y Reacciones en posts", status: "Backlog", type: "Feature", priority: "High", domain: "Communities", order: 16, notes: "Like, love, fire, etc. en todos los posts disponibles" },
  { name: "Sistema de puntos por publicaciones", status: "Backlog", type: "Feature", priority: "Medium", domain: "Gamification", order: 17, notes: "XP por publicar, comentar, recibir likes. Ranking basado en puntos" },
  { name: "TV Live privada para comunidades", status: "Backlog", type: "Feature", priority: "High", domain: "Communities", order: 18, notes: "Integrar misma TV Live del portal pero privada para cada comunidad" },
  { name: "Chat privado de comunidad", status: "Backlog", type: "Feature", priority: "High", domain: "Communities", order: 19, notes: "Chat exclusivo para miembros de la comunidad, totalmente privado" },
  { name: "Sección Academia dentro de comunidades", status: "Backlog", type: "Feature", priority: "High", domain: "Communities", order: 20, notes: "Mover cursos a Academia dentro de cada comunidad para mentorías y cursos" },
  { name: "Control de acceso por suscripción a comunidades", status: "Backlog", type: "Feature", priority: "Critical", domain: "Communities", order: 21, notes: "Solo usuarios suscritos y con acceso habilitado pueden entrar a comunidades" },

  // ═══════════════════════════════════════════
  // SECTOR 3: PAYMENTS & SUBSCRIPTIONS
  // ═══════════════════════════════════════════
  { name: "Revisar y corregir integración MercadoPago", status: "Backlog", type: "Feature", priority: "Critical", domain: "Payments", order: 30, notes: "Checkout, webhooks, preferencias, callbacks, todo funcional" },
  { name: "Revisar sector Suscripciones completo", status: "Backlog", type: "Feature", priority: "Critical", domain: "Payments", order: 31, notes: "Planes, pricing, beneficios, todo funcional y visible" },
  { name: "Botones de suscripción en todos los lugares necesarios", status: "Backlog", type: "Feature", priority: "High", domain: "Payments", order: 32, notes: "CTA de suscripción en comunidades, perfiles, cursos, contenido premium" },
  { name: "Sistema de suscripciones a la carta (pay-per-service)", status: "Backlog", type: "Feature", priority: "Critical", domain: "Payments", order: 33, notes: "Usuarios eligen qué servicios quieren y cuánto pagar por cada uno" },
  { name: "Solo Feed gratuito - resto es de pago", status: "Backlog", type: "Feature", priority: "Critical", domain: "Payments", order: 34, notes: "Política: feed del portal es gratis, todo lo demás requiere suscripción" },
  { name: "Sistema de comisiones para la plataforma", status: "Backlog", type: "Feature", priority: "High", domain: "Payments", order: 35, notes: "Comisión automática por cada transacción/venta de comunidad" },
  { name: "Organizar pagos y cobros a creadores", status: "Backlog", type: "Feature", priority: "High", domain: "Payments", order: 36, notes: "Dashboard de ganancias, retiros, historial de pagos para creadores" },

  // ═══════════════════════════════════════════
  // SECTOR 4: CONTENT & PSICOTRADING
  // ═══════════════════════════════════════════
  { name: "Revisar sistema de publicación de posts", status: "Backlog", type: "Feature", priority: "High", domain: "Content", order: 40, notes: "Crear posts con imágenes, texto, tags, categorías" },
  { name: "Revisar extractor de YouTube con filtro Psicotrading", status: "Backlog", type: "Feature", priority: "High", domain: "Content", order: 41, notes: "Auto-publicar videos de YouTube filtrados por psicotrading" },
  { name: "Estilo Shorts en sección Psicotrading", status: "Backlog", type: "Feature", priority: "Medium", domain: "Content", order: 42, notes: "Videos cortos estilo TikTok/Shorts con filtros de psicotrading" },
  { name: "Integrar Cursos dentro de Academia en comunidades", status: "Backlog", type: "Feature", priority: "High", domain: "Content", order: 43, notes: "Mover sección Cursos a Academia dentro de cada comunidad" },
  { name: "Sistema de mentorías para creadores", status: "Backlog", type: "Feature", priority: "Medium", domain: "Content", order: 44, notes: "Creadores pueden ofrecer mentorías dentro de su comunidad" },

  // ═══════════════════════════════════════════
  // SECTOR 5: ADMIN PANEL
  // ═══════════════════════════════════════════
  { name: "Admin panel full-width (todo el ancho)", status: "Backlog", type: "Feature", priority: "High", domain: "Admin", order: 50, notes: "Panel ocupa 100% del ancho para mayor comodidad" },
  { name: "Admin: CRUD completo de usuarios", status: "Backlog", type: "Feature", priority: "Critical", domain: "Admin", order: 51, notes: "Crear, editar, eliminar, banear usuarios" },
  { name: "Admin: CRUD completo de comunidades", status: "Backlog", type: "Feature", priority: "Critical", domain: "Admin", order: 52, notes: "Crear, editar, eliminar comunidades" },
  { name: "Admin: CRUD completo de posts", status: "Backlog", type: "Feature", priority: "High", domain: "Admin", order: 53, notes: "Editar, eliminar, moderar posts" },
  { name: "Admin: Gestión de pagos y suscripciones", status: "Backlog", type: "Feature", priority: "Critical", domain: "Admin", order: 54, notes: "Ver pagos, reembolsos, suscripciones activas/inactivas" },
  { name: "Admin: Gestión de extractor YouTube", status: "Backlog", type: "Feature", priority: "High", domain: "Admin", order: 55, notes: "Configurar filtros, fuentes, frecuencia de extracción" },
  { name: "Admin: Dashboard de métricas globales", status: "Backlog", type: "Feature", priority: "High", domain: "Admin", order: 56, notes: "Usuarios activos, ingresos, comunidades, engagement" },
  { name: "Admin: Gestión de contenido y moderación", status: "Backlog", type: "Feature", priority: "Medium", domain: "Admin", order: 57, notes: "Reportes, contenido inapropiado, bans, advertencias" },

  // ═══════════════════════════════════════════
  // SECTOR 6: BITACORA & DATA VALIDATION
  // ═══════════════════════════════════════════
  { name: "Conexión directa a bitácora de trading", status: "Backlog", type: "Feature", priority: "High", domain: "Bitacora", order: 60, notes: "Usuarios conectan su bitácora y extraen datos automáticamente" },
  { name: "Extracción automática de datos de trading", status: "Backlog", type: "Feature", priority: "High", domain: "Bitacora", order: 61, notes: "Sync automática de operaciones, PnL, win rate, etc." },
  { name: "Validación segura de datos (no editable)", status: "Backlog", type: "Feature", priority: "Critical", domain: "Bitacora", order: 62, notes: "Datos verificados que no se pueden modificar manualmente" },
  { name: "Perfiles premium con datos verificados", status: "Backlog", type: "Feature", priority: "Medium", domain: "Bitacora", order: 63, notes: "Mostrar stats verificados como ejemplo para el portal" },

  // ═══════════════════════════════════════════
  // SECTOR 7: OPTIMIZATION & LAUNCH
  // ═══════════════════════════════════════════
  { name: "Optimizar performance general del sitio", status: "Backlog", type: "Infra", priority: "High", domain: "Performance", order: 70, notes: "Lazy loading, code splitting, caching, bundle size" },
  { name: "Resolver merge conflicts y errores de build", status: "Backlog", type: "Infra", priority: "Critical", domain: "Performance", order: 71, notes: "Fix storage.ts merge conflict, tsc errors, npm audit" },
  { name: "Generar Convex _generated y desplegar", status: "Backlog", type: "Infra", priority: "Critical", domain: "Performance", order: 72, notes: "Deploy Convex para generar tipos y poder correr dev server" },
  { name: "Auditoría de seguridad completa", status: "Backlog", type: "Infra", priority: "Critical", domain: "Security", order: 73, notes: "Rotar API keys expuestas, fix JWT secret, webhook parser conflict" },
  { name: "Tests end-to-end de flujos críticos", status: "Backlog", type: "Infra", priority: "High", domain: "Testing", order: 74, notes: "Login, registro, pago, suscripción, publicación" },
  { name: "Preparar launch: SEO, meta tags, analytics", status: "Backlog", type: "Feature", priority: "Medium", domain: "Launch", order: 75, notes: "SEO completo, Google Analytics, sitemap, robots.txt" },

  // ═══════════════════════════════════════════
  // SECTOR 8: AGENT COORDINATION
  // ═══════════════════════════════════════════
  { name: "Crear espacio de coordinación entre agentes", status: "Backlog", type: "Infra", priority: "High", domain: "Coordination", order: 80, notes: "Daily updates, Q&A area, knowledge sharing" },
  { name: "Crear skills de conocimiento compartido", status: "Backlog", type: "Infra", priority: "Medium", domain: "Coordination", order: 81, notes: "Documentar soluciones, patrones, learnings para reutilizar" },
  { name: "Configurar delegación de sub-agentes (2 por agente)", status: "Backlog", type: "Infra", priority: "Medium", domain: "Coordination", order: 82, notes: "Cada agente puede delegar a 2 sub-agentes estilo colmena" },
];

async function createTask(task) {
  const body = {
    parent: { database_id: NOTION_DATABASE_ID },
    properties: {
      Name: { title: [{ text: { content: task.name } }] },
      Status: { select: { name: task.status } },
      Type: { select: { name: task.type } },
      Priority: { select: { name: task.priority } },
      Domain: { rich_text: [{ text: { content: task.domain } }] },
      "Execution Order": { number: task.order },
      "Auto Generated": { checkbox: true },
      "Tech Notes": { rich_text: [{ text: { content: task.notes || '' } }] },
    }
  };

  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to create "${task.name}": ${err}`);
  }

  return await response.json();
}

async function main() {
  console.log('📋 Agregando plan maestro a Notion...\n');
  console.log(`Database: ${NOTION_DATABASE_ID}`);
  console.log(`Total tareas: ${masterTasks.length}\n`);

  // Show summary by sector
  const sectors = {};
  masterTasks.forEach(t => {
    if (!sectors[t.domain]) sectors[t.domain] = [];
    sectors[t.domain].push(t);
  });

  console.log('📊 Resumen por sector:');
  for (const [domain, tasks] of Object.entries(sectors)) {
    const critical = tasks.filter(t => t.priority === 'Critical').length;
    const high = tasks.filter(t => t.priority === 'High').length;
    console.log(`  ${domain}: ${tasks.length} tareas (${critical} críticas, ${high} altas)`);
  }

  console.log('\n⏳ Agregando tareas a Notion...\n');

  let created = 0;
  let errors = 0;

  for (const task of masterTasks) {
    try {
      await createTask(task);
      created++;
      process.stdout.write(`\r  ✅ Progreso: ${created}/${masterTasks.length}`);
    } catch (err) {
      errors++;
      console.error(`\n  ❌ Error creando "${task.name}": ${err.message}`);
    }
  }

  console.log('\n');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  ✅ Plan maestro agregado a Notion       ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`\n  📊 Resumen:`);
  console.log(`     - Creadas: ${created}`);
  console.log(`     - Errores: ${errors}`);
  console.log(`     - Total: ${masterTasks.length}`);
  console.log('\n  Todas las tareas están en estado "Backlog" listas para trabajar.\n');
}

main().catch(err => {
  console.error('❌ Error fatal:', err.message);
  process.exit(1);
});
