import { NextRequest, NextResponse } from "next/server";
import { getPublicShareByToken, getShareVerificationCookieName } from "@/lib/data/share-links";
import { createTextPdf } from "@/lib/pdf/simple-pdf";
import type { publicSharePassport } from "@/lib/mock-data";

type Locale = "en" | "hr" | "de";

type PublicPdfLabels = (typeof publicPdfLabels)[Locale];

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim() ?? "";
  const locale = parseLocale(request.nextUrl.searchParams.get("locale"));
  const labels = publicPdfLabels[locale];

  if (!token) {
    return NextResponse.json({ error: labels.unavailable, category: "invalid_token" }, { status: 404 });
  }

  try {
    const verificationCookieValue = request.cookies.get(getShareVerificationCookieName(token))?.value;
    const result = await getPublicShareByToken(token, { verificationCookieValue });

    if (!result || result.state !== "ok" || result.source !== "live") {
      return NextResponse.json({ error: labels.unavailable, category: "unavailable" }, { status: 404 });
    }

    const report = createPublicPdfReport(result.share, labels);
    const pdf = createTextPdf(report.title, report.lines, { footerLabel: labels.title });
    const filename = createPublicFilename(result.share.company.name);

    return new Response(pdf, {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${filename}"`,
        "cache-control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: labels.error, category: "public_pdf_export_error" },
      { status: 500 },
    );
  }
}

function createPublicPdfReport(
  passport: typeof publicSharePassport,
  labels: PublicPdfLabels,
) {
  const evidenceSection = passport.sections.find((section) => section.title === "Evidence summary");
  const readinessSections = passport.sections.filter((section) => section.title !== "Evidence summary");
  const readinessLabel = getReadinessLabel(passport.readinessScore, labels);

  return {
    title: `${labels.title} - ${passport.company.name}`,
    lines: [
      { text: labels.title, variant: "title" as const },
      { text: passport.company.name, variant: "subtitle" as const },
      { text: `${labels.vsmeAligned}: ${labels.publicSummary}`, variant: "metric" as const },
      { text: `${labels.generated}: ${formatDate(new Date(), labels.locale)} | ${labels.lastUpdated}: ${passport.lastUpdated}`, variant: "muted" as const },
      { text: "", variant: "rule" as const },
      { text: labels.readinessSummary, variant: "heading" as const },
      { text: `${labels.overallReadiness}: ${passport.readinessScore}% (${readinessLabel})`, variant: "metric" as const },
      { text: labels.scoreExplanation, variant: "note" as const },
      { text: "", variant: "rule" as const },
      { text: labels.companySummary, variant: "heading" as const },
      { text: `${labels.organization}: ${passport.company.name}`, indent: 10 },
      { text: `${labels.industries}: ${safeValue(passport.company.industries.join(", "), labels)}`, indent: 10 },
      { text: `${labels.headquarters}: ${safeValue(passport.company.headquarters, labels)}`, indent: 10 },
      { text: `${labels.employeeCount}: ${safeValue(passport.company.employeeCount, labels)}`, indent: 10 },
      { text: "", variant: "rule" as const },
      { text: labels.sectionSummary, variant: "heading" as const },
      ...readinessSections.map((section) => ({
        text: `${translateSectionTitle(section.title, labels)} | ${section.metricLabel}: ${section.metricValue} | ${translateAction(section.actionLabel, labels)}`,
        indent: 10,
      })),
      { text: "", variant: "rule" as const },
      { text: labels.evidenceSummary, variant: "heading" as const },
      { text: `${labels.evidenceAvailable}: ${evidenceSection?.metricValue ?? "0"}`, variant: "metric" as const },
      { text: labels.evidenceOnRequest, variant: "note" as const },
      { text: labels.privateFilesNotDownloadable, variant: "note" as const },
      { text: "", variant: "rule" as const },
      { text: labels.certificateStatus, variant: "heading" as const },
      { text: translateCertificateStatus(passport.certificateStatus ?? "none", labels), variant: "metric" as const },
      { text: "", variant: "rule" as const },
      { text: labels.disclaimerTitle, variant: "heading" as const },
      { text: labels.disclaimer, variant: "note" as const },
    ],
  };
}

function parseLocale(value: string | null): Locale {
  return value === "hr" || value === "de" || value === "en" ? value : "en";
}

function createPublicFilename(companyName: string) {
  const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") || "supplier";

  return `supplier-passport-public-${slug}.pdf`;
}

function safeValue(value: string, labels: PublicPdfLabels) {
  return value && value !== "Not provided" ? value : labels.notProvided;
}

function formatDate(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale).format(date);
}

function getReadinessLabel(score: number, labels: PublicPdfLabels) {
  if (score >= 90) {
    return labels.strongReadiness;
  }

  if (score >= 70) {
    return labels.buyerReadyDraft;
  }

  if (score >= 40) {
    return labels.inProgress;
  }

  return labels.needsAttention;
}

function translateSectionTitle(title: string, labels: PublicPdfLabels) {
  return labels.sections[title] ?? title;
}

function translateAction(value: string, labels: PublicPdfLabels) {
  return labels.actions[value] ?? value;
}

function translateCertificateStatus(status: string, labels: PublicPdfLabels) {
  return labels.certificateStatuses[status] ?? labels.noCertificateWarnings;
}

const publicPdfLabels = {
  en: {
    locale: "en",
    title: "Supplier Passport public summary",
    publicSummary: "VSME-aligned public summary",
    generated: "Generated",
    lastUpdated: "Last updated",
    vsmeAligned: "VSME-aligned",
    readinessSummary: "Readiness summary",
    overallReadiness: "Overall readiness",
    scoreExplanation: "This score reflects completed questionnaire items and buyer-safe evidence metadata. It is a readiness indicator, not an audit result.",
    companySummary: "Company summary",
    organization: "Organization",
    industries: "Industries",
    headquarters: "Headquarters",
    employeeCount: "Employee count",
    sectionSummary: "Section summary",
    evidenceSummary: "Evidence summary",
    evidenceAvailable: "Evidence available",
    evidenceOnRequest: "Evidence documents are available on request.",
    privateFilesNotDownloadable: "Private evidence files are not downloadable from this public PDF.",
    certificateStatus: "Certificate status",
    disclaimerTitle: "Important disclaimer",
    disclaimer: "Supplier Passport is a VSME-aligned supplier readiness summary based on supplier-provided information and evidence metadata. It is not an audit opinion, legal certification, or assurance report.",
    unavailable: "This Supplier Passport link is unavailable.",
    error: "We could not generate the public PDF right now.",
    notProvided: "Not provided yet",
    needsAttention: "Needs attention",
    inProgress: "In progress",
    buyerReadyDraft: "Buyer-ready draft",
    strongReadiness: "Strong readiness",
    noCertificateWarnings: "No certificate expiry warnings",
    sections: {
      "Company basics": "Company basics",
      Employees: "Employees",
      Energy: "Energy",
      Fuel: "Fuel",
      Waste: "Waste",
      "Environmental policies": "Environmental policies",
      "Health and safety": "Health and safety",
      Certifications: "Certifications",
      Governance: "Governance",
      "Supplier information": "Supplier information",
    } as Record<string, string>,
    actions: {
      "Evidence available": "Evidence available",
      "Evidence recommended": "Evidence recommended",
      "Evidence documents are available on request": "Evidence documents are available on request",
    } as Record<string, string>,
    certificateStatuses: {
      none: "No certificate expiry warnings",
      available: "Certification evidence available",
      expires_soon: "Certificate expires soon",
      expired: "Certificate expired",
    } as Record<string, string>,
  },
  hr: {
    locale: "hr",
    title: "Javni Supplier Passport sazetak",
    publicSummary: "Javni sazetak uskladen s VSME okvirom",
    generated: "Generirano",
    lastUpdated: "Zadnje azuriranje",
    vsmeAligned: "Uskladeno s VSME okvirom",
    readinessSummary: "Sazetak spremnosti",
    overallReadiness: "Ukupna spremnost",
    scoreExplanation: "Ovaj rezultat odrazava ispunjene stavke upitnika i metapodatke dokazne dokumentacije sigurne za kupce. To je pokazatelj spremnosti, a ne rezultat revizije.",
    companySummary: "Sazetak tvrtke",
    organization: "Organizacija",
    industries: "Industrije",
    headquarters: "Sjediste",
    employeeCount: "Broj zaposlenika",
    sectionSummary: "Sazetak po sekcijama",
    evidenceSummary: "Dokazna dokumentacija",
    evidenceAvailable: "Dostupni dokazi",
    evidenceOnRequest: "Dokazni dokumenti dostupni su na zahtjev.",
    privateFilesNotDownloadable: "Privatni dokazni dokumenti nisu dostupni za preuzimanje iz ovog javnog PDF-a.",
    certificateStatus: "Status certifikata",
    disclaimerTitle: "Vazna napomena",
    disclaimer: "Supplier Passport je sazetak spremnosti dobavljaca uskladen s VSME okvirom, temeljen na podacima i metapodacima dokazne dokumentacije koje je dostavio dobavljac. Nije revizijsko misljenje, pravni certifikat niti izvjesce s neovisnim uvjerenjem.",
    unavailable: "Ovaj Supplier Passport link nije dostupan.",
    error: "Trenutno ne mozemo generirati javni PDF.",
    notProvided: "Jos nije uneseno",
    needsAttention: "Potrebna dorada",
    inProgress: "U tijeku",
    buyerReadyDraft: "Nacrt spreman za kupce",
    strongReadiness: "Visoka spremnost",
    noCertificateWarnings: "Nema upozorenja o isteku certifikata",
    sections: {
      "Company basics": "Osnovni podaci",
      Employees: "Zaposlenici",
      Energy: "Energija",
      Fuel: "Gorivo",
      Waste: "Otpad",
      "Environmental policies": "Okolisne politike",
      "Health and safety": "Zdravlje i sigurnost",
      Certifications: "Certifikati",
      Governance: "Upravljanje",
      "Supplier information": "Podaci o dobavljacima",
    } as Record<string, string>,
    actions: {
      "Evidence available": "Dokazna dokumentacija dostupna",
      "Evidence recommended": "Preporucuje se dokazna dokumentacija",
      "Evidence documents are available on request": "Dokazni dokumenti dostupni su na zahtjev",
    } as Record<string, string>,
    certificateStatuses: {
      none: "Nema upozorenja o isteku certifikata",
      available: "Dokaz o certifikaciji dostupan",
      expires_soon: "Certifikat uskoro istjece",
      expired: "Certifikat je istekao",
    } as Record<string, string>,
  },
  de: {
    locale: "de",
    title: "Oeffentliche Supplier-Passport-Zusammenfassung",
    publicSummary: "VSME-orientierte oeffentliche Zusammenfassung",
    generated: "Erstellt",
    lastUpdated: "Zuletzt aktualisiert",
    vsmeAligned: "VSME-orientiert",
    readinessSummary: "Bereitschaftszusammenfassung",
    overallReadiness: "Gesamtbereitschaft",
    scoreExplanation: "Dieser Wert basiert auf ausgefuellten Fragebogenpunkten und kaeufergeeigneten Nachweis-Metadaten. Er ist ein Bereitschaftsindikator, kein Pruefungsergebnis.",
    companySummary: "Unternehmenszusammenfassung",
    organization: "Organisation",
    industries: "Branchen",
    headquarters: "Sitz",
    employeeCount: "Beschaeftigte",
    sectionSummary: "Abschnittszusammenfassung",
    evidenceSummary: "Nachweise",
    evidenceAvailable: "Nachweise verfuegbar",
    evidenceOnRequest: "Nachweisdokumente sind auf Anfrage verfuegbar.",
    privateFilesNotDownloadable: "Private Nachweisdateien koennen aus diesem oeffentlichen PDF nicht heruntergeladen werden.",
    certificateStatus: "Zertifikatsstatus",
    disclaimerTitle: "Wichtiger Hinweis",
    disclaimer: "Der Supplier Passport ist eine VSME-orientierte Zusammenfassung der Lieferantenbereitschaft auf Basis von Lieferantenangaben und Nachweis-Metadaten. Er ist kein Pruefungsurteil, keine rechtliche Zertifizierung und kein Assurance-Bericht.",
    unavailable: "Dieser Supplier-Passport-Link ist nicht verfuegbar.",
    error: "Das oeffentliche PDF konnte gerade nicht erstellt werden.",
    notProvided: "Noch nicht angegeben",
    needsAttention: "Handlungsbedarf",
    inProgress: "In Bearbeitung",
    buyerReadyDraft: "Kaeuferbereiter Entwurf",
    strongReadiness: "Hohe Bereitschaft",
    noCertificateWarnings: "Keine Warnungen zu Zertifikatsablaeufen",
    sections: {
      "Company basics": "Unternehmensdaten",
      Employees: "Beschaeftigte",
      Energy: "Energie",
      Fuel: "Kraftstoffe",
      Waste: "Abfall",
      "Environmental policies": "Umweltpolitik",
      "Health and safety": "Gesundheit und Sicherheit",
      Certifications: "Zertifikate",
      Governance: "Governance",
      "Supplier information": "Lieferantendaten",
    } as Record<string, string>,
    actions: {
      "Evidence available": "Nachweise verfuegbar",
      "Evidence recommended": "Nachweise empfohlen",
      "Evidence documents are available on request": "Nachweisdokumente sind auf Anfrage verfuegbar",
    } as Record<string, string>,
    certificateStatuses: {
      none: "Keine Warnungen zu Zertifikatsablaeufen",
      available: "Zertifizierungsnachweis verfuegbar",
      expires_soon: "Zertifikat laeuft bald ab",
      expired: "Zertifikat ist abgelaufen",
    } as Record<string, string>,
  },
} satisfies Record<Locale, {
  locale: Locale;
  title: string;
  publicSummary: string;
  generated: string;
  lastUpdated: string;
  vsmeAligned: string;
  readinessSummary: string;
  overallReadiness: string;
  scoreExplanation: string;
  companySummary: string;
  organization: string;
  industries: string;
  headquarters: string;
  employeeCount: string;
  sectionSummary: string;
  evidenceSummary: string;
  evidenceAvailable: string;
  evidenceOnRequest: string;
  privateFilesNotDownloadable: string;
  certificateStatus: string;
  disclaimerTitle: string;
  disclaimer: string;
  unavailable: string;
  error: string;
  notProvided: string;
  needsAttention: string;
  inProgress: string;
  buyerReadyDraft: string;
  strongReadiness: string;
  noCertificateWarnings: string;
  sections: Record<string, string>;
  actions: Record<string, string>;
  certificateStatuses: Record<string, string>;
}>;
