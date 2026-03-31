# AURORA NEXUS - Portal de Orquestación de Agentes
## Plan de Trabajo Maestro

---

## 1. VISIÓN DEL PROYECTO

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AURORA NEXUS                                    │
│         Centro de Comando de Agentes AI                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐               │
│   │ OPENCODE│  │ MINIMAX │  │ AURORA  │  │ GEMINI  │               │
│   │   AI    │  │   M2.5  │  │ CORE    │  │  MAESTRO│               │
│   └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘               │
│        │             │             │             │                     │
│        └─────────────┴─────────────┴─────────────┘                   │
│                           │                                          │
│                    ┌──────▼──────┐                                  │
│                    │  ORCHESTRA  │                                  │
│                    │   HUB       │                                  │
│                    └──────┬──────┘                                  │
│                           │                                          │
│   ┌──────────┬───────────┼───────────┬──────────┐                   │
│   │          │           │           │          │                   │
│   ▼          ▼           ▼           ▼          ▼                   │
│ ┌──────┐ ┌──────┐ ┌──────────┐ ┌────────┐ ┌────────┐              │
│ │DESIGN│ │IMAGE │ │  WORK    │ │ TERMINAL│ │EDITOR │              │
│ │SECTOR│ │GEN   │ │ ORCHESTR.│ │ OUTPUT │ │SECTOR │              │
│ └──────┘ └──────┘ └──────────┘ └────────┘ └────────┘              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. ARQUITECTURA DEL SISTEMA

### 2.1 Componentes Principales

```
aurora-nexus/
├── aurora-nexus-web/              # Frontend React
│   ├── src/
│   │   ├── components/
│   │   │   ├── AgentTerminal/     # Terminal visual para cada agente
│   │   │   ├── DesignStudio/     # Sector de diseño con Stitch
│   │   │   ├── ImageGenerator/    # Generador de imágenes
│   │   │   ├── WorkOrchestrator/  #调度工作编排
│   │   │   ├── TaskBoard/         # Tablero empresarial
│   │   │   ├── CodeEditor/        # Editor de código
│   │   │   └── ControlPanel/      # Panel de control
│   │   ├── hooks/
│   │   │   ├── useAgentConnection.ts
│   │   │   ├── useTaskOrchestration.ts
│   │   │   └── useAgentSpawner.ts
│   │   └── stores/
│   │       └── agentStore.ts
│   └── package.json
│
├── aurora-nexus-server/           # Backend Node.js
│   ├── src/
│   │   ├── agents/
│   │   │   ├── opencode.ts        # OpenCode Agent
│   │   │   ├── minimax.ts         # Minimax M2.5 Agent
│   │   │   ├── aurora.ts          # Aurora Core Agent
│   │   │   └── gemini.ts          # Gemini Maestro Agent
│   │   ├── services/
│   │   │   ├── agentManager.ts    # Gestor de agentes
│   │   │   ├── terminalBridge.ts  # Puente a terminales
│   │   │   ├── taskDistributor.ts # Distribuidor de tareas
│   │   │   └── workflowEngine.ts   # Motor de workflows
│   │   └── websocket/
│   │       └── agentSocket.ts     # WebSocket para comunicación
│   └── package.json
│
├── scripts/
│   ├── start-all-agents.ps1      # Iniciar todos los agentes
│   ├── start-opencode.ps1
│   ├── start-minimax.ps1
│   ├── start-aurora.ps1
│   └── start-gemini.ps1
│
└── README.md
```

### 2.2 Agentes Disponibles

| Agente | Modelo | Especialización | Terminal Port |
|--------|--------|-----------------|---------------|
| **OpenCode (Big Pickle)** | Claude | Coding, debugging | 3001 |
| **Minimax M2.5 #1** | Minimax | Análisis, estrategia | 3002 |
| **Minimax M2.5 #2** | Minimax | Code review, testing | 3003 |
| **Aurora Core** | Multi-model | Orquestación, aprendizaje | 3004 |
| **Gemini Maestro** | Gemini | Creatividad, diseño | 3005 |

---

## 3. MÓDULOS DE LA WEB

### 3.1 Panel de Control Principal

```
┌─────────────────────────────────────────────────────────────────┐
│  🚀 AURORA NEXUS          [●] Sistema Online    [Settings]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  AGENTS STATUS                                            │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │   │
│  │  │OPENCODE│ │MINIMAX │ │ AURORA │ │GEMINI  │           │   │
│  │  │  ●●●   │ │  ●●●   │ │  ●●●   │ │  ●●●   │           │   │
│  │  │ Active │ │ Active │ │ Active │ │ Active │           │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘           │   │
│  │                                                           │   │
│  │  [▶ INICIAR TODOS]  [■ DETENER TODOS]  [↻ REINICIAR]   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Sector de Diseño (Design Studio)

```
┌─────────────────────────────────────────────────────────────────┐
│  🎨 DESIGN STUDIO                              [Stitch Active] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  DESCRIPCIÓN DEL DISEÑO                                 │    │
│  │  ┌─────────────────────────────────────────────────┐   │    │
│  │  │ Crear un dashboard de trading con cards          │   │    │
│  │  │ para mostrar señales, portfolio y gráficos       │   │    │
│  │  └─────────────────────────────────────────────────┘   │    │
│  │                                                          │    │
│  │  [Generar con Stitch]  [Preview]  [Aprobar]           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────────────┐    │
│  │   LIVE PREVIEW       │  │   COMPONENT LIST            │    │
│  │                      │  │   • TradingCard              │    │
│  │   [Render del        │  │   • SignalBadge             │    │
│  │    diseño Stitch]    │  │   • PortfolioChart          │    │
│  │                      │  │   • ActionButton            │    │
│  │                      │  │                              │    │
│  └──────────────────────┘  └──────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Generador de Imágenes

```
┌─────────────────────────────────────────────────────────────────┐
│  🖼️ IMAGE GENERATOR                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Prompt:                                                │    │
│  │  ┌─────────────────────────────────────────────────┐   │    │
│  │  │ A futuristic trading interface with holographic  │   │    │
│  │  │ charts and neural network visualizations        │   │    │
│  │  └─────────────────────────────────────────────────┘   │    │
│  │                                                          │    │
│  │  Estilo: [Realista ▼]  Tamaño: [1920x1080 ▼]          │    │
│  │                                                          │    │
│  │  [Generar Imagen]  [Variaciones]  [Upscale]            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    GENERATED IMAGES                     │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐              │    │
│  │  │ [img 1] │  │ [img 2] │  │ [img 3] │              │    │
│  │  └─────────┘  └─────────┘  └─────────┘              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Tablero de Trabajo Empresarial

```
┌─────────────────────────────────────────────────────────────────┐
│  📋 TASK BOARD - TradeShare Portal                           │
├─────────────────────────────────────────────────────────────────┤
│  [+ Nueva Tarea]  [Filtros ▼]  [Asignar a Agente ▼]          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PRIORITY │ TAREA                  │ AGENTE      │ ESTADO      │
│  ─────────────────────────────────────────────────────────────  │
│  🔴 ALTA  │ Fix floating menu bug │ [OpenCode ▼]│ En Progreso │
│  🟡 MEDIA │ Add new dashboard     │ [Aurora ▼]  │ Pendiente  │
│  🟢 BAJA  │ Update docs           │ [Minimax ▼] │ Completado  │
│  🔴 ALTA  │ Design login screen   │ [Design ▼]  │ En Review  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ DETALLES DE TAREA                                       │    │
│  │ ──────────────────────────────────────────────────────  │    │
│  │ Título: Fix duplicate floating menu                     │    │
│  │ Descripción: Los menús flotantes aparecen duplicados... │    │
│  │ Archivos: FloatingBar.tsx, FloatingActionsMenu.tsx     │    │
│  │ Prioridad: Alta                                        │    │
│  │ Asignado: OpenCode                                      │    │
│  │ Status: En Progreso                                    │    │
│  │                                                          │    │
│  │ [Iniciar Trabajo] [Marcar Completo] [Delegar]          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.5 Terminal Visual

```
┌─────────────────────────────────────────────────────────────────┐
│  💻 TERMINAL OUTPUT                              [OpenCode]    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ > Iniciando OpenCode Agent...                           │    │
│  │ > Conectado al proyecto: tradeportal-2025-platinum    │    │
│  │ > Cargando contexto del codebase...                     │    │
│  │                                                          │    │
│  │ $ Analizando FloatingBar.tsx...                        │    │
│  │ $ Detectados 2 menús flotantes duplicados               │    │
│  │ $ Ejecutando fix...                                     │    │
│  │ > Changes applied successfully                           │    │
│  │                                                          │    │
│  │ > Commit creado: fix: merge duplicate floating menus    │    │
│  │ > Push a origin/main completado                         │    │
│  │                                                          │    │
│  │ $ _                                                         │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  [Clear] [Export Log] [Send Command]                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. FLUJOS DE TRABAJO

### 4.1 Flujo de Inicio de Agentes

```
┌─────────────────────────────────────────────────────────────────┐
│                    STARTUP FLOW                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    USUARIO                                                     │
│        │                                                       │
│        ▼                                                       │
│  ┌─────────────┐                                               │
│  │ Click START │                                               │
│  └──────┬──────┘                                               │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────┐                   │
│  │  INICIAR TODOS LOS AGENTES              │                   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐   │                   │
│  │  │OpenCode │ │Minimax  │ │ Aurora  │   │                   │
│  │  │   ▶     │ │   ▶     │ │   ▶     │   │                   │
│  │  └────┬────┘ └────┬────┘ └────┬────┘   │                   │
│  │       │            │           │        │                   │
│  │       ▼            ▼           ▼        │                   │
│  │  ┌─────────────────────────────────┐   │                   │
│  │  │ Terminal  Terminal  Terminal    │   │                   │
│  │  │   3001      3002      3004     │   │                   │
│  │  └─────────────────────────────────┘   │                   │
│  │                  │                      │                   │
│  │                  ▼                      │                   │
│  │         ┌───────────────┐              │                   │
│  │         │ WebSocket Hub │              │                   │
│  │         └───────┬───────┘              │                   │
│  └─────────────────┼──────────────────────┘                   │
│                    │                                           │
│                    ▼                                           │
│         ┌─────────────────────┐                                │
│         │ Dashboard Actualiza │                                │
│         │   ● ● ● ● ●        │                                │
│         │   Todos Online      │                                │
│         └─────────────────────┘                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Flujo de Solicitud de Diseño

```
┌─────────────────────────────────────────────────────────────────┐
│                    DESIGN REQUEST FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    USUARIO                                                     │
│        │                                                       │
│        ▼                                                       │
│  ┌──────────────────────┐                                       │
│  │ Escribir descripción │                                       │
│  │ "Crear un modal de   │                                       │
│  │  login con glass..." │                                       │
│  └──────────┬───────────┘                                       │
│             │                                                   │
│             ▼                                                   │
│  ┌──────────────────────┐                                       │
│  │ Stitch AI genera     │                                       │
│  │ diseño               │                                       │
│  └──────────┬───────────┘                                       │
│             │                                                   │
│             ▼                                                   │
│  ┌──────────────────────┐                                       │
│  │ Preview en vivo     │                                       │
│  │ + HTML/CSS exportado │                                       │
│  └──────────┬───────────┘                                       │
│             │                                                   │
│    ┌────────┴────────┐                                         │
│    ▼                 ▼                                        │
│ ┌──────┐        ┌──────────┐                                   │
│ │ Aprobar│        │ Ajustar │                                   │
│ └───┬───┘        └────┬─────┘                                   │
│     │                  │                                         │
│     ▼                  ▼                                         │
│ ┌──────────┐     ┌──────────────┐                                │
│ │ OpenCode │     │ Volver a     │                                │
│ │ implement│     │ Stitch       │                                │
│ └────┬─────┘     └──────────────┘                                │
│      │                                                        │
│      ▼                                                        │
│ ┌──────────┐                                                   │
│ │ Tester   │                                                   │
│ │ verifica │                                                   │
│ └────┬─────┘                                                   │
│      │                                                        │
│      ▼                                                        │
│ ┌──────────┐                                                   │
│ │ Done!    │                                                   │
│ └──────────┘                                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Flujo de Tarea Empresarial

```
┌─────────────────────────────────────────────────────────────────┐
│                    TASK ORCHESTRATION FLOW                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    USUARIO                                                     │
│        │                                                       │
│        ▼                                                       │
│  ┌──────────────────────┐                                       │
│  │ Crear tarea en       │                                       │
│  │ Task Board           │                                       │
│  │ "Fix bug en API"     │                                       │
│  └──────────┬───────────┘                                       │
│             │                                                   │
│             ▼                                                   │
│  ┌──────────────────────┐                                       │
│  │ Asignar a agente     │                                       │
│  │ [OpenCode ▼]        │                                       │
│  └──────────┬───────────┘                                       │
│             │                                                   │
│             ▼                                                   │
│  ┌──────────────────────┐                                       │
│  │ Agente recibe tarea  │                                       │
│  │ + contexto completo   │                                       │
│  └──────────┬───────────┘                                       │
│             │                                                   │
│             ▼                                                   │
│  ┌──────────────────────┐                                       │
│  │ Agente trabaja       │                                       │
│  │ + Updates en vivo    │                                       │
│  │ + Terminal output    │                                       │
│  └──────────┬───────────┘                                       │
│             │                                                   │
│    ┌────────┴────────┐                                         │
│    ▼                 ▼                                        │
│ ┌──────┐        ┌──────────┐                                   │
│ │Success│        │  Issues  │                                   │
│ └───┬───┘        └────┬─────┘                                   │
│     │                  │                                         │
│     ▼                  ▼                                         │
│ ┌──────────┐     ┌──────────────┐                                │
│ │ Marcar  │     │ Auto-assign  │                                │
│ │Completo │     │ a otro agente│                                │
│ └──────────┘     └──────────────┘                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. ESPECIFICACIONES TÉCNICAS

### 5.1 Puertos y Conexiones

```
┌─────────────────────────────────────────────────────────────────┐
│  PUERTOS DE COMUNICACIÓN                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Agent      │ Port  │ Protocol │ Purpose                        │
│  ─────────────────────────────────────────────────────────────  │
│  OpenCode   │ 3001  │ WebSocket│ Terminal + Code execution     │
│  Minimax 1  │ 3002  │ WebSocket│ Análisis de tareas            │
│  Minimax 2  │ 3003  │ WebSocket│ Code review                  │
│  Aurora     │ 3004  │ WebSocket│ Orquestación central          │
│  Gemini     │ 3005  │ WebSocket│ Diseño y creatividad          │
│  Design Hub │ 3006  │ WebSocket│ Stitch integration            │
│  Image Gen  │ 3007  │ REST     │ Generación de imágenes        │
│                                                                  │
│  Web Server │ 8080  │ HTTP     │ Frontend del portal           │
│  API Server │ 3000  │ REST     │ Backend del portal             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Variables de Entorno

```bash
# .env.nexus
PORTAL_PORT=8080
API_PORT=3000

# Agent Connections
OPENCODE_WS_PORT=3001
MINIMAX_WS_PORT=3002
AURORA_WS_PORT=3004
GEMINI_WS_PORT=3005

# External Services
STITCH_API_KEY=your_stitch_key
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
MINIMAX_API_KEY=your_minimax_key

# Project Path
PROJECT_PATH=/path/to/tradeportal-2025-platinum
```

---

## 6. PLAN DE IMPLEMENTACIÓN (FASES)

### FASE 1: Core Infrastructure (Semana 1)
- [ ] Crear estructura del proyecto aurora-nexus
- [ ] Implementar servidor WebSocket central
- [ ] Crear terminal bridge para agentes
- [ ] Implementar panel de control básico

### FASE 2: Agent Integration (Semana 2)
- [ ] Integrar OpenCode Agent
- [ ] Integrar Minimax M2.5 Agents
- [ ] Integrar Aurora Core
- [ ] Integrar Gemini Maestro
- [ ] Implementar scripts de inicio

### FASE 3: Design Studio (Semana 3)
- [ ] Integrar Stitch MCP
- [ ] Crear Design Studio component
- [ ] Implementar preview en vivo
- [ ] Conectar con workflow de implementación

### FASE 4: Image Generator (Semana 3)
- [ ] Integrar generador de imágenes
- [ ] Crear UI de generación
- [ ] Implementar gallery de imágenes

### FASE 5: Task Orchestration (Semana 4)
- [ ] Crear Task Board empresarial
- [ ] Implementar distribución automática
- [ ] Conectar con agentes

### FASE 6: Polish & Integration (Semana 4)
- [ ] Testing completo
- [ ] Optimización de rendimiento
- [ ] Documentación
- [ ] Deployment

---

## 7. COMANDOS DE INICIO

```bash
# Iniciar todo el sistema
.\scripts\start-all-agents.ps1

# Iniciar individualmente
.\scripts\start-opencode.ps1
.\scripts\start-minimax.ps1
.\scripts\start-aurora.ps1
.\scripts\start-gemini.ps1

# Iniciar portal web
cd aurora-nexus-web && npm run dev

# API server
cd aurora-nexus-server && npm run dev
```

---

## 8. RESPONSABILIDADES POR AGENTE

### OpenCode (Big Pickle)
- Coding, debugging, refactoring
- Implementación de features
- Fix de bugs

### Minimax M2.5 x2
- Análisis de tareas
- Code review
- Testing automation
- Documentación

### Aurora Core
- Orquestación de agentes
- Aprendizaje y adaptación
- Gestión de workflows
- Supervisión general

### Gemini Maestro
- Diseño UI/UX
- Creatividad
- Generación de imágenes
- Propuestas de mejora

### Design Studio
- Integración con Stitch
- Generación de componentes
- Design system management

---

## 9. MCPs A INTEGRAR

```
┌─────────────────────────────────────────────────────────────────┐
│  MODEL CONTEXT PROTOCOLS                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐                       │
│  │    STITCH       │  │    CLAUDE       │                       │
│  │  Design AI      │  │    CODE         │                       │
│  └────────┬────────┘  └────────┬────────┘                       │
│           │                    │                                │
│  ┌────────┴────────┐  ┌────────┴────────┐                       │
│  │    GEMINI       │  │    MINIMAX      │                       │
│  │  Image Gen      │  │  Analysis       │                       │
│  └─────────────────┘  └─────────────────┘                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

**Plan creado**: 2026-03-25
**Versión**: 1.0.0
**Autor**: Aurora Nexus Planning Team
**Estado**: LISTO PARA EJECUTAR

---

## PRÓXIMOS PASOS

1. [ ] **Diseñar UI** con Stitch → Design Studio
2. [ ] **Crear estructura** del proyecto
3. [ ] **Implementar servidor** WebSocket
4. [ ] **Integrar agentes** uno por uno
5. [ ] **Conectar flujos** de trabajo
6. [ ] **Probar** y optimizar
