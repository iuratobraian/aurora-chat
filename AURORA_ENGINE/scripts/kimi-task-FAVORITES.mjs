# KIMI Task: Tabs de Notificaciones y Favoritos

## Objetivo
Agregar tabs al panel de notificaciones para alternar entre "Notificaciones" y "Favoritos".

## Archivos a modificar
1. `src/components/Notifications.tsx` - Agregar tabs y lógica de favoritos
2. `src/components/savedPosts.tsx` o similar - Ya existe savedPosts en Convex
3. `src/components/Navigation.tsx` - Pasar favoritos al panel de notificaciones

## Implementación
- Tabs: Notificaciones | Favoritos
- Notificaciones: Mantiene contenido actual
- Favoritos: Lista de posts guardados con opción de quitar favorito
- El corazón en el header abre directamente el panel con tabs
