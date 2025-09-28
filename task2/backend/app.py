# backend/app.py
import os
import math
import random
from flask import Flask, request, jsonify, send_from_directory, abort
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# frontend is a sibling directory to backend
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'frontend'))

# if the frontend folder doesn't exist, fallback to current dir
if not os.path.isdir(FRONTEND_DIR):
    FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')
    if not os.path.isdir(FRONTEND_DIR):
        FRONTEND_DIR = BASE_DIR

app = Flask(__name__,
            static_folder=FRONTEND_DIR,
            static_url_path='')  # serve frontend at root
CORS(app)

EMPTY = " "

def available_moves(board):
    return [i for i, v in enumerate(board) if v == EMPTY]

def check_winner(board):
    lines = [(0,1,2),(3,4,5),(6,7,8),(0,3,6),(1,4,7),(2,5,8),(0,4,8),(2,4,6)]
    for a,b,c in lines:
        if board[a] != EMPTY and board[a] == board[b] == board[c]:
            return board[a]
    return None

def is_full(board):
    return all(c != EMPTY for c in board)

def score_for(w, ai, depth):
    if not w:
        return 0
    return (10 - depth) if w == ai else (depth - 10)

def minimax(board, depth, maximizing, ai, human, alpha, beta):
    winner = check_winner(board)
    if winner or is_full(board):
        return score_for(winner, ai, depth), None

    best_move = None
    if maximizing:
        best_score = -math.inf
        for m in available_moves(board):
            board[m] = ai
            sc, _ = minimax(board, depth+1, False, ai, human, alpha, beta)
            board[m] = EMPTY
            if sc > best_score:
                best_score = sc
                best_move = m
            alpha = max(alpha, sc)
            if beta <= alpha:
                break
        return best_score, best_move
    else:
        best_score = math.inf
        for m in available_moves(board):
            board[m] = human
            sc, _ = minimax(board, depth+1, True, ai, human, alpha, beta)
            board[m] = EMPTY
            if sc < best_score:
                best_score = sc
                best_move = m
            beta = min(beta, sc)
            if beta <= alpha:
                break
        return best_score, best_move

def ai_move(board, ai, human):
    # quick center preference
    try:
        if board[4] == EMPTY:
            return 4
    except Exception:
        pass

    score, move = minimax(board, 0, True, ai, human, -math.inf, math.inf)
    if move is None:
        av = available_moves(board)
        return random.choice(av) if av else None
    return move

@app.route('/api/move', methods=['POST'])
def api_move():
    data = request.get_json() or {}
    board = data.get('board')
    ai = data.get('ai')
    human = data.get('human')
    if not isinstance(board, list) or len(board) != 9:
        return jsonify({'error': 'invalid board'}), 400
    move = ai_move(board, ai, human)
    return jsonify({'move': move})

@app.route('/')
def index():
    index_path = os.path.join(FRONTEND_DIR, 'index.html')
    if os.path.isfile(index_path):
        return send_from_directory(FRONTEND_DIR, 'index.html')
    try:
        return app.send_static_file('index.html')
    except Exception:
        abort(404)

@app.route('/game.html')
def game_html():
    if os.path.isfile(os.path.join(FRONTEND_DIR, 'game.html')):
        return send_from_directory(FRONTEND_DIR, 'game.html')
    abort(404)

@app.route('/favicon.ico')
def favicon():
    fav = os.path.join(FRONTEND_DIR, 'favicon.ico')
    if os.path.isfile(fav):
        return send_from_directory(FRONTEND_DIR, 'favicon.ico')
    return ('', 204)

if __name__ == '__main__':
    # For local dev: debug True; production: debug False and use proper server
    app.run(host='0.0.0.0', port=5000, debug=True)
