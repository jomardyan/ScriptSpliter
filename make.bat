@echo off
REM ScriptSpliter Makefile wrapper for Windows Command Prompt
REM Usage: make.bat <target> [OPTIONS]

setlocal enabledelayedexpansion

if "%1"=="" (
    powershell -ExecutionPolicy Bypass -File "%~dp0make.ps1" help
    exit /b 0
)

powershell -ExecutionPolicy Bypass -File "%~dp0make.ps1" %*
