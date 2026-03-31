@echo off
title Aurora - Antigravity Mode
color 0d
mode con: cols=100 lines=40
echo.
echo ========================================
echo   AURORA NEXUS - ANTIGRAVITY MODE
echo ========================================
echo.
echo Iniciando Aurora en modo Antigravity...
echo.
cd /d "%~dp0.."
npm run aurora:shell
pause