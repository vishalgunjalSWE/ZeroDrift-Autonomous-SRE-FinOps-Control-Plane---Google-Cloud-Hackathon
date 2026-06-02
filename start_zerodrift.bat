@echo off
title ZeroDrift Enterprise Launcher
echo ==================================================
echo 🚀 STARTING ZERODRIFT AUTONOMOUS SRE SYSTEM...
echo ==================================================
echo.

echo [1/3] Starting FastAPI Webhook Server...
start "ZeroDrift - Backend" cmd /k "python server_webhook.py"
timeout /t 3 >nul

echo [2/3] Starting Next.js FinOps Console...
start "ZeroDrift - UI" cmd /k "cd web && npm run dev"
timeout /t 3 >nul

echo [3/3] Starting Ngrok Tunnel...
start "ZeroDrift - Ngrok" cmd /k "npx ngrok http 8000"

echo.
echo ✅ ALL SYSTEMS ARE ONLINE!
echo ⚠️ Note: Check the Ngrok window for your public URL and update GitLab if it has changed.
echo ==================================================