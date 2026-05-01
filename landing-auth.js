/* global React, AuthService */
const { useState, useEffect } = React;

// ============================================
// LANDING PAGE
// ============================================
function Landing({ onGetStarted, onLogin }) {
  return (
    <div className="landing">
      <div className="landing-nav">
        <div className="logo">
          <div className="logo-bird">🦉</div>
          <span>كتابي التفاعلي</span>
        </div>
        <div className="nav-actions">
          <button className="btn-secondary" onClick={onLogin}>تسجيل الدخول</button>
          <button className="btn-primary" onClick={onGetStarted}>ابدأ مجاناً</button>
        </div>
      </div>

      <div className="hero">
        <div>
          <h1>تعلّم القراءة بطريقة <span className="highlight">ممتعة</span> ومناسبة لك 🦉</h1>
          <p>منصة تعليمية تفاعلية مصممة خصيصاً للأطفال المعسرين قرائياً (عُسر القراءة). ألعاب، قصص، وتمارين تساعد طفلك على القراءة بثقة.</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={onGetStarted}>ابدأ الآن مجاناً 🚀</button>
            <button className="btn-secondary" onClick={onLogin}>عندي حساب →</button>
          </div>
        </div>
        <div className="hero-illustration">
          <span className="big-emoji">📚</span>
          <div className="float-card top">
            <div className="ico">⭐</div>
            <span>15 نجمة!</span>
          </div>
          <div className="float-card bottom">
            <div className="ico">🎮</div>
            <span>9 ألعاب تفاعلية</span>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>لماذا كتابي التفاعلي؟</h2>
        <p className="sub">ميزات صُمّمت بعناية لمساعدة الأطفال المعسرين قرائياً</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="icon">🔊</div>
            <h3>تتبع صوتي للكلمات</h3>
            <p>كل كلمة تُضاء عند نطقها لربط الصوت بالشكل البصري.</p>
          </div>
          <div className="feature-card">
            <div className="icon">🎮</div>
            <h3>9 ألعاب تفاعلية</h3>
            <p>ألعاب علاجية لتقوية مهارات التقطيع، التمييز الصوتي، والتركيب.</p>
          </div>
          <div className="feature-card">
            <div className="icon">📊</div>
            <h3>متابعة التقدم</h3>
            <p>للأهل لوحة تحكم لمتابعة تقدم أطفالهم بالتفصيل.</p>
          </div>
          <div className="feature-card">
            <div className="icon">🧠</div>
            <h3>اختبار التشخيص</h3>
            <p>اختبارات لقياس عسر القراءة ومستوى الذكاء البصري.</p>
          </div>
          <div className="feature-card">
            <div className="icon">📖</div>
            <h3>مكتبة قصص</h3>
            <p>قصص متنوعة بمستويات مختلفة، تُفتح الألعاب بعد كل قصة.</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>ساعد طفلك على القراءة بثقة</h2>
        <p>ابدأ الآن — مجاناً تماماً</p>
        <button className="btn-primary" onClick={onGetStarted}>إنشاء حساب →</button>
      </div>
    </div>
  );
}

// ============================================
// AUTH (Login + Signup with role)
// ============================================
function Auth({ mode, onAuth, onSwitchMode, onBack }) {
  const [role, setRole] = useState('child');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      const auth = new window.AuthService?.();
      
      if (!auth) {
        throw new Error('Authentication service not available');
      }

      let userData;
      if (mode === 'signup') {
        // Create new account
        userData = await auth.signup(email, pw, name || (role === 'child' ? 'بطل صغير' : 'وليّ أمر'), role);
      } else {
        // Login to existing account
        userData = await auth.login(email, pw);
      }

      if (userData) {
        onAuth({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
        });
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'خطأ في التحقق. يرجى المحاولة مجدداً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card pop-in">
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 48 }}>🦉</span>
        </div>
        <h2>{mode === 'signup' ? 'إنشاء حساب جديد' : 'مرحباً بعودتك'}</h2>
        <p className="auth-sub">
          {mode === 'signup' ? 'انضم إلى رحلة تعلم القراءة' : 'سجّل دخولك لمتابعة التقدم'}
        </p>

        {error && (
          <div style={{
            padding: 12,
            background: 'var(--accent-coral-soft)',
            color: 'var(--accent-coral)',
            borderRadius: 8,
            marginBottom: 12,
            fontSize: 13,
          }}>
            {error}
          </div>
        )}

        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>أنا...</div>
        <div className="role-picker">
          <div className={'role-option' + (role === 'child' ? ' active' : '')} onClick={() => setRole('child')} style={{ pointerEvents: loading ? 'none' : 'auto' }}>
            <div className="role-icon">🧒</div>
            <div className="role-label">طفل</div>
            <div className="role-desc">أريد التعلم واللعب</div>
          </div>
          <div className={'role-option' + (role === 'parent' ? ' active' : '')} onClick={() => setRole('parent')} style={{ pointerEvents: loading ? 'none' : 'auto' }}>
            <div className="role-icon">👨‍👩‍👧</div>
            <div className="role-label">وليّ أمر</div>
            <div className="role-desc">أتابع تقدم أطفالي</div>
          </div>
        </div>

        {mode === 'signup' && (
          <div className="form-field">
            <label>الاسم</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={role === 'child' ? 'مثال: أحمد' : 'مثال: سارة'}
              disabled={loading}
            />
          </div>
        )}
        <div className="form-field">
          <label>البريد الإلكتروني</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="example@email.com"
            disabled={loading}
          />
        </div>
        <div className="form-field">
          <label>كلمة المرور</label>
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
          />
        </div>

        <button
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', marginTop: 8, opacity: loading ? 0.6 : 1 }}
          onClick={submit}
          disabled={loading}
        >
          {loading ? '⏳ جاري المعالجة...' : (mode === 'signup' ? 'إنشاء الحساب' : 'دخول')}
        </button>

        <div className="auth-toggle">
          {mode === 'signup' ? 'لديك حساب؟' : 'ليس لديك حساب؟'}
          <a onClick={() => !loading && onSwitchMode()} style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
            {' '}{mode === 'signup' ? 'سجّل الدخول' : 'أنشئ حساب جديد'}
          </a>
        </div>
        <div className="auth-toggle">
          <a onClick={() => !loading && onBack()} style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
            ← رجوع للصفحة الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}

window.Landing = Landing;
window.Auth = Auth;
