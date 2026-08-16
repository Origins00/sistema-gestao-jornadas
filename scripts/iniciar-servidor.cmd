@echo off
setlocal
cd /d "%~dp0"
echo Iniciando o Gestor de Jornadas...
echo Para acessar, abra http://127.0.0.1:8000
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0iniciar-servidor.ps1"
set "CODIGO=%ERRORLEVEL%"
if not "%CODIGO%"=="0" (
    echo.
    echo O servidor apresentou um erro. Consulte a pasta logs.
    pause
)
exit /b %CODIGO%
