export type PrivacyPolicyContent = {
  effectiveDate: string;
  hero: {
    eyebrow: string;
    title: string;
    summary: string;
    reviewNote: string;
    action?: {
      label: string;
      type: "cookieSettings";
    };
  };
  placeholders: string[];
  tocTitle: string;
  sections: Array<{
    id: string;
    title: string;
    body: string[];
    bullets?: string[];
    table?: {
      headers: string[];
      rows: string[][];
    };
  }>;
};

export type LegalPageContent = PrivacyPolicyContent;

export const privacyPolicyContent: Record<"en" | "hr", PrivacyPolicyContent> = {
  en: {
    effectiveDate: "Last updated: [DATE]",
    hero: {
      eyebrow: "Legal / GDPR readiness draft",
      reviewNote:
        "This page is a privacy information draft for Supplier Passport and should be reviewed by legal counsel before commercial use.",
      summary:
        "This policy explains what personal data we process, why we process it, how long we keep it, and which rights you have.",
      title: "Privacy Policy",
    },
    placeholders: [
      "[LEGAL ENTITY NAME]",
      "[ADDRESS]",
      "[REGISTRATION / TAX ID]",
      "[PRIVACY CONTACT EMAIL]",
      "[DPO CONTACT IF APPLICABLE]",
      "[DEFINE RETENTION PERIODS]",
    ],
    tocTitle: "On this page",
    sections: [
      {
        id: "controller",
        title: "Who is the controller",
        body: [
          "The controller for Supplier Passport is [LEGAL ENTITY NAME], [ADDRESS], [REGISTRATION / TAX ID].",
          "For privacy questions, contact us at [PRIVACY CONTACT EMAIL]. If a data protection officer is appointed, the contact is [DPO CONTACT IF APPLICABLE].",
        ],
      },
      {
        id: "data",
        title: "What data we process",
        body: ["Depending on how you use Supplier Passport, we may process the following data categories:"],
        bullets: [
          "account data, such as name, email address, authentication status and workspace role",
          "organization and company profile data",
          "supplier logo and brand/profile assets uploaded for reports and buyer-facing pages",
          "questionnaire answers and readiness metadata",
          "uploaded documents and document metadata",
          "evidence links between documents and answers",
          "buyer request data and buyer-facing share-link metadata",
          "support requests and operational messages",
          "technical logs, security events and device/browser data",
          "cookie consent and interface preference records",
        ],
      },
      {
        id: "purposes",
        title: "Why we process data",
        body: ["We process data to provide, secure and improve the Supplier Passport service."],
        bullets: [
          "providing the SaaS workspace and account access",
          "login, authentication, security and organization scoping",
          "creating Supplier Passport readiness summaries",
          "organizing supporting evidence and linking evidence to answers",
          "creating buyer-safe public links and PDF reports",
          "supporting buyer requests and customer support workflows",
          "administering the service, troubleshooting and security monitoring",
          "meeting legal obligations where applicable",
        ],
      },
      {
        id: "legal-bases",
        title: "Legal bases",
        body: [
          "Depending on the context, processing may be based on contract performance, legitimate interest, legal obligation, consent for optional cookies or analytics if introduced, and processing requested by the user.",
        ],
      },
      {
        id: "documents",
        title: "Documents and supporting evidence",
        body: [
          "Suppliers upload documents voluntarily. Documents may contain business data and, in some cases, personal data. Private evidence files are not publicly downloadable by default.",
          "Supplier Passport public links are designed to show buyer-safe summaries unless explicit document access is configured. Suppliers are responsible for avoiding unnecessary sensitive personal data in uploaded documents.",
        ],
      },
      {
        id: "sharing",
        title: "Public links and sharing",
        body: [
          "Public Passport links may be accessible to anyone with the link unless password protection, expiry or deactivation controls are used.",
          "The buyer-safe public view does not expose private evidence documents by default. Suppliers should share links only with intended recipients and deactivate links when no longer needed.",
        ],
      },
      {
        id: "cookies",
        title: "Cookies",
        body: [
          "Necessary cookies are used for login, security and core application functionality. Optional preferences, analytics and marketing categories require consent before use.",
          "The Cookie Policy page explains cookie categories and how to reopen the cookie settings panel.",
        ],
      },
      {
        id: "subprocessors",
        title: "Subprocessors",
        body: [
          "Supplier Passport may use hosting, backend, authentication, storage and email/service providers. Analytics providers should be listed only if analytics are enabled with consent.",
          "A detailed subprocessor list should be reviewed and finalized before commercial launch.",
        ],
      },
      {
        id: "transfers",
        title: "International transfers",
        body: [
          "Some providers may process data outside Croatia, the EU or the EEA depending on configuration. Appropriate safeguards and provider locations should be documented during final legal review.",
        ],
      },
      {
        id: "retention",
        title: "Retention",
        body: [
          "Account data is generally kept while the account is active. Organization, workspace and document data is kept while the service is used, until deleted by the user/admin or until the contract ends.",
          "Security and operational logs are kept for a limited period. Exact retention periods must be defined: [DEFINE RETENTION PERIODS].",
        ],
      },
      {
        id: "rights",
        title: "Your rights",
        body: ["Subject to GDPR conditions, you may have the following rights:"],
        bullets: [
          "access to your personal data",
          "correction of inaccurate data",
          "deletion",
          "restriction of processing",
          "objection to processing",
          "data portability",
          "withdrawal of consent where processing is based on consent",
          "complaint to a supervisory authority",
        ],
      },
      {
        id: "security",
        title: "Security",
        body: [
          "We use access controls, authentication, organization scoping, private document handling and admin-only controls to protect the service.",
          "No system can guarantee absolute security. Users should protect credentials and share public links carefully.",
        ],
      },
      {
        id: "changes",
        title: "Changes to this policy",
        body: ["We may update this policy from time to time. The latest version will show the last updated date."],
      },
      {
        id: "contact",
        title: "Contact",
        body: ["For privacy questions or requests, contact [PRIVACY CONTACT EMAIL]."],
      },
    ],
  },
  hr: {
    effectiveDate: "Zadnje ažurirano: [DATUM]",
    hero: {
      eyebrow: "Nacrt za pravnu / GDPR spremnost",
      reviewNote:
        "Ova stranica je nacrt informacija o privatnosti za Supplier Passport i treba je pregledati pravni savjetnik prije komercijalne upotrebe.",
      summary:
        "U ovoj politici objašnjavamo koje osobne podatke obrađujemo, zašto ih obrađujemo, koliko ih čuvamo i koja prava imate.",
      title: "Politika privatnosti",
    },
    placeholders: [
      "[NAZIV PRAVNE OSOBE]",
      "[ADRESA]",
      "[OIB / REGISTRACIJSKI BROJ]",
      "[KONTAKT E-MAIL ZA PRIVATNOST]",
      "[DPO KONTAKT AKO POSTOJI]",
      "[DEFINIRATI ROKOVE ČUVANJA]",
    ],
    tocTitle: "Na ovoj stranici",
    sections: [
      {
        id: "controller",
        title: "Tko je voditelj obrade",
        body: [
          "Voditelj obrade za Supplier Passport je [NAZIV PRAVNE OSOBE], [ADRESA], [OIB / REGISTRACIJSKI BROJ].",
          "Za pitanja o privatnosti kontaktirajte nas na [KONTAKT E-MAIL ZA PRIVATNOST]. Ako je imenovan službenik za zaštitu podataka, kontakt je [DPO KONTAKT AKO POSTOJI].",
        ],
      },
      {
        id: "data",
        title: "Koje podatke obrađujemo",
        body: ["Ovisno o načinu korištenja Supplier Passporta, možemo obrađivati sljedeće kategorije podataka:"],
        bullets: [
          "podaci o korisničkom računu, uključujući ime, e-mail adresu, autentikacijski status i ulogu u radnom prostoru",
          "podaci o organizaciji i profilu tvrtke",
          "logo dobavljača i brand/profilni materijali učitani za izvještaje i stranice za kupce",
          "odgovori u upitniku i metapodaci o spremnosti",
          "učitani dokumenti i metapodaci dokumenata",
          "povezivanje dokaza s odgovorima",
          "podaci o zahtjevima kupaca i metapodaci javnih linkova",
          "upiti podršci i operativne poruke",
          "tehnički logovi, sigurnosni događaji i podaci o uređaju/pregledniku",
          "privole za kolačiće i postavke sučelja",
        ],
      },
      {
        id: "purposes",
        title: "Zašto obrađujemo podatke",
        body: ["Podatke obrađujemo radi pružanja, zaštite i poboljšanja Supplier Passport usluge."],
        bullets: [
          "pružanje SaaS radnog prostora i pristupa računu",
          "prijava, autentikacija, sigurnost i organizacijsko razgraničenje",
          "izrada Supplier Passport sažetka spremnosti",
          "organizacija dokazne dokumentacije i povezivanje dokaza s odgovorima",
          "kreiranje javnih linkova sigurnih za prikaz kupcima i PDF izvještaja",
          "podrška zahtjevima kupaca i korisnička podrška",
          "administracija usluge, rješavanje poteškoća i sigurnosni nadzor",
          "zakonske obveze ako su primjenjive",
        ],
      },
      {
        id: "legal-bases",
        title: "Pravne osnove obrade",
        body: [
          "Ovisno o kontekstu, obrada se može temeljiti na izvršavanju ugovora, legitimnom interesu, zakonskoj obvezi, privoli za neobavezne kolačiće ili analitiku ako se uvede te obradi na zahtjev korisnika.",
        ],
      },
      {
        id: "documents",
        title: "Dokumenti i dokazna dokumentacija",
        body: [
          "Dobavljači dobrovoljno učitavaju dokumente. Dokumenti mogu sadržavati poslovne podatke, a u nekim slučajevima i osobne podatke. Privatni dokazni dokumenti nisu javno dostupni za preuzimanje prema zadanim postavkama.",
          "Javni Supplier Passport linkovi namijenjeni su prikazu sažetaka sigurnih za kupce, osim ako je izričito konfiguriran pristup dokumentima. Dobavljač je odgovoran da ne učitava nepotrebne osjetljive osobne podatke.",
        ],
      },
      {
        id: "sharing",
        title: "Javni linkovi i dijeljenje",
        body: [
          "Javni Passport linkovi mogu biti dostupni svima koji imaju link, osim ako se koriste zaštita lozinkom, datum isteka ili deaktivacija.",
          "Javni prikaz siguran za kupce ne otkriva privatne dokazne dokumente prema zadanim postavkama. Dobavljači trebaju dijeliti linkove samo s namijenjenim primateljima i deaktivirati ih kada više nisu potrebni.",
        ],
      },
      {
        id: "cookies",
        title: "Kolačići",
        body: [
          "Nužni kolačići koriste se za prijavu, sigurnost i osnovni rad aplikacije. Neobavezne kategorije preferencija, analitike i marketinga zahtijevaju privolu prije korištenja.",
          "Stranica Politika kolačića objašnjava kategorije kolačića i kako ponovno otvoriti panel postavki kolačića.",
        ],
      },
      {
        id: "subprocessors",
        title: "Podizvršitelji obrade",
        body: [
          "Supplier Passport može koristiti pružatelje hostinga, backenda, autentikacije, pohrane i e-mail/uslužne pružatelje. Pružatelji analitike trebaju biti navedeni samo ako je analitika omogućena uz privolu.",
          "Detaljan popis podizvršitelja obrade treba pregledati i finalizirati prije komercijalnog lansiranja.",
        ],
      },
      {
        id: "transfers",
        title: "Međunarodni prijenosi",
        body: [
          "Neki pružatelji usluga mogu obrađivati podatke izvan Hrvatske, EU-a ili EGP-a, ovisno o konfiguraciji. Odgovarajuće zaštitne mjere i lokacije pružatelja treba dokumentirati tijekom završnog pravnog pregleda.",
        ],
      },
      {
        id: "retention",
        title: "Koliko dugo čuvamo podatke",
        body: [
          "Podaci o računu u pravilu se čuvaju dok je račun aktivan. Podaci o organizaciji, radnom prostoru i dokumentima čuvaju se dok se usluga koristi, dok ih korisnik/admin ne izbriše ili dok ugovor ne prestane.",
          "Sigurnosni i operativni logovi čuvaju se ograničeno vrijeme. Točne rokove čuvanja potrebno je definirati: [DEFINIRATI ROKOVE ČUVANJA].",
        ],
      },
      {
        id: "rights",
        title: "Vaša prava",
        body: ["Pod uvjetima iz GDPR-a možete imati sljedeća prava:"],
        bullets: [
          "pravo na pristup osobnim podacima",
          "ispravak netočnih podataka",
          "brisanje",
          "ograničenje obrade",
          "prigovor na obradu",
          "prenosivost podataka",
          "povlačenje privole kada se obrada temelji na privoli",
          "pritužba nadzornom tijelu, uključujući Agenciju za zaštitu osobnih podataka",
        ],
      },
      {
        id: "security",
        title: "Sigurnost",
        body: [
          "Koristimo kontrole pristupa, autentikaciju, organizacijsko razgraničenje, privatno postupanje s dokumentima i admin-only kontrole radi zaštite usluge.",
          "Nijedan sustav ne može jamčiti apsolutnu sigurnost. Korisnici trebaju čuvati vjerodajnice i pažljivo dijeliti javne linkove.",
        ],
      },
      {
        id: "changes",
        title: "Promjene politike privatnosti",
        body: ["Ovu politiku možemo povremeno ažurirati. Najnovija verzija prikazuje datum zadnjeg ažuriranja."],
      },
      {
        id: "contact",
        title: "Kontakt",
        body: ["Za pitanja ili zahtjeve vezane uz privatnost kontaktirajte [KONTAKT E-MAIL ZA PRIVATNOST]."],
      },
    ],
  },
};
