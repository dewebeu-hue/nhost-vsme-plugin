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

## Terms And Conditions Pages

Public Terms and Conditions draft pages are available at:

- `/hr/terms`
- `/en/terms`

The Terms pages reuse the same Supplier Passport legal page layout as the Privacy Policy pages. They cover SaaS access, organization/workspace use, user content, supporting evidence, public sharing, password-protected links, acceptable use, pilots and billing, availability, no audit/certification, liability, privacy, support, termination, governing law, and contact.

These pages are legal readiness drafts only. They must be reviewed by legal counsel before commercial launch and before replacing placeholders with final company details.

Visible placeholders that must be replaced:

- `[LEGAL ENTITY NAME]` / `[NAZIV PRAVNE OSOBE]`
- `[ADDRESS]` / `[ADRESA]`
- `[REGISTRATION / TAX ID]` / `[OIB / REGISTRACIJSKI BROJ]`
- `[CONTACT EMAIL]` / `[KONTAKT E-MAIL]`
- `[GOVERNING LAW AND JURISDICTION]` / `[NADLEŽNO PRAVO I SUD]`

The Terms draft explicitly states that online billing is not enabled in this version. Pilot, commercial, or partner terms may be agreed separately in writing. Do not add Stripe, online payment, or automatic billing wording unless the product later implements it.

## Final Legal / GDPR Page Package

The remaining legal readiness pages are available at:

- `/hr/cookies` and `/en/cookies`
- `/hr/dpa` and `/en/dpa`
- `/hr/security` and `/en/security`
- `/hr/subprocessors` and `/en/subprocessors`

All pages reuse the shared `LegalPageLayout` and shared legal footer.

Cookie Policy:

- Explains necessary, preference, analytics and marketing cookie categories.
- States optional categories are off by default until consent.
- Includes an `Open cookie settings` / `Otvorite postavke kolačića` action that reopens the existing preference center.
- Confirms no optional analytics or marketing scripts should load before consent.

DPA overview:

- Is a working draft/overview, not a signed contract.
- Covers party roles, processing subject matter, data categories, instructions, confidentiality, security measures, subprocessors, data subject rights, breach handling, deletion/return, audit information and transfers.
- Requires legal counsel review before commercial use.

Security overview:

- Explains access/authentication, organization-level data isolation, evidence document privacy, public links, admin access, logs/support and user recommendations.
- Does not claim SOC 2, ISO 27001 or other certifications.

Subprocessors:

- Lists current/planned infrastructure and service providers with placeholders for region/provider verification.
- Notes that exact provider legal entities, regions and safeguards must be verified before commercial launch.

Legal footer:

- Links to Privacy Policy, Terms, Cookie Policy, DPA, Security and Subprocessors.
- Keeps Cookie settings as an action that opens preferences, not a route.

Final QA:

1. Open every HR and EN legal route.
2. Confirm all pages use Supplier Passport branding, header, cards, spacing and footer.
3. Confirm all legal footer links resolve without 404.
4. Confirm `/hr/cookies` and `/en/cookies` can reopen cookie settings.
5. Confirm no public legal route loads organization data, documents, storage IDs, share tokens, admin data, user/member data or secrets.
6. Confirm legal copy avoids full compliance, certification, audit-ready, SOC 2 and ISO 27001 claims except where explicitly saying those are not claimed.

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
