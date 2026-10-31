@echo off
cd /d "%~dp0"
call npm.cmd ci
if errorlevel 1 goto error
call npm.cmd test
if errorlevel 1 goto error
call npm.cmd run build
if errorlevel 1 goto error
start "" "%~dp0dist"
pause
exit /b
:error
echo No se pudo compilar. Revise el mensaje anterior.
pause
