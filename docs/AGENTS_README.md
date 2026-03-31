# HuggingFace Agents - Aurora Integration

Este documento describe los 10 agentes de HuggingFace Spaces integrados al sistema Aurora.

## Uso desde Terminal

### Windows (PowerShell)
```powershell
.\scripts\hf-agents.ps1 search "noticias crypto"
.\scripts\hf-agents.ps1 research "estrategias trading"
.\scripts\hf-agents.ps1 scrape "https://ejemplo.com"
.\scripts\hf-agents.ps1 agent
.\scripts\hf-agents.ps1 computer
```

### Linux/Mac (Bash)
```bash
./scripts/hf-agents.sh search "noticias crypto"
./scripts/hf-agents.sh research "estrategias trading"
./scripts/hf-agents.sh scrape "https://ejemplo.com"
./scripts/hf-agents.sh agent
./scripts/hf-agents.sh computer
```

### Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `search <texto>` | Buscar en la web (smolagents) |
| `research <tema>` | Investigación profunda |
| `scrape <url>` | Scrapear website a markdown |
| `kg <url>` | Construir grafo de conocimiento |
| `workflow <nombre>` | Crear/ejecutar workflow |
| `agent` | Abrir interfaz chat |
| `computer` | Abrir computer use agent |

## Instalación

### Instalación Automática

```powershell
.\scripts\install-agents.ps1
```

### Instalación Manual

**Python (smolagents framework):**
```bash
pip install smolagents[toolkit]
```

**Node.js (MCP servers):**
```bash
npx -y @agents-mcp-hackathon/web-scraper
npx -y @agents-mcp-hackathon/knowledge-graph-builder
npx -y @agents-mcp-hackathon/multi-agent-deep-research
npx -y @agents-mcp-hackathon/workflow-builder
npx -y @agents-mcp-hackathon/file-converter
```

## Agentes Disponibles

### 1. hf_smolagents - Framework Principal
- **Tipo:** Agent Framework
- **Stars:** 30,000+
- **Instalación:** `pip install smolagents[toolkit]`
- **Uso:**
```python
from smolagents import CodeAgent, InferenceClientModel, DuckDuckGoSearchTool

model = InferenceClientModel()
agent = CodeAgent(tools=[DuckDuckGoSearchTool()], model=model)
result = agent.run("Tu tarea aquí")
```

### 2. hf_computer_use_agent - Computer Use
- **Tipo:** Computer Use Agent
- **Space:** https://huggingface.co/spaces/smolagents/computer-use-agent
- **Uso:** Agente que controla el navegador como humano (clicks, typing, navegación)
- **Ideal para:** Automatización web, testing, scraping dinámico

### 3. hf_agent_ui - Interfaz Chat
- **Space:** https://huggingface.co/spaces/lvwerra/agent-ui
- **Uso:** Chat UI para ejecutar agentes especializados

### 4. hf_web_scraper_mcp - Web Scraping
- **Tipo:** MCP Server
- **Instalación:** `npx @agents-mcp-hackathon/web-scraper`
- **Herramientas:**
  - `scrape_website` - Extrae website como markdown
  - `download_content` - Descarga contenido estructurado

### 5. hf_knowledge_graph_mcp - Knowledge Graphs
- **Tipo:** MCP Server
- **Instalación:** `npx @agents-mcp-hackathon/knowledge-graph-builder`
- **Herramientas:**
  - `text_to_graph` - Convierte texto a grafo
  - `webpage_to_graph` - Extrae grafo de URLs
  - `query_graph` - Consulta el grafo

### 6. hf_deep_research - Research Agent
- **Tipo:** MCP Server
- **Instalación:** `npx @agents-mcp-hackathon/multi-agent-deep-research`
- **Herramientas:**
  - `research_topic` - Investiga tema en profundidad
  - `synthesize_findings` - Sintetiza resultados
  - `generate_report` - Genera reporte final

### 7. hf_fish_agent - Voice Agent
- **Space:** https://huggingface.co/spaces/fishaudio/fish-agent
- **Uso:** Agente conversacional con voz (Text-to-Speech + Speech-to-Text)

### 8. hf_workflow_builder - Workflow Automation
- **Tipo:** MCP Server
- **Space:** https://huggingface.co/spaces/Agents-MCP-Hackathon/gradio_workflowbuilder
- **Herramientas:**
  - `create_workflow` - Crea workflow visual
  - `execute_pipeline` - Ejecuta pipeline
  - `schedule_tasks` - Agenda tareas

### 9. hf_file_converter - File Converter
- **Tipo:** MCP Server
- **Space:** https://huggingface.co/spaces/Agents-MCP-Hackathon/universal-file-converter
- **Herramientas:**
  - `convert_file` - Convierte entre formatos
  - `batch_convert` - Conversión por lotes

### 10. hf_first_agent_template - Template
- **Space:** https://huggingface.co/spaces/agents-course/First_agent_template
- **Uso:** Template para crear nuevos agentes rápidamente

## Integración con Aurora

### Configuración de Entorno

Crea o actualiza `.env` con:

```env
# HuggingFace (opcional para modelos premium)
HF_TOKEN=hf_xxxxxxxxxxxxx

# Ollama (modelos locales)
OLLAMA_BASE_URL=http://localhost:11434

# API Keys para agentes
OPENAI_API_KEY=sk-xxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### Uso Programático

```javascript
// Ejemplo: Usar smolagents desde Node.js
const { execSync } = require('child_process');

function runAgent(task) {
  const result = execSync(
    `python -c "
from smolagents import CodeAgent, DuckDuckGoSearchTool
agent = CodeAgent(tools=[DuckDuckGoSearchTool()])
print(agent.run('${task}'))
"`,
    { encoding: 'utf8' }
  );
  return result;
}

// Research agent
const researchResult = runAgent('Investiga las últimas tendencias en trading de crypto');
```

## Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `HF_TOKEN` | Token de HuggingFace para modelos premium |
| `OLLAMA_BASE_URL` | URL de Ollama para modelos locales |
| `OPENAI_API_KEY` | API key de OpenAI |
| `ANTHROPIC_API_KEY` | API key de Anthropic |

## Troubleshooting

### "Python not found"
Instala Python desde https://www.python.org/downloads/

### "Node.js not found"
Instala Node.js desde https://nodejs.org/

### "Module not found"
```bash
pip install --upgrade smolagents
```

### Errores de permisos (Windows)
Ejecuta PowerShell como administrador o usa:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Links Útiles

- [smolagents Documentation](https://huggingface.co/docs/smolagents)
- [smolagents GitHub](https://github.com/huggingface/smolagents)
- [HuggingFace Spaces](https://huggingface.co/spaces)
- [MCP Hackathon](https://huggingface.co/spaces/Agents-MCP-Hackathon)
