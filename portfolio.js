// Portfolio interactions: cursor, magnetic, 3D laptop tilt, reel, keyboard, sounds, reveal

(function(){
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  /* ─── Custom cursor ─────────────────────────────────── */
  const cP = $('#cursorP'), cD = $('#cursorD');
  let mx = innerWidth/2, my = innerHeight/2;
  let dx = mx, dy = my;
  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  function loopCursor(){
    dx += (mx - dx) * 0.18;
    dy += (my - dy) * 0.18;
    if(cP){ cP.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`; }
    if(cD){ cD.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`; }
    requestAnimationFrame(loopCursor);
  }
  loopCursor();

  // hover targets
  const HOVERABLE = 'a, button, [data-magnet], .project, .post, .contact-grid a, .reel, .play';
  document.addEventListener('mouseover', e => {
    if(e.target.closest(HOVERABLE)){
      cP && cP.classList.add('hover');
      cD && cD.classList.add('hover');
    }
  });
  document.addEventListener('mouseout', e => {
    if(e.target.closest(HOVERABLE)){
      cP && cP.classList.remove('hover');
      cD && cD.classList.remove('hover');
    }
  });

  /* ─── Magnetic buttons ──────────────────────────────── */
  $$('[data-magnet]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width/2)) / (r.width/2);
      const y = (e.clientY - (r.top  + r.height/2)) / (r.height/2);
      el.style.transform = `translate(${x*7}px, ${y*5}px)`;
    });
    el.addEventListener('mouseleave', () => el.style.transform = '');
  });

  /* ─── 3D laptop cursor tilt ─────────────────────────── */
  const laptop = $('#laptop');
  const scene  = $('#scene');
  if(laptop && scene){
    let rx = -8, ry = -22;
    let trx = -8, try_ = -22;
    addEventListener('mousemove', e => {
      const cx = innerWidth/2, cy = innerHeight/2;
      const nx = (e.clientX - cx) / cx;   // -1..1
      const ny = (e.clientY - cy) / cy;
      try_ = -22 + nx * 26;
      trx = -8  + (-ny) * 14;
    });
    function tick(){
      rx += (trx - rx) * 0.06;
      ry += (try_ - ry) * 0.06;
      laptop.style.setProperty('--rx', rx + 'deg');
      laptop.style.setProperty('--ry', ry + 'deg');
      requestAnimationFrame(tick);
    }
    tick();
  }

  /* ─── Hero video (procedural fallback so it always loops) ──── */
  // Build a tiny canvas-driven loop that we stream to <video>
  const heroVid = $('#heroVid');
  const fallback = $('#screenFallback');
  if(heroVid){
    try {
      const c = document.createElement('canvas');
      c.width = 640; c.height = 400;
      const ctx = c.getContext('2d');
      let t0 = performance.now();
      let running = true;
      function draw(){
        if(!running) return;
        const t = (performance.now() - t0) / 1000;
        // bg
        const g = ctx.createLinearGradient(0,0,640,400);
        g.addColorStop(0, '#1a1108');
        g.addColorStop(1, '#0c0805');
        ctx.fillStyle = g; ctx.fillRect(0,0,640,400);
        // grid
        ctx.strokeStyle = 'rgba(255,180,80,.08)';
        ctx.lineWidth = 1;
        for(let i=0; i<20; i++){
          const y = ((i*40 + t*30) % 440) - 20;
          ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(640,y); ctx.stroke();
        }
        // floating circles
        for(let i=0; i<6; i++){
          const a = i*1.0472 + t*0.4;
          const r = 60 + Math.sin(t + i)*30;
          const x = 320 + Math.cos(a)*r*2.4;
          const y = 200 + Math.sin(a)*r;
          const grd = ctx.createRadialGradient(x,y,0,x,y,80);
          grd.addColorStop(0, `oklch(0.82 0.16 ${60+i*8} / .55)`);
          grd.addColorStop(1, 'transparent');
          ctx.fillStyle = grd;
          ctx.fillRect(x-90, y-90, 180, 180);
        }
        // mono code lines
        ctx.fillStyle = 'rgba(245,210,160,.85)';
        ctx.font = '13px "JetBrains Mono", monospace';
        const lines = [
          '// fikratech / engine.ts',
          'export const render = async () => {',
          '  const ctx = await gpu.init();',
          '  ctx.scene.add("hero");',
          '  ctx.tick(' + (60 + Math.round(Math.sin(t*2)*4)) + ');',
          '  return { ok: true };',
          '};',
          '',
          '// → ' + (0.42 + Math.sin(t)*0.05).toFixed(2) + 'ms / frame · stable',
        ];
        lines.forEach((l, i) => ctx.fillText(l, 28, 60 + i*22));
        // blinking caret
        if(Math.floor(t*2) % 2 === 0){
          ctx.fillStyle = 'rgba(255,200,120,.9)';
          ctx.fillRect(28 + ctx.measureText(lines[8]).width + 4, 60 + 8*22 - 11, 8, 14);
        }
        requestAnimationFrame(draw);
      }
      draw();
      const stream = c.captureStream(30);
      heroVid.srcObject = stream;
      heroVid.play().catch(()=>{});
      // hide the static fallback
      fallback.style.display = 'none';
      // pause when offscreen
      const io = new IntersectionObserver(entries => {
        entries.forEach(en => {
          running = en.isIntersecting;
          if(running) draw();
        });
      });
      io.observe(heroVid);
    } catch(e){
      // If captureStream isn't available, leave the static screen-content fallback in place
      heroVid.style.display = 'none';
    }
  }

  /* ─── About reel (procedural too — so we always have a video) ─── */
  const aboutVid = $('#aboutVid');
  const playBtn = $('#playBtn');
  const reel = $('#reel');
  const reelTime = $('#reelTime');
  let reelPlaying = false;
  if(aboutVid && playBtn){
    try{
      const c = document.createElement('canvas');
      c.width = 800; c.height = 1000;
      const ctx = c.getContext('2d');
      let t0 = performance.now();
      function draw(){
        const t = (performance.now() - t0) / 1000;
        // bg
        const g = ctx.createLinearGradient(0,0,0,1000);
        g.addColorStop(0, '#1a1206');
        g.addColorStop(1, '#0a0805');
        ctx.fillStyle = g; ctx.fillRect(0,0,800,1000);
        // big rotating ring
        ctx.save();
        ctx.translate(400, 500);
        ctx.rotate(t*0.3);
        for(let i=0;i<60;i++){
          ctx.rotate(Math.PI*2/60);
          ctx.fillStyle = `oklch(0.82 0.16 ${(60+i*4)%360} / .7)`;
          ctx.fillRect(220, -2, 60 + Math.sin(t*2+i*0.3)*30, 4);
        }
        ctx.restore();
        // moving dots
        for(let i=0;i<40;i++){
          const a = i*0.157 + t*0.6;
          const r = 280 + Math.sin(t + i*0.4)*40;
          const x = 400 + Math.cos(a)*r;
          const y = 500 + Math.sin(a)*r*0.6;
          ctx.fillStyle = `oklch(0.96 0.05 80 / ${0.4 + Math.sin(t+i)*0.3})`;
          ctx.beginPath(); ctx.arc(x,y, 2 + Math.sin(t+i)*1.5, 0, Math.PI*2); ctx.fill();
        }
        // headline
        ctx.fillStyle = '#f5e7c8';
        ctx.font = 'italic 80px "Instrument Serif", serif';
        ctx.textAlign = 'center';
        const phases = ['build.', 'learn.', 'ship.', 'repeat.'];
        const phase = phases[Math.floor(t/2) % phases.length];
        ctx.fillText(phase, 400, 200);
        // tag
        ctx.fillStyle = 'rgba(245,210,160,.6)';
        ctx.font = '14px "JetBrains Mono", monospace';
        ctx.fillText('// anes hamouti · 00:' + String(Math.floor(t)%38).padStart(2,'0'), 400, 950);
        if(reelPlaying){
          if(reelTime) reelTime.textContent = '00:' + String(Math.floor(t)%38).padStart(2,'0') + ' / 00:38';
        }
        if(reelPlaying) requestAnimationFrame(draw);
      }
      const stream = c.captureStream(30);
      aboutVid.srcObject = stream;

      const togglePlay = () => {
        reelPlaying = !reelPlaying;
        if(reelPlaying){
          t0 = performance.now();
          aboutVid.play().catch(()=>{});
          reel && reel.classList.add('playing');
          $('.placeholder', reel) && ($('.placeholder', reel).style.display = 'none');
          draw();
        } else {
          aboutVid.pause();
          reel && reel.classList.remove('playing');
        }
      };
      playBtn.addEventListener('click', togglePlay);
      reel.addEventListener('click', e => {
        if(e.target.closest('.play')) return;
        if(reelPlaying) togglePlay();
      });
    }catch(e){}
  }

  /* ─── Reveal on scroll ─────────────────────────────── */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  $$('.rv').forEach(el => io.observe(el));

  /* ─── Project preview follow cursor ─────────────────── */
  $$('.project').forEach(p => {
    const prev = $('.p-preview', p);
    if(!prev) return;
    p.addEventListener('mousemove', e => {
      const r = p.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      prev.style.left = x + 'px';
      prev.style.top  = y + 'px';
    });
  });

  /* ─── Subtle hover sound ───────────────────────────── */
  let audioCtx = null, soundOn = false;
  function ensureAudio(){
    if(!audioCtx){
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){}
    }
  }
  function tick(freq=420, dur=0.04, gain=0.03){
    if(!soundOn || !audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.value = 0;
    o.connect(g); g.connect(audioCtx.destination);
    const t = audioCtx.currentTime;
    g.gain.linearRampToValueAtTime(gain, t + 0.005);
    g.gain.linearRampToValueAtTime(0,   t + dur);
    o.start(t); o.stop(t + dur + 0.02);
  }
  $$('a, button, [data-magnet], .project, .post').forEach(el => {
    el.addEventListener('mouseenter', () => tick(380 + Math.random()*120));
    el.addEventListener('click',      () => tick(560, 0.06, 0.05));
  });

  /* ─── Keyboard shortcuts ───────────────────────────── */
  const sectionIds = ['hero','about','projects','skills','experience','awards','education','writing','contact'];
  let cur = 0;
  function goto(i){
    cur = Math.max(0, Math.min(sectionIds.length - 1, i));
    const el = document.getElementById(sectionIds[cur]);
    if(el){
      const main = $('#main');
      main.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
    }
  }
  addEventListener('keydown', e => {
    if(e.target.matches('input, textarea')) return;
    const k = e.key.toLowerCase();
    if(k === 'j' || k === 'arrowdown'){ e.preventDefault(); goto(cur+1); }
    else if(k === 'k' || k === 'arrowup'){ e.preventDefault(); goto(cur-1); }
    else if(k === 'g'){ goto(0); }
    else if(k === 'home'){ goto(0); }
    else if(k === 'end'){ goto(sectionIds.length - 1); }
    else if(k === 'm'){
      ensureAudio();
      soundOn = !soundOn;
      tick(soundOn ? 660 : 220, 0.08, 0.05);
    }
    else if(k === '?' || k === '/'){
      alert([
        'Keyboard shortcuts',
        '─────────────────',
        'J / ↓    next section',
        'K / ↑    previous section',
        'G        top',
        'M        toggle hover sound',
        '?        this help'
      ].join('\n'));
    }
  });

  // Track current section based on scroll
  const main = $('#main');
  if(main){
    main.addEventListener('scroll', () => {
      const y = main.scrollTop + main.clientHeight * 0.3;
      for(let i = sectionIds.length - 1; i >= 0; i--){
        const el = document.getElementById(sectionIds[i]);
        if(el && el.offsetTop <= y){ cur = i; break; }
      }
    }, { passive: true });
  }
})();
