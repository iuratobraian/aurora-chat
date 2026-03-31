# Kimi Direct Query - Consulta directa a Kimi sin modo interactivo
# Uso: .\kimi-direct.ps1 "tu pregunta aqui"

param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string]$Query = ""
)

$ErrorActionPreference = "Stop"

# Cargar configuración del proyecto
$ProjectRoot = "C:\Users\iurato\Downloads\tradeportal-2025-platinum"

# Cargar API key
$ApiKey = $env:NVIDIA_API_KEY
if (-not $ApiKey) {
    $envFile = "$ProjectRoot\.env.nvidia"
    if (Test-Path $envFile) {
        $ApiKey = (Get-Content $envFile -Raw).Trim()
    }
}

if (-not $ApiKey) {
    Write-Host "[ERROR] NVIDIA_API_KEY no configurada" -ForegroundColor Red
    exit 1
}

$Model = "moonshotai/kimi-k2.5"

# Construir mensaje
$messages = @(
    @{
        role = "system"
        content = "Sos Kimi K2.5 de Moonshot AI, un asistente de IA avanzado. Respondé en español."
    },
    @{
        role = "user"
        content = $Query
    }
)

# Llamar a la API
$body = @{
    model = $Model
    messages = $messages
    temperature = 0.7
    max_tokens = 2000
} | ConvertTo-Json -Depth 10 -Compress

try {
    $response = Invoke-RestMethod -Uri "https://integrate.api.nvidia.com/v1/chat/completions" `
        -Method Post `
        -Headers @{
            "Authorization" = "Bearer $ApiKey"
            "Content-Type" = "application/json"
        } `
        -Body $body `
        -ErrorAction Stop

    if ($response.choices[0].message.content) {
        Write-Host $response.choices[0].message.content -ForegroundColor Cyan
    }
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "[DETALLE] $($_.Exception.Response.StatusDescription)" -ForegroundColor Yellow
    exit 1
}
