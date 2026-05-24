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
    effectiveDate: "Last updated: 24 May 2026",
    hero: {
      eyebrow: "Legal / GDPR readiness draft",
      reviewNote:
        "This page is a privacy information draft for Supplier Passport and should be reviewed by legal counsel before commercial use.",
      summary:
        "This policy explains what personal data we process, why we process it, how long we keep it, and which rights you have.",
      title: "Privacy Policy",
    },
    placeholders: [
      "Legal counsel review required",
      "DPA execution/status should be confirmed before commercial launch",
      "Provider regions and transfer safeguards should be verified before commercial launch",
    ],
    tocTitle: "On this page",
    sections: [
      {
        id: "controller",
        title: "Who is the controller",
        body: [
          "Supplier Passport is operated by deweb j.d.o.o., Prvča 58, 35400 Prvča, Croatia, VAT/OIB: 24631103366.",
          "For account, support, security, website and own administrative data, deweb j.d.o.o. acts as controller. For data that a customer enters into its workspace, deweb j.d.o.o. generally acts as a processor in relation to the business customer, while for account, support, security and its own administrative data it acts as a controller. The final role qualification may be governed by the contract and DPA.",
          "For privacy questions, contact deweb.eu@gmail.com. No dedicated Data Protection Officer has been appointed. For privacy questions, contact deweb.eu@gmail.com.",
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
          "share links, public tokens and access-control metadata",
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
        id: "public-passport-display",
        title: "Public Passport display",
        body: [
          "The public or buyer-facing Supplier Passport may display the supplier logo if uploaded, organization name, location/headquarters/country, industry/activity, employee range, readiness score, section status, certificate expiry summary where provided and safe, and high-level evidence availability.",
          "Evidence Index document names are shown only if the document visibility setting allows metadata/index display. Document names are not shown in summary-only mode. Document download links are not provided unless a future permissioned document access feature is implemented. Private document URLs and storage IDs are never intended for public display.",
        ],
      },
      {
        id: "cookies",
        title: "Cookies",
        body: [
          "Necessary cookies are used for login, security and core application functionality. Optional preferences, analytics and marketing categories require consent before use.",
          "Analytics is not currently active. If introduced, it will be used only in accordance with consent settings and this Policy. Marketing cookies are not currently active unless introduced later with consent.",
          "The Cookie Policy page explains cookie categories and how to reopen the cookie settings panel.",
        ],
      },
      {
        id: "subprocessors",
        title: "Subprocessors",
        body: [
          "Supplier Passport uses or may use Vercel, Nhost, Hasura and Google/Gmail as third-party processors or subprocessors where applicable.",
          "Data may be transferred to the United States and other countries outside the EEA depending on provider infrastructure. Such transfers should be protected by appropriate safeguards such as the EU-U.S. Data Privacy Framework, Standard Contractual Clauses, or equivalent provider DPA safeguards where applicable. DPA execution/status should be confirmed before commercial launch.",
        ],
      },
      {
        id: "transfers",
        title: "International transfers",
        body: [
          "Some providers may process data outside Croatia, the EU or the EEA, including the United States, depending on provider infrastructure.",
          "Appropriate safeguards such as the EU-U.S. Data Privacy Framework, Standard Contractual Clauses, or equivalent provider DPA safeguards should be confirmed where applicable before commercial launch.",
        ],
      },
      {
        id: "retention",
        title: "Retention",
        body: [
          "User account data is retained while the account is active and for up to 24 months after account closure, unless a longer period is required for legal claims, security or dispute resolution.",
          "Organization data and questionnaire answers are retained while the service is used and for up to 24 months after termination, unless the user requests deletion earlier or a different period is agreed.",
          "Documents and supporting evidence are retained until deleted by the user or administrator, or up to 12 months after termination of service, unless otherwise agreed or longer retention is required by law.",
          "Support requests are retained for up to 36 months after the request is closed. Technical and security logs are generally retained for up to 90 days, unless longer retention is required for security, incident investigation or legal reasons.",
          "Cookie consent records are retained for up to 12 months or until the user changes preferences. Share links are retained until deactivated, expired, or the related organization/workspace is deleted.",
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
        body: ["For privacy questions or requests, contact deweb.eu@gmail.com."],
      },
    ],
  },
  hr: {
    effectiveDate: "Zadnje ažurirano: 24.5.2026.",
    hero: {
      eyebrow: "Nacrt za pravnu / GDPR spremnost",
      reviewNote:
        "Ova stranica je nacrt informacija o privatnosti za Supplier Passport i treba je pregledati pravni savjetnik prije komercijalne upotrebe.",
      summary:
        "U ovoj politici objašnjavamo koje osobne podatke obrađujemo, zašto ih obrađujemo, koliko ih čuvamo i koja prava imate.",
      title: "Politika privatnosti",
    },
    placeholders: [
      "Potreban pravni pregled",
      "Status DPA ugovora potrebno je potvrditi prije komercijalnog lansiranja",
      "Regije pružatelja i zaštitne mjere prijenosa treba provjeriti prije komercijalnog lansiranja",
    ],
    tocTitle: "Na ovoj stranici",
    sections: [
      {
        id: "controller",
        title: "Tko je voditelj obrade",
        body: [
          "Supplier Passport pruža deweb j.d.o.o., Prvča 58, 35400 Prvča, Hrvatska, OIB: 24631103366.",
          "Za podatke o korisničkom računu, podršci, sigurnosti, web stranici i vlastitoj administraciji deweb j.d.o.o. djeluje kao voditelj obrade. Za podatke koje korisnik unosi u svoj radni prostor deweb j.d.o.o. u pravilu djeluje kao izvršitelj obrade u odnosu na poslovnog korisnika, dok za podatke o korisničkom računu, podršci, sigurnosti i vlastitoj administraciji djeluje kao voditelj obrade. Konačna kvalifikacija uloga može se urediti ugovorom i DPA dokumentom.",
          "Za pitanja privatnosti kontaktirajte deweb.eu@gmail.com. Nije imenovan zaseban službenik za zaštitu podataka. Za pitanja privatnosti kontaktirajte deweb.eu@gmail.com.",
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
          "share linkovi, javni tokeni i metapodaci kontrole pristupa",
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
        id: "public-passport-display",
        title: "Prikaz javnog Supplier Passporta",
        body: [
          "Javni ili buyer-facing Supplier Passport može prikazivati logo dobavljača ako je učitan, naziv organizacije, lokaciju/sjedište/državu, djelatnost/aktivnost, raspon zaposlenih, rezultat spremnosti, status sekcija, sažetak isteka certifikata gdje je unesen i siguran za prikaz te visoku razinu dostupnosti dokaza.",
          "Nazivi dokumenata u Evidence Indexu prikazuju se samo ako postavka vidljivosti dokumenata dopušta prikaz metapodataka/indeksa. Nazivi dokumenata ne prikazuju se u summary_only načinu. Linkovi za preuzimanje dokumenata nisu dostupni osim ako se u budućnosti implementira permissioned pristup dokumentima. Privatni URL-ovi dokumenata i storage ID-evi nikada nisu namijenjeni javnom prikazu.",
        ],
      },
      {
        id: "cookies",
        title: "Kolačići",
        body: [
          "Nužni kolačići koriste se za prijavu, sigurnost i osnovni rad aplikacije. Neobavezne kategorije preferencija, analitike i marketinga zahtijevaju privolu prije korištenja.",
          "Analitika trenutno nije aktivna. Ako se uvede, koristit će se samo u skladu s postavkama privole i ovom Politikom. Marketinški kolačići trenutno nisu aktivni osim ako se kasnije uvedu uz privolu.",
          "Stranica Politika kolačića objašnjava kategorije kolačića i kako ponovno otvoriti panel postavki kolačića.",
        ],
      },
      {
        id: "subprocessors",
        title: "Podizvršitelji obrade",
        body: [
          "Supplier Passport koristi ili može koristiti Vercel, Nhost, Hasura i Google/Gmail kao treće pružatelje ili podizvršitelje obrade gdje je primjenjivo.",
          "Podaci se mogu prenositi u Sjedinjene Američke Države i druge države izvan EGP-a ovisno o infrastrukturi pružatelja. Takvi prijenosi trebaju biti zaštićeni odgovarajućim zaštitnim mjerama kao što su EU-U.S. Data Privacy Framework, standardne ugovorne klauzule ili ekvivalentne zaštitne mjere DPA pružatelja gdje je primjenjivo. Status DPA ugovora potrebno je potvrditi prije komercijalnog lansiranja.",
        ],
      },
      {
        id: "transfers",
        title: "Međunarodni prijenosi",
        body: [
          "Neki pružatelji usluga mogu obrađivati podatke izvan Hrvatske, EU-a ili EGP-a, uključujući Sjedinjene Američke Države, ovisno o infrastrukturi pružatelja.",
          "Odgovarajuće zaštitne mjere kao što su EU-U.S. Data Privacy Framework, standardne ugovorne klauzule ili ekvivalentne DPA zaštitne mjere pružatelja treba potvrditi gdje je primjenjivo prije komercijalnog lansiranja.",
        ],
      },
      {
        id: "retention",
        title: "Koliko dugo čuvamo podatke",
        body: [
          "Korisnički račun čuva se tijekom trajanja računa i do 24 mjeseca nakon zatvaranja računa, osim ako je duži rok potreban radi pravnih zahtjeva, sigurnosti ili rješavanja sporova.",
          "Organizacijski podaci i odgovori u upitniku čuvaju se tijekom trajanja korištenja usluge i do 24 mjeseca nakon prestanka korištenja, osim ako korisnik ranije zatraži brisanje ili je drugačije ugovoreno.",
          "Dokumenti i dokazna dokumentacija čuvaju se dok ih korisnik ili administrator ne obriše, odnosno najdulje do 12 mjeseci nakon prestanka korištenja usluge, osim ako je drugačije ugovoreno ili je dulje čuvanje potrebno radi pravnih razloga.",
          "Support upiti čuvaju se do 36 mjeseci nakon zatvaranja upita. Tehnički i sigurnosni logovi čuvaju se u pravilu do 90 dana, osim ako je dulje čuvanje potrebno radi sigurnosti, istrage incidenta ili pravnih zahtjeva.",
          "Cookie consent zapis čuva se do 12 mjeseci ili do promjene postavki privole. Share linkovi čuvaju se do deaktivacije, isteka ili brisanja povezane organizacije/radnog prostora.",
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
        body: ["Za pitanja ili zahtjeve vezane uz privatnost kontaktirajte deweb.eu@gmail.com."],
      },
    ],
  },
};
