import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.resolve('server/.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = (match[2] || '').trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[match[1]] = val;
      }
    }
  }
}
loadEnv();

const LOCALES_DIR = path.resolve('client/src/locales');
const EN_PATH = path.join(LOCALES_DIR, 'en.json');

const LANGUAGES = [
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'mr', name: 'Marathi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'or', name: 'Odia' },
];

function flattenKeys(obj, prefix = '') {
  let res = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      Object.assign(res, flattenKeys(v, key));
    } else {
      res[key] = v;
    }
  }
  return res;
}

function unflattenKeys(flat) {
  const result = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.');
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      current[parts[i]] = current[parts[i]] || {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }
  return result;
}

async function translateBatchWithGemini(missingMap, targetLang) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = 'gemini-2.5-flash-lite';

  if (!apiKey) {
    console.warn(`[!] No GEMINI_API_KEY found in server/.env. Skipping API translation for ${targetLang.name}.`);
    return {};
  }

  const prompt = `You are a professional agricultural translator for rural Indian farmers.
Translate the following English UI strings into ${targetLang.name}.
RULES:
1. Return ONLY valid JSON with identical keys.
2. Keep all {{variables}} like {{name}}, {{count}}, {{yield}} EXACTLY as they are.
3. Keep HTML tags or emoji untouched.
4. Use simple, natural everyday words that small/marginal farmers easily understand (no complex academic jargon).
Strings to translate:
${JSON.stringify(missingMap, null, 2)}`;

  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        let raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        raw = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
        return JSON.parse(raw);
      } else if (response.status === 429 || response.status === 503) {
        const waitSec = attempt * 5;
        console.warn(`Rate limited (${response.status}) for ${targetLang.name}, waiting ${waitSec}s (attempt ${attempt}/6)...`);
        await new Promise((r) => setTimeout(r, waitSec * 1000));
      } else {
        const errTxt = await response.text();
        console.warn(`Gemini error (${response.status}) for ${targetLang.name}:`, errTxt.slice(0, 100));
        return {};
      }
    } catch (err) {
      console.warn(`Translation request failed for ${targetLang.name} (attempt ${attempt}):`, err.message);
      await new Promise((r) => setTimeout(r, 4000));
    }
  }
  return {};
}

async function main() {
  if (!fs.existsSync(EN_PATH)) {
    console.error('en.json not found!');
    process.exit(1);
  }

  const enRaw = JSON.parse(fs.readFileSync(EN_PATH, 'utf8'));
  const enFlat = flattenKeys(enRaw);
  console.log(`Found ${Object.keys(enFlat).length} source keys in en.json\n`);

  for (const lang of LANGUAGES) {
    const langPath = path.join(LOCALES_DIR, `${lang.code}.json`);
    let targetRaw = {};
    if (fs.existsSync(langPath)) {
      try {
        targetRaw = JSON.parse(fs.readFileSync(langPath, 'utf8'));
      } catch (e) {
        targetRaw = {};
      }
    }

    const targetFlat = flattenKeys(targetRaw);
    const missingKeys = {};

    for (const [key, value] of Object.entries(enFlat)) {
      if (!targetFlat[key] || targetFlat[key] === value) {
        // Missing or unchanged placeholder
        missingKeys[key] = value;
      }
    }

    const missingCount = Object.keys(missingKeys).length;
    if (missingCount === 0) {
      console.log(`✓ ${lang.name} (${lang.code}): all keys present.`);
      continue;
    }

    console.log(`Translating ${missingCount} missing keys for ${lang.name} (${lang.code})...`);
    const translated = await translateBatchWithGemini(missingKeys, lang);

    // Merge translated keys, preserving existing translations
    for (const [key, val] of Object.entries(translated)) {
      if (val && typeof val === 'string' && val.trim()) {
        targetFlat[key] = val.trim();
      }
    }

    const finalTree = unflattenKeys(targetFlat);
    fs.writeFileSync(langPath, JSON.stringify(finalTree, null, 2), 'utf8');
    console.log(`Updated ${lang.code}.json\n`);
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log('✓ Locale translation batch complete.');
}

main().catch(console.error);
