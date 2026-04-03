# HISTORIAL DE FALLOS CRÍTICOS (NUNCA MÁS)

Este documento es una base de datos de errores graves que han ocurrido en el pasado. Es **OBLIGATORIO** consultarlo para asegurar que ninguna "mejora" sea en realidad un retroceso o una falla.

---

## 🛑 FALLOS DE INFRAESTRUCTURA

### 1. Desconexión de Base de Datos (Convex 401)
- **Error**: El sistema dejaba de funcionar porque la `CONVEX_DEPLOY_KEY` expiraba o no estaba en `.env.local`.
- **Regla Inmutable**: Antes de cualquier tarea de backend, ejecutar `node scripts/check-db.mjs`. No operar a ciegas.

### 2. Pérdida de Claves Notion
- **Error**: Agentes externos sin acceso a las tareas reales por falta de `NOTION_API_KEY`.
- **Regla Inmutable**: Ejecutar `node scripts/aurora-sync-secrets.mjs` para asegurar que el repositorio tiene las claves necesarias en GitHub Secrets (si aplica) o que tu entorno local está al día.

---

## 🛑 FALLOS DE LÓGICA Y CÓDIGO

### 3. Mismatch de Contrato Frontend/Backend
- **Error**: Modificar una mutación en Convex sin actualizar el servicio en el Frontend, rompiendo la aplicación.
- **Regla Inmutable**: Todo cambio en `convex/*.ts` debe ir acompañado de una actualización en `src/services/` y una verificación de tipos (`npm run lint`).

### 4. Uso de localStorage como Base de Datos
- **Error**: Guardar configuraciones críticas que deben ser compartidas (como estados de Admin) en el navegador local.
- **Regla Inmutable**: Si el dato debe ser visto por otros agentes o usuarios, **DEBE IR A CONVEX**. Prohibido usar `localStorage` para datos globales.

---

## 🛑 FALLOS DE PRODUCTIVIDAD (REDUNDANCIA)

### 5. Trabajo Duplicado (Drifting)
- **Error**: Dos agentes trabajando en el mismo archivo porque no leyeron lo que el anterior ya marcó como `done`.
- **Regla Inmutable**: Leer `pasado.md` y actualizar `TASK_BOARD.md` al **inicio** y al **final** de cada tarea.

---
**JEFE DE EQUIPO: "LAS MEJORAS DEBEN SER MEJORAS, NO FALLAS."**
