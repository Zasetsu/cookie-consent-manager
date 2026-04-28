import type {
  CookieConsentConfig,
  InternalConfig,
  ConsentPayload,
  ConsentDecision,
} from "./types";
import { buildConfig } from "./defaults";
import { getTranslation } from "./i18n";
import { PreferenceService } from "./services/preferences";
import type { StoredConsent } from "./services/preferences";
import { generateCSS } from "./templates/styles";
import { createBanner } from "./templates/banner";
import { createModal } from "./templates/modal";
import { injectStyle, removeInjectedStyle } from "./utils/dom";

const STYLE_ID = "ccm-styles";
const ROOT_ID = "ccm-root";

export class CookieConsent {
  private config: InternalConfig;
  private prefs: PreferenceService;
  private root: HTMLElement | null = null;
  private modalDestroy: (() => void) | null = null;
  private initialized = false;
  private triggerElement: HTMLElement | null = null;

  constructor(userConfig: CookieConsentConfig) {
    this.config = buildConfig(userConfig);
    this.prefs = new PreferenceService(
      {
        domain: this.config.domain,
        path: this.config.path,
        prefix: this.config.cookiePrefix,
        expiryDays: this.config.cookieExpiry,
        sameSite: this.config.sameSite,
        secure: this.config.secure,
      },
      this.config.categories,
      this.config.policyVersion
    );
  }

  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    this.injectStyles();

    const stored = this.prefs.getValidConsent();
    if (stored) {
      this.fire("onReady", this.buildPayloadFromStored(stored));
    } else {
      if (this.prefs.hasStoredConsentCookies()) {
        this.prefs.clear();
      }
      this.fire("onReady", null);
      this.showBanner({ focusFirstAction: false });
    }
  }

  destroy(): void {
    this.removeRoot();
    removeInjectedStyle(STYLE_ID);
    document.body.classList.remove("ccm-body-lock");
    this.initialized = false;
  }

  setLanguage(lang: string): void {
    this.config.language = lang;
    if (!this.initialized) return;
    this.removeRoot();
    document.body.classList.remove("ccm-body-lock");

    const stored = this.prefs.getValidConsent();
    if (stored) {
      this.fire("onReady", this.buildPayloadFromStored(stored));
    } else {
      this.showBanner({ focusFirstAction: false });
    }
  }

  getPreferences(): Record<string, boolean> | null {
    const stored = this.prefs.getValidConsent();
    return stored ? stored.preferences : null;
  }

  reset(): void {
    this.prefs.clear();
    this.removeRoot();
    document.body.classList.remove("ccm-body-lock");
    this.showBanner({ focusFirstAction: true });
  }

  private injectStyles(): void {
    const css = generateCSS(this.config.theme);
    injectStyle(
      css,
      STYLE_ID,
      this.config.styleMode,
      this.config.styleNonce
    );
  }

  private showBanner(options?: { focusFirstAction?: boolean }): void {
    this.removeRoot();

    const t = getTranslation(this.config.language, this.config.translations);
    const { root } = createBanner(
      t,
      this.config.policyUrl,
      this.config.theme.position,
      {
        onAcceptAll: () => this.handleAcceptAll(),
        onRejectAll: () => this.handleRejectAll(),
        onManage: (triggerEl) => this.showModal(triggerEl),
      }
    );

    this.root = root;
    this.root.id = ROOT_ID;
    document.body.appendChild(this.root);

    if (options?.focusFirstAction) {
      requestAnimationFrame(() => {
        const firstBtn = this.root?.querySelector<HTMLElement>(".ccm-btn");
        if (firstBtn) firstBtn.focus();
      });
    }
  }

  private showModal(trigger: HTMLElement | null): void {
    this.removeRoot();
    this.triggerElement = trigger;
    document.body.classList.add("ccm-body-lock");

    const t = getTranslation(this.config.language, this.config.translations);
    const stored = this.prefs.getValidConsent();
    const currentPrefs = stored ? stored.preferences : this.prefs.getDefaultPreferences();

    const { root, destroy } = createModal(
      t,
      this.config.language,
      this.config.categories,
      currentPrefs,
      this.config.theme,
      this.config.policyUrl,
      this.triggerElement,
      {
        onAcceptAll: () => this.handleAcceptAll(),
        onRejectAll: () => this.handleRejectAll(),
        onSavePreferences: (prefs) => this.handleCustom(prefs),
        onClose: () => {
          this.removeRoot();
          document.body.classList.remove("ccm-body-lock");
          if (!this.prefs.getValidConsent()) {
            this.showBanner({ focusFirstAction: true });
          }
        },
      }
    );

    this.root = root;
    this.root.id = ROOT_ID;
    this.modalDestroy = destroy;
    document.body.appendChild(this.root);
  }

  private handleAcceptAll(): void {
    const prefs: Record<string, boolean> = {};
    for (const cat of this.config.categories) {
      prefs[cat.id] = true;
    }
    this.saveAndClose("accepted_all", prefs, "onAccept");
  }

  private handleRejectAll(): void {
    const prefs = this.prefs.getDefaultPreferences();
    this.saveAndClose("rejected_all", prefs, "onReject");
  }

  private handleCustom(prefs: Record<string, boolean>): void {
    for (const cat of this.config.categories) {
      if (cat.required) prefs[cat.id] = true;
    }
    this.saveAndClose("custom", prefs, "onChange");
  }

  private saveAndClose(
    decision: ConsentDecision,
    prefs: Record<string, boolean>,
    specificCallback: "onAccept" | "onReject" | "onChange"
  ): void {
    const payload = this.prefs.save(decision, prefs);
    this.removeRoot();
    document.body.classList.remove("ccm-body-lock");
    this.fire("onSave", payload);
    this.fire(specificCallback, payload);
  }

  private removeRoot(): void {
    if (this.modalDestroy) {
      this.modalDestroy();
      this.modalDestroy = null;
    }
    if (this.root) {
      this.root.remove();
      this.root = null;
    }
  }

  private buildPayloadFromStored(stored: StoredConsent): ConsentPayload {
    const accepted: string[] = [];
    const rejected: string[] = [];
    for (const [id, val] of Object.entries(stored.preferences)) {
      if (val) accepted.push(id);
      else rejected.push(id);
    }
    return {
      decision: stored.decision,
      preferences: stored.preferences,
      acceptedCategories: accepted,
      rejectedCategories: rejected,
      savedAt: stored.savedAt,
      policyVersion: stored.policyVersion,
    };
  }

  private fire(
    name: "onReady" | "onSave" | "onAccept" | "onReject" | "onChange",
    payload: ConsentPayload | null
  ): void {
    const cb = this.config[name];
    if (cb) cb(payload as any);
  }
}
