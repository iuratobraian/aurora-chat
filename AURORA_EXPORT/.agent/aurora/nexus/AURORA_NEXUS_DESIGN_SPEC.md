---
name: "Aurora Nexus Portal"
description: "Portal de orquestación de agentes AI con diseño premium dark mode. Usa Stitch para generar UI cuando se indique 'diseñar portal', 'dashboard agente', 'control panel'."
---

# Aurora Nexus Portal Design Spec

## Concepto

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AURORA NEXUS                                │
│              Centro de Comando de Agentes AI                         │
│                    Dark Mode Premium                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │  NAVBAR: Logo | Navigation Tabs | Status | Settings        │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                                                              │  │
│   │   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │  │
│   │   │OPENCODE │  │MINIMAX │  │ AURORA  │  │GEMINI  │       │  │
│   │   │  ◉◉◉    │  │  ◉◉◉    │  │  ◉◉◉    │  │  ◉◉◉    │       │  │
│   │   │ Active  │  │ Active  │  │ Active  │  │ Active  │       │  │
│   │   └─────────┘  └─────────┘  └─────────┘  └─────────┘       │  │
│   │                                                              │  │
│   │   [▶ INICIAR TODOS]  [■ DETENER]  [↻ REINICIAR]           │  │
│   │                                                              │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │  TAB NAVIGATION                                              │  │
│   │  [Dashboard] [Design Studio] [Image Gen] [Tasks] [Terminal]  │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                                                              │  │
│   │   CONTENT AREA (Based on selected tab)                       │  │
│   │                                                              │  │
│   │   - Dashboard: Agent status, quick actions                  │  │
│   │   - Design Studio: Stitch integration, component preview    │  │
│   │   - Image Gen: AI image generation interface               │  │
│   │   - Tasks: Enterprise task board                           │  │
│   │   - Terminal: Real-time agent output                       │  │
│   │                                                              │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Color Palette

```css
/* Aurora Nexus Dark Theme */
:root {
  /* Backgrounds */
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --bg-card: #1a1a24;
  --bg-elevated: #22222e;
  
  /* Accent Colors */
  --accent-primary: #6366f1;      /* Indigo */
  --accent-secondary: #8b5cf6;    /* Purple */
  --accent-success: #10b981;      /* Emerald */
  --accent-warning: #f59e0b;      /* Amber */
  --accent-danger: #ef4444;       /* Red */
  --accent-info: #06b6d4;         /* Cyan */
  
  /* Agent Colors */
  --agent-opencode: #f97316;      /* Orange */
  --agent-minimax: #ec4899;       /* Pink */
  --agent-aurora: #a855f7;        /* Purple */
  --agent-gemini: #3b82f6;        /* Blue */
  
  /* Text */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  
  /* Borders */
  --border-subtle: rgba(255, 255, 255, 0.05);
  --border-default: rgba(255, 255, 255, 0.1);
  
  /* Effects */
  --glow-primary: 0 0 20px rgba(99, 102, 241, 0.3);
  --glow-success: 0 0 20px rgba(16, 185, 129, 0.3);
}
```

## Typography

```css
/* Font Stack */
--font-heading: 'Inter', -apple-system, sans-serif;
--font-body: 'Inter', -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 2rem;       /* 32px */
```

## Component: Agent Card

```jsx
// Agent Status Card
<div className="
  rounded-2xl 
  border border-white/10 
  bg-card/50 
  backdrop-blur-xl
  p-6
  hover:border-indigo-500/30
  transition-all duration-300
">
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
      <span className="font-bold text-white">{agent.name}</span>
    </div>
    <span className="text-xs text-muted uppercase tracking-wider">
      {agent.status}
    </span>
  </div>
  
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span className="text-secondary">Tasks</span>
      <span className="text-white">{agent.tasks}</span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-secondary">Uptime</span>
      <span className="text-white">{agent.uptime}</span>
    </div>
  </div>
  
  <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
    <div 
      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
      style={{ width: `${agent.load}%` }}
    />
  </div>
</div>
```

## Component: Control Button

```jsx
<button className="
  flex items-center gap-2 
  px-6 py-3 
  rounded-xl 
  font-bold 
  transition-all duration-200
  {variant === 'start' ? 
    'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30' :
    variant === 'stop' ?
    'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/30' :
    'bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30'
  }
  text-white
">
  {icon}
  {label}
</button>
```

## Component: Tab Navigation

```jsx
<div className="
  flex gap-2 
  p-1.5 
  bg-white/5 
  rounded-2xl 
  border border-white/10
">
  {tabs.map(tab => (
    <button
      key={tab.id}
      className={`
        flex items-center gap-2 
        px-5 py-2.5 
        rounded-xl 
        font-medium 
        transition-all duration-200
        ${activeTab === tab.id ?
          'bg-indigo-500 text-white shadow-lg' :
          'text-secondary hover:text-white hover:bg-white/5'
        }
      `}
    >
      {tab.icon}
      {tab.label}
    </button>
  ))}
</div>
```

## Component: Terminal Output

```jsx
<div className="
  rounded-2xl 
  border border-white/10 
  bg-black/50 
  backdrop-blur-xl
  overflow-hidden
">
  <div className="
    flex items-center 
    justify-between 
    px-4 py-3 
    bg-white/5 
    border-b border-white/10
  ">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-red-500" />
      <div className="w-3 h-3 rounded-full bg-yellow-500" />
      <div className="w-3 h-3 rounded-full bg-green-500" />
    </div>
    <span className="text-sm text-secondary">{agentName}</span>
  </div>
  
  <div className="p-4 font-mono text-sm text-green-400 h-96 overflow-y-auto">
    {outputLines.map((line, i) => (
      <div key={i} className="mb-1">{line}</div>
    ))}
    <span className="animate-pulse">▊</span>
  </div>
</div>
```

## Component: Task Card

```jsx
<div className="
  rounded-xl 
  border border-white/10 
  bg-card/50 
  backdrop-blur-sm
  p-4
  hover:border-indigo-500/30
  transition-all
">
  <div className="flex items-start justify-between mb-3">
    <div className="flex items-center gap-2">
      <PriorityBadge priority={task.priority} />
      <span className="font-medium text-white">{task.title}</span>
    </div>
    <StatusBadge status={task.status} />
  </div>
  
  <p className="text-sm text-secondary mb-4 line-clamp-2">
    {task.description}
  </p>
  
  <div className="flex items-center justify-between">
    <AgentAvatar agent={task.assignedTo} />
    <span className="text-xs text-muted">{task.updatedAt}</span>
  </div>
</div>
```

## Component: Design Studio Canvas

```jsx
<div className="
  rounded-2xl 
  border border-white/10 
  bg-card 
  overflow-hidden
">
  <div className="
    flex items-center 
    justify-between 
    px-6 py-4 
    bg-white/5 
    border-b border-white/10
  ">
    <h3 className="font-bold text-white">Design Studio</h3>
    <div className="flex items-center gap-2">
      <Badge variant="success">Stitch Active</Badge>
      <Button size="sm" variant="ghost">Preview</Button>
      <Button size="sm" variant="primary">Generate</Button>
    </div>
  </div>
  
  <div className="p-6">
    <Textarea
      placeholder="Describe your design..."
      className="mb-4 min-h-32"
    />
    
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-xl border border-white/10 bg-black/50 aspect-video">
        {/* Live Preview */}
      </div>
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-secondary">Components</h4>
        <div className="space-y-1">
          {components.map(c => (
            <div 
              key={c.id}
              className="flex items-center gap-2 p-2 rounded bg-white/5"
            >
              <ComponentIcon type={c.type} />
              <span className="text-sm text-white">{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</div>
```

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER (h-16)                                                      │
│  Logo | Nav | Status Indicator | Settings                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  HERO SECTION (Agents Grid)                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                  │
│  │OPENCODE │ │MINIMAX  │ │ AURORA  │ │ GEMINI  │                  │
│  │  ◉◉◉    │ │  ◉◉◉    │ │  ◉◉◉    │ │  ◉◉◉    │                  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                  │
│                                                                      │
│  [▶ INICIAR TODOS]  [■ DETENER]  [↻ REINICIAR]                   │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  TAB CONTENT (flex-1 overflow-auto)                                  │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Dashboard | Design Studio | Image Gen | Tasks | Terminal    │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                                                              │    │
│  │   [Active Tab Content]                                       │    │
│  │                                                              │    │
│  │                                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Animations

```css
/* Pulse animation for active agents */
@keyframes pulse-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.agent-active {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Fade in animation */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.3s ease-out;
}

/* Glass shimmer */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.glass-shimmer {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255,255,255,0.1) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 3s infinite;
}
```

## Responsive Breakpoints

```css
/* Mobile: < 640px */
@media (max-width: 640px) {
  .agents-grid { grid-template-columns: 1fr; }
  .tabs { overflow-x: auto; }
}

/* Tablet: 640px - 1024px */
@media (min-width: 640px) and (max-width: 1024px) {
  .agents-grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop: > 1024px */
@media (min-width: 1024px) {
  .agents-grid { grid-template-columns: repeat(4, 1fr); }
}
```

## Accessibility

- Focus visible states with `ring-2 ring-indigo-500 ring-offset-2`
- ARIA labels on all interactive elements
- Keyboard navigation support
- Color contrast ratio > 4.5:1

---

## Stitch Export Notes

When generating with Stitch, include:
1. All color variables from palette
2. Typography scale
3. Component patterns shown above
4. Dark mode as default theme
5. Glass morphism effects on cards
6. Gradient accents on buttons and badges
