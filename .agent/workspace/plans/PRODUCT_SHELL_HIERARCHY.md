# Product Shell & Navigation Hierarchy

## Objetivo

Organizar el shell del producto y la jerarquía de navegación para que el ecosistema se entienda en minutos.

## Estructura Actual

### Navegación Principal (5 áreas)

| Área | Descripción | Items |
|------|-------------|-------|
| **Explorar** | Feed y descubrimiento | Feed Principal, Descubrir, Ranking |
| **Academia** | Aprendizaje | Cursos, Biblioteca, Psicotrading |
| **Trading** | Herramientas de trading | Gráfico, Señales, EAs, Bitácora, Prop Firms, Broker |
| **Marketplace** | Monetización | Estrategias, Creator Studio, Afiliados |
| **Más** | Cuenta y admin | Mi Comunidad, Dashboard, Precios, Legal, Publicidad |

### Problemas Identificados

1. **Categorización confusa**: Trading y Marketplace tienen overlap
2. **Items duplicados**: Creator Studio aparece en Marketplace y en "Más"
3. **Jerarquía plana**: Todo está al mismo nivel de importancia
4. **Admin visible**: "Mi Comunidad" y "Dashboard" son para creadores/admins
5. **Onboarding faltante**: No hay flujo claro para nuevos usuarios

## Propuesta: Navegación Simplificada

### Nueva Estructura (4 áreas core)

| Área | Icono | Descripción | Acceso |
|------|-------|-------------|--------|
| **Inicio** | home | Dashboard personalizado + feed | Todos |
| **Comunidad** | groups | Feed + comunidades + ranking | Todos |
| **Aprende** | school | Academia + cursos + estrategias | Todos |
| **Herramientas** | build | Trading tools + marketplace | Usuarios activos |

### Navegación Detallada

```
├── Inicio (Dashboard)
│   ├── Morning Briefing IA
│   ├── Mi Progreso (XP, streak)
│   ├── Siguiente Mejor Acción
│   └── Actividad Reciente
│
├── Comunidad
│   ├── Feed Principal
│   ├── Mis Comunidades
│   ├── Descubrir Comunidades
│   └── Ranking Traders
│
├── Aprende
│   ├── Cursos
│   ├── Estrategias
│   ├── Psicotrading
│   └── Biblioteca
│
└── Herramientas
    ├── Gráfico
    ├── Señales (Pro)
    ├── Marketplace
    ├── Bitácora
    ├── Prop Firms
    └── EAs & Robots
```

### Menú de Usuario (Perfil)

```
├── Mi Perfil
├── Configuración
├── Mis Comunidades (si es admin)
├── Creator Dashboard (si es creator)
├── Planes y Precios
└── Cerrar Sesión
```

## Superficies del Producto

| Superficie | Propósito | Prioridad | Estado |
|------------|-----------|-----------|--------|
| `feed` | Engagement diario | 🔴 Alta | ✅ |
| `discover` | Descubrir contenido | 🔴 Alta | ✅ |
| `notifications` | Alertas importantes | 🔴 Alta | ✅ |
| `search` | Encontrar contenido | 🔴 Alta | ✅ |
| `signals` | Trading signals | 🟡 Media | ⚠️ |
| `comments` | Conversación | 🟡 Media | ✅ |
| `academia` | Aprendizaje | 🟡 Media | ✅ |
| `profile` | Perfil usuario | 🟡 Media | ✅ |

## Flujo de Usuario

### Nuevo Usuario
```
1. Landing → Onboarding
2. Configurar perfil
3. Explorar comunidades
4. Primer post
5. Unirse a comunidad
6. → Dashboard
```

### Usuario Activo
```
1. Dashboard (morning briefing)
2. Feed comunidad
3. Trading tools
4. Creator/contribuir (opcional)
```

### Creator
```
1. Dashboard (métricas)
2. Feed (engagement)
3. Creator Studio
4. Comunidades (moderar)
```

## Acciones Recomendadas

1. **Reducir navegación a 4 áreas core**
2. **Ocultar secciones de admin/creator** a menos que aplique
3. **Priorizar Dashboard** como página principal
4. **Simplificar menú de usuario**
5. **Crear empty states** para cada superficie

## Métricas de Éxito

- Tiempo hasta primera acción: < 30 segundos
- Navegación sin perdida: > 80%
- Engagement con Dashboard: > 50% usuarios activos
