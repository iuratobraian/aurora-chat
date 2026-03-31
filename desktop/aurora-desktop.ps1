Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$apiScript = Join-Path $projectRoot "scripts\aurora-api.mjs"
$nodeCommand = "node"
$auroraUrl = "http://localhost:4310/app"
$healthUrl = "http://localhost:4310/health"

function Test-AuroraHealth {
    try {
        $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 2
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

$ownedApiProcess = $null

if (-not (Test-AuroraHealth)) {
    $ownedApiProcess = Start-Process -FilePath $nodeCommand -ArgumentList "`"$apiScript`"" -WorkingDirectory $projectRoot -PassThru -WindowStyle Hidden
    $ready = $false

    for ($i = 0; $i -lt 20; $i++) {
        Start-Sleep -Milliseconds 500
        if (Test-AuroraHealth) {
            $ready = $true
            break
        }
    }

    if (-not $ready) {
        if ($ownedApiProcess -and -not $ownedApiProcess.HasExited) {
            Stop-Process -Id $ownedApiProcess.Id -Force
        }
        throw "Aurora API no respondió en tiempo esperado."
    }
}

$form = New-Object System.Windows.Forms.Form
$form.Text = "Aurora Core Desktop"
$form.Width = 1480
$form.Height = 980
$form.StartPosition = "CenterScreen"
$form.BackColor = [System.Drawing.Color]::FromArgb(9, 14, 26)

$topBar = New-Object System.Windows.Forms.Panel
$topBar.Height = 52
$topBar.Dock = "Top"
$topBar.BackColor = [System.Drawing.Color]::FromArgb(15, 23, 42)
$form.Controls.Add($topBar)

$title = New-Object System.Windows.Forms.Label
$title.Text = "Aurora Core Desktop"
$title.ForeColor = [System.Drawing.Color]::FromArgb(229, 238, 252)
$title.Font = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)
$title.AutoSize = $true
$title.Location = New-Object System.Drawing.Point(16, 13)
$topBar.Controls.Add($title)

$refreshButton = New-Object System.Windows.Forms.Button
$refreshButton.Text = "Refresh"
$refreshButton.Width = 100
$refreshButton.Height = 30
$refreshButton.FlatStyle = "Flat"
$refreshButton.ForeColor = [System.Drawing.Color]::FromArgb(4, 19, 27)
$refreshButton.BackColor = [System.Drawing.Color]::FromArgb(67, 197, 165)
$refreshButton.Location = New-Object System.Drawing.Point(1340, 10)
$topBar.Controls.Add($refreshButton)

$statusLabel = New-Object System.Windows.Forms.Label
$statusLabel.Text = "Connected to $auroraUrl"
$statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(144, 164, 195)
$statusLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$statusLabel.AutoSize = $true
$statusLabel.Location = New-Object System.Drawing.Point(220, 18)
$topBar.Controls.Add($statusLabel)

$browser = New-Object System.Windows.Forms.WebBrowser
$browser.Dock = "Fill"
$browser.ScriptErrorsSuppressed = $true
$browser.Url = $auroraUrl
$form.Controls.Add($browser)

$refreshButton.Add_Click({
    $browser.Refresh()
})

$form.Add_FormClosed({
    if ($ownedApiProcess -and -not $ownedApiProcess.HasExited) {
        Stop-Process -Id $ownedApiProcess.Id -Force
    }
})

[void]$form.ShowDialog()
