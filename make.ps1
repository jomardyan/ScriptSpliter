# ScriptSpliter Makefile alternative for Windows PowerShell
# Usage: .\make.ps1 <target> [OPTIONS]

param(
    [string]$Target = "help",
    [Alias("Input")][string]$InputFile = "",
    [string]$Output = "",
    [string]$File = "",
    [string]$Block = "",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Show-Help {
    Write-Host "ScriptSpliter - PowerShell Make Script" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Installation:" -ForegroundColor Green
    Write-Host "  .\make.ps1 install         - Install the package"
    Write-Host "  .\make.ps1 dev-install     - Install with development dependencies"
    Write-Host "  .\make.ps1 uninstall       - Uninstall the package"
    Write-Host ""
    Write-Host "Development:" -ForegroundColor Green
    Write-Host "  .\make.ps1 lint            - Run code linting (flake8)"
    Write-Host "  .\make.ps1 format          - Format code with black and isort"
    Write-Host "  .\make.ps1 type-check      - Run type checking with mypy"
    Write-Host "  .\make.ps1 test            - Run tests with pytest"
    Write-Host "  .\make.ps1 test-coverage   - Run tests with coverage report"
    Write-Host ""
    Write-Host "Building:" -ForegroundColor Green
    Write-Host "  .\make.ps1 build           - Build distribution packages"
    Write-Host "  .\make.ps1 clean           - Clean up build artifacts"
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Green
    Write-Host "  .\make.ps1 run -Input <file.js> [-DryRun]         - Run the CLI tool"
    Write-Host "  .\make.ps1 analyze -File <file.js>               - Analyze a JavaScript file"
    Write-Host "  .\make.ps1 blocks-info -File <file.js>           - Show detected blocks"
    Write-Host "  .\make.ps1 show-deps -File <file.js> -Block name - Show dependencies"
    Write-Host ""
    Write-Host "Utilities:" -ForegroundColor Green
    Write-Host "  .\make.ps1 freeze          - Generate frozen requirements"
    Write-Host "  .\make.ps1 check-all       - Run all checks (lint, type-check, test)"
}

function Invoke-Command {
    param([string]$Command)
    Write-Host "Executing: $Command" -ForegroundColor Yellow
    Invoke-Expression $Command
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Command failed with exit code $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
}

function Get-CLICommand {
    if (Get-Command "script-spliter" -ErrorAction SilentlyContinue) {
        return "script-spliter"
    }
    return "python -m script_spliter.cli"
}

switch ($Target.ToLower()) {
    "help" {
        Show-Help
    }
    
    "install" {
        Invoke-Command "pip install -e ."
        Write-Host "Installation complete!" -ForegroundColor Green
    }
    
    "dev-install" {
        Invoke-Command "pip install -e `".[dev]`""
        Invoke-Command "pip install -r requirements.txt"
        Write-Host "Development installation complete!" -ForegroundColor Green
    }
    
    "uninstall" {
        Invoke-Command "pip uninstall -y script-spliter"
        Write-Host "Uninstall complete!" -ForegroundColor Green
    }
    
    "lint" {
        Invoke-Command "flake8 script_spliter/ tests/ --max-line-length=100 --exclude=__pycache__"
    }
    
    "format" {
        Invoke-Command "black script_spliter/ tests/ --line-length=100"
        Invoke-Command "isort script_spliter/ tests/ --profile black --line-length=100"
        Write-Host "Code formatting complete!" -ForegroundColor Green
    }
    
    "type-check" {
        Invoke-Command "mypy script_spliter/ --python-version=3.8"
    }
    
    "test" {
        Invoke-Command "pytest tests/ -v"
    }
    
    "test-coverage" {
        Invoke-Command "pytest tests/ -v --cov=script_spliter --cov-report=html --cov-report=term"
        Write-Host "Coverage report generated in htmlcov/" -ForegroundColor Green
    }
    
    "build" {
        Invoke-PowerShell -Target "clean"
        Invoke-Command "python -m build"
        Write-Host "Build complete!" -ForegroundColor Green
    }
    
    "clean" {
        Write-Host "Cleaning build artifacts..." -ForegroundColor Yellow
        Remove-Item -Path "build" -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item -Path "*.egg-info" -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item -Path ".pytest_cache" -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item -Path ".mypy_cache" -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item -Path "htmlcov" -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item -Path ".coverage" -Force -ErrorAction SilentlyContinue
        Get-ChildItem -Path . -Include "__pycache__" -Recurse -Directory | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
        Get-ChildItem -Path . -Include "*.pyc" -Recurse | Remove-Item -Force -ErrorAction SilentlyContinue
        Write-Host "Clean complete!" -ForegroundColor Green
    }
    
    "run" {
        if ([string]::IsNullOrEmpty($InputFile)) {
            Write-Host "Usage: .\make.ps1 run -Input <file.js> [-Output <dir>]" -ForegroundColor Red
            exit 1
        }
        $cli = Get-CLICommand
        $cmd = "$cli `"$InputFile`""
        if (-not [string]::IsNullOrEmpty($Output)) {
            $cmd += " -o `"$Output`""
        }
        if ($DryRun) {
            $cmd += " --dry-run"
        }
        Invoke-Command $cmd
    }
    
    "analyze" {
        if ([string]::IsNullOrEmpty($File)) {
            Write-Host "Usage: .\make.ps1 analyze -File <file.js>" -ForegroundColor Red
            exit 1
        }
        $cli = Get-CLICommand
        Invoke-Command "$cli `"$File`" --analyze"
    }
    
    "blocks-info" {
        if ([string]::IsNullOrEmpty($File)) {
            Write-Host "Usage: .\make.ps1 blocks-info -File <file.js>" -ForegroundColor Red
            exit 1
        }
        $cli = Get-CLICommand
        Invoke-Command "$cli `"$File`" --blocks-info"
    }
    
    "show-deps" {
        if ([string]::IsNullOrEmpty($File) -or [string]::IsNullOrEmpty($Block)) {
            Write-Host "Usage: .\make.ps1 show-deps -File <file.js> -Block <blockName>" -ForegroundColor Red
            exit 1
        }
        $cli = Get-CLICommand
        Invoke-Command "$cli `"$File`" --deps $Block"
    }
    
    "freeze" {
        Invoke-Command "pip freeze > requirements-frozen.txt"
        Write-Host "Frozen requirements saved to requirements-frozen.txt" -ForegroundColor Green
    }
    
    "check-all" {
        Write-Host "Running all checks..." -ForegroundColor Cyan
        & $PSScriptRoot\make.ps1 lint
        & $PSScriptRoot\make.ps1 type-check
        & $PSScriptRoot\make.ps1 test
        Write-Host "All checks passed!" -ForegroundColor Green
    }
    
    "setup" {
        & $PSScriptRoot\make.ps1 dev-install
        Write-Host "Development environment setup complete!" -ForegroundColor Green
        Write-Host "Run '.\make.ps1 check-all' to verify everything is working" -ForegroundColor Cyan
    }
    
    default {
        Write-Host "Unknown target: $Target" -ForegroundColor Red
        Show-Help
        exit 1
    }
}
