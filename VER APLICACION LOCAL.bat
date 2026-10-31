@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto no_node
node "scripts\serve-local.cjs"
if errorlevel 1 pause
exit /b
:no_node
echo Para abrir esta vista previa necesita Node.js. En la PC donde se preparo ya esta instalado.
pause
