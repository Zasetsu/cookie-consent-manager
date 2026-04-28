import { describe, it, expect, beforeEach } from "vitest";
import { createBanner } from "../templates/banner";
import { createModal } from "../templates/modal";
import type { TranslationSet, CategoryConfig, ThemeConfig } from "../types";
import { generateCSS } from "../templates/styles";

const tr: TranslationSet = {
  banner: {
    description: "We use cookies. {policyLink}",
    acceptAll: "Accept All",
    rejectAll: "Reject All",
    manage: "Manage",
    ariaLabel: "Cookie consent",
  },
  modal: {
    title: "Preferences",
    requiredNote: "Required",
    optionalNote: "Optional",
    savePreferences: "Save",
    acceptAll: "Accept All",
    rejectAll: "Reject All",
    policyLink: "Policy",
    policyClick: "Click",
    policyDocument: "Policy Doc",
    close: "Close",
  },
  table: {
    cookieName: "Name",
    provider: "Provider",
    description: "Desc",
    purpose: "Purpose",
    expiry: "Expiry",
    party: "Party",
    firstParty: "1st",
    thirdParty: "3rd",
    session: "Session",
    permanent: "Permanent",
  },
};

const categories: CategoryConfig[] = [
  { id: "required", required: true, title: "Required", description: "Req", cookies: [] },
  { id: "analytics", title: "Analytics", description: "Anl", cookies: [] },
];

const defaultTheme: ThemeConfig & { headerImage: string } = {
  headerImage: "none",
};

describe("Banner render", () => {
  it("renders banner root without overlay class", () => {
    const { root } = createBanner(tr, undefined, "bottom", {
      onAcceptAll: () => {},
      onRejectAll: () => {},
      onManage: () => {},
    });
    expect(root.classList.contains("ccm-root")).toBe(true);
    expect(root.classList.contains("ccm-overlay")).toBe(false);
    const banner = root.querySelector(".ccm-banner");
    expect(banner).not.toBeNull();
  });

  it("banner has role=region with localized aria-label", () => {
    const { root } = createBanner(tr, undefined, "bottom", {
      onAcceptAll: () => {},
      onRejectAll: () => {},
      onManage: () => {},
    });
    const banner = root.querySelector(".ccm-banner")!;
    expect(banner.getAttribute("role")).toBe("region");
    expect(banner.getAttribute("aria-label")).toBe("Cookie consent");
  });

  it("banner buttons fire callbacks", () => {
    const clicks: string[] = [];
    const { root } = createBanner(tr, undefined, "bottom", {
      onAcceptAll: () => clicks.push("accept"),
      onRejectAll: () => clicks.push("reject"),
      onManage: () => clicks.push("manage"),
    });
    const buttons = root.querySelectorAll("button");
    expect(buttons.length).toBe(3);
    buttons[0].click();
    buttons[1].click();
    buttons[2].click();
    expect(clicks).toEqual(["accept", "reject", "manage"]);
  });
});

describe("Modal render", () => {
  it("renders modal with dialog role and aria-modal", () => {
    const { root } = createModal(
      tr, "en", categories, {}, defaultTheme, undefined, null,
      { onAcceptAll: () => {}, onRejectAll: () => {}, onSavePreferences: () => {}, onClose: () => {} }
    );
    const dialog = root.querySelector(".ccm-modal__dialog");
    expect(dialog).not.toBeNull();
    expect(dialog!.getAttribute("role")).toBe("dialog");
    expect(dialog!.getAttribute("aria-modal")).toBe("true");
  });

  it("modal close button has localized aria-label", () => {
    const { root } = createModal(
      tr, "en", categories, {}, defaultTheme, undefined, null,
      { onAcceptAll: () => {}, onRejectAll: () => {}, onSavePreferences: () => {}, onClose: () => {} }
    );
    const closeBtn = root.querySelector(".ccm-modal__close") as HTMLButtonElement;
    expect(closeBtn).not.toBeNull();
    expect(closeBtn.getAttribute("aria-label")).toBe("Close");
  });

  it("modal toggles reflect current preferences", () => {
    const prefs = { required: true, analytics: true };
    const { root } = createModal(
      tr, "en", categories, prefs, defaultTheme, undefined, null,
      { onAcceptAll: () => {}, onRejectAll: () => {}, onSavePreferences: () => {}, onClose: () => {} }
    );
    const toggle = root.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(toggle).not.toBeNull();
    expect(toggle.checked).toBe(true);
  });

  it("destroy removes event listeners without error", () => {
    const { destroy } = createModal(
      tr, "en", categories, {}, defaultTheme, undefined, null,
      { onAcceptAll: () => {}, onRejectAll: () => {}, onSavePreferences: () => {}, onClose: () => {} }
    );
    expect(() => destroy()).not.toThrow();
  });

  it("save button collects correct preferences", () => {
    const collected: Record<string, boolean>[] = [];
    const { root } = createModal(
      tr, "en", categories, { required: true, analytics: false }, defaultTheme, undefined, null,
      {
        onAcceptAll: () => {},
        onRejectAll: () => {},
        onSavePreferences: (prefs) => collected.push(prefs),
        onClose: () => {},
      }
    );
    const saveBtn = root.querySelector(".ccm-btn--save") as HTMLButtonElement;
    saveBtn.click();
    expect(collected.length).toBe(1);
    expect(collected[0].required).toBe(true);
    expect(collected[0].analytics).toBe(false);
  });
});

describe("CSS generation", () => {
  it("does not contain .ccm-overlay rule", () => {
    const css = generateCSS({ primaryColor: "#1a73e8", textColor: "#333", backgroundColor: "#fff", borderRadius: "12px", position: "bottom", headerImage: "none" });
    expect(css).not.toContain(".ccm-overlay {");
  });

  it("contains .ccm-banner and .ccm-modal rules", () => {
    const css = generateCSS({ primaryColor: "#1a73e8", textColor: "#333", backgroundColor: "#fff", borderRadius: "12px", position: "bottom", headerImage: "none" });
    expect(css).toContain(".ccm-banner {");
    expect(css).toContain(".ccm-modal {");
  });
});

describe("SameSite=None cookie string", () => {
  let rawCookie: string;

  beforeEach(() => {
    rawCookie = "";
    const jar: Record<string, string> = {};
    Object.defineProperty(document, "cookie", {
      get: () =>
        Object.entries(jar)
          .map(([k, v]) => `${k}=${v}`)
          .join("; "),
      set: (val: string) => {
        rawCookie = val;
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
  });

  it("SameSite=None forces Secure in cookie string", async () => {
    const { CookieService } = await import("../services/cookie");
    const svc = new CookieService({
      path: "/",
      prefix: "ccm_",
      expiryDays: 365,
      sameSite: "None",
      secure: false,
    });
    svc.set("test", "value");
    expect(rawCookie).toContain("SameSite=None");
    expect(rawCookie).toContain("Secure");
  });

  it("SameSite=Lax does not add Secure when secure=false", async () => {
    const { CookieService } = await import("../services/cookie");
    const svc = new CookieService({
      path: "/",
      prefix: "ccm_",
      expiryDays: 365,
      sameSite: "Lax",
      secure: false,
    });
    svc.set("test", "value");
    expect(rawCookie).toContain("SameSite=Lax");
    expect(rawCookie).not.toContain("Secure");
  });
});
