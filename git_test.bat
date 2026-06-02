@echo off
:: ZeroDrift - Git Diagnostic Test
cd /d "c:\Users\Vshal\Desktop\ZeroDrift\github"
echo Current dir: %CD%
git status --short
echo.
echo Untracked files:
git ls-files --others --exclude-standard
echo.
echo Modified files:
git diff --name-only
echo.
echo Last 5 commits:
git log --oneline -5
