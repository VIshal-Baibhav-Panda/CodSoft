from flask import Flask, request, jsonify
from flask_cors import CORS
import math, random

app = Flask(__name__)
CORS(app)

EMPTY = " "
PLAYER_X = "X"
PLAYER_O = "O"

def available_moves(board): return [i for i,v in enumerate(board) if v==EMPTY]
def check_winner(board):
    lines=[(0,1,2),(3,4,5),(6,7,8),(0,3,6),(1,4,7),(2,5,8),(0,4,8),(2,4,6)]
    for a,b,c in lines:
        if board[a]!=EMPTY and board[a]==board[b]==board[c]: return board[a]
    return None
def is_full(board): return all(c!=EMPTY for c in board)
def score_for(w, ai, d): return 0 if w is None else (10-d if w==ai else d-10)

def minimax(board,d,maxi,ai,h,a,beta):
    w=check_winner(board)
    if w or is_full(board): return score_for(w,ai,d),None
    best=None
    if maxi:
        val=-math.inf
        for m in available_moves(board):
            board[m]=ai
            sc,_=minimax(board,d+1,False,ai,h,a,beta); board[m]=EMPTY
            if sc>val: val,best=sc,m
            a=max(a,sc)
            if beta<=a: break
        return int(val),best
    else:
        val=math.inf
        for m in available_moves(board):
            board[m]=h
            sc,_=minimax(board,d+1,True,ai,h,a,beta); board[m]=EMPTY
            if sc<val: val,best=sc,m
            beta=min(beta,sc)
            if beta<=a: break
        return int(val),best

def ai_move(board,ai,h):
    if board[4]==EMPTY: return 4
    _,m=minimax(board,0,True,ai,h,-math.inf,math.inf)
    return m if m is not None else random.choice(available_moves(board))

@app.route('/api/move',methods=['POST'])
def api_move():
    data=request.get_json() or {}
    board=data.get('board'); ai=data.get('ai'); human=data.get('human')
    if not isinstance(board,list) or len(board)!=9: return jsonify({'error':'invalid board'}),400
    move=ai_move(board,ai,human)
    return jsonify({'move':move})

if __name__=="__main__":
    app.run(host="0.0.0.0",port=5000,debug=True)
