/* global React */
const { useState, useEffect } = React;

// ============================================
// DIAGNOSTIC TEST (Dyslexia screener)
// ============================================
const DIAG_QUESTIONS = [
  { type: 'tf', q: 'هل يخلط طفلك بين الحروف المتشابهة (مثل ب وت)؟', no_is_good: true },
  { type: 'tf', q: 'هل يقرأ الكلمة بعكس ترتيب حروفها أحياناً؟', no_is_good: true },
  { type: 'tf', q: 'هل يجد صعوبة في تذكر شكل الحروف؟', no_is_good: true },
  { type: 'tf', q: 'هل يتجنب القراءة بصوت مرتفع أمام الآخرين؟', no_is_good: true },
  { type: 'visual', q: 'أي حرف هو نفس الحرف الأول؟', display: 'ب', options: ['ب', 'ت', 'ث', 'ن'], correct: 0 },
  { type: 'visual', q: 'أي كلمة تطابق الكلمة الأصلية؟', display: 'قمر', options: ['قمر', 'قرم', 'مقر', 'رقم'], correct: 0 },
  { type: 'choice', q: 'كم حرفاً في كلمة "كتاب"؟', options: ['3', '4', '5', '6'], correct: 1 },
  { type: 'choice', q: 'ما الحرف الأول في كلمة "زهرة"؟', options: ['ز', 'ه', 'ر', 'ة'], correct: 0 },
];

function Diagnostic({ onComplete, onBack, parentMode }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [pickedThisStep, setPickedThisStep] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const cur = DIAG_QUESTIONS[step];
  const done = step >= DIAG_QUESTIONS.length;

  const pick = (val) => {
    if (showFeedback) return;
    setPickedThisStep(val);
    setShowFeedback(true);
    setAnswers(a => ({ ...a, [step]: val }));
    setTimeout(() => {
      setShowFeedback(false);
      setPickedThisStep(null);
      setStep(s => s + 1);
    }, 900);
  };

  if (done) {
    // Score: count "correct/no" answers
    let score = 0;
    DIAG_QUESTIONS.forEach((q, i) => {
      const ans = answers[i];
      if (q.type === 'tf') {
        if ((q.no_is_good && ans === false) || (!q.no_is_good && ans === true)) score++;
      } else if (q.type === 'visual' || q.type === 'choice') {
        if (ans === q.correct) score++;
      }
    });
    const pct = Math.round((score / DIAG_QUESTIONS.length) * 100);
    let interpretation, recommend, icon;
    if (pct >= 75) {
      icon = '🌟';
      interpretation = 'الأداء جيد جداً. لا تظهر مؤشرات قوية لعسر القراءة.';
      recommend = 'استمر في القراءة المنتظمة وتطوير المهارات.';
    } else if (pct >= 50) {
      icon = '💡';
      interpretation = 'بعض المؤشرات الخفيفة لصعوبات قرائية. قد يستفيد الطفل من تمارين علاجية.';
      recommend = 'ننصح بالعمل على ألعاب التقطيع والتمييز الصوتي بانتظام.';
    } else {
      icon = '🤝';
      interpretation = 'المؤشرات تشير إلى احتمال وجود عسر قراءة. ننصح بالتقييم لدى مختص.';
      recommend = 'استخدم التطبيق يومياً، وتواصل مع أخصائي تربوي للتشخيص الدقيق.';
    }
    return (
      <div className="dashboard">
        <div className="diag-card diag-result pop-in">
          <div className="result-icon">{icon}</div>
          <h2>نتيجة التشخيص</h2>
          <div className="score-big">{score}/{DIAG_QUESTIONS.length}</div>
          <div style={{ fontSize: 18, color: 'var(--ink-soft)' }}>نسبة الأداء: <strong>{pct}%</strong></div>
          <div className="interpretation">
            <div>{interpretation}</div>
            <div className="recommend">💡 توصية: {recommend}</div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={onBack}>← رجوع</button>
            <button className="btn-primary" onClick={() => onComplete({ score, pct })}>حفظ النتيجة</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div style={{ marginBottom: 16 }}>
        <button className="btn-secondary" onClick={onBack}>← رجوع</button>
      </div>
      <div className="diag-card pop-in">
        <div style={{ textAlign: 'center', marginBottom: 8, color: 'var(--ink-soft)', fontSize: 14 }}>
          سؤال {step + 1} من {DIAG_QUESTIONS.length}
        </div>
        <div className="diag-progress">
          {DIAG_QUESTIONS.map((_, i) => (
            <div key={i} className={'diag-step' + (i < step ? ' done' : i === step ? ' current' : '')}></div>
          ))}
        </div>

        <div className="diag-question">
          {parentMode && cur.type === 'tf' ? cur.q : cur.q}
        </div>

        {cur.type === 'tf' && (
          <div className="tf-options">
            <div
              className={'tf-option true-opt' + (pickedThisStep === true ? (cur.no_is_good ? ' selected wrong' : ' selected correct') : '')}
              onClick={() => pick(true)}
            >
              <span style={{ fontSize: 36 }}>✅</span>
              <span>نعم</span>
            </div>
            <div
              className={'tf-option false-opt' + (pickedThisStep === false ? (cur.no_is_good ? ' selected correct' : ' selected wrong') : '')}
              onClick={() => pick(false)}
            >
              <span style={{ fontSize: 36 }}>❌</span>
              <span>لا</span>
            </div>
          </div>
        )}

        {(cur.type === 'visual' || cur.type === 'choice') && (
          <>
            {cur.display && <div className="diag-image-display">{cur.display}</div>}
            <div className="choice-options">
              {cur.options.map((o, i) => (
                <div
                  key={i}
                  className={'choice-option' + (pickedThisStep === i ? (i === cur.correct ? ' correct' : ' wrong') : '')}
                  onClick={() => pick(i)}
                >
                  {o}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================
// IQ QUIZ — pattern recognition + spot the diff
// ============================================
const PATTERNS = [
  { grid: ['🔴', '🔵', '🔴', '🔵', '🔴', '🔵', '🔴', '🔵', '?'], options: ['🔴', '🔵', '🟢', '🟡'], correct: 0 },
  { grid: ['⭐', '⭐⭐', '⭐⭐⭐', '⭐', '⭐⭐', '⭐⭐⭐', '⭐', '⭐⭐', '?'], options: ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐'], correct: 2 },
  { grid: ['🐶', '🐱', '🐶', '🐱', '🐶', '🐱', '🐶', '🐱', '?'], options: ['🐶', '🐱', '🐭', '🐰'], correct: 0 },
];

function IQQuiz({ onComplete, onBack }) {
  const [phase, setPhase] = useState('pattern'); // 'pattern' | 'spot' | 'result'
  const [pIdx, setPIdx] = useState(0);
  const [pickedIQ, setPickedIQ] = useState(null);
  const [score, setScore] = useState(0);
  const [foundDiffs, setFoundDiffs] = useState([]);

  const SPOT_DIFFS = [
    { id: 'd1', emoji: '🌸', leftPos: { top: '20%', left: '25%' }, rightPos: { top: '60%', left: '40%' } },
    { id: 'd2', emoji: '⭐', leftPos: { top: '50%', left: '70%' }, rightPos: { top: '15%', left: '20%' } },
    { id: 'd3', emoji: '🦋', leftPos: { top: '70%', left: '30%' }, rightPos: { top: '70%', left: '60%' } },
  ];

  const SPOT_BG = [
    { emoji: '🌳', top: '10%', left: '50%' },
    { emoji: '☁️', top: '15%', left: '15%' },
    { emoji: '🌻', top: '75%', left: '75%' },
  ];

  const pickPattern = (i) => {
    if (pickedIQ !== null) return;
    setPickedIQ(i);
    if (i === PATTERNS[pIdx].correct) {
      playSuccess();
      setScore(s => s + 1);
    } else {
      playError();
    }
    setTimeout(() => {
      setPickedIQ(null);
      if (pIdx + 1 < PATTERNS.length) {
        setPIdx(pIdx + 1);
      } else {
        setPhase('spot');
      }
    }, 900);
  };

  const findDiff = (id) => {
    if (foundDiffs.includes(id)) return;
    playSuccess();
    const next = [...foundDiffs, id];
    setFoundDiffs(next);
    if (next.length === SPOT_DIFFS.length) {
      setScore(s => s + 3);
      setTimeout(() => setPhase('result'), 800);
    }
  };

  const cur = PATTERNS[pIdx];

  return (
    <div className="dashboard">
      <div style={{ marginBottom: 16 }}>
        <button className="btn-secondary" onClick={onBack}>← رجوع</button>
      </div>

      {phase === 'pattern' && (
        <div className="diag-card iq-stage pop-in">
          <h2 className="page-title">🎯 لعبة الذكاء — اكتشف النمط</h2>
          <p className="page-subtitle">نمط {pIdx + 1} من {PATTERNS.length} — ما الذي يكمل النمط؟</p>
          <div className="pattern-grid">
            {cur.grid.map((c, i) => (
              <div key={i} className={'pattern-cell' + (c === '?' ? ' question' : '')}>{c}</div>
            ))}
          </div>
          <div className="iq-choices">
            {cur.options.map((o, i) => (
              <div
                key={i}
                className={'iq-choice' + (pickedIQ === i ? (i === cur.correct ? ' correct' : ' wrong') : '')}
                onClick={() => pickPattern(i)}
              >{o}</div>
            ))}
          </div>
        </div>
      )}

      {phase === 'spot' && (
        <div className="diag-card iq-stage pop-in">
          <h2 className="page-title">👀 اكتشف الفرق</h2>
          <p className="page-subtitle">جد {SPOT_DIFFS.length} اختلافات بين الصورتين — وجدت {foundDiffs.length}</p>
          <div className="spot-stage">
            <div className="spot-panel">
              {SPOT_BG.map((b, i) => (
                <span key={i} className="spot-emoji" style={{ top: b.top, left: b.left, cursor: 'default' }}>{b.emoji}</span>
              ))}
              {SPOT_DIFFS.map(d => (
                <span
                  key={d.id}
                  className={'spot-emoji' + (foundDiffs.includes(d.id) ? ' found' : '')}
                  style={d.leftPos}
                  onClick={() => findDiff(d.id)}
                >{d.emoji}</span>
              ))}
            </div>
            <div className="spot-panel">
              {SPOT_BG.map((b, i) => (
                <span key={i} className="spot-emoji" style={{ top: b.top, left: b.left, cursor: 'default' }}>{b.emoji}</span>
              ))}
              {SPOT_DIFFS.map(d => (
                <span
                  key={d.id}
                  className={'spot-emoji' + (foundDiffs.includes(d.id) ? ' found' : '')}
                  style={d.rightPos}
                  onClick={() => findDiff(d.id)}
                >{d.emoji}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === 'result' && (
        <div className="diag-card diag-result pop-in">
          <div className="result-icon">🧠</div>
          <h2>نتيجة اختبار الذكاء</h2>
          <div className="score-big">{score}/{PATTERNS.length + 3}</div>
          <div className="interpretation">
            {score >= 5 ? 'أداء ممتاز! ذكاء بصري عالٍ 🌟' :
             score >= 3 ? 'أداء جيد. استمر في التدرب لتطوير قدرات التمييز البصري.' :
             'لا بأس! التدرب المنتظم سيحسّن الأداء.'}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn-primary" onClick={() => onComplete({ score })}>حفظ والعودة</button>
          </div>
        </div>
      )}
    </div>
  );
}

window.Diagnostic = Diagnostic;
window.IQQuiz = IQQuiz;
