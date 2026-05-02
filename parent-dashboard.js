/* global React, DataService */
const { useState, useEffect } = React;

// ============================================
// PARENT DASHBOARD
// ============================================
function ParentDashboard({ user, children, setChildren, onSelectChild, onAddChild, onDiagnose, onLogout, useSupabase }) {
  const [childrenLoading, setChildrenLoading] = useState(false);

  useEffect(() => {
    if (useSupabase && user?.id && children.length === 0) {
      setChildrenLoading(true);
      const loadChildren = async () => {
        try {
          const dataService = typeof window.DataService === 'function' ? new window.DataService() : null;
          if (dataService) {
            const childrenData = await dataService.getChildren(user.id);
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
          }
        } catch (err) {
          typeof window.showToast === 'function' && window.showToast('تعذر تحميل بيانات الأطفال. حاول إعادة التحديث.', 'error');
        } finally {
          setChildrenLoading(false);
        }
      };
      loadChildren();
    }
  }, [useSupabase, user?.id]);
  return (
    <div className="dashboard">
      <div className="landing-nav" style={{ padding: '8px 0', marginBottom: 16 }}>
        <div className="logo">
          <div className="logo-bird">🦉</div>
          <span>كتابي التفاعلي — لوحة الأهل</span>
        </div>
        <div className="nav-actions">
          <button className="btn-secondary" onClick={onLogout}>خروج</button>
        </div>
      </div>

      <div className="welcome-card" style={{
        background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%)'
      }}>
        <div>
          <h2>أهلاً {user.name} 👋</h2>
          <p>تابع تقدم أطفالك واختبر مستواهم</p>
        </div>
        <div className="avatar">👨‍👩‍👧</div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">👶</div>
          <div>
            <div className="stat-value">{children.length}</div>
            <div className="stat-label">طفل مسجّل</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div>
            <div className="stat-value">{children.reduce((a, c) => a + (c.progress?.stars || 0), 0)}</div>
            <div className="stat-label">إجمالي النجوم</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div>
            <div className="stat-value">{children.reduce((a, c) => a + Object.values(c.progress?.texts || {}).filter(t => t === 'done').length, 0)}</div>
            <div className="stat-label">نصوص مكتملة</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🧠</div>
          <div>
            <div className="stat-value">{children.filter(c => c.progress?.diagnostic).length}</div>
            <div className="stat-label">طفل مُشخّص</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
        <button className="btn-primary" onClick={onAddChild} style={{ padding: '20px', justifyContent: 'center' }}>
          ➕ إضافة طفل
        </button>
        <button className="btn-secondary" onClick={onDiagnose} style={{ padding: '20px', justifyContent: 'center', fontSize: 16 }}>
          🧠 اختبار تشخيص للطفل
        </button>
      </div>

      <div className="library-section">
        <div className="section-head">
          <h2>👨‍👩‍👧 أطفالي</h2>
        </div>
        <div className="parent-children-grid">
          {childrenLoading
            ? Array.from({ length: 2 }).map((_, i) => <ChildCardSkeleton key={i} />)
            : children.map(c => {
            const completedTexts = Object.values(c.progress?.texts || {}).filter(t => t === 'done').length;
            const stars = c.progress?.stars || 0;
            return (
              <div key={c.id} className="child-card" onClick={() => onSelectChild(c)}>
                <div className="child-head">
                  <div className="child-avatar">{c.avatar || '🧒'}</div>
                  <div>
                    <div className="child-name">{c.name}</div>
                    <div className="child-age">{c.age} سنوات</div>
                  </div>
                </div>
                <div className="child-stat-row">
                  <div className="child-stat">
                    <div className="v">{stars}</div>
                    <div className="l">⭐ نجوم</div>
                  </div>
                  <div className="child-stat">
                    <div className="v">{completedTexts}</div>
                    <div className="l">📖 نص</div>
                  </div>
                </div>
                <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: 14 }}>
                  عرض التقرير ←
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// CHILD DETAILED REPORT (for parent)
// ============================================
function ChildReport({ child, onBack, onDiagnose }) {
  const completedTexts = Object.values(child.progress?.texts || {}).filter(t => t === 'done').length;
  const totalTexts = (window.LIBRARY || []).reduce((a, b) => a + b.texts.length, 0);
  const pct = totalTexts > 0 ? Math.round((completedTexts / totalTexts) * 100) : 0;

  // Skill breakdown (mock data)
  const skills = [
    { label: 'تجزئة الجملة', val: child.progress?.skills?.segment || 70 },
    { label: 'التمييز الصوتي (ز/س)', val: child.progress?.skills?.sound || 55 },
    { label: 'مواقع الحروف', val: child.progress?.skills?.position || 80 },
    { label: 'تركيب الحروف', val: child.progress?.skills?.assembly || 65 },
    { label: 'القافية والتلاعب', val: child.progress?.skills?.rhyme || 40 },
    { label: 'الحركات', val: child.progress?.skills?.vowels || 60 },
  ];

  return (
    <div className="dashboard">
      <div style={{ marginBottom: 16 }}>
        <button className="btn-secondary" onClick={onBack}>← رجوع للوحة</button>
      </div>

      <div className="welcome-card">
        <div>
          <h2>{child.avatar || '🧒'} تقرير {child.name}</h2>
          <p>{child.age} سنوات • انضم منذ {child.daysActive || 12} يوم</p>
        </div>
        <div className="avatar">{child.avatar || '🧒'}</div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div>
            <div className="stat-value">{child.progress?.stars || 0}</div>
            <div className="stat-label">نجمة</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div>
            <div className="stat-value">{completedTexts}/{totalTexts}</div>
            <div className="stat-label">نص مكتمل</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎮</div>
          <div>
            <div className="stat-value">{child.progress?.gamesPlayed || 0}</div>
            <div className="stat-label">لعبة</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div>
            <div className="stat-value">{child.progress?.minutesSpent || 145}</div>
            <div className="stat-label">دقيقة تعلّم</div>
          </div>
        </div>
      </div>

      <div className="report-section">
        <h3>📊 التقدم الكلي</h3>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: pct + '%' }}>{pct}%</div>
        </div>
      </div>

      <div className="report-section">
        <h3>🎯 المهارات حسب اللعبة</h3>
        {skills.map((s, i) => (
          <div key={i} className={'skill-bar' + (i % 4 === 1 ? ' green' : i % 4 === 2 ? ' coral' : i % 4 === 3 ? ' purple' : '')}>
            <div className="skill-label"><span>{s.label}</span><span>{s.val}%</span></div>
            <div className="skill-track"><div className="skill-fill" style={{ width: s.val + '%' }}></div></div>
          </div>
        ))}
      </div>

      <div className="report-section">
        <h3>🧠 نتيجة التشخيص</h3>
        {child.progress?.diagnostic ? (
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-blue)' }}>
              {child.progress.diagnostic.pct}%
            </div>
            <div style={{ color: 'var(--ink-soft)' }}>آخر تشخيص — {child.progress.diagnostic.date || 'منذ أسبوع'}</div>
            <button className="btn-secondary" style={{ marginTop: 12 }} onClick={onDiagnose}>إعادة الاختبار</button>
          </div>
        ) : (
          <div>
            <p style={{ color: 'var(--ink-soft)', marginBottom: 12 }}>لم يتم إجراء تشخيص بعد لهذا الطفل.</p>
            <button className="btn-primary" onClick={onDiagnose}>بدء اختبار التشخيص 🧠</button>
          </div>
        )}
      </div>
    </div>
  );
}

window.ParentDashboard = ParentDashboard;
window.ChildReport = ChildReport;
