@echo off
title AttendQR Launcher
color 0A

echo.
echo  ============================================
echo     AttendQR - Starting Application...
echo  ============================================
echo.

REM ── Find the backend folder ──────────────────────────────────
set "BASE=%~dp0attendqr-full"

if not exist "%BASE%\backend\server.js" (
  echo  [ERROR] Could not find attendqr-full\backend\server.js
  echo  Make sure this file is in the same folder as attendqr-full\
  pause
  exit /b 1
)

REM ── Start Backend ─────────────────────────────────────────────
echo  [1/2] Starting Backend on http://localhost:3001 ...
start "AttendQR Backend" cmd /k "cd /d "%BASE%\backend" && npm install && npm start"

REM ── Wait a moment for backend to boot ─────────────────────────
timeout /t 3 /nobreak >nul

REM ── Start Frontend ────────────────────────────────────────────
echo  [2/2] Starting Frontend on http://localhost:5173 ...
start "AttendQR Frontend" cmd /k "cd /d "%BASE%\frontend" && npm install && npm run dev"

REM ── Wait for frontend to boot then open browser ───────────────
timeout /t 5 /nobreak >nul
echo.
echo  [3/3] Opening browser...
start "" "http://localhost:5173"

echo.
echo  ============================================
echo   AttendQR is running!
echo.
echo   Admin Panel : http://localhost:5173
echo   Backend API : http://localhost:3001
echo.
echo   Close the two terminal windows to stop.
echo  ============================================
echo.
pause
