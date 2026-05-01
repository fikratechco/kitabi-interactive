// games-2.jsx — Position + Build + Missing Part

// ============== Game 4: Letter Position ==============
const POSITION_DATA = [
  { letter:'غ', word:'غزالة', forms:{ initial:'غـ', medial:'ـغـ', final:'ـغ' }, image:'غزالة' },
  { letter:'غ', sentence:'في الـ___ـابة غزال', position:'medial', options:['غـ','ـغـ','ـغ'], correct:'ـغـ' },
  { letter:'غ', sentence:'صبا___ غدا', position:'final', options:['غـ','ـغـ','ـغ'], correct:'ـغ' },
  { letter:'غ', sentence:'___زالة جميلة', position:'initial', options:['غـ','ـغـ','ـغ'], correct:'غـ' },
];

function GamePosition({ onDone, onBack }) {
  const [step, setStep] = React.useState(0);
  const [feedback, setFeedback] = React.useState(null);

  const item = POSITION_DATA[step];
  const intro = step === 0;

  const choose = (opt) => {
    if (opt === item.correct) {
      SFX.success();
      setFeedback('success');
      setTimeout(() => {
        setFeedback(null);
        if (step + 1 >= POSITION_DATA.length) {
          // we'll show done at last
        }
        setStep(step + 1);
      }, 700);
    } else {
      SFX.error(); setFeedback('error'); setTimeout(()=>setFeedback(null),500);
    }
  };

  const finished = step >= POSITION_DATA.length;

  return (
    <div className="paper-bg" style={{height:'100%',display:'flex',flexDirection:'column',position:'relative'}}>
      <GameHUD onBack={onBack} title="📍 موقع الحرف" stars={3} total={3} progress={(step)/POSITION_DATA.length}/>
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px 30px',gap:24}}>
        {finished && <Confetti show/>}

        {intro && (
          <>
            <div style={{display:'flex',alignItems:'center',gap:18}}>
              <div className="dashed" style={{
                width:160,height:160,
                background:'repeating-linear-gradient(45deg,#f5ecd9,#f5ecd9 8px,#ede0c4 8px,#ede0c4 16px)',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontFamily:'monospace',fontSize:13,color:'var(--ink-3)',
              }}>صورة غزالة</div>
              <div style={{fontSize:90,fontFamily:'var(--font-display)',fontWeight:900,color:'var(--accent-mauve)'}}>غ</div>
              <div style={{fontSize:40,fontWeight:800}}>غَزالة</div>
            </div>
            <div style={{display:'flex',gap:14}}>
              {[
                {label:'في الأول',form:'غـ',ex:'غُراب'},
                {label:'في الوسط',form:'ـغـ',ex:'مَغارة'},
                {label:'في الآخر',form:'ـغ',ex:'بالِغ'},
              ].map(p => (
                <div key={p.label} className="card" style={{padding:14,minWidth:140,textAlign:'center',background:'#fff8ee'}}>
                  <div style={{fontSize:13,color:'var(--ink-3)',fontWeight:700}}>{p.label}</div>
                  <div style={{fontSize:48,fontWeight:900,fontFamily:'var(--font-display)',color:'var(--accent-coral)',margin:'4px 0'}}>{p.form}</div>
                  <div style={{fontSize:18,fontWeight:700}}>{p.ex}</div>
                </div>
              ))}
            </div>
            <button className="btn primary" onClick={()=>setStep(1)}>ابدأ السؤال ←</button>
          </>
        )}

        {!intro && !finished && (
          <>
            <div style={{fontSize:18,color:'var(--ink-3)',fontWeight:700}}>اختَرِ شَكلَ الحرفِ المُناسِبِ</div>
            <div className={feedback==='error'?'shake':''} style={{
              fontSize:50,fontWeight:800,fontFamily:'var(--font-display)',
              padding:'20px 40px',background:'#fff8ee',border:'3px dashed var(--ink-3)',
              borderRadius:18,
            }}>
              {item.sentence.split('___').map((part,i,arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span style={{
                      display:'inline-block',width:80,height:60,verticalAlign:'middle',
                      borderBottom:'4px solid var(--accent-coral)',margin:'0 8px',
                      background:feedback==='success'?'rgba(123,160,91,0.3)':'transparent',
                      borderRadius:6,
                    }}>{feedback==='success' && <span style={{color:'var(--success)'}}>{item.correct}</span>}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div style={{display:'flex',gap:14}}>
              {item.options.map(opt => (
                <button key={opt} onClick={()=>choose(opt)} style={{
                  width:110,height:110,fontSize:54,fontWeight:900,
                  fontFamily:'var(--font-display)',color:'var(--accent-mauve)',
                  background:'#fff',border:'3px solid var(--ink)',borderRadius:18,
                  boxShadow:'3px 3px 0 var(--ink)', cursor:'pointer',
                }}>{opt}</button>
              ))}
            </div>
          </>
        )}

        {finished && (
          <div style={{textAlign:'center',display:'flex',flexDirection:'column',gap:14,alignItems:'center'}}>
            <div style={{fontSize:64}}>📍🎯</div>
            <div style={{fontSize:24,fontWeight:800}}>تعرّفتَ على مواقع الحرف!</div>
            <button className="btn success" onClick={onDone}>اللعبة التالية ←</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============== Game 5: Build the letter ==============
// User drags 2-3 pieces of a letter into the right place
const LETTER_BUILD = {
  letter:'س', // teeth (top) + base (bottom)
  pieces: [
    { id:'teeth', label:'الأسنان', svg:'M10 30 L20 10 L30 30 L40 10 L50 30 L60 10 L70 30', target:{x:50,y:30} },
    { id:'base', label:'القاعدة', svg:'M10 60 Q40 90 70 60', target:{x:50,y:80} },
  ],
};

function GameBuild({ onDone, onBack }) {
  const [placed, setPlaced] = React.useState({});
  const [dragging, setDragging] = React.useState(null);
  const allPlaced = LETTER_BUILD.pieces.every(p => placed[p.id]);

  React.useEffect(() => {
    if (allPlaced) {
      SFX.success();
      const t = setTimeout(()=>SFX.clap(), 400);
      return () => clearTimeout(t);
    }
  }, [allPlaced]);

  const onDrop = (e, pieceId) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text');
    if (id === pieceId) {
      SFX.pop();
      setPlaced(p => ({...p, [id]: true}));
    } else { SFX.error(); }
  };

  return (
    <div className="paper-bg" style={{height:'100%',display:'flex',flexDirection:'column',position:'relative'}}>
      <GameHUD onBack={onBack} title="🧩 تركيب الحرف" stars={2} total={3} progress={Object.keys(placed).length/LETTER_BUILD.pieces.length}/>
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px 30px',gap:24}}>
        {allPlaced && <><Confetti show/><Stars show/></>}

        <div style={{textAlign:'center'}}>
          <div style={{fontSize:18,color:'var(--ink-3)',fontWeight:700}}>التعليمات</div>
          <div style={{fontSize:22,fontWeight:700}}>الحرفُ مُتَفَكِّك! اسْحَبْ القِطَعَ إلى مَكانِها 🧩</div>
        </div>

        {/* Workbench */}
        <div style={{
          width:420,height:300,background:'#fff8ee',
          border:'3px solid var(--ink)',borderRadius:24,boxShadow:'4px 4px 0 var(--ink)',
          position:'relative',
        }}>
          {/* outline of س */}
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            {/* teeth slot */}
            <g onDragOver={e=>e.preventDefault()} onDrop={e=>onDrop(e,'teeth')}>
              <path d="M20 40 L30 20 L40 40 L50 20 L60 40 L70 20 L80 40"
                stroke={placed.teeth ? 'var(--accent-coral)':'rgba(58,44,26,0.2)'}
                strokeWidth={placed.teeth?5:3} strokeDasharray={placed.teeth?'':'4 3'}
                fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
            {/* base slot */}
            <g onDragOver={e=>e.preventDefault()} onDrop={e=>onDrop(e,'base')}>
              <path d="M20 70 Q50 95 80 70"
                stroke={placed.base ? 'var(--accent-coral)':'rgba(58,44,26,0.2)'}
                strokeWidth={placed.base?5:3} strokeDasharray={placed.base?'':'4 3'}
                fill="none" strokeLinecap="round"/>
            </g>
          </svg>
          {allPlaced && (
            <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:160,fontFamily:'var(--font-display)',fontWeight:900,color:'var(--accent-coral)',
              animation:'pop .5s'}}>
              س
            </div>
          )}
        </div>

        {/* Pieces tray */}
        <div style={{display:'flex',gap:20}}>
          {LETTER_BUILD.pieces.map(p => placed[p.id] ? null : (
            <div key={p.id} draggable onDragStart={e=>{e.dataTransfer.setData('text',p.id); setDragging(p.id);}}
              onDragEnd={()=>setDragging(null)}
              style={{
                background:'#fff',border:'2.5px solid var(--ink)',borderRadius:14,
                padding:14,cursor:'grab',boxShadow:'3px 3px 0 var(--ink)',
                opacity: dragging===p.id ? 0.5 : 1,
                display:'flex',flexDirection:'column',alignItems:'center',gap:6,
              }}>
              <svg viewBox="0 0 80 60" width="100" height="80">
                <path d={p.svg} stroke="var(--accent-coral)" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div style={{fontWeight:700,fontSize:14,color:'var(--ink-2)'}}>{p.label}</div>
            </div>
          ))}
          {allPlaced && (
            <button className="btn success" style={{fontSize:20}} onClick={onDone}>
              اللعبة التالية ←
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============== Game 6: Missing piece of letter ==============
const MISSING_DATA = [
  { display:'ر', target:'ز', missing:'نقطة', options:['نقطة','نصف دائرة','خط مستقيم'], hint:'حرف الراء بدون نقطة' },
  { display:'د', target:'ذ', missing:'نقطة', options:['نقطة','نصف دائرة','خط مستقيم'], hint:'حرف الذال بدون نقطة' },
];

function GameMissing({ onDone, onBack }) {
  const [step, setStep] = React.useState(0);
  const [feedback, setFeedback] = React.useState(null);
  const [showDot, setShowDot] = React.useState(false);
  const item = MISSING_DATA[step];

  const choose = (opt) => {
    if (opt === item.missing) {
      SFX.success(); setFeedback('success'); setShowDot(true);
      setTimeout(() => {
        setShowDot(false); setFeedback(null);
        if (step+1>=MISSING_DATA.length) setStep(step+1);
        else setStep(step+1);
      }, 1200);
    } else { SFX.error(); setFeedback('error'); setTimeout(()=>setFeedback(null),500);}
  };

  const finished = step >= MISSING_DATA.length;

  return (
    <div className="paper-bg" style={{height:'100%',display:'flex',flexDirection:'column',position:'relative'}}>
      <GameHUD onBack={onBack} title="✏️ الجزء الناقص" stars={2} total={3} progress={step/MISSING_DATA.length}/>
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px 30px',gap:24}}>
        {finished && <Confetti show/>}
        {!finished && (
          <>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:18,color:'var(--ink-3)',fontWeight:700}}>التعليمات</div>
              <div style={{fontSize:22,fontWeight:700}}>أيُّ جُزْءٍ يَنْقُصُ هذا الحَرفَ؟</div>
            </div>
            <div className={feedback==='error'?'shake':''} style={{
              width:280,height:280,background:'#fff8ee',border:'3px solid var(--ink)',
              borderRadius:24,boxShadow:'4px 4px 0 var(--ink)',
              display:'flex',alignItems:'center',justifyContent:'center',position:'relative',
            }}>
              <div style={{fontSize:200,fontFamily:'var(--font-display)',fontWeight:900,color:'var(--ink)',position:'relative'}}>
                {item.display}
                {showDot && (
                  <span style={{position:'absolute',top:0,right:'45%',fontSize:60,color:'var(--accent-coral)',animation:'pop .4s'}}>•</span>
                )}
              </div>
              <div style={{position:'absolute',top:14,right:14,fontSize:14,color:'var(--ink-3)',fontWeight:700}}>{item.hint}</div>
            </div>
            <div style={{display:'flex',gap:14}}>
              {item.options.map(opt => (
                <button key={opt} onClick={()=>choose(opt)} className="card"
                  style={{padding:'18px 22px',background:'#fff',cursor:'pointer',
                    fontWeight:800,fontSize:18,minWidth:130,textAlign:'center',
                    display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
                  <div style={{fontSize:30}}>
                    {opt==='نقطة' && '•'}
                    {opt==='نصف دائرة' && '⌒'}
                    {opt==='خط مستقيم' && '—'}
                  </div>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </>
        )}
        {finished && (
          <div style={{textAlign:'center',display:'flex',flexDirection:'column',gap:14,alignItems:'center'}}>
            <div style={{fontSize:64}}>✏️🎉</div>
            <div style={{fontSize:24,fontWeight:800}}>أكملتَ كلَّ الحروف!</div>
            <button className="btn success" onClick={onDone}>اللعبة التالية ←</button>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { GamePosition, GameBuild, GameMissing });
