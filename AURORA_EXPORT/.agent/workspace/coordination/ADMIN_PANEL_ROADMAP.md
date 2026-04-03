# Plan de Mejoras del Panel de Administración

## Estado Actual
- ✅ Nuevo diseño full-width con tabs (Stitch)
- ✅ Selector Nuevo/Clásico con persistencia
- ✅ Navegación por URL (?tab=)
- ❌ Sidebar del diseño anterior visible
- ⚠️ Varios errores de consola

---

## Fase 1: Corrección de Fallas Críticas

### 1.1 Ocultar sidebar en modo nuevo
- [ ] El sidebar lateral del diseño clásico se muestra encima del nuevo diseño
- [ ] Only show sidebar when `dashboardMode === 'old'`

### 1.2 URLs del FloatingActionButton
- [ ] Los botones del FAB no navegan correctamente
- [ ] Fix: `window.dispatchEvent(new CustomEvent('navigate', { detail: 'admin-panel?tab=communities' }))`

### 1.3 Errores de consola CSP
- [ ] Arreglar `wss://ws*.pusher.com` - CSP no acepta wildcards
- [ ] Fix: Usar dominios específicos o eliminar

### 1.4 Errores de chunks 404
- [ ] Algunos módulos dinámicos fallan en producción
- [ ] Revisar lazy imports y ensure proper build

---

## Fase 2: Mejoras del Diseño Nuevo

### 2.1 Integración de componentes reales
- [ ] Reemplazar datos mock con datos de Convex
- [ ] Conectar con API existente (users, posts, communities, ads, etc.)
- [ ] Agregar loading states y skeleton loaders

### 2.2 Secciones por desarrollar
- [ ] **Users** - Gestión completa de usuarios
- [ ] **Communities** - CRUD de comunidades
- [ ] **Posts/Contenido** - Moderación de posts
- [ ] **Ads** - Gestión de publicidad
- [ ] **Prop Firms** - Administración de cuentas financiadas
- [ ] **Referrals** - Programa de referidos
- [ ] **AI Agent** - Configuración del agente IA
- [ ] **Marketing** - Herramientas de marketing
- [ ] **Moderation** - Panel de moderación
- [ ] **Bitácora** - Verificaciones KYC
- [ ] **WhatsApp** - Notificaciones
- [ ] **Config** - Ajustes generales
- [ ] **Backup** - Sistema de backup
- [ ] **Export** - Exportar datos

### 2.3 Mejoras UI/UX
- [ ] Agregar búsqueda global
- [ ] Agregar filtros por categoría
- [ ] Agregar paginación
- [ ] Agregar acciones batch (seleccionar múltiple)
- [ ] Agregar tooltips y help text
- [ ] Agregar keyboard shortcuts

---

## Fase 3: Funcionalidades Avanzadas

### 3.1 Dashboard Analytics
- [ ] Gráficos de crecimiento de usuarios
- [ ] Gráficos de actividad
- [ ] Métricas en tiempo real
- [ ] Exportar reports

### 3.2 Sistema de Logs
- [ ] Historial de acciones admin
- [ ] Logs de moderación
- [ ] Auditoría de cambios

### 3.3 Automatización
- [ ] Programar tareas (cron jobs)
- [ ] Alertas automáticas
- [ ] Reports automáticos por email

### 3.4 Seguridad
- [ ] 2FA para admin
- [ ] Session management
- [ ] IP allowlist
- [ ] Rate limiting

---

## Fase 4: Integración con Stitch

### 4.1 Diseños por sección (Stitch)
- [ ] User Management - Completo
- [ ] Communities Management - Diseñar
- [ ] Posts/Signals Management - Diseñar
- [ ] Ads Management - Diseñar
- [ ] Prop Firms - Diseñar
- [ ] Analytics Dashboard - Diseñar
- [ ] Settings Panel - Diseñar
- [ ] Moderation Panel - Diseñar

### 4.2 Design System
- [ ] Crear componentes reutilizables
- [ ] Buttons, Cards, Tables, Forms
- [ ] Dark/Light theme toggle
- [ ] Responsive design

---

## Prioridades

### Alta (Semana 1)
1. Ocultar sidebar en modo nuevo
2. Fix navegación URLs
3. Conectar datos reales al nuevo dashboard
4. Agregar loading states

### Media (Semana 2-3)
1. Desarrollar secciones faltantes
2. Agregar búsqueda y filtros
3. Diseñar secciones críticas con Stitch
4. Agregar logs de auditoría

### Baja (Semana 4+)
1. Gráficos analytics
2. Automatización
3. 2FA y seguridad avanzada
4. Reports automáticos

---

## Archivos a Modificar

```
src/views/AdminView.tsx
src/components/admin/AdminPanelDashboard.tsx
src/components/admin/*.tsx (múltiples)
convex/admin.ts
convex/schema.ts
```

---

## Testing Checklist

- [ ] Navegación entre todas las secciones
- [ ] Selector Nuevo/Clásico funciona
- [ ] URLs con ?tab= funcionan
- [ ] No hay errores de consola
- [ ] Datos se cargan correctamente
- [ ] Responsive en móvil/tablet
- [ ] Performance aceptable

---

## Notas

- Usar Google Stitch para diseños de UI
- Mantener consistencia con TradeShare design system
- Priorizar UX sobre features
- Testing en producción antes de announce
