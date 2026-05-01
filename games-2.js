/* global React, getAudioManager */
const { useState, useEffect, useRef } = React;

// ============================================
// GAME 4 - Letter positions + fill blanks
// Uses AudioManager for letter pronunciation via speak()
// ============================================
function GamePosition({ onComplete }) {
  const targetLetter = 'غ';
  const positions = [
    { label: 'في الأول', word: 'غزالة', mark: [0, 1] },
    { label: 'في الوسط', word: 'الغابة', mark: [2, 3] },
    { label: 'في الآخر', word: 'صبغ', mark: [2, 3] },
  ];

  const blanks = [
    { before: 'الـ', after: 'ـابة', answer: 'غ' },
    { before: '', after: 'ـزال', answer: 'غ' },
  ];

  const [filled, setFilled] = useState({});
  const [over, setOver] = useState(null);
  const [reward, setReward] = useState(false);

  const onDrop = (e, idx) => {
    e.preventDefault();
    const letter = e.dataTransfer.getData('text/plain');
    if (letter === blanks[idx].answer) {
      setFilled(f => ({ ...f, [idx]: letter }));
      playSuccess();
      if (Object.keys(filled).length + 1 === blanks.length) {
        setTimeout(() => setReward(true), 500);
      }
    } else {
      playError();
    }
    setOver(null);
  };

  return (
    <div className="page-card pop-in">
      <h2 className="page-title">📍 الحرف <span style={{ color: 'var(--accent-coral)' }}>{targetLetter}</span> ومواقعه</h2>
      <p className="page-subtitle">شاهد كيف يظهر الحرف في أماكن مختلفة من الكلمة.</p>

      <div style={{ textAlign: 'center', margin: '24px 0' }}>
        <div style={{ fontSize: 120, fontWeight: 700, color: 'var(--accent-coral)' }}>غ</div>
        <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--ink)' }}>غـزالـة 🦌</div>
      </div>

      <div className="position-grid">
        {positions.map((p, i) => (
          <div key={i} className="position-card">
            <div className="label">{p.label}</div>
            <div className="word-display">
              {[...p.word].map((c, j) => (
                <span key={j} className={p.mark.includes(j) ? 'target' : ''}>{c}</span>
              ))}
            </div>
            <button className="btn-secondary" style={{ marginTop: 10, fontSize: 14 }} onClick={() => speak(p.word, 0.7)}>🔊</button>
          </div>
        ))}
      </div>

      <HintBubble>اسحب الحرف <strong>{targetLetter}</strong> إلى مكانه الصحيح في الكلمة:</HintBubble>

      <div className="fill-blank-row">
        {blanks.map((b, i) => (
          <div key={i} className="fill-blank-line">
            <span>{b.before}</span>
            <span
              className={'blank-slot' + (over === i ? ' over' : '') + (filled[i] ? ' filled' : '')}
              onDragOver={e => { e.preventDefault(); setOver(i); }}
              onDragLeave={() => setOver(null)}
              onDrop={e => onDrop(e, i)}
            >
              {filled[i] || ''}
            </span>
            <span>{b.after}</span>
          </div>
        ))}
      </div>

      <div className="letter-tiles">
        {['غ', 'ع', 'ف'].map((l, i) => (
          <div
            key={i}
            className="letter-tile"
            draggable
            onDragStart={e => e.dataTransfer.setData('text/plain', l)}
          >
            {l}
          </div>
        ))}
      </div>

      <Reward show={reward} onClose={() => { setReward(false); onComplete(); }} message="ممتاز! 📍" />
    </div>
  );
}

// ============================================
// GAME 5 - Letter assembly (broken letter pieces)
// ============================================
function GameAssembly({ onComplete }) {
  // Letter "س" broken into: 3 teeth (top) + base (bottom)
  const [snapped, setSnapped] = useState({ teeth: false, base: false });
  const [draggingPiece, setDraggingPiece] = useState(null);
  const [reward, setReward] = useState(false);

  const onDrop = (e) => {
    e.preventDefault();
    const piece = e.dataTransfer.getData('text/plain');
    if (piece) {
      setSnapped(s => ({ ...s, [piece]: true }));
      playSuccess();
    }
  };

  useEffect(() => {
    if (snapped.teeth && snapped.base) {
      setTimeout(() => { speak('سين', 0.7); setReward(true); }, 600);
    }
  }, [snapped]);

  return (
    <div className="page-card pop-in">
      <h2 className="page-title">🧩 تركيب الحرف: س</h2>
      <p className="page-subtitle">اسحب أجزاء الحرف إلى مكانها الصحيح.</p>

      <HintBubble>الحرف <strong>س</strong> يتكون من <strong>أسنان</strong> في الأعلى و<strong>قاعدة</strong> في الأسفل.</HintBubble>

      <div className="assembly-stage">
        <div
          className="target-letter-frame"
          onDragOver={e => e.preventDefault()}
          onDrop={onDrop}
        >
          <div className="ghost-letter">س</div>
          {snapped.teeth && snapped.base && (
            <div style={{
              position: 'absolute', fontSize: 240, fontWeight: 700,
              color: 'var(--accent-coral)', animation: 'pop-in 0.5s'
            }}>س</div>
          )}
          {snapped.teeth && !snapped.base && (
            <div style={{ position: 'absolute', top: '20%', fontSize: 100, color: 'var(--accent-coral)' }}>﹏﹏﹏</div>
          )}
          {snapped.base && !snapped.teeth && (
            <div style={{ position: 'absolute', bottom: '20%', fontSize: 100, color: 'var(--accent-coral)' }}>﹋</div>
          )}
        </div>

        <div className="pieces-tray">
          <h4>قطع الحرف</h4>
          {!snapped.teeth && (
            <div
              draggable
              onDragStart={e => e.dataTransfer.setData('text/plain', 'teeth')}
              style={{
                background: 'white', padding: '20px 28px', borderRadius: 14,
                fontSize: 80, color: 'var(--accent-coral)', cursor: 'grab',
                boxShadow: 'var(--shadow-md)', fontWeight: 700, lineHeight: 1
              }}
            >﹏﹏﹏</div>
          )}
          {!snapped.base && (
            <div
              draggable
              onDragStart={e => e.dataTransfer.setData('text/plain', 'base')}
              style={{
                background: 'white', padding: '28px 30px', borderRadius: 14,
                fontSize: 80, color: 'var(--accent-coral)', cursor: 'grab',
                boxShadow: 'var(--shadow-md)', fontWeight: 700, lineHeight: 0.5
              }}
            >﹋</div>
          )}
          {snapped.teeth && snapped.base && (
            <div className="empty-pool-msg">✨ ركّبت الحرف!</div>
          )}
        </div>
      </div>

      <Reward show={reward} onClose={() => { setReward(false); onComplete(); }} message="حرف السين ✨" />
    </div>
  );
}

// ============================================
// GAME 6 - Missing part of letter
// ============================================
function GameMissing({ onComplete }) {
  // Letter ز missing the dot
  const [chosen, setChosen] = useState(null);
  const [reward, setReward] = useState(false);

  const correctIdx = 0; // dot
  const options = [
    { svg: <circle cx="35" cy="35" r="14" fill="#1F3A52" />, label: 'نقطة' },
    { svg: <path d="M 8 35 Q 35 8 62 35" stroke="#1F3A52" strokeWidth="6" fill="none" />, label: 'نصف دائرة' },
    { svg: <line x1="8" y1="35" x2="62" y2="35" stroke="#1F3A52" strokeWidth="6" />, label: 'خط مستقيم' },
  ];

  const choose = (i) => {
    setChosen(i);
    if (i === correctIdx) {
      playSuccess();
      setTimeout(() => setReward(true), 800);
    } else {
      playError();
      setTimeout(() => setChosen(null), 800);
    }
  };

  return (
    <div className="page-card pop-in missing-stage">
      <h2 className="page-title">🔍 أكمل الحرف</h2>
      <p className="page-subtitle">يا ترى أي جزء ناقص من هذا الحرف؟</p>

      <HintBubble>هذا الحرف ينقصه شيء... هل هي نقطة، نصف دائرة، أم خط؟</HintBubble>

      <div className="broken-letter-display">
        ر
        {chosen === correctIdx && (
          <span style={{
            position: 'absolute', top: '-30px', left: '50%',
            transform: 'translateX(-50%)', color: 'var(--accent-green)',
            animation: 'pop-in 0.5s'
          }}>•</span>
        )}
      </div>
      <div style={{ fontSize: 18, color: 'var(--ink-soft)', marginBottom: 8 }}>
        {chosen === correctIdx ? 'الحرف هو: ز' : 'يبدو كحرف ر... ولكنه يجب أن يكون ز'}
      </div>

      <div className="options-row">
        {options.map((o, i) => (
          <div
            key={i}
            className={'option-tile' + (chosen === i ? (i === correctIdx ? ' correct' : ' wrong') : '')}
            onClick={() => choose(i)}
          >
            <svg viewBox="0 0 70 70">{o.svg}</svg>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 12 }}>
        {options.map((o, i) => (
          <div key={i} style={{ width: 120, textAlign: 'center', fontSize: 14, color: 'var(--ink-soft)' }}>
            {o.label}
          </div>
        ))}
      </div>

      <Reward show={reward} onClose={() => { setReward(false); onComplete(); }} message="أحسنت! 🎯" />
    </div>
  );
}

window.GamePosition = GamePosition;
window.GameAssembly = GameAssembly;
window.GameMissing = GameMissing;
