#!/bin/bash
# Run script for CodSoft Chatbot project

# always run from project root
cd "$(dirname "$0")"

# backend folder
cd backend

# create venv if it doesn’t exist
if [ ! -d "venv" ]; then
  echo "[*] Creating virtual environment..."
  python3 -m venv venv
fi

# activate venv
source venv/bin/activate

# install requirements if needed
if [ -f "requirements.txt" ]; then
  echo "[*] Installing Python dependencies..."
  pip install -r requirements.txt
fi

# run Flask app
echo "[*] Starting chatbot backend..."
python app.py
