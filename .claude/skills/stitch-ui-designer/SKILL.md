---
name: "Stitch UI Designer"
description: "Google Stitch AI design integration. CORE SKILL for all agents. Use when creating components, redesigning, or when detecting 'diseñar', 'design', 'ui', 'componente'. Must invoke when other agents request UI work."
---

# Stitch UI Designer - CORE SKILL

**OBLIGATORIO para todos los agentes**: Esta skill debe estar disponible para coder, tester, architect y cualquier otro agente que necesite generar UI.

## Core Concept

```
┌─────────────────────────────────────────────────────────┐
│              STITCH DESIGN CHAIN                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Task ──→ [CODER] detects UI needed                     │
│              ↓                                           │
│           [DESIGNER] invoked via /stitch                 │
│              ↓                                           │
│           Stitch AI generates HTML/CSS                   │
│              ↓                                           │
│           [CODER] receives and implements                │
│              ↓                                           │
│           [TESTER] verifies match                        │
│              ↓                                           │
│           Done!                                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Para TODOS los Agentes

### Cuándo Invocar

| Agente | Detecta | Invoca Stitch cuando |
|--------|---------|---------------------|
| Coder | Componente no existe | Nuevo feature, redesign |
| Tester | Diseño no coincide | Verificar UI |
| Architect | Define patterns | Design system decisions |
| Any | Keywords detectados | Ver abajo |

### Keywords de Auto-Activación

```
/stitch - Invocación directa
diseñar, design, ui, componente ui
diseño premium, beautiful interface
rediseñar, improve ui, better design
nuevo componente, new component
no existe (componente faltante)
```

### Cómo Invocar

```javascript
// 1. Via comando
/stitch design "trading card component"

// 2. Via evento
window.dispatchEvent(new CustomEvent("stitch-design", {
  detail: { description: "...", callback: handleResult }
}));

// 3. En swarm
await swarm.invoke("designer", { action: "generate_ui" });
```

## Flujo Encadenado (CHAINED)

```
1. [ANY AGENT] → Detecta necesidad de UI
   ↓
2. [DESIGNER] → Genera con Stitch
   → Recibe: descripción del componente
   → Entrega: HTML/CSS o screenshot
   
3. [CODER] → Implementa diseño
   → Recibe: HTML/CSS del diseñador
   → Entrega: Componente React funcional
   
4. [TESTER] → Verifica match
   → Recibe: Componente + Diseño original
   → Entrega: Match ✓ o issues report
   
5. Loop si hay issues → Back to Designer
```

### Ejemplo de Handoff

```
┌──────────────────────────────────────────────┐
│ HANDOFF: Designer → Coder                     │
├──────────────────────────────────────────────┤
│                                               │
│ DISEÑO: PostCard                             │
│ ────────────────────────────────────────────  │
│                                               │
│ HTML GENERADO:                                │
│ <div class="stitch-card">                     │
│   <img class="stitch-avatar" />               │
│   <div class="stitch-content">...</div>      │
│ </div>                                        │
│                                               │
│ ↓                                             │
│                                               │
│ CONVERSIÓN REQUERIDA:                         │
│ → React functional component                   │
│ → Tailwind classes                            │
│ → Hooks si necesario                          │
│ → Props interface                             │
│                                               │
│ CONOCIMIENTO REQUERIDO:                       │
│ → TradeShare design system (ver abajo)         │
│ → Colors: primary, signal-green, card-dark     │
│ → Glass morphism: backdrop-blur-xl             │
│ → Border: border-white/10                      │
│                                               │
└──────────────────────────────────────────────┘
```

## Available Tools

### MCP Tools (via Stitch)

- **`build_site`** - Builds a complete site from Stitch project screens
- **`get_screen_code`** - Retrieves screen HTML/CSS code
- **`get_screen_image`** - Gets screen screenshot as base64
- **`list_projects`** - Lists all Stitch projects
- **`list_screens`** - Lists screens in a project

### CLI Commands

```bash
# Initialize Stitch authentication
npx @_davideast/stitch-mcp init

# Serve designs locally
npx @_davideast/stitch-mcp serve -p <project-id>

# Build Astro site from designs
npx @_davideast/stitch-mcp site -p <project-id>

# Browse projects
npx @_davideast/stitch-mcp view --projects

# Check configuration
npx @_davideast/stitch-mcp doctor
```

## Design Workflow

### 1. Analyze Requirements

Before designing, understand:
- Target platform (web, mobile)
- Design system (existing colors, typography)
- Component purpose and interactions
- Accessibility requirements

### 2. Generate Design

Use natural language to describe the component:
- Visual style (minimal, modern, dark mode)
- Color palette
- Layout and spacing
- Interactive elements
- States (hover, active, disabled)

### 3. Review and Refine

Preview the design and iterate:
- Check responsive behavior
- Verify color consistency
- Ensure accessibility
- Match existing design language

### 4. Implement

Convert Stitch output to working code:
- Extract HTML structure
- Convert CSS to Tailwind classes
- Add React/Vue/Angular integration
- Wire up event handlers
- Test in browser

## Design Guidelines

### TradeShare Design System

- **Primary**: Blue (#3b82f6)
- **Signal Green**: Emerald (#10b981)
- **Dark**: #0f1115
- **Card**: #1a1a2e
- **Accent**: Purple gradient

### Typography

- **Headlines**: Inter Black, uppercase
- **Body**: Inter Regular
- **Mono**: JetBrains Mono (prices, data)

### Components

- Glass morphism cards with backdrop-blur
- Rounded corners (xl/2xl)
- Subtle borders (white/5 to white/10)
- Gradient accents on CTAs

## TradeShare Design System (OBLIGATORIO)

Todo diseño Stitch DEBE seguir este sistema:

### Colores CSS
```css
--primary: #3b82f6        /* Azul principal */
--signal-green: #10b981   /* Verde para señales positivas */
--dark: #0f1115           /* Fondo principal */
--card: #1a1a2e           /* Fondo de tarjetas */
--accent-purple: gradient /* Púrpura para acentos */
--text-primary: #ffffff    /* Texto principal */
--text-secondary: #9ca3af /* Texto secundario */
--border: rgba(255,255,255,0.1) /* Borders sutiles */
```

### Clases Tailwind Comunes
```jsx
// Card con glass morphism
<div className="glass rounded-2xl border border-white/10 backdrop-blur-xl bg-card-dark">

// Botón primario
<button className="px-4 py-2 bg-primary hover:bg-primary/80 text-white font-bold rounded-xl">

// Botón con gradiente
<button className="bg-gradient-to-r from-primary to-blue-600 shadow-lg shadow-primary/30">

// Input
<input className="bg-white/5 border border-white/10 rounded-xl px-4 py-2">

// Badge
<span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs font-bold">

// Avatar con gradient border
<div className="p-0.5 bg-gradient-to-br from-primary to-purple-500 rounded-full">
  <img className="rounded-full" />
</div>
```

### Spacing & Sizing
```jsx
// Spacing estándar
m-4, p-4       // Base
gap-2, gap-3   // Entre elementos
space-y-2      // Vertical

// Tamaños comunes
size-8         // 32px - iconos
size-10        // 40px - avatars pequeños
size-12        // 48px - avatars
size-16        // 64px - elementos grandes

// Border radius
rounded-xl     // 12px - tarjetas, botones
rounded-2xl     // 16px - modales
rounded-full    // Círculo
```

## MCP Configuration

Add to your Claude Code MCP config:

```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["@_davideast/stitch-mcp", "proxy"]
    }
  }
}
```

## Troubleshooting

### Authentication Issues

```bash
# Clear and re-authenticate
npx @_davideast/stitch-mcp logout --force --clear-config
npx @_davideast/stitch-mcp init
```

### Permission Denied

Ensure you have Owner/Editor role in Google Cloud, billing enabled, and Stitch API enabled.

### Design Not Loading

Run diagnostics:
```bash
npx @_davideast/stitch-mcp doctor --verbose
```

## Hooks Configuration

Located at: `.claude/stitch-hooks.json`

```json
{
  "hooks": {
    "stitch-designer": {
      "trigger": "/stitch",
      "description": "Activa el agente diseñador Stitch",
      "agent": "designer",
      "skill": "stitch-ui-designer",
      "autoTrigger": [
        "diseñar", "design", "ui component", "componente ui",
        "diseño premium", "beautiful interface", "modern card"
      ]
    }
  }
}
```

## Agent Integration

When other agents need UI design:

1. **coder agent** detects component needed → invokes `/stitch design`
2. **designer agent** activates → uses Stitch MCP tools
3. **designer** generates design → passes HTML/CSS to coder
4. **coder** implements → integrates into codebase

This enables the swarm workflow:
```
[Task] → [Coder] → [Designer] → [Coder] → [Tester]
           ↓          ↓           ↓           ↓
        Need UI? → Generate → Receive → Implement → Test
```

## MCP Server Setup

To enable MCP tools in Claude Code:

```bash
# Add to your MCP config file (~/.claude/settings.json or project .mcp.json)
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["@_davideast/stitch-mcp", "proxy"]
    }
  }
}
```

Or run directly:
```bash
npx @_davideast/stitch-mcp proxy
```

## Chained Workflow - Para Todos los Agentes

### Patrón de Handoff Completo

```javascript
// ═══════════════════════════════════════════════════════
// FASE 1: Detección (Cualquier Agente)
// ═══════════════════════════════════════════════════════
if (taskRequiresUI || keywordsDetected(['diseñar', 'design', 'ui'])) {
  const designRequest = {
    type: 'ui_design',
    description: extractDescription(task),
    context: { project: 'tradeshare', theme: 'dark' },
    priority: 'normal'
  };
  
  // Opción A: Directo
  await invokeStitch(designRequest);
  
  // Opción B: Via swarm
  await swarm.invoke('designer', designRequest);
}

// ═══════════════════════════════════════════════════════
// FASE 2: Diseño (Designer Agent)
// ═══════════════════════════════════════════════════════
async function handleDesignRequest(request) {
  // Generar con Stitch
  const design = await stitch.generate({
    prompt: request.description,
    style: 'tradeshare-dark'
  });
  
  // Opciones de salida
  return {
    html: design.html,        // HTML directo
    css: design.styles,       // CSS
    image: design.screenshot, // Preview
    tokens: design.designTokens // Para consistencia
  };
}

// ═══════════════════════════════════════════════════════
// FASE 3: Implementación (Coder Agent)
// ═══════════════════════════════════════════════════════
function convertToReact(html, css) {
  // Extraer estructura
  const structure = parseHTML(html);
  
  // Convertir CSS a Tailwind
  const tailwind = cssToTailwind(css, {
    designSystem: 'tradeshare',
    prefix: ''
  });
  
  // Generar componente
  return `<div className="${tailwind}">...</div>`;
}

// ═══════════════════════════════════════════════════════
// FASE 4: Verificación (Tester Agent)
// ═══════════════════════════════════════════════════════
async function verifyDesignMatch(component, design) {
  const checks = {
    colors: verifyColors(component, design),
    typography: verifyTypography(component, design),
    spacing: verifySpacing(component, design),
    layout: verifyLayout(component, design)
  };
  
  if (Object.values(checks).some(c => !c.match)) {
    return {
      match: false,
      issues: Object.entries(checks).filter(([,c]) => !c.match)
    };
  }
  
  return { match: true };
}
```

### Configuración Global para Agentes

```json
// .claude/agents-config.json (para todos los agentes)
{
  "global_capabilities": {
    "stitch_designer": {
      "enabled": true,
      "auto_invoke": true,
      "knowledge_base": ".agent/brain/docs/stitch-guide.md"
    }
  },
  "knowledge_sharing": {
    "learned_patterns": ".agent/brain/stitch-patterns.json",
    "shared_context": "El diseñador Stitch genera HTML/CSS que debe convertirse a React/Tailwind"
  }
}
```

### Shared Context (Todos los Agentes)

```
CONOCIMIENTO COMPARTIDO:
━━━━━━━━━━━━━━━━━━━━━━━━

1. Stitch genera HTML/CSS de alta calidad
2. El diseñador DEBE seguir TradeShare Design System
3. Coder convierte HTML → React + Tailwind
4. Tester verifica match entre implementación y diseño
5. Si hay issues → Loop back to Designer

SISTEMA DE DISEÑO:
━━━━━━━━━━━━━━━━━━━
- Primary: Blue (#3b82f6)
- Signal Green: Emerald (#10b981)
- Card Dark: #1a1a2e
- Glass: backdrop-blur-xl + border-white/10

FLUJO ESTÁNDAR:
━━━━━━━━━━━━━━━━━━━
[Any Agent] → Detecta UI → /stitch → [Designer] → HTML/CSS
                                           ↓
[Coder] ← Recibe ← ┘
   ↓
Implementa → [Tester] → Verifica
   ↓ (si no match)
[Designer] → Ajusta → Loop
```

## Auto-Learning (Knowledge Base)

Los agentes guardan lo aprendido en:

```
.agent/brain/
├── docs/
│   └── stitch-guide.md          # Guía completa
├── stitch-patterns.json         # Patrones aprendidos
├── stitch-components.json        # Componentes diseñados
└── stitch-conversions.json      # Conversiones HTML→React
```

### Ejemplo de Pattern Guardado

```json
{
  "pattern": "glass-card",
  "source": "Stitch generated",
  "html": "<div class='glass'>...",
  "tailwind": "rounded-2xl border border-white/10 backdrop-blur-xl bg-card-dark",
  "times_used": 47,
  "last_used": "2026-03-24",
  "variations": ["with-gradient", "with-glow", "minimal"]
}
```

---

**PARA TODOS LOS AGENTES**: Léan `.agent/brain/docs/stitch-guide.md` para conocimiento completo del flujo encadenado.
