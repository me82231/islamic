@echo off
setlocal enableextensions
chcp 65001 >nul
title Hadith Lens - Server (close this window to stop the site)
color 0A

cd /d "%~dp0"

echo.
echo  ==========================================
echo    Hadith Lens  -  Starting local server
echo  ==========================================
echo.

REM ---- 1) Check Node.js ----
where node >nul 2>&1
if errorlevel 1 (
  echo  [ERROR] Node.js is not installed.
  echo          Download it from https://nodejs.org  ^(version 20 or newer^)
  echo.
  pause
  exit /b 1
)

REM ---- 2) Check project files ----
if not exist "package.json" (
  echo  [ERROR] package.json not found.
  echo          Move this .bat file into the project folder, next to package.json
  echo.
  pause
  exit /b 1
)

REM ---- 3) Check .env ----
if not exist ".env" (
  if exist ".env.example" (
    copy ".env.example" ".env" >nul
    echo  [INFO] .env was missing, created it from .env.example
    echo         Put your GEMINI_API_KEY in it, then run this file again.
    echo.
    start notepad ".env"
    pause
    exit /b 1
  ) else (
    echo  [ERROR] .env file not found. Create it and add GEMINI_API_KEY=your_key
    echo.
    pause
    exit /b 1
  )
)

REM ---- 4) Read PORT from .env (default 3000) ----
set "PORT=3000"
for /f "usebackq tokens=1,* delims==" %%a in (`findstr /b /i "PORT=" ".env"`) do set "PORT=%%b"
set "PORT=%PORT: =%"

REM ---- 5) Install dependencies on first run ----
if not exist "node_modules" (
  echo  [1/3] Installing dependencies ^(first run only^)...
  call npm install
  if errorlevel 1 (
    echo  [ERROR] npm install failed.
    pause
    exit /b 1
  )
) else (
  echo  [1/3] Dependencies OK
)

REM ---- 6) Download hadith data on first run ----
if not exist ".setup_done" (
  echo  [2/3] Downloading hadith data ^(first run only^)...
  call npm run setup
  if errorlevel 1 (
    echo  [ERROR] npm run setup failed. Check your internet connection.
    pause
    exit /b 1
  )
  echo done> ".setup_done"
) else (
  echo  [2/3] Hadith data OK
)

REM ---- 7) Free the port if an old instance is still running ----
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%PORT% " ^| findstr LISTENING') do (
  echo  [INFO] Port %PORT% is busy, stopping old process %%p
  taskkill /f /pid %%p >nul 2>&1
)

REM ---- 8) Open the browser after a short delay ----
echo  [3/3] Starting server on http://localhost:%PORT%
start "" /b cmd /c "timeout /t 4 /nobreak >nul & start "" http://localhost:%PORT%"

echo.
echo  ------------------------------------------
echo   Site is running:  http://localhost:%PORT%
echo   To STOP the site: close this window
echo                     or press Ctrl+C
echo  ------------------------------------------
echo.

REM ---- 9) Run the server in THIS window ----
call npm start

REM ---- 10) Cleanup if the server exits or crashes ----
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%PORT% " ^| findstr LISTENING') do taskkill /f /pid %%p >nul 2>&1

echo.
echo  Server stopped.
pause
endlocal