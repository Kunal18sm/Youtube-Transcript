@echo off
setlocal
title YT Transcript Pro - Server Toggle

:: Check if port 8000 is listening
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"

if %ERRORLEVEL% EQU 0 (
    :: Server is currently ACTIVE -> Stop it!
    color 0C
    echo =====================================================================
    echo            YT TRANSCRIPT PRO: SERVER IS CURRENTLY ONLINE
    echo =====================================================================
    echo.
    echo   [x] Stopping local server on port 8000...
    powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"
    echo.
    echo   [OK] Server stopped successfully! (Turned OFF)
    echo =====================================================================
    echo.
    timeout /t 2 /nobreak >nul
    exit /b
) else (
    :: Server is currently STOPPED -> Start it & Open Website!
    color 0A
    echo =====================================================================
    echo            YT TRANSCRIPT PRO: SERVER IS CURRENTLY OFFLINE
    echo =====================================================================
    echo.
    echo   [+] Starting background server...
    start "" wscript.exe "%~dp0start_silent.vbs"
    
    :: Give uvicorn 1 second to bind port 8000 before launching browser
    timeout /t 1 /nobreak >nul
    
    echo   [+] Opening http://localhost:8000 in your browser...
    start http://localhost:8000
    echo.
    echo   [OK] Server is now ONLINE! (Turned ON)
    echo =====================================================================
    echo.
    timeout /t 2 /nobreak >nul
    exit /b
)
