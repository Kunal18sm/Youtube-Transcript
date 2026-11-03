@echo off
title YouTube Transcript Pro
echo ========================================================
echo        Starting YouTube Transcript Pro Web App...
echo ========================================================
echo.

:: Open default browser to the web app
start http://127.0.0.1:8000

:: Start FastAPI server with python
python -m uvicorn app:app --host 127.0.0.1 --port 8000
pause
