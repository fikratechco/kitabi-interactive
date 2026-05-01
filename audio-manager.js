/* global React, window, getLetterAudioPath, getTextAudioPath, audioFileExists */
const { useEffect, useRef } = React;

// ============================================
// AUDIO MANAGER — Singleton for audio playback
// ============================================
class AudioManager {
  constructor() {
    this.currentAudio = null;
    this.audioCache = new Map(); // Cache loaded audio blobs
    this.preloadedLetters = new Set();
    this.volume = window.AUDIO_CONFIG?.volume || 1.0;
    this.muted = false;
    this.maxConcurrent = window.AUDIO_CONFIG?.maxConcurrentAudio || 1;
    this.activePlaying = [];
    this.initialized = false;
  }

  /**
   * Initialize: preload critical audio (all letters if configured)
   */
  async initialize() {
    if (this.initialized) return;
    this.initialized = true;

    if (!window.AUDIO_CONFIG?.preloadLetters) return;

    // Preload all letter sounds asynchronously
    const letters = Object.keys(window.AUDIO_CONFIG.letters);
    for (const letter of letters) {
      const path = getLetterAudioPath(letter);
      if (path) {
        this.preloadAudio(path).catch(e => {
          console.warn(`Failed to preload letter ${letter}:`, e);
        });
      }
    }
  }

  /**
   * Preload audio into cache (doesn't play it, just fetches)
   */
  async preloadAudio(path) {
    if (this.audioCache.has(path)) return this.audioCache.get(path);
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      this.audioCache.set(path, blob);
      return blob;
    } catch (e) {
      console.warn(`Could not preload audio from ${path}:`, e.message);
      return null;
    }
  }

  /**
   * Play letter sound
   * @param {string} letter - Arabic character
   */
  async playLetter(letter) {
    const path = getLetterAudioPath(letter);
    if (!path) {
      console.warn(`No audio configured for letter: ${letter}`);
      return false;
    }
    return this.playAudioFile(path, letter);
  }

  /**
   * Play text passage
   * @param {string} bookId - Book identifier
   * @param {string} textId - Text identifier
   */
  async playText(bookId, textId) {
    const path = getTextAudioPath(bookId, textId);
    if (!path) {
      console.warn(`No audio configured for text: ${bookId}/${textId}`);
      return false;
    }
    return this.playAudioFile(path, `${bookId}-${textId}`);
  }

  /**
   * Play arbitrary word or phrase (check if MP3 exists, else fallback to Web Speech)
   * @param {string} text - Text to play
   */
  async playWord(text) {
    // Try to find word in texts first (optional expansion)
    // For now, just attempt Web Speech fallback
    this.playWithFallback(text);
  }

  /**
   * Core: play audio file from URL or cache
   * @param {string} path - Full path to MP3 file
   * @param {string} label - Label for logging
   */
  async playAudioFile(path, label = '') {
    // Stop current audio if configured to do so
    if (this.maxConcurrent === 1) {
      this.stop();
    }

    try {
      // Fetch audio (from cache if available)
      let blob = this.audioCache.get(path);
      if (!blob) {
        blob = await this.preloadAudio(path);
      }

      if (!blob) {
        console.warn(`Failed to load audio: ${path}`);
        return false;
      }

      // Create audio element and play
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.volume = this.muted ? 0 : this.volume;
      
      const onEnded = () => {
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('error', onError);
        this.activePlaying = this.activePlaying.filter(a => a !== audio);
        URL.revokeObjectURL(url);
      };

      const onError = (e) => {
        console.error(`Audio playback error (${label}):`, e);
        onEnded();
      };

      audio.addEventListener('ended', onEnded);
      audio.addEventListener('error', onError);
      this.activePlaying.push(audio);
      this.currentAudio = audio;

      await audio.play();
      return true;
    } catch (e) {
      console.error(`Failed to play audio (${label}):`, e.message);
      return false;
    }
  }

  /**
   * Play with Web Speech fallback (for testing/graceful degradation)
   * @param {string} text - Text to speak
   * @param {number} rate - Speech rate (0.5 - 2.0)
   */
  playWithFallback(text, rate = 0.85) {
    if (!window.speechSynthesis) {
      console.warn('Web Speech API not available');
      return false;
    }

    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ar-SA';
      u.rate = rate;
      u.pitch = 1.05;
      u.volume = this.muted ? 0 : this.volume;
      window.speechSynthesis.speak(u);
      return true;
    } catch (e) {
      console.error('Web Speech error:', e);
      return false;
    }
  }

  /**
   * Stop all current audio playback
   */
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }
    window.speechSynthesis?.cancel();
    this.activePlaying.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.activePlaying = [];
  }

  /**
   * Set volume (0.0 - 1.0)
   */
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.currentAudio) {
      this.currentAudio.volume = this.muted ? 0 : this.volume;
    }
  }

  /**
   * Mute/unmute
   */
  setMuted(muted) {
    this.muted = muted;
    if (this.currentAudio) {
      this.currentAudio.volume = muted ? 0 : this.volume;
    }
  }

  /**
   * Clear cache (useful for memory management)
   */
  clearCache() {
    this.audioCache.clear();
    this.preloadedLetters.clear();
  }

  /**
   * Get cache stats (for debugging)
   */
  getStats() {
    return {
      cachedFiles: this.audioCache.size,
      preloadedLetters: this.preloadedLetters.size,
      volume: this.volume,
      muted: this.muted,
      currentPlaying: this.activePlaying.length,
    };
  }
}

// Singleton instance
let audioManagerInstance = null;

function getAudioManager() {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager();
  }
  return audioManagerInstance;
}

// Export to window
window.AudioManager = AudioManager;
window.getAudioManager = getAudioManager;
Object.assign(window, { AudioManager, getAudioManager });
