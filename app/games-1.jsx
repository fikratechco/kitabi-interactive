// games-1.jsx — Train + Drum + Bee/Snake

// LESSON DATA reused
const SENT = 'زارَ زيدٌ حديقَةَ الحيواناتِ';
const SENT_WORDS = ['زارَ','زيدٌ','حديقَةَ','الحيواناتِ'];

// ============== Game 1: Train ==============
function GameTrain({ onDone, onBack, speed=1 }) {
  const [split, setSplit] = React.useState([0,1,2,3].map(() => false));
  const [answer, setAnswer] = React.useState('');
  const [phase, setPhase] = React.useState('split'); // split → count → done
  const [feedback, setFeedback] = React.useState(null);
  const [readIdx, setReadIdx] = React.useState(-1);

  const allSplit = split.every(Boolean);

  const splitCar = (i) => {
    if (split[i]) return;
    SFX.pop();
    const next = [...split]; next[i] = true; setSplit(next);
  };

  const checkCount = () => {
    const n = parseInt(answer);
    if (n === SENT_WORDS.length) {
      SFX.success();
      setFeedback('success');
      // Sequence: each word + clap
      let i = 0;
      const tick = () => {
        if (i >= SENT_WORDS.length) { setTimeout(() => { setPhase('done'); SFX.clap(); }, 400); return; }
        setReadIdx(i); SFX.pop();
        setTimeout(() => SFX.clap(), 220);
        i++;
        setTimeout(tick, 700/speed);
      };
      tick();
    } else {
      SFX.error();
      setFeedback('error');
      setTimeout(() => setFeedback(null), 600);
    }
  };

  return (
    <div className="paper-bg" style={{height:'100%',display:'flex',flexDirection:'column',position:'relative'}}>
      <GameHUD onBack={onBack} title="🚂 قطار الجملة" stars={1} total={3} progress={phase==='done'?1:phase==='count'?0.66:0.33}/>

      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px 30px',gap:24,position:'relative'}}>
        {feedback==='success' && <Confetti show/>}

        <div style={{textAlign:'center',maxWidth:600}}>
          <div style={{fontSize:18,color:'var(--ink-3)',fontWeight:700,marginBottom:4}}>التعليمات</div>
          <div style={{fontSize:22,fontWeight:700,color:'var(--ink)'}}>
            {phase==='split' && 'اضغطْ على كُلِّ عَرَبَةٍ لِيَنفَصِلَ القِطار 🚂'}
            {phase==='count' && 'كَمْ كَلِمَةً في الجُمْلَة؟ ✏️'}
            {phase==='done' && 'أَحْسَنْتَ! 🎉'}
          </div>
        </div>

        {/* TRAIN */}
        <div style={{display:'flex',alignItems:'flex-end',gap:0,minHeight:160,direction:'rtl'}}>
          {/* Engine */}
          <div style={{
            width:90, height:110, background:'#c45a4d', border:'3px solid var(--ink)',
            borderRadius:'14px 26px 8px 8px', position:'relative',
            display:'flex',alignItems:'center',justifyContent:'center',
            color:'#fff8ee',fontSize:14,fontWeight:800,boxShadow:'3px 3px 0 var(--ink)',
            marginLeft: split[0]?16:-2, transition:'margin .3s',
          }}>
            <div style={{position:'absolute',top:-22,left:14,width:24,height:30,background:'#3a2c1a',
              border:'2px solid var(--ink)',borderRadius:'4px 4px 0 0'}}/>
            <div style={{position:'absolute',top:-32,left:18,width:16,height:8,background:'#fff',borderRadius:'50%',opacity:.6}}/>
            🚂
          </div>
          {SENT_WORDS.map((w,i) => (
            <div key={i} onClick={() => splitCar(i)} className={readIdx===i?'pop':''} style={{
              width: 130, height:90,
              background: readIdx===i ? 'var(--accent-yellow)' : ['#e8b04b','#7ba05b','#6ea8c9','#b07a9c'][i],
              border:'3px solid var(--ink)', borderRadius:12,
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:26,fontWeight:800,color:'var(--ink)',
              boxShadow:'3px 3px 0 var(--ink)',
              marginLeft: split[i]?14:-2,
              transition:'margin .35s cubic-bezier(.3,.7,.3,1.3), transform .15s',
              cursor: split[i]?'default':'pointer',
              position:'relative',
              transform: split[i]?'translateY(0)':'translateY(0)',
            }}>
              {w}
              <div style={{position:'absolute',bottom:-14,left:14,width:18,height:18,background:'#3a2c1a',borderRadius:'50%',border:'2px solid var(--ink)'}}/>
              <div style={{position:'absolute',bottom:-14,right:14,width:18,height:18,background:'#3a2c1a',borderRadius:'50%',border:'2px solid var(--ink)'}}/>
              {!split[i] && (
                <div style={{position:'absolute',top:-26,left:'50%',transform:'translateX(-50%)',
                  fontSize:11,padding:'3px 8px',background:'#fff',border:'1.5px solid var(--ink)',borderRadius:8,fontWeight:700,whiteSpace:'nowrap'}}>
                  اضغط ↓
                </div>
              )}
            </div>
          ))}
        </div>

        {/* tracks */}
        <div style={{width:'min(720px,90%)',height:14,background:'repeating-linear-gradient(90deg,#3a2c1a 0 14px,transparent 14px 24px)',
          borderTop:'3px solid var(--ink)',borderBottom:'3px solid var(--ink)',marginTop:-30}}/>

        {/* phase 2: count input */}
        {allSplit && phase==='split' && (
          <button className="btn primary" style={{fontSize:18}} onClick={() => { setPhase('count'); SFX.pop(); }}>
            انتقل إلى السؤال ←
          </button>
        )}

        {phase==='count' && (
          <div className={feedback==='error'?'shake':''} style={{display:'flex',alignItems:'center',gap:14,marginTop:10}}>
            <input value={answer} onChange={e=>setAnswer(e.target.value.replace(/\D/g,''))}
              maxLength={2} placeholder="؟"
              style={{width:90,height:90,fontSize:48,fontWeight:900,textAlign:'center',
                border:'3px solid var(--ink)',borderRadius:18,background:'#fff8ee',
                fontFamily:'var(--font-display)',color:'var(--ink)',outline:'none'}}/>
            <button className="btn primary" style={{fontSize:20,padding:'16px 26px'}} onClick={checkCount}>
              تَحَقَّقْ ✓
            </button>
          </div>
        )}

        {phase==='done' && (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:14,marginTop:10}}>
            <div style={{fontSize:54}}>🎉</div>
            <div style={{fontSize:24,fontWeight:800}}>عددُ الكلماتِ: ٤</div>
            <button className="btn success" style={{fontSize:20}} onClick={onDone}>
              اللعبة التالية ←
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============== Game 2: Drum + Letter Extraction ==============
const SYLLABLES = { 'زارَ': ['زا','رَ'], 'زيدٌ':['زيـ','ـدٌ'], 'حديقَةَ':['حَ','دي','قَـ','ـةَ'], 'الحيواناتِ':['الـ','حيـ','وا','ناتِ'] };

function GameDrum({ onDone, onBack }) {
  const [phase, setPhase] = React.useState('extract'); // extract → drum → done
  const [target, setTarget] = React.useState('ز');
  const [picked, setPicked] = React.useState(null);
  const [hits, setHits] = React.useState(0);
  const [feedback, setFeedback] = React.useState(null);
  const [done1, setDone1] = React.useState(false);

  const correct = SENT_WORDS.find(w => stripTashkeel(w).includes(target));
  const expectedHits = picked ? (SYLLABLES[picked] || ['']).length : 0;

  const pickWord = (w) => {
    if (stripTashkeel(w).includes(target)) {
      SFX.success(); setPicked(w);
      setTimeout(() => setPhase('drum'), 600);
    } else {
      SFX.error(); setFeedback('error'); setTimeout(()=>setFeedback(null),500);
    }
  };

  const hitDrum = () => {
    SFX.drum();
    const n = hits + 1;
    setHits(n);
    if (n === expectedHits) {
      setTimeout(() => {
        SFX.clap();
        if (!done1) {
          setDone1(true); setTarget('ح'); setPicked(null); setHits(0); setPhase('extract');
        } else {
          setPhase('done');
        }
      }, 500);
    }
  };

  return (
    <div className="paper-bg" style={{height:'100%',display:'flex',flexDirection:'column',position:'relative'}}>
      <GameHUD onBack={onBack} title="🥁 طبل المقاطع" stars={2} total={3} progress={done1?0.85:0.5}/>

      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px 30px',gap:22}}>
        {phase==='done' && <Confetti show/>}

        {phase==='extract' && (
          <>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:18,color:'var(--ink-3)',fontWeight:700,marginBottom:4}}>التعليمات</div>
              <div style={{fontSize:22,fontWeight:700}}>
                اِسْتَخْرِجِ الكَلِمَةَ التي تحتوي على حرف{' '}
                <span style={{
                  display:'inline-flex',alignItems:'center',justifyContent:'center',
                  width:54,height:54,background:'var(--accent-coral)',color:'#fff8ee',
                  borderRadius:14,border:'2.5px solid var(--ink)',fontSize:38,fontWeight:900,
                  fontFamily:'var(--font-display)',verticalAlign:'middle',
                }}>{target}</span>
              </div>
            </div>
            <div className={feedback==='error'?'shake':''} style={{display:'flex',gap:10,flexWrap:'wrap',justifyContent:'center',maxWidth:700}}>
              {SENT_WORDS.map(w => (
                <button key={w} onClick={() => pickWord(w)} className="word-pill" style={{fontSize:28,padding:'14px 24px'}}>
                  {w}
                </button>
              ))}
            </div>
          </>
        )}

        {phase==='drum' && (
          <>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:22,fontWeight:700,marginBottom:8}}>قَطِّعِ الكلمةَ بعَدَدِ المَقاطِع 🥁</div>
              <div style={{fontSize:36,fontWeight:900,fontFamily:'var(--font-display)'}}>{picked}</div>
            </div>
            {/* drum */}
            <div onClick={hitDrum} style={{
              width:200,height:200,borderRadius:'50%',
              background:'radial-gradient(circle at 35% 30%,#e8b04b,#c45a4d 80%)',
              border:'4px solid var(--ink)',boxShadow:'5px 5px 0 var(--ink)',
              cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:80, transform: hits>0?'scale(1.05)':'scale(1)', transition:'transform .12s',
            }} className={feedback==='hit'?'pop':''}>
              🥁
            </div>
            <div style={{display:'flex',gap:10}}>
              {(SYLLABLES[picked]||[]).map((s,i) => (
                <div key={i} style={{
                  padding:'10px 18px',
                  background: i<hits ? 'var(--accent-green)':'#fff',
                  color: i<hits?'#fff8ee':'var(--ink)',
                  border:'2.5px solid var(--ink)', borderRadius:12, fontSize:24, fontWeight:800,
                  fontFamily:'var(--font-display)',
                  boxShadow:'2px 2px 0 var(--ink)',
                }}>
                  {s}
                </div>
              ))}
            </div>
            <div style={{color:'var(--ink-3)',fontWeight:700}}>اضْرِبْ {hits}/{expectedHits}</div>
          </>
        )}

        {phase==='done' && (
          <div style={{textAlign:'center',display:'flex',flexDirection:'column',gap:14,alignItems:'center'}}>
            <div style={{fontSize:64}}>🥁🎉</div>
            <div style={{fontSize:24,fontWeight:800}}>رائع! استخرجتَ الحرفَيْن وقطّعتَ الكلمات</div>
            <button className="btn success" style={{fontSize:20}} onClick={onDone}>اللعبة التالية ←</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============== Game 3: Bee vs Snake (drag + drop) ==============
const BS_WORDS = [
  { w:'زهرة', letter:'ز' },
  { w:'سمكة', letter:'س' },
  { w:'زرافة', letter:'ز' },
  { w:'سحاب', letter:'س' },
  { w:'موزة', letter:'ز' },
  { w:'شمس', letter:'س' },
];

function GameBeeSnake({ onDone, onBack }) {
  const [placed, setPlaced] = React.useState({}); // word -> 'ز' or 'س'
  const [dragOver, setDragOver] = React.useState(null);
  const [feedback, setFeedback] = React.useState(null);
  const allDone = BS_WORDS.every(w => placed[w.w]);

  const onDragStart = (e, word) => { e.dataTransfer.setData('text', word); };
  const onDrop = (e, target) => {
    e.preventDefault();
    setDragOver(null);
    const word = e.dataTransfer.getData('text');
    const item = BS_WORDS.find(x => x.w === word);
    if (!item) return;
    if (item.letter === target) {
      SFX.success();
      setPlaced(p => ({...p, [word]: target}));
      if (target==='ز') SFX.bee(); else SFX.snake();
    } else {
      SFX.error();
      setFeedback(word);
      setTimeout(()=>setFeedback(null),500);
    }
  };

  return (
    <div className="paper-bg" style={{height:'100%',display:'flex',flexDirection:'column',position:'relative'}}>
      <GameHUD onBack={onBack} title="🐝 نحلة و 🐍 ثعبان" stars={2} total={3} progress={Object.keys(placed).length / BS_WORDS.length}/>

      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',padding:'20px 30px',gap:18}}>
        {allDone && <Confetti show/>}

        <div style={{textAlign:'center'}}>
          <div style={{fontSize:18,color:'var(--ink-3)',fontWeight:700}}>التعليمات</div>
          <div style={{fontSize:22,fontWeight:700}}>اسْحَبِ الكَلِمَةَ إلى الصُّندوقِ المُناسِب</div>
          <div style={{fontSize:16,color:'var(--ink-2)',marginTop:4}}>
            🐝 ززز للنحلة · 🐍 سسس للثعبان
          </div>
        </div>

        {/* Drop boxes */}
        <div style={{display:'flex',gap:30,width:'100%',maxWidth:780,justifyContent:'center'}}>
          {[
            {key:'ز', color:'#e8b04b', mascot:'bee', sound:'ززززز'},
            {key:'س', color:'#7ba05b', mascot:'snake', sound:'سسسسس'},
          ].map(box => (
            <div key={box.key}
              onDragOver={e=>{e.preventDefault(); setDragOver(box.key);}}
              onDragLeave={()=>setDragOver(null)}
              onDrop={e=>onDrop(e,box.key)}
              style={{
                flex:1, minHeight:240, padding:18,
                background: dragOver===box.key ? '#fff8e6' : 'rgba(255,248,238,0.6)',
                border: `3px ${dragOver===box.key?'solid':'dashed'} var(--ink)`,
                borderRadius:22, position:'relative',
                display:'flex',flexDirection:'column',alignItems:'center',gap:10,
                transition:'background .15s',
              }}>
              <div style={{position:'absolute',top:-30,left:'50%',transform:'translateX(-50%)'}}>
                {box.mascot==='bee'?<MascotBee size={70}/>:<MascotSnake size={70}/>}
              </div>
              <div style={{marginTop:36,display:'flex',alignItems:'center',gap:10}}>
                <div style={{
                  width:60,height:60,borderRadius:14,background:box.color,
                  border:'2.5px solid var(--ink)',display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:42,fontWeight:900,color:'#fff8ee',fontFamily:'var(--font-display)',
                  boxShadow:'2px 2px 0 var(--ink)',
                }}>{box.key}</div>
                <div style={{fontSize:22,fontWeight:800,color:'var(--ink-2)',fontFamily:'monospace'}}>{box.sound}</div>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center',marginTop:8}}>
                {BS_WORDS.filter(w => placed[w.w]===box.key).map(w => (
                  <div key={w.w} className="word-pill pop" style={{cursor:'default',background:'#e8f5d8'}}>{w.w}</div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* draggable words */}
        <div style={{flex:1,display:'flex',alignItems:'flex-end',width:'100%',maxWidth:780}}>
          <div style={{
            width:'100%',padding:'14px 18px',background:'#fbf6e9',
            border:'2.5px solid var(--ink)',borderRadius:18,boxShadow:'3px 3px 0 var(--ink)',
            display:'flex',gap:10,flexWrap:'wrap',justifyContent:'center',
          }}>
            {BS_WORDS.filter(w => !placed[w.w]).map(w => (
              <div key={w.w} draggable onDragStart={e=>onDragStart(e,w.w)}
                className={feedback===w.w?'shake word-pill':'word-pill'}
                style={{cursor:'grab',fontSize:24}}>
                {w.w}
              </div>
            ))}
            {BS_WORDS.filter(w => !placed[w.w]).length===0 && (
              <button className="btn success" style={{fontSize:18}} onClick={onDone}>
                اللعبة التالية ←
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { GameTrain, GameDrum, GameBeeSnake });
