import { describe, it, expect } from "vitest";
import { getTranslation, resolveLocalizedString } from "../i18n";
import type { TranslationSet } from "../types";

const fullTr: TranslationSet = {
  banner: { description: "TR desc", acceptAll: "Kabul", rejectAll: "Reddet", manage: "Yönet", ariaLabel: "Çerez onayı" },
  modal: {
    title: "Tercihler", requiredNote: "Gerekli", optionalNote: "Opsiyonel",
    savePreferences: "Kaydet", acceptAll: "Kabul", rejectAll: "Reddet",
    policyLink: "Politika", policyClick: "Tıkla", policyDocument: "Metin", close: "Kapat",
  },
  table: {
    cookieName: "Ad", provider: "Sağlayıcı", description: "Tanım", purpose: "Amaç",
    expiry: "Süre", party: "Taraf", firstParty: "1. Taraf", thirdParty: "3. Taraf",
    session: "Oturum", permanent: "Kalıcı",
  },
};

describe("i18n", () => {
  it("returns built-in tr translation", () => {
    const t = getTranslation("tr", {});
    expect(t.banner.acceptAll).toBe("Tümünü Kabul Et");
  });

  it("returns built-in en translation", () => {
    const t = getTranslation("en", {});
    expect(t.banner.acceptAll).toBe("Accept All");
  });

  it("falls back to en for unknown language", () => {
    const t = getTranslation("de", {});
    expect(t.banner.acceptAll).toBe("Accept All");
  });

  it("deep merges user override", () => {
    const t = getTranslation("tr", {
      tr: { banner: { acceptAll: "Hepsini Kabul Et" } },
    });
    expect(t.banner.acceptAll).toBe("Hepsini Kabul Et");
    expect(t.banner.rejectAll).toBe("Tümünü Reddet");
  });

  it("supports full new language via translations", () => {
    const t = getTranslation("xx", {
      xx: fullTr,
    });
    expect(t.banner.acceptAll).toBe("Kabul");
    expect(t.modal.title).toBe("Tercihler");
  });
});

describe("resolveLocalizedString", () => {
  it("returns string directly", () => {
    expect(resolveLocalizedString("hello", "tr")).toBe("hello");
  });

  it("resolves by language key", () => {
    expect(resolveLocalizedString({ tr: "Merhaba", en: "Hello" }, "tr")).toBe("Merhaba");
    expect(resolveLocalizedString({ tr: "Merhaba", en: "Hello" }, "en")).toBe("Hello");
  });

  it("falls back to first value for unknown key", () => {
    expect(resolveLocalizedString({ tr: "Merhaba" }, "de")).toBe("Merhaba");
  });
});
