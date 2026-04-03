# 🎨 Skill: Guía de Estructura Visual Premium (TradePortal)

Este Skill define el estándar visual mandatory para toda la plataforma TradePortal, basado en el diseño del dashboard de "Salud del Servidor". Todos los nuevos componentes y vistas deben seguir estas reglas para mantener la estética premium.

## 🏛️ Principios de Diseño
1.  **Glassmorphism Profundo**: Utilizar siempre la clase `.glass` con fondo `bg-black/40` y `backdrop-blur-[24px]`.
2.  **Identidad "Electric"**: Incorporar anillos animados (`spin-electric`) y pulsos de color `primary` en elementos clave como avatares y botones de acción.
3.  **Tipografía Black**: Los títulos deben ser `font-black`, en `uppercase` y con un `tracking-widest` ligero.
4.  **Paleta de Colores**:
    *   Fondo Base: `#050608`
    *   Tarjetas: `#0f1115` con transparencia.
    *   Acento Primario: `#3b82f6` (Blue).
    *   Estados: `emerald-500` (Compra/Estable), `red-500` (Venta/Alerta).

## 🧩 Componentes Base

### 1. Contenedores (Glass Card)
```tsx
<div className="glass rounded-[2rem] p-6 border border-white/5 bg-black/40 relative overflow-hidden shadow-2xl">
    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] pointer-events-none" />
    {/* Contenido */}
</div>
```

### 2. Indicadores de Estado (Estilo Salud del Servidor)
Utilizar anillos rotatorios alrededor de iconos clave:
```tsx
<div className="relative size-10 flex items-center justify-center shrink-0">
    <div className="absolute inset-[-4px] rounded-full border-[2px] border-transparent border-t-primary animate-spin-electric opacity-80" />
    <div className="size-8 bg-black rounded-full border border-white/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-primary text-sm">database</span>
    </div>
</div>
```

### 3. Publicaciones (PostCard Top Version)
*   **Zonas Operativas**: Bordes de color según tipo (Compra/Venta), con fondo `bg-black/40` para los datos numéricos.
*   **TradingView**: Integrar siempre que haya una URL de gráfico disponible para una experiencia analítica superior.

## 🚀 Animaciones Mandatory
*   `animate-spin-electric`: Para cargadores y estados activos.
*   `animate-pulse-slow`: Para verificaciones y estados de conexión.
*   `animate-shimmer`: Para estados de carga y pins destacados.

---
💡 **Consigna:** Si una vista no se siente "viva" o "transparente", no cumple con el estándar de TradePortal. Revisa siempre la sección de "Administración -> Salud del Servidor" como referencia máxima de UI/UX.
