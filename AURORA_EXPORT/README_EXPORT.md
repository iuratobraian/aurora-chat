# 🌊 AURORA - Paquete de Exportación (v1.0.0)

Este paquete contiene todo lo necesario para integrar a **Aurora** (el AI Framework y el Protocolo de Agente) en un nuevo proyecto.

## 📁 Contenido del Paquete

1.  **`aurora/`**: El núcleo del framework. Contiene el daemon, la API local, el sistema de memoria y los conectores MCP.
2.  **`.agent/`, `.agente/`, `.agents/`**: Instrucciones, "skills", workflows y prompts especializados para que la IA actúe como Aurora.
3.  **`AGENTS.md`**: El "Core Protocol". Es el archivo más importante que define las reglas de comportamiento del agente (OBLITERATUS, AMM).
4.  **`TASK_BOARD.md`, `AGENT_LOG.md`, `CURRENT_FOCUS.md`**: El sistema de tracking de tareas y progreso.
5.  **`scripts/`**: Scripts de sincronización con Notion y GitHub.
6.  **`.env.aurora.example`**: Plantilla para las variables de entorno.

---

## 🚀 Instrucciones de Instalación

### 1. Preparación del nuevo proyecto
Copia todo el contenido de esta carpeta (`AURORA_EXPORT`) a la raíz de tu nuevo proyecto.

### 2. Instalación de dependencias
Asegúrate de instalar las dependencias necesarias para el framework:
```bash
cd aurora
npm install
```

### 3. Configuración de Entorno
Crea un archivo `.env.aurora` basado en el ejemplo:
```powershell
copy .env.aurora.example .env.aurora
```
Añade tus API Keys (Groq, NVIDIA, OpenRouter, etc.). Si usas Notion para tareas, añade también el ID de tu base de datos.

### 4. Primer Inicio
Ejecuta el script de inicio para que el agente reconozca el nuevo entorno:
```bash
node scripts/aurora-inicio.mjs
```

### 5. Cómo comunicarte con Aurora
A partir de ahora, cuando hables con tu asistente de IA (Claude, Cursor, etc.), dile:
> "Lee el archivo `AGENTS.md` y las carpetas `/.agent/` para entender tu identidad y protocolos. Revisa el `TASK_BOARD.md` para ver las tareas actuales."

---

## 🛠️ Comandos Principales (desde la raíz)

- `npm run inicio`: Inicia la sesión de Aurora y carga contexto de Notion.
- `npm run aurora:api`: Inicia el servidor de API local de Aurora (puerto 4310).
- `npm run aurora:shell`: Abre la terminal interactiva con Aurora.
- `npm run aurora:daemon`: Activa el modo "siempre encendido".

---
*Que la fuerza de la Gravedad de Aurora impulse tu nuevo proyecto.* 🌊🚀
