// frontend/js/game.js
(function(){
  const API_URL = '/api/move';

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

  const opponent = s => (s === 'X' ? 'O' : 'X');
  const isFull = () => board.every(x => x !== ' ');
  function availableIndices() { return board.map((v,i)=>v===' '?i:null).filter(x=>x!==null); }

  function render(){
    cells.forEach((c,i)=>{
      const v = board[i];
      const glyph = c.querySelector('.glyph');
      c.classList.remove('x','o','played','win','disabled');
      if(glyph) glyph.textContent = '';
      if(v === 'X'){ c.classList.add('x','played'); if(glyph) glyph.textContent = '✕'; }
      else if(v === 'O'){ c.classList.add('o','played'); if(glyph) glyph.textContent = '◯'; }
      if(v !== ' ') c.classList.add('disabled');
    });
    if(humanSymbolEl) humanSymbolEl.textContent = human;
    const w = checkWinner();
    if(w) statusEl && (statusEl.textContent = (w === human ? 'You win!' : 'AI wins!'));
    else if(isFull()) statusEl && (statusEl.textContent = 'Draw!');
    else statusEl && (statusEl.textContent = (current === human ? `Your turn (${human})` : `AI thinking (${current})`));
  }

  function checkWinner(){
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for(const [a,b,c] of lines){
      if(board[a] !== ' ' && board[a] === board[b] && board[a] === board[c]){
        if(cells[a]) cells[a].classList.add('win');
        if(cells[b]) cells[b].classList.add('win');
        if(cells[c]) cells[c].classList.add('win');
        return board[a];
      }
    }
    return null;
  }

  async function requestMoveFor(playerSymbol){
    const opp = opponent(playerSymbol);
    if(useLocalAI && typeof getAIMoveFallback === 'function'){
      return getAIMoveFallback(board.slice(), playerSymbol, opp);
    }
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ board, ai: playerSymbol, human: opp })
      });
      if(!res.ok) throw new Error('bad response');
      const j = await res.json();
      if(typeof j.move === 'number') return j.move;
      throw new Error('invalid payload');
    } catch(e){
      console.warn('Backend AI failed — falling back to local minimax', e);
      if(typeof getAIMoveFallback === 'function'){
        return getAIMoveFallback(board.slice(), playerSymbol, opp);
      }
      const av = availableIndices();
      return av.length ? av[Math.floor(Math.random()*av.length)] : null;
    }
  }

  async function performAIMoveFor(playerSymbol){
    const move = await requestMoveFor(playerSymbol);
    if(typeof move !== 'number' || move < 0 || move > 8 || board[move] !== ' '){
      const av = availableIndices();
      if(av.length === 0) return null;
      const chosen = av[Math.floor(Math.random()*av.length)];
      board[chosen] = playerSymbol;
      return chosen;
    } else {
      board[move] = playerSymbol;
      return move;
    }
  }

  async function aiVsAiLoop(){
    if(!aiVsAiMode) return;
    if(checkWinner() || isFull()){
      aiVsAiMode = false;
      if(aiVsAiBtn){ aiVsAiBtn.classList.remove('active'); aiVsAiBtn.textContent = 'AI vs AI'; }
      render();
      return;
    }
    await performAIMoveFor(current);
    render();
    if(checkWinner() || isFull()){
      aiVsAiMode = false;
      if(aiVsAiBtn){ aiVsAiBtn.classList.remove('active'); aiVsAiBtn.textContent = 'AI vs AI'; }
      return;
    }
    current = opponent(current);
    setTimeout(() => {
      if(aiVsAiMode) aiVsAiLoop();
    }, 220);
  }

  async function doAIMove(){
    if(aiVsAiMode) return;
    statusEl && (statusEl.textContent = 'AI thinking...');
    const move = await requestMoveFor(ai);
    if(typeof move !== 'number' || move < 0 || move > 8 || board[move] !== ' '){
      const av = availableIndices();
      if(av.length === 0) return;
      board[av[0]] = ai;
    } else {
      board[move] = ai;
    }
    current = human;
    render();
  }

  async function afterHumanMove(){
    if(checkWinner() || isFull()){ render(); return; }
    if(!aiVsAiMode && current !== human){
      setTimeout(() => doAIMove(), 180);
    }
  }

  cells.forEach((cell, idx) => {
    cell.addEventListener('click', async () => {
      if(aiVsAiMode) return;
      if(board[idx] !== ' ' || current !== human) return;
      board[idx] = human;
      current = ai;
      render();
      await afterHumanMove();
    });
  });

  switchBtn?.addEventListener('click', () => {
    aiVsAiMode = false;
    if(aiVsAiBtn){ aiVsAiBtn.classList.remove('active'); aiVsAiBtn.textContent = 'AI vs AI'; }
    human = (human === 'X') ? 'O' : 'X';
    ai = opponent(human);
    board = Array(9).fill(' ');
    current = 'X';
    cells.forEach(c => c.classList.remove('win'));
    render();
    if(ai === 'X'){ setTimeout(() => { if(!aiVsAiMode) doAIMove(); }, 180); }
  });

  restartBtn?.addEventListener('click', () => {
    aiVsAiMode = false;
    if(aiVsAiBtn){ aiVsAiBtn.classList.remove('active'); aiVsAiBtn.textContent = 'AI vs AI'; }
    board = Array(9).fill(' ');
    current = 'X';
    cells.forEach(c => c.classList.remove('win'));
    render();
    if(ai === 'X'){ setTimeout(() => { if(!aiVsAiMode) doAIMove(); }, 180); }
  });

  aiLocalToggle?.addEventListener('click', () => {
    useLocalAI = !useLocalAI;
    aiLocalToggle.classList.toggle('active', useLocalAI);
    aiLocalToggle.textContent = useLocalAI ? 'Local AI (ON)' : 'Force local AI';
  });

  aiVsAiBtn?.addEventListener('click', () => {
    aiVsAiMode = !aiVsAiMode;
    if(aiVsAiMode){
      aiVsAiBtn.classList.add('active');
      aiVsAiBtn.textContent = 'Stop AI vs AI';
      board = Array(9).fill(' ');
      current = 'X';
      cells.forEach(c => c.classList.remove('win'));
      render();
      setTimeout(() => aiVsAiLoop(), 180);
    } else {
      aiVsAiBtn.classList.remove('active');
      aiVsAiBtn.textContent = 'AI vs AI';
    }
  });

  render();
  if(ai === 'X' && !aiVsAiMode) setTimeout(() => doAIMove(), 220);
})();
