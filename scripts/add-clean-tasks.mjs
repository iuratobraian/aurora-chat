#!/usr/bin/env node
/**
 * add-clean-tasks.mjs — Agregar tareas limpias y detalladas a Notion
 *
 * Cada tarea incluye:
 * - Título claro y descriptivo
 * - Descripción detallada de qué hacer
 * - Archivos específicos a tocar
 * - Archivos prohibidos
 * - Definición de Done clara
 *
 * Ejecutar: node scripts/add-clean-tasks.mjs
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

// Cada tarea con título claro, descripción, archivos y definición de done
const tasks = [
  // ═══════════════════════════════════════════════════════
  // SECTOR 1: AUTH & REGISTRO (Archivos: auth, profiles)
  // ═══════════════════════════════════════════════════════
  {
    title: "Fix: Login JWT — verificar que tokens se firman y validan correctamente",
    status: "Backlog",
    type: "Feature",
    priority: "Critical",
    domain: "Auth",
    order: 1,
    description: "Revisar el flujo completo de login: el usuario ingresa credenciales → se verifica en Convex → se genera token JWT → se almacena en localStorage → se usa en requests. Verificar que JWT_SECRET esté configurado en .env.local y que los tokens se validen correctamente en server.ts.",
    files: "src/services/auth/authService.ts, server.ts (requireAuth), src/components/AuthModal.tsx",
    forbidden: "convex/schema.ts, src/App.tsx, src/Navigation.tsx",
    done: "Login funciona con JWT válido, token expirado pide re-login, credenciales incorrectas muestran error claro"
  },
  {
    title: "Fix: Registro — validar email, password mínimo 6 chars, username único",
    status: "Backlog",
    type: "Feature",
    priority: "Critical",
    domain: "Auth",
    order: 2,
    description: "El registro debe validar: email con formato válido, password mínimo 6 caracteres, username alfanumérico de 3+ chars, verificar unicidad en Convex antes de crear. El password debe hashearse ANTES de enviar a Convex (nunca plaintext).",
    files: "src/services/auth/authService.ts (register), src/components/AuthModal.tsx (form validation)",
    forbidden: "convex/schema.ts, server.ts",
    done: "Registro rechaza emails inválidos, passwords cortos, usernames duplicados. Password se hashea antes de enviar a Convex."
  },
  {
    title: "Fix: Persistencia de sesión — que no se pierda al recargar la página",
    status: "Backlog",
    type: "Feature",
    priority: "High",
    domain: "Auth",
    order: 3,
    description: "Al recargar la página, el usuario debe seguir logueado. Verificar que getCurrentSession() en authService.ts lee correctamente el token de localStorage y lo valida. Si el token expiró, pedir re-login.",
    files: "src/services/auth/authService.ts (getCurrentSession), src/utils/sessionManager.ts",
    forbidden: "server.ts, convex/schema.ts",
    done: "Usuario logueado persiste al recargar F5. Token expirado redirige a login. Sesión se limpia al cerrar sesión."
  },

  // ═══════════════════════════════════════════════════════
  // SECTOR 2: PERFILES DE USUARIO
  // ═══════════════════════════════════════════════════════
  {
    title: "Feature: Perfiles estilo Landing Page con bio, stats y links compartibles",
    status: "Backlog",
    type: "Feature",
    priority: "High",
    domain: "Profiles",
    order: 10,
    description: "Crear vista de perfil público estilo landing page: foto, nombre, bio, estadísticas de trading (win rate, PnL), seguidores/siguiendo, comunidades que creó, cursos que ofrece. URLs compartibles tipo /perfil/username. Si el visitante no está registrado, mostrar promo de suscripción.",
    files: "src/views/PerfilView.tsx, src/components/ProfileCard.tsx, convex/profiles.ts",
    forbidden: "src/App.tsx, src/Navigation.tsx",
    done: "Perfil público visible sin login, muestra datos del usuario, URL compartible, no registrados ven promo de suscripción"
  },
  {
    title: "Feature: Sistema de Follow/Seguir usuarios",
    status: "Backlog",
    type: "Feature",
    priority: "High",
    domain: "Profiles",
    order: 11,
    description: "Los usuarios pueden seguir/dejar de seguir a otros. Mostrar contador de seguidores y siguiendo. El feed puede filtrar posts de usuarios seguidos. Datos almacenados en Convex (perfil.seguidores, perfil.siguiendo).",
    files: "src/views/PerfilView.tsx, convex/profiles.ts (follow/unfollow mutations)",
    forbidden: "src/App.tsx, src/Navigation.tsx",
    done: "Botón seguir/dejar de seguir funciona, contadores actualizan en tiempo real, lista de seguidores visible en perfil"
  },
  {
    title: "Feature: Perfiles premium con datos verificados de bitácora",
    status: "Backlog",
    type: "Feature",
    priority: "Medium",
    domain: "Profiles",
    order: 12,
    description: "Usuarios que conectan su bitácora de trading y verifican sus datos reciben badge premium en su perfil. Mostrar estadísticas reales verificadas (no editables): win rate, operaciones totales, PnL. Perfil destacado en búsquedas.",
    files: "src/views/PerfilView.tsx, convex/profiles.ts, convex/traderVerification.ts",
    forbidden: "src/App.tsx",
    done: "Badge premium visible, stats verificadas mostradas, datos no editables manualmente"
  },

  // ═══════════════════════════════════════════════════════
  // SECTOR 3: COMUNIDADES (CRÍTICO)
  // ═══════════════════════════════════════════════════════
  {
    title: "Fix: Crear comunidad — formulario completo con nombre, descripción, precio",
    status: "Backlog",
    type: "Feature",
    priority: "Critical",
    domain: "Communities",
    order: 20,
    description: "Revisar el flujo de crear comunidad: nombre, descripción, imagen, precio de suscripción, categoría. Validar que el creador esté logueado. Guardar en Convex communities table. Mostrar preview antes de crear.",
    files: "src/views/ComunidadView.tsx, convex/communities.ts (createCommunity mutation)",
    forbidden: "src/App.tsx, src/Navigation.tsx, server.ts",
    done: "Formulario crea comunidad en Convex, validación de campos, imagen subida, precio configurado, creador asignado como admin"
  },
  {
    title: "Feature: Unirse a comunidad — verificar suscripción antes de entrar",
    status: "Backlog",
    type: "Feature",
    priority: "Critical",
    domain: "Communities",
    order: 21,
    description: "Al intentar entrar a una comunidad, verificar si el usuario tiene suscripción activa. Si no tiene, mostrar pantalla de pago con botón de suscripción. Si tiene acceso, entrar directamente. Solo el feed del portal es gratuito.",
    files: "src/views/ComunidadView.tsx, convex/communities.ts (checkAccess), convex/subscriptions.ts",
    forbidden: "src/App.tsx, src/Navigation.tsx",
    done: "Usuario sin suscripción ve pantalla de pago, con suscripción entra directo, feed del portal siempre accesible"
  },
  {
    title: "Feature: Publicar posts en comunidades (solo miembros)",
    status: "Backlog",
    type: "Feature",
    priority: "High",
    domain: "Communities",
    order: 22,
    description: "Los miembros de una comunidad pueden crear posts con texto, imágenes y tags. Verificar membresía antes de permitir publicar. Posts aparecen en el feed de la comunidad. Notificar a otros miembros.",
    files: "src/views/ComunidadView.tsx, convex/posts.ts (createPost), convex/communities.ts",
    forbidden: "src/App.tsx, src/Navigation.tsx",
    done: "Miembro puede crear post con texto/imagen, no miembro ve mensaje de 'solo miembros', post aparece en feed de comunidad"
  },
  {
    title: "Feature: Comentarios en posts de comunidades",
    status: "Backlog",
    type: "Feature",
    priority: "High",
    domain: "Communities",
    order: 23,
    description: "Sistema de comentarios en posts de comunidades. Solo miembros pueden comentar. Comentarios anidados (respuestas a respuestas). Mostrar avatar, nombre, fecha. Like en comentarios.",
    files: "src/views/ComunidadView.tsx, convex/posts.ts (addComment mutation), src/components/CommentSection.tsx",
    forbidden: "src/App.tsx, src/Navigation.tsx",
    done: "Miembro comenta en post, comentarios anidados funcionan, likes en comentarios, no miembro no puede comentar"
  },
  {
    title: "Feature: Botones de Like y Reacciones en todos los posts",
    status: "Backlog",
    type: "Feature",
    priority: "High",
    domain: "Communities",
    order: 24,
    description: "Agregar botón de like (❤️) en posts del feed, posts de comunidades, comentarios. Contador visible. Toggle on/off al hacer click. Reacciones adicionales: 🔥, 💡, 👏.",
    files: "src/components/PostCard.tsx, convex/posts.ts (toggleLike mutation), src/views/ComunidadView.tsx",
    forbidden: "src/App.tsx, src/Navigation.tsx",
    done: "Like funciona en todos los posts, contador actualiza, toggle funciona, reacciones adicionales disponibles"
  },
  {
    title: "Feature: Crear subcomunidades dentro de comunidades",
    status: "Backlog",
    type: "Feature",
    priority: "High",
    domain: "Communities",
    order: 25,
    description: "Los admins de comunidad pueden crear subcomunidades (ej: 'Forex', 'Crypto', 'Opciones' dentro de 'Trading Pro'). Cada subcomunidad tiene su propio feed, chat y academia. Hereda acceso de la comunidad padre.",
    files: "src/views/ComunidadView.tsx, convex/subcommunities.ts, convex/communities.ts",
    forbidden: "src/App.tsx, src/Navigation.tsx",
    done: "Admin crea subcomunidad, miembros ven subcomunidades, cada una tiene feed separado, acceso heredado"
  },
  {
    title: "Feature: Publicar posts en subcomunidades (solo miembros)",
    status: "Backlog",
    type: "Feature",
    priority: "High",
    domain: "Communities",
    order: 26,
    description: "Igual que publicar en comunidades pero aplicado a subcomunidades. Verificar membresía en la comunidad padre. Posts aparecen en feed de la subcomunidad.",
    files: "src/views/ComunidadView.tsx, convex/subcommunities.ts, convex/posts.ts",
    forbidden: "src/App.tsx, src/Navigation.tsx",
    done: "Miembro publica en subcomunidad, post aparece en feed correcto, no miembro bloqueado"
  },
  {
    title: "Feature: Comentarios en posts de subcomunidades",
    status: "Backlog",
    type: "Feature",
    priority: "Medium",
    domain: "Communities",
    order: 27,
    description: "Sistema de comentarios para posts dentro de subcomunidades. Mismo comportamiento que comentarios en comunidades pero aislado por subcomunidad.",
    files: "src/views/ComunidadView.tsx, convex/subcommunities.ts, convex/posts.ts",
    forbidden: "src/App.tsx",
    done: "Comentarios funcionan en subcomunidades, mismo sistema que comunidades padre"
  },
  {
    title: "Feature: Chat privado de comunidad (solo miembros)",
    status: "Backlog",
    type: "Feature",
    priority: "High",
    domain: "Communities",
    order: 28,
    description: "Chat en tiempo real exclusivo para miembros de cada comunidad. Usar WebSocket o Convex subscriptions. Mensajes persistentes. Mostrar quién está online. Solo miembros activos pueden ver y enviar mensajes.",
    files: "src/views/ComunidadView.tsx, convex/subcommunityChat.ts, server.ts (WebSocket)",
    forbidden: "src/App.tsx, src/Navigation.tsx",
    done: "Chat funciona en tiempo real, solo miembros ven mensajes, mensajes persistentes, indicador de online"
  },
  {
    title: "Feature: TV Live privada para comunidades",
    status: "Backlog",
    type: "Feature",
    priority: "High",
    domain: "Communities",
    order: 29,
    description: "Integrar la misma TV Live del portal pero privada para cada comunidad. El creador puede hacer transmisiones en vivo exclusivas para sus miembros. Usar el mismo componente de TV Live pero con verificación de acceso.",
    files: "src/views/ComunidadView.tsx, src/components/TVLive.tsx, convex/communities.ts",
    forbidden: "src/App.tsx, src/Navigation.tsx",
    done: "TV Live funciona dentro de comunidad, solo miembros ven la transmisión, creador puede iniciar stream"
  },
  {
    title: "Feature: Sección Academia dentro de comunidades (cursos y mentorías)",
    status: "Backlog",
    type: "Feature",
    priority: "High",
    domain: "Communities",
    order: 30,
    description: "Dentro de cada comunidad agregar sección 'Academia' donde el creador puede subir cursos, mentorías y material educativo. Mover lo que antes era 'Cursos' a esta sección. Los miembros acceden según su nivel de suscripción.",
    files: "src/views/ComunidadView.tsx, src/views/CursosView.tsx, convex/courses.ts, convex/communities.ts",
    forbidden: "src/App.tsx, src/Navigation.tsx",
    done: "Academia visible dentro de comunidad, creador puede agregar cursos, miembros acceden según suscripción"
  },

  // ═══════════════════════════════════════════════════════
  // SECTOR 4: PAGOS Y SUSCRIPCIONES (CRÍTICO)
  // ═══════════════════════════════════════════════════════
  {
    title: "Fix: Integrar MercadoPago — checkout, webhooks, preferencias",
    status: "Backlog",
    type: "Feature",
    priority: "Critical",
    domain: "Payments",
    order: 40,
    description: "Revisar y dejar funcionando la integración completa de MercadoPago: crear preferencia de pago, redirect al checkout, webhook que confirma el pago, actualizar suscripción del usuario. Verificar que MERCADOPAGO_ACCESS_TOKEN y MERCADOPAGO_WEBHOOK_SECRET estén en .env.local.",
    files: "convex/mercadopagoApi.ts, server.ts (webhook handler), convex/payments.ts",
    forbidden: "src/App.tsx, src/Navigation.tsx",
    done: "Checkout MP funciona, webhook confirma pago, suscripción se activa automáticamente, error handling completo"
  },
  {
    title: "Fix: Sector Suscripciones — planes, pricing, beneficios visibles",
    status: "Backlog",
    type: "Feature",
    priority: "Critical",
    domain: "Payments",
    order: 41,
    description: "Revisar la página de suscripciones (PricingView): mostrar planes disponibles, precios, beneficios de cada plan, botón de suscripción funcional. Verificar que los datos vengan de Convex y no sean hardcoded.",
    files: "src/views/PricingView.tsx, convex/subscriptions.ts, convex/payments.ts",
    forbidden: "src/App.tsx, src/Navigation.tsx",
    done: "PricingView muestra planes reales, precios correctos, botones de suscripción funcionan, redirect a checkout MP"
  },
  {
    title: "Feature: Suscripciones a la carta — elegir servicios individualmente",
    status: "Backlog",
    type: "Feature",
    priority: "Critical",
    domain: "Payments",
    order: 42,
    description: "Sistema donde el usuario elige qué servicios quiere y paga solo por esos: señales, comunidades, cursos, mentorías. Cada servicio tiene su precio. El usuario arma su plan personalizado. Checkout único con MercadoPago.",
    files: "src/views/PricingView.tsx, convex/subscriptions.ts, convex/mercadopagoApi.ts",
    forbidden: "src/App.tsx, src/Navigation.tsx",
    done: "Usuario selecciona servicios, precio se calcula dinámicamente, checkout MP con total correcto, suscripciones individuales activas"
  },
  {
    title: "Feature: Botones de suscripción en todos los lugares necesarios",
    status: "Backlog",
    type: "Feature",
    priority: "High",
    domain: "Payments",
    order: 43,
    description: "Agregar CTA de suscripción en: comunidades privadas, perfiles de creadores, contenido premium, cursos, academia. Si el usuario no tiene acceso, mostrar botón 'Suscribirse' que lleva al checkout.",
    files: "src/views/ComunidadView.tsx, src/views/PerfilView.tsx, src/components/ContentLock.tsx",
    forbidden: "src/App.tsx, src/Navigation.tsx",
    done: "Botón suscripción visible en comunidades, perfiles, contenido premium. Click lleva a checkout MP."
  },
  {
    title: "Feature: Solo Feed gratuito — todo lo demás requiere suscripción",
    status: "Backlog",
    type: "Feature",
    priority: "Critical",
    domain: "Payments",
    order: 44,
    description: "Política: el feed del portal es lo único gratuito. Comunidades, señales, cursos, academia, TV Live privada requieren suscripción. Implementar gate de contenido: si no tiene suscripción, mostrar preview + botón de pago.",
    files: "src/views/ComunidadView.tsx, src/components/ContentLock.tsx, convex/subscriptions.ts",
    forbidden: "src/App.tsx, src/Navigation.tsx",
    done: "Feed accesible sin login, comunidades piden suscripción, contenido premium bloqueado con preview"
  },
  {
    title: "Feature: Sistema de comisiones para la plataforma",
    status: "Backlog",
    type: "Feature",
    priority: "High",
    domain: "Payments",
    order: 45,
    description: "Cada venta de suscripción a comunidad genera una comisión para la plataforma (ej: 10%). Calcular automáticamente: total - comisión = pago al creador. Registrar en payments table. Dashboard de ganancias para creadores.",
    files: "convex/payments.ts, convex/communities.ts, server.ts (webhook handler)",
    forbidden: "src/App.tsx",
    done: "Comisión calculada en cada pago, registro en DB, creador ve sus ganancias netas, plataforma ve comisiones"
  },
  {
    title: "Feature: Organizar pagos y cobros a creadores",
    status: "Backlog",
    type: "Feature",
    priority: "High",
    domain: "Payments",
    order: 46,
    description: "Dashboard para creadores: ver ingresos totales, ingresos por comunidad, historial de pagos, solicitar retiro. Integrar con MercadoPago para payouts automáticos o manuales.",
    files: "src/views/CreatorDashboard.tsx, convex/payments.ts, convex/communities.ts",
    forbidden: "src/App.tsx, src/Navigation.tsx",
    done: "Creador ve dashboard de ganancias, historial de pagos, puede solicitar retiro"
  },

  // ═══════════════════════════════════════════════════════
  // SECTOR 5: CONTENIDO Y PSICOTRADING
  // ═══════════════════════════════════════════════════════
  {
    title: "Fix: Sistema de publicación de posts — texto, imágenes, tags",
    status: "Backlog",
    type: "Feature",
    priority: "High",
    domain: "Content",
    order: 50,
    description: "Revisar el flujo de crear posts: formulario con texto, subida de imágenes, tags/categorías. Posts aparecen en el feed con paginación. Verificar que funciona en feed del portal y en comunidades.",
    files: "src/components/CreatePostModal.tsx, convex/posts.ts, src/views/FeedView.tsx",
    forbidden: "src/App.tsx, src/Navigation.tsx",
    done: "Crear post con texto/imagen funciona, tags se guardan, post aparece en feed, paginación correcta"
  },
  {
    title: "Fix: Extractor de YouTube con filtro Psicotrading — auto-publicar videos",
    status: "Backlog",
    type: "Feature",
    priority: "High",
    domain: "Content",
    order: 51,
    description: "Revisar el cron job que extrae videos de YouTube con filtro de psicotrading. Verificar que VITE_YOUTUBE_API_KEY esté configurado. Videos deben auto-publicarse en la sección Psicotrading con título, thumbnail y descripción.",
    files: "convex/crons.ts, convex/videos.ts, src/views/PsicotradingView.tsx",
    forbidden: "src/App.tsx, src/Navigation.tsx",
    done: "Cron ejecuta, extrae videos con filtro psicotrading, videos se publican automáticamente, sección muestra videos"
  },
  {
    title: "Feature: Estilo Shorts en sección Psicotrading",
    status: "Backlog",
    type: "Feature",
    priority: "Medium",
    domain: "Content",
    order: 52,
    description: "Agregar vista estilo TikTok/Shorts para videos de psicotrading. Scroll vertical infinito, videos a pantalla completa, filtros por tema (disciplina, emociones, gestión de riesgo). Swipe para siguiente video.",
    files: "src/views/PsicotradingView.tsx, src/components/ShortsPlayer.tsx, convex/videos.ts",
    forbidden: "src/App.tsx, src/Navigation.tsx",
    done: "Vista shorts funciona, scroll vertical, videos fullscreen, filtros por tema, infinite scroll"
  },
  {
    title: "Feature: Sistema de mentorías para creadores",
    status: "Backlog",
    type: "Feature",
    priority: "Medium",
    domain: "Content",
    order: 53,
    description: "Dentro de la Academia de cada comunidad, los creadores pueden ofrecer mentorías 1-a-1. Formulario de solicitud, calendario de disponibilidad, pago adicional por mentoría. Notificar al creador cuando alguien solicita.",
    files: "src/views/ComunidadView.tsx, convex/courses.ts, convex/payments.ts",
    forbidden: "src/App.tsx",
    done: "Creador ofrece mentorías, miembros solicitan, pago procesado, notificación enviada"
  },

  // ═══════════════════════════════════════════════════════
  // SECTOR 6: ADMIN PANEL
  // ═══════════════════════════════════════════════════════
  {
    title: "Fix: Admin panel full-width — ocupar todo el ancho de pantalla",
    status: "Backlog",
    type: "Feature",
    priority: "High",
    domain: "Admin",
    order: 60,
    description: "El panel de administración debe ocupar el 100% del ancho de la pantalla para mayor comodidad. Eliminar restricciones de max-width. Reorganizar secciones para aprovechar el espacio.",
    files: "src/views/AdminView.tsx, src/components/admin/AdminPanelDashboard.tsx",
    forbidden: "src/App.tsx, src/Navigation.tsx",
    done: "Admin panel ocupa 100% width, secciones reorganizadas, responsive funciona"
  },
  {
    title: "Feature: Admin CRUD usuarios — crear, editar, banear, eliminar",
    status: "Backlog",
    type: "Feature",
    priority: "Critical",
    domain: "Admin",
    order: 61,
    description: "Panel de administración de usuarios: lista con búsqueda y filtros, ver detalle de usuario, editar rol/email/estado, banear/desbanear, eliminar (soft delete). Todo debe usar Convex mutations, NO localStorage.",
    files: "src/components/admin/AdminPanelDashboard.tsx, convex/profiles.ts (banUser, updateProfile, deleteProfile)",
    forbidden: "src/components/admin/UserManagement.tsx (legacy localStorage), src/App.tsx",
    done: "Admin puede buscar usuarios, editar roles, banear/desbanear, eliminar soft delete, todo via Convex"
  },
  {
    title: "Feature: Admin CRUD comunidades — crear, editar, eliminar comunidades",
    status: "Backlog",
    type: "Feature",
    priority: "Critical",
    domain: "Admin",
    order: 62,
    description: "Panel de administración de comunidades: lista de todas las comunidades, ver detalle, editar nombre/descripción/precio, eliminar (soft delete), ver miembros de cada comunidad.",
    files: "src/components/admin/AdminPanelDashboard.tsx, convex/communities.ts",
    forbidden: "src/App.tsx",
    done: "Admin ve todas las comunidades, puede editar, eliminar, ver miembros, todo via Convex"
  },
  {
    title: "Feature: Admin CRUD posts — moderar, editar, eliminar posts",
    status: "Backlog",
    type: "Feature",
    priority: "High",
    domain: "Admin",
    order: 63,
    description: "Panel de moderación de posts: ver todos los posts, filtrar por comunidad/usuario, editar contenido inapropiado, eliminar posts, ver reportes de usuarios.",
    files: "src/components/admin/AdminPanelDashboard.tsx, convex/posts.ts",
    forbidden: "src/App.tsx",
    done: "Admin ve todos los posts, filtra, edita, elimina, ve reportes"
  },
  {
    title: "Feature: Admin gestión de pagos y suscripciones",
    status: "Backlog",
    type: "Feature",
    priority: "Critical",
    domain: "Admin",
    order: 64,
    description: "Panel de administración de pagos: ver todas las transacciones, estado de pagos (pendiente, completado, fallido), reembolsos, suscripciones activas/inactivas, métricas de ingresos.",
    files: "src/components/admin/AdminPanelDashboard.tsx, convex/payments.ts, convex/subscriptions.ts",
    forbidden: "src/App.tsx",
    done: "Admin ve transacciones, filtra por estado, ve suscripciones activas, métricas de ingresos"
  },
  {
    title: "Feature: Admin gestión de extractor YouTube",
    status: "Backlog",
    type: "Feature",
    priority: "High",
    domain: "Admin",
    order: 65,
    description: "Panel para configurar el extractor de YouTube: agregar/quitar filtros de búsqueda, configurar frecuencia de extracción, ver historial de videos extraídos, forzar extracción manual.",
    files: "src/components/admin/AdminPanelDashboard.tsx, convex/crons.ts, convex/videos.ts",
    forbidden: "src/App.tsx",
    done: "Admin configura filtros, ve historial, fuerza extracción manual, cambia frecuencia"
  },
  {
    title: "Feature: Admin dashboard de métricas globales",
    status: "Backlog",
    type: "Feature",
    priority: "High",
    domain: "Admin",
    order: 66,
    description: "Dashboard principal del admin: usuarios activos hoy/esta semana, ingresos totales, comunidades activas, posts creados, engagement rate. Gráficos visuales con datos reales de Convex.",
    files: "src/components/admin/AdminPanelDashboard.tsx, convex/stats.ts",
    forbidden: "src/App.tsx",
    done: "Dashboard muestra métricas reales, gráficos visuales, datos actualizados en tiempo real"
  },
  {
    title: "Feature: Admin gestión de contenido y moderación",
    status: "Backlog",
    type: "Feature",
    priority: "Medium",
    domain: "Admin",
    order: 67,
    description: "Sistema de moderación: reportes de contenido inapropiado, advertencias a usuarios, bans temporales/permanentes, log de acciones de moderación.",
    files: "src/components/admin/AdminPanelDashboard.tsx, convex/profiles.ts, convex/posts.ts",
    forbidden: "src/App.tsx",
    done: "Admin ve reportes, envía advertencias, banea usuarios, log de moderación visible"
  },

  // ═══════════════════════════════════════════════════════
  // SECTOR 7: BITÁCORA & DATA VALIDATION
  // ═══════════════════════════════════════════════════════
  {
    title: "Feature: Conexión directa a bitácora de trading",
    status: "Backlog",
    type: "Feature",
    priority: "High",
    domain: "Bitacora",
    order: 70,
    description: "Los usuarios pueden conectar su bitácora de trading (TraderSync, TraderSync, Edgewonk, etc.) para extraer datos automáticamente. OAuth o API key para conectar. Sync automático de operaciones, PnL, win rate.",
    files: "src/views/BitacoraView.tsx, src/services/bitacora/, convex/traderVerification.ts",
    forbidden: "src/App.tsx",
    done: "Usuario conecta bitácora, datos se extraen automáticamente, sync periódico configurado"
  },
  {
    title: "Feature: Extracción automática de datos de trading",
    status: "Backlog",
    type: "Feature",
    priority: "High",
    domain: "Bitacora",
    order: 71,
    description: "Una vez conectada la bitácora, extraer automáticamente: operaciones totales, win rate, PnL total, promedio de ganancia/pérdida, racha actual, mejor/peor operación. Almacenar en Convex de forma segura.",
    files: "src/services/bitacora/, convex/traderVerification.ts, convex/stats.ts",
    forbidden: "src/App.tsx",
    done: "Datos extraídos automáticamente, almacenados en Convex, actualizados periódicamente"
  },
  {
    title: "Feature: Validación segura de datos — no editable manualmente",
    status: "Backlog",
    type: "Feature",
    priority: "Critical",
    domain: "Bitacora",
    order: 72,
    description: "Los datos de trading verificados NO pueden ser modificados manualmente por el usuario. Solo se actualizan via sync automático de la bitácora. Implementar flag isVerified en el perfil. Si el usuario intenta editar, rechazar.",
    files: "convex/traderVerification.ts, convex/profiles.ts, src/views/PerfilView.tsx",
    forbidden: "src/App.tsx",
    done: "Datos verificados no editables, flag isVerified en perfil, sync automático es la única fuente de actualización"
  },

  // ═══════════════════════════════════════════════════════
  // SECTOR 8: OPTIMIZACIÓN Y LANZAMIENTO
  // ═══════════════════════════════════════════════════════
  {
    title: "Fix: Deploy Convex — generar _generated y desplegar schema",
    status: "Backlog",
    type: "Infra",
    priority: "Critical",
    domain: "Infra",
    order: 80,
    description: "Ejecutar `npx convex deploy` para generar la carpeta convex/_generated/ con los tipos TypeScript. Sin esto, el dev server no arranca porque los imports de `api` fallan. Necesita CONVEX_DEPLOY_KEY del dashboard.",
    files: "convex/schema.ts, convex/* (todas las mutations/queries)",
    forbidden: "src/App.tsx, src/Navigation.tsx",
    done: "convex/_generated/ existe, tipos generados, dev server arranca sin errores de import"
  },
  {
    title: "Fix: Optimizar performance general del sitio",
    status: "Backlog",
    type: "Infra",
    priority: "High",
    domain: "Infra",
    order: 81,
    description: "Lazy loading de todas las vistas (ya implementado), code splitting, reducir bundle size, optimizar imágenes, implementar caching de queries Convex, eliminar renders innecesarios con React.memo.",
    files: "src/App.tsx, src/components/PostCard.tsx, convex/* (queries con pagination)",
    forbidden: "server.ts",
    done: "Lighthouse score > 80, bundle size < 500KB, queries paginadas, memo en componentes pesados"
  },
  {
    title: "Fix: Resolver vulnerabilidades npm audit restantes",
    status: "Backlog",
    type: "Infra",
    priority: "High",
    domain: "Infra",
    order: 82,
    description: "4 vulnerabilidades high en vite-plugin-pwa → serialize-javascript. Requiere actualizar vite-plugin-pwa o usar npm audit fix --force (breaking change). Evaluar impacto antes de actualizar.",
    files: "package.json, vite.config.ts",
    forbidden: "src/*",
    done: "npm audit muestra 0 vulnerabilidades, build funciona, PWA sigue funcionando"
  },
  {
    title: "Feature: Tests end-to-end de flujos críticos",
    status: "Backlog",
    type: "Infra",
    priority: "High",
    domain: "Testing",
    order: 83,
    description: "Crear tests E2E con Vitest/Playwright para: login, registro, crear post, unirse a comunidad, proceso de pago con MercadoPago. Verificar que los flujos críticos no se rompan.",
    files: "tests/*.test.ts, tests/*.spec.ts",
    forbidden: "src/* (solo tests)",
    done: "Tests de login, registro, post, comunidad, pago pasan. Coverage > 70% en flujos críticos."
  },
  {
    title: "Feature: Preparar launch — SEO, meta tags, analytics",
    status: "Backlog",
    type: "Feature",
    priority: "Medium",
    domain: "Launch",
    order: 84,
    description: "SEO completo: meta tags por página, Open Graph para compartir en redes, sitemap.xml, robots.txt, Google Analytics, favicon, manifest.json para PWA.",
    files: "index.html, vite.config.ts, public/manifest.json, public/robots.txt",
    forbidden: "src/App.tsx",
    done: "Meta tags en todas las páginas, OG tags funcionan, sitemap generado, analytics configurado"
  },

  // ═══════════════════════════════════════════════════════
  // SECTOR 9: GAMIFICATION
  // ═══════════════════════════════════════════════════════
  {
    title: "Feature: Sistema de puntos XP por publicaciones y actividad",
    status: "Backlog",
    type: "Feature",
    priority: "Medium",
    domain: "Gamification",
    order: 90,
    description: "Los usuarios ganan XP por: publicar (+10), comentar (+5), recibir like (+2), unirse a comunidad (+20), completar curso (+50). Mostrar nivel y barra de progreso en el perfil.",
    files: "convex/profiles.ts, src/views/PerfilView.tsx, convex/gamification.ts",
    forbidden: "src/App.tsx",
    done: "XP se otorga automáticamente, nivel visible en perfil, barra de progreso, leaderboard actualizado"
  },
  {
    title: "Feature: Premios — redención de tokens por recompensas",
    status: "Backlog",
    type: "Feature",
    priority: "Medium",
    domain: "Gamification",
    order: 91,
    description: "Los usuarios pueden redimir tokens/puntos por: acceso gratuito a comunidades, descuentos en suscripciones, badges exclusivos, mentorías gratis. Catálogo de premios visible en sección 'Premios'.",
    files: "src/views/PremiosView.tsx, convex/gamification.ts, convex/payments.ts",
    forbidden: "src/App.tsx",
    done: "Catálogo de premios visible, usuario puede redimir, descuento aplicado, tokens restados"
  },

  // ═══════════════════════════════════════════════════════
  // SECTOR 10: UI/UX
  // ═══════════════════════════════════════════════════════
  {
    title: "Fix: Consolidar controles bottom a UN solo botón de menú flotante",
    status: "Backlog",
    type: "Feature",
    priority: "High",
    domain: "UI",
    order: 100,
    description: "Eliminar múltiples botones flotantes y consolidar en un solo botón de menú en la parte inferior. Al hacer click, mostrar opciones: perfil, configuración, cerrar sesión, tema claro/oscuro.",
    files: "src/Navigation.tsx, src/components/BottomMenu.tsx",
    forbidden: "src/App.tsx",
    done: "Un solo botón flotante, menú desplegable con todas las opciones, animación suave"
  },
  {
    title: "Fix: Global Styling — icons, avatars, light/dark modes, Negocios cards",
    status: "Backlog",
    type: "Feature",
    priority: "Medium",
    domain: "UI",
    order: 101,
    description: "Revisar consistencia visual: icons en toda la app, avatars de negocios, modos claro/oscuro, cards de Negocios. Asegurar que el diseño premium se mantenga en todas las vistas.",
    files: "src/index.css, src/components/, src/views/",
    forbidden: "src/App.tsx",
    done: "Icons consistentes, avatars muestran correctamente, light/dark mode funciona, cards de Negocios estilizadas"
  },
  {
    title: "Fix: Mover Mi Comunidad/Observatory al Creator Admin Panel",
    status: "Backlog",
    type: "Feature",
    priority: "Medium",
    domain: "UI",
    order: 102,
    description: "Las secciones 'Mi Comunidad' y 'Observatory' deben moverse dentro del panel de administración del creador, no en la navegación principal. Solo los creadores ven estas opciones.",
    files: "src/Navigation.tsx, src/views/CreatorDashboard.tsx",
    forbidden: "src/App.tsx",
    done: "Mi Comunidad y Observatory solo visibles en Creator Admin Panel, no en nav principal"
  },
  {
    title: "Fix: Señales & Trading — dynamic background, neon loaders, VIP style",
    status: "Backlog",
    type: "Feature",
    priority: "Medium",
    domain: "UI",
    order: 103,
    description: "Mejorar la sección de Señales & Trading con fondo dinámico, loaders con efecto neón, estilo VIP para contenido premium. Mantener consistencia con el diseño premium de la app.",
    files: "src/views/SeñalesView.tsx, src/components/ElectricLoader.tsx",
    forbidden: "src/App.tsx, src/Navigation.tsx",
    done: "Fondo dinámico en señales, loaders neón, estilo VIP visible, consistencia con diseño premium"
  },
  {
    title: "Fix: Noticias — estilo newspaper y calendario económico",
    status: "Backlog",
    type: "Feature",
    priority: "Medium",
    domain: "UI",
    order: 104,
    description: "Rediseñar la sección de Noticias con estilo newspaper/periódico. Agregar calendario económico integrado. Noticias con categorías, fecha, fuente.",
    files: "src/views/NoticiasView.tsx, src/components/NewsCard.tsx",
    forbidden: "src/App.tsx",
    done: "Noticias estilo newspaper, calendario económico visible, categorías y fuentes mostradas"
  },
  {
    title: "Fix: Renombrar Marketplace a Negocios, mover Publicidad dentro",
    status: "Backlog",
    type: "Feature",
    priority: "Medium",
    domain: "UI",
    order: 105,
    description: "Cambiar nombre 'Marketplace' a 'Negocios' en toda la app. Mover la sección de Publicidad dentro de Negocios. Actualizar navegación y referencias.",
    files: "src/Navigation.tsx, src/views/NegociosView.tsx",
    forbidden: "src/App.tsx",
    done: "'Marketplace' renombrado a 'Negocios', Publicidad dentro de Negocios, navegación actualizada"
  },
  {
    title: "Fix: Reconfigurar secciones del menú superior",
    status: "Backlog",
    type: "Feature",
    priority: "Medium",
    domain: "UI",
    order: 106,
    description: "Reorganizar las secciones del menú superior: eliminar secciones innecesarias, mover secciones a donde corresponden. Asegurar que la navegación sea intuitiva.",
    files: "src/Navigation.tsx",
    forbidden: "src/App.tsx",
    done: "Menú superior reorganizado, secciones correctas, navegación intuitiva"
  },
  {
    title: "Fix: Ocultar Pricing del nav, renombrar a Suscripciones, integrar",
    status: "Backlog",
    type: "Feature",
    priority: "Medium",
    domain: "UI",
    order: 107,
    description: "Ocultar 'Pricing' de la navegación principal. Renombrar a 'Suscripciones'. Integrar como sección accesible desde perfiles de creadores y comunidades, no desde el menú principal.",
    files: "src/Navigation.tsx, src/views/PricingView.tsx",
    forbidden: "src/App.tsx",
    done: "Pricing oculto del nav, renombrado a Suscripciones, accesible desde perfiles y comunidades"
  },
  {
    title: "Fix: Eliminar iconos flotantes de AI en Navigation.tsx",
    status: "Backlog",
    type: "Feature",
    priority: "Low",
    domain: "UI",
    order: 108,
    description: "Eliminar los iconos flotantes de AI que aparecen en Navigation.tsx. Limpiar la interfaz de elementos innecesarios.",
    files: "src/Navigation.tsx",
    forbidden: "src/App.tsx",
    done: "Sin iconos flotantes de AI, navegación limpia"
  },
  {
    title: "Fix: AdminView full-width, eliminar floating AI, mostrar stats",
    status: "Backlog",
    type: "Feature",
    priority: "Low",
    domain: "UI",
    order: 109,
    description: "AdminView debe ocupar todo el ancho, eliminar cualquier elemento flotante de AI, mostrar estadísticas claras del sistema.",
    files: "src/views/AdminView.tsx",
    forbidden: "src/App.tsx, src/Navigation.tsx",
    done: "AdminView full-width, sin AI flotante, stats visibles"
  },

  // ═══════════════════════════════════════════════════════
  // SECTOR 11: REALTIME & WEBSOCKETS
  // ═══════════════════════════════════════════════════════
  {
    title: "Feature: Realtime señales — actualizaciones en tiempo real",
    status: "Backlog",
    type: "Feature",
    priority: "Critical",
    domain: "Realtime",
    order: 110,
    description: "Las señales de trading deben actualizarse en tiempo real sin recargar la página. Usar WebSocket o Convex subscriptions. Cuando una señal se actualiza (TP hit, SL hit, nueva señal), todos los suscriptores ven el cambio instantáneamente.",
    files: "server.ts (WebSocket), src/views/SeñalesView.tsx, convex/signals.ts",
    forbidden: "src/App.tsx",
    done: "Señales se actualizan en tiempo real, WebSocket conectado, sin recarga de página"
  },
  {
    title: "Feature: WebSockets base — infraestructura de realtime",
    status: "Backlog",
    type: "Infra",
    priority: "High",
    domain: "Realtime",
    order: 111,
    description: "Configurar la infraestructura base de WebSockets en server.ts: conexión, autenticación de tokens, heartbeat, reconexión automática, manejo de múltiples clientes. Base para chat, señales realtime, notificaciones.",
    files: "server.ts (WebSocket setup), src/services/websocket.ts",
    forbidden: "src/App.tsx",
    done: "WebSocket conecta, auth funciona, heartbeat activo, reconexión automática, múltiples clientes soportados"
  },

  // ═══════════════════════════════════════════════════════
  // SECTOR 12: NOTIFICACIONES
  // ═══════════════════════════════════════════════════════
  {
    title: "Feature: Sistema de notificaciones push y en-app",
    status: "Backlog",
    type: "Feature",
    priority: "Medium",
    domain: "Notifications",
    order: 120,
    description: "Sistema de notificaciones: nuevas señales, comentarios en posts, likes, nuevos seguidores, pagos recibidos. Notificaciones en-app (campana) y push del navegador. Configurar VAPID keys para push notifications.",
    files: "src/components/NotificationBell.tsx, convex/notifications.ts, server.ts (push)",
    forbidden: "src/App.tsx",
    done: "Notificaciones en-app funcionan, push notifications configuradas, usuario puede silenciar"
  },

  // ═══════════════════════════════════════════════════════
  // SECTOR 13: COORDINACIÓN DE AGENTES
  // ═══════════════════════════════════════════════════════
  {
    title: "Feature: Crear skills de conocimiento compartido para agentes",
    status: "Backlog",
    type: "Infra",
    priority: "Medium",
    domain: "Coordination",
    order: 130,
    description: "Crear skills reutilizables en .agent/skills/technical/ para: patrones de auth, integración MercadoPago, creación de comunidades, sistema de permisos, optimizaciones de performance, patrones de UI. Documentar soluciones para que cualquier agente pueda reutilizar.",
    files: ".agent/skills/technical/*, .agent/workspace/coordination/KNOWLEDGE_BASE.md",
    forbidden: "src/*",
    done: "Skills creados en .agent/skills/technical/, knowledge base actualizada, patrones documentados"
  },
  {
    title: "Feature: Configurar delegación de sub-agentes (2 por agente)",
    status: "Backlog",
    type: "Infra",
    priority: "Medium",
    domain: "Coordination",
    order: 131,
    description: "Cada agente puede delegar a 2 sub-agentes por tarea compleja. Configurar el sistema de delegación en AGENT_HIVE.md. Registrar delegaciones, seguimiento de progreso, integración de resultados.",
    files: ".agent/workspace/coordination/AGENT_HIVE.md, AGENTS.md",
    forbidden: "src/*",
    done: "Sistema de delegación documentado, formato de delegación claro, agentes pueden delegar 2 sub-tareas"
  },
];

async function createTask(task) {
  const body = {
    parent: { database_id: NOTION_DATABASE_ID },
    properties: {
      Name: { title: [{ text: { content: task.title } }] },
      Status: { select: { name: task.status } },
      Type: { select: { name: task.type } },
      Priority: { select: { name: task.priority } },
      Domain: { rich_text: [{ text: { content: task.domain } }] },
      "Execution Order": { number: task.order },
      "Auto Generated": { checkbox: true },
      "Tech Notes": { rich_text: [{ text: { content: `📝 DESCRIPCIÓN:\n${task.description}\n\n📂 ARCHIVOS A EDITAR:\n${task.files}\n\n🚫 ARCHIVOS PROHIBIDOS:\n${task.forbidden}\n\n✅ DEFINICIÓN DE DONE:\n${task.done}` } }] },
    }
  };

  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to create "${task.title}": ${err}`);
  }

  return await response.json();
}

async function main() {
  console.log('📋 Agregando tareas limpias y detalladas a Notion...\n');
  console.log(`Database: ${NOTION_DATABASE_ID}`);
  console.log(`Total tareas: ${tasks.length}\n`);

  // Show summary by sector
  const sectors = {};
  tasks.forEach(t => {
    if (!sectors[t.domain]) sectors[t.domain] = [];
    sectors[t.domain].push(t);
  });

  console.log('📊 Resumen por sector:');
  for (const [domain, domainTasks] of Object.entries(sectors)) {
    const critical = domainTasks.filter(t => t.priority === 'Critical').length;
    const high = domainTasks.filter(t => t.priority === 'High').length;
    console.log(`  ${domain}: ${domainTasks.length} tareas (${critical} críticas, ${high} altas)`);
  }

  console.log('\n⏳ Agregando tareas a Notion...\n');

  let created = 0;
  let errors = 0;

  for (const task of tasks) {
    try {
      await createTask(task);
      created++;
      process.stdout.write(`\r  ✅ Progreso: ${created}/${tasks.length}`);
    } catch (err) {
      errors++;
      console.error(`\n  ❌ Error creando "${task.title}": ${err.message}`);
    }
  }

  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  ✅ Tareas limpias agregadas a Notion                ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`\n  📊 Resumen:`);
  console.log(`     - Creadas: ${created}`);
  console.log(`     - Errores: ${errors}`);
  console.log(`     - Total: ${tasks.length}`);
  console.log('\n  Cada tarea incluye:');
  console.log('     ✓ Título claro y descriptivo');
  console.log('     ✓ Descripción detallada de qué hacer');
  console.log('     ✓ Archivos específicos a editar');
  console.log('     ✓ Archivos prohibidos');
  console.log('     ✓ Definición de Done clara');
  console.log('\n  Todas las tareas están en estado "Backlog" listas para trabajar.\n');
}

main().catch(err => {
  console.error('❌ Error fatal:', err.message);
  process.exit(1);
});
