@echo off
setlocal
for %%I in ("%~dp0..") do set "ROOT=%%~fI"
powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%\scripts\aurora-startup.ps1" %*
