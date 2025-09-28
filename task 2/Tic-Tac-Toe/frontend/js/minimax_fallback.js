(function(global){
  function availableMoves(board){ const out=[]; for(let i=0;i<9;i++) if(board[i]===" ") out.push(i); return out; }
  function winner(b){ const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]; for(const [a,c,d] of lines) if(b[a]!==" "&&b[a]===b[c]&&b[a]===b[d]) return b[a]; return null; }
  function isFull(b){ return b.every(x=>x!==" "); }
  function score(w,ai,d){ if(!w) return 0; return w===ai?10-d:d-10; }
  function minimax(b,d,maxi,ai,h,alpha,beta){
    const w = winner(b); if(w||isFull(b)) return {score:score(w,ai,d),move:null};
    let best=null;
    if(maxi){
      let val=-Infinity;
      for(const m of availableMoves(b)){ b[m]=ai; const r=minimax(b,d+1,false,ai,h,alpha,beta); b[m]=" "; if(r.score>val){val=r.score;best=m;} alpha=Math.max(alpha,r.score); if(beta<=alpha) break; }
      return {score:val,move:best};
    } else {
      let val=Infinity;
      for(const m of availableMoves(b)){ b[m]=h; const r=minimax(b,d+1,true,ai,h,alpha,beta); b[m]=" "; if(r.score<val){val=r.score;best=m;} beta=Math.min(beta,r.score); if(beta<=alpha) break; }
      return {score:val,move:best};
    }
  }
  global.getAIMoveFallback = function(board, ai, human){ if(board[4]===" ") return 4; const r=minimax(board.slice(),0,true,ai,human,-Infinity,Infinity); if(r.move===null){ const av=availableMoves(board); return av[Math.floor(Math.random()*av.length)]; } return r.move; };
})(window);
