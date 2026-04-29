# 🧠 Aurora Engine Standalone Setup Script

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "   🧠 AURORA ENGINE STANDALONE SETUP" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Check Node.js
$nodeVersion = node -v
if ($?) {
    Write-Host "[✓] Node.js version: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "[✗] Node.js not found. Please install Node.js v20+" -ForegroundColor Red
    exit 1
}

# 2. Install dependencies
Write-Host "[...] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($?) {
    Write-Host "[✓] Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "[✗] Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# 2.5 Install Python dependencies (optional but recommended for Intel)
Write-Host "[...] Checking for Python / pip..." -ForegroundColor Yellow
$pipVersion = pip --version
if ($?) {
    Write-Host "[✓] Pip found. Installing Aurora Intel dependencies..." -ForegroundColor Green
    pip install -r requirements-aurora.txt
} else {
    Write-Host "[!] Python/pip not found. NotebookLM and MemPalace will not be available until installed." -ForegroundColor Yellow
}

# 3. Check environment
if (Test-Path ".env.aurora") {
    Write-Host "[✓] .env.aurora found" -ForegroundColor Green
} else {
    Write-Host "[!] .env.aurora not found. Creating from example..." -ForegroundColor Yellow
    Copy-Item ".env.aurora.example" ".env.aurora"
    Write-Host "[!] Please configure your API keys in .env.aurora before starting" -ForegroundColor Magenta
}

# 4. Initialize Vault
Write-Host "[...] Verifying Neural Vault structure..." -ForegroundColor Yellow
$vaultDirs = @("vault/00-inbox", "vault/01-tareas", "vault/02-decisiones", "vault/03-conocimiento", "vault/04-errores", "vault/05-agentes")
foreach ($dir in $vaultDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}
Write-Host "[✓] Neural Vault structure is ready" -ForegroundColor Green

# 5. Final message
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "   🚀 SETUP COMPLETE" -ForegroundColor Cyan
Write-Host "   Run 'npm run inicio' to awaken Aurora" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
