@echo off
:: ============================================================
:: AURORA HIVE MIND - INICIO AUTOMATICO WINDOWS
:: Se ejecuta al arrancar Windows via Carpeta de Inicio
:: ============================================================
title Aurora Hive Mind - Centinela Autonomo

:: Esperar 20 segundos para que Windows cargue completamente
timeout /t 20 /nobreak >nul

:: Cambiar al directorio del proyecto
cd /d "C:\Users\iurato\Desktop\PROYECTO ACTUAL"

echo.
echo  ========================================
echo   AURORA HIVE MIND SENTINEL - AUTO START
echo  ========================================
echo.

:: Iniciar el worker en bucle infinito (si crashea, se reinicia solo)
:loop
echo [%date% %time%] Iniciando Aurora Hive Worker...
node scripts/aurora-hive-worker.mjs
echo [%date% %time%] Worker detenido. Reiniciando en 10 segundos...
timeout /t 10 /nobreak >nul
goto loop
