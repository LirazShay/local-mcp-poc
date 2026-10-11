@echo off
setlocal
cd /d "%~dp0"
if exist ".local\state.json" del /q ".local\state.json"
echo Local POC state reset.
