// shared.jsx — shared utilities, mascots, feedback animations

const ARABIC_TASHKEEL = /[\u064B-\u0652\u0670]/g;
const stripTashkeel = (s) => s.replace(ARABIC_TASHKEEL, '');

// SFX using WebAudio
const SFX = (() => {
  let ctx = null;
  let muted = false;
  const ensure = () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };
  const tone = (freq, dur=0.15, type='sine', vol=0.18) => {
    if (muted) return;
    const c = ensure();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g).connect(c.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTarget=c.currentTime+dur);
    o.stop(c.currentTime + dur);
  };
  return {
    setMuted(m) { muted = m; },
    success() {
      tone(523, 0.12, 'sine', 0.2);
      setTimeout(() => tone(659, 0.12, 'sine', 0.2), 90);
      setTimeout(() => tone(784, 0.18, 'sine', 0.22), 180);
    },
    error() { tone(220, 0.18, 'sine', 0.14); setTimeout(() => tone(180, 0.2, 'sine', 0.12), 120); },
    pop() { tone(880, 0.06, 'triangle', 0.15); },
    drum() { tone(80, 0.18, 'sine', 0.4); },
    clap() {
      // noise burst
      if (muted) return;
      const c = ensure();
      const buf = c.createBuffer(1, c.sampleRate*0.08, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i=0;i<d.length;i++) d[i] = (Math.random()*2-1) * (1 - i/d.length);
      const src = c.createBufferSource(); src.buffer = buf;
      const g = c.createGain(); g.gain.value = 0.3;
      src.connect(g).connect(c.destination); src.start();
    },
    bee() { tone(440, 0.4, 'sawtooth', 0.12); },
    snake() { tone(800, 0.4, 'sine', 0.08); },
    unlock() {
      tone(523, 0.08); setTimeout(() => tone(659, 0.08), 70);
      setTimeout(() => tone(784, 0.08), 140); setTimeout(() => tone(1046, 0.2), 210);
    },
  };
})();

// Confetti burst
function Confetti({ show }) {
  if (!show) return null;
  const colors = ['#d97757','#6ea8c9','#e8b04b','#7ba05b','#b07a9c'];
  const pieces = Array.from({length: 24}, (_,i) => ({
    id:i, left: 10 + Math.random()*80, color: colors[i%5],
    delay: Math.random()*0.3, dur: 1.2 + Math.random()*0.8,
    rot: Math.random()*360,
  }));
  return (
    <div style={{position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden',zIndex:50}}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position:'absolute', left:p.left+'%', top:-10,
          width:10, height:14, background:p.color,
          transform:`rotate(${p.rot}deg)`,
          animation:`confetti-fall ${p.dur}s ${p.delay}s ease-in forwards`,
        }}/>
      ))}
    </div>
  );
}

// Star burst on success
function Stars({ show }) {
  if (!show) return null;
  return (
    <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:40}}>
      {[...Array(8)].map((_,i) => {
        const angle = (i/8) * Math.PI * 2;
        const dx = Math.cos(angle)*60;
        const dy = Math.sin(angle)*60;
        return <div key={i} style={{
          position:'absolute', left:'50%', top:'50%',
          width:14, height:14, fontSize:18,
          color:'#e8b04b',
          transform:`translate(${dx}px,${dy}px)`,
          animation:`sparkle .8s ${i*0.05}s ease-out forwards`,
        }}>★</div>;
      })}
    </div>
  );
}

// Mascots — drawn with simple SVG shapes (kept friendly)
function MascotBee({ size=80, talking=false }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={talking?'wiggle':''}>
      <ellipse cx="50" cy="55" rx="28" ry="22" fill="#e8b04b" stroke="#3a2c1a" strokeWidth="2.5"/>
      <rect x="32" y="40" width="6" height="30" fill="#3a2c1a"/>
      <rect x="48" y="38" width="6" height="34" fill="#3a2c1a"/>
      <rect x="62" y="40" width="6" height="30" fill="#3a2c1a"/>
      <ellipse cx="35" cy="35" rx="14" ry="10" fill="#fff" opacity="0.85" stroke="#3a2c1a" strokeWidth="1.5"/>
      <ellipse cx="65" cy="35" rx="14" ry="10" fill="#fff" opacity="0.85" stroke="#3a2c1a" strokeWidth="1.5"/>
      <circle cx="42" cy="52" r="3" fill="#3a2c1a"/>
      <circle cx="58" cy="52" r="3" fill="#3a2c1a"/>
      <path d="M44 62 Q50 66 56 62" stroke="#3a2c1a" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <line x1="42" y1="32" x2="38" y2="22" stroke="#3a2c1a" strokeWidth="2" strokeLinecap="round"/>
      <line x1="58" y1="32" x2="62" y2="22" stroke="#3a2c1a" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="38" cy="22" r="2.5" fill="#3a2c1a"/>
      <circle cx="62" cy="22" r="2.5" fill="#3a2c1a"/>
    </svg>
  );
}

function MascotSnake({ size=80 }) {
  return (
    <svg viewBox="0 0 120 80" width={size} height={size*0.66} className="float">
      <path d="M10 60 Q25 30 45 50 Q65 70 85 45 Q100 28 110 35"
        stroke="#7ba05b" strokeWidth="14" fill="none" strokeLinecap="round"/>
      <path d="M10 60 Q25 30 45 50 Q65 70 85 45 Q100 28 110 35"
        stroke="#3a2c1a" strokeWidth="14" fill="none" strokeLinecap="round" opacity="0.15" strokeDasharray="3 8"/>
      <circle cx="108" cy="35" r="9" fill="#7ba05b" stroke="#3a2c1a" strokeWidth="2"/>
      <circle cx="111" cy="33" r="2" fill="#3a2c1a"/>
      <path d="M115 36 L122 34 L115 38 L120 40" stroke="#c45a4d" strokeWidth="1.5" fill="none"/>
    </svg>
  );
}

function MascotOwl({ size=80 }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <ellipse cx="50" cy="60" rx="32" ry="35" fill="#b07a9c" stroke="#3a2c1a" strokeWidth="2.5"/>
      <ellipse cx="50" cy="70" rx="22" ry="22" fill="#f5ecd9" stroke="#3a2c1a" strokeWidth="1.5"/>
      <circle cx="38" cy="48" r="11" fill="#fff" stroke="#3a2c1a" strokeWidth="2"/>
      <circle cx="62" cy="48" r="11" fill="#fff" stroke="#3a2c1a" strokeWidth="2"/>
      <circle cx="38" cy="48" r="5" fill="#3a2c1a"/>
      <circle cx="62" cy="48" r="5" fill="#3a2c1a"/>
      <circle cx="40" cy="46" r="1.8" fill="#fff"/>
      <circle cx="64" cy="46" r="1.8" fill="#fff"/>
      <path d="M45 60 L50 66 L55 60 Z" fill="#e8b04b" stroke="#3a2c1a" strokeWidth="1.5"/>
      <path d="M22 35 L30 28 L32 38 Z" fill="#b07a9c" stroke="#3a2c1a" strokeWidth="2"/>
      <path d="M78 35 L70 28 L68 38 Z" fill="#b07a9c" stroke="#3a2c1a" strokeWidth="2"/>
    </svg>
  );
}

// Top status bar (stars, progress)
function GameHUD({ stars, total, progress, onBack, title }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:14,
      padding:'14px 18px',
      borderBottom:'2px solid var(--line)',
      background:'rgba(245,236,217,0.7)',
      backdropFilter:'blur(8px)',
      position:'relative', zIndex:5,
    }}>
      {onBack && (
        <button className="btn ghost" style={{padding:'8px 14px',fontSize:18}} onClick={onBack}>
          ← رجوع
        </button>
      )}
      {title && <div style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:20,color:'var(--ink)'}}>{title}</div>}
      <div style={{flex:1}}/>
      {progress != null && (
        <div style={{flex:'0 0 200px', maxWidth:240}}>
          <div style={{height:14, background:'var(--paper-3)', borderRadius:999, border:'2px solid var(--ink)', overflow:'hidden', position:'relative'}}>
            <div style={{
              height:'100%', width:`${progress*100}%`,
              background:'linear-gradient(90deg,#7ba05b,#e8b04b)',
              transition:'width .4s', borderLeft:'2px solid var(--ink)',
            }}/>
          </div>
        </div>
      )}
      {stars != null && (
        <div className="chip" style={{background:'#fff8e6'}}>
          <span style={{color:'#e8b04b',fontSize:18}}>★</span>
          <span style={{fontVariantNumeric:'tabular-nums'}}>{stars}{total ? `/${total}` : ''}</span>
        </div>
      )}
    </div>
  );
}

// Speech bubble used by mascot guides
function Bubble({ children, dir='left', tone='neutral' }) {
  const bg = tone==='success' ? '#e8f5d8' : tone==='error' ? '#fce4df' : '#fff';
  return (
    <div style={{
      position:'relative', background:bg,
      border:'2px solid var(--ink)', borderRadius:18,
      padding:'12px 18px', maxWidth:340,
      fontWeight:600, fontSize:18, color:'var(--ink)',
      boxShadow:'3px 3px 0 var(--ink)',
    }}>
      {children}
      <div style={{
        position:'absolute',
        [dir]: 18, bottom:-12,
        width:20, height:14,
        background:bg,
        borderRight:'2px solid var(--ink)',
        borderBottom:'2px solid var(--ink)',
        transform:'rotate(45deg)',
      }}/>
    </div>
  );
}

Object.assign(window, {
  stripTashkeel, SFX, Confetti, Stars,
  MascotBee, MascotSnake, MascotOwl, GameHUD, Bubble,
});
