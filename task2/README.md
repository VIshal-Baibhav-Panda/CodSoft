📘 Tic-Tac-Toe AI — CodSoft Internship Project

This is a Tic-Tac-Toe AI web application created by Vishal Baibhav Panda as part of the CodSoft Internship.
The project demonstrates the use of AI (minimax algorithm) combined with a modern neon-styled web interface.

🚀 Features

🎮 Human vs AI Gameplay — play against an AI powered by minimax with alpha-beta pruning.

🤖 AI vs AI Mode — watch two AIs play automatically.

🔄 Switch Side — play as X or O anytime.

♻️ Restart Option — reset the board with one click.

🛡 Fallback Local AI — works even if the backend server is unavailable.

✨ Modern Neon UI — responsive design with an optimized animated particle background.

📱 Responsive — works smoothly on desktop and mobile devices.

⬅️ Back to Home Button — easily navigate between pages.

📂 Project Structure
project-root/
├── backend/
│   └── app.py                # Flask backend for AI API
├── frontend/
│   ├── index.html            # Main landing page (with your name + internship info)
│   ├── game.html             # Game page (play Tic-Tac-Toe)
│   ├── css/
│   │   └── styles.css        # Styling (neon, responsive)
│   └── js/
│       ├── game.js           # Main game logic & UI control
│       ├── minimax_fallback.js # Local AI (fallback)
│       ├── background.js     # Optimized neon particle background
│       └── ...
├── README.md                 # Project overview
└── LICENSE                   # License terms (proprietary, all rights reserved)

⚙️ Installation & Setup

Clone the repository or copy files into your workspace.

Navigate to the project root and install dependencies:

pip install flask flask-cors


Run the backend server:

python backend/app.py


Open the app in your browser:
👉 http://127.0.0.1:5000/

🎯 Usage

From the main page, click “Open Tic-Tac-Toe Demo”.

On the game page:

Click cells to make moves.

Use Switch Side to change between X and O.

Use Restart to reset the board.

Use AI vs AI to watch automatic gameplay.

Use Force Local AI if backend is unavailable.

Click Back to Home to return to the main page.

🧠 AI Logic

Backend: Implements minimax with alpha-beta pruning for optimal AI moves.

Frontend fallback: A simpler local AI (minimax_fallback.js) ensures the game works offline.

🎨 Design

Neon-inspired UI with glowing buttons, highlights, and an animated particle network.

Optimized background rendering ensures smooth performance with reduced lag.

📜 License
Copyright (c) 2025 Vishal Baibhav Panda
All rights reserved.

This project and its source code are proprietary and confidential.
No part of this project may be copied, modified, distributed, or used in any form
without explicit written permission from the author.