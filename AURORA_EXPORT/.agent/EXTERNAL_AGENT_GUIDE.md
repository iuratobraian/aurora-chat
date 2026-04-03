# Guía para Agente Externo - TradeShare Platform

## Información del Proyecto
- **Nombre**: TradeShare - Plataforma de Trading Social
- **Frontend**: React 19 + TypeScript + Vite 6 + TailwindCSS 4
- **Backend**: Convex (base de datos + serverless functions)
- **Deploy**: Vercel
- **URL Producción**: https://tradeportal-2025-platinum.vercel.app
- **Repo Git**: https://github.com/iuratobraian/trade-share.git

## Estructura de Carpetas
```
tradeportal-2025-platinum/
├── views/              # Páginas principales (Admin, Dashboard, Market, etc.)
├── components/         # Componentes reutilizables (Chat, Posts, Stats, etc.)
├── services/           # Servicios (storage.ts, websocket.ts)
├── hooks/              # Custom hooks (useAuth, usePosts, etc.)
├── context/            # Contextos de React (AuthContext, ChatContext)
├── convex/             # Backend (schema.ts, queries, mutations)
│   ├── schema.ts       # Definición de tablas
│   ├── posts.ts        # Queries/mutations de posts
│   ├── users.ts        # Queries/mutations de usuarios
│   ├── chat.ts         # Queries/mutations de chat
│   └── _generated/     # Tipos auto-generados
├── lib/                # Utilidades (exness.ts, notifications.ts)
├── types.ts            # Tipos TypeScript globales
├── constants.ts        # Constantes de la app
├── data/               # Datos estáticos
├── public/             # Archivos públicos
├── server.ts           # Servidor Express (WebSocket, API routes)
└── index.tsx           # Entry point de React
```

## Sistema de Diseño (OBLIGATORIO)

### Paleta de Colores
```css
/* Tailwind config usa CSS variables */
--primary: #3b82f6;           /* Azul principal */
--signal-green: #10b981;      /* Verde para ganancias */
--alert-red: #ef4444;         /* Rojo para pérdidas/alertas */
--bg-dark: #050608;           /* Fondo principal oscuro */
--glass-bg: rgba(255,255,255,0.05);
--glass-border: rgba(255,255,255,0.1);
```

### Clases de Estilo Comunes
```tsx
// Card Glass (usar constantemente)
<div className="glass rounded-2xl p-6 border border-white/10 bg-white/5 backdrop-blur-xl">

// Botón Primario
<button className="bg-primary hover:bg-blue-600 text-white rounded-xl font-bold px-6 py-3 shadow-lg shadow-primary/20 transition-all hover:scale-105">

// Stat Card
<div className="glass rounded-xl p-5 border border-white/10">
  <span className="text-3xl font-black">{value}</span>
  <span className="text-xs text-gray-400 uppercase">{label}</span>
</div>

// Input Glass
<input className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none">
```

### Recursos
- **Skill Visual**: `.agent/skills/guia_visual.md` - Guía completa del sistema de diseño
- **Skill Arquitectura**: `.agent/skills/arquitectura.md` - Detalles de GitHub -> Vercel -> Convex

## Workflow de Desarrollo

### 1. Setup Inicial
```bash
# Clonar repo
git clone https://github.com/iuratobraian/trade-share.git
cd trade-share

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con las credenciales necesarias
```

### 2. Desarrollo Local
```bash
# Terminal 1: Backend Convex (requerido para datos)
npx convex dev

# Terminal 2: Frontend
npm run dev

# Abrir http://localhost:5173
```

### 3. Verificación
```bash
# TypeScript check
npm run lint

# Build de producción
npm run build
```

### 4. Deploy
```bash
# Deploy a Vercel (automatico via GitHub push)
git add . && git commit -m "descripcion" && git push

# Deploy manual
npx vercel --prod
```

## Tareas Frecuentes

### Crear nueva vista:
1. Crear archivo en `views/NuevaVista.tsx`
2. Usar懒加载: `const NuevaVista = lazy(() => import('./views/NuevaVista'))`
3. Agregar a App.tsx con Suspense
4. Implementar glass morphism y sistema de diseño
5. Tipar props con TypeScript

### Crear componente:
1. Crear en `components/NuevoComponente.tsx`
2. Usar glass morphism (clases de arriba)
3. Props tipadas con TypeScript interface
4. Documentar props con JSDoc

### Modificar Convex:
1. Editar `convex/schema.ts` si cambia estructura de datos
2. Editar/crear archivos en `convex/` para queries/mutations
3. Regenerar tipos: `npx convex codegen`
4. Usar hooks: `useQuery(api.modulo.function)` y `useMutation(api.modulo.mutation)`

### Conectar API Externa (Exness):
1. Revisar `lib/exness.ts` para endpoints existentes
2. Usar axios para requests HTTP
3. Almacenar API keys en variables de entorno (.env.local)
4. Nunca hardcodear credenciales

## Reglas Importantes

### SIEMPRE:
- Usar glass morphism para mantener consistencia visual
- Tipar todo con TypeScript
- Validar inputs tanto en frontend como backend
- Usar variables de entorno para URLs y secrets
- Verificar que `npm run lint` pase sin errores

### NUNCA:
- Hardcodear URLs de Convex o APIs
- Commitir secrets o API keys (usar .env.local)
- Usar colores fuera de la paleta definida
- Saltarse el lint check antes de commit

## Prioridades Actuales (del TAREAS.md)

### Alta Prioridad:
- [ ] **Exness API Sync (Fase 2)**: Conexión Real con Non-Trading API para Balance y Margen en tiempo real
- [ ] **Terminal de Trading**: Integrar Exness Web Terminal con todos los pares
- [ ] **Visibilidad Botón IA**: Destacar "Generar Publicación IA" en Admin

### Media Prioridad:
- [ ] **Optimización Feed**: Implementar Lazy Loading de 5 en 5
- [ ] **Chat Moderation**: Filtro de palabras prohibidas y reportes
- [ ] **Notificaciones Push**: Browser notifications para @menciones
- [ ] **Corrección Agente IA**: Solucionar error "BTC en $N/A"

### Completadas:
- [x] Restauración UI "Top" con Zonas Operativas, Chat Global, Cargador
- [x] Recuperación de Datos: Conexión a base de datos `rapid-rabbit-951`
- [x] Estándar Visual Premium con Skill `guia_visual`
- [x] Skill de Arquitectura (GitHub -> Vercel -> Convex)
- [x] Optimización del Código
- [x] GitHub Update & Deploy

## Contactos y Recursos

### URLs Importantes:
- **Producción**: https://tradeportal-2025-platinum.vercel.app
- **Repo Git**: https://github.com/iuratobraian/trade-share.git
- **Dashboard Convex**: https://dashboard.convex.dev (proyecto rapid-rabbit-951)

### Documentación Externa:
- [Plan Integración Exness](EXNESS_INTEGRATION_PLAN.md)
- [Guía de Migración](MIGRACION.md)

## Metricas de Exito

Para considerar una tarea completada:
- [ ] Build sin errores (`npm run build` pasa)
- [ ] TypeScript sin errores (`npm run lint` pasa)
- [ ] Zero console errors en producción
- [ ] Responsive en mobile (375px+)
- [ ] Lighthouse score > 80

## Notas para Retomar Sesion

Si la sesión se corta, retomar desde:
1. Revisar TAREAS.md para estado actual
2. Verificar conexión a Convex: `npx convex data`
3. Ejecutar `npm run lint` para detectar errores acumulados
4. Revisar deploy.log si hay problemas de deployment
