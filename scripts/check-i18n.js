import fs from 'fs';
import path from 'path';

const LOCALES_DIR = path.resolve('client/src/locales');
const SRC_DIR = path.resolve('client/src');
const EN_PATH = path.join(LOCALES_DIR, 'en.json');

const BRAND_ALLOWLIST = new Set([
  'KisanMitra',
  'KisanMitra AI',
  'Open-Meteo',
  '1800-180-1551',
  'Gemini AI',
  'mm',
  'cm',
  'km',
  'kg',
  '₹',
  '°C',
  '•'
]);

function isAllowlisted(val) {
  if (!val || typeof val !== 'string') return true;
  const stripped = val.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '').trim();
  if (!stripped) return true;
  if (BRAND_ALLOWLIST.has(stripped) || BRAND_ALLOWLIST.has(val.trim())) return true;
  // Ignore if contains no alphabetic characters (e.g. symbols, punctuation, numbers)
  if (!/[a-zA-Z]/.test(stripped)) return true;
  // Ignore purely template variables like {{name}} or {{count}}
  if (/^(\{\{[a-zA-Z0-9_]+\}\}|\s|[0-9.,:;/\-•₹°C%#+*!?()|&])*$/.test(stripped)) return true;
  return false;
}

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

function checkMissingAndIdenticalKeys() {
  console.log('=== Checking Locale Completeness & Translations ===');
  if (!fs.existsSync(EN_PATH)) {
    console.error('en.json not found!');
    return 1;
  }

  const enFlat = flattenKeys(JSON.parse(fs.readFileSync(EN_PATH, 'utf8')));
  const enTotal = Object.keys(enFlat).length;
  console.log(`Reference (en.json): ${enTotal} keys.\n`);

  const files = fs.readdirSync(LOCALES_DIR).filter((f) => f.endsWith('.json') && f !== 'en.json');
  let issuesCount = 0;

  for (const file of files) {
    const code = file.replace('.json', '');
    const data = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, file), 'utf8'));
    const flat = flattenKeys(data);

    const missing = [];
    const identical = [];

    for (const [key, enVal] of Object.entries(enFlat)) {
      if (flat[key] === undefined || flat[key] === null) {
        missing.push(key);
      } else if (typeof flat[key] === 'string' && flat[key].trim() === enVal.trim() && !isAllowlisted(enVal)) {
        identical.push({ key, val: flat[key] });
      }
    }

    if (missing.length > 0) {
      issuesCount += missing.length;
      console.log(`❌ ${file}: Missing ${missing.length} keys:`);
      missing.slice(0, 5).forEach((k) => console.log(`   - ${k}`));
      if (missing.length > 5) console.log(`   ...and ${missing.length - 5} more`);
    }

    if (identical.length > 0) {
      issuesCount += identical.length;
      console.log(`⚠️  ${file}: ${identical.length} values identical to English:`);
      identical.slice(0, 5).forEach((item) => console.log(`   - ${item.key}: "${item.val}"`));
      if (identical.length > 5) console.log(`   ...and ${identical.length - 5} more`);
    }

    if (missing.length === 0 && identical.length === 0) {
      console.log(`✓ ${file}: 100% complete and localized (${Object.keys(flat).length}/${enTotal})`);
    }
  }

  return issuesCount;
}

function checkHardcodedStringsInJSX() {
  console.log('\n=== Scanning JSX for Untranslated Strings & Attributes ===');
  const filesToScan = [];

  function collectFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory() && e.name !== 'node_modules' && e.name !== 'dist') {
        collectFiles(full);
      } else if (e.isFile() && e.name.endsWith('.jsx')) {
        filesToScan.push(full);
      }
    }
  }

  collectFiles(SRC_DIR);

  let flaggedCount = 0;

  for (const file of filesToScan) {
    const relPath = path.relative(process.cwd(), file);
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      const lineNum = idx + 1;

      // Ignore comments and pure imports
      if (
        trimmed.startsWith('//') ||
        trimmed.startsWith('/*') ||
        trimmed.startsWith('*') ||
        trimmed.startsWith('{/*') ||
        trimmed.startsWith('import ')
      ) {
        return;
      }

      // 1. Check string literals passed to alert/confirm/toast/setError/setMessage
      const fnRegex = /\b(alert|confirm|toast(?:\.[a-zA-Z]+)?|setError|setMessage)\s*\(\s*(['"`])([^'"`]+)\2\s*[\),]/g;
      let fnMatch;
      while ((fnMatch = fnRegex.exec(line)) !== null) {
        const fnName = fnMatch[1];
        const strVal = fnMatch[3].trim();
        // Ignore SCREAMING_SNAKE_CASE error codes like 'INVALID_PHONE'
        if (strVal && !/^[A-Z0-9_]+$/.test(strVal) && !isAllowlisted(strVal)) {
          console.warn(`⚠️  ${relPath}:${lineNum} -> Call ${fnName}("${strVal}") is a hardcoded string`);
          flaggedCount++;
        }
      }

      // 2. Check hardcoded attributes: placeholder, title, alt, aria-label
      const attrRegex = /\b(placeholder|title|alt|aria-label)=["']([^"']+)["']/g;
      let attrMatch;
      while ((attrMatch = attrRegex.exec(line)) !== null) {
        const attrName = attrMatch[1];
        const strVal = attrMatch[2].trim();
        if (strVal && !isAllowlisted(strVal)) {
          console.warn(`⚠️  ${relPath}:${lineNum} -> Attribute ${attrName}="${strVal}" is a hardcoded string`);
          flaggedCount++;
        }
      }

      // 3. Check JSX text nodes between tags or braces: >Text< or >Text{ or }Text<
      // Strip out attributes and tags first to avoid false positives in tag attributes
      const sanitizedLine = line.replace(/=>/g, ' ').replace(/>=/g, ' ').replace(/<=/g, ' ');
      const textMatches = [
        ...sanitizedLine.matchAll(/>([^<>{}\n]+)</g),
        ...sanitizedLine.matchAll(/>([^<>{}\n]+)\{/g),
        ...sanitizedLine.matchAll(/\}([^<>{}\n]+)</g)
      ];

      for (const m of textMatches) {
        const text = m[1].trim();
        if (text && !isAllowlisted(text) && /[a-zA-Z]{2,}/.test(text)) {
          // Verify it's not a common JSX formatting artifact
          console.warn(`⚠️  ${relPath}:${lineNum} -> JSX text: "${text}"`);
          flaggedCount++;
        }
      }
    });
  }

  if (flaggedCount === 0) {
    console.log('✓ No hardcoded JSX text or attributes found.');
  } else {
    console.log(`Found ${flaggedCount} potential untranslated strings in JSX.`);
  }

  return flaggedCount;
}

const localeIssues = checkMissingAndIdenticalKeys();
const jsxIssues = checkHardcodedStringsInJSX();
const exitCode = (localeIssues === 0 && jsxIssues === 0) ? 0 : 1;
process.exit(exitCode);
