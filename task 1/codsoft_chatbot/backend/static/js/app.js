/* app.js - simplified: ONLY Chat functionality (no Rules/Analytics) */

/* DOM refs */
const chatWindow = document.getElementById('chatWindow');
const txtMessage = document.getElementById('txtMessage');
const btnSend = document.getElementById('btnSend');
const btnClear = document.getElementById('btnClear');
const btnExport = document.getElementById('btnExport');

const welcomeCenter = document.getElementById('welcomeCenter');
const welcomeInput = document.getElementById('welcomeInput');
const welcomeSend = document.getElementById('welcomeSend');

const USER_KEY = 'codsoft_user';
const STORAGE_KEY = (() => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return 'chat_anonymous_v1';
  try {
    const u = JSON.parse(raw);
    return 'chat_' + (u.name || 'anon').replace(/\s+/g,'_').toLowerCase() + '_v1';
  } catch(e) {
    return 'chat_anonymous_v1';
  }
})();

/* helpers */
function el(tag, cls, text){
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

function renderUserBubble(text){
  const msg = el('div','msg user');
  const bubble = el('div','bubble', text);
  msg.appendChild(bubble);
  chatWindow.appendChild(msg);
  scrollToBottom();
}
function renderBotBubble(text){
  const msg = el('div','msg bot');
  const bubble = el('div','bubble', text);
  msg.appendChild(bubble);
  chatWindow.appendChild(msg);
  scrollToBottom();
}

function renderTypingIndicator(){
  const wrapper = el('div','msg bot');
  const bubble = el('div','typing-indicator');
  bubble.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
  wrapper.appendChild(bubble);
  chatWindow.appendChild(wrapper);
  scrollToBottom();
  return wrapper;
}
function removeEl(node){ if (node && node.parentNode) node.parentNode.removeChild(node); }

function scrollToBottom(){
  chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: 'smooth' });
}

/* persistence */
function loadHistory(){
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; } catch(e) { return []; }
}
function saveHistory(arr){ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }
function pushHistory(entry){
  const h = loadHistory();
  h.push(entry);
  saveHistory(h);
}
function clearHistory(){ localStorage.removeItem(STORAGE_KEY); }

/* render from history */
function renderHistory(){
  chatWindow.innerHTML = '';
  const history = loadHistory();
  if (!history || history.length === 0) {
    showWelcomeCenter();
    return;
  }
  hideWelcomeCenter();
  history.forEach(it => {
    if (it.from === 'user') renderUserBubble(it.text);
    else renderBotBubble(it.text);
  });
}

/* welcome center */
function showWelcomeCenter(){ if (welcomeCenter) welcomeCenter.style.display = 'flex'; }
function hideWelcomeCenter(){ if (welcomeCenter) welcomeCenter.style.display = 'none'; }

/* send message to backend */
async function sendMessage(text){
  const userRaw = localStorage.getItem(USER_KEY);
  let userName = null;
  try { userName = userRaw ? JSON.parse(userRaw).name : null; } catch(e){ userName = null; }

  renderUserBubble(text);
  pushHistory({ from:'user', text, ts: Date.now() });
  hideWelcomeCenter();

  const typingEl = renderTypingIndicator();

  try {
    const payload = { message: text, user_name: userName };
    const resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(payload)
    });
    const j = await resp.json();
    removeEl(typingEl);
    const reply = (j && j.reply) ? j.reply : 'Sorry, invalid server response.';
    renderBotBubble(reply);
    pushHistory({ from:'bot', text: reply, ts: Date.now(), intent: j && j.intent ? j.intent : null });
    return j;
  } catch(err) {
    removeEl(typingEl);
    const fail = "Network error — could not reach server.";
    renderBotBubble(fail);
    pushHistory({ from:'bot', text: fail, ts: Date.now() });
    return null;
  }
}

/* UI wiring */
if (btnSend) {
  btnSend.addEventListener('click', ()=>{
    const v = txtMessage.value.trim();
    if (!v) return;
    txtMessage.value = '';
    sendMessage(v);
    txtMessage.focus();
  });
  txtMessage.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      btnSend.click();
    }
  });
}

if (welcomeSend) {
  welcomeSend.addEventListener('click', ()=>{
    const v = welcomeInput.value.trim();
    if (!v) return;
    welcomeInput.value = '';
    if (txtMessage) txtMessage.value = v;
    sendMessage(v);
  });
  welcomeInput.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      welcomeSend.click();
    }
  });
}

if (btnExport) {
  btnExport.addEventListener('click', ()=>{
    const history = loadHistory();
    const name = (localStorage.getItem(USER_KEY) && JSON.parse(localStorage.getItem(USER_KEY)).name) ? JSON.parse(localStorage.getItem(USER_KEY)).name.replace(/\s+/g,'_') : 'anon';
    const filename = `chat_${name}_${(new Date()).toISOString().slice(0,19).replace(/:/g,'-')}.json`;
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
}

if (btnClear) {
  btnClear.addEventListener('click', ()=>{
    if (!confirm('Clear chat history for this user?')) return;
    clearHistory();
    renderHistory();
  });
}

/* init */
renderHistory();
if (welcomeCenter && welcomeCenter.style.display !== 'none') {
  welcomeInput && welcomeInput.focus();
} else {
  txtMessage && txtMessage.focus();
}
window.addEventListener('resize', ()=>{ scrollToBottom(); });
