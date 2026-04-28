export type LocalizedString = string | Record<string, string>;

export type ConsentDecision = "accepted_all" | "rejected_all" | "custom";

export interface ConsentPayload {
  decision: ConsentDecision;
  preferences: Record<string, boolean>;
  acceptedCategories: string[];
  rejectedCategories: string[];
  savedAt: string;
  policyVersion?: string;
}

export interface ThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;
  backgroundColor?: string;
  position?: "bottom" | "top";
  borderRadius?: string;
  headerImage?: "default" | "none" | string;
}

export interface CookieItem {
  name: string;
  provider: LocalizedString;
  description?: LocalizedString;
  purpose: LocalizedString;
  expiry: LocalizedString;
  party: "first" | "third";
}

export interface CategoryConfig {
  id: string;
  required?: boolean;
  title: LocalizedString;
  description: LocalizedString;
  cookies: CookieItem[];
}

export interface TranslationSet {
  banner: {
    description: string;
    acceptAll: string;
    rejectAll: string;
    manage: string;
    ariaLabel: string;
  };
  modal: {
    title: string;
    requiredNote: string;
    optionalNote: string;
    savePreferences: string;
    acceptAll: string;
    rejectAll: string;
    policyLink: string;
    policyClick: string;
    policyDocument: string;
    close: string;
  };
  table: {
    cookieName: string;
    provider: string;
    description: string;
    purpose: string;
    expiry: string;
    party: string;
    firstParty: string;
    thirdParty: string;
    session: string;
    permanent: string;
  };
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Record<string, any>
    ? DeepPartial<T[P]>
    : T[P];
};

export interface CookieConsentConfig {
  domain?: string;
  path?: string;
  cookieExpiry?: number;
  cookiePrefix?: string;
  sameSite?: "Lax" | "Strict" | "None";
  secure?: boolean | "auto";
  policyVersion?: string;

  language?: string;
  translations?: Record<string, DeepPartial<TranslationSet>>;

  categories: CategoryConfig[];

  theme?: ThemeConfig;

  styleMode?: "inline" | "nonce";
  styleNonce?: string;

  policyUrl?: string;

  onReady?: (payload: ConsentPayload | null) => void;
  onSave?: (payload: ConsentPayload) => void;
  onAccept?: (payload: ConsentPayload) => void;
  onReject?: (payload: ConsentPayload) => void;
  onChange?: (payload: ConsentPayload) => void;
}

export interface CookieOptions {
  domain?: string;
  path: string;
  prefix: string;
  expiryDays: number;
  sameSite: "Lax" | "Strict" | "None";
  secure: boolean | "auto";
}

export interface InternalConfig {
  domain?: string;
  path: string;
  cookieExpiry: number;
  cookiePrefix: string;
  sameSite: "Lax" | "Strict" | "None";
  secure: boolean | "auto";
  policyVersion?: string;
  language: string;
  translations: Record<string, DeepPartial<TranslationSet>>;
  categories: CategoryConfig[];
  theme: Required<Omit<ThemeConfig, "secondaryColor">> & { secondaryColor?: string };
  styleMode: "inline" | "nonce";
  styleNonce?: string;
  policyUrl?: string;
  onReady?: (payload: ConsentPayload | null) => void;
  onSave?: (payload: ConsentPayload) => void;
  onAccept?: (payload: ConsentPayload) => void;
  onReject?: (payload: ConsentPayload) => void;
  onChange?: (payload: ConsentPayload) => void;
}
