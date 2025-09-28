/* background.js: gentle animated nodes + links, pointer-events:none */
(() => {
  const canvas = document.getElementById('bg-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w=0,h=0, particles=[];

  const cfg = {
    n: Math.max(16, Math.floor(window.innerWidth / 90)),
    maxDist: 160,
    speed: 0.45
  };

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    init();
  }

  function rand(min,max){ return Math.random()*(max-min)+min; }

  function init(){
    particles = [];
    for(let i=0;i<cfg.n;i++){
      particles.push({ x: rand(0,w), y:rand(0,h), vx:rand(-cfg.speed,cfg.speed), vy:rand(-cfg.speed,cfg.speed), r: rand(0.8,2.6) });
    }
  }

  function step(){
    ctx.clearRect(0,0,w,h);
    // subtle gradient backdrop
    const g = ctx.createLinearGradient(0,0,w,h);
    g.addColorStop(0, 'rgba(8,6,14,0.02)');
    g.addColorStop(1, 'rgba(10,6,20,0.02)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);

    // move & draw particles
    for(const p of particles){
      p.x += p.vx; p.y += p.vy;
      if(p.x < 0) p.x = w;
      if(p.x > w) p.x = 0;
      if(p.y < 0) p.y = h;
      if(p.y > h) p.y = 0;

      // glow
      const rad = p.r * 8;
      const grad = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,rad);
      grad.addColorStop(0, 'rgba(8,240,255,0.08)');
      grad.addColorStop(0.6, 'rgba(255,62,195,0.03)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x,p.y,rad,0,Math.PI*2);
      ctx.fill();

      // small dot
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath();
      ctx.arc(p.x,p.y, Math.max(1, p.r*0.4),0,Math.PI*2);
      ctx.fill();
    }

    // lines
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx*dx + dy*dy;
        if(d2 < cfg.maxDist * cfg.maxDist){
          const alpha = Math.max(0, 0.9 - (d2 / (cfg.maxDist*cfg.maxDist)));
          ctx.strokeStyle = `rgba(120,200,255,${alpha*0.12})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x,a.y);
          ctx.lineTo(b.x,b.y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(step);
})();
