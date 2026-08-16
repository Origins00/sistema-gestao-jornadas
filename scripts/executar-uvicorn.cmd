@echo off
setlocal
set "PYTHONUNBUFFERED=1"
set "PYTHONUTF8=1"
cd /d "%~dp0..\backend\app"
"%~dp0..\backend\.venv\Scripts\python.exe" -m uvicorn main:aplicacao --host 127.0.0.1 --port 8000 --log-level info >> "%~dp0..\logs\servidor.log" 2>&1
exit /b %ERRORLEVEL%
