// games-3.jsx — Shadow + Sounds + Keys

// ============== Game 7: Shadow Matching ==============
const SHADOW_WORDS = [
  { w:'مِئزر', color:'#d97757' },
  { w:'قلم', color:'#6ea8c9' },
  { w:'كتاب', color:'#7ba05b' },
  { w:'شجرة', color:'#b07a9c' },
];

function GameShadow({ onDone, onBack, speed=1 }) {
  const [target, setTarget] = React.useState(0);
  const [matched, setMatched] = React.useState([]);
  const [fading, setFading] = React.useState(0);
  const [feedback, setFeedback] = React.useState(null);

  // Shadow fades over time — speed up with each correct match
  React.useEffect(() => {
    if (target >= SHADOW_WORDS.length) return;
    const dur = 8000 / (speed * (1 + matched.length * 0.3));
    setFading(0);
    const start = Date.now();
    const id = setInterval(() => {
      const f = Math.min(1, (Date.now()-start)/dur);
      setFading(f);
      if (f >= 1) clearInterval(id);
    }, 60);
    return () => clearInterval(id);
  }, [target, speed, matched.length]);

  const onDrop = (e, dropIdx) => {
    e.preventDefault();
    const w = e.dataTransfer.getData('text');
    if (w === SHADOW_WORDS[dropIdx].w) {
      SFX.success();
      setMatched(m => [...m, dropIdx]);
      setTimeout(() => setTarget(t => t+1), 400);
    } else { SFX.error(); setFeedback(w); setTimeout(()=>setFeedback(null),500);}
  };

  const finished = target >= SHADOW_WORDS.length;

  return (
    <div className="paper-bg" style={{height:'100%',display:'flex',flexDirection:'column',position:'relative'}}>
      <GameHUD onBack={onBack} title="👤 مطابقة الظلال" stars={2} total={3} progress={matched.length/SHADOW_WORDS.length}/>
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',padding:'20px 30px',gap:18}}>
        {finished && <Confetti show/>}
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:18,color:'var(--ink-3)',fontWeight:700}}>التعليمات</div>
          <div style={{fontSize:22,fontWeight:700}}>طابِقِ الكَلِمَةَ مع ظِلِّها قبلَ أن يَختَفي ⚡</div>
        </div>

        {/* shadow row */}
        <div style={{display:'flex',gap:16,minHeight:120,alignItems:'center',justifyContent:'center',flexWrap:'wrap'}}>
          {SHADOW_WORDS.map((s, i) => {
            const isMatched = matched.includes(i);
            const isCurrent = i === target && !finished;
            return (
              <div key={i}
                onDragOver={e=>isCurrent && e.preventDefault()}
                onDrop={e=>isCurrent && onDrop(e,i)}
                style={{
                  padding:'14px 24px',minWidth:140,
                  background:'#fff8ee',border:'3px dashed var(--ink-3)',borderRadius:14,
                  fontSize:42,fontWeight:900,fontFamily:'var(--font-display)',
                  position:'relative', textAlign:'center',
                  opacity: i<target && !isMatched ? 0.3 : 1,
                }}>
                {isMatched ? (
                  <span style={{color:s.color}}>{s.w}</span>
                ) : isCurrent ? (
                  <span style={{
                    color:'var(--ink)',
                    opacity: 1 - fading*0.95,
                    filter:'blur(0.5px)',
                    transition:'opacity .1s',
                  }}>{s.w}</span>
                ) : (
                  <span style={{color:'var(--ink-3)',opacity:0.3}}>{s.w}</span>
                )}
                {isCurrent && (
                  <div style={{position:'absolute',top:-10,right:-10,
                    width:32,height:32,borderRadius:16,
                    background:'var(--accent-coral)',color:'#fff8ee',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontWeight:900,fontSize:16,border:'2px solid var(--ink)'}}>!</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Speed indicator */}
        {!finished && (
          <div style={{width:280,height:8,background:'var(--paper-3)',borderRadius:99,border:'1.5px solid var(--ink)',overflow:'hidden'}}>
            <div style={{
              width:`${(1-fading)*100}%`,height:'100%',
              background: fading>0.7 ? 'var(--error)' : 'var(--accent-yellow)',
              transition:'width .1s',
            }}/>
          </div>
        )}

        {/* Word tray */}
        <div style={{flex:1,display:'flex',alignItems:'flex-end',width:'100%',maxWidth:780}}>
          <div style={{
            width:'100%',padding:'14px 18px',background:'#fbf6e9',
            border:'2.5px solid var(--ink)',borderRadius:18,boxShadow:'3px 3px 0 var(--ink)',
            display:'flex',gap:10,flexWrap:'wrap',justifyContent:'center',
          }}>
            {SHADOW_WORDS.filter((_,i)=>!matched.includes(i)).map(s => (
              <div key={s.w} draggable
                onDragStart={e=>e.dataTransfer.setData('text',s.w)}
                className={feedback===s.w?'shake word-pill':'word-pill'}
                style={{cursor:'grab',fontSize:28,color:s.color,padding:'10px 22px'}}>
                {s.w}
              </div>
            ))}
            {finished && (
              <button className="btn success" style={{fontSize:18}} onClick={onDone}>اللعبة التالية ←</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============== Game 8: Sound Manipulation ==============
const SOUND_LEVELS = [
  { type:'delete', word:'سماء', remove:'س', result:'ماء', q:'احذف الحرف "س" من كلمة "سماء"' },
  { type:'replace', word:'بيت', from:'ب', to:'ز', result:'زيت', q:'استبدل "ب" بـ "ز" في "بيت"' },
  { type:'rhyme', target:'قمر', options:['عمر','شمس','كتاب','نهر'], correct:['عمر','نهر'], q:'اختر الكلمات التي تنتهي مثل "قمر"' },
];

function GameSounds({ onDone, onBack }) {
  const [step, setStep] = React.useState(0);
  const [feedback, setFeedback] = React.useState(null);
  const [picked, setPicked] = React.useState([]);
  const [removed, setRemoved] = React.useState(false);
  const item = SOUND_LEVELS[step];

  const next = () => {
    setRemoved(false); setPicked([]); setFeedback(null);
    setStep(step+1);
  };

  const handleDelete = (letter) => {
    if (letter === item.remove) {
      SFX.success(); setRemoved(true);
      setTimeout(next, 1500);
    } else { SFX.error(); setFeedback('error'); setTimeout(()=>setFeedback(null),500);}
  };

  const handleReplace = (letter) => {
    if (letter === item.from) {
      SFX.success(); setRemoved(true);
      setTimeout(next, 1500);
    } else { SFX.error(); setFeedback('error'); setTimeout(()=>setFeedback(null),500);}
  };

  const handleRhyme = (w) => {
    const newPicked = picked.includes(w) ? picked.filter(x=>x!==w) : [...picked, w];
    setPicked(newPicked);
    SFX.pop();
  };

  const verifyRhyme = () => {
    const ok = picked.length === item.correct.length && picked.every(p => item.correct.includes(p));
    if (ok) { SFX.success(); setRemoved(true); setTimeout(next, 1200); }
    else { SFX.error(); setFeedback('error'); setTimeout(()=>setFeedback(null),500); }
  };

  const finished = step >= SOUND_LEVELS.length;

  return (
    <div className="paper-bg" style={{height:'100%',display:'flex',flexDirection:'column',position:'relative'}}>
      <GameHUD onBack={onBack} title="🎵 لعبة الأصوات" stars={3} total={3} progress={step/SOUND_LEVELS.length}/>
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px 30px',gap:24}}>
        {finished && <Confetti show/>}

        {!finished && (
          <>
            <div className="chip" style={{fontSize:14,background:'#fff8e6'}}>
              {item.type==='delete' && '✂️ الحذف'}
              {item.type==='replace' && '🔄 الاستبدال'}
              {item.type==='rhyme' && '🎶 القافية'}
              <span style={{color:'var(--ink-3)'}}>{step+1}/{SOUND_LEVELS.length}</span>
            </div>
            <div style={{textAlign:'center',fontSize:22,fontWeight:700}}>{item.q}</div>

            {item.type==='delete' && (
              <div className={feedback==='error'?'shake':''} style={{display:'flex',alignItems:'center',gap:14}}>
                <div style={{display:'flex',gap:6,padding:14,background:'#fff8ee',border:'3px solid var(--ink)',borderRadius:18}}>
                  {item.word.split('').map((ch,i) => (
                    <button key={i} onClick={()=>handleDelete(ch)}
                      style={{
                        width:64,height:80,fontSize:48,fontFamily:'var(--font-display)',fontWeight:900,
                        border:'2.5px solid var(--ink)',borderRadius:12,
                        background: removed && ch===item.remove ? 'var(--paper-3)' : '#fff',
                        color: removed && ch===item.remove ? 'transparent' : 'var(--ink)',
                        cursor: removed?'default':'pointer',
                        boxShadow:'2px 2px 0 var(--ink)',
                        transition:'all .3s',
                        opacity: removed && ch===item.remove ? 0.3 : 1,
                      }}>{ch}</button>
                  ))}
                </div>
                {removed && (
                  <>
                    <div style={{fontSize:30,color:'var(--ink-3)'}}>→</div>
                    <div style={{fontSize:48,fontFamily:'var(--font-display)',fontWeight:900,color:'var(--success)'}} className="pop">{item.result}</div>
                  </>
                )}
              </div>
            )}

            {item.type==='replace' && (
              <div className={feedback==='error'?'shake':''} style={{display:'flex',alignItems:'center',gap:14}}>
                <div style={{display:'flex',gap:6,padding:14,background:'#fff8ee',border:'3px solid var(--ink)',borderRadius:18}}>
                  {item.word.split('').map((ch,i) => (
                    <button key={i} onClick={()=>handleReplace(ch)}
                      style={{
                        width:64,height:80,fontSize:48,fontFamily:'var(--font-display)',fontWeight:900,
                        border:'2.5px solid var(--ink)',borderRadius:12,
                        background: removed && ch===item.from ? 'var(--accent-coral)' : '#fff',
                        color: removed && ch===item.from ? '#fff8ee' : 'var(--ink)',
                        cursor: removed?'default':'pointer',
                        boxShadow:'2px 2px 0 var(--ink)',
                      }}>{removed && ch===item.from ? item.to : ch}</button>
                  ))}
                </div>
                {removed && (
                  <>
                    <div style={{fontSize:30,color:'var(--ink-3)'}}>→</div>
                    <div style={{fontSize:48,fontFamily:'var(--font-display)',fontWeight:900,color:'var(--success)'}} className="pop">{item.result}</div>
                  </>
                )}
              </div>
            )}

            {item.type==='rhyme' && (
              <>
                <div style={{
                  padding:'18px 30px',background:'var(--accent-coral)',color:'#fff8ee',
                  border:'3px solid var(--ink)',borderRadius:18,fontSize:48,fontWeight:900,
                  fontFamily:'var(--font-display)',boxShadow:'3px 3px 0 var(--ink)',
                }}>
                  {item.target}
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
                  {item.options.map(o => (
                    <button key={o} onClick={()=>handleRhyme(o)} className="word-pill"
                      style={{
                        fontSize:30,padding:'14px 30px',
                        background: picked.includes(o) ? 'var(--accent-yellow)' : '#fff',
                      }}>{o}</button>
                  ))}
                </div>
                <button className="btn primary" onClick={verifyRhyme} style={{fontSize:18}}>تحقّقْ ✓</button>
              </>
            )}
          </>
        )}

        {finished && (
          <div style={{textAlign:'center',display:'flex',flexDirection:'column',gap:14,alignItems:'center'}}>
            <div style={{fontSize:64}}>🎵🎉</div>
            <div style={{fontSize:24,fontWeight:800}}>أتقنتَ التلاعبَ بالأصوات!</div>
            <button className="btn success" onClick={onDone}>اللعبة الأخيرة ←</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============== Game 9: Harakat Keys ==============
const KEYS_DATA = {
  lock:'ـُ',
  lockName:'الضمّة',
  keys:[
    { letter:'بَـ', word:'بَطّة', haraka:'ـَ' },
    { letter:'بُـ', word:'بُرتقال', haraka:'ـُ', correct:true },
    { letter:'بِـ', word:'بِنت', haraka:'ـِ' },
    { letter:'بْـ', word:'حُبْـ', haraka:'ـْ' },
  ],
};

function GameKeys({ onDone, onBack }) {
  const [tried, setTried] = React.useState([]);
  const [unlocked, setUnlocked] = React.useState(false);
  const [feedback, setFeedback] = React.useState(null);

  const tryKey = (i) => {
    if (tried.includes(i)) return;
    if (KEYS_DATA.keys[i].correct) {
      SFX.unlock(); setUnlocked(true);
    } else {
      SFX.error(); setTried([...tried, i]);
      setFeedback(i); setTimeout(()=>setFeedback(null),500);
    }
  };

  return (
    <div className="paper-bg" style={{height:'100%',display:'flex',flexDirection:'column',position:'relative'}}>
      <GameHUD onBack={onBack} title="🔑 مفاتيح الحركات" stars={3} total={3} progress={unlocked?1:tried.length/4}/>
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px 30px',gap:24}}>
        {unlocked && <><Confetti show/><Stars show/></>}

        <div style={{textAlign:'center'}}>
          <div style={{fontSize:18,color:'var(--ink-3)',fontWeight:700}}>التحدّي الأخير</div>
          <div style={{fontSize:22,fontWeight:700}}>افْتَحِ البابَ بالمِفتاحِ المناسبِ للحركة 🚪</div>
        </div>

        {/* Door */}
        <div style={{
          width:240,height:340,background:'#a87648',
          border:'4px solid var(--ink)',borderRadius:'120px 120px 14px 14px',
          boxShadow:'5px 5px 0 var(--ink)',
          position:'relative',
          display:'flex',alignItems:'center',justifyContent:'center',
          transform: unlocked ? 'rotateY(-30deg)' : 'rotateY(0)',
          transformOrigin:'right center',
          transition:'transform .8s ease-out',
        }}>
          <div style={{position:'absolute',top:30,left:0,right:0,textAlign:'center',color:'#fff8ee',fontSize:14,fontWeight:700,letterSpacing:'.2em'}}>
            باب الحركات
          </div>
          {/* Lock */}
          <div style={{
            width:120,height:140,background:'#e8b04b',
            border:'4px solid var(--ink)',borderRadius:18,
            display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
            boxShadow:'3px 3px 0 var(--ink)',
            opacity: unlocked ? 0.3 : 1,
          }} className={!unlocked?'pulse-ring':''}>
            <div style={{width:56,height:36,border:'5px solid var(--ink)',borderBottom:'none',borderRadius:'30px 30px 0 0',marginBottom:-3}}/>
            <div style={{
              width:90,height:80,background:'#fff8ee',border:'3px solid var(--ink)',borderRadius:10,
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:60,fontFamily:'var(--font-display)',fontWeight:900,color:'var(--accent-coral)',
            }}>{KEYS_DATA.lock}</div>
            <div style={{fontSize:12,fontWeight:700,color:'var(--ink)',marginTop:4}}>{KEYS_DATA.lockName}</div>
          </div>
          {unlocked && (
            <div style={{position:'absolute',top:-30,right:-40,fontSize:48,animation:'pop .5s'}}>🎉</div>
          )}
        </div>

        {/* Keys */}
        <div style={{display:'flex',gap:14,flexWrap:'wrap',justifyContent:'center',maxWidth:700}}>
          {KEYS_DATA.keys.map((k,i) => {
            const isTried = tried.includes(i);
            return (
              <button key={i} onClick={()=>tryKey(i)}
                disabled={isTried || unlocked}
                className={feedback===i?'shake':''}
                style={{
                  display:'flex',flexDirection:'column',alignItems:'center',gap:4,
                  padding:'14px 18px',
                  background: isTried ? 'var(--paper-3)' : (unlocked && k.correct) ? 'var(--success)':'#fff8ee',
                  border:'3px solid var(--ink)',borderRadius:14,
                  boxShadow:'3px 3px 0 var(--ink)',
                  cursor: isTried||unlocked?'default':'pointer',
                  opacity: isTried ? 0.4 : 1,
                  transition:'all .2s',
                  position:'relative',
                }}>
                <div style={{position:'absolute',top:-12,right:'50%',transform:'translateX(50%)',
                  width:24,height:24,borderRadius:12,background:'var(--ink-3)',
                  border:'2px solid var(--ink)'}}/>
                <div style={{fontSize:36,fontFamily:'var(--font-display)',fontWeight:900,
                  color: unlocked && k.correct ? '#fff8ee' : 'var(--accent-coral)'}}>
                  {k.haraka}
                </div>
                <div style={{fontSize:18,fontWeight:800,color: unlocked && k.correct ? '#fff8ee':'var(--ink)'}}>{k.word}</div>
              </button>
            );
          })}
        </div>

        {unlocked && (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
            <div style={{fontSize:24,fontWeight:800}}>🏆 أحسنت! أنهيتَ كلَّ الألعاب!</div>
            <button className="btn success" style={{fontSize:20}} onClick={onDone}>عد إلى الصفحة الرئيسية ←</button>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { GameShadow, GameSounds, GameKeys });
