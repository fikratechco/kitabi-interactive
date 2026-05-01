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

function App() {
  // Top-level routing: 'landing' | 'auth' | 'child-home' | 'parent-home' | 'book' | 'reading' | 'games' | 'diagnostic' | 'iq' | 'child-report'
  const [view, setView] = useState('landing');
  const [authMode, setAuthMode] = useState('signup');
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState(MOCK_CHILDREN);
  const [selectedChild, setSelectedChild] = useState(null);
  const [currentBook, setCurrentBook] = useState(null);
  const [currentText, setCurrentText] = useState(null);
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
            const userProfile = await auth.getUserProfile(currentUser.id);
            setUser({
              id: currentUser.id,
              email: currentUser.email,
              name: userProfile?.name || 'User',
              role: userProfile?.role || 'child',
            });
            
            // Load children data if parent
            if (userProfile?.role === 'parent') {
              const dataService = new window.DataService();
              const childrenData = await dataService.getChildren(currentUser.id);
              if (childrenData.length > 0) {
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
            } else {
              // Child logged in — load their progress
              const dataService = new window.DataService();
              const childProgress = await dataService.getProgress(currentUser.id);
              if (childProgress) {
                setProgress({
                  stars: childProgress.stars || 0,
                  texts: childProgress.texts || {},
                  gamesPlayed: childProgress.gamesPlayed || 0,
                  streak: childProgress.streak || 1,
                  completedGames: {},
                });
              }
              setView('child-home');
            }
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
    setUser(data);
    setView(data.role === 'parent' ? 'parent-home' : 'child-home');
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
    setView('landing');
  };

  // ---- Child book flow ----
  const openBook = (book) => { setCurrentBook(book); setView('book'); };
  const pickText = (text) => {
    setCurrentText(text);
    setView('reading');
  };
  const onReadDone = async () => {
    const newProgress = { ...progress, texts: { ...progress.texts, [currentText.id]: 'read' } };
    setProgress(newProgress);
    
    // Save to database if user is logged in
    if (useSupabase && user?.id) {
      try {
        const dataService = new window.DataService();
        await dataService.recordTextRead(user.id, currentBook?.id, currentText?.id, 'read');
      } catch (err) {
        console.error('Error saving reading progress:', err);
      }
    }
    
    setView('games');
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
    if (useSupabase && user?.id) {
      try {
        const dataService = new window.DataService();
        await dataService.addStar(user.id);
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
    if (useSupabase && user?.id) {
      try {
        const dataService = new window.DataService();
        // Record text as complete and add bonus stars
        await dataService.recordTextRead(user.id, currentBook?.id, currentText?.id, 'done');
        await dataService.addStar(user.id);
        await dataService.addStar(user.id);
        await dataService.addStar(user.id);
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
        <ReadingPage fontSize={fontSize} onContinue={onReadDone} selectedText={currentText} selectedBook={currentBook} user={user} />
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

      <cur.Comp onComplete={onComp} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
