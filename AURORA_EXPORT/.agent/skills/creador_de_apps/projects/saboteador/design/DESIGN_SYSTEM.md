---
name: saboteador_design
description: Sistema de diseño Obsidian Ether x Cyber Neon para El Saboteador Invisible
---

# El Saboteador Invisible - Sistema de Diseño

## Identidad Visual

Fusión de **Obsidian Ether** (fondo oscuro profundo) con **Cyber Neon** (acentos brillantes neón) para crear una experiencia inmersiva de juego social de deducción.

## Paleta de Colores

```css
:root {
  /* === FONDO Y SUPERFICIE === */
  --bg-void: #0a0a0b;           /* Fondo principal - negro profundo */
  --bg-obsidian: #0f0f12;       /* Superficie secundaria */
  --bg-card: rgba(20, 20, 24, 0.85);  /* Cards con glassmorphism */
  --bg-glass: rgba(32, 31, 31, 0.6);
  
  /* === BORDES === */
  --border-subtle: rgba(73, 68, 84, 0.15);
  --border-glow: rgba(255, 255, 255, 0.08);
  
  /* === NEOFARM - ROLES === */
  --neon-red: #ff003c;          /* Saboteador - rojo neón */
  --neon-red-glow: rgba(255, 0, 60, 0.4);
  --neon-green: #00ff94;        /* Normal/Éxito - verde neón */
  --neon-green-glow: rgba(0, 255, 148, 0.4);
  --neon-blue: #00d4ff;         /* Protector - cian neón */
  --neon-blue-glow: rgba(0, 212, 255, 0.4);
  --neon-yellow: #ffd700;       /* Doble Agente - dorado neón */
  --neon-yellow-glow: rgba(255, 215, 0, 0.4);
  --neon-purple: #a855f7;       /* Detective - púrpura neón */
  --neon-purple-glow: rgba(168, 85, 247, 0.4);
  
  /* === NEUTROS === */
  --text-primary: #e5e2e1;      /* Texto principal */
  --text-secondary: #86868b;     /* Texto secundario */
  --text-muted: #52525b;        /* Texto terciario */
  
  /* === ACENTOS UI === */
  --accent-gradient: linear-gradient(135deg, #d0bcff 0%, #a078ff 100%);
  --accent-primary: #a078ff;
  
  /* === ESTADO === */
  --success: #22c55e;
  --warning: #fbbf24;
  --danger: #ef4444;
  --info: #3b82f6;
}
```

## Sistema de Iconos + Patrones (Accesibilidad)

Para usuarios con daltonismo, nunca depender solo del color. Siempre: **icono + texto + patrón de fondo**.

| Rol | Color | Hex | Icono | Patrón SVG |
|-----|-------|-----|-------|------------|
| Normal | Verde | `#00ff94` | ☘️ Clover | Líneas horizontales |
| Saboteador | Rojo | `#ff003c` | 💀 Skull | Diagonales |
| Detective | Púrpura | `#a855f7` | 🔍 Magnifier | Puntos |
| Doble Agente | Dorado | `#ffd700` | 🃏 Joker | Zigzag |
| Protector | Cian | `#00d4ff` | 🛡️ Shield | Hexágonos |

## Tipografía

```css
/* Títulos y elementos de impacto */
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Inter:wght@400;500;600;700&display=swap');

--font-display: 'Orbitron', sans-serif;
--font-body: 'Inter', sans-serif;

/* Escalas */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
```

## Animaciones y Efectos

### Glitch Effect (para saboteos/errores)
```css
@keyframes glitch {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}

.glitch-effect {
  animation: glitch 0.3s ease-in-out;
}
```

### Pulse Neon (para elementos activos)
```css
@keyframes pulse-neon {
  0%, 100% { 
    box-shadow: 0 0 5px var(--neon-green), 0 0 10px var(--neon-green-glow);
  }
  50% { 
    box-shadow: 0 0 20px var(--neon-green), 0 0 40px var(--neon-green-glow);
  }
}

.neon-pulse {
  animation: pulse-neon 2s ease-in-out infinite;
}
```

### Hold-to-Reveal Progress
```css
@keyframes hold-progress {
  from { width: 0%; }
  to { width: 100%; }
}

.hold-progress {
  animation: hold-progress 2.5s linear forwards;
}
```

## Componentes Base

### Button Neon
```css
.btn-neon {
  font-family: var(--font-display);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  border: 2px solid var(--neon-green);
  background: transparent;
  color: var(--neon-green);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.btn-neon:hover {
  background: var(--neon-green);
  color: var(--bg-void);
  box-shadow: 0 0 20px var(--neon-green-glow), 0 0 40px var(--neon-green-glow);
  transform: scale(1.02);
}

.btn-neon:active {
  transform: scale(0.98);
}
```

### Card Glass
```css
.card-glass {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-glow);
  border-radius: 1rem;
  padding: 1.5rem;
}

.card-glass--saboteur {
  border-color: var(--neon-red);
  box-shadow: 0 0 20px var(--neon-red-glow);
}

.card-glass--normal {
  border-color: var(--neon-green);
  box-shadow: 0 0 20px var(--neon-green-glow);
}
```

### Player Card
```css
.player-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.player-card--alive {
  border-color: var(--neon-green);
}

.player-card--dead {
  opacity: 0.5;
  filter: grayscale(1);
}

.player-card--saboteur {
  border-color: var(--neon-red);
  background: linear-gradient(135deg, var(--bg-card), rgba(255, 0, 60, 0.1));
}
```

### Timer Display
```css
.timer-display {
  font-family: var(--font-display);
  font-size: var(--text-5xl);
  color: var(--neon-green);
  text-shadow: 0 0 10px var(--neon-green-glow);
}

.timer-display--warning {
  color: var(--warning);
  animation: pulse-neon 0.5s ease-in-out infinite;
}

.timer-display--critical {
  color: var(--neon-red);
  animation: glitch 0.1s ease-in-out infinite;
}
```

## Tokens de Espaciado

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;      /* 48px */
```

## Tokens de Border Radius

```css
--radius-sm: 0.375rem;  /* 6px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;       /* 16px */
--radius-2xl: 1.5rem;   /* 24px */
--radius-full: 9999px;
```

## Responsive Breakpoints

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
```

## Stack de Componentes

1. **StartScreen** - Logo pulsante, botones de entrada
2. **PlayerSetup** - Selector de jugadores 5-10
3. **NameInput** - Registro de nombres
4. **RevealScreen** - Hold-to-reveal con cortina negra
5. **MissionScreen** - Misión activa con timer
6. **VoteScreen** - Votación secreta
7. **DiscussionScreen** - Timer + chat
8. **ExileScreen** - Votación de eliminación
9. **GameOverScreen** - Resultado final
