// frontend/js/background.js
// Neon particle network background with connecting lines.
// Lightweight, plain JS - no libraries.

(function(){
  // create canvas inside #floating-bg or attach to body if absent
  const container = document.getElementById('floating-bg') || (function(){
    const el = document.createElement('div'); el.id = 'floating-bg'; document.body.appendChild(el); return el;
  })();

  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  canvas.style.position = 'absolute';
  canvas.style.left = '0'; canvas.style.top = '0';
  canvas.style.zIndex = '0';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  let w = canvas.width = innerWidth * devicePixelRatio;
  let h = canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.scale(devicePixelRatio, devicePixelRatio);

  const PARTICLES = Math.round(Math.max(18, Math.min(60, (innerWidth + innerHeight) / 60)));
  const pcount = Math.floor(PARTICLES);
  const particles = [];

  function rand(min, max){ return Math.random()*(max-min)+min; }

  function createParticles(){
    particles.length = 0;
    for(let i=0;i<pcount;i++){
      particles.push({
        x: rand(0, innerWidth),
        y: rand(0, innerHeight),
        vx: rand(-0.4, 0.4),
        vy: rand(-0.4, 0.4),
        r: rand(1.5, 3.5),
        hue: Math.random() < 0.6 ? 180+rand(-10,30) : 270+rand(-20,20), // teal-ish or purple-ish
        alpha: rand(0.5, 0.95)
      });
    }
  }

  function resize(){
    w = canvas.width = innerWidth * devicePixelRatio;
    h = canvas.height = innerHeight * devicePixelRatio;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
    createParticles();
  }
  addEventListener('resize', resize);

  // mouse interaction (subtle attraction)
  const mouse = {x: -9999, y: -9999};
  addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  addEventListener('mouseout', ()=>{ mouse.x = -9999; mouse.y = -9999; });

  function step(){
    ctx.clearRect(0,0,innerWidth,innerHeight);

    // draw soft glow background (subtle)
    const g = ctx.createRadialGradient(innerWidth*0.2, innerHeight*0.12, 0, innerWidth*0.2, innerHeight*0.12, Math.max(innerWidth,innerHeight)*0.9);
    g.addColorStop(0, 'rgba(16,240,214,0.02)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,innerWidth,innerHeight);

    // update and draw particles
    for(let i=0;i<particles.length;i++){
      const p = particles[i];

      // subtle attraction towards mouse if nearby
      if(mouse.x > -9000){
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx,dy);
        if(dist < 150){
          p.vx += (dx / dist) * 0.02;
          p.vy += (dy / dist) * 0.02;
        }
      }

      p.x += p.vx;
      p.y += p.vy;

      // wrap edges with slight bounce
      if(p.x < -20) p.x = innerWidth + 20;
      if(p.x > innerWidth + 20) p.x = -20;
      if(p.y < -20) p.y = innerHeight + 20;
      if(p.y > innerHeight + 20) p.y = -20;

      // draw glow
      ctx.beginPath();
      ctx.globalCompositeOperation = 'lighter';
      const col = `hsla(${p.hue}, 90%, 60%, ${p.alpha})`;
      ctx.fillStyle = col;
      ctx.shadowBlur = p.r * 6;
      ctx.shadowColor = col;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'source-over';
    }

    // connect close particles with neon lines
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.hypot(dx,dy);
        if(dist < 160){
          const alpha = (1 - dist/160) * 0.25; // thinner further away
          // color blend between two hues
          const hue = (a.hue + b.hue) / 2;
          ctx.beginPath();
          ctx.strokeStyle = `hsla(${hue},90%,60%,${alpha})`;
          ctx.lineWidth = 1.1;
          ctx.globalCompositeOperation = 'lighter';
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          ctx.globalCompositeOperation = 'source-over';
        }
      }
    }

    requestAnimationFrame(step);
  }

  // start
  createParticles();
  requestAnimationFrame(step);

  // slight speed variation loop
  setInterval(() => {
    for(const p of particles){
      p.vx += rand(-0.06, 0.06);
      p.vy += rand(-0.06, 0.06);
      p.vx = Math.max(Math.min(p.vx, 0.8), -0.8);
      p.vy = Math.max(Math.min(p.vy, 0.8), -0.8);
    }
  }, 1200);

})();
