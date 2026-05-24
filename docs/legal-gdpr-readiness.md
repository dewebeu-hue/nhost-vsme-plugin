# Legal / GDPR Cookie Readiness

This document describes the Supplier Passport cookie consent foundation added for Faza 4.6.

## Cookie Categories

Strictly necessary:

- Nhost authentication/session cookies and client session handling used for login and secure workspace access.
- Token-scoped protected share verification cookies used only after a buyer enters the correct password for a protected public Passport link.
- Server-side security/session behavior required for core application functionality.

Preferences:

- UI settings such as admin theme preference.
- Language/display preferences if future implementation stores them outside the URL.
- Guided-tour completion state and similar interface preferences.

Analytics:

- Reserved for future product analytics.
- No analytics script is loaded in this step.

Marketing:

- Reserved for future campaign or advertising measurement tools.
- No marketing script or pixel is loaded in this step.

## Consent Storage

Consent is stored in browser `localStorage` under:

```text
supplierPassportCookieConsent
```

Stored shape:

```json
{
  "version": 1,
  "necessary": true,
  "preferences": false,
  "analytics": false,
  "marketing": false,
  "updatedAt": "ISO date"
}
```

The consent record does not store personal data.

## Consent Behavior

- Optional categories are off by default.
- `Accept all` enables preferences, analytics, and marketing.
- `Reject optional` keeps only necessary enabled.
- `Save settings` stores the selected optional categories.
- The banner is not shown again after a decision.
- Users can reopen settings through the persistent `Cookie settings` / `Postavke kolačića` control.
- Rejecting optional cookies must not block access to the app.

## Future Tracking Gate

Future optional scripts must use the consent helpers in `lib/cookie-consent.ts`:

- `hasCookieConsent(preferences, category)`
- `canUseAnalytics(preferences)`
- `canUseMarketing(preferences)`

Do not load analytics, marketing pixels, or preference-only scripts before the relevant category is explicitly accepted.

## Testing Reset

To retest the banner in a browser:

1. Open DevTools.
2. Go to Application / Storage.
3. Remove `supplierPassportCookieConsent` from Local Storage.
4. Refresh the page.

Manual QA:

1. Open `/hr` and confirm the Croatian banner appears.
2. Click `Odbij neobavezne`, refresh, and confirm the banner does not reappear.
3. Reopen `Postavke kolačića`, enable analytics, save, refresh, and confirm settings persist.
4. Clear consent and click `Prihvati sve`.
5. Repeat on `/en`.
6. Confirm no analytics, marketing, `gtag`, `dataLayer`, PostHog, Plausible, or Meta Pixel script loads before consent.

