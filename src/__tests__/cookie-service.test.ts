import { describe, it, expect, beforeEach } from "vitest";
import { CookieService } from "../services/cookie";

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

describe("CookieService", () => {
  let jar: Record<string, string>;

  beforeEach(() => {
    jar = setupCookieJar();
  });

  it("writes and reads a cookie", () => {
    const svc = new CookieService({
      path: "/",
      prefix: "ccm_",
      expiryDays: 365,
      sameSite: "Lax",
      secure: "auto",
    });
    svc.set("decision", "accepted_all");
    expect(svc.get("decision")).toBe("accepted_all");
  });

  it("prefixes cookie names", () => {
    const svc = new CookieService({
      path: "/",
      prefix: "ccm_",
      expiryDays: 365,
      sameSite: "Lax",
      secure: "auto",
    });
    svc.set("test", "value");
    expect(jar["ccm_test"]).toBeDefined();
  });

  it("removes a cookie", () => {
    const svc = new CookieService({
      path: "/",
      prefix: "ccm_",
      expiryDays: 365,
      sameSite: "Lax",
      secure: "auto",
    });
    svc.set("test", "value");
    expect(svc.has("test")).toBe(true);
    svc.remove("test");
    expect(svc.has("test")).toBe(false);
  });

  it("encodes values on set and decodes on get", () => {
    const svc = new CookieService({
      path: "/",
      prefix: "ccm_",
      expiryDays: 365,
      sameSite: "Lax",
      secure: "auto",
    });
    const json = JSON.stringify({ analytics: true });
    svc.set("preferences", json);
    expect(svc.get("preferences")).toBe(json);
  });

  it("has() returns false for non-existent cookie", () => {
    const svc = new CookieService({
      path: "/",
      prefix: "ccm_",
      expiryDays: 365,
      sameSite: "Lax",
      secure: "auto",
    });
    expect(svc.has("nope")).toBe(false);
  });

  it("get() returns null for non-existent cookie", () => {
    const svc = new CookieService({
      path: "/",
      prefix: "ccm_",
      expiryDays: 365,
      sameSite: "Lax",
      secure: "auto",
    });
    expect(svc.get("nope")).toBeNull();
  });
});
