@echo off
setlocal
title YT Transcript Pro - Server (LIVE)
color 0A

:: 1. Navigate to the transcript project folder
if exist "%~dp0app.py" (
    cd /d "%~dp0"
) else if exist "%~dp0transcript\app.py" (
    cd /d "%~dp0transcript"
) else if exist "C:\Users\yash9\OneDrive\Desktop\transcript\app.py" (
    cd /d "C:\Users\yash9\OneDrive\Desktop\transcript"
) else if exist "C:\Users\yash9\Desktop\transcript\app.py" (
    cd /d "C:\Users\yash9\Desktop\transcript"
)

echo =====================================================================
echo              STARTING YT TRANSCRIPT PRO LOCAL SERVER...
echo =====================================================================
echo.
echo   Project Directory: %CD%

:: 2. Find Python executable
set "PY_EXE=python"
if exist "C:\Program Files\Python314\python.exe" (
    set "PY_EXE=C:\Program Files\Python314\python.exe"
)

:: 3. Check if server is already running on port 8000
netstat -ano | findstr ":8000 " | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo.
    echo   [i] Server is ALREADY RUNNING on port 8000!
    echo   [i] Opening website in your default browser...
    start http://localhost:8000
    echo.
    echo   -------------------------------------------------------------------
    echo   STATUS: [SERVER IS ALREADY ONLINE - CHALU HAI]
    echo   * PC Browser:    http://localhost:8000
    echo   * Mobile Wi-Fi:  http://192.168.29.72:8000
    echo   -------------------------------------------------------------------
    echo.
    echo   Server band karne ke liye 'Stop Server.bat' use karein.
    echo   Press any key to close this notification...
    pause >nul
    exit /b 0
)

echo.
echo   [+] Starting FastAPI server on http://0.0.0.0:8000...
echo   [+] Opening browser automatically in 2 seconds...
echo.
echo   -------------------------------------------------------------------
echo   STATUS: [SERVER IS RUNNING - LIVE]
echo   * PC Browser Link:     http://localhost:8000
echo   * Mobile Wi-Fi Link:   http://192.168.29.72:8000
echo   -------------------------------------------------------------------
echo   NOTE: Is window ko open rehne dein - minimize kar sakte hain.
echo   Server band karne ke liye is window ko close karein ya CTRL+C karein.
echo =====================================================================
echo.

:: Automatically open browser after 2 seconds
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:8000"

:: Start Uvicorn directly in this window
"%PY_EXE%" -m uvicorn app:app --host 0.0.0.0 --port 8000 --log-level info

if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo   [ERROR] Server stopped with error code %ERRORLEVEL%.
    echo   Press any key to close...
    pause >nul
)
