# 🗺️ TRADE SHARE: REPOSITORY MAP
*Guía Galáctica de Arquitectura y Navegación*

Este mapa define la ubicación y el propósito de cada componente del ecosistema TradeShare. Mantener este orden es **OBLIGATORIO** para la salud del enjambre.

---

## 🏗️ ARQUITECTURA DE CARPETAS

### 🧠 .agent / .agents / .agente
El **Cerebro del Proyecto**. Aquí reside la red neural de los agentes:
- **brain/vault/**: Bóveda de seguridad para logs pesados, memorias comprimidas y reportes históricos.
- **brain/knowledge/**: Artículos de maestría e inteligencia adquirida.
- **workspace/coordination/**: El centro de mando (Task Board, Team Chat, Pasado).
- **skills/**: Capacidades técnicas modulares de los agentes.

### 🌐 Ecosistema Web (Frontend)
- **src/components/**: Átomos y moléculas de la interfaz (Botones, Modales, Cards).
- **src/views/**: Las páginas completas de la aplicación (Navigation, Perfil, Marketplace).
- **src/services/**: Lógica de comunicación con APIs externas e integración con Convex.
- **public/**: Assets estáticos (Images, Logos, PWA icons).

### ⚡ Serverless Backend (Convex)
- **convex/**: El motor de datos en tiempo real.
- **convex/schema.ts**: El contrato de base de datos definitivo.
- **convex/*.ts**: Endpoints de `query` y `mutation`.

### ⚙️ Operaciones y Automatización
- **scripts/**: Herramientas de mantenimiento (`aurora-inicio`, `check-db`, `audit-functions`).
- **docs/**: Documentación técnica, playbooks y este mapa.
- **android / capacitor**: Configuración para despliegue mobile híbrido.

---

## 🛠️ FLUJO DE TRABAJO (SOT)

1. **BACKEND FIRST:** Todo dato nace en `convex/schema.ts`.
2. **SERVICE LAYER:** Se crea el puente en `src/services/`.
3. **UI INTEGRATION:** Se consume en `src/views/` usando hooks oficiales.
4. **CERO RUIDO:** Si un reporte o log ya no es útil, se mueve a la **Bóveda** (`vault`).

---

## 🚨 REGLAS DE ORO
- **NO TOCAR ROOT:** La raíz del proyecto debe estar limpia (solo archivos de config esenciales).
- **NO HARDCODING:** Todo estado debe ser reactivo a Convex o servicios autorizados.
- **AUDITORÍA CONTINUA:** Si creas una función en el backend, DEBE tener su representación en el frontend.

---
**ORDEN | PRECISIÓN | CRECIMIENTO**
