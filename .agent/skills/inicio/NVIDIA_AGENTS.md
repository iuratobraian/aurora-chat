# NVIDIA Agents - Skill de Integración Aurora Nexus

## Propósito
Este skill permite usar los agentes NVIDIA (Kimi, DeepSeek, MiniMax, GLM-5) como parte del proyecto Aurora Nexus con inicialización temprana.

---

## Estructura de Skills

```
src/skills/
├── index.ts          # Exporta todos los skills
├── kimi.skill.ts     # Agente Kimi K2
├── deepseek.skill.ts # Agente DeepSeek V3.2
├── minimax.skill.ts  # Agente MiniMax M2.5
└── glm5.skill.ts     # Agente GLM-5
```

---

## Modelos Disponibles

| Skill | Modelo | Especialidad |
|-------|--------|--------------|
| **kimi** | moonshotai/kimi-k2-instruct | Coding, análisis |
| **deepseek** | deepseek-ai/deepseek-v3.2 | Razonamiento, código |
| **minimax** | minimaxai/minimax-m2.5 | Análisis, estrategia |
| **glm5** | z-ai/glm5 | Coding, creatividad |

---

## Cómo Usar

### CLI (Node.js)
```bash
# Ver ayuda
node scripts/nvidia-agent.mjs help

# Iniciar agente
node scripts/nvidia-agent.mjs kimi start
node scripts/nvidia-agent.mjs deepseek start
node scripts/nvidia-agent.mjs minimax start
node scripts/nvidia-agent.mjs glm5 start

# Probar conexión
node scripts/nvidia-agent.mjs kimi test
```

### Terminal PowerShell
```powershell
# Abrir todos los agentes
scripts\start-all-nvidia-agents.ps1

# O individualmente
scripts\chat-kimi.ps1
scripts\chat-deepseek.ps1
scripts\chat-minimax.ps1
scripts\chat-glm5.ps1
```

### En Código (Eager Loading)
```typescript
import { initAllSkills, nvidiaAgents } from './skills';

// Inicializar todos los agentes al arranque
initAllSkills();

// Usar un agente específico
const kimi = nvidiaAgents.kimi;
kimi.init();
kimi.run();
```

---

## Comandos en Terminal

| Comando | Descripción |
|---------|-------------|
| `inicio` | Ejecutar protocolo Aurora |
| `read <archivo>` | Leer archivo del proyecto |
| `ls <carpeta>` | Listar archivos |
| `run <comando>` | Ejecutar comando npm |
| `exit` | Salir |
| `clear` | Limpiar historial |
| `help` | Mostrar ayuda |

---

## API Key

La API key está configurada en: `.env.nvidia`

---

## Integración con `inicio`

Los agentes NVIDIA están disponibles para usar desde el protocolo de inicio de Aurora Nexus. Simply escribe el nombre del agente para abrir su terminal.

---

## Benchmarks

| Modelo | Coding | Reasoning | Context |
|--------|--------|-----------|---------|
| Kimi K2 | Alto | Medio | 128K |
| DeepSeek V3.2 | Alto | Alto | 64K |
| MiniMax M2.5 | Alto | Alto | 205K |
| GLM-5 | Alto | Medio | 200K |

---

## Inicialización Temprana

Para cargar los skills al iniciar el proyecto, el archivo de entrada (main.ts o server.ts) debe importar:

```typescript
import { initAllSkills } from './skills';

// Llamar al inicio
initAllSkills();

// Continuar con el resto del app...
```
