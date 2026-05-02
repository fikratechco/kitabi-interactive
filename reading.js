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
// Supports full-text MP3 playback (TTS removed — MP3 files to be added)
// Saves progress to database when reading is complete
// ============================================
function ReadingPage({ onContinue, fontSize, selectedText, selectedBook, bookId, user, gamesEnabled = true, progressChildId }) {
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
    // Attempt to play full text MP3
    if (audioMgrRef.current && selectedBook?.id && selectedText?.id) {
      try {
        const success = await audioMgrRef.current.playText(selectedBook.id, selectedText.id);
        if (success) {
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
        console.warn('MP3 playback failed:', e);
      }
    }
    // No MP3 available yet — just stop quietly
    setReading(false);
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
    const childId = progressChildId || user?.id;
    if (finished && childId && selectedText?.id && selectedBook?.id) {
      const saveProgress = async () => {
        try {
          const dataService = typeof window.DataService === 'function' ? new window.DataService() : null;
          if (dataService) {
            await dataService.recordTextRead(childId, selectedBook.id, selectedText.id, 'read');
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
        <h2>📖 {selectedText?.displayIcon || selectedBook?.emoji} {text.title}</h2>
        {text.page && <div className="progress-pill">صفحة {text.page}</div>}
      </div>

      <HintBubble>
        اقرأ النص بعناية، ثم اضغط على «تخطي إلى الألعاب» للمتابعة 📖
      </HintBubble>

      <div className="lesson-image">
        <span style={{ fontSize: 80 }}>{selectedText?.displayIcon || selectedBook?.emoji || '📖'}</span>
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
                    onClick={() => {}}
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
            <p>{gamesEnabled ? 'الآن حان وقت الألعاب لتثبت ما تعلمته!' : 'هذا النص قراءة فقط، يمكنك العودة إلى بقية النصوص.'}</p>
          </div>
          <button className="btn-primary" onClick={onContinue}>
            {gamesEnabled ? 'هيا نلعب! 🎮 ←' : 'عودة إلى النصوص ←'}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
        {!reading ? (
          <button className="btn-primary" onClick={playAll}>▶ تشغيل القصة</button>
        ) : (
          <button className="btn-secondary" onClick={stop}>⏸ إيقاف</button>
        )}
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
