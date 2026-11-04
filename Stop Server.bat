@echo off
title YT Transcript Pro - Stop Server
color 0C

echo =====================================================================
echo             YT TRANSCRIPT PRO - STOP SERVER
echo =====================================================================
echo.
echo   [x] Stopping local server on port 8000...

powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"

echo.
echo   -------------------------------------------------------------------
echo   STATUS: [🔴 SERVER IS NOW STOPPED (BAND HO GAYA)]
echo   -------------------------------------------------------------------
echo   Server successfully band ho chuka hai.
echo   Dubara chalu karne ke liye 'Start Server.bat' par click karein.
echo =====================================================================
echo.
powershell -NoProfile -Command "[console]::beep(600, 200)" >nul 2>&1
timeout /t 3
exit /b
