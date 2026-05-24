export const cookieConsentStorageKey = "supplierPassportCookieConsent";
export const cookieConsentVersion = 1;

export type CookieConsentCategory = "necessary" | "preferences" | "analytics" | "marketing";

export type CookieConsentPreferences = Record<CookieConsentCategory, boolean> & {
  updatedAt: string;
  version: number;
};

export const defaultCookieConsentPreferences: CookieConsentPreferences = {
  analytics: false,
  marketing: false,
  necessary: true,
  preferences: false,
  updatedAt: "",
  version: cookieConsentVersion,
};

export function createCookieConsentPreferences(
  overrides: Partial<Record<Exclude<CookieConsentCategory, "necessary">, boolean>> = {},
): CookieConsentPreferences {
  return {
    ...defaultCookieConsentPreferences,
    ...overrides,
    necessary: true,
    updatedAt: new Date().toISOString(),
    version: cookieConsentVersion,
  };
}

export function parseCookieConsentPreferences(value: string | null): CookieConsentPreferences | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<CookieConsentPreferences>;

    if (parsed.version !== cookieConsentVersion || parsed.necessary !== true) {
      return null;
    }

    return {
      analytics: parsed.analytics === true,
      marketing: parsed.marketing === true,
      necessary: true,
      preferences: parsed.preferences === true,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
      version: cookieConsentVersion,
    };
  } catch {
    return null;
  }
}

export function hasCookieConsent(
  preferences: CookieConsentPreferences | null,
  category: CookieConsentCategory,
) {
  return category === "necessary" || preferences?.[category] === true;
}

export function canUseAnalytics(preferences: CookieConsentPreferences | null) {
  return hasCookieConsent(preferences, "analytics");
}

export function canUseMarketing(preferences: CookieConsentPreferences | null) {
  return hasCookieConsent(preferences, "marketing");
}
