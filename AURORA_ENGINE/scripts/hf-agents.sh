#!/bin/bash
# HuggingFace Agents CLI - Aurora Integration
# Uso: ./hf-agents.sh [comando] [parametros]

COMMAND=${1:-help}
QUERY=${2:-""}

show_help() {
    echo ""
    echo "🤖 HF Agents CLI - Comandos disponibles"
    echo "=========================================="
    echo ""
    echo "search <texto>     - Buscar en la web (usa smolagents)"
    echo "research <tema>   - Investigación profunda multi-agente"
    echo "scrape <url>      - Scrapear website a markdown"
    echo "kg <url>          - Construir grafo de conocimiento desde URL"
    echo "workflow <nombre> - Crear/ejecutar workflow"
    echo "agent             - Abrir interfaz chat de agente"
    echo "computer          - Abrir computer use agent"
    echo ""
    echo "Ejemplos:"
    echo "  ./hf-agents.sh search 'últimas noticias trading crypto'"
    echo "  ./hf-agents.sh research 'mejores estrategias trading 2026'"
    echo "  ./hf-agents.sh scrape 'https://example.com'"
    echo "  ./hf-agents.sh kg 'https://docs.python.org'"
    echo "  ./hf-agents.sh agent"
    echo ""
}

smolagent_search() {
    if [[ -z "$QUERY" ]]; then
        echo "⚠️ Uso: $0 search <texto>"
        exit 1
    fi
    
    echo "🔍 Ejecutando agente: $QUERY"
    
    python3 -c "
from smolagents import CodeAgent, DuckDuckGoSearchTool, InferenceClientModel
model = InferenceClientModel()
agent = CodeAgent(tools=[DuckDuckGoSearchTool()], model=model)
result = agent.run('$QUERY')
print(result)
" 2>/dev/null || echo "⚠️ Instale smolagents: pip install smolagents[toolkit]"
}

open_agent_ui() {
    echo "🌐 Abriendo Agent UI..."
    xdg-open "https://huggingface.co/spaces/lvwerra/agent-ui" 2>/dev/null || \
    open "https://huggingface.co/spaces/lvwerra/agent-ui" 2>/dev/null || \
    echo "Abra en navegador: https://huggingface.co/spaces/lvwerra/agent-ui"
}

open_computer_agent() {
    echo "💻 Abriendo Computer Use Agent..."
    xdg-open "https://huggingface.co/spaces/smolagents/computer-use-agent" 2>/dev/null || \
    open "https://huggingface.co/spaces/smolagents/computer-use-agent" 2>/dev/null || \
    echo "Abra en navegador: https://huggingface.co/spaces/smolagents/computer-use-agent"
}

scrape_url() {
    if [[ -z "$QUERY" ]]; then
        echo "⚠️ Uso: $0 scrape <url>"
        exit 1
    fi
    
    echo "🕷️ Scraping: $QUERY"
    echo "💡 Use el Space: https://huggingface.co/spaces/Agents-MCP-Hackathon/web-scraper"
    
    curl -s "$QUERY" | head -c 2000
}

case $COMMAND in
    search)
        smolagent_search
        ;;
    research)
        echo "📚 Investigando: $QUERY"
        echo "💡 Use: https://huggingface.co/spaces/Agents-MCP-Hackathon/multi-agent_deep-research"
        ;;
    scrape)
        scrape_url
        ;;
    kg)
        echo "🧠 Knowledge Graph: $QUERY"
        echo "💡 Use: https://huggingface.co/spaces/Agents-MCP-Hackathon/KGB-mcp"
        ;;
    workflow)
        echo "⚙️ Workflow: $QUERY"
        echo "💡 Use: https://huggingface.co/spaces/Agents-MCP-Hackathon/gradio_workflowbuilder"
        ;;
    agent)
        open_agent_ui
        ;;
    computer)
        open_computer_agent
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "⚠️ Comando desconocido: $COMMAND"
        show_help
        ;;
esac
