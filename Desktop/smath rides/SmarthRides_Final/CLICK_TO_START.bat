@echo off
title Smarth Rides - Auto Launcher
color 0E

echo ===================================================
echo      SMARTH RIDES - APPLICATION LAUNCHER
echo ===================================================
echo.
echo [1/2] Checking Dependencies...
call npm install
echo.
echo [2/2] Starting Application...
echo.
echo      Open your browser to: http://localhost:3000
echo.
echo ===================================================

npm run dev

pause
