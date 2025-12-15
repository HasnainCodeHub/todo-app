@echo off
REM Quick test runner for Windows
REM Usage: run_tests.bat [options]
REM   run_tests.bat           - Run all tests
REM   run_tests.bat unit      - Run unit tests only
REM   run_tests.bat api       - Run API tests only
REM   run_tests.bat coverage  - Run with coverage report

cd /d "%~dp0"

if "%1"=="unit" (
    echo Running unit tests...
    pytest tests/test_services.py -v
) else if "%1"=="api" (
    echo Running API tests...
    pytest tests/test_api.py -v
) else if "%1"=="coverage" (
    echo Running tests with coverage...
    pytest --cov=app --cov-report=html --cov-report=term-missing
    echo Coverage report generated in htmlcov/index.html
) else (
    echo Running all tests...
    pytest -v
)
