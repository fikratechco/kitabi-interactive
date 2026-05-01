/* global window */
// ============================================
// AUDIO CONFIG — MP3 File Mappings
// ============================================
// Maps Arabic letters and text passages to their corresponding MP3 files
// When you provide MP3s, place them in /audio/letters/ and /audio/texts/

window.AUDIO_CONFIG = {
  // ========================================
  // ARABIC LETTERS (28 letters)
  // ========================================
  letters: {
    'ا': 'alif.mp3',
    'ب': 'ba.mp3',
    'ت': 'ta.mp3',
    'ث': 'tha.mp3',
    'ج': 'jeem.mp3',
    'ح': 'ha.mp3',
    'خ': 'kha.mp3',
    'د': 'dal.mp3',
    'ذ': 'dhal.mp3',
    'ر': 'ra.mp3',
    'ز': 'zay.mp3',
    'س': 'seen.mp3',
    'ش': 'sheen.mp3',
    'ص': 'sad.mp3',
    'ض': 'dad.mp3',
    'ط': 'tah.mp3',
    'ظ': 'zah.mp3',
    'ع': 'ayn.mp3',
    'غ': 'ghayn.mp3',
    'ف': 'fa.mp3',
    'ق': 'qaf.mp3',
    'ك': 'kaf.mp3',
    'ل': 'lam.mp3',
    'م': 'meem.mp3',
    'ن': 'noon.mp3',
    'ه': 'ha2.mp3',
    'و': 'waw.mp3',
    'ي': 'ya.mp3',
  },

  // ========================================
  // TEXT PASSAGES (by book ID and text ID)
  // Format: bookId: { textId: 'filename.mp3', ... }
  // ========================================
  texts: {
    school: {
      t1: 'school-t1.mp3',     // في المدرسة
      t2: 'school-t2.mp3',     // في ساحة المدرسة
      t3: 'school-t3.mp3',     // في القسم
    },
    family: {
      t4: 'family-t4.mp3',     // زفاف أختي
      t5: 'family-t5.mp3',     // اليوم ننظف بيتنا
      t6: 'family-t6.mp3',     // عائلتي تحتفل بالاستقلال
    },
    // Add more books/texts as library expands
  },

  // ========================================
  // CONFIGURATION
  // ========================================
  baseUrl: '/audio/',           // Base URL for all audio files
  letterUrl: '/audio/letters/', // Letter pronunciation files
  textUrl: '/audio/texts/',     // Text passage files
  fallbackToWebSpeech: true,    // If MP3 missing, use Web Speech API
  preloadLetters: true,          // Preload all letter sounds on app startup
  maxConcurrentAudio: 1,        // Only play one audio at a time (0 = unlimited)
  volume: 1.0,                   // Default volume (0.0 - 1.0)
  version: '1.0',               // Audio library version
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get MP3 file path for an Arabic letter
 * @param {string} letter - Single Arabic character
 * @returns {string|null} - Full path to MP3 file or null if not configured
 */
function getLetterAudioPath(letter) {
  const filename = window.AUDIO_CONFIG.letters[letter];
  return filename ? window.AUDIO_CONFIG.letterUrl + filename : null;
}

/**
 * Get MP3 file path for a text passage
 * @param {string} bookId - Book identifier from library-data.js
 * @param {string} textId - Text identifier (t1, t2, etc.)
 * @returns {string|null} - Full path to MP3 file or null if not configured
 */
function getTextAudioPath(bookId, textId) {
  const book = window.AUDIO_CONFIG.texts[bookId];
  if (!book) return null;
  const filename = book[textId];
  return filename ? window.AUDIO_CONFIG.textUrl + filename : null;
}

/**
 * Check if MP3 file exists at given path (simple existence check via HEAD request)
 * @param {string} path - File path
 * @returns {Promise<boolean>}
 */
async function audioFileExists(path) {
  try {
    const response = await fetch(path, { method: 'HEAD' });
    return response.ok;
  } catch (e) {
    return false;
  }
}

// Export utilities to window
Object.assign(window, {
  getLetterAudioPath,
  getTextAudioPath,
  audioFileExists,
});
