# Design System - TradePortal 2025

## Tokens de Diseño (CSS Custom Properties)

Definidos en `index.css` línea 3-25:

### Colores

```css
/* Primarios */
--color-primary: #3b82f6;         /* Azul principal */
--color-signal-green: #00e676;     /* Verde señales/success */
--color-alert-red: #ff1744;        /* Rojo alertas/error */

/* Dark Mode */
--color-background-dark: #050608;  /* Fondo principal */
--color-card-dark: #0f1115;        /* Cards */
--color-border-dark: #1f2937;      /* Bordes */

/* Light Mode */
--color-background-light: #f8fafc; /* Fondo */
--color-card-light: #ffffff;        /* Cards */
--color-text-light-primary: #0f172a;   /* Texto principal */
--color-text-light-secondary: #475569;  /* Texto secundario */
```

### Tipografía

```css
--font-display: "Plus Jakarta Sans", sans-serif;  /* Títulos y UI */
--font-mono: "JetBrains Mono", "monospace";        /* Código y datos */
```

### Animaciones Custom

```css
--animate-pulse-slow: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
--animate-shimmer: shimmer 2s infinite;
--animate-spin-slow: spin 8s linear infinite;
--animate-spin-electric: spin-electric 2s linear infinite;
--animate-float: float 6s ease-in-out infinite;
--animate-blob: blob 10s infinite;
--animate-bounce-slow: bounce 6s ease-in-out infinite;
```

## Clases de Utilidad

### Glass Effect
```html
<div class="glass rounded-xl p-5 border border-white/10">
```

### Gradientes de Marca
```html
<!-- Azul/Índigo -->
<div class="bg-gradient-to-br from-blue-700 via-indigo-800 to-black">

<!-- Emerald/Éxito -->
<div class="bg-gradient-to-br from-emerald-500/10 to-transparent">

<!-- Purple/Premium -->
<div class="bg-gradient-to-br from-purple-500/10 to-transparent">
```

### Material Symbols
```html
<span class="material-symbols-outlined text-primary">icon_name</span>
```

## Colores Semánticos

| Propósito | Color | Variable |
|-----------|-------|----------|
| Primary/CTA | `#3b82f6` | `text-primary` |
| Success/Signal | `#00e676` | `text-signal-green` |
| Error/Alert | `#ff1744` | `text-alert-red` |
| Background | `#050608` | `bg-background-dark` |
| Card | `#0f1115` | `bg-card-dark` |
| Border | `#1f2937` | `border-border-dark` |

## Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px
- XL: > 1280px

## Reglas de Implementación

1. **Usar tokens CSS** en lugar de colores hardcodeados
2. **Glass effect** para cards y modales
3. **Material Symbols** para iconografía
4. **Animaciones** con prefijos `animate-`
5. **Dark mode first** - diseño oscuro por defecto
