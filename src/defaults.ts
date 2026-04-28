import type { InternalConfig, CookieConsentConfig } from "./types";

const DEFAULT_THEME = {
  primaryColor: "#FF671D",
  textColor: "#272727",
  backgroundColor: "#ffffff",
  position: "bottom" as const,
  borderRadius: "20px",
  headerImage: "default" as const,
};

export function buildConfig(user: CookieConsentConfig): InternalConfig {
  return {
    domain: user.domain,
    path: user.path ?? "/",
    cookieExpiry: user.cookieExpiry ?? 365,
    cookiePrefix: user.cookiePrefix ?? "ccm_",
    sameSite: user.sameSite ?? "Lax",
    secure: user.secure ?? "auto",
    policyVersion: user.policyVersion,
    language: user.language ?? "tr",
    translations: user.translations ?? {},
    categories: user.categories,
    theme: {
      ...DEFAULT_THEME,
      ...user.theme,
    },
    styleMode: user.styleMode ?? "inline",
    styleNonce: user.styleNonce,
    policyUrl: user.policyUrl,
    onReady: user.onReady,
    onSave: user.onSave,
    onAccept: user.onAccept,
    onReject: user.onReject,
    onChange: user.onChange,
  };
}

export function resolveLocalizedString(
  value: string | Record<string, string>,
  lang: string
): string {
  if (typeof value === "string") return value;
  return value[lang] || Object.values(value)[0] || "";
}
