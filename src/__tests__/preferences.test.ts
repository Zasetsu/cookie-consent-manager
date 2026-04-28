import { describe, it, expect, beforeEach } from "vitest";
import { PreferenceService } from "../services/preferences";
import type { CategoryConfig } from "../types";

const categories: CategoryConfig[] = [
  { id: "required", required: true, title: "Required", description: "Required cookies", cookies: [] },
  { id: "analytics", title: "Analytics", description: "Analytics cookies", cookies: [] },
  { id: "marketing", title: "Marketing", description: "Marketing cookies", cookies: [] },
];

function setupCookieJar() {
  const jar: Record<string, string> = {};
  Object.defineProperty(document, "cookie", {
    get: () =>
      Object.entries(jar)
        .map(([k, v]) => `${k}=${v}`)
        .join("; "),
    set: (val: string) => {
      const [pair] = val.split(";");
      const [rawKey, ...rest] = pair.split("=");
      if (rawKey && rest.length > 0) {
        const key = rawKey.trim();
        const value = rest.join("=").trim();
        if (value === "" || val.includes("expires=Thu, 01 Jan 1970")) {
          delete jar[key];
        } else {
          jar[key] = value;
        }
      }
    },
    configurable: true,
  });
  return jar;
}

describe("PreferenceService", () => {
  let prefs: PreferenceService;
  let jar: Record<string, string>;

  beforeEach(() => {
    jar = setupCookieJar();
    prefs = new PreferenceService(
      { path: "/", prefix: "ccm_", expiryDays: 365, sameSite: "Lax", secure: "auto" },
      categories
    );
  });

  it("getDefaultPreferences sets required=true, others=false", () => {
    const defaults = prefs.getDefaultPreferences();
    expect(defaults.required).toBe(true);
    expect(defaults.analytics).toBe(false);
    expect(defaults.marketing).toBe(false);
  });

  it("getValidConsent returns null when no cookies", () => {
    expect(prefs.getValidConsent()).toBeNull();
  });

  it("getValidConsent returns null for corrupt JSON preferences", () => {
    jar["ccm_preferences"] = "not-json";
    jar["ccm_decision"] = "accepted_all";
    expect(prefs.getValidConsent()).toBeNull();
  });

  it("getValidConsent returns null for non-boolean preference values", () => {
    jar["ccm_preferences"] = encodeURIComponent(JSON.stringify({ analytics: "yes" }));
    jar["ccm_decision"] = "accepted_all";
    expect(prefs.getValidConsent()).toBeNull();
  });

  it("getValidConsent returns null for invalid decision", () => {
    jar["ccm_preferences"] = encodeURIComponent(JSON.stringify({ required: true }));
    jar["ccm_decision"] = "invalid";
    expect(prefs.getValidConsent()).toBeNull();
  });

  it("getValidConsent normalizes preferences with category config", () => {
    jar["ccm_preferences"] = encodeURIComponent(JSON.stringify({ analytics: true }));
    jar["ccm_decision"] = "custom";
    const result = prefs.getValidConsent();
    expect(result).not.toBeNull();
    expect(result!.preferences.required).toBe(true);
    expect(result!.preferences.analytics).toBe(true);
    expect(result!.preferences.marketing).toBe(false);
  });

  it("getValidConsent rejects expired policy version", () => {
    const svc = new PreferenceService(
      { path: "/", prefix: "ccm_", expiryDays: 365, sameSite: "Lax", secure: "auto" },
      categories,
      "2.0"
    );
    jar["ccm_preferences"] = encodeURIComponent(JSON.stringify({ required: true }));
    jar["ccm_decision"] = "accepted_all";
    jar["ccm_policy_version"] = "1.0";
    expect(svc.getValidConsent()).toBeNull();
  });

  it("getValidConsent accepts matching policy version", () => {
    const svc = new PreferenceService(
      { path: "/", prefix: "ccm_", expiryDays: 365, sameSite: "Lax", secure: "auto" },
      categories,
      "2.0"
    );
    jar["ccm_preferences"] = encodeURIComponent(JSON.stringify({ required: true, analytics: true }));
    jar["ccm_decision"] = "accepted_all";
    jar["ccm_policy_version"] = "2.0";
    const result = svc.getValidConsent();
    expect(result).not.toBeNull();
    expect(result!.decision).toBe("accepted_all");
  });

  it("save writes cookies and returns payload", () => {
    const payload = prefs.save("accepted_all", { required: true, analytics: true, marketing: true });
    expect(payload.decision).toBe("accepted_all");
    expect(payload.preferences.analytics).toBe(true);
    expect(payload.acceptedCategories).toContain("analytics");
    expect(payload.savedAt).toBeDefined();
    expect(jar["ccm_decision"]).toBeDefined();
    expect(jar["ccm_preferences"]).toBeDefined();
    expect(jar["ccm_saved_at"]).toBeDefined();
  });

  it("clear removes all cookies", () => {
    prefs.save("accepted_all", { required: true, analytics: true, marketing: true });
    expect(prefs.hasStoredConsentCookies()).toBe(true);
    prefs.clear();
    expect(prefs.hasStoredConsentCookies()).toBe(false);
  });

  it("hasStoredConsentCookies returns true even with corrupt cookies", () => {
    jar["ccm_preferences"] = "garbage";
    jar["ccm_decision"] = "accepted_all";
    expect(prefs.hasStoredConsentCookies()).toBe(true);
    expect(prefs.getValidConsent()).toBeNull();
  });
});
