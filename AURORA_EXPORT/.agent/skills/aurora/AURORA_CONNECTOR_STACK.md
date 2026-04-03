# Aurora Connector Stack

## Objetivo

Dar a Aurora una base de conectores externos de alto retorno para buscar conocimiento rapido y operar con herramientas modernas sin depender solo de memoria local.

## APIs prioritarias

- `Brave Search`
  - busqueda web viva
  - muy util para documentacion, noticias y paginas publicas
- `Tavily`
  - research orientado a IA
  - sintetizacion rapida y foco en señal
- `SerpAPI`
  - alternativa general para resultados enriquecidos
- `OpenRouter`
  - capa de modelos externos
  - util para sumar agentes sin cargar infraestructura propia
- `Groq`
  - respuestas rapidas y de bajo costo
- `Ollama`
  - modelo local para trabajo diario desde terminal y chat
- `Codex`
  - agente local de desarrollo y puerta a `Codex Cloud`
- `OpenCode`
  - agente local externo para apoyo desde terminal

## MCP prioritarios

- `GitHub MCP`
  - repositorios, PRs, issues, checks
- `Playwright MCP`
  - navegador, smoke tests y validacion real
- `Filesystem MCP`
  - operacion local controlada
- `Brave Search MCP`
  - investigacion web integrada a Aurora

## Agentes locales y cloud

- `Ollama`
  - consulta directa desde Aurora con `/ollama <prompt>`
- `Codex`
  - ejecucion no interactiva con `/codex <prompt>`
  - tareas cloud con `/codex-cloud`
- `OpenCode`
  - deteccion local y uso como apoyo externo desde consola

## Regla dura

No existe un server infalible.

La arquitectura correcta es:

- varios conectores
- fallback
- observabilidad
- scope claro
- ninguna dependencia unica para todo

## Activacion

- completar `.env.aurora`
- usar `npm run aurora:conectores`
- verificar que Aurora detecte los conectores activos antes de depender de ellos

## Fuentes oficiales

- MCP spec y docs: https://github.com/modelcontextprotocol/modelcontextprotocol
- MCP TypeScript SDK: https://github.com/modelcontextprotocol/typescript-sdk
- GitHub MCP docs: https://docs.github.com/en/copilot/concepts/context/mcp
- Reference servers: https://github.com/docker/mcp-servers
