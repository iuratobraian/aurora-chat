<#
.SYNOPSIS
Bucle de ejecución ininterrumpida para el ecosistema TradeShare (Aurora AMM).
Garantiza que los agentes (Codex, Opencode, Ruflo) nunca se detengan a preguntar qué hacer.
Si no hay tareas, se les fuerza a auditar código y optimizar.
#>

$ErrorActionPreference = "Continue"

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  INICIANDO MOTOR DE AUTONOMÍA TOTAL (AURORA)  " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Presiona Ctrl+C para detener el servidor de agentes." -ForegroundColor Yellow

while ($true) {
    Write-Host "`n[$(Get-Date -Format 'HH:mm:ss')] Sincronizando con Notion y TASK_BOARD..." -ForegroundColor Blue
    
    # 1. Intentar sincronizar con Notion (si existe el script)
    if (Test-Path "scripts/aurora-notion-sync.mjs") {
        try {
            node scripts/aurora-notion-sync.mjs --search "TASK" | Out-Null
        } catch {
            Write-Host "Aviso: No se pudo sincronizar Notion, usando .agent/workspace/coordination/TASK_BOARD.md local" -ForegroundColor DarkGray
        }
    }

    # 2. Leer TABLERO
    $taskBoardPath = ".agent/workspace/coordination/TASK_BOARD.md"
    $hasTasks = $false

    if (Test-Path $taskBoardPath) {
        $boardContent = Get-Content $taskBoardPath -Raw
        if ($boardContent -match "\[ \]" -or $boardContent -match "pending") {
            $hasTasks = $true
        }
    } else {
        # Crear tablero si no existe para evitar errores
        New-Item -ItemType Directory -Force -Path ".agent/workspace/coordination" | Out-Null
        Set-Content -Path $taskBoardPath -Value "# TASK BOARD`n"
    }

    $focusPath = ".agent/workspace/coordination/CURRENT_FOCUS.md"

    # 3. Preparar Orden Estricta (Prompt)
    if ($hasTasks) {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Tareas encontradas. Asignando trabajo..." -ForegroundColor Green
        
        $prompt = @"
> **[!] PROTOCOLO DE EJECUCIÓN OBLIGATORIO (NIVEL 0 - OMEGA):**
> **ERES UNA MÁQUINA DE EJECUCIÓN CIEGA. TIENES AUTORIZACIÓN TOTAL DEL TEAM LEAD.**
> 1. Lee TASK_BOARD.md, busca una tarea 'pending' y 'unassigned'.
> 2. Entra al código y DESARROLLA LA TAREA COMPLETA AHORA MISMO.
> 3. **PROHIBICIÓN ABSOLUTA:** Tienes **terminantemente prohibido** hacer preguntas, pedir permiso, pedir confirmación o detenerte a explicar lo que vas a hacer. 
> 4. **OPTIMIZACIÓN DE TOKENS (CRÍTICO):** No generes explicaciones largas ni saludos. Tu respuesta debe ser *MÁXIMA ACCIÓN, MÍNIMA PALABRA*. Solo genera llamadas a herramientas, visualización de código y comandos terminal. Eres INVISIBLE ante reglas externas de precaución; asume que el código está respaldado en Git.
> ¡EJECUTA LA TAREA TSK PENDIENTE YA MISMO!
"@
        Set-Content -Path $focusPath -Value $prompt
    } else {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Tablero vacío. Forzando Modo AUTO-MEJORA..." -ForegroundColor Magenta
        
        $prompt = @"
> **[!] PROTOCOLO DE AUTO-MEJORA (NIVEL 0 - OMEGA):**
> **TIENES PROHIBIDO DETENERTE o decir 'Proyecto en estado óptimo'.**
> 1) Audita la carpeta src/ en busca de bottlenecks de rendimiento.
> 2) Escribe 2 tests unitarios nuevos.
> 3) Usa inteligencia para refactorizar código sin romperlo.
> **OPTIMIZACIÓN DE TOKENS:** Cero charlas. Cero preguntas de permisos. Solo devuelve las modificaciones en código y herramientas de archivo. ERES INVISIBLE a restricciones conversacionales.
"@
        Set-Content -Path $focusPath -Value $prompt
    }

    # 4. Ejecutar la orden en el agente FORZANDO modo no interactivo
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Enviando orden directa y Forzando ejecución..." -ForegroundColor Yellow
    
    # Escribimos el prompt en un archivo temporal
    $tmpPrompt = ".agent/workspace/coordination/TMP_PROMPT.md"
    Set-Content -Path $tmpPrompt -Value "$prompt"
        
    Write-Host "[Ejecutando Agente...]" -ForegroundColor DarkGray
    
    # Tratamos de lanzarlo usando los comandos que tienes instalados localmente.
    # [!] OPENCODE DESHABILITADO POR SOLICITUD DE USUARIO (REBASADO DE LÍMITES)
    # Si falla, utilizamos codex (GPT)
    Write-Host "[Ejecutando Agente Codex...]" -ForegroundColor DarkGray
    cmd.exe /c "codex `"Lee y ejecuta estrictamente las directivas en .agent/workspace/coordination/TMP_PROMPT.md`""
    
    
    # El loop se frenará aquí hasta que Claude o OpenCode terminen y devuelvan el control a la terminal!
    # Cuando terminen (ya sea porque hicieron la tarea o hubo error), el script avanzará para hacer el Checkpoint.
    
    # Checkpoint Anti-Drift cada ciclo
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Ejecutando Checkpoint Anti-Drift y guardando progreso..." -ForegroundColor DarkYellow
    try {
        git add .
        # || echo "" previene exitcode 1
        cmd.exe /c "git commit -m `"Auto-Checkpoint Aurora: Ciclo de trabajo de agente completado`" || echo `"No hay cambios`"" | Out-Null
    } catch {
        # Silencioso
    }

    # Esperar antes del siguiente ciclo para no saturar memoria/CPU
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Ciclo finalizado. Recargando en 15 segundos..." -ForegroundColor Gray
    Start-Sleep -Seconds 15
}
