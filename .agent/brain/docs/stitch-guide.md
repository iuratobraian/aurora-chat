# Stitch UI Designer - Guía para Agentes

## Concepto

**Stitch** es una plataforma de Google que permite diseñar interfaces con IA. Los diseños se generan como HTML/CSS y pueden convertirse en componentes funcionales.

## Por Qué Stitch

```
┌─────────────────────────────────────────────────────────┐
│  TRADESHARE DESIGN WORKFLOW CON STITCH                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   Descripción ──→ Stitch AI ──→ Preview ──→ Código      │
│                      ↓                                  │
│                 HTML/CSS ──→ React/TS ──→ Componente   │
│                                                         │
│   Beneﬁcios:                                            │
│   • Diseños consistentes con el sistema de diseño       │
│   • Iteración rápida con preview local                   │
│   • Conversión directa a código                         │
│   • Reutilización de patrones de diseño                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Sistema de Diseño TradeShare

### Colores
```css
--color-primary: #3b82f6      /* Azul principal */
--color-signal-green: #10b981 /* Verde señales */
--color-dark: #0f1115         /* Fondo oscuro */
--color-card: #1a1a2e         /* Tarjetas */
--color-accent: purple        /* Gradiente púrpura */
```

### Componentes Estándar
- **Cards**: `glass rounded-2xl border border-white/10 backdrop-blur-xl`
- **Botones**: Gradientes con sombras, `rounded-xl font-bold`
- **Inputs**: `bg-white/5 border border-white/10 rounded-xl`
- **Badges**: `px-2 py-0.5 rounded-full text-xs font-bold`

### Tipografía
- **Headlines**: Inter Black, uppercase, tracking-tight
- **Body**: Inter Regular
- **Mono**: JetBrains Mono (precios, datos)

## Comandos de Stitch

### Flujo Local Persistente de Este Repo
```powershell
# Guardar la API key localmente en un archivo ignorado por git
.\scripts\stitch.ps1 configure <api-key>

# Verificar si Stitch ya quedó listo
.\scripts\stitch.ps1 status

# Levantar proxy MCP
.\scripts\stitch.ps1 proxy

# Listar proyectos
.\scripts\stitch.ps1 projects

# Listar pantallas de un proyecto
.\scripts\stitch.ps1 screens 2984742732221673460

# Cargar el brief recomendado para Aurora
.\scripts\stitch.ps1 aurora-chat
```

Notas:
- La configuración local queda en `.agent/local/stitch.env.ps1`.
- Ese archivo está ignorado por git y no debe versionarse.
- El brief específico de Aurora vive en `.agent/aurora/app/AURORA_CHAT_STITCH_BRIEF.md`.

### CLI Principal
```bash
# Inicializar (primera vez)
npx @_davideast/stitch-mcp init

# Ver proyectos disponibles
npx @_davideast/stitch-mcp view --projects

# Previsualizar proyecto localmente
npx @_davideast/stitch-mcp serve -p <project-id>

# Construir sitio Astro desde diseños
npx @_davideast/stitch-mcp site -p <project-id>

# Diagnosticar problemas
npx @_davideast/stitch-mcp doctor

# Listar herramientas disponibles
npx @_davideast/stitch-mcp tool
```

### Herramientas MCP

| Herramienta | Descripción | Uso |
|------------|-------------|-----|
| `list_projects` | Lista proyectos de Stitch | `npx @_davideast/stitch-mcp tool list_projects` |
| `list_screens` | Lista pantallas de un proyecto | `npx @_davideast/stitch-mcp tool list_screens -p <id>` |
| `get_screen_code` | Obtiene HTML/CSS | Para extraer código del diseño |
| `get_screen_image` | Obtiene screenshot | Para verificar diseño |
| `build_site` | Construye sitio completo | Mapea pantallas a rutas |

## Flujo de Trabajo por Rol

### 1. Agente Coder → Invocar Diseñador

```javascript
// Cuando necesitas UI para un componente:
// 1. Detecta que no existe el componente
// 2. Invoca al diseñador con descripción

const componentDescription = `
  Componente: TradingCard
  - Avatar circular del trader
  - Nombre y username
  - Contenido del post (texto)
  - Métricas: likes, comentarios, shares
  - Botón de token points
  - Timestamp relativo
  - Estilo: glass morphism, dark mode
`;

await invokeDesigner(componentDescription);
```

### 2. Agente Designer → Generar Diseño

```bash
# Ejecutar en terminal o via MCP
npx @_davideast/stitch-mcp view --projects
# Seleccionar proyecto o crear nuevo

# Generar descripción para Stitch:
"Modern dark trading card with glass morphism effect,
avatar, username, post content, engagement metrics,
and token reward button. Use purple gradient accents."

# Stitch genera el diseño
# Descargar HTML/CSS resultante
```

### 3. Designer → Coder (Handoff)

```
┌─────────────────────────────────────────────┐
│  HANDOFF: Designer → Coder                  │
├─────────────────────────────────────────────┤
│                                             │
│  DISEÑO: PostCard                          │
│  ─────────────────────────────────────────  │
│                                             │
│  HTML/CSS Generado:                         │
│  <div class="glass-card">                   │
│    <img class="avatar" src="..." />         │
│    <div class="content">...</div>            │
│    <div class="metrics">...</div>           │
│  </div>                                     │
│                                             │
│  STYLE:                                     │
│  .glass-card {                              │
│    background: rgba(26,26,46,0.8);          │
│    backdrop-filter: blur(12px);             │
│    border: 1px solid rgba(255,255,255,0.1);│
│    border-radius: 16px;                    │
│  }                                          │
│                                             │
│  CONVERSIÓN: Convertir a React + Tailwind   │
│  → Componente PostCard.tsx                  │
│                                             │
└─────────────────────────────────────────────┘
```

### 4. Coder → Tester (Verificación)

```
┌─────────────────────────────────────────────┐
│  VERIFICACIÓN: Implementación vs Diseño     │
├─────────────────────────────────────────────┤
│                                             │
│  CHECKLIST:                                 │
│  □ Colores correctos (usar vars de diseño) │
│  □ Tipografía consistente                   │
│  □ Spacing adecuado                         │
│  □ Estados hover/active                     │
│  □ Responsive                               │
│  □ Accesibilidad (contrast, focus)          │
│                                             │
│  SI NO MATCH: Regresar a Designer           │
│  con /stitch para ajustar                  │
│                                             │
└─────────────────────────────────────────────┘
```

## Patrones de Invocación

### Para Todos los Agentes

```javascript
// Patrón 1: Invocación directa
// "Necesito diseñar un componente de..."
await invokeStitch({
  type: "component",
  description: "Trading signal card with entry/exit prices",
  context: { project: "tradeshare", theme: "dark" }
});

// Patrón 2: A través de evento
window.dispatchEvent(new CustomEvent("stitch-design", {
  detail: { description: "...", callback: (html) => {} }
}));

// Patrón 3: En swarm workflow
await swarm.invoke("designer", {
  action: "generate_ui",
  spec: "signal_card_spec"
});
```

### Keywords de Auto-Activación

| Keyword | Significado | Acción |
|---------|------------|--------|
| `diseñar` | Crear nuevo componente | Invocar Designer |
| `design` | Diseño UI | Invocar Designer |
| `rediseñar` | Modificar existente | Invocar Designer |
| `ui component` | Componente UI | Invocar Designer |
| `no existe` | Componente faltante | Proponer Designer |
| `necesito vista` | Vista completa | Designer + Coder |

## Ejemplos de Descripciones Efectivas

### Bueno ✅
```
"Card de post para el feed de trading con:
- Avatar circular 40px con border gradient
- Nombre de usuario en Inter Bold
- Contenido en texto gris claro
- Grid de métricas (likes, comments, shares)
- Botón de tokens con icono de moneda
- Sombra suave y glass morphism
- Tema oscuro"
```

### Malo ❌
```
"Hacer un card"
```

## Conversión a Tailwind

### Patrones Comunes

```jsx
// HTML de Stitch
<div class="glass-card">
  <img class="avatar-circle" />
  <div class="content-area">
    <h3 class="title-text">Nombre</h3>
    <p class="body-text">Contenido</p>
  </div>
</div>

// Conversión a React + Tailwind
<div className="glass rounded-2xl border border-white/10 backdrop-blur-xl">
  <img className="size-10 rounded-full" />
  <div className="flex-1">
    <h3 className="font-bold text-white">Nombre</h3>
    <p className="text-sm text-gray-400">Contenido</p>
  </div>
</div>
```

## Configuración del Entorno

### Variables de Entorno
```bash
# .env para Stitch
STITCH_API_KEY=tu_api_key
STITCH_PROJECT_ID=tu_project_id
GOOGLE_CLOUD_PROJECT=tu_gcp_project
```

### MCP Config (para todos los IDEs)
```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["@_davideast/stitch-mcp", "proxy"],
      "env": {
        "STITCH_PROJECT_ID": "tu-proyecto"
      }
    }
  }
}
```

## Troubleshooting

### Error: "Permission Denied"
```bash
# Verificar permisos en GCP
gcloud projects describe tu-proyecto

# Asegurar que Stitch API está habilitada
gcloud beta services mcp enable stitch.googleapis.com

# Verificar billing
gcloud billing projects describe tu-proyecto
```

### Error: "Not Authenticated"
```bash
# Re-autenticar
npx @_davideast/stitch-mcp logout --force --clear-config
npx @_davideast/stitch-mcp init
```

### Error: "Project Not Found"
```bash
# Listar proyectos disponibles
npx @_davideast/stitch-mcp view --projects

# Configurar proyecto correcto
npx @_davideast/stitch-mcp init --project tu-project-id
```

## Checklist de Conocimiento Compartido

Todos los agentes deben saber:

- [ ] Cómo invocar al diseñador Stitch
- [ ] El sistema de diseño de TradeShare
- [ ] Cómo interpretar HTML/CSS de Stitch
- [ ] Cómo convertir a React/Tailwind
- [ ] Keywords de auto-activación
- [ ] Flujo de handoff: Designer → Coder → Tester
- [ ] Cómo reportar issues de diseño

## Referencias

- Skill: `.claude/skills/stitch-ui-designer/SKILL.md`
- Agent: `.claude/agents/specialized/designer.md`
- Hooks: `.claude/stitch-hooks.json`
- Scripts: `scripts/stitch.ps1`, `scripts/stitch.sh`

---

**Última actualización**: 2026-03-24
**Versión**: 1.0.0
**Mantenido por**: Equipo Aurora
