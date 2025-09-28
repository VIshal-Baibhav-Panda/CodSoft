#!/bin/bash
echo "====================================="
echo " CodSoft Task2 - Tic Tac Toe AI"
echo "====================================="
echo "Choose mode to run:"
echo "1) CLI (Terminal)"
echo "2) GUI (Tkinter)"
echo "3) Web (Flask backend + Frontend server)"
echo "q) Quit"
read -p "Enter choice: " choice

BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

case $choice in
  1)
    echo "Running CLI..."
    python3 "$BASE_DIR/tic_tac_toe_ai.py"
    ;;
  2)
    echo "Running GUI..."
    python3 "$BASE_DIR/tic_tac_toe_gui.py"
    ;;
  3)
    echo "Starting Backend (Flask)..."
    (cd "$BASE_DIR/backend" && python3 app.py) &
    BACK_PID=$!
    sleep 2
    echo "Starting Frontend (http.server on port 8000)..."
    (cd "$BASE_DIR/frontend" && python3 -m http.server 8000) &
    FRONT_PID=$!
    echo "Web running at http://127.0.0.1:8000/"
    echo "Press Ctrl+C to stop servers."
    wait $BACK_PID $FRONT_PID
    ;;
  q|Q)
    echo "Bye!"
    exit 0
    ;;
  *)
    echo "Invalid choice"
    ;;
esac
