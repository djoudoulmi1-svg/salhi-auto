@echo off
setlocal
cd /d "%~dp0"
title Salhi Auto - Dev Server
echo Starting Salhi Auto. Keep this window open.
echo.
if not exist "node_modules\next\package.json" (
  echo Required files are missing. In VS Code, run: npm install
  pause
  exit /b 1
)
call npm.cmd run dev
echo.
echo The server stopped. Read the message above for details.
pause
