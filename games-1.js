/* global React, getAudioManager */
const { useState, useEffect, useRef } = React;

// ============================================
// GAME 1 - Train: count words in sentence
// Uses AudioManager for letter/word pronunciation via speak()
// ============================================
function GameTrain({ onComplete }) {
  const sentence = ['في', 'الغابة', 'تعيش', 'غزالة', 'جميلة'];
  const [detached, setDetached] = useState({});
  const [count, setCount] = useState('');
  const [status, setStatus] = useState(null); // 'correct' | 'wrong'
  const [played, setPlayed] = useState({});

  const detach = (i) => {
    if (detached[i]) {
      // play that word
      speak(sentence[i], 0.7);
      setTimeout(() => playClap(), 600);
      setPlayed(p => ({ ...p, [i]: true }));
      return;
    }
    setDetached(d => ({ ...d, [i]: true }));
    playTone(330, 0.1);
  };

  const check = () => {
    if (+count === sentence.length) {
      setStatus('correct');
      // Sequence: word + clap for each
      sentence.forEach((w, i) => {
        setTimeout(() => { speak(w, 0.7); }, i * 1200);
        setTimeout(() => { playClap(); }, i * 1200 + 700);
      });
      setTimeout(() => onComplete(), sentence.length * 1200 + 800);
    } else {
      setStatus('wrong');
      playError();
      setTimeout(() => setStatus(null), 800);
    }
  };

  return (
    <div className="page-card pop-in">
      <h2 className="page-title">🚂 لعبة القطار: كم كلمة في الجملة؟</h2>
      <p className="page-subtitle">اضغط على كل عربة لفصلها، ثم اكتب عدد كلمات الجملة.</p>

      <HintBubble>اضغط على كل عربة لتنفصل وتسمع كلمتها 🚃</HintBubble>

      <div className="train-track">
        {sentence.slice().reverse().map((word, ri) => {
          const i = sentence.length - 1 - ri;
          return (
            <div
              key={i}
              className={'train-car' + (detached[i] ? ' detached' : '')}
              onClick={() => detach(i)}
            >
              {word}
            </div>
          );
        })}
        <div className="train-engine">🚂</div>
      </div>

      <div className="count-input-row">
        <label>عدد الكلمات:</label>
        <input
          type="number"
          className={'count-input' + (status ? ' ' + status : '')}
          value={count}
          onChange={e => setCount(e.target.value)}
          min="1" max="20"
        />
        <button className="btn-primary" onClick={check}>تحقق</button>
      </div>
    </div>
  );
}

// ============================================
// GAME 2 - Drum: tap syllables
// ============================================
function GameDrum({ onComplete }) {
  // Word with target letter ز: "زهور" (3 syllables: ز - هـ - ور)
  // Then with غ: "غزالة" (3: غ - زا - لـة)
  const challenges = [
    { word: 'زهور', syllables: ['زُ', 'هـو', 'ر'], image: '🌹' },
    { word: 'غزالة', syllables: ['غـ', 'زا', 'لـة'], image: '🦌' },
  ];
  const [idx, setIdx] = useState(0);
  const [taps, setTaps] = useState(0);
  const [drumActive, setDrumActive] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [phase, setPhase] = useState('extract'); // 'extract' | 'drum' | 'done'
  const [reward, setReward] = useState(false);

  const cur = challenges[idx];

  useEffect(() => {
    setTaps(0);
    setPhase('extract');
  }, [idx]);

  const tap = () => {
    setDrumActive(true);
    playDrum();
    const id = Date.now();
    setRipples(r => [...r, id]);
    setTimeout(() => setRipples(r => r.filter(x => x !== id)), 800);
    setTimeout(() => setDrumActive(false), 200);
    const newTaps = taps + 1;
    setTaps(newTaps);
    if (newTaps === cur.syllables.length) {
      setTimeout(() => {
        setReward(true);
      }, 600);
    }
  };

  const onRewardClose = () => {
    setReward(false);
    if (idx + 1 < challenges.length) {
      setIdx(idx + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="page-card pop-in">
      <h2 className="page-title">🥁 لعبة الطبل: التقطيع المقطعي</h2>
      <p className="page-subtitle">انقر على الطبل بعدد مقاطع الكلمة.</p>

      <HintBubble>كلمة <strong>{cur.word}</strong> تحتوي على <strong>{cur.syllables.length}</strong> مقاطع — اطرق الطبل {cur.syllables.length} مرات!</HintBubble>

      <div className="drum-stage">
        <div style={{ fontSize: 80 }}>{cur.image}</div>
        <div className="syllable-display">
          {cur.syllables.map((s, i) => (
            <span key={i} className={'syl' + (i < taps ? ' lit' : '')}>{s}</span>
          ))}
        </div>
        <div className="drum" onClick={tap}>
          🥁
          {ripples.map(id => <span key={id} className="drum-ripple"></span>)}
        </div>
        <div className="tap-counter">
          الطرقات: <strong>{taps}</strong> / {cur.syllables.length}
        </div>
        <button className="btn-secondary" onClick={() => speak(cur.word, 0.7)}>🔊 سماع الكلمة</button>
      </div>

      <Reward show={reward} onClose={onRewardClose} message="ممتاز! 🥁" />
    </div>
  );
}

// ============================================
// GAME 3 - Sound boxes (drag ز / س)
// ============================================
function GameSound({ onComplete }) {
  const words = [
    { w: 'زهرة', sound: 'zay' },
    { w: 'سمكة', sound: 'seen' },
    { w: 'زرافة', sound: 'zay' },
    { w: 'سلحفاة', sound: 'seen' },
    { w: 'زيتون', sound: 'zay' },
    { w: 'سحاب', sound: 'seen' },
  ];

  const [placed, setPlaced] = useState({});
  const [draggingId, setDraggingId] = useState(null);
  const [overBox, setOverBox] = useState(null);
  const [reward, setReward] = useState(false);

  const placeWord = (id, box) => {
    const word = words[id];
    if (word.sound === box) {
      setPlaced(p => ({ ...p, [id]: box }));
      playSuccess();
      const allPlaced = Object.keys(placed).length + 1 === words.length;
      if (allPlaced) {
        setTimeout(() => setReward(true), 500);
      }
    } else {
      playError();
    }
    setOverBox(null);
    setDraggingId(null);
  };

  const onDragStart = (e, id) => {
    setDraggingId(id);
    e.dataTransfer.setData('text/plain', String(id));
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e, box) => { e.preventDefault(); setOverBox(box); };
  const onDragLeave = () => setOverBox(null);
  const onDrop = (e, box) => {
    e.preventDefault();
    const id = +e.dataTransfer.getData('text/plain');
    placeWord(id, box);
  };

  // Touch support: tap word, then tap box
  const [selected, setSelected] = useState(null);
  const onTapWord = (id) => {
    if (placed[id] !== undefined) return;
    setSelected(id);
    speak(words[id].w, 0.7);
  };
  const onTapBox = (box) => {
    if (selected !== null) {
      placeWord(selected, box);
      setSelected(null);
    }
  };

  return (
    <div className="page-card pop-in">
      <h2 className="page-title">🐝🐍 تحدي الأصوات: ز و س</h2>
      <p className="page-subtitle">اسحب كل كلمة إلى الصندوق المناسب حسب صوتها.</p>

      <HintBubble>صوت النحلة <strong>زززز</strong> 🐝 — صوت الثعبان <strong>سسسس</strong> 🐍</HintBubble>

      <div className="sound-stage">
        <div
          className={'sound-box box-zay' + (overBox === 'zay' ? ' over' : '')}
          onDragOver={e => onDragOver(e, 'zay')}
          onDragLeave={onDragLeave}
          onDrop={e => onDrop(e, 'zay')}
          onClick={() => onTapBox('zay')}
        >
          <div className="header">
            <div className="big-letter">ز</div>
            <div className="sound-hint">صوت النحلة <span className="onomato">زززز</span> 🐝</div>
          </div>
          <div className="box-content">
            {words.map((w, i) => placed[i] === 'zay' && (
              <div key={i} className="draggable-word in-zay">{w.w}</div>
            ))}
          </div>
        </div>

        <div
          className={'sound-box box-seen' + (overBox === 'seen' ? ' over' : '')}
          onDragOver={e => onDragOver(e, 'seen')}
          onDragLeave={onDragLeave}
          onDrop={e => onDrop(e, 'seen')}
          onClick={() => onTapBox('seen')}
        >
          <div className="header">
            <div className="big-letter">س</div>
            <div className="sound-hint">صوت الثعبان <span className="onomato">سسسس</span> 🐍</div>
          </div>
          <div className="box-content">
            {words.map((w, i) => placed[i] === 'seen' && (
              <div key={i} className="draggable-word in-seen">{w.w}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="sound-words-pool">
        {words.map((w, i) => placed[i] === undefined && (
          <div
            key={i}
            className={'draggable-word' + (selected === i ? ' in-zay' : '') + (draggingId === i ? ' dragging' : '')}
            draggable
            onDragStart={e => onDragStart(e, i)}
            onClick={() => onTapWord(i)}
          >
            {w.w}
          </div>
        ))}
        {Object.keys(placed).length === words.length && (
          <div className="empty-pool-msg">✨ أكملت جميع الكلمات!</div>
        )}
      </div>

      <Reward show={reward} onClose={() => { setReward(false); onComplete(); }} message="رائع جداً! 🐝🐍" />
    </div>
  );
}

window.GameTrain = GameTrain;
window.GameDrum = GameDrum;
window.GameSound = GameSound;
