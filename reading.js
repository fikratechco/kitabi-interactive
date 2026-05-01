/* global React, getAudioManager, getTextAudioPath, DataService */
const { useState, useEffect, useRef } = React;

// Split a sentence into clickable word tokens (Arabic-aware).
function tokenize(sentence) {
  // Split on whitespace, keep punctuation attached to words.
  const parts = sentence.split(/(\s+)/).filter(p => p && !/^\s+$/.test(p));
  return parts.map(w => ({ w }));
}

// ============================================
// READING PAGE - Lesson with karaoke highlight
// Now driven by selectedText from library-data.js
// Supports both full-text MP3 and word-by-word synthesis
// Saves progress to database when reading is complete
// ============================================
function ReadingPage({ onContinue, fontSize, selectedText, selectedBook, bookId, user }) {
  // Fallback to demo content if no text selected
  const text = selectedText || {
    title: 'الغزالة الجميلة',
    body: ['في الغابة تعيش غزالة جميلة.', 'الغزالة سريعة وتحب الزهور.'],
  };

  const sentences = text.body.map(s => tokenize(s));

  const [activeSentence, setActiveSentence] = useState(-1);
  const [activeWord, setActiveWord] = useState(-1);
  const [reading, setReading] = useState(false);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef(null);
  const audioMgrRef = useRef(null);

  // Initialize audio manager reference
  useEffect(() => {
    if (typeof getAudioManager === 'function') {
      audioMgrRef.current = getAudioManager();
    }
  }, []);

  const playAll = async () => {
    setReading(true);
    setFinished(false);
    
    // Attempt to play full text MP3 first
    if (audioMgrRef.current && bookId && selectedText?.id) {
      try {
        const success = await audioMgrRef.current.playText(bookId, selectedText.id);
        if (success) {
          // Full MP3 is playing; just mark as finished after reasonable duration
          // In Phase 2, could implement actual audio duration detection
          const estimatedDuration = Math.max(30000, text.body.join(' ').length * 50);
          setTimeout(() => {
            setReading(false);
            setActiveWord(-1);
            setActiveSentence(-1);
            setFinished(true);
          }, estimatedDuration);
          return;
        }
      } catch (e) {
        console.warn('MP3 playback failed, falling back to word-by-word:', e);
      }
    }

    // Fallback to word-by-word synthesis
    let s = 0;
    const playNext = () => {
      if (s >= sentences.length) {
        setReading(false);
        setActiveWord(-1);
        setActiveSentence(-1);
        setFinished(true);
        return;
      }
      setActiveSentence(s);
      const words = sentences[s];
      let i = 0;
      const next = () => {
        if (i >= words.length) { s++; playNext(); return; }
        setActiveWord(i);
        const word = words[i].w;
        if (word && !/^[.،:؟!]+$/.test(word)) speak(word, 0.75);
        const dur = Math.max(550, word.length * 130);
        timerRef.current = setTimeout(() => { i++; next(); }, dur);
      };
      next();
    };
    playNext();
  };

  const stop = () => {
    clearTimeout(timerRef.current);
    if (audioMgrRef.current) {
      audioMgrRef.current.stop();
    }
    window.speechSynthesis?.cancel();
    setReading(false);
    setActiveWord(-1);
    setActiveSentence(-1);
  };

  useEffect(() => () => stop(), []);
  useEffect(() => { stop(); setFinished(false); }, [selectedText?.id]);

  // Save progress when text reading is finished
  useEffect(() => {
    if (finished && user?.id && selectedText?.id && selectedBook?.id) {
      const saveProgress = async () => {
        try {
          const dataService = typeof window.DataService === 'function' ? new window.DataService() : null;
          if (dataService) {
            await dataService.recordTextRead(user.id, selectedBook.id, selectedText.id, 'read');
          }
        } catch (err) {
          console.warn('Error saving reading progress:', err);
        }
      };
      saveProgress();
    }
  }, [finished, user?.id, selectedText?.id, selectedBook?.id]);

  return (
    <div className="page-card pop-in">
      <div className="section-head">
        <h2>📖 {selectedBook?.emoji} {text.title}</h2>
        {text.page && <div className="progress-pill">صفحة {text.page}</div>}
      </div>

      <HintBubble>
        اضغط على زر التشغيل ▶ لتسمع القصة، أو اضغط على أي كلمة لتسمعها وحدها. بعد الانتهاء من القراءة، تظهر لك الألعاب 🎮
      </HintBubble>

      <div className="lesson-image">
        <span style={{ fontSize: 80 }}>{selectedBook?.emoji || '📖'}</span>
        <span className="caption">{text.desc || text.title}</span>
      </div>

      <div className="reading-panel">
        <div className="reading-text" style={{ fontSize: fontSize + 'px' }}>
          {sentences.map((words, sIdx) => (
            <p key={sIdx} style={{ marginBottom: 18, textAlign: 'right', lineHeight: 'var(--reading-line)' }}>
              {words.map((w, wIdx) => {
                const isActive = activeSentence === sIdx && activeWord === wIdx;
                const isRead = activeSentence > sIdx || (activeSentence === sIdx && activeWord > wIdx);
                return (
                  <span
                    key={wIdx}
                    className={'word' + (isActive ? ' active' : '') + (isRead ? ' read' : '')}
                    onClick={() => { if (!/^[.،:؟!]+$/.test(w.w)) speak(w.w, 0.7); }}
                  >
                    {w.w}{' '}
                  </span>
                );
              })}
            </p>
          ))}
        </div>
      </div>

      {finished && (
        <div className="games-unlock-banner">
          <div>
            <h3>🎉 أحسنت! أنهيت القراءة</h3>
            <p>الآن حان وقت الألعاب لتثبت ما تعلمته!</p>
          </div>
          <button className="btn-primary" onClick={onContinue}>هيا نلعب! 🎮 ←</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
        {!reading ? (
          <button className="btn-primary" onClick={playAll}>▶ تشغيل القصة</button>
        ) : (
          <button className="btn-secondary" onClick={stop}>⏸ إيقاف</button>
        )}
        <button className="btn-success" onClick={onContinue}>تخطي إلى الألعاب 🎮</button>
      </div>
    </div>
  );
}

window.ReadingPage = ReadingPage;

  return (
    <div className="page-card pop-in">
      <div className="section-head">
        <h2>📖 {selectedBook?.emoji} {text.title}</h2>
        {text.page && <div className="progress-pill">صفحة {text.page}</div>}
      </div>

      <HintBubble>
        اضغط على زر التشغيل ▶ لتسمع القصة، أو اضغط على أي كلمة لتسمعها وحدها. بعد الانتهاء من القراءة، تظهر لك الألعاب 🎮
      </HintBubble>

      <div className="lesson-image">
        <span style={{ fontSize: 80 }}>{selectedBook?.emoji || '📖'}</span>
        <span className="caption">{text.desc || text.title}</span>
      </div>

      <div className="reading-panel">
        <div className="reading-text" style={{ fontSize: fontSize + 'px' }}>
          {sentences.map((words, sIdx) => (
            <p key={sIdx} style={{ marginBottom: 18, textAlign: 'right', lineHeight: 'var(--reading-line)' }}>
              {words.map((w, wIdx) => {
                const isActive = activeSentence === sIdx && activeWord === wIdx;
                const isRead = activeSentence > sIdx || (activeSentence === sIdx && activeWord > wIdx);
                return (
                  <span
                    key={wIdx}
                    className={'word' + (isActive ? ' active' : '') + (isRead ? ' read' : '')}
                    onClick={() => { if (!/^[.،:؟!]+$/.test(w.w)) speak(w.w, 0.7); }}
                  >
                    {w.w}{' '}
                  </span>
                );
              })}
            </p>
          ))}
        </div>
      </div>

      {finished && (
        <div className="games-unlock-banner">
          <div>
            <h3>🎉 أحسنت! أنهيت القراءة</h3>
            <p>الآن حان وقت الألعاب لتثبت ما تعلمته!</p>
          </div>
          <button className="btn-primary" onClick={onContinue}>هيا نلعب! 🎮 ←</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
        {!reading ? (
          <button className="btn-primary" onClick={playAll}>▶ تشغيل القصة</button>
        ) : (
          <button className="btn-secondary" onClick={stop}>⏸ إيقاف</button>
        )}
        <button className="btn-success" onClick={onContinue}>تخطي إلى الألعاب 🎮</button>
      </div>
    </div>
  );
}

window.ReadingPage = ReadingPage;
