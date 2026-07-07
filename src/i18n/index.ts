import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { NativeModules } from "react-native";
import { STORAGE_KEYS } from "@/config/constants";
import { StorageService } from "@/storage";
import { isAndroid, isIOS } from "@/utils/platform";
import enAuth from "./locales/en/auth.json";
import enCommon from "./locales/en/common.json";
import frAuth from "./locales/fr/auth.json";
import frCommon from "./locales/fr/common.json";

const resources = {
  en: { auth: enAuth, common: enCommon },
  fr: { auth: frAuth, common: frCommon },
};

function getDeviceLanguage(): string {
  try {
    let locale = "en";
    if (isIOS) {
      locale =
        NativeModules.SettingsManager?.settings?.AppleLocale ??
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ??
        "en";
    } else if (isAndroid) {
      locale = NativeModules.I18nManager?.localeIdentifier ?? "en";
    }
    return locale.split("-")[0] ?? "en";
  } catch {
    return "en";
  }
}

export function changeLanguage(lang: string): void {
  try {
    StorageService.setString(STORAGE_KEYS.LANGUAGE, lang);
  } catch {}

  i18next.changeLanguage(lang);
}

export async function setupI18n(): Promise<void> {
  let initialLanguage = getDeviceLanguage();

  try {
    const persisted = StorageService.getString(STORAGE_KEYS.LANGUAGE);
    if (persisted) initialLanguage = persisted;
  } catch {}

  await i18next.use(initReactI18next).init({
    compatibilityJSON: "v4",
    defaultNS: "common",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    lng: initialLanguage,
    ns: ["common", "auth"],
    resources,
  });
}

export default i18next;
