/* global React */
// Admin CMS — password-protected, manage books and texts
// Exposes: window.AdminCMS

(function () {
  const { useState, useEffect, useCallback } = React;
  const ADMIN_PASSWORD_KEY = 'kitabi_admin_auth';
  const ADMIN_PWD = 'kitabi2024admin'; // Change this before deployment

  // -------------------------------------------------------
  // Tiny helpers
  // -------------------------------------------------------
  function Field({ label, children }) {
    return (
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 4 }}>
          {label}
        </label>
        {children}
      </div>
    );
  }

  function Input({ value, onChange, placeholder, type = 'text', style = {} }) {
    return (
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: 8,
          border: '1.5px solid var(--border)', fontSize: 14, background: 'var(--bg-card)',
          color: 'var(--ink)', outline: 'none', direction: 'rtl', ...style,
        }}
      />
    );
  }

  function Textarea({ value, onChange, placeholder, rows = 4 }) {
    return (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: 8,
          border: '1.5px solid var(--border)', fontSize: 14, background: 'var(--bg-card)',
          color: 'var(--ink)', outline: 'none', direction: 'rtl', resize: 'vertical', fontFamily: 'inherit',
        }}
      />
    );
  }

  // -------------------------------------------------------
  // Login gate
  // -------------------------------------------------------
  function AdminLogin({ onAuth }) {
    const [pwd, setPwd] = useState('');
    const [err, setErr] = useState('');

    const submit = (e) => {
      e.preventDefault();
      if (pwd === ADMIN_PWD) {
        sessionStorage.setItem(ADMIN_PASSWORD_KEY, '1');
        onAuth();
      } else {
        setErr('كلمة المرور غير صحيحة');
        setPwd('');
      }
    };

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-page)', direction: 'rtl',
      }}>
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 40, width: 360, boxShadow: '0 4px 24px rgba(0,0,0,.10)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 48 }}>🦉</div>
            <h2 style={{ margin: '8px 0 4px', color: 'var(--ink)' }}>لوحة الإدارة</h2>
            <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>كتابي التفاعلي — CMS</p>
          </div>
          <form onSubmit={submit}>
            <Field label="كلمة المرور">
              <Input type="password" value={pwd} onChange={setPwd} placeholder="أدخل كلمة المرور" />
            </Field>
            {err && <p style={{ color: 'var(--accent-red, #e05c5c)', fontSize: 13, margin: '4px 0 8px' }}>{err}</p>}
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              دخول →
            </button>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------
  // Book form (add / edit)
  // -------------------------------------------------------
  function BookForm({ initial, onSave, onCancel, saving }) {
    const [title, setTitle] = useState(initial?.title || '');
    const [emoji, setEmoji] = useState(initial?.emoji || '📘');
    const [level, setLevel] = useState(initial?.level || 'مرحلة 1');
    const [locked, setLocked] = useState(initial?.locked || false);
    const [comingSoon, setComingSoon] = useState(initial?.coming_soon || false);
    const [readingLevel, setReadingLevel] = useState(initial?.reading_level || 'مرحلة 1');
    const [diffLevel, setDiffLevel] = useState(initial?.difficulty_level || 1);

    const handleSave = () => {
      if (!title.trim()) { window.showToast?.('اسم الكتاب مطلوب', 'error'); return; }
      onSave({ title: title.trim(), emoji: emoji.trim() || '📘', level, locked, coming_soon: comingSoon, reading_level: readingLevel, difficulty_level: Number(diffLevel) });
    };

    return (
      <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,.07)' }}>
        <h3 style={{ margin: '0 0 16px', color: 'var(--ink)' }}>{initial ? '✏️ تعديل الكتاب' : '➕ كتاب جديد'}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="اسم الكتاب"><Input value={title} onChange={setTitle} placeholder="عنوان الكتاب" /></Field>
          <Field label="إيموجي"><Input value={emoji} onChange={setEmoji} placeholder="📘" /></Field>
          <Field label="المستوى">
            <select value={level} onChange={e => setLevel(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, direction: 'rtl' }}>
              {['مرحلة 1', 'مرحلة 2', 'مرحلة 3', 'مرحلة 4'].map(l => <option key={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="مستوى القراءة">
            <select value={readingLevel} onChange={e => setReadingLevel(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, direction: 'rtl' }}>
              {['مرحلة 1', 'مرحلة 2', 'مرحلة 3', 'مرحلة 4'].map(l => <option key={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="درجة الصعوبة (1–5)">
            <Input type="number" value={diffLevel} onChange={setDiffLevel} style={{ width: 80 }} />
          </Field>
          <Field label="الحالة">
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', paddingTop: 8 }}>
              <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 14 }}>
                <input type="checkbox" checked={locked} onChange={e => setLocked(e.target.checked)} /> مقفل
              </label>
              <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 14 }}>
                <input type="checkbox" checked={comingSoon} onChange={e => setComingSoon(e.target.checked)} /> قريباً
              </label>
            </div>
          </Field>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn-secondary" onClick={onCancel} disabled={saving}>إلغاء</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? '...' : 'حفظ الكتاب'}</button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------
  // Text form (add / edit)
  // -------------------------------------------------------
  function TextForm({ initial, onSave, onCancel, saving }) {
    const [title, setTitle] = useState(initial?.title || '');
    const [desc, setDesc] = useState(initial?.description || initial?.desc || '');
    const [tags, setTags] = useState(Array.isArray(initial?.tags) ? initial.tags.join('، ') : '');
    const [icon, setIcon] = useState(initial?.icon || '');
    const [emoji, setEmoji] = useState(initial?.emoji || '');
    const [gameAvailable, setGameAvailable] = useState(initial?.game_available !== false && initial?.gameAvailable !== false);
    const [readingLevel, setReadingLevel] = useState(initial?.reading_level || 'مرحلة 1');
    const [diffLevel, setDiffLevel] = useState(initial?.difficulty_level || 1);
    const [body, setBody] = useState(Array.isArray(initial?.body) ? initial.body.join('\n') : '');

    const handleSave = () => {
      if (!title.trim()) { window.showToast?.('عنوان النص مطلوب', 'error'); return; }
      const tagList = tags.split(/[,،]/).map(t => t.trim()).filter(Boolean);
      const bodyList = body.split('\n').map(s => s.trim()).filter(Boolean);
      onSave({
        title: title.trim(),
        description: desc.trim(),
        tags: tagList,
        icon: icon.trim() || null,
        emoji: emoji.trim() || null,
        game_available: gameAvailable,
        reading_level: readingLevel,
        difficulty_level: Number(diffLevel),
        body: bodyList,
      });
    };

    return (
      <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,.07)' }}>
        <h4 style={{ margin: '0 0 14px', color: 'var(--ink)' }}>{initial ? '✏️ تعديل النص' : '➕ نص جديد'}</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="عنوان النص"><Input value={title} onChange={setTitle} placeholder="اسم النص" /></Field>
          <Field label="وصف قصير"><Input value={desc} onChange={setDesc} placeholder="وصف النص" /></Field>
          <Field label="الوسوم (مفصولة بفاصلة)"><Input value={tags} onChange={setTags} placeholder="مدرسة، أرقام، حروف" /></Field>
          <Field label="إيموجي السياق"><Input value={icon} onChange={setIcon} placeholder="🏫" /></Field>
          <Field label="مستوى القراءة">
            <select value={readingLevel} onChange={e => setReadingLevel(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, direction: 'rtl' }}>
              {['مرحلة 1', 'مرحلة 2', 'مرحلة 3', 'مرحلة 4'].map(l => <option key={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="درجة الصعوبة (1–5)">
            <Input type="number" value={diffLevel} onChange={setDiffLevel} style={{ width: 80 }} />
          </Field>
        </div>
        <Field label="جمل النص (كل جملة في سطر)">
          <Textarea value={body} onChange={setBody} placeholder="الجملة الأولى&#10;الجملة الثانية&#10;..." rows={5} />
        </Field>
        <Field label="">
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 }}>
            <input type="checkbox" checked={gameAvailable} onChange={e => setGameAvailable(e.target.checked)} />
            الألعاب متاحة لهذا النص
          </label>
        </Field>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="btn-secondary" onClick={onCancel} disabled={saving}>إلغاء</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? '...' : 'حفظ النص'}</button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------
  // Book row in list
  // -------------------------------------------------------
  function BookRow({ book, texts, onEditBook, onDeleteBook, onAddText, onEditText, onDeleteText }) {
    const [expanded, setExpanded] = useState(false);

    return (
      <div style={{ border: '1.5px solid var(--border)', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-card)', cursor: 'pointer' }}
          onClick={() => setExpanded(x => !x)}
        >
          <span style={{ fontSize: 28 }}>{book.emoji || '📘'}</span>
          <div style={{ flex: 1 }}>
            <strong style={{ color: 'var(--ink)' }}>{book.title}</strong>
            <span style={{ color: 'var(--ink-soft)', fontSize: 12, marginRight: 8 }}>{book.level} • {texts.length} نص</span>
            {book.locked && <span style={{ fontSize: 11, background: 'var(--bg-soft)', borderRadius: 4, padding: '2px 6px', marginRight: 6 }}>🔒 مقفل</span>}
            {book.coming_soon && <span style={{ fontSize: 11, background: '#FFF3CD', borderRadius: 4, padding: '2px 6px', marginRight: 6 }}>⏳ قريباً</span>}
          </div>
          <button className="btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={e => { e.stopPropagation(); onEditBook(book); }}>تعديل</button>
          <button style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, background: 'var(--accent-red, #e05c5c)', color: '#fff', border: 'none', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); onDeleteBook(book); }}>حذف</button>
          <span style={{ color: 'var(--ink-muted)', fontSize: 12 }}>{expanded ? '▲' : '▼'}</span>
        </div>

        {expanded && (
          <div style={{ padding: '0 16px 16px', background: 'var(--bg-soft)' }}>
            <div style={{ paddingTop: 12, marginBottom: 10 }}>
              <button className="btn-primary" style={{ fontSize: 13, padding: '6px 14px' }} onClick={() => onAddText(book)}>
                ➕ إضافة نص
              </button>
            </div>
            {texts.length === 0 && <p style={{ color: 'var(--ink-muted)', fontSize: 13 }}>لا توجد نصوص — أضف أول نص!</p>}
            {texts.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 18 }}>{t.icon || t.emoji || '📄'}</span>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: 14, color: 'var(--ink)' }}>{t.title}</strong>
                  <span style={{ color: 'var(--ink-muted)', fontSize: 12, marginRight: 8 }}>
                    {t.game_available ? '🎮 ألعاب' : 'قراءة فقط'} • {Array.isArray(t.body) ? t.body.length : 0} جملة
                  </span>
                </div>
                <button className="btn-secondary" style={{ fontSize: 12, padding: '3px 8px' }} onClick={() => onEditText(book, t)}>تعديل</button>
                <button style={{ fontSize: 12, padding: '3px 8px', borderRadius: 6, background: '#ffecec', color: '#c0392b', border: '1px solid #f5b7b1', cursor: 'pointer' }} onClick={() => onDeleteText(t)}>حذف</button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------
  // Main Admin CMS component
  // -------------------------------------------------------
  function AdminCMS({ onExit }) {
    const [authed, setAuthed] = useState(() => sessionStorage.getItem(ADMIN_PASSWORD_KEY) === '1');
    const [books, setBooks] = useState([]);
    const [texts, setTexts] = useState([]); // flat list of all texts
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // UI state
    const [editingBook, setEditingBook] = useState(null);   // book object or 'new'
    const [editingText, setEditingText] = useState(null);   // { book, text } or { book, text: 'new' }

    const client = window.getSupabaseClient?.() || window.supabaseClient;

    // ---- Load all books + texts ----
    const loadAll = useCallback(async () => {
      if (!client) { window.showToast?.('Supabase غير متصل', 'error'); return; }
      setLoading(true);
      try {
        const [{ data: bData }, { data: tData }, { data: bodyData }] = await Promise.all([
          client.from('books').select('*').order('sort_order'),
          client.from('texts').select('*').order('sort_order'),
          client.from('text_body').select('*').order('sort_order'),
        ]);

        const bodyMap = {};
        for (const row of (bodyData || [])) {
          if (!bodyMap[row.text_id]) bodyMap[row.text_id] = [];
          bodyMap[row.text_id].push(row.sentence);
        }

        setBooks(bData || []);
        setTexts((tData || []).map(t => ({ ...t, body: bodyMap[t.id] || [] })));
      } catch (err) {
        window.showToast?.('تعذر تحميل البيانات', 'error');
      } finally {
        setLoading(false);
      }
    }, [client]);

    useEffect(() => { if (authed) loadAll(); }, [authed, loadAll]);

    // ---- Book operations ----
    const saveBook = async (data) => {
      if (!client) return;
      setSaving(true);
      try {
        if (editingBook === 'new') {
          const sortOrder = books.length > 0 ? Math.max(...books.map(b => b.sort_order || 0)) + 1 : 1;
          const { error } = await client.from('books').insert([{ ...data, sort_order: sortOrder }]);
          if (error) throw error;
          window.showToast?.('تمت إضافة الكتاب ✓', 'success');
        } else {
          const { error } = await client.from('books').update(data).eq('id', editingBook.id);
          if (error) throw error;
          window.showToast?.('تم تحديث الكتاب ✓', 'success');
        }
        setEditingBook(null);
        await loadAll();
        window.ContentService && new window.ContentService().invalidate();
      } catch (err) {
        window.showToast?.('خطأ في حفظ الكتاب: ' + err.message, 'error');
      } finally {
        setSaving(false);
      }
    };

    const deleteBook = async (book) => {
      if (!window.confirm(`هل تريد حذف "${book.title}" وجميع نصوصه؟`)) return;
      if (!client) return;
      setSaving(true);
      try {
        // Delete text_body rows, then texts, then the book
        const bookTexts = texts.filter(t => t.book_id === book.id);
        if (bookTexts.length > 0) {
          const textIds = bookTexts.map(t => t.id);
          await client.from('text_body').delete().in('text_id', textIds);
          await client.from('texts').delete().in('id', textIds);
        }
        const { error } = await client.from('books').delete().eq('id', book.id);
        if (error) throw error;
        window.showToast?.('تم حذف الكتاب', 'success');
        await loadAll();
        window.ContentService && new window.ContentService().invalidate();
      } catch (err) {
        window.showToast?.('خطأ في الحذف: ' + err.message, 'error');
      } finally {
        setSaving(false);
      }
    };

    // ---- Text operations ----
    const saveText = async (data) => {
      if (!client) return;
      setSaving(true);
      const { book, text } = editingText;
      try {
        let textId;
        if (text === 'new') {
          const sortOrder = texts.filter(t => t.book_id === book.id).length + 1;
          const insertPayload = {
            book_id: book.id,
            title: data.title,
            description: data.description,
            tags: data.tags,
            icon: data.icon,
            emoji: data.emoji,
            game_available: data.game_available,
            reading_level: data.reading_level,
            difficulty_level: data.difficulty_level,
            sort_order: sortOrder,
          };
          const { data: inserted, error } = await client.from('texts').insert([insertPayload]).select();
          if (error) throw error;
          textId = inserted[0].id;
          window.showToast?.('تمت إضافة النص ✓', 'success');
        } else {
          textId = text.id;
          const { error } = await client.from('texts').update({
            title: data.title,
            description: data.description,
            tags: data.tags,
            icon: data.icon,
            emoji: data.emoji,
            game_available: data.game_available,
            reading_level: data.reading_level,
            difficulty_level: data.difficulty_level,
          }).eq('id', textId);
          if (error) throw error;
          // Replace body sentences
          await client.from('text_body').delete().eq('text_id', textId);
          window.showToast?.('تم تحديث النص ✓', 'success');
        }

        // Insert body sentences
        if (data.body.length > 0) {
          const bodyRows = data.body.map((sentence, i) => ({ text_id: textId, sentence, sort_order: i + 1 }));
          const { error: bodyErr } = await client.from('text_body').insert(bodyRows);
          if (bodyErr) throw bodyErr;
        }

        setEditingText(null);
        await loadAll();
        window.ContentService && new window.ContentService().invalidate();
      } catch (err) {
        window.showToast?.('خطأ في حفظ النص: ' + err.message, 'error');
      } finally {
        setSaving(false);
      }
    };

    const deleteText = async (text) => {
      if (!window.confirm(`هل تريد حذف النص "${text.title}"؟`)) return;
      if (!client) return;
      setSaving(true);
      try {
        await client.from('text_body').delete().eq('text_id', text.id);
        const { error } = await client.from('texts').delete().eq('id', text.id);
        if (error) throw error;
        window.showToast?.('تم حذف النص', 'success');
        await loadAll();
        window.ContentService && new window.ContentService().invalidate();
      } catch (err) {
        window.showToast?.('خطأ في الحذف: ' + err.message, 'error');
      } finally {
        setSaving(false);
      }
    };

    // ---- Render ----
    if (!authed) return <AdminLogin onAuth={() => setAuthed(true)} />;

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-page)', direction: 'rtl', padding: '0 0 60px' }}>
        {/* Header */}
        <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>🦉</span>
          <div style={{ flex: 1 }}>
            <strong style={{ color: 'var(--ink)' }}>لوحة الإدارة — كتابي التفاعلي</strong>
            <span style={{ color: 'var(--ink-muted)', fontSize: 12, marginRight: 8 }}>إدارة الكتب والنصوص</span>
          </div>
          <button className="btn-secondary" onClick={() => { sessionStorage.removeItem(ADMIN_PASSWORD_KEY); onExit?.(); }}>خروج</button>
        </div>

        <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px' }}>
          {/* Book form (new/edit) */}
          {editingBook && (
            <BookForm
              initial={editingBook === 'new' ? null : editingBook}
              onSave={saveBook}
              onCancel={() => setEditingBook(null)}
              saving={saving}
            />
          )}

          {/* Text form (new/edit) */}
          {editingText && (
            <TextForm
              initial={editingText.text === 'new' ? null : editingText.text}
              onSave={saveText}
              onCancel={() => setEditingText(null)}
              saving={saving}
            />
          )}

          {/* Toolbar */}
          {!editingBook && !editingText && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, color: 'var(--ink)' }}>📚 الكتب ({books.length})</h2>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-secondary" onClick={loadAll} disabled={loading}>{loading ? '...' : '🔄 تحديث'}</button>
                <button className="btn-primary" onClick={() => setEditingBook('new')}>➕ كتاب جديد</button>
              </div>
            </div>
          )}

          {/* Books list */}
          {!editingBook && !editingText && (
            loading
              ? <p style={{ color: 'var(--ink-muted)', textAlign: 'center', padding: 40 }}>جارٍ التحميل...</p>
              : books.length === 0
                ? (
                  <div style={{ textAlign: 'center', padding: 60, color: 'var(--ink-muted)' }}>
                    <div style={{ fontSize: 48 }}>📭</div>
                    <p>لا توجد كتب — أضف أول كتاب!</p>
                    {!client && <p style={{ fontSize: 13, color: 'var(--accent-red, #e05c5c)' }}>⚠️ Supabase غير متصل</p>}
                  </div>
                )
                : books.map(b => (
                  <BookRow
                    key={b.id}
                    book={b}
                    texts={texts.filter(t => t.book_id === b.id)}
                    onEditBook={setEditingBook}
                    onDeleteBook={deleteBook}
                    onAddText={(book) => setEditingText({ book, text: 'new' })}
                    onEditText={(book, text) => setEditingText({ book, text })}
                    onDeleteText={deleteText}
                  />
                ))
          )}
        </div>
      </div>
    );
  }

  window.AdminCMS = AdminCMS;
})();
