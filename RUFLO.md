# Ruflo - AI Agent Orchestration

## Configuración

Ruflo ya está configurado como servidor MCP en `.mcp.json`. Para usar Ruflo:

### Instalación Manual (si es necesario)
```bash
npm install -g ruflo
```

### Comandos Disponibles

```bash
# Inicializar ruflo en el proyecto
npm run ruflo:init

# Listar agentes disponibles
npm run ruflo:agents

# Iniciar swarm mode
npm run ruflo:swarm

# Ver estado de ruflo
npm run ruflo:status
```

### Uso Directo con npx

```bash
# Usar un agente específico
npx ruflo@latest agent use coder "implementar autenticación"

# Crear un equipo de agentes
npx ruflo@latest swarm "construir API REST" --agents coder,tester,reviewer

# Ver herramientas MCP disponibles
npx ruflo@latest tools list
```

## Agentes Disponibles (60+)

- **coder** - Implementación de código
- **tester** - Testing y QA
- **reviewer** - Code review
- **architect** - Diseño de arquitectura
- **researcher** - Investigación
- **coordinator** - Orquestación de equipos

## Más Información

- [Documentación de Ruflo](https://github.com/ruvnet/ruflo)
- [Agent System Overview](https://github.com/ruvnet/ruflo/wiki/Agent-System-Overview)
- [Agent Usage Guide](https://github.com/ruvnet/ruflo/wiki/Agent-Usage-Guide)
