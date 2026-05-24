# Legal / GDPR Cookie Readiness

This document describes the Supplier Passport cookie consent foundation added for Faza 4.6.

## Privacy Policy Pages

Public Privacy Policy draft pages are available at:

- `/hr/privacy`
- `/en/privacy`

The pages use the Supplier Passport public visual style: branded header, light B2B SaaS background, blue/teal accents, readable legal content cards, table-of-contents anchors, and the shared legal footer.

These pages are legal/GDPR readiness drafts only. They must be reviewed by legal counsel before commercial launch and before replacing placeholders with final company details.

Visible placeholders that must be replaced:

- `[LEGAL ENTITY NAME]` / `[NAZIV PRAVNE OSOBE]`
- `[ADDRESS]` / `[ADRESA]`
- `[REGISTRATION / TAX ID]` / `[OIB / REGISTRACIJSKI BROJ]`
- `[PRIVACY CONTACT EMAIL]` / `[KONTAKT E-MAIL ZA PRIVATNOST]`
- `[DPO CONTACT IF APPLICABLE]` / `[DPO KONTAKT AKO POSTOJI]`
- `[DEFINE RETENTION PERIODS]` / `[DEFINIRATI ROKOVE ČUVANJA]`

The Privacy Policy draft documents these data categories:

- account and authentication data
- organization/company profile data
- questionnaire answers
- uploaded document metadata and supporting evidence handling
- evidence links between documents and answers
- buyer requests and buyer-safe public links
- support requests
- technical logs
- cookie consent preferences

Do not add claims such as `GDPR compliant`, `fully compliant`, `legally certified`, `guaranteed compliance`, or `audit-ready`. Supplier Passport legal pages should explain privacy practices and readiness work without claiming certification or legal approval.

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
