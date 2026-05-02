/* global React */
const { useState, useEffect } = React;

// ============================================
// SKELETON / SHIMMER HELPERS
// ============================================
(function injectSkeletonStyle() {
  if (document.getElementById('kitabi-skeleton-style')) return;
  const s = document.createElement('style');
  s.id = 'kitabi-skeleton-style';
  s.textContent = `
    @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
    .skel { background:linear-gradient(90deg,#e8e8e8 25%,#f5f5f5 50%,#e8e8e8 75%);background-size:800px 100%;animation:shimmer 1.4s infinite linear;border-radius:8px; }
  `;
  document.head.appendChild(s);
})();

function BookCardSkeleton() {
  return (
    <div className="book-card" style={{ pointerEvents: 'none' }}>
      <div className="book-cover">
        <div className="skel" style={{ width: 80, height: 80, borderRadius: '50%' }} />
      </div>
      <div className="book-info" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="skel" style={{ height: 18, width: '70%' }} />
        <div className="skel" style={{ height: 13, width: '50%' }} />
        <div className="skel" style={{ height: 6, width: '100%', borderRadius: 4 }} />
      </div>
    </div>
  );
}

function ChildCardSkeleton() {
  return (
    <div className="child-card" style={{ pointerEvents: 'none' }}>
      <div className="child-head" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <div className="skel" style={{ width: 48, height: 48, borderRadius: '50%' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="skel" style={{ height: 16, width: '60%' }} />
          <div className="skel" style={{ height: 12, width: '40%' }} />
        </div>
      </div>
      <div className="skel" style={{ height: 36, width: '100%', borderRadius: 8 }} />
    </div>
  );
}

// LIBRARY is loaded from library-data.js (window.LIBRARY) — used as fallback only
const STATIC_LIBRARY = window.LIBRARY || [];

function getTextContextIcon(text, book) {
  if (text?.icon) return text.icon;
  const scope = [text?.title, text?.desc, ...(text?.tags || []), ...(text?.body || [])].join(' ');
  if (/مدرسة|قسم|تلميذ|جرس|نشيد/.test(scope)) return '🏫';
  if (/عائل|أم|أب|أخت|جدة|بيت|زفاف/.test(scope)) return '👨‍👩‍👧‍👦';
  if (/ريف|قرية|قمح|سنابل|مزرعة|نخيل/.test(scope)) return '🌾';
  if (/رياضة|كرة|مباراة|فريق|ملعب/.test(scope)) return '⚽';
  if (/بيئة|ماء|واحة|نظافة|شارع/.test(scope)) return '🌱';
  if (/صحة|غذاء|فطور|طبيب|أسنان|حليب/.test(scope)) return '🍎';
  if (/اتصال|أنترنت|حاسوب|هاتف|تلفاز|بريد/.test(scope)) return '📡';
  if (/تراث|متحف|الأمازيغي|زربية|مناسبات/.test(scope)) return '🏛️';
  return text?.emoji || book?.emoji || '📘';
}

// ============================================
// CHILD DASHBOARD
// ============================================
function ChildDashboard({ user, progress, library, onOpenBook, onDiagnose, onIQ, onLogout, libraryLoading = false }) {
  const LIB = library || STATIC_LIBRARY;
  const totalStars = progress.stars || 0;
  const totalTexts = LIB.reduce((acc, b) => acc + b.texts.length, 0);
  const completedTexts = Object.values(progress.texts || {}).filter(t => t === 'done').length;
  const overallPct = totalTexts > 0 ? Math.round((completedTexts / totalTexts) * 100) : 0;
  const availableBooks = LIB.filter(b => !b.locked && !b.comingSoon).length;

  return (
    <div className="dashboard">
      <div className="landing-nav" style={{ padding: '8px 0', marginBottom: 16 }}>
        <div className="logo">
          <div className="logo-bird">🦉</div>
          <span>كتابي التفاعلي</span>
        </div>
        <div className="nav-actions">
          <button className="btn-secondary" onClick={onLogout}>خروج</button>
        </div>
      </div>

      <div className="welcome-card">
        <div>
          <h2>أهلاً {user.name}! 👋</h2>
          <p>هيا نكمل رحلة القراءة... عندك {totalStars} نجمة! ⭐</p>
        </div>
        <div className="avatar">🧒</div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div>
            <div className="stat-value">{totalStars}</div>
            <div className="stat-label">نجمة مجمّعة</div>
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
            <div className="stat-value">{progress.gamesPlayed || 0}</div>
            <div className="stat-label">لعبة لُعبت</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div>
            <div className="stat-value">{progress.streak || 1}</div>
            <div className="stat-label">يوم متتالي</div>
          </div>
        </div>
      </div>

      <div className="progress-section">
        <h3>📈 تقدمك الكلي</h3>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: overallPct + '%' }}>
            {overallPct > 8 ? overallPct + '%' : ''}
          </div>
        </div>
        <div className="stars-collection">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className={'star-icon' + (i >= totalStars ? ' empty' : '')}>⭐</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
        <button className="btn-secondary" onClick={onDiagnose} style={{ padding: '20px', justifyContent: 'center', fontSize: 16 }}>
          🧠 اختبار التشخيص
        </button>
        <button className="btn-secondary" onClick={onIQ} style={{ padding: '20px', justifyContent: 'center', fontSize: 16 }}>
          🎯 لعبة الذكاء (IQ)
        </button>
      </div>

      <div className="library-section">
        <div className="section-head">
          <h2>📚 مكتبتي</h2>
          <div className="progress-pill">{availableBooks} كتاب متاح</div>
        </div>
        <div className="book-grid">
          {libraryLoading
            ? Array.from({ length: 4 }).map((_, i) => <BookCardSkeleton key={i} />)
            : LIB.map(book => {
            const bookCompleted = book.texts.length > 0 && book.texts.every(t => progress.texts?.[t.id] === 'done');
            const bookProgress = book.texts.length > 0
              ? Math.round((book.texts.filter(t => progress.texts?.[t.id] === 'done').length / book.texts.length) * 100)
              : 0;
            const gameCount = book.texts.filter(t => t.gameAvailable).length;
            return (
              <div
                key={book.id}
                className="book-card"
                onClick={() => !book.locked && !book.comingSoon && onOpenBook(book)}
                style={{ opacity: book.locked || book.comingSoon ? 0.55 : 1, cursor: book.locked || book.comingSoon ? 'not-allowed' : 'pointer' }}
              >
                <div className="book-cover">
                  <span style={{ fontSize: 80 }}>{book.emoji}</span>
                  <span className={'book-status' + (book.locked || book.comingSoon ? ' locked' : bookCompleted ? ' completed' : '')}>
                    {book.comingSoon ? 'قريباً' : book.locked ? '🔒' : bookCompleted ? '✓ مكتمل' : book.level}
                  </span>
                </div>
                <div className="book-info">
                  <div className="book-title">{book.title}</div>
                  <div className="book-meta">
                    <span>📄 {book.texts.length} نص</span>
                    <span>•</span>
                    <span>{book.comingSoon ? 'قريباً' : `${bookProgress}%`}</span>
                  </div>
                  {!book.comingSoon && gameCount > 0 && (
                    <div className="book-meta book-meta-secondary">
                      <span>🎮 {gameCount} نص بألعاب</span>
                    </div>
                  )}
                  <div className="book-progress">
                    <div className="book-progress-fill" style={{ width: bookProgress + '%' }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================

// BOOK DETAIL — text picker
// ============================================
function BookDetail({ book, progress, onPickText, onBack }) {
  return (
    <div className="dashboard">
      <div style={{ marginBottom: 16 }}>
        <button className="btn-secondary" onClick={onBack}>← رجوع للمكتبة</button>
      </div>
      <div className="welcome-card" style={{
        background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%)'
      }}>
        <div>
          <h2>{book.emoji} {book.title}</h2>
          <p>{book.texts.length} نصوص — اختر نصاً لتبدأ</p>
        </div>
        <div className="avatar" style={{ fontSize: 48 }}>{book.emoji}</div>
      </div>

      <div className="text-list">
        {book.texts.map((t, i) => {
          const status = progress.texts?.[t.id]; // 'read' | 'done'
          const completed = status === 'done';
          const readDone = status === 'read' || status === 'done';
          return (
            <div
              key={t.id}
              className={'text-item' + (completed ? ' completed' : '')}
              onClick={() => onPickText({ ...t, displayIcon: getTextContextIcon(t, book) })}
            >
              <div className="num">{completed ? '✓' : i + 1}</div>
              <div className="text-info">
                <h4><span style={{ marginInlineEnd: 8 }}>{getTextContextIcon(t, book)}</span>{t.title}</h4>
                <p>{t.desc}</p>
                <div className="tags">
                  {t.tags.map((tag, j) => <span key={j} className="tag">{tag}</span>)}
                  <span className="tag" style={{ background: t.gameAvailable ? 'var(--accent-green-soft)' : 'var(--bg-soft)' }}>
                    {t.gameAvailable ? '🎮 ألعاب متاحة' : 'قراءة فقط'}
                  </span>
                  {readDone && !completed && <span className="tag" style={{ background: 'var(--accent-yellow-soft)' }}>قرأت — العب الآن</span>}
                </div>
              </div>
              <span className="arrow">←</span>
            </div>
          );
        })}
        {book.texts.length === 0 && (
          <div className="empty-pool-msg">لا توجد نصوص متاحة بعد.</div>
        )}
      </div>
    </div>
  );
}

window.ChildDashboard = ChildDashboard;
window.BookDetail = BookDetail;
window.BookCardSkeleton = BookCardSkeleton;
window.ChildCardSkeleton = ChildCardSkeleton;
