import type { TranslationSet, DeepPartial } from "../types";
import tr from "./tr";
import en from "./en";

const builtIn: Record<string, TranslationSet> = { tr, en };

function deepMerge<T extends Record<string, any>>(
  base: T,
  override: Record<string, any>
): T {
  const result = { ...base } as Record<string, any>;
  for (const key of Object.keys(override)) {
    const baseVal = (base as Record<string, any>)[key];
    const overVal = (override as Record<string, any>)[key];
    if (
      overVal !== null &&
      typeof overVal === "object" &&
      !Array.isArray(overVal) &&
      baseVal !== null &&
      typeof baseVal === "object" &&
      !Array.isArray(baseVal)
    ) {
      result[key] = deepMerge(baseVal, overVal);
    } else {
      result[key] = overVal;
    }
  }
  return result as T;
}

export function getTranslation(
  lang: string,
  overrides: Record<string, DeepPartial<TranslationSet>>
): TranslationSet {
  const base = builtIn[lang] || builtIn["en"];
  const userOverride = overrides[lang];
  if (userOverride) {
    return deepMerge(base, userOverride);
  }
  return { ...base };
}

export { resolveLocalizedString } from "../defaults";
