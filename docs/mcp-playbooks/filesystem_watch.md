# Filesystem Watch MCP Playbook

## Overview
Monitor de cambios en archivos del repo. Detecta automáticamente cuando archivos clave cambian y actualiza el contexto de Aurora.

## Quick Start

### Installation
```bash
go install github.com/ipiton/filesystem-watch-mcp/cmd/fs-watch-mcp@latest
```

### Usage
```bash
fs-watch-mcp --watch . --ignore node_modules
```

## Tools

| Tool | Description |
|------|-------------|
| `watch_directory` | Monitorea directorio por cambios |
| `list_watches` | Lista watches activos |
| `stop_watch` | Detiene un watch |

## Casos de Uso

### Integration con Aurora
- Auto-actualizar contexto cuando cambia código
- Detectar cambios en archivos de coordinación
- Trigger rebuild de índice de código

## Riesgo: BAJO
- Solo监控文件系统
- No ejecuta ni modifica archivos
- Solo lectura de cambios

## Recomendación
**PENDING** - Dependiente de Go + ipiton ecosystem
