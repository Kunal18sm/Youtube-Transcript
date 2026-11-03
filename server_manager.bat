@echo off
setlocal enabledelayedexpansion
title YT Transcript Pro - Server Manager
color 0F

:MENU
cls
echo =====================================================================
echo                YT TRANSCRIPT PRO - LOCAL SERVER MANAGER
echo =====================================================================
echo.

:: Check if port 8000 is listening on localhost
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
if %ERRORLEVEL% EQU 0 (
    color 0A
    echo   STATUS: [ ACTIVE / ONLINE ] 🟢
    echo   URL:    http://localhost:8000
    echo   PORT:   8000 (Localhost)
    echo =====================================================================
    echo.
    echo   [1] Open Website in Browser (http://localhost:8000)
    echo   [2] Stop Local Server (Turn OFF)
    echo   [3] Restart Local Server
    echo   [4] Check Server Health / Ping
    echo   [5] Exit
    echo.
    set /p choice="Select an option (1-5): "
    if "!choice!"=="1" goto OPEN_BROWSER
    if "!choice!"=="2" goto STOP_SERVER
    if "!choice!"=="3" goto RESTART_SERVER
    if "!choice!"=="4" goto HEALTH_CHECK
    if "!choice!"=="5" exit /b
    goto MENU
) else (
    color 0C
    echo   STATUS: [ STOPPED / OFFLINE ] 🔴
    echo   URL:    http://localhost:8000 (Not running)
    echo =====================================================================
    echo.
    echo   [1] Start Server (Silent Background Mode - Recommended)
    echo   [2] Start Server (Visible Terminal / Debug Mode)
    echo   [3] Refresh Status
    echo   [4] Exit
    echo.
    set /p choice="Select an option (1-4): "
    if "!choice!"=="1" goto START_SILENT
    if "!choice!"=="2" goto START_VISIBLE
    if "!choice!"=="3" goto MENU
    if "!choice!"=="4" exit /b
    goto MENU
)

:OPEN_BROWSER
echo.
echo Opening http://localhost:8000 in your browser...
start http://localhost:8000
timeout /t 2 /nobreak >nul
goto MENU

:START_SILENT
echo.
echo Starting YT Transcript Pro server silently in background...
start "" wscript.exe "%~dp0start_silent.vbs"
timeout /t 3 /nobreak >nul
goto MENU

:START_VISIBLE
echo.
echo Starting YT Transcript Pro server in visible terminal...
start "YT Transcript Pro Server" cmd /k "cd /d "%~dp0" && python -m uvicorn app:app --host 127.0.0.1 --port 8000"
timeout /t 3 /nobreak >nul
goto MENU

:STOP_SERVER
echo.
echo Stopping local server on port 8000...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"
timeout /t 2 /nobreak >nul
echo Server stopped successfully.
timeout /t 1 /nobreak >nul
goto MENU

:RESTART_SERVER
echo.
echo Restarting server...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"
timeout /t 2 /nobreak >nul
start "" wscript.exe "%~dp0start_silent.vbs"
timeout /t 3 /nobreak >nul
goto MENU

:HEALTH_CHECK
echo.
echo Checking http://127.0.0.1:8000/ ...
powershell -NoProfile -Command "try { $res = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/' -UseBasicParsing -TimeoutSec 3; Write-Host ('[OK] Server responded with HTTP status ' + $res.StatusCode) -ForegroundColor Green } catch { Write-Host ('[FAILED] ' + $_.Exception.Message) -ForegroundColor Red }"
echo.
pause
goto MENU
