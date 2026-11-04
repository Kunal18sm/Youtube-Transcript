@echo off
setlocal
title YT Transcript Pro - Server Status & Toggle

:: Check if port 8000 is listening
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"

if %ERRORLEVEL% EQU 0 (
    :: Server is currently ACTIVE -> Stop it!
    color 0C
    cls
    echo =====================================================================
    echo            YT TRANSCRIPT PRO: SERVER HAS BEEN TURNED OFF
    echo =====================================================================
    echo.
    echo   [x] Stopping local server on port 8000...
    powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"
    echo.
    echo   -------------------------------------------------------------------
    echo   STATUS: [🔴 SERVER IS NOW OFFLINE (BAND HO GAYA)]
    echo   -------------------------------------------------------------------
    echo   Website par ab status pill dikhega: [🔴 Server: Offline]
    echo   Agar dubara chalana ho to isi file par click karein.
    echo =====================================================================
    echo.
    powershell -NoProfile -Command "[console]::beep(500, 250)" >nul 2>&1
    timeout /t 4
    exit /b
) else (
    :: Server is currently STOPPED -> Start it & Open Website!
    color 0A
    cls
    echo =====================================================================
    echo            YT TRANSCRIPT PRO: SERVER HAS BEEN TURNED ON
    echo =====================================================================
    echo.
    echo   [+] Starting background server on port 8000...
    start "" wscript.exe "C:\Users\yash9\OneDrive\Desktop\transcript\start_silent.vbs"
    
    :: Give uvicorn a moment to bind port 8000
    timeout /t 2 /nobreak >nul
    
    echo.
    echo   -------------------------------------------------------------------
    echo   STATUS: [🟢 SERVER IS NOW ONLINE (CHALU HAI)]
    echo   -------------------------------------------------------------------
    echo   * PC Browser Link:     http://localhost:8000
    echo   * Mobile Wi-Fi Link:   http://192.168.29.72:8000
    echo   * Website status:      [🟢 Server: Online]
    echo   -------------------------------------------------------------------
    echo.
    echo   [+] Opening http://localhost:8000 in your browser...
    start http://localhost:8000
    echo =====================================================================
    echo.
    powershell -NoProfile -Command "[console]::beep(1000, 150); [console]::beep(1200, 200)" >nul 2>&1
    timeout /t 4
    exit /b
)
