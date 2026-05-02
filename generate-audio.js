/**
 * generate-audio.js
 * Generates all Arabic letter and word MP3 files for كتابي التفاعلي
 *
 * USAGE:
 *   node generate-audio.js --provider google  --key YOUR_GOOGLE_API_KEY
 *   node generate-audio.js --provider elevenlabs --key YOUR_ELEVENLABS_API_KEY
 *
 * OUTPUT:
 *   /audio/letters/alif.mp3 ... (28 files)
 *   /audio/words/<word>.mp3 ... (common game words)
 *
 * PROVIDERS:
 *   google      — Google Cloud TTS, Neural2 Arabic voice (ar-XA-Neural2-A female)
 *                 Free tier: 1M characters/month
 *                 Sign up:   console.cloud.google.com → Text-to-Speech API
 *
 *   elevenlabs  — ElevenLabs Multilingual v2 (best quality, sounds most human)
 *                 Free tier: 10,000 characters/month
 *                 Sign up:   elevenlabs.io
 *                 Note: choose a voice that supports Arabic (e.g. "Aria", "Rachel")
 */

const fs   = require('fs');
const path = require('path');
const https = require('https');

// ─── CLI args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };
const PROVIDER = getArg('--provider') || 'google';
const API_KEY  = getArg('--key');

if (!API_KEY) {
  console.error('ERROR: --key is required.\n  Example: node generate-audio.js --provider google --key AIza...');
  process.exit(1);
}

// ─── Letters to generate ─────────────────────────────────────────────────────
const LETTERS = [
  { char: 'ا', file: 'alif',  spoken: 'ألِف' },
  { char: 'ب', file: 'ba',    spoken: 'بَاء' },
  { char: 'ت', file: 'ta',    spoken: 'تَاء' },
  { char: 'ث', file: 'tha',   spoken: 'ثَاء' },
  { char: 'ج', file: 'jeem',  spoken: 'جِيم' },
  { char: 'ح', file: 'ha',    spoken: 'حَاء' },
  { char: 'خ', file: 'kha',   spoken: 'خَاء' },
  { char: 'د', file: 'dal',   spoken: 'دَال' },
  { char: 'ذ', file: 'dhal',  spoken: 'ذَال' },
  { char: 'ر', file: 'ra',    spoken: 'رَاء' },
  { char: 'ز', file: 'zay',   spoken: 'زَاي' },
  { char: 'س', file: 'seen',  spoken: 'سِين' },
  { char: 'ش', file: 'sheen', spoken: 'شِين' },
  { char: 'ص', file: 'sad',   spoken: 'صَاد' },
  { char: 'ض', file: 'dad',   spoken: 'ضَاد' },
  { char: 'ط', file: 'tah',   spoken: 'طَاء' },
  { char: 'ظ', file: 'zah',   spoken: 'ظَاء' },
  { char: 'ع', file: 'ayn',   spoken: 'عَيْن' },
  { char: 'غ', file: 'ghayn', spoken: 'غَيْن' },
  { char: 'ف', file: 'fa',    spoken: 'فَاء' },
  { char: 'ق', file: 'qaf',   spoken: 'قَاف' },
  { char: 'ك', file: 'kaf',   spoken: 'كَاف' },
  { char: 'ل', file: 'lam',   spoken: 'لَام' },
  { char: 'م', file: 'meem',  spoken: 'مِيم' },
  { char: 'ن', file: 'noon',  spoken: 'نُون' },
  { char: 'ه', file: 'ha2',   spoken: 'هَاء' },
  { char: 'و', file: 'waw',   spoken: 'وَاو' },
  { char: 'ي', file: 'ya',    spoken: 'يَاء' },
];

// Common words used across all 9 games
const WORDS = [
  'زهرة','سمكة','زرافة','سلحفاة','زيتون','سحاب',
  'زهور','غزالة','مدرسة','بيت','أسرة','كتاب','قلم',
  'مال','نار','قمر','سماء','رمل','شمس','قمح',
  'نور','ورد','فجر','صوت','حليب','بحر','طير','لون',
  'مئزر','باب','كتاب','قلم',
  // game sentences (train game words)
  'في','الغابة','تعيش','جميلة',
];

// ─── Output dirs ──────────────────────────────────────────────────────────────
const OUT_LETTERS = path.join(__dirname, 'audio', 'letters');
const OUT_WORDS   = path.join(__dirname, 'audio', 'words');
fs.mkdirSync(OUT_LETTERS, { recursive: true });
fs.mkdirSync(OUT_WORDS,   { recursive: true });

// ─── Helpers ──────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function saveBase64(base64, dest) {
  fs.writeFileSync(dest, Buffer.from(base64, 'base64'));
}

async function httpPost(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({ hostname, path, method: 'POST', headers: { ...headers, 'Content-Length': Buffer.byteLength(data) } }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString();
        try { resolve({ status: res.statusCode, body: JSON.parse(text) }); }
        catch (_) { resolve({ status: res.statusCode, body: text }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ─── Google TTS Neural2 ───────────────────────────────────────────────────────
async function googleTTS(text, destPath) {
  if (fs.existsSync(destPath)) { console.log('  skip (exists):', path.basename(destPath)); return; }

  const res = await httpPost('texttospeech.googleapis.com',
    `/v1/text:synthesize?key=${API_KEY}`,
    { 'Content-Type': 'application/json' },
    {
      input: { text },
      voice: {
        languageCode: 'ar-XA',
        name: 'ar-XA-Neural2-A',   // female — change to ar-XA-Neural2-D for male
        ssmlGender: 'FEMALE',
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.85,         // slower for children
        pitch: 1.0,
        effectsProfileId: ['headphone-class-device'],
      },
    }
  );

  if (res.status !== 200 || !res.body.audioContent) {
    console.error('  Google TTS error:', JSON.stringify(res.body).slice(0, 200));
    return;
  }
  saveBase64(res.body.audioContent, destPath);
  console.log('  ✓', path.basename(destPath));
}

// ─── ElevenLabs Multilingual v2 ───────────────────────────────────────────────
// Find your voice ID at: elevenlabs.io/voice-library  (filter by Arabic/Multilingual)
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'; // "Adam" multilingual

async function elevenLabsTTS(text, destPath) {
  if (fs.existsSync(destPath)) { console.log('  skip (exists):', path.basename(destPath)); return; }

  const res = await httpPost('api.elevenlabs.io',
    `/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
    { 'Content-Type': 'application/json', 'xi-api-key': API_KEY, 'Accept': 'audio/mpeg' },
    {
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.6, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true },
    }
  );

  // ElevenLabs returns raw binary, not base64
  if (res.status !== 200) {
    console.error('  ElevenLabs error:', res.status, String(res.body).slice(0, 200));
    return;
  }

  // Re-request as raw buffer
  await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.elevenlabs.io',
      path: `/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': API_KEY, 'Accept': 'audio/mpeg' },
    }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => { fs.writeFileSync(destPath, Buffer.concat(chunks)); resolve(); });
    });
    req.on('error', reject);
    req.write(JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.6, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true },
    }));
    req.end();
  });
  console.log('  ✓', path.basename(destPath));
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const tts = PROVIDER === 'elevenlabs' ? elevenLabsTTS : googleTTS;

(async () => {
  console.log(`\n🎙️  Generating audio with ${PROVIDER === 'elevenlabs' ? 'ElevenLabs Multilingual v2' : 'Google TTS Neural2 (ar-XA-Neural2-A)'}`);
  console.log(`📁 Output: ${OUT_LETTERS}\n`);

  // 1. Letters
  console.log('── Arabic Letters (28) ──');
  for (const l of LETTERS) {
    const dest = path.join(OUT_LETTERS, l.file + '.mp3');
    await tts(l.spoken, dest);
    await sleep(PROVIDER === 'elevenlabs' ? 500 : 120); // rate limiting
  }

  // 2. Words
  console.log('\n── Common Words ──');
  const uniqueWords = [...new Set(WORDS)];
  for (const word of uniqueWords) {
    const slug = encodeURIComponent(word);
    const dest = path.join(OUT_WORDS, slug + '.mp3');
    await tts(word, dest);
    await sleep(PROVIDER === 'elevenlabs' ? 500 : 120);
  }

  console.log('\n✅ Done! Place the /audio/ folder at the root of your web server.');
  console.log('   Vercel: drop /audio/ in /public/audio/');
  console.log('   Static: /audio/ next to index.html\n');
})();
