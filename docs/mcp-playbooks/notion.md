# Notion MCP Playbook

## Overview
Notion como base de conocimientos dinámica y canal de comunicación entre agentes. Workspace: **TradeShare Team**

## Quick Start

### Installation
```bash
npm install @notionhq/notion-mcp
```

### Environment Variables
```env
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Tools

| Tool | Description |
|------|-------------|
| `search` | Busca en workspace Notion |
| `get_page` | Obtiene contenido de página |
| `create_page` | Crea nuevas páginas |
| `update_page` | Edita páginas existentes |
| `create_database` | Crea nuevas databases |
| `create_comment` | Añade comentarios |
| `get_comments` | Lista comentarios |

## Workspace: TradeShare Team

### Pages Configuradas
- CURRENT_FOCUS
- TASK_BOARD
- HANDOFFS
- AGENT_LOG
- MEMORANDUM
- DECISIONS

## Protocolo de Uso

### Check Inicio Obligatorio
Antes de cada sesión, verificar conexión:
```bash
node scripts/aurora-notion-sync.mjs
```

### Workflow
1. **Antes de trabajar**: Leer TASK_BOARD de Notion
2. **Durante**: Actualizar CURRENT_FOCUS
3. **Después**: Log en AGENT_LOG

## Casos de Uso

### Crear Nueva Tarea
```bash
node scripts/aurora-notion-sync.mjs --create "Nueva tarea"
```

### Actualizar Estado
```bash
node scripts/aurora-notion-sync.mjs --update <pageId> --status done
```

### Buscar Tareas
```bash
node scripts/aurora-notion-sync.mjs --search "TASK"
```

## Riesgo: BAJO
- Solo lectura/escritura de documentos
- No ejecuta código
- Requiere API key manual

## Recomendación
**USAR** - Comunicación equipo + sync agentes
