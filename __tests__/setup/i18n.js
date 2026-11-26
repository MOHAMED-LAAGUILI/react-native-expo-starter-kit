/**
 * Boots i18next with the real English resources, so components render the
 * same strings users see and a missing key shows up as the raw key in a
 * failing assertion. `src/i18n/index.ts` is not used here: it reads MMKV and
 * native locale modules that don't exist under Jest.
 */
const fs = require('node:fs');
const path = require('node:path');
const i18n = require('i18next').default ?? require('i18next');
const { initReactI18next } = require('react-i18next');

const localesDir = path.join(__dirname, '../../src/i18n/locales/en');
const namespaces = fs.readdirSync(localesDir).filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, ''));
const en = Object.fromEntries(namespaces.map(ns => [ns, require(path.join(localesDir, `${ns}.json`))]));

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    ns: namespaces,
    defaultNS: 'common',
    resources: { en },
    interpolation: { escapeValue: false },
    initAsync: false,
  });
}
