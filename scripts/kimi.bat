@echo off
REM Kimi Chat - Acceso directo a Kimi K2.5 Agent
REM Uso: kimi "tu mensaje"
REM O simplemente: kimi (para iniciar chat interactivo)

setlocal enabledelayedexpansion

set "PROJECT_ROOT=C:\Users\iurato\Downloads\tradeportal-2025-platinum"

if "%~1"=="" (
    REM Chat interactivo
    powershell -ExecutionPolicy Bypass -File "%PROJECT_ROOT%\scripts\chat-kimi.ps1"
    exit /b
)

REM Enviar mensaje directo
node "%PROJECT_ROOT%\scripts\aurora-kimi-agent.mjs" %*