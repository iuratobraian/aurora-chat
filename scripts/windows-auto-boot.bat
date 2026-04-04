@echo off
:: ==========================================
:: AURORA HIVE MIND - MASTER BOOT SCRIPT
:: Inicia el Servidor TradeShare (Localhost) y el Centinela 
:: Ambos de forma Minimizada e Independiente.
:: ==========================================

echo [AURORA] Secuencia de Auto-Arranque Iniciada...
echo Lanzando Node Server y Hive Sentinel en segundo plano...

timeout /t 3 /nobreak >nul

:: Desplegar Servidor Guardián en Puerto 3000 (Minimizado)
start /min "TradeShare Server [CERRAR PARA APAGAR]" cmd /c "node scripts/aurora-server-guardian.mjs"

:: Desplegar Vigía del Hive Mind (Minimizado)
start /min "Aurora Hive Sentinel [CERRAR PARA APAGAR]" cmd /c "node scripts/aurora-hive-worker.mjs"

exit
