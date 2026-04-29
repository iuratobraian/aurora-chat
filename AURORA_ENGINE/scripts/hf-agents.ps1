# HuggingFace Agents CLI - Aurora Integration
# Uso: .\scripts\hf-agents.ps1 [comando] [parametros]

param(
    [Parameter(Position=0)]
    [ValidateSet("search", "research", "scrape", "kg", "workflow", "help")]
    [string]$Command = "help",
    
    [Parameter(Position=1)]
    [string]$Query = ""
)

$ErrorActionPreference = "Continue"

function Show-Help {
    Write-Host @"

🤖 HF Agents CLI - Comandos disponibles
==========================================

search <texto>     - Buscar en la web (usa smolagents)
research <tema>   - Investigación profunda multi-agente
scrape <url>      - Scrapear website a markdown
kg <url>          - Construir grafo de conocimiento desde URL
workflow <nombre> - Crear/ejecutar workflow
agent             - Abrir interfaz chat de agente
computer          - Abrir computer use agent

Ejemplos:
  .\scripts\hf-agents.ps1 search "últimas noticias trading crypto"
  .\scripts\hf-agents.ps1 research "mejores estrategias trading 2026"
  .\scripts\hf-agents.ps1 scrape "https://example.com"
  .\scripts\hf-agents.ps1 kg "https://docs.python.org"
  .\scripts\hf-agents.ps1 agent

"@ -ForegroundColor Cyan
}

function Invoke-SmolAgent {
    param([string]$Task)
    
    Write-Host "🔍 Ejecutando agente: $Task" -ForegroundColor Yellow
    
    $pythonCode = @"
from smolagents import CodeAgent, DuckDuckGoSearchTool, InferenceClientModel

model = InferenceClientModel()
agent = CodeAgent(tools=[DuckDuckGoSearchTool()], model=model)
result = agent.run('$Task')
print(result)
"@
    
    python -c $pythonCode 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️ Instale smolagents: pip install smolagents[toolkit]" -ForegroundColor Red
    }
}

function Invoke-ResearchAgent {
    param([string]$Topic)
    
    Write-Host "📚 Investigando: $Topic" -ForegroundColor Yellow
    Write-Host "💡 Use el Space: https://huggingface.co/spaces/Agents-MCP-Hackathon/multi-agent_deep-research" -ForegroundColor Cyan
    Write-Host "   O instale: npx @agents-mcp-hackathon/multi-agent-deep-research" -ForegroundColor Gray
}

function Invoke-WebScraper {
    param([string]$Url)
    
    Write-Host "🕷️ Scraping: $Url" -ForegroundColor Yellow
    Write-Host "💡 Use el Space: https://huggingface.co/spaces/Agents-MCP-Hackathon/web-scraper" -ForegroundColor Cyan
    Write-Host "   O instale: npx @agents-mcp-hackathon/web-scraper" -ForegroundColor Gray
    
    # Intentar con curl si está disponible
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 30
        $content = $response.Content.Substring(0, [Math]::Min(2000, $response.Content.Length))
        Write-Host "`n📄 Preview (primeros 2000 chars):" -ForegroundColor Green
        Write-Host $content -ForegroundColor Gray
    } catch {
        Write-Host "⚠️ Error haciendo request: $_" -ForegroundColor Red
    }
}

function Invoke-KnowledgeGraph {
    param([string]$Url)
    
    Write-Host "🧠 Construyendo grafo desde: $Url" -ForegroundColor Yellow
    Write-Host "💡 Use el Space: https://huggingface.co/spaces/Agents-MCP-Hackathon/KGB-mcp" -ForegroundColor Cyan
    Write-Host "   O instale: npx @agents-mcp-hackathon/knowledge-graph-builder" -ForegroundColor Gray
}

function Invoke-WorkflowBuilder {
    param([string]$Name)
    
    Write-Host "⚙️ Workflow: $Name" -ForegroundColor Yellow
    Write-Host "💡 Use el Space: https://huggingface.co/spaces/Agents-MCP-Hackathon/gradio_workflowbuilder" -ForegroundColor Cyan
}

function Open-AgentUI {
    Write-Host "🌐 Abriendo Agent UI..." -ForegroundColor Yellow
    Start-Process "https://huggingface.co/spaces/lvwerra/agent-ui"
}

function Open-ComputerAgent {
    Write-Host "💻 Abriendo Computer Use Agent..." -ForegroundColor Yellow
    Start-Process "https://huggingface.co/spaces/smolagents/computer-use-agent"
}

# Ejecutar comando
switch ($Command) {
    "search" { 
        if (-not $Query) { 
            Write-Host "⚠️用法: .\scripts\hf-agents.ps1 search <texto>" -ForegroundColor Red
            exit 1
        }
        Invoke-SmolAgent -Task $Query 
    }
    "research" { 
        if (-not $Query) { 
            Write-Host "⚠️用法: .\scripts\hf-agents.ps1 research <tema>" -ForegroundColor Red
            exit 1
        }
        Invoke-ResearchAgent -Topic $Query 
    }
    "scrape" { 
        if (-not $Query) { 
            Write-Host "⚠️用法: .\scripts\hf-agents.ps1 scrape <url>" -ForegroundColor Red
            exit 1
        }
        Invoke-WebScraper -Url $Query 
    }
    "kg" { 
        if (-not $Query) { 
            Write-Host "⚠️用法: .\scripts\hf-agents.ps1 kg <url>" -ForegroundColor Red
            exit 1
        }
        Invoke-KnowledgeGraph -Url $Query 
    }
    "workflow" { 
        Invoke-WorkflowBuilder -Name $Query 
    }
    "agent" { 
        Open-AgentUI 
    }
    "computer" { 
        Open-ComputerAgent 
    }
    "help" { 
        Show-Help 
    }
    default {
        Write-Host "⚠️ Comando desconocido: $Command" -ForegroundColor Red
        Show-Help
    }
}
