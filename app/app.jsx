// app.jsx — Main app shell, routing, design canvas wrapper

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "fontSize": 26,
  "showTashkeel": true,
  "soundOn": true,
  "speed": 1,
  "dyslexicFont": false,
  "theme": "warm-paper"
}/*EDITMODE-END*/;

const THEMES = {
  'warm-paper': { paper:'#f5ecd9', paper2:'#ede0c4', ink:'#3a2c1a' },
  'cream':      { paper:'#fbf6e9', paper2:'#f0e8d0', ink:'#2a2418' },
  'soft-blue':  { paper:'#e6eef5', paper2:'#d4e0ec', ink:'#22344a' },
  'mint':       { paper:'#e8f0e3', paper2:'#d6e4cf', ink:'#243a2c' },
};

function PrototypeApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = React.useState('home'); // home | reading | game-X
  const [lesson, setLesson] = React.useState(SAMPLE_LESSONS[0]);

  React.useEffect(() => { SFX.setMuted(!t.soundOn); }, [t.soundOn]);

  React.useEffect(() => {
    const theme = THEMES[t.theme] || THEMES['warm-paper'];
    document.documentElement.style.setProperty('--paper', theme.paper);
    document.documentElement.style.setProperty('--paper-2', theme.paper2);
    document.documentElement.style.setProperty('--ink', theme.ink);
  }, [t.theme]);

  const startGame = (gid) => setRoute('game-' + gid);
  const back = () => setRoute(lesson ? 'reading' : 'home');

  let screen;
  if (route === 'home') {
    screen = <HomeScreen mascot={lesson.mascot}
      onPickLesson={(l) => { setLesson(l); setRoute('reading'); }}
      onPickGame={(gid) => { setRoute('game-' + gid); }} />;
  } else if (route === 'reading') {
    screen = <ReadingScreen lesson={lesson} mascot={lesson.mascot}
      fontSize={t.fontSize} showTashkeel={t.showTashkeel}
      onBack={() => setRoute('home')}
      onStartGames={() => setRoute('game-train')} />;
  } else if (route === 'game-train') screen = <GameTrain onBack={back} onDone={() => setRoute('game-drum')} speed={t.speed}/>;
  else if (route === 'game-drum') screen = <GameDrum onBack={back} onDone={() => setRoute('game-bee')} />;
  else if (route === 'game-bee') screen = <GameBeeSnake onBack={back} onDone={() => setRoute('game-position')} />;
  else if (route === 'game-position') screen = <GamePosition onBack={back} onDone={() => setRoute('game-build')} />;
  else if (route === 'game-build') screen = <GameBuild onBack={back} onDone={() => setRoute('game-missing')} />;
  else if (route === 'game-missing') screen = <GameMissing onBack={back} onDone={() => setRoute('game-shadow')} />;
  else if (route === 'game-shadow') screen = <GameShadow onBack={back} onDone={() => setRoute('game-sounds')} speed={t.speed}/>;
  else if (route === 'game-sounds') screen = <GameSounds onBack={back} onDone={() => setRoute('game-keys')} />;
  else if (route === 'game-keys') screen = <GameKeys onBack={back} onDone={() => setRoute('home')} />;

  return (
    <div className={'app-root ' + (t.dyslexicFont ? 'dyslexic' : '')}
      style={{
        fontFamily: t.dyslexicFont ? '"Comic Sans MS","Cairo",sans-serif' : 'var(--font-ar)',
      }}>
      {screen}
      <TweaksPanel title="إعدادات / Tweaks">
        <TweakSection label="القراءة"/>
        <TweakSlider label="حجم الخط" value={t.fontSize} min={18} max={42} unit="px"
          onChange={v => setTweak('fontSize', v)} />
        <TweakToggle label="إظهار التشكيل" value={t.showTashkeel}
          onChange={v => setTweak('showTashkeel', v)} />
        <TweakToggle label="خط مناسب لعسر القراءة" value={t.dyslexicFont}
          onChange={v => setTweak('dyslexicFont', v)} />

        <TweakSection label="الصوت والسرعة"/>
        <TweakToggle label="الأصوات" value={t.soundOn}
          onChange={v => setTweak('soundOn', v)} />
        <TweakSlider label="سرعة الألعاب" value={t.speed} min={0.5} max={2} step={0.25}
          unit="×" onChange={v => setTweak('speed', v)} />

        <TweakSection label="الثيم"/>
        <TweakSelect label="لون الورق" value={t.theme}
          options={[
            {value:'warm-paper',label:'ورق دافئ'},
            {value:'cream',label:'كريمي'},
            {value:'soft-blue',label:'أزرق هادئ'},
            {value:'mint',label:'نعناعي'},
          ]}
          onChange={v => setTweak('theme', v)} />
      </TweaksPanel>
    </div>
  );
}

// ── Design canvas: shows ALL screens side-by-side ────────────────────────
function CanvasApp() {
  const [t] = useTweaks(TWEAK_DEFAULTS);
  const W = 1100, H = 720;

  const Frame = ({ children }) => (
    <div className="app-root" style={{height:H,width:W,fontFamily:'var(--font-ar)'}}>
      {children}
    </div>
  );

  return (
    <DesignCanvas>
      <DCSection id="overview" title="الكتاب التفاعلي للغة العربية" subtitle="9 ألعاب · موجّه لفئة المعسرين قرائيًا · 7-9 سنوات">
        <DCArtboard id="proto" label="🎮 Prototype تفاعلي كامل" width={W} height={H}>
          <PrototypeApp />
        </DCArtboard>
      </DCSection>

      <DCSection id="screens" title="الشاشات الرئيسية" subtitle="الصفحة الرئيسية، الكتاب، المساعد">
        <DCArtboard id="home" label="🏠 الشاشة الرئيسية" width={W} height={H}>
          <Frame><HomeScreen mascot="bee" onPickLesson={()=>{}} onPickGame={()=>{}}/></Frame>
        </DCArtboard>
        <DCArtboard id="reading" label="📖 صفحة الكتاب التفاعلي" width={W} height={H}>
          <Frame><ReadingScreen lesson={SAMPLE_LESSONS[0]} mascot="bee" fontSize={26} showTashkeel onBack={()=>{}} onStartGames={()=>{}}/></Frame>
        </DCArtboard>
      </DCSection>

      <DCSection id="games-a" title="الألعاب — الجزء الأول" subtitle="القطار، الطبل، النحلة والثعبان">
        <DCArtboard id="train" label="🚂 لعبة 1: قطار الجملة" width={W} height={H}>
          <Frame><GameTrain onBack={()=>{}} onDone={()=>{}}/></Frame>
        </DCArtboard>
        <DCArtboard id="drum" label="🥁 لعبة 2: الطبل والمقاطع" width={W} height={H}>
          <Frame><GameDrum onBack={()=>{}} onDone={()=>{}}/></Frame>
        </DCArtboard>
        <DCArtboard id="bee" label="🐝 لعبة 3: النحلة والثعبان" width={W} height={H}>
          <Frame><GameBeeSnake onBack={()=>{}} onDone={()=>{}}/></Frame>
        </DCArtboard>
      </DCSection>

      <DCSection id="games-b" title="الألعاب — الجزء الثاني" subtitle="موقع الحرف، التركيب، الجزء الناقص">
        <DCArtboard id="position" label="📍 لعبة 4: موقع الحرف" width={W} height={H}>
          <Frame><GamePosition onBack={()=>{}} onDone={()=>{}}/></Frame>
        </DCArtboard>
        <DCArtboard id="build" label="🧩 لعبة 5: تركيب الحرف" width={W} height={H}>
          <Frame><GameBuild onBack={()=>{}} onDone={()=>{}}/></Frame>
        </DCArtboard>
        <DCArtboard id="missing" label="✏️ لعبة 6: الجزء الناقص" width={W} height={H}>
          <Frame><GameMissing onBack={()=>{}} onDone={()=>{}}/></Frame>
        </DCArtboard>
      </DCSection>

      <DCSection id="games-c" title="الألعاب — الجزء الثالث" subtitle="الظلال، الأصوات، مفاتيح الحركات">
        <DCArtboard id="shadow" label="👤 لعبة 7: مطابقة الظلال" width={W} height={H}>
          <Frame><GameShadow onBack={()=>{}} onDone={()=>{}}/></Frame>
        </DCArtboard>
        <DCArtboard id="sounds" label="🎵 لعبة 8: التلاعب بالأصوات" width={W} height={H}>
          <Frame><GameSounds onBack={()=>{}} onDone={()=>{}}/></Frame>
        </DCArtboard>
        <DCArtboard id="keys" label="🔑 لعبة 9: مفاتيح الحركات" width={W} height={H}>
          <Frame><GameKeys onBack={()=>{}} onDone={()=>{}}/></Frame>
        </DCArtboard>
      </DCSection>

      <DCPostIt top={20} right={40} rotate={3}>
        💡 افتحْ أيَّ شاشة على وضع full-focus بالضغط على ↗ أو على عنوان البطاقة.
      </DCPostIt>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<CanvasApp />);
