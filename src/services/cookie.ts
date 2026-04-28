import type { CookieOptions } from "../types";

export class CookieService {
  private domain?: string;
  private path: string;
  private prefix: string;
  private expiryDays: number;
  private sameSite: "Lax" | "Strict" | "None";
  private secure: boolean | "auto";

  constructor(options: CookieOptions) {
    this.domain = options.domain;
    this.path = options.path;
    this.prefix = options.prefix;
    this.expiryDays = options.expiryDays;
    this.sameSite = options.sameSite;
    this.secure = options.secure;
  }

  set(name: string, value: string): void {
    const encoded = encodeURIComponent(value);
    const domainAttr = this.domain ? `; domain=${this.domain}` : "";
    const needsSecure =
      this.secure === true ||
      (this.secure === "auto" && typeof location !== "undefined" && location.protocol === "https:") ||
      this.sameSite === "None";
    const secureAttr = needsSecure ? "; Secure" : "";
    document.cookie = `${this.prefix}${name}=${encoded}; path=${this.path}${domainAttr}; max-age=${this.expiryDays * 24 * 60 * 60}; SameSite=${this.sameSite}${secureAttr}`;
  }

  remove(name: string): void {
    const domainAttr = this.domain ? `; domain=${this.domain}` : "";
    document.cookie = `${this.prefix}${name}=; path=${this.path}${domainAttr}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
  }

  has(name: string): boolean {
    return document.cookie.split(";").some((c) => c.trim().startsWith(`${this.prefix}${name}=`));
  }

  get(name: string): string | null {
    const escaped = this.prefix + name;
    const match = document.cookie.match(
      new RegExp(`(?:^|;\\s*)${escaped.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`)
    );
    if (!match) return null;
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  }
}
