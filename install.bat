@echo off
echo ============================================
echo  SEI4 Project - Setup and Launch
echo ============================================
echo.

REM Check if Python is installed (try 'py' launcher first, then 'python')
set PYTHON_CMD=
py --version >nul 2>&1
if not errorlevel 1 (
    set PYTHON_CMD=py
) else (
    python --version >nul 2>&1
    if not errorlevel 1 (
        set PYTHON_CMD=python
    )
)

if "%PYTHON_CMD%"=="" (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Create virtual environment if it doesn't exist
if not exist "activate\Scripts\python.exe" (
    echo [1/3] Creating virtual environment...
    %PYTHON_CMD% -m venv activate
    echo       Done.
) else (
    echo [1/3] Virtual environment already exists. Skipping.
)

REM Install dependencies
echo [2/3] Installing dependencies from requirements.txt...
activate\Scripts\pip.exe install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b 1
)
echo       Done.

REM Start Flask app
echo [3/3] Starting Flask application...
echo.
echo  Open your browser at: http://127.0.0.1:5000
echo  Press CTRL+C to stop the server.
echo.
set FLASK_APP=main.py
activate\Scripts\flask.exe run
