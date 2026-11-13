@echo off
REM =========================================================================
REM NetSentinel - Complete System Startup Script
REM Starts FastAPI backend on port 8000 and Vite React Frontend on port 3000
REM =========================================================================

echo [1/2] Starting NetSentinel FastAPI Backend on http://localhost:8000 ...
start "NetSentinel Backend" cmd /k "cd /d C:\Users\kiran\OneDrive\Documents\bda && python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000"

echo [2/2] Starting NetSentinel React Frontend on http://localhost:3000 ...
start "NetSentinel Frontend" cmd /k "cd /d C:\Users\kiran\OneDrive\Documents\bda\frontend && npm.cmd run dev -- --host 0.0.0.0 --port 3000"

echo.
echo =========================================================================
echo NetSentinel System Started Successfully!
echo Dashboard: http://localhost:3000
echo API Docs:  http://localhost:8000/docs
echo HDFS UI:   http://localhost:9870
echo =========================================================================
pause
