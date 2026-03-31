@echo off
title GLM-4.7 Chat - Aurora Nexus
color 0a
mode con: cols=100 lines=35
echo.
echo ========================================
echo   AURORA NEXUS - GLM-4.7 Chat
echo ========================================
echo.
echo Iniciando chat con GLM-4.7...
echo Presiona Ctrl+C para salir
echo.
powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0chat-kimi.ps1"
