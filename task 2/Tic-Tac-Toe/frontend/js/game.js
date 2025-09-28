(function(){
  const API_URL = 'http://127.0.0.1:5000/api/move';
  const cells = Array.from(document.querySelectorAll('.cell'));
  const statusEl = document.getElementById('status');
  const humanSymbolEl = document.getElementById('humanSymbol');
  const switchBtn = document.getElementById('switchSide');
  const restartBtn = document.getElementById('restartBtn');
  const aiLocalToggle = document.getElementById('aiLocalToggle');
  const aiVsAiBtn = document.getElementById('aiVsAi');

  let board = Array(9).fill(' ');
  let human = 'X', ai = 'O';
  let current = 'X';
  let useLocalAI = false;
  let aiVsAiMode = false;

  function render(){
    cells.forEach((c,i)=>{
      const v = board[i];
      const glyph = c.querySelector('.glyph');
      c.classList.remove('x','o','played','win','disabled');
      glyph.textContent = '';
      if(v === 'X'){ c.classList.add('x','played'); glyph.textContent = '✕'; }
      else if(v === 'O'){ c.classList.add('o','played'); glyph.textContent = '◯'; }
      if(v !== ' ') c.classList.add('disabled');
    });
    humanSymbolEl.textContent = human;
    const w = checkWinner();
    if(w) statusEl.textContent = (w===human)?'You win!':'AI wins!';
    else if(isFull()) statusEl.textContent = 'Draw!';
    else statusEl.textContent = (current===human)?`Your turn (${human})`:`AI thinking (${ai})`;
  }

  function checkWinner(){
    const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for(const [a,b,c] of lines){
      if(board[a] !== ' ' && board[a] === board[b] && board[a] === board[c]){
        cells[a].classList.add('win'); cells[b].classList.add('win'); cells[c].classList.add('win');
        return board[a];
      }
    }
    return null;
  }

  function isFull(){ return board.every(x=>x!==' '); }

  async function requestAIMove(){
    if(useLocalAI) return getAIMoveFallback(board.slice(), ai, human);
    try {
      const res = await fetch(API_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({board,ai,human}) });
      if(!res.ok) throw new Error('bad');
      const j = await res.json();
      if(typeof j.move === 'number') return j.move;
      throw new Error('invalid');
    } catch(e){
      console.warn('Backend failed - using local fallback', e);
      return getAIMoveFallback(board.slice(), ai, human);
    }
  }

  async function doAIMove(){
    statusEl.textContent = 'AI thinking...';
    const move = await requestAIMove();
    if(typeof move !== 'number' || move<0 || move>8){
      const av = board.map((v,i)=>v===' '?i:null).filter(x=>x!==null);
      if(av.length===0) return;
      board[av[0]] = ai;
    } else {
      board[move] = ai;
    }
    current = human;
    render();
    if(checkWinner() || isFull()) return;
    if(aiVsAiMode){
      current = (current==='X') ? 'O' : 'X';
      setTimeout(()=> doAIMove(),220);
    }
  }

  async function afterMove(){
    if(checkWinner() || isFull()){ render(); return; }
    if(current !== human) setTimeout(()=> doAIMove(),200);
  }

  cells.forEach((cell, idx)=> cell.addEventListener('click', async ()=>{
    if(board[idx] !== ' ' || current !== human) return;
    board[idx] = human;
    current = ai;
    render();
    await afterMove();
  }));

  switchBtn?.addEventListener('click', ()=> {
    human = (human==='X') ? 'O' : 'X';
    ai = (ai==='X') ? 'O' : 'X';
    board = Array(9).fill(' ');
    current = 'X';
    aiVsAiMode = false;
    cells.forEach(c=>c.classList.remove('win'));
    render();
    if(ai==='X') setTimeout(()=> doAIMove(),220);
  });

  restartBtn?.addEventListener('click', ()=> {
    board = Array(9).fill(' ');
    current = 'X';
    aiVsAiMode = false;
    cells.forEach(c=>c.classList.remove('win'));
    render();
    if(ai==='X') setTimeout(()=> doAIMove(),220);
  });

  aiLocalToggle?.addEventListener('click', ()=> {
    useLocalAI = !useLocalAI;
    aiLocalToggle.classList.toggle('active', useLocalAI);
    aiLocalToggle.textContent = useLocalAI ? 'Local AI (ON)' : 'Force local AI';
  });

  aiVsAiBtn?.addEventListener('click', ()=> {
    aiVsAiMode = !aiVsAiMode;
    board = Array(9).fill(' ');
    cells.forEach(c=>c.classList.remove('win'));
    current = 'X';
    render();
    if(aiVsAiMode) setTimeout(()=> { if(current !== human) doAIMove(); }, 200);
  });

  render();
  if(ai === 'X') setTimeout(()=> doAIMove(),220);
})();
