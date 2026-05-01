// home.jsx — Home screen + Reading screen (the "interactive book" page)

const SAMPLE_LESSONS = [
  {
    id: 'lesson-z',
    letter: 'ز',
    title: 'حرف الزاي',
    mascot: 'bee',
    color: '#e8b04b',
    text: 'زارَ زيدٌ حديقَةَ الحيواناتِ. سمِعَ صوتَ نحلَةٍ تَطنّ زززز فوقَ الزهورِ.',
    targetLetters: ['ز','ح'],
  },
  {
    id: 'lesson-s',
    letter: 'س',
    title: 'حرف السين',
    mascot: 'snake',
    color: '#7ba05b',
    text: 'سمِعَتْ سَلْمى صوتَ ثعبانٍ يَهمِسُ سسسس بينَ الأعشابِ السوداءِ.',
    targetLetters: ['س','ث'],
  },
  {
    id: 'lesson-gh',
    letter: 'غ',
    title: 'حرف الغين',
    mascot: 'owl',
    color: '#b07a9c',
    text: 'في الصباحِ غادرَتْ غزالَةٌ صغيرَةٌ غابتها بحثاً عن غذاءٍ طيّبٍ.',
    targetLetters: ['غ','ص'],
  },
];

const GAMES = [
  { id:'train', title:'قطار الجملة', sub:'كم كلمة في الجملة؟', icon:'🚂', color:'#d97757' },
  { id:'drum', title:'طبل المقاطع', sub:'استخرج الحرف وقطّع الكلمة', icon:'🥁', color:'#e8b04b' },
  { id:'bee', title:'نحلة وثعبان', sub:'صنّف ز و س', icon:'🐝', color:'#7ba05b' },
  { id:'position', title:'موقع الحرف', sub:'أول، وسط، آخر', icon:'📍', color:'#6ea8c9' },
  { id:'build', title:'تركيب الحرف', sub:'ركّب القطع المكسورة', icon:'🧩', color:'#b07a9c' },
  { id:'missing', title:'الجزء الناقص', sub:'أكمل الحرف الناقص', icon:'✏️', color:'#c45a4d' },
  { id:'shadow', title:'مطابقة الظلال', sub:'تتبّع بصري سريع', icon:'👤', color:'#5a8aa8' },
  { id:'sounds', title:'لعبة الأصوات', sub:'حذف، استبدال، قافية', icon:'🎵', color:'#d97757' },
  { id:'keys', title:'مفاتيح الحركات', sub:'افتح الباب بالحركة', icon:'🔑', color:'#e8b04b' },
];

function HomeScreen({ onPickLesson, onPickGame, mascot }) {
  return (
    <div className="paper-bg" style={{height:'100%',width:'100%',position:'relative',overflow:'auto',padding:'30px 36px 40px'}}>
      {/* header */}
      <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:20}}>
        <div style={{width:56,height:56,borderRadius:28,background:'#fff',border:'2px solid var(--ink)',
          display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,boxShadow:'2px 2px 0 var(--ink)'}}>
          📖
        </div>
        <div>
          <div style={{fontSize:13,letterSpacing:'.18em',color:'var(--ink-3)',fontWeight:700}}>الكتابُ التفاعليُّ</div>
          <div style={{fontFamily:'var(--font-display)',fontSize:30,fontWeight:900,color:'var(--ink)',lineHeight:1}}>
            لُغَتي الجَميلَة
          </div>
        </div>
        <div style={{flex:1}}/>
        <div className="chip" style={{background:'#fff8e6'}}>
          <span style={{color:'#e8b04b',fontSize:16}}>★</span>
          <b style={{fontVariantNumeric:'tabular-nums'}}>24</b>
        </div>
        <div className="chip" style={{background:'#e6f0d8'}}>
          🔥 <b>3</b> أيام
        </div>
      </div>

      {/* greeting card */}
      <div className="card" style={{display:'flex',alignItems:'center',gap:18,background:'#fff8ee',marginBottom:24}}>
        <div style={{flex:'0 0 auto'}}>{mascot === 'snake' ? <MascotSnake size={88}/> : mascot==='owl' ? <MascotOwl size={84}/> : <MascotBee size={88}/>}</div>
        <div style={{flex:1}}>
          <div style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:800,color:'var(--ink)',marginBottom:4}}>
            مرحباً يا بطل! 👋
          </div>
          <div style={{fontSize:17,color:'var(--ink-2)',lineHeight:1.6}}>
            تابِعْ رِحلَتَكَ. اليومُ نَتعلَّمُ <b style={{color:'var(--accent-coral)'}}>حرفَ الزاي</b> ونَلعَبُ ٣ ألعابٍ جَديدَة.
          </div>
        </div>
        <button className="btn primary" style={{fontSize:18}} onClick={() => onPickLesson(SAMPLE_LESSONS[0])}>
          ابدأ الدرس ←
        </button>
      </div>

      {/* lessons row */}
      <div style={{marginBottom:8,display:'flex',alignItems:'baseline',gap:10}}>
        <div style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:800}}>الدُروس</div>
        <div style={{color:'var(--ink-3)',fontSize:14}}>۳ دروس متاحة</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:26}}>
        {SAMPLE_LESSONS.map((l,i) => (
          <button key={l.id} onClick={() => onPickLesson(l)}
            style={{textAlign:'right',cursor:'pointer',padding:0,border:'none',background:'transparent'}}>
            <div className="card" style={{padding:18,background:i===0?'#fff8ee':'#fbf6e9'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <div style={{width:60,height:60,borderRadius:14,background:l.color,
                  border:'2px solid var(--ink)',display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:38,fontWeight:900,color:'#fff8ee',fontFamily:'var(--font-display)',boxShadow:'2px 2px 0 var(--ink)'}}>
                  {l.letter}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,fontSize:18}}>{l.title}</div>
                  <div style={{fontSize:13,color:'var(--ink-3)'}}>الدرس {['الأوّل','الثاني','الثالث'][i]}</div>
                </div>
                {i===0 && <div style={{fontSize:11,padding:'3px 8px',background:'var(--success)',color:'#fff8ee',
                  borderRadius:8,fontWeight:700}}>الآن</div>}
              </div>
              <div style={{height:10,background:'var(--paper-3)',borderRadius:999,border:'1.5px solid var(--ink)',overflow:'hidden'}}>
                <div style={{height:'100%',width:[`${65}%`,`${20}%`,'0%'][i],background:'var(--accent-green)'}}/>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* games grid */}
      <div style={{marginBottom:8,display:'flex',alignItems:'baseline',gap:10}}>
        <div style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:800}}>الألعاب</div>
        <div style={{color:'var(--ink-3)',fontSize:14}}>تدرّبْ على ما تعلّمتَ</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:12}}>
        {GAMES.map(g => (
          <button key={g.id} onClick={() => onPickGame(g.id)}
            style={{textAlign:'center',cursor:'pointer',padding:0,border:'none',background:'transparent'}}>
            <div className="card" style={{padding:'16px 10px',background:'#fbf6e9'}}>
              <div style={{width:54,height:54,margin:'0 auto 8px',borderRadius:14,background:g.color,
                border:'2px solid var(--ink)',display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:28,boxShadow:'2px 2px 0 var(--ink)'}}>
                {g.icon}
              </div>
              <div style={{fontWeight:800,fontSize:15,marginBottom:2}}>{g.title}</div>
              <div style={{fontSize:11,color:'var(--ink-3)',lineHeight:1.4}}>{g.sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Reading screen — the "interactive book"
function ReadingScreen({ lesson, onBack, onStartGames, fontSize, showTashkeel, mascot }) {
  const [activeWord, setActiveWord] = React.useState(null);
  const text = lesson.text;
  const display = showTashkeel ? text : stripTashkeel(text);
  const words = display.split(/\s+/);

  const speak = (word) => {
    SFX.pop();
    setActiveWord(word);
    setTimeout(() => setActiveWord(null), 800);
  };

  const Mascot = mascot === 'snake' ? MascotSnake : mascot === 'owl' ? MascotOwl : MascotBee;

  return (
    <div className="paper-bg" style={{height:'100%',display:'flex',flexDirection:'column'}}>
      <GameHUD onBack={onBack} title={lesson.title} stars={3} total={5} progress={0.6} />

      <div style={{flex:1,display:'flex',gap:20,padding:'24px 32px',overflow:'auto'}}>
        {/* left: letter focus */}
        <div style={{flex:'0 0 200px',display:'flex',flexDirection:'column',alignItems:'center',gap:14}}>
          <div style={{
            width:160,height:160,borderRadius:28,background:lesson.color,
            border:'3px solid var(--ink)',display:'flex',alignItems:'center',justifyContent:'center',
            fontFamily:'var(--font-display)',fontSize:120,fontWeight:900,color:'#fff8ee',
            boxShadow:'4px 4px 0 var(--ink)',
          }}>
            {lesson.letter}
          </div>
          <button className="btn" style={{width:'100%',justifyContent:'center'}} onClick={() => SFX.pop()}>
            🔊 استَمِعْ
          </button>
          <div className="chip" style={{background:'#fff'}}>الحركة: <b>الفتحة ـَ</b></div>
        </div>

        {/* center: text */}
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:16}}>
          <div className="card" style={{
            background:'#fff8ee',
            fontSize: fontSize + 'px',
            lineHeight: 2.2,
            fontWeight: 600,
            padding:'30px 36px',
          }}>
            {words.map((w,i) => {
              const stripped = stripTashkeel(w);
              const hasTarget = lesson.targetLetters.some(l => stripped.includes(l));
              return (
                <span key={i} className={activeWord===i?'pop':''} onClick={() => speak(i)}
                  style={{
                    display:'inline-block', cursor:'pointer',
                    margin:'0 4px', padding:'2px 8px', borderRadius:8,
                    background: activeWord===i ? 'var(--accent-yellow)' : hasTarget ? 'rgba(217,119,87,0.15)' : 'transparent',
                    color: hasTarget ? 'var(--accent-coral)' : 'var(--ink)',
                    fontWeight: hasTarget ? 800 : 600,
                    transition: 'background .15s',
                  }}>
                  {w}
                </span>
              );
            })}
          </div>

          {/* mascot guide */}
          <div style={{display:'flex',alignItems:'flex-end',gap:14}}>
            <div style={{flex:'0 0 auto'}}><Mascot size={84} talking/></div>
            <Bubble>
              اضغطْ على أيِّ كَلِمَةٍ لِسماعِها 🔊
              <br/>
              ثُمَّ اِبْدَأْ الألعابَ تَحتَ النَّصِّ ↓
            </Bubble>
          </div>
        </div>

        {/* right: image placeholder + controls */}
        <div style={{flex:'0 0 200px',display:'flex',flexDirection:'column',gap:14}}>
          <div className="dashed" style={{
            background:'repeating-linear-gradient(45deg,#f5ecd9,#f5ecd9 8px,#ede0c4 8px,#ede0c4 16px)',
            height:200,display:'flex',alignItems:'center',justifyContent:'center',
            fontFamily:'monospace',fontSize:12,color:'var(--ink-3)',padding:14,textAlign:'center',
          }}>
            صورة توضيحية<br/>(غزالة، نحلة، ثعبان…)
          </div>
          <div className="card" style={{padding:14,background:'#fbf6e9'}}>
            <div style={{fontSize:13,color:'var(--ink-3)',marginBottom:8,fontWeight:700}}>كلمات اليوم</div>
            {[lesson.text.split(' ').slice(0,2).join(' '), 'زهور', 'نحلة'].map(w => (
              <div key={w} style={{
                padding:'8px 12px',background:'#fff',border:'1.5px solid var(--ink)',
                borderRadius:10,marginBottom:6,fontWeight:700,fontSize:16,
              }}>{stripTashkeel(w)}</div>
            ))}
          </div>
        </div>
      </div>

      {/* bottom action */}
      <div style={{padding:'14px 32px',borderTop:'2px solid var(--line)',background:'rgba(245,236,217,0.7)',
        display:'flex',gap:12,alignItems:'center'}}>
        <div style={{color:'var(--ink-3)',fontSize:14}}>أتممت قراءة النص؟</div>
        <div style={{flex:1}}/>
        <button className="btn primary" style={{fontSize:18}} onClick={onStartGames}>
          ابدأ الألعاب ٩ ←
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, ReadingScreen, SAMPLE_LESSONS, GAMES });
