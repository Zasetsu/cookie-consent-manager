import type { ConsentDecision, ConsentPayload, CategoryConfig, CookieOptions } from "../types";
import { CookieService } from "./cookie";

export interface StoredConsent {
  decision: ConsentDecision;
  preferences: Record<string, boolean>;
  savedAt: string;
  policyVersion?: string;
}

export class PreferenceService {
  private cookie: CookieService;
  private categories: CategoryConfig[];
  private policyVersion?: string;

  constructor(options: CookieOptions, categories: CategoryConfig[], policyVersion?: string) {
    this.cookie = new CookieService(options);
    this.categories = categories;
    this.policyVersion = policyVersion;
  }

  getDefaultPreferences(): Record<string, boolean> {
    const prefs: Record<string, boolean> = {};
    for (const cat of this.categories) {
      prefs[cat.id] = cat.required === true;
    }
    return prefs;
  }

  getValidConsent(): StoredConsent | null {
    const decision = this.getDecision();
    if (!decision) return null;

    const rawPrefs = this.cookie.get("preferences");
    if (!rawPrefs) return null;

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawPrefs);
    } catch {
      return null;
    }
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
    for (const v of Object.values(parsed as Record<string, unknown>)) {
      if (typeof v !== "boolean") return null;
    }

    const preferences: Record<string, boolean> = {};
    for (const cat of this.categories) {
      if (cat.required) {
        preferences[cat.id] = true;
      } else {
        preferences[cat.id] = (parsed as Record<string, boolean>)[cat.id] === true;
      }
    }

    if (this.policyVersion) {
      const savedVersion = this.cookie.get("policy_version");
      if (savedVersion !== this.policyVersion) return null;
    }

    const savedAt = this.cookie.get("saved_at") || new Date().toISOString();

    return {
      decision,
      preferences,
      savedAt,
      policyVersion: this.policyVersion,
    };
  }

  hasStoredConsentCookies(): boolean {
    return this.cookie.has("decision") || this.cookie.has("preferences");
  }

  save(decision: ConsentDecision, preferences: Record<string, boolean>): ConsentPayload {
    const savedAt = new Date().toISOString();
    this.cookie.set("decision", decision);
    this.cookie.set("preferences", JSON.stringify(preferences));
    this.cookie.set("saved_at", savedAt);
    if (this.policyVersion) {
      this.cookie.set("policy_version", this.policyVersion);
    }
    return this.buildPayload(decision, preferences, savedAt);
  }

  getPreferences(): Record<string, boolean> | null {
    const raw = this.cookie.get("preferences");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  getDecision(): ConsentDecision | null {
    const val = this.cookie.get("decision");
    if (val === "accepted_all" || val === "rejected_all" || val === "custom") return val;
    return null;
  }

  clear(): void {
    this.cookie.remove("decision");
    this.cookie.remove("preferences");
    this.cookie.remove("saved_at");
    this.cookie.remove("policy_version");
  }

  private buildPayload(decision: ConsentDecision, preferences: Record<string, boolean>, savedAt: string): ConsentPayload {
    const accepted: string[] = [];
    const rejected: string[] = [];
    for (const [id, val] of Object.entries(preferences)) {
      if (val) accepted.push(id);
      else rejected.push(id);
    }
    return {
      decision,
      preferences,
      acceptedCategories: accepted,
      rejectedCategories: rejected,
      savedAt,
      policyVersion: this.policyVersion,
    };
  }
}
