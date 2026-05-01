// Tweaks panel for Anes' portfolio — palette, hero variant, motion, density, etc.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "heroVariant": 1,
  "accent": "amber",
  "fontPair": "serif+mono",
  "grain": true,
  "soundOn": false,
  "cursorStyle": "dot+ring",
  "scrollSnap": true,
  "density": "regular",
  "name": "Anes Hamouti",
  "role": "co-founder of fikratech",
  "tagline": "builds software that thinks."
}/*EDITMODE-END*/;

const ACCENTS = {
  amber:   { amber: 'oklch(0.82 0.16 70)',  coral: 'oklch(0.70 0.18 32)'  },
  coral:   { amber: 'oklch(0.74 0.19 30)',  coral: 'oklch(0.62 0.20 18)'  },
  lime:    { amber: 'oklch(0.85 0.18 130)', coral: 'oklch(0.72 0.20 145)' },
  cyan:    { amber: 'oklch(0.82 0.14 200)', coral: 'oklch(0.70 0.16 230)' },
  magenta: { amber: 'oklch(0.78 0.18 340)', coral: 'oklch(0.66 0.20 0)'   },
};

const FONT_PAIRS = {
  'serif+mono':   { serif: '"Instrument Serif", serif', sans: '"Inter", sans-serif',     mono: '"JetBrains Mono", monospace' },
  'sans-only':    { serif: '"Inter", sans-serif',       sans: '"Inter", sans-serif',     mono: '"JetBrains Mono", monospace' },
  'mono-only':    { serif: '"JetBrains Mono", monospace', sans: '"JetBrains Mono", monospace', mono: '"JetBrains Mono", monospace' },
};

const DENSITIES = {
  compact:  { pad: '64px',  fs: 15 },
  regular:  { pad: '88px',  fs: 16 },
  comfy:    { pad: '120px', fs: 17 },
};

function PortfolioTweaks(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply tweaks to the document
  React.useEffect(() => {
    const root = document.documentElement;
    const a = ACCENTS[t.accent] || ACCENTS.amber;
    root.style.setProperty('--amber', a.amber);
    root.style.setProperty('--coral', a.coral);

    const f = FONT_PAIRS[t.fontPair] || FONT_PAIRS['serif+mono'];
    root.style.setProperty('--serif', f.serif);
    root.style.setProperty('--sans',  f.sans);
    root.style.setProperty('--mono',  f.mono);

    root.style.setProperty('--grain-on', t.grain ? 1 : 0);

    const d = DENSITIES[t.density] || DENSITIES.regular;
    document.body.style.fontSize = d.fs + 'px';
    document.querySelectorAll('section').forEach(s => {
      s.style.paddingTop = d.pad;
      s.style.paddingBottom = d.pad;
    });

    const hero = document.getElementById('hero');
    if(hero) hero.setAttribute('data-hv', String(t.heroVariant));

    const main = document.getElementById('main');
    if(main) main.style.scrollSnapType = t.scrollSnap ? 'y proximity' : 'none';

    document.body.classList.toggle('cursor-off', t.cursorStyle === 'system');
    if(t.cursorStyle === 'system'){
      document.body.style.cursor = 'auto';
      const cP = document.getElementById('cursorP');
      const cD = document.getElementById('cursorD');
      if(cP) cP.style.display = 'none';
      if(cD) cD.style.display = 'none';
    } else {
      document.body.style.cursor = 'none';
      const cP = document.getElementById('cursorP');
      const cD = document.getElementById('cursorD');
      if(cP) cP.style.display = '';
      if(cD) cD.style.display = '';
    }
  }, [t]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Hero" />
      <TweakRadio label="Layout" value={String(t.heroVariant)}
                  options={['1','2','3']}
                  onChange={(v) => setTweak('heroVariant', Number(v))} />
      <TweakText  label="Name"    value={t.name}    onChange={(v) => setTweak('name', v)} />
      <TweakText  label="Role"    value={t.role}    onChange={(v) => setTweak('role', v)} />
      <TweakText  label="Tagline" value={t.tagline} onChange={(v) => setTweak('tagline', v)} />

      <TweakSection label="Aesthetic" />
      <TweakSelect label="Accent" value={t.accent}
                   options={['amber','coral','lime','cyan','magenta']}
                   onChange={(v) => setTweak('accent', v)} />
      <TweakSelect label="Type pair" value={t.fontPair}
                   options={['serif+mono','sans-only','mono-only']}
                   onChange={(v) => setTweak('fontPair', v)} />
      <TweakRadio  label="Density"   value={t.density}
                   options={['compact','regular','comfy']}
                   onChange={(v) => setTweak('density', v)} />
      <TweakToggle label="Film grain"   value={t.grain}      onChange={(v) => setTweak('grain', v)} />
      <TweakToggle label="Scroll snap"  value={t.scrollSnap} onChange={(v) => setTweak('scrollSnap', v)} />

      <TweakSection label="Interaction" />
      <TweakRadio label="Cursor" value={t.cursorStyle}
                  options={['dot+ring','system']}
                  onChange={(v) => setTweak('cursorStyle', v)} />
    </TweaksPanel>
  );
}

// React effect to apply tweaks even when name/role/tagline change to actual DOM
function NameSync(){
  const [t] = useTweaks(TWEAK_DEFAULTS);
  React.useEffect(() => {
    const h1 = document.querySelector('.hero-h1');
    if(h1 && t.name){
      const parts = t.name.trim().split(/\s+/);
      const first = parts.shift() || '';
      const last  = parts.join(' ');
      h1.innerHTML = `${first} <span class="it">${last}</span><br/>builds <span class="underline">software</span><br/>that <span class="it">thinks.</span>`;
    }
    const tag = document.querySelector('.hero-tag');
    if(tag && t.tagline){
      tag.innerHTML = `Co-founder of <b>Fikratech</b>. ${t.tagline} I work across the stack — from <b>real-time web</b> and <b>mobile</b> apps to <b>ML pipelines</b>, <b>3D / graphics</b>, and the occasional <b>security</b> rabbit hole.`;
    }
    const brand = document.querySelector('.brand span:last-child');
    if(brand && t.name){
      brand.innerHTML = `${t.name.toUpperCase()} <span style="color:var(--ink-3)">/ FIKRATECH</span>`;
    }
  }, [t.name, t.tagline, t.role]);
  return null;
}

// Mount Tweaks
const __twkRoot = document.createElement('div');
document.body.appendChild(__twkRoot);
ReactDOM.createRoot(__twkRoot).render(
  <>
    <PortfolioTweaks />
    <NameSync />
  </>
);
