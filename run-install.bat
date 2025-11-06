@echo off
REM Ensure script runs from repository root
cd /d "%~dp0"
REM Use explicit npm from D:\node to avoid PATH issues
"D:\node\npm.cmd" install %*

