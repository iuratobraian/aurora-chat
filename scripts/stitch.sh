#!/bin/bash
# Stitch Designer Agent - Quick Commands

COMMAND=$1
shift

case "$COMMAND" in
    init)
        echo "🎨 Inicializando Stitch Designer Agent..."
        npx @_davideast/stitch-mcp init
        ;;
    design)
        echo "🎨 Diseñando componente: $@"
        npx @_davideast/stitch-mcp view --projects
        ;;
    preview)
        echo "🎨 Previsualizando proyecto: $@"
        npx @_davideast/stitch-mcp serve -p "$@"
        ;;
    projects)
        echo "🎨 Proyectos disponibles:"
        npx @_davideast/stitch-mcp view --projects
        ;;
    doctor)
        echo "🎨 Verificando configuración..."
        npx @_davideast/stitch-mcp doctor
        ;;
    proxy)
        echo "🎨 Iniciando proxy MCP para agentes..."
        npx @_davideast/stitch-mcp proxy
        ;;
    help)
        cat << 'EOF'
🎨 Stitch Designer Agent Commands:

  init      - Inicializar autenticación Stitch
  design    - Diseñar nuevo componente
  preview   - Previsualizar proyecto
  projects  - Listar proyectos disponibles
  doctor   - Diagnosticar configuración
  proxy    - Iniciar proxy MCP
  help     - Mostrar esta ayuda

Ejemplo: ./stitch.sh design "trading card component"
EOF
        ;;
    *)
        echo "🎨 Stitch Designer Agent"
        echo "Usa './stitch.sh help' para ver comandos disponibles"
        ;;
esac
