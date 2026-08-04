import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { NativeModules } from 'react-native';
import { STORAGE_KEYS } from '@/config/constants';
import { StorageService } from '@/storage';
import { isAndroid, isIOS } from '@/utils/platform';
import enAudio from './locales/en/audio.json';
import enAuth from './locales/en/auth.json';
import enCommon from './locales/en/common.json';
import enPostDetail from './locales/en/post-detail.json';
import enPreferences from './locales/en/preferences.json';
import enSearch from './locales/en/search.json';
import enSettings from './locales/en/settings.json';
import enUserMenu from './locales/en/user-menu.json';
import frAudio from './locales/fr/audio.json';
import frAuth from './locales/fr/auth.json';
import frCommon from './locales/fr/common.json';
import frPostDetail from './locales/fr/post-detail.json';
import frPreferences from './locales/fr/preferences.json';
import frSearch from './locales/fr/search.json';
import frSettings from './locales/fr/settings.json';
import frUserMenu from './locales/fr/user-menu.json';

const resources = {
  en: { 'audio': enAudio, 'auth': enAuth, 'common': enCommon, 'post-detail': enPostDetail, 'preferences': enPreferences, 'search': enSearch, 'settings': enSettings, 'user-menu': enUserMenu },
  fr: { 'audio': frAudio, 'auth': frAuth, 'common': frCommon, 'post-detail': frPostDetail, 'preferences': frPreferences, 'search': frSearch, 'settings': frSettings, 'user-menu': frUserMenu },
};

function getDeviceLanguage(): string {
  try {
    let locale = 'en';
    if (isIOS) {
      locale
        = NativeModules.SettingsManager?.settings?.AppleLocale
          ?? NativeModules.SettingsManager?.settings?.AppleLanguages?.[0]
          ?? 'en';
    }
    else if (isAndroid) {
      locale = NativeModules.I18nManager?.localeIdentifier ?? 'en';
    }
    return locale.split('-')[0] ?? 'en';
  }
  catch {
    return 'en';
  }
}

export function changeLanguage(lang: string): void {
  try {
    StorageService.i18n.setItem(STORAGE_KEYS.LANGUAGE, lang);
  }
  catch {}

  i18next.changeLanguage(lang);
}

export async function setupI18n(): Promise<void> {
  let initialLanguage = getDeviceLanguage();

  try {
    const persisted = StorageService.i18n.getItem<string>(STORAGE_KEYS.LANGUAGE);
    if (persisted)
      initialLanguage = persisted;
  }
  catch {}

  await i18next.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    defaultNS: 'common',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    lng: initialLanguage,
    ns: ['common', 'auth', 'audio', 'post-detail', 'preferences', 'search', 'settings', 'user-menu'],
    resources,
  });
}

export default i18next;
