#!/bin/bash

# Aurora Research Orchestrator
# Bridge between Aurora (Node.js/Agent) and NotebookLM (Python)

VENV_PATH="/home/biurato/Documentos/tradeshare/trade-share/.aurora-venv"
PYTHON_BIN="$VENV_PATH/bin/python3"
NOTEBOOKLM_BIN="$VENV_PATH/bin/notebooklm"

if [ ! -d "$VENV_PATH" ]; then
    echo "❌ Error: Entorno virtual no encontrado en $VENV_PATH"
    echo "Ejecuta primero la configuración inicial de Aurora."
    exit 1
fi

case "$1" in
    "setup")
        echo "🔄 Configurando entorno de investigación..."
        python3 -m venv "$VENV_PATH"
        source "$VENV_PATH/bin/activate"
        pip install --upgrade pip
        pip install -r requirements-aurora.txt
        playwright install chromium
        echo "✅ Entorno listo."
        ;;
    "login")
        echo "🔑 Iniciando sesión en Google NotebookLM..."
        source "$VENV_PATH/bin/activate"
        notebooklm login
        ;;
    "query")
        shift
        source "$VENV_PATH/bin/activate"
        notebooklm "$@"
        ;;
    *)
        echo "Uso: $0 {setup|login|query [args...]}"
        echo "Ejemplo: $0 query create 'Mi Notebook'"
        exit 1
        ;;
esac
