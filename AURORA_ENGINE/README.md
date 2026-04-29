# 🧠 Aurora Engine Standalone

Aurora Engine es un framework de IA "always-on" diseñado para potenciar equipos de desarrollo. Esta versión independiente (Standalone) permite integrar el poder de Aurora, Gemma y DeepSeek en cualquier proyecto de software.

## 🚀 Inicio Rápido

1. **Requisitos**: Node.js v20+ y PowerShell (para scripts de automatización).
2. **Configuración**:
   - Copia el archivo `.env.aurora` (o renombra `.env.aurora.example`) y completa tus API Keys.
   - Groq, OpenRouter, Gemini y NVIDIA son los proveedores recomendados.
3. **Instalación**:
   ```bash
   npm run setup
   ```
4. **Despertar a Aurora**:
   ```bash
   npm run inicio
   ```

## 🛠️ Accesorios Incluidos

- **Gemma-4**: El estratega. Úsalo para briefings de tareas y auditorías de calidad.
- **DeepSeek V4 Pro**: El auditor de lógica profunda. Ideal para revisiones de seguridad y optimización compleja.
- **Kimi K2.5**: El arquitecto. Generación de código de alta precisión vía NVIDIA API.
- **Neural Vault**: Sistema de gestión de conocimiento basado en Obsidian (carpeta `vault/`).
- **Always-on Daemon**: Un proceso en segundo plano que monitorea el proyecto y asiste proactivamente.

## 📂 Estructura del Motor

- `aurora/`: Núcleo del framework y lógica de agentes.
- `gemma/`: CLI y perfiles de estrategia.
- `deepseek/`: Scripts de auditoría profunda.
- `vault/`: Base de conocimiento neural (TODO lo que el equipo aprende se guarda aquí).
- `scripts/`: Colección de herramientas de automatización.
- `lib/`: Librerías compartidas (memoria, indexadores).

## 🔌 Cómo usar en un nuevo proyecto

Para "conectar" este motor a un nuevo proyecto:
1. Copia la carpeta `AURORA_ENGINE` a la raíz de tu nuevo proyecto (o mantenla en una ubicación global).
2. Asegúrate de que el archivo `.env.aurora` tenga las rutas correctas si decides moverlo.
3. Ejecuta `npm run inicio` desde la carpeta del motor mientras trabajas en tu proyecto.
4. Aurora escaneará el contexto del directorio de trabajo actual.

## 🛡️ Protocolos (AGENTS.md)

Este motor opera bajo el protocolo **amm (Aurora Mente Maestra)**. Consulta `AGENTS.md` para conocer las reglas de oro, los ciclos de revisión y los estándares de ingeniería de nivel mundial integrados.

---
*Desarrollado por el equipo de Advanced Agentic Coding de Google Deepmind.*
