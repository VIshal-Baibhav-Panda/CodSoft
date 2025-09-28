# tic_tac_toe_gui.py - Tkinter GUI
import tkinter as tk, random

EMPTY=" "
PLAYER_X="X"
PLAYER_O="O"

def check(b):
    lines=[(0,1,2),(3,4,5),(6,7,8),(0,3,6),(1,4,7),(2,5,8),(0,4,8),(2,4,6)]
    for a,b_,c in lines:
        if b[a]!=EMPTY and b[a]==b[b_]==b[c]: return b[a]
    return None

def ai_move(board):
    avail=[i for i,v in enumerate(board) if v==EMPTY]
    return random.choice(avail) if avail else None

class App:
    def __init__(self,root):
        self.root=root; self.board=[EMPTY]*9; self.btns=[]
        for i in range(9):
            b=tk.Button(root,text=" ",font=("Arial",24),width=4,height=2,command=lambda i=i:self.play(i))
            b.grid(row=i//3,column=i%3); self.btns.append(b)
    def play(self,i):
        if self.board[i]!=EMPTY: return
        self.board[i]="X"; self.btns[i]["text"]="X"
        if check(self.board): return
        m=ai_move(self.board)
        if m is not None: self.board[m]="O"; self.btns[m]["text"]="O"

if __name__=="__main__":
    root=tk.Tk(); App(root); root.mainloop()
