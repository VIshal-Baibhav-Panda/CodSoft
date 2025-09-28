// frontend/js/minimax_fallback.js
// Exposes getAIMoveFallback(board, aiSym, humanSym)
// Simple heuristic: win/block -> center -> corner -> side -> random

(function(global){
  function availableIndices(bd){
    return bd.map((v,i)=>v===' '?i:null).filter(x=>x!==null);
  }

  function findLineIndex(bd, sym){
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for(const [a,b,c] of lines){
      const vals = [bd[a], bd[b], bd[c]];
      if(vals.filter(v=>v===sym).length === 2 && vals.filter(v=>v===' ').length === 1){
        return [a,b,c][vals.indexOf(' ')];
      }
    }
    return null;
  }

  function getAIMoveFallback(bd, aiSym, humanSym){
    // win
    let idx = findLineIndex(bd, aiSym);
    if(idx !== null) return idx;
    // block
    idx = findLineIndex(bd, humanSym);
    if(idx !== null) return idx;
    // center
    if(bd[4] === ' ') return 4;
    // corners
    const corners = [0,2,6,8].filter(i=>bd[i]===' ');
    if(corners.length) return corners[Math.floor(Math.random()*corners.length)];
    // sides
    const sides = [1,3,5,7].filter(i=>bd[i]===' ');
    if(sides.length) return sides[Math.floor(Math.random()*sides.length)];
    // random fallback
    const av = availableIndices(bd);
    return av.length ? av[Math.floor(Math.random()*av.length)] : null;
  }

  global.getAIMoveFallback = getAIMoveFallback;
})(window);
