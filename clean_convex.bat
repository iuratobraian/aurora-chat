@echo off
set "targetDir=c:\Users\iurato\Downloads\tradeportal-2025-platinum\convex"
cd /d "%targetDir%"
for /r %%i in (*.js) do (
    if exist "%%~dpni.ts" (
        del /f /q "%%i"
        echo Deleted redundant JS file: %%i
    )
)
