/* global supabaseClient */
// ContentService — fetches library from Supabase, falls back to window.LIBRARY
// Exposes: window.ContentService

(function () {
  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  class ContentService {
    constructor() {
      this._cache = null;
      this._cacheAt = 0;
    }

    // -------------------------------------------------------
    // Public API
    // -------------------------------------------------------

    /** Returns library array (same shape as window.LIBRARY). Always resolves. */
    async getLibrary() {
      if (this._isCacheValid()) return this._cache;

      try {
        const client = window.getSupabaseClient?.() || window.supabaseClient;
        if (!client) return this._fallback();

        const library = await this._fetchFromSupabase(client);
        if (!library || library.length === 0) return this._fallback();

        this._cache = library;
        this._cacheAt = Date.now();
        return library;
      } catch (err) {
        console.warn('[ContentService] Supabase fetch failed, using static fallback:', err.message);
        return this._fallback();
      }
    }

    /** Force-clears cache so next call re-fetches. */
    invalidate() {
      this._cache = null;
      this._cacheAt = 0;
    }

    // -------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------

    _isCacheValid() {
      return this._cache !== null && (Date.now() - this._cacheAt) < CACHE_TTL_MS;
    }

    _fallback() {
      return window.LIBRARY || [];
    }

    async _fetchFromSupabase(client) {
      // 1. Fetch all books
      const { data: books, error: booksErr } = await client
        .from('books')
        .select('*')
        .order('sort_order', { ascending: true });

      if (booksErr) throw new Error(booksErr.message);
      if (!books || books.length === 0) return null;

      // 2. Fetch all texts
      const { data: texts, error: textsErr } = await client
        .from('texts')
        .select('*')
        .order('sort_order', { ascending: true });

      if (textsErr) throw new Error(textsErr.message);

      // 3. Fetch all text_body sentences
      const { data: bodyRows, error: bodyErr } = await client
        .from('text_body')
        .select('*')
        .order('sort_order', { ascending: true });

      if (bodyErr) throw new Error(bodyErr.message);

      // 4. Build body map: textId → string[]
      const bodyMap = {};
      for (const row of (bodyRows || [])) {
        if (!bodyMap[row.text_id]) bodyMap[row.text_id] = [];
        bodyMap[row.text_id].push(row.sentence);
      }

      // 5. Build texts map: bookId → text[]
      const textsMap = {};
      for (const t of (texts || [])) {
        if (!textsMap[t.book_id]) textsMap[t.book_id] = [];
        textsMap[t.book_id].push({
          id: t.id,
          title: t.title,
          desc: t.description,
          tags: Array.isArray(t.tags) ? t.tags : (t.tags ? JSON.parse(t.tags) : []),
          gameAvailable: t.game_available !== false,
          icon: t.icon || null,
          emoji: t.emoji || null,
          difficulty_level: t.difficulty_level || 1,
          reading_level: t.reading_level || 'مرحلة 1',
          body: bodyMap[t.id] || [],
        });
      }

      // 6. Assemble final library array
      return books.map(b => ({
        id: b.id,
        title: b.title,
        emoji: b.emoji || '📘',
        level: b.level || 'مرحلة 1',
        locked: b.locked === true,
        comingSoon: b.coming_soon === true,
        difficulty_level: b.difficulty_level || 1,
        reading_level: b.reading_level || 'مرحلة 1',
        texts: textsMap[b.id] || [],
      }));
    }
  }

  window.ContentService = ContentService;
})();
