import { CookieConsent } from "./CookieConsent";
import type { CookieConsentConfig, ConsentPayload, CategoryConfig, TranslationSet } from "./types";

export type { CookieConsentConfig, ConsentPayload, CategoryConfig, TranslationSet };

let instance: CookieConsent | null = null;

const API = {
  init(config: CookieConsentConfig): CookieConsent {
    if (instance) {
      instance.destroy();
    }
    instance = new CookieConsent(config);
    instance.init();
    return instance;
  },

  destroy(): void {
    if (instance) {
      instance.destroy();
      instance = null;
    }
  },

  setLanguage(lang: string): void {
    if (instance) {
      instance.setLanguage(lang);
    }
  },

  getPreferences(): Record<string, boolean> | null {
    return instance ? instance.getPreferences() : null;
  },

  reset(): void {
    if (instance) {
      instance.reset();
    }
  },
};

export default API;
