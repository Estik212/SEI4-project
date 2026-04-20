#!/bin/bash
echo "============================================"
echo " SEI4 Project - Setup and Launch"
echo "============================================"
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python3 is not installed."
    echo "Please install it with: sudo apt install python3 python3-venv"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -f "activate/bin/python" ]; then
    echo "[1/3] Creating virtual environment..."
    python3 -m venv activate
    echo "      Done."
else
    echo "[1/3] Virtual environment already exists. Skipping."
fi

# Install dependencies
echo "[2/3] Installing dependencies from requirements.txt..."
activate/bin/pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install dependencies."
    exit 1
fi
echo "      Done."

# Start Flask app
echo "[3/3] Starting Flask application..."
echo
echo " Open your browser at: http://127.0.0.1:5000"
echo " Press CTRL+C to stop the server."
echo
export FLASK_APP=main.py
activate/bin/flask run
