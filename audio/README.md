# Audio Files — MP3 Directory

This folder contains all MP3 audio files for the interactive reading platform.

## Structure

### `/audio/letters/` — Arabic Letter Pronunciation
Each file contains the clear pronunciation of a single Arabic letter.

**Expected files (28 total):**
- alif.mp3 (ا)
- ba.mp3 (ب)
- ta.mp3 (ت)
- tha.mp3 (ث)
- jeem.mp3 (ج)
- ha.mp3 (ح)
- kha.mp3 (خ)
- dal.mp3 (د)
- dhal.mp3 (ذ)
- ra.mp3 (ر)
- zay.mp3 (ز)
- seen.mp3 (س)
- sheen.mp3 (ش)
- sad.mp3 (ص)
- dad.mp3 (ض)
- tah.mp3 (ط)
- zah.mp3 (ظ)
- ayn.mp3 (ع)
- ghayn.mp3 (غ)
- fa.mp3 (ف)
- qaf.mp3 (ق)
- kaf.mp3 (ك)
- lam.mp3 (ل)
- meem.mp3 (م)
- noon.mp3 (ن)
- ha2.mp3 (ه)
- waw.mp3 (و)
- ya.mp3 (ي)

**Quality Specs:**
- Format: MP3 (128 kbps recommended)
- Duration: 0.5-2 seconds per letter
- Language: Modern Standard Arabic (MSA) or consistent dialect

### `/audio/texts/` — Full Text Passages
Each file contains the complete narration of a text passage from the library.

**Naming Convention:** `{bookId}-{textId}.mp3`

**Expected files (by book):**

#### Book: `school` (المدرسة - في المدرسة)
- school-t1.mp3 — "اليوم نعود إلى المدرسة" (~45 seconds)
- school-t2.mp3 — "في ساحة المدرسة" (~40 seconds)
- school-t3.mp3 — "في القسم" (~35 seconds)

#### Book: `family` (عائلتي)
- family-t4.mp3 — "زفاف أختي" (~50 seconds)
- family-t5.mp3 — "اليوم ننظف بيتنا" (~35 seconds)
- family-t6.mp3 — "عائلتي تحتفل بالاستقلال" (~45 seconds)

**Quality Specs:**
- Format: MP3 (128 kbps recommended)
- Duration: 30-60 seconds per passage
- Narration: Clear, age-appropriate, native speaker preferred
- Pacing: Suitable for 6-8 year olds with dyslexia

### `/audio/effects/` — Sound Effects (Optional)
Currently using Web Audio API for procedurally generated sound effects (success, error, clap). This directory reserved for future use if you want to add custom sound effects.

---

## Usage in Code

The application automatically loads MP3 files when they exist. If an MP3 file is missing, the system falls back to Web Speech API (browser text-to-speech).

### How Audio is Triggered

1. **Single Letters:** When a game or reading activity needs to pronounce a letter, it calls `speak('letter')` which:
   - Checks if MP3 exists in `/audio/letters/`
   - Plays MP3 if available
   - Falls back to Web Speech if missing

2. **Text Passages:** When starting a reading activity with a text:
   - Checks if MP3 exists in `/audio/texts/{bookId}-{textId}.mp3`
   - Plays full passage MP3 (narration)
   - Falls back to word-by-word synthesis if missing

3. **Sound Effects:** Procedurally generated via Web Audio API (no MP3 needed)

---

## Deployment

To add your MP3 files:

1. **Place letter sounds:** Copy all 28 letter MP3s into `/audio/letters/`
2. **Place text narrations:** Copy all text passage MP3s into `/audio/texts/`
3. **Test:** Open the app — it will automatically detect and use the files
4. **Fallback behavior:** If any MP3 is missing, Web Speech API takes over automatically

---

## Technical Details

- **Audio Manager:** `audio-manager.jsx` handles playback, caching, and fallback logic
- **Audio Config:** `audio-config.js` defines file mappings for letters and texts
- **Preloading:** All 28 letters are preloaded on app startup for snappy playback
- **Caching:** MP3s are cached in memory to avoid re-fetching
- **Volume:** Default 100%, controllable via tweaks panel

---

## Notes

- **No encoding requirements:** Simply provide standard MP3 files
- **Mono or stereo:** Both work fine
- **Sample rate:** 44.1 kHz or 48 kHz recommended
- **Compatibility:** MP3 is supported in all modern browsers

For questions or updates to this structure, contact the development team.
