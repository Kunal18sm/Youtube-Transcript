@echo off
setlocal enabledelayedexpansion
title YT Transcript Pro - Server Control
color 0A

:: Navigate to transcript directory
cd /d "C:\Users\yash9\OneDrive\Desktop\transcript"

:: Check if server is running on port 8000
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
if %ERRORLEVEL% EQU 0 (
    echo =====================================================================
    echo            YT TRANSCRIPT PRO: SERVER IS ALREADY ONLINE
    echo =====================================================================
    echo.
    echo   STATUS: [🟢 SERVER CHALU HAI]
    echo   * PC Browser Link:     http://localhost:8000
    echo   * Mobile Wi-Fi Link:   http://192.168.29.72:8000
    echo.
    echo   [+] Opening website in your default browser...
    start http://localhost:8000
    echo.
    echo   -------------------------------------------------------------------
    echo   Options:
    echo     [1] Server chalte rehne dein aur window band karein (Default)
    echo     [2] Server ko band karein (Turn OFF server)
    echo   -------------------------------------------------------------------
    set /p "CHOICE=Enter 1 ya 2 dabayein (or just press Enter): "
    if "!CHOICE!"=="2" (
        color 0C
        echo.
        echo   [x] Stopping server on port 8000...
        powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"
        echo   STATUS: [🔴 SERVER IS NOW OFFLINE]
        timeout /t 3
        exit /b 0
    )
    timeout /t 2
    exit /b 0
)

:: Server is NOT running -> Start it in an independent, clean window!
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
    echo [ERROR] Python not found! Please ensure Python is installed.
    pause
    exit /b 1
)

echo =====================================================================
echo            STARTING YT TRANSCRIPT PRO LOCAL SERVER...
echo =====================================================================
echo.
echo   [+] Found Python: "!PY_EXE!"
echo   [+] Starting server on port 8000...

:: Launch server in its own independent window so it never crashes silently
start "YT Transcript Pro Server" cmd /k "cd /d C:\Users\yash9\OneDrive\Desktop\transcript && title YT Transcript Pro Server (LIVE) && color 0A && "!PY_EXE!" -m uvicorn app:app --host 0.0.0.0 --port 8000"

:: Wait for port 8000 to listen
for /l %%i in (1,1,6) do (
    powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
    if !ERRORLEVEL! EQU 0 goto :started_ok
    timeout /t 1 /nobreak >nul
)

:started_ok
echo.
echo   -------------------------------------------------------------------
echo   STATUS: [🟢 SERVER IS NOW ONLINE (CHALU HO GAYA)]
echo   -------------------------------------------------------------------
echo   * PC Browser Link:     http://localhost:8000
echo   * Mobile Wi-Fi Link:   http://192.168.29.72:8000
echo   -------------------------------------------------------------------
echo.
echo   [+] Opening website in your default browser...
start http://localhost:8000
echo.
powershell -NoProfile -Command "[console]::beep(1000, 150); [console]::beep(1200, 200)" >nul 2>&1
timeout /t 4
exit /b 0
