@echo off
setlocal enabledelayedexpansion
title YT Transcript Pro - Server Launcher
color 0A

:: Navigate to script folder
cd /d "%~dp0"

echo =====================================================================
echo             YT TRANSCRIPT PRO - LOCAL SERVER LAUNCHER
echo =====================================================================
echo.

:: 1. Check if server is already running on port 8000
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
if %ERRORLEVEL% EQU 0 (
    echo   [i] Server is ALREADY ONLINE on port 8000!
    echo   [i] Opening http://localhost:8000 in your browser...
    start http://localhost:8000
    echo.
    echo   -------------------------------------------------------------------
    echo   STATUS: [🟢 SERVER IS RUNNING]
    echo   * PC Browser:    http://localhost:8000
    echo   * Mobile Wi-Fi:  http://192.168.29.72:8000
    echo   -------------------------------------------------------------------
    echo.
    timeout /t 4
    exit /b 0
)

:: 2. Find Python executable
set "PY_EXE="
if exist "C:\Program Files\Python314\python.exe" (
    set "PY_EXE=C:\Program Files\Python314\python.exe"
) else (
    for %%p in (python.exe py.exe) do (
        if not defined PY_EXE (
            %%p --version >nul 2>&1 && set "PY_EXE=%%p"
        )
    )
)

if not defined PY_EXE (
    color 0C
    echo   [ERROR] Python was not found on this computer!
    echo   Please make sure Python is installed.
    echo.
    pause
    exit /b 1
)

echo   [+] Found Python: "!PY_EXE!"
echo   [+] Launching YT Transcript Pro server on http://0.0.0.0:8000...
echo.

:: Open browser after 2 seconds
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:8000"

echo   -------------------------------------------------------------------
echo   STATUS: [🟢 SERVER IS NOW ONLINE (CHALU HO GAYA)]
echo   * PC Browser Link:     http://localhost:8000
echo   * Mobile Wi-Fi Link:   http://192.168.29.72:8000
echo   -------------------------------------------------------------------
echo   Note: Is black window ko band mat kijiyega (minimize kar sakte hain).
echo   Server band karne ke liye 'Stop Server.bat' par click karein ya CTRL+C karein.
echo =====================================================================
echo.

"!PY_EXE!" -m uvicorn app:app --host 0.0.0.0 --port 8000 --log-level info
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo [ERROR] Server closed with error! Check details above.
    pause
)
