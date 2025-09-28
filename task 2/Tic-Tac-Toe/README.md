# 🎮 CodSoft Internship — Task 2  
## Tic-Tac-Toe AI (Unbeatable with Minimax + Alpha-Beta Pruning)

![Python](https://img.shields.io/badge/Python-3.8+-blue?logo=python)
![Flask](https://img.shields.io/badge/Flask-Backend-black?logo=flask)
![HTML5](https://img.shields.io/badge/HTML-Frontend-orange?logo=html5)
![CSS3](https://img.shields.io/badge/CSS-Frontend-blue?logo=css3)
![JavaScript](https://img.shields.io/badge/JavaScript-Frontend-yellow?logo=javascript)

---

### 📌 Overview
This project is part of my **CodSoft AI Internship (Task 2)**.  
It implements a **Tic-Tac-Toe AI that is unbeatable**, built with the **Minimax algorithm enhanced with Alpha-Beta pruning**.

The solution includes:
- ✅ Terminal version (Python CLI)  
- ✅ GUI version (Tkinter)  
- ✅ Modern Web App (HTML/CSS/JS + Flask backend)  
- ✅ Local Minimax fallback  
- ✅ Extra features: Switch side, Restart, AI vs AI (future-ready)  

---

### 🏗️ Project Structure
```
CODSOFT-task2-tic-tac-toe/
│
├── backend/              # Flask backend API (Python)
│   ├── app.py
│   └── requirements.txt
│
├── frontend/             # Modern Web Interface
│   ├── index.html        # Landing page
│   ├── game.html         # Game board
│   ├── css/styles.css    # Neon modern styles
│   ├── js/
│   │   ├── background.js # Animated particle background
│   │   ├── minimax_fallback.js # Local JS Minimax AI
│   │   └── game.js       # Game logic + UI handling
│   └── assets/           # (Optional) images, logos
│
├── tic_tac_toe_ai.py     # Terminal version (Python)
├── tic_tac_toe_gui.py    # GUI version (Tkinter)
├── ai_vs_ai.py           # AI vs AI simulation (Python)
├── tests/                # Unit tests
│   └── test_minimax.py
├── README.md             # Documentation
└── demo_script.txt       # Video demo script
```

---

### 🚀 Features
- 🎨 Modern UI — neon design + animated background  
- 🖥️ Terminal, GUI, and Web modes  
- 🧠 Unbeatable AI (Minimax + Alpha-Beta pruning)  
- 🔄 Switch Side, Restart  
- 🤖 AI vs AI Mode (future-ready)  
- ⚡ Backend API with JSON responses  

---

### 🔧 Installation & Setup

#### 1️⃣ Clone the repository
```bash
git clone https://github.com/yourusername/CODSOFT-task2-tic-tac-toe.git
cd CODSOFT-task2-tic-tac-toe
```

#### 2️⃣ Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Backend runs at: **http://127.0.0.1:5000**

#### 3️⃣ Frontend Setup
```bash
cd frontend
python3 -m http.server 8000
```
Open: [http://localhost:8000](http://localhost:8000)

---

### 🎮 Usage

#### ▶ Terminal
```bash
python3 tic_tac_toe_ai.py
```

#### ▶ GUI
```bash
python3 tic_tac_toe_gui.py
```

#### ▶ Web (recommended)
- Start backend (`python app.py`)  
- Serve frontend (`python3 -m http.server 8000`)  
- Open browser at [http://localhost:8000](http://localhost:8000)  

---

### 📡 API Reference
**Endpoint:** `/api/move`  
**Method:** POST  
**Payload:**
```json
{
  "board": ["X","O"," "," ","X"," "," "," ","O"],
  "ai": "X",
  "human": "O"
}
```
**Response:**
```json
{ "move": 5 }
```

---

### 👨‍💻 Author
**Vishal Baibhav Panda**  
📌 CodSoft AI Internship (Task 2)  

---

### 📜 License
Copyright (c) 2025 Vishal Baibhav Panda  
All Rights Reserved.  

This project and its source code are proprietary and confidential.  
No part of this project may be copied, modified, shared, or used in any form  
without the prior written permission of the author.  

Unauthorized use, reproduction, or distribution of this project is strictly prohibited.  

