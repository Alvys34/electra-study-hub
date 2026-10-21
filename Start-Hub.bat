@echo off
title Study Hub
cd /d "%~dp0"
if not exist node_modules call npm install
call npm run dev -- --open
pause
