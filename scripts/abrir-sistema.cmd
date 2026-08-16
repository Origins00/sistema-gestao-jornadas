@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0abrir-sistema.ps1"
set "CODIGO=%ERRORLEVEL%"
if not "%CODIGO%"=="0" pause
exit /b %CODIGO%
