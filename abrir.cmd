@echo off
title Charla IA
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo No encuentro Node.js. Abre directamente index.html con doble clic.
  pause
  exit /b 1
)
echo Arrancando la presentacion en http://localhost:5180 ...
node serve.mjs
pause
