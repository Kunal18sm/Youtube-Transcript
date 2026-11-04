@echo off
setlocal
title YT Transcript Pro - Stop Server
color 0C

echo =====================================================================
echo              STOPPING YT TRANSCRIPT PRO LOCAL SERVER...
echo =====================================================================
echo.
echo   [x] Stopping server process on port 8000...

powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"

echo.
echo   -------------------------------------------------------------------
echo   STATUS: [SERVER IS NOW STOPPED (BAND HO GAYA)]
echo   -------------------------------------------------------------------
echo   Server successfully band ho chuka hai.
echo   Dubara chalu karne ke liye 'Start Server.bat' par click karein.
echo =====================================================================
echo.
timeout /t 3
exit /b 0
