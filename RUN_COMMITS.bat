@echo off
setlocal EnableDelayedExpansion
:: ================================================================
:: ZeroDrift - Production Grade Per-File Git Commit Launcher
:: 
:: HOW TO RUN:
::   Option 1: Double-click this file in Windows Explorer
::   Option 2: Open CMD, type: c:\Users\Vshal\Desktop\ZeroDrift\github\RUN_COMMITS.bat
::   Option 3: Open PowerShell, run:
::             powershell -ExecutionPolicy Bypass -File "c:\Users\Vshal\Desktop\ZeroDrift\github\commit_files.ps1"
:: ================================================================

cd /d "c:\Users\Vshal\Desktop\ZeroDrift\github"
echo.
echo ============================================================
echo   ZeroDrift -- Production Grade Per-File Git Commit Tool
echo ============================================================
echo   Repo: %CD%
echo.

git status --short
echo.
echo Starting PowerShell commit script...
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0commit_files.ps1"

echo.
echo ============================================================
echo   Script finished! Press any key to close.
echo ============================================================
pause
