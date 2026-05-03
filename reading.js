/* global React, getAudioManager, getTextAudioPath, DataService */
const { useState, useEffect, useRef, useCallback } = React;

// Split a sentence into clickable word tokens (Arabic-aware).
function tokenize(sentence) {
  const parts = sentence.split(/(\s+)/).filter(p => p && !/^\s+$/.test(p));
  return parts.map(w => ({ w }));
}

// ============================================
// AUDIO PROGRESS BAR
// ============================================
function AudioProgressBar({ progress, duration, currentTime }) {
  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, direction: 'ltr', width: '100%' }}>
      <span style={{ fontSize: 12, color: 'var(--ink-muted)', minWidth: 32, textAlign: 'right' }}>{fmt(currentTime)}</span>
      <div style={{ flex: 1, height: 6, background: 'var(--bg-soft)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: (progress * 100).toFixed(1) + '%',
          background: 'var(--accent-blue)',
          borderRadius: 3,
          transition: 'width 0.25s linear',
        }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--ink-muted)', minWidth: 32 }}>{fmt(duration)}</span>
    </div>
  );
}

// ============================================
// READING PAGE
// ============================================
function ReadingPage({ onContinue, fontSize, selectedText, selectedBook, user, gamesEnabled = true, progressChildId }) {
  const text = selectedText || {
    title: 'الغزالة الجميلة',
    body: ['في الغابة تعيش غزالة جميلة.', 'الغزالة سريعة وتحب الزهور.'],
  };

  const sentences = text.body.map(s => tokenize(s));

  const [reading, setReading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState(null); // null=checking, true, false
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioMgrRef = useRef(null);

  useEffect(() => {
    if (typeof getAudioManager === 'function') {
      audioMgrRef.current = getAudioManager();
    }
  }, []);

  // Check if the MP3 file exists for this text
  useEffect(() => {
    setAudioAvailable(null);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setReading(false);
    setFinished(false);

    const bookId = selectedBook?.id;
    const textId = selectedText?.id;
    if (!bookId || !textId) { setAudioAvailable(false); return; }

    const path = typeof getTextAudioPath === 'function' ? getTextAudioPath(bookId, textId) : null;
    if (!path) { setAudioAvailable(false); return; }

    const probe = new Audio();
    const done = (ok) => {
      probe.removeEventListener('canplaythrough', onOk);
      probe.removeEventListener('error', onErr);
      setAudioAvailable(ok);
    };
    const onOk = () => done(true);
    const onErr = () => done(false);
    probe.addEventListener('canplaythrough', onOk, { once: true });
    probe.addEventListener('error', onErr, { once: true });
    probe.src = path;
    probe.load();
  }, [selectedText?.id, selectedBook?.id]);

  const playAll = useCallback(async () => {
    if (!audioMgrRef.current) return;
    setReading(true);

    const started = await audioMgrRef.current.playTextWithProgress(
      selectedBook?.id,
      selectedText?.id,
      {
        onProgress: (pct, cur, dur) => {
          setProgress(pct);
          setCurrentTime(cur);
          setDuration(dur);
        },
        onEnded: () => {
          setReading(false);
          setProgress(1);
          setFinished(true);
        },
        onError: () => {
          setReading(false);
          setAudioAvailable(false);
        },
      }
    );

    if (!started) setReading(false);
  }, [selectedBook?.id, selectedText?.id]);

  const stop = useCallback(() => {
    audioMgrRef.current?.stop();
    setReading(false);
  }, []);

  useEffect(() => () => stop(), []);

  // Word tap — speak that word
  const onWordTap = (word) => {
    if (typeof speak === 'function') speak(word, 0.8);
  };

  // Save progress when finished
  useEffect(() => {
    const childId = progressChildId || user?.id;
    if (!finished || !childId || !selectedText?.id || !selectedBook?.id) return;
    const save = async () => {
      try {
        const ds = typeof window.DataService === 'function' ? new window.DataService() : null;
        if (ds) await ds.recordTextRead(childId, selectedBook.id, selectedText.id, 'read');
      } catch (err) {
        console.warn('Error saving reading progress:', err);
      }
    };
    save();
  }, [finished]);

  return (
    <div className="page-card pop-in">
      <div className="section-head">
        <h2>📖 {selectedText?.displayIcon || selectedBook?.emoji} {text.title}</h2>
        {text.page && <div className="progress-pill">صفحة {text.page}</div>}
      </div>

      <HintBubble>
        اقرأ النص بعناية — اضغط على أي كلمة لسماعها 🔊
      </HintBubble>

      <div className="lesson-image">
        <span style={{ fontSize: 80 }}>{selectedText?.displayIcon || selectedBook?.emoji || '📖'}</span>
        <span className="caption">{text.desc || text.title}</span>
      </div>

      <div className="reading-panel">
        <div className="reading-text" style={{ fontSize: fontSize + 'px' }}>
          {sentences.map((words, sIdx) => (
            <p key={sIdx} style={{ marginBottom: 18, textAlign: 'right', lineHeight: 'var(--reading-line)' }}>
              {words.map((w, wIdx) => (
                <span
                  key={wIdx}
                  className="word word-tappable"
                  onClick={() => onWordTap(w.w)}
                  style={{ cursor: 'pointer' }}
                >
                  {w.w}{' '}
                </span>
              ))}
            </p>
          ))}
        </div>
      </div>

      {/* Audio controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', marginTop: 20 }}>
        {audioAvailable === null && (
          <p style={{ color: 'var(--ink-muted)', fontSize: 14 }}>جارٍ التحقق من ملف الصوت...</p>
        )}

        {audioAvailable === false && (
          <div style={{
            background: 'var(--bg-soft)', borderRadius: 12, padding: '10px 20px',
            fontSize: 14, color: 'var(--ink-muted)', textAlign: 'center',
          }}>
            🎙️ ملف الصوت لهذا النص غير متاح بعد — يمكنك القراءة ثم الانتقال للألعاب
          </div>
        )}

        {audioAvailable === true && (
          <>
            {reading && (
              <AudioProgressBar progress={progress} duration={duration} currentTime={currentTime} />
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {!reading ? (
                <button className="btn-primary" onClick={playAll}>▶ تشغيل القصة</button>
              ) : (
                <button className="btn-secondary" onClick={stop}>⏸ إيقاف</button>
              )}
            </div>
          </>
        )}
      </div>

      {finished && (
        <div className="games-unlock-banner" style={{ marginTop: 20 }}>
          <div>
            <h3>🎉 أحسنت! أنهيت القراءة</h3>
            <p>{gamesEnabled ? 'الآن حان وقت الألعاب لتثبت ما تعلمته!' : 'هذا النص قراءة فقط، يمكنك العودة إلى بقية النصوص.'}</p>
          </div>
          <button className="btn-primary" onClick={onContinue}>
            {gamesEnabled ? 'هيا نلعب! 🎮 ←' : 'عودة إلى النصوص ←'}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
        {gamesEnabled ? (
          <button className="btn-success" onClick={onContinue}>تخطي إلى الألعاب 🎮</button>
        ) : (
          <button className="btn-success" onClick={onContinue}>العودة إلى النصوص ←</button>
        )}
      </div>
    </div>
  );
}

window.ReadingPage = ReadingPage;
