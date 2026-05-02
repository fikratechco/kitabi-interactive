/* global React, window, getAudioManager, getLetterAudioPath */
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ============================================
// AUDIO HELPERS
// ============================================
/**
 * Play audio for text: attempts MP3 first, falls back to Web Speech API
 * @param {string} text - Single letter, word, or phrase to play
 * @param {number} rate - Speech rate for Web Speech fallback (0.5-2.0)
 */
const speak = async (text, rate = 0.85) => {
  if (!text) return;
  try {
    const audioMgr = getAudioManager();
    if (audioMgr.muted) return;
    if (text.length === 1) {
      await audioMgr.playLetter(text);
    } else {
      await audioMgr.playWord(text);
    }
  } catch (e) {
    // Silent — MP3 files not yet present
  }
};

const playTone = (freq, duration = 0.15, type = 'sine') => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
};

const playClap = () => {
  // Series of pops to simulate clap
  [0, 80, 160].forEach(d => setTimeout(() => playTone(180 + Math.random() * 80, 0.08, 'square'), d));
};

const playSuccess = () => {
  [523, 659, 784].forEach((f, i) => setTimeout(() => playTone(f, 0.18, 'sine'), i * 100));
};

const playError = () => playTone(180, 0.2, 'sawtooth');

const playDrum = () => playTone(80, 0.18, 'sine');

// ============================================
// CONFETTI
// ============================================
let _confettiActive = false;
function fireConfetti() {
  if (_confettiActive) return;
  _confettiActive = true;
  const colors = ['#4A90D9', '#6FB87F', '#E89B7C', '#9B7FBC', '#F4C95D'];
  const pieces = [];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.background = colors[i % colors.length];
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.animationDelay = Math.random() * 0.5 + 's';
    piece.style.animation = `confetti-fall ${1.5 + Math.random()}s ease-in forwards`;
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    document.body.appendChild(piece);
    pieces.push(piece);
  }
  setTimeout(() => {
    pieces.forEach(p => p.remove());
    _confettiActive = false;
  }, 3200);
}

// ============================================
// REWARD OVERLAY
// ============================================
function Reward({ show, onClose, message = 'أحسنت!' }) {
  useEffect(() => {
    if (show) {
      playSuccess();
      fireConfetti();
      const t = setTimeout(onClose, 2000);
      return () => clearTimeout(t);
    }
  }, [show]);
  if (!show) return null;
  return (
    <div className="reward-overlay" onClick={onClose}>
      <div className="reward-card">
        <div className="star">⭐</div>
        <div className="title">{message}</div>
        <div className="subtitle">رائع! واصل التقدم 🌟</div>
      </div>
    </div>
  );
}

// ============================================
// MASCOT HINT BUBBLE
// ============================================
function HintBubble({ children }) {
  return (
    <div className="hint-bubble">
      <div className="owl bounce-soft">🦉</div>
      <div className="speech">{children}</div>
    </div>
  );
}

// ============================================
// TOP BAR / FONT CONTROL
// ============================================
function TopBar({ fontSize, setFontSize, muted, setMuted, onHome, onBedtime }) {
  const sizes = [
    { key: 'sm', label: 'صـ', val: 26 },
    { key: 'md', label: 'صـ', val: 32 },
    { key: 'lg', label: 'صـ', val: 40 },
  ];
  return (
    <div className="top-bar">
      <div className="brand" onClick={onHome} style={{ cursor: 'pointer' }}>
        <div className="logo-bird">🦉</div>
        <span>كتابي التفاعلي</span>
      </div>
      <div className="controls">
        <div className="font-control" title="حجم الخط">
          {sizes.map(s => (
            <button
              key={s.key}
              className={fontSize === s.val ? 'active' : ''}
              onClick={() => setFontSize(s.val)}
              style={{ fontSize: s.key === 'sm' ? 12 : s.key === 'md' ? 16 : 20 }}
            >
              {s.label}
            </button>
          ))}
        </div>
        <input
          type="range"
          min="22" max="48" step="2" value={fontSize}
          onChange={e => setFontSize(+e.target.value)}
          style={{ width: 100 }}
          aria-label="ضبط دقيق لحجم الخط"
        />
        {setMuted && (
          <button
            className="icon-btn"
            onClick={() => setMuted(m => !m)}
            title={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
            style={{ fontSize: 20 }}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        )}
        <button className="icon-btn" onClick={onHome} title="الخريطة">🗺️</button>
        <div className="bedtime-badge" onClick={onBedtime} title="قصة قبل النوم">
          <span className="moon-icon">🌙</span>
          <span className="new-dot"></span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================
(function () {
  const COLORS = {
    success: { bg: '#e8f5e9', border: '#4caf50', icon: '✓' },
    error:   { bg: '#fdecea', border: '#e53935', icon: '✕' },
    info:    { bg: '#e3f2fd', border: '#1e88e5', icon: 'ℹ' },
    saved:   { bg: '#e8f5e9', border: '#43a047', icon: '💾' },
  };

  // Inject keyframe once
  const styleId = 'kitabi-toast-style';
  if (!document.getElementById(styleId)) {
    const s = document.createElement('style');
    s.id = styleId;
    s.textContent = `
      #kitabi-toasts { position:fixed;top:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:8px;pointer-events:none;direction:rtl; }
      .kitabi-toast { display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:12px;font-size:14px;font-weight:600;color:#1F3A52;border-right:4px solid;box-shadow:0 4px 16px rgba(0,0,0,0.12);opacity:0;transform:translateX(30px);transition:opacity .25s ease,transform .25s ease;pointer-events:auto;max-width:320px;font-family:inherit; }
      .kitabi-toast.in { opacity:1;transform:translateX(0); }
      .kitabi-toast.out { opacity:0;transform:translateX(30px); }
      .kitabi-toast .t-icon { font-size:18px;flex-shrink:0; }
    `;
    document.head.appendChild(s);
  }

  function getContainer() {
    let c = document.getElementById('kitabi-toasts');
    if (!c) { c = document.createElement('div'); c.id = 'kitabi-toasts'; document.body.appendChild(c); }
    return c;
  }

  window.showToast = function (message, type = 'info', duration = 3200) {
    const scheme = COLORS[type] || COLORS.info;
    const el = document.createElement('div');
    el.className = 'kitabi-toast';
    el.style.background = scheme.bg;
    el.style.borderRightColor = scheme.border;
    el.innerHTML = `<span class="t-icon">${scheme.icon}</span><span>${message}</span>`;
    getContainer().appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')));
    const dismiss = () => {
      el.classList.replace('in', 'out');
      setTimeout(() => el.remove(), 300);
    };
    el._dismissTimer = setTimeout(dismiss, duration);
    el.addEventListener('click', () => { clearTimeout(el._dismissTimer); dismiss(); });
  };
})();

Object.assign(window, { speak, playTone, playClap, playSuccess, playError, playDrum, fireConfetti, Reward, HintBubble, TopBar, showToast: window.showToast });

// ============================================
// Initialize AudioManager on module load
// ============================================
if (typeof getAudioManager === 'function') {
  const audioMgr = getAudioManager();
  audioMgr.initialize().catch(e => console.warn('AudioManager init error:', e));
}
