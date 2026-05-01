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
  try {
    const audioMgr = getAudioManager();
    const stats = typeof audioMgr.getStats === 'function' ? audioMgr.getStats() : { muted: false };
    if (stats.muted) return null;
    // Single Arabic letter: attempt MP3 only
    if (text && text.length === 1) {
      const audioPath = getLetterAudioPath(text);
      if (audioPath) await audioMgr.playLetter(text);
    }
    // No TTS fallback — MP3 files will be added later
  } catch (e) {
    console.warn('speak() error:', e);
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
function fireConfetti() {
  const colors = ['#4A90D9', '#6FB87F', '#E89B7C', '#9B7FBC', '#F4C95D'];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.background = colors[i % colors.length];
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.animationDelay = Math.random() * 0.5 + 's';
    piece.style.animation = `confetti-fall ${1.5 + Math.random()}s ease-in forwards`;
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 3000);
  }
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
function TopBar({ fontSize, setFontSize, onHome, onBedtime }) {
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
        <button className="icon-btn" onClick={onHome} title="الخريطة">🗺️</button>
        <div className="bedtime-badge" onClick={onBedtime} title="قصة قبل النوم">
          <span className="moon-icon">🌙</span>
          <span className="new-dot"></span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { speak, playTone, playClap, playSuccess, playError, playDrum, fireConfetti, Reward, HintBubble, TopBar });

// ============================================
// Initialize AudioManager on module load
// ============================================
if (typeof getAudioManager === 'function') {
  const audioMgr = getAudioManager();
  audioMgr.initialize().catch(e => console.warn('AudioManager init error:', e));
}
