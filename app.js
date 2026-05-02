/* global React, getAudioManager, getSupabaseClient, AuthService, DataService */
const { useState, useEffect } = React;

// ============================================
// MOCK CHILD DATA (fallback during loading)
// ============================================
const MOCK_CHILDREN = [
  {
    id: 'c1', name: 'أحمد', age: 7, avatar: '👦', daysActive: 14, progress: {
      stars: 12, texts: { g1: 'done', g2: 'read' }, gamesPlayed: 8, minutesSpent: 145,
      diagnostic: { pct: 65, date: 'منذ ٣ أيام' },
      skills: { segment: 75, sound: 60, position: 80, assembly: 65, rhyme: 45, vowels: 70 },
    },
  },
  {
    id: 'c2', name: 'ليلى', age: 6, avatar: '👧', daysActive: 7, progress: {
      stars: 5, texts: { g1: 'read' }, gamesPlayed: 3, minutesSpent: 60,
      skills: { segment: 50, sound: 40, position: 55, assembly: 30, rhyme: 25, vowels: 35 },
    },
  },
];

// ============================================
// MAIN APP — full platform routing
// ============================================
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "fontSize": 32,
  "showSyllables": false
}/*EDITMODE-END*/;

const DEFAULT_GAME_CONTEXT = {
  trainSentence: ['في', 'الغابة', 'تعيش', 'غزالة', 'جميلة'],
  drumChallenges: [
    { word: 'زهور', syllables: ['زُ', 'هـو', 'ر'], image: '🌹' },
    { word: 'غزالة', syllables: ['غـ', 'زا', 'لـة'], image: '🦌' },
  ],
  soundChallenge: {
    targetLetter: 'ز',
    contrastLetter: 'س',
    words: [
      { w: 'زهرة', sound: 'target' },
      { w: 'سمكة', sound: 'contrast' },
      { w: 'زرافة', sound: 'target' },
      { w: 'سلحفاة', sound: 'contrast' },
      { w: 'زيتون', sound: 'target' },
      { w: 'سحاب', sound: 'contrast' },
    ],
  },
};

function sanitizeArabicWords(sentence) {
  return String(sentence || '')
    .replace(/[^\u0600-\u06FF\s]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(Boolean);
}

function estimateSyllables(word) {
  const letters = [...String(word || '').replace(/[^\u0600-\u06FF]/g, '')];
  if (letters.length <= 2) return [word];
  const chunks = [];
  for (let i = 0; i < letters.length; i += 2) {
    chunks.push(letters.slice(i, i + 2).join(''));
  }
  return chunks;
}

function inferWordIcon(word) {
  const w = String(word || '');
  if (/مدرس|قسم|تلميذ|معلم/.test(w)) return '🏫';
  if (/بيت|أم|أب|أخت|جدة|عائل/.test(w)) return '👨‍👩‍👧‍👦';
  if (/قمح|زرع|ريف|نخيل|واحة|فلاح/.test(w)) return '🌾';
  if (/كرة|فريق|ملعب|رياض/.test(w)) return '⚽';
  if (/طبيب|أسنان|غذ|فطور|حليب|صحة/.test(w)) return '🍎';
  if (/بريد|هاتف|تلفاز|أنترنت|حاسوب/.test(w)) return '📡';
  if (/تراث|متحف|أمازيغ|زربية/.test(w)) return '🏛️';
  return '📘';
}

async function bootstrapUserSession(currentUser, setUser, setChildren, setProgress, setView, setActiveChildId) {
  if (!currentUser) return;

  const auth = new window.AuthService();
  const dataService = new window.DataService();
  const userProfile = await auth.getUserProfile(currentUser.id);

  const nextUser = {
    id: currentUser.id,
    email: currentUser.email,
    name: userProfile?.name || 'User',
    role: userProfile?.role || 'child',
  };

  setUser(nextUser);

  if (userProfile?.role === 'parent') {
    setActiveChildId(null);
    const childrenData = await dataService.getChildren(currentUser.id);
    if (childrenData && childrenData.length > 0) {
      setChildren(childrenData.map(c => ({
        ...c,
        progress: {
          stars: c.progress?.stars || 0,
          texts: c.progress?.texts || {},
          gamesPlayed: c.progress?.gamesPlayed || 0,
          minutesSpent: c.progress?.minutesSpent || 0,
        },
      })));
    }
    setView('parent-home');
    return;
  }

  const linkedChildren = await dataService.getChildren(currentUser.id);
  let childRecord = linkedChildren && linkedChildren.length > 0 ? linkedChildren[0] : null;

  if (!childRecord) {
    const created = await dataService.createChild(currentUser.id, userProfile?.name || 'طفل', 7, '🧒');
    childRecord = created && created[0] ? created[0] : null;
  }

  if (childRecord?.id) {
    setActiveChildId(childRecord.id);
    const childProgress = await dataService.getProgress(childRecord.id);
    if (childProgress) {
      setProgress({
        stars: childProgress.stars || 0,
        texts: childProgress.texts || {},
        gamesPlayed: childProgress.gamesPlayed || 0,
        streak: childProgress.streak || 1,
        completedGames: {},
      });
    }
  }

  setView('child-home');
}


// Predefined manipulation examples keyed by target letter.
const LETTER_MANIP_TABLE = {
  'م': { del: { word: 'مال', letter: 'م', result: 'آل' }, rep: { word: 'مار', from: 'م', to: 'ن', result: 'نار' }, rhyme: { word: 'قلم', options: [{ w: 'علم', correct: true }, { w: 'كتاب', correct: false }, { w: 'قدم', correct: true }, { w: 'باب', correct: false }] } },
  'س': { del: { word: 'سماء', letter: 'س', result: 'ماء' }, rep: { word: 'سار', from: 'س', to: 'ن', result: 'نار' }, rhyme: { word: 'فرس', options: [{ w: 'حرس', correct: true }, { w: 'كتاب', correct: false }, { w: 'عرس', correct: true }, { w: 'باب', correct: false }] } },
  'ق': { del: { word: 'قمر', letter: 'ق', result: 'مر' }, rep: { word: 'قال', from: 'ق', to: 'م', result: 'مال' }, rhyme: { word: 'طريق', options: [{ w: 'صديق', correct: true }, { w: 'كتاب', correct: false }, { w: 'رفيق', correct: true }, { w: 'باب', correct: false }] } },
  'ز': { del: { word: 'زرع', letter: 'ز', result: 'رع' }, rep: { word: 'زيت', from: 'ز', to: 'ب', result: 'بيت' }, rhyme: { word: 'زهر', options: [{ w: 'نهر', correct: true }, { w: 'كتاب', correct: false }, { w: 'شهر', correct: true }, { w: 'باب', correct: false }] } },
  'ن': { del: { word: 'نار', letter: 'ن', result: 'آر' }, rep: { word: 'نور', from: 'ن', to: 'ط', result: 'طور' }, rhyme: { word: 'لون', options: [{ w: 'عون', correct: true }, { w: 'كتاب', correct: false }, { w: 'كون', correct: true }, { w: 'باب', correct: false }] } },
  'ج': { del: { word: 'جار', letter: 'ج', result: 'آر' }, rep: { word: 'جيل', from: 'ج', to: 'ل', result: 'ليل' }, rhyme: { word: 'برج', options: [{ w: 'فرج', correct: true }, { w: 'كتاب', correct: false }, { w: 'مرج', correct: true }, { w: 'باب', correct: false }] } },
  'ر': { del: { word: 'رمل', letter: 'ر', result: 'مل' }, rep: { word: 'ريح', from: 'ر', to: 'م', result: 'ميح' }, rhyme: { word: 'قمر', options: [{ w: 'سفر', correct: true }, { w: 'كتاب', correct: false }, { w: 'حجر', correct: true }, { w: 'شمس', correct: false }] } },
  'ح': { del: { word: 'حليب', letter: 'ح', result: 'ليب' }, rep: { word: 'حار', from: 'ح', to: 'ن', result: 'نار' }, rhyme: { word: 'صباح', options: [{ w: 'فلاح', correct: true }, { w: 'كتاب', correct: false }, { w: 'نجاح', correct: true }, { w: 'باب', correct: false }] } },
  'ل': { del: { word: 'لون', letter: 'ل', result: 'ون' }, rep: { word: 'لعب', from: 'ل', to: 'ك', result: 'كعب' }, rhyme: { word: 'جبل', options: [{ w: 'عسل', correct: true }, { w: 'كتاب', correct: false }, { w: 'أمل', correct: true }, { w: 'باب', correct: false }] } },
  'ك': { del: { word: 'كتب', letter: 'ك', result: 'تب' }, rep: { word: 'كوب', from: 'ك', to: 'ث', result: 'ثوب' }, rhyme: { word: 'ملك', options: [{ w: 'فلك', correct: true }, { w: 'كتاب', correct: false }, { w: 'سلك', correct: true }, { w: 'باب', correct: false }] } },
  'ي': { del: { word: 'يد', letter: 'ي', result: 'د' }, rep: { word: 'يوم', from: 'ي', to: 'ص', result: 'صوم' }, rhyme: { word: 'وادي', options: [{ w: 'نادي', correct: true }, { w: 'كتاب', correct: false }, { w: 'شادي', correct: true }, { w: 'باب', correct: false }] } },
  'ظ': { del: { word: 'ظل', letter: 'ظ', result: 'ل' }, rep: { word: 'ظهر', from: 'ظ', to: 'ن', result: 'نهر' }, rhyme: { word: 'حفظ', options: [{ w: 'لفظ', correct: true }, { w: 'كتاب', correct: false }, { w: 'وعظ', correct: true }, { w: 'باب', correct: false }] } },
  'ب': { del: { word: 'بحر', letter: 'ب', result: 'حر' }, rep: { word: 'باب', from: 'ب', to: 'ك', result: 'كاب' }, rhyme: { word: 'كتاب', options: [{ w: 'حساب', correct: true }, { w: 'شمس', correct: false }, { w: 'ثواب', correct: true }, { w: 'قمر', correct: false }] } },
  'و': { del: { word: 'ورد', letter: 'و', result: 'رد' }, rep: { word: 'وقت', from: 'و', to: 'ب', result: 'بقت' }, rhyme: { word: 'نور', options: [{ w: 'طور', correct: true }, { w: 'كتاب', correct: false }, { w: 'دور', correct: true }, { w: 'باب', correct: false }] } },
  'ف': { del: { word: 'فجر', letter: 'ف', result: 'جر' }, rep: { word: 'فرح', from: 'ف', to: 'م', result: 'مرح' }, rhyme: { word: 'صيف', options: [{ w: 'ضيف', correct: true }, { w: 'كتاب', correct: false }, { w: 'سيف', correct: true }, { w: 'باب', correct: false }] } },
  'ص': { del: { word: 'صوت', letter: 'ص', result: 'وت' }, rep: { word: 'صبر', from: 'ص', to: 'ن', result: 'نبر' }, rhyme: { word: 'قصص', options: [{ w: 'رصص', correct: true }, { w: 'كتاب', correct: false }, { w: 'حصص', correct: true }, { w: 'باب', correct: false }] } },
  'ش': { del: { word: 'شمس', letter: 'ش', result: 'مس' }, rep: { word: 'شجر', from: 'ش', to: 'ح', result: 'حجر' }, rhyme: { word: 'جيش', options: [{ w: 'عيش', correct: true }, { w: 'كتاب', correct: false }, { w: 'ريش', correct: true }, { w: 'باب', correct: false }] } },
  'ط': { del: { word: 'طير', letter: 'ط', result: 'ير' }, rep: { word: 'طول', from: 'ط', to: 'ق', result: 'قول' }, rhyme: { word: 'خيط', options: [{ w: 'بسيط', correct: true }, { w: 'كتاب', correct: false }, { w: 'وسيط', correct: true }, { w: 'باب', correct: false }] } },
  'ت': { del: { word: 'تين', letter: 'ت', result: 'ين' }, rep: { word: 'تاج', from: 'ت', to: 'ز', result: 'زاج' }, rhyme: { word: 'بيت', options: [{ w: 'ليت', correct: true }, { w: 'كتاب', correct: false }, { w: 'صيت', correct: true }, { w: 'باب', correct: false }] } },
  'ع': { del: { word: 'عين', letter: 'ع', result: 'ين' }, rep: { word: 'عود', from: 'ع', to: 'ج', result: 'جود' }, rhyme: { word: 'ربيع', options: [{ w: 'سريع', correct: true }, { w: 'كتاب', correct: false }, { w: 'وديع', correct: true }, { w: 'باب', correct: false }] } },
  'ث': { del: { word: 'ثور', letter: 'ث', result: 'ور' }, rep: { word: 'ثلج', from: 'ث', to: 'ب', result: 'بلج' }, rhyme: { word: 'تراث', options: [{ w: 'إراث', correct: true }, { w: 'كتاب', correct: false }, { w: 'ميراث', correct: true }, { w: 'باب', correct: false }] } },
  'غ': { del: { word: 'غيم', letter: 'غ', result: 'يم' }, rep: { word: 'غار', from: 'غ', to: 'ن', result: 'نار' }, rhyme: { word: 'بلاغ', options: [{ w: 'صياغ', correct: true }, { w: 'كتاب', correct: false }, { w: 'دماغ', correct: true }, { w: 'باب', correct: false }] } },
};

const SHADOW_COLORS = ['#E89B7C', '#9B7FBC', '#6FB87F', '#4A90D9'];

function buildGameContext(text) {
  if (!text || !Array.isArray(text.body) || text.body.length === 0) {
    return DEFAULT_GAME_CONTEXT;
  }

  const allWords = text.body.flatMap(sanitizeArabicWords);
  const uniqueWords = [...new Set(allWords)].filter(w => w.length >= 3);

  const firstSentenceWords = sanitizeArabicWords(text.body[0]);
  const trainSentence = (firstSentenceWords.length >= 4
    ? firstSentenceWords.slice(0, 6)
    : uniqueWords.slice(0, 6)
  );

  const drumPool = uniqueWords.filter(w => w.length >= 3 && w.length <= 7).slice(0, 2);
  const drumChallenges = drumPool.length >= 2
    ? drumPool.map(word => ({
      word,
      syllables: estimateSyllables(word),
      image: inferWordIcon(word),
    }))
    : DEFAULT_GAME_CONTEXT.drumChallenges;

  const tagText = Array.isArray(text.tags) ? text.tags.join(' ') : '';
  const targetFromTag = (tagText.match(/حرف\s+([\u0600-\u06FF])/u) || [])[1] || 'ز';
  const contrastCandidates = ['س', 'م', 'ر', 'ق', 'ل', 'ن', 'ب'];
  const contrastLetter = contrastCandidates.find(l => l !== targetFromTag) || 'س';

  const targetWords = uniqueWords.filter(w => w.includes(targetFromTag)).slice(0, 3);
  const contrastWords = uniqueWords
    .filter(w => w.includes(contrastLetter) && !w.includes(targetFromTag))
    .slice(0, 3);

  const soundWords = (targetWords.length >= 2 && contrastWords.length >= 2)
    ? [
      ...targetWords.map(w => ({ w, sound: 'target' })),
      ...contrastWords.map(w => ({ w, sound: 'contrast' })),
    ].slice(0, 6)
    : DEFAULT_GAME_CONTEXT.soundChallenge.words;

  // --- Letter position examples (Game 4) ---
  const wordsWithLetter = uniqueWords.filter(w => w.includes(targetFromTag) && w.length >= 3);
  const posStart  = wordsWithLetter.find(w => [...w][0] === targetFromTag) || null;
  const posEnd    = wordsWithLetter.find(w => [...w][[...w].length - 1] === targetFromTag) || null;
  const posMiddle = wordsWithLetter.find(w => {
    const chars = [...w]; const idx = chars.indexOf(targetFromTag);
    return idx > 0 && idx < chars.length - 1;
  }) || null;
  const letterPositions = {
    start:  posStart  || (targetFromTag + 'مر'),
    middle: posMiddle || ('ال' + targetFromTag + 'بة'),
    end:    posEnd    || ('صب' + targetFromTag),
  };

  // --- Fill-blank words for Game 4 ---
  const blankPool = wordsWithLetter.filter(w => w.length >= 4).slice(0, 2);
  const letterBlanks = blankPool.length >= 2
    ? blankPool.map(w => {
      const chars = [...w]; const idx = chars.indexOf(targetFromTag);
      return { before: chars.slice(0, idx).join(''), after: chars.slice(idx + 1).join(''), answer: targetFromTag };
    })
    : [
      { before: 'الـ', after: 'ـابة', answer: targetFromTag },
      { before: '', after: 'ـزال', answer: targetFromTag },
    ];

  // --- Shadow words for Game 7 ---
  const shortWords = uniqueWords.filter(w => w.length >= 3 && w.length <= 6);
  const shadowWordList = shortWords.slice(0, 4);
  const shadowWords = shadowWordList.length >= 4
    ? shadowWordList.map((word, i) => ({ word, color: SHADOW_COLORS[i] }))
    : [
      { word: 'مئزر', color: SHADOW_COLORS[0] },
      { word: 'قلم',  color: SHADOW_COLORS[1] },
      { word: 'كتاب', color: SHADOW_COLORS[2] },
      { word: 'باب',  color: SHADOW_COLORS[3] },
    ];

  // --- Manipulation data for Game 8 ---
  const manipData = LETTER_MANIP_TABLE[targetFromTag] || LETTER_MANIP_TABLE['ز'];

  return {
    targetLetter: targetFromTag,
    trainSentence: trainSentence.length >= 4 ? trainSentence : DEFAULT_GAME_CONTEXT.trainSentence,
    drumChallenges,
    soundChallenge: { targetLetter: targetFromTag, contrastLetter, words: soundWords },
    letterPositions,
    letterBlanks,
    shadowWords,
    manipData,
  };
}

function App() {
  // Top-level routing: 'landing' | 'auth' | 'child-home' | 'parent-home' | 'book' | 'reading' | 'games' | 'diagnostic' | 'iq' | 'child-report'
  const [view, setView] = useState('landing');
  const [authMode, setAuthMode] = useState('signup');
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState(MOCK_CHILDREN);
  const [selectedChild, setSelectedChild] = useState(null);
  const [currentBook, setCurrentBook] = useState(null);
  const [currentText, setCurrentText] = useState(null);
  const [activeChildId, setActiveChildId] = useState(null);
  const [progress, setProgress] = useState({
    stars: 0, texts: {}, gamesPlayed: 0, streak: 1, completedGames: {},
  });
  const [fontSize, setFontSize] = useState(TWEAK_DEFAULTS.fontSize);
  const [isLoading, setIsLoading] = useState(true);
  const [useSupabase, setUseSupabase] = useState(false);

  // ---- Supabase initialization on mount ----
  useEffect(() => {
    const initializeSupabase = async () => {
      try {
        // Keep voice controls visible but silent until MP3 pack is provided.
        const audioMgr = getAudioManager();
        audioMgr.setMuted(true);

        // Initialize Supabase client
        await window.initSupabase?.();
        const client = window.getSupabaseClient?.();
        
        if (client) {
          setUseSupabase(true);
          
          // Check for existing session
          const auth = new window.AuthService();
          const currentUser = await auth.getCurrentUser();
          
          if (currentUser) {
            // User already logged in — load their data
            await bootstrapUserSession(
              currentUser,
              setUser,
              setChildren,
              setProgress,
              setView,
              setActiveChildId,
            );
          } else {
            setView('landing');
          }
        } else {
          console.warn('⚠️ Supabase not available — using mock data');
          setView('landing');
        }
      } catch (err) {
        console.error('Supabase init error:', err);
        setView('landing');
      } finally {
        setIsLoading(false);
      }
    };

    initializeSupabase();
  }, []);

  // ---- Auth flow ----
  const handleAuth = async (data) => {
    if (!data?.user) {
      setUser(data);
      setView(data.role === 'parent' ? 'parent-home' : 'child-home');
      return;
    }

    await bootstrapUserSession(
      data.user,
      setUser,
      setChildren,
      setProgress,
      setView,
      setActiveChildId,
    );
  };
  const logout = async () => {
    if (useSupabase) {
      try {
        const auth = new window.AuthService();
        await auth.logout();
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    setUser(null);
    setActiveChildId(null);
    setView('landing');
  };

  // ---- Child book flow ----
  const openBook = (book) => {
    if (!book || book.comingSoon) return;
    setCurrentBook(book);
    setView('book');
  };
  const pickText = (text) => {
    setCurrentText(text);
    setView('reading');
  };
  const onReadDone = async () => {
    const hasGames = currentText?.gameAvailable !== false;
    const nextStatus = hasGames ? 'read' : 'done';
    const newProgress = { ...progress, texts: { ...progress.texts, [currentText.id]: nextStatus } };
    setProgress(newProgress);
    
    // Save to database if user is logged in
    const progressChildId = activeChildId || user?.id;
    if (useSupabase && progressChildId) {
      try {
        const dataService = new window.DataService();
        await dataService.recordTextRead(progressChildId, currentBook?.id, currentText?.id, nextStatus);
      } catch (err) {
        console.error('Error saving reading progress:', err);
      }
    }
    
    setView(hasGames ? 'games' : 'book');
  };
  const onGameComplete = async (gameId) => {
    const newProgress = {
      ...progress,
      stars: (progress.stars || 0) + 1,
      gamesPlayed: (progress.gamesPlayed || 0) + 1,
      completedGames: { ...progress.completedGames, [gameId]: true },
    };
    setProgress(newProgress);
    
    // Save to database if user is logged in
    const progressChildId = activeChildId || user?.id;
    if (useSupabase && progressChildId) {
      try {
        const dataService = new window.DataService();
        await dataService.addStar(progressChildId);
      } catch (err) {
        console.error('Error saving game completion:', err);
      }
    }
  };
  const onAllGamesDone = async () => {
    const newProgress = {
      ...progress,
      texts: { ...progress.texts, [currentText.id]: 'done' },
      stars: (progress.stars || 0) + 3,
    };
    setProgress(newProgress);
    
    // Save to database if user is logged in
    const progressChildId = activeChildId || user?.id;
    if (useSupabase && progressChildId) {
      try {
        const dataService = new window.DataService();
        // Record text as complete and add bonus stars
        await dataService.recordTextRead(progressChildId, currentBook?.id, currentText?.id, 'done');
        await dataService.addStar(progressChildId);
        await dataService.addStar(progressChildId);
        await dataService.addStar(progressChildId);
      } catch (err) {
        console.error('Error saving game completion:', err);
      }
    }
    
    setView('book');
  };

  // ---- Parent flow ----
  const onSelectChild = (c) => { setSelectedChild(c); setView('child-report'); };
  const onAddChild = async () => {
    if (!useSupabase || !user?.id) {
      alert('⚠️ Backend not available');
      return;
    }
    
    try {
      const dataService = new window.DataService();
      const newChild = await dataService.createChild(user.id, 'طفل جديد', 6, '🧒');
      if (newChild) {
        setChildren([...children, {
          ...newChild,
          progress: { stars: 0, texts: {}, gamesPlayed: 0, skills: {} },
        }]);
      }
    } catch (err) {
      console.error('Error adding child:', err);
      alert('خطأ في إضافة الطفل');
    }
  };

  // ---- Diagnostic / IQ ----
  const onDiagComplete = (result) => {
    if (user?.role === 'parent' && selectedChild) {
      setChildren(cs => cs.map(c => c.id === selectedChild.id
        ? { ...c, progress: { ...c.progress, diagnostic: { ...result, date: 'الآن' } } }
        : c));
      setView('child-report');
    } else {
      setProgress(p => ({ ...p, diagnostic: result }));
      setView('child-home');
    }
  };
  const onIQComplete = (result) => {
    setProgress(p => ({ ...p, iq: result, stars: (p.stars || 0) + result.score }));
    setView('child-home');
  };

  // ============================================
  // RENDER
  // ============================================
  if (view === 'landing') {
    return <Landing
      onGetStarted={() => { setAuthMode('signup'); setView('auth'); }}
      onLogin={() => { setAuthMode('login'); setView('auth'); }}
    />;
  }

  if (view === 'auth') {
    return <Auth
      mode={authMode}
      onAuth={handleAuth}
      onSwitchMode={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
      onBack={() => setView('landing')}
    />;
  }

  // ---- Child views ----
  if (view === 'child-home') {
    return <ChildDashboard
      user={user}
      progress={progress}
      onOpenBook={openBook}
      onDiagnose={() => setView('diagnostic')}
      onIQ={() => setView('iq')}
      onLogout={logout}
    />;
  }

  if (view === 'book') {
    return <BookDetail
      book={currentBook}
      progress={progress}
      onPickText={pickText}
      onBack={() => setView('child-home')}
    />;
  }

  if (view === 'reading') {
    return (
      <div className="app-shell" data-screen-label="01 reading">
        <TopBar
          fontSize={fontSize} setFontSize={setFontSize}
          onHome={() => setView('child-home')}
          onBedtime={() => alert('قصص قبل النوم — قريباً 🌙')}
        />
        <div style={{ marginBottom: 12 }}>
          <button className="btn-secondary" onClick={() => setView('book')}>← {currentBook?.title}</button>
        </div>
        <ReadingPage
          fontSize={fontSize}
          onContinue={onReadDone}
          selectedText={currentText}
          selectedBook={currentBook}
          user={user}
          gamesEnabled={currentText?.gameAvailable !== false}
          progressChildId={activeChildId || user?.id}
        />
      </div>
    );
  }

  if (view === 'games') {
    return <GamesFlow
      text={currentText}
      progress={progress}
      onGameComplete={onGameComplete}
      onAllDone={onAllGamesDone}
      onHome={() => setView('child-home')}
      onBackToText={() => setView('book')}
      fontSize={fontSize} setFontSize={setFontSize}
      user={user}
    />;
  }

  if (view === 'diagnostic') {
    return <Diagnostic
      onComplete={onDiagComplete}
      onBack={() => setView(user?.role === 'parent' ? 'child-report' : 'child-home')}
      parentMode={user?.role === 'parent'}
    />;
  }

  if (view === 'iq') {
    return <IQQuiz onComplete={onIQComplete} onBack={() => setView('child-home')} />;
  }

  // ---- Parent views ----
  if (view === 'parent-home') {
    return <ParentDashboard
      user={user}
      children={children}
      setChildren={setChildren}
      onSelectChild={onSelectChild}
      onAddChild={onAddChild}
      onDiagnose={() => setView('diagnostic')}
      onLogout={logout}
      useSupabase={useSupabase}
    />;
  }

  if (view === 'child-report') {
    return <ChildReport
      child={selectedChild}
      onBack={() => setView('parent-home')}
      onDiagnose={() => setView('diagnostic')}
    />;
  }

  return <Landing onGetStarted={() => setView('auth')} onLogin={() => setView('auth')} />;
}

// ============================================
// GAMES FLOW (sequential within a text)
// ============================================
function GamesFlow({ text, progress, onGameComplete, onAllDone, onHome, onBackToText, fontSize, setFontSize }) {
  const games = [
    { id: 'train', label: 'القطار', Comp: GameTrain },
    { id: 'drum', label: 'الطبل', Comp: GameDrum },
    { id: 'sound', label: 'صوت ز و س', Comp: GameSound },
    { id: 'position', label: 'موقع الحرف', Comp: GamePosition },
    { id: 'assembly', label: 'تركيب الحرف', Comp: GameAssembly },
    { id: 'missing', label: 'الجزء الناقص', Comp: GameMissing },
    { id: 'shadow', label: 'الظلال', Comp: GameShadow },
    { id: 'manip', label: 'الأصوات', Comp: GameManipulation },
    { id: 'keys', label: 'المفاتيح', Comp: GameVowelKeys },
  ];
  const [idx, setIdx] = React.useState(0);
  const [showMap, setShowMap] = React.useState(false);
  const gameContext = React.useMemo(() => buildGameContext(text), [text]);

  const onComp = () => {
    onGameComplete(games[idx].id);
    if (idx + 1 < games.length) {
      setIdx(idx + 1);
    } else {
      onAllDone();
    }
  };

  const cur = games[idx];

  return (
    <div className="app-shell" data-screen-label={'02 games-' + cur.id}>
      <TopBar fontSize={fontSize} setFontSize={setFontSize} onHome={onHome} onBedtime={() => {}} />

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap' }}>
        <button className="btn-secondary" onClick={onBackToText}>← رجوع للنصوص</button>
        <div style={{ display: 'flex', gap: 6 }}>
          {games.map((g, i) => (
            <span key={g.id} title={g.label} onClick={() => setIdx(i)} style={{
              width: 28, height: 28, borderRadius: 8,
              background: i < idx ? 'var(--accent-green)' : i === idx ? 'var(--accent-blue)' : 'var(--bg-soft)',
              color: i <= idx ? 'white' : 'var(--ink-muted)',
              display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>{i + 1}</span>
          ))}
        </div>
        <div className="progress-pill">لعبة {idx + 1}/{games.length}</div>
      </div>

      <cur.Comp onComplete={onComp} gameContext={gameContext} />
    </div>
  );
}

// Wait for components to be defined before rendering
const renderApp = () => {
  if (typeof Landing === 'undefined') {
    setTimeout(renderApp, 100);
    return;
  }
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
};
renderApp();
