# tic_tac_toe_ai.py - CLI version
import math, random

EMPTY=" "
PLAYER_X="X"
PLAYER_O="O"

def print_board(board):
    for r in range(3): print(" | ".join(board[r*3:(r+1)*3]))
    print()

def check(b):
    lines=[(0,1,2),(3,4,5),(6,7,8),(0,3,6),(1,4,7),(2,5,8),(0,4,8),(2,4,6)]
    for a,b_,c in lines:
        if b[a]!=EMPTY and b[a]==b[b_]==b[c]: return b[a]
    return None

def minimax(board,d,maxi,ai,h,alpha,beta):
    w=check(board)
    if w or all(x!=EMPTY for x in board):
        if w==ai: return 10-d
        if w==h: return d-10
        return 0
    if maxi:
        val=-math.inf
        for i,v in enumerate(board):
            if v==EMPTY:
                board[i]=ai
                val=max(val,minimax(board,d+1,False,ai,h,alpha,beta))
                board[i]=EMPTY
                alpha=max(alpha,val)
                if beta<=alpha: break
        return val
    else:
        val=math.inf
        for i,v in enumerate(board):
            if v==EMPTY:
                board[i]=h
                val=min(val,minimax(board,d+1,True,ai,h,alpha,beta))
                board[i]=EMPTY
                beta=min(beta,val)
                if beta<=alpha: break
        return val

def ai_move(board,ai,h):
    best=-math.inf; move=None
    for i,v in enumerate(board):
        if v==EMPTY:
            board[i]=ai
            val=minimax(board,0,False,ai,h,-math.inf,math.inf)
            board[i]=EMPTY
            if val>best: best,move=val,i
    return move

def main():
    board=[EMPTY]*9; human=PLAYER_X; ai=PLAYER_O; current=PLAYER_X
    while True:
        print_board(board)
        if check(board) or all(x!=EMPTY for x in board):
            print("Game Over"); break
        if current==human:
            m=int(input("Move 1-9: "))-1
            if board[m]!=EMPTY: continue
            board[m]=human; current=ai
        else:
            m=ai_move(board,ai,human); board[m]=ai; current=human

if __name__=="__main__": main()
