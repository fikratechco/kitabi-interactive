/* global React, getAudioManager */
const { useState, useEffect, useRef } = React;

// ============================================
// GAME 7 - Shadow match (visual tracking)
// Uses AudioManager for letter/word pronunciation via speak()
// ============================================
function GameShadow({ onComplete }) {
  const items = [
    { word: 'مئزر', color: '#E89B7C' },
    { word: 'قلم', color: '#9B7FBC' },
    { word: 'كتاب', color: '#6FB87F' },
    { word: 'باب', color: '#4A90D9' },
  ];

  const [matched, setMatched] = useState({});
  const [over, setOver] = useState(null);
  const [reward, setReward] = useState(false);
  const [speed, setSpeed] = useState(0); // increases per match

  const onDrop = (e, slotIdx) => {
    e.preventDefault();
    const wordIdx = +e.dataTransfer.getData('text/plain');
    if (wordIdx === slotIdx) {
      setMatched(m => ({ ...m, [slotIdx]: true }));
      playSuccess();
      setSpeed(s => s + 1);
      if (Object.keys(matched).length + 1 === items.length) {
        setTimeout(() => setReward(true), 500);
      }
    } else {
      playError();
    }
    setOver(null);
  };

  // Shadows fade with speed (challenge mode)
  const fadeDuration = Math.max(1.5, 4 - speed * 0.5);

  return (
    <div className="page-card pop-in shadow-stage">
      <h2 className="page-title">👁️ تطابق الظلال</h2>
      <p className="page-subtitle">اسحب كل كلمة إلى ظلها المطابق — السرعة تزداد مع كل إجابة!</p>

      <HintBubble>تتبع الظل بعينيك واسحب الكلمة الصحيحة قبل أن يختفي 👀</HintBubble>

      <div className="shadow-row">
        {items.map((it, i) => (
          <div
            key={i}
            className={'shadow-slot' + (over === i ? ' over' : '') + (matched[i] ? ' matched' : '')}
            onDragOver={e => { e.preventDefault(); setOver(i); }}
            onDragLeave={() => setOver(null)}
            onDrop={e => onDrop(e, i)}
            style={{
              opacity: matched[i] ? 1 : Math.max(0.3, 1 - speed * 0.15),
              transition: `opacity ${fadeDuration}s ease-in-out`,
            }}
          >
            {matched[i] ? it.word : it.word}
          </div>
        ))}
      </div>

      <div className="color-words-pool">
        {items.map((it, i) => !matched[i] && (
          <div
            key={i}
            className="color-word"
            draggable
            onDragStart={e => e.dataTransfer.setData('text/plain', String(i))}
            style={{ background: it.color, color: 'white' }}
          >
            {it.word}
          </div>
        ))}
        {Object.keys(matched).length === items.length && (
          <div className="empty-pool-msg">✨ كل الظلال طابقت!</div>
        )}
      </div>

      <Reward show={reward} onClose={() => { setReward(false); onComplete(); }} message="عيون قوية! 👁️" />
    </div>
  );
}

// ============================================
// GAME 8 - Sound manipulation (delete/replace/rhyme)
// ============================================
function GameManipulation({ onComplete }) {
  const [step, setStep] = useState(0); // 0: delete, 1: replace, 2: rhyme
  const [removed, setRemoved] = useState(false);
  const [replaced, setReplaced] = useState(false);
  const [rhymePick, setRhymePick] = useState(null);
  const [reward, setReward] = useState(false);

  // Step 0 — حذف: سماء → ماء (remove س)
  // Step 1 — استبدال: نار → دار (replace ن with د)
  // Step 2 — قافية: قمر → ?

  const rhymeOptions = [
    { w: 'سفر', correct: true },
    { w: 'كتاب', correct: false },
    { w: 'حجر', correct: true },
    { w: 'شمس', correct: false },
  ];

  const doDelete = () => {
    setRemoved(true);
    playTone(440, 0.15);
    setTimeout(() => speak('ماء', 0.7), 600);
    setTimeout(() => setStep(1), 1800);
  };

  const doReplace = () => {
    setReplaced(true);
    playSuccess();
    setTimeout(() => speak('دار', 0.7), 600);
    setTimeout(() => setStep(2), 1800);
  };

  const pickRhyme = (i) => {
    setRhymePick(i);
    if (rhymeOptions[i].correct) {
      playSuccess();
      setTimeout(() => setReward(true), 700);
    } else {
      playError();
      setTimeout(() => setRhymePick(null), 800);
    }
  };

  return (
    <div className="page-card pop-in">
      <h2 className="page-title">🎵 التلاعب بالأصوات</h2>
      <p className="page-subtitle">حذف، استبدال، وقافية — العب بالحروف!</p>

      {step === 0 && (
        <div className="manip-stage">
          <HintBubble>إذا حذفنا حرف <strong>س</strong> من كلمة <strong>سماء</strong>، ماذا تصبح؟</HintBubble>
          <div className="word-letters">
            {[...'سماء'].map((c, i) => (
              <span key={i} className={'letter' + (i === 0 ? ' target' : '') + (removed && i === 0 ? ' removed' : '')}>
                {c}
              </span>
            ))}
          </div>
          {!removed ? (
            <button className="btn-primary" onClick={doDelete}>🗑️ احذف الحرف س</button>
          ) : (
            <div style={{ fontSize: 32, color: 'var(--accent-green)', fontWeight: 700 }}>✓ ماء</div>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="manip-stage">
          <HintBubble>استبدل حرف <strong>ن</strong> بحرف <strong>د</strong> في كلمة <strong>نار</strong>:</HintBubble>
          <div className="word-letters">
            <span className={'letter' + (replaced ? ' replaced' : ' target')}>{replaced ? 'د' : 'ن'}</span>
            <span className="letter">ا</span>
            <span className="letter">ر</span>
          </div>
          {!replaced ? (
            <div className="equation">
              <span style={{ fontSize: 40, fontWeight: 700, color: 'var(--accent-coral)' }}>ن</span>
              <span>←</span>
              <span style={{ fontSize: 40, fontWeight: 700, color: 'var(--accent-green)' }}>د</span>
              <button className="btn-primary" onClick={doReplace} style={{ marginInlineStart: 12 }}>استبدل</button>
            </div>
          ) : (
            <div style={{ fontSize: 32, color: 'var(--accent-green)', fontWeight: 700 }}>✓ دار</div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="manip-stage">
          <HintBubble>اختر الكلمات التي تنتهي بنفس صوت كلمة <strong>قمر</strong> (تنتهي بـ "ر"):</HintBubble>
          <div style={{ fontSize: 56, fontWeight: 700, color: 'var(--accent-blue)' }}>قمـ<span style={{ color: 'var(--accent-coral)' }}>ر</span></div>
          <div className="rhyme-options">
            {rhymeOptions.map((o, i) => (
              <button
                key={i}
                className={'rhyme-option' + (rhymePick === i ? (o.correct ? ' correct' : ' wrong') : '')}
                onClick={() => pickRhyme(i)}
              >
                {o.w}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 12, height: 12, borderRadius: 6,
            background: i <= step ? 'var(--accent-blue)' : 'var(--bg-soft)',
          }}></span>
        ))}
      </div>

      <Reward show={reward} onClose={() => { setReward(false); onComplete(); }} message="شاعر صغير! 🎵" />
    </div>
  );
}

// ============================================
// GAME 9 - Vowel keys (locked door)
// ============================================
function GameVowelKeys({ onComplete }) {
  // Door requires "ضمة" (damma)
  const target = 'ضمة';
  const targetSymbol = 'ـُ';

  const keys = [
    { vowel: 'فتحة', symbol: 'ـَ', letter: 'بَـ', word: 'بَـحْـر' },
    { vowel: 'ضمة', symbol: 'ـُ', letter: 'بُـ', word: 'بُـسْـتـان' },
    { vowel: 'كسرة', symbol: 'ـِ', letter: 'بِـ', word: 'بِـنـت' },
    { vowel: 'سكون', symbol: 'ـْ', letter: 'بْـ', word: 'صَـبْـر' },
  ];

  const [opened, setOpened] = useState(false);
  const [wrongIdx, setWrongIdx] = useState(null);
  const [reward, setReward] = useState(false);

  const tryKey = (i) => {
    if (keys[i].vowel === target) {
      setOpened(true);
      playSuccess();
      setTimeout(() => setReward(true), 1200);
    } else {
      setWrongIdx(i);
      playError();
      setTimeout(() => setWrongIdx(null), 600);
    }
  };

  return (
    <div className="page-card pop-in">
      <h2 className="page-title">🔑 لعبة مفاتيح الحركات</h2>
      <p className="page-subtitle">اختر المفتاح الذي يفتح الباب — الباب مغلق بحركة الـ <strong>{target}</strong>!</p>

      <HintBubble>الباب يحتاج مفتاح حركة <strong>{target}</strong> (الرمز <span style={{ fontSize: 28 }}>{targetSymbol}</span>) — أي مفتاح هو الصحيح؟</HintBubble>

      <div className="lock-stage">
        <div className={'locked-door' + (opened ? ' opening' : '')}>
          <div className="lock-plate">
            {opened ? '🔓' : <span style={{ fontSize: 56 }}>{targetSymbol}</span>}
          </div>
        </div>

        <div className="keys-row">
          {keys.map((k, i) => (
            <div
              key={i}
              className={'vowel-key' + (wrongIdx === i ? ' wrong' : '')}
              onClick={() => tryKey(i)}
            >
              <div className="key-letter">{k.letter}</div>
              <div className="key-word">{k.word}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 4 }}>{k.vowel}</div>
            </div>
          ))}
        </div>
      </div>

      <Reward show={reward} onClose={() => { setReward(false); onComplete(); }} message="🔓 فتحت الباب!" />
    </div>
  );
}

window.GameShadow = GameShadow;
window.GameManipulation = GameManipulation;
window.GameVowelKeys = GameVowelKeys;
