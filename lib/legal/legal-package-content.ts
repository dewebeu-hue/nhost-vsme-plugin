import type { LegalPageContent } from "@/lib/legal/privacy-policy-content";

type LegalPageKey = "cookies" | "dpa" | "security" | "subprocessors";

export const legalPackageContent: Record<LegalPageKey, Record<"en" | "hr", LegalPageContent>> = {
  cookies: {
    en: {
      effectiveDate: "Last updated: 24 May 2026",
      hero: {
        action: {
          label: "Open cookie settings",
          type: "cookieSettings",
        },
        eyebrow: "Cookie preferences",
        reviewNote:
          "This Cookie Policy is a legal readiness draft and should be reviewed before commercial use.",
        summary:
          "This page explains which types of cookies and similar technologies we use, why we use them, and how you can manage your preferences.",
        title: "Cookie Policy",
      },
      placeholders: [
        "Legal counsel review required",
        "Exact production cookie inventory should be verified before commercial launch",
      ],
      tocTitle: "On this page",
      sections: [
        {
          id: "what-are-cookies",
          title: "What are cookies",
          body: [
            "Cookies and similar browser storage technologies help websites and applications remember information, keep sessions secure, and support user preferences.",
            "Supplier Passport uses a cookie preference center so optional categories are off by default until the user gives consent.",
          ],
        },
        {
          id: "necessary",
          title: "Necessary cookies",
          body: [
            "Necessary cookies and related storage are required for login, security, password-protected share links, organization access and core application functionality.",
            "These are used without optional consent because the service cannot function securely without them.",
          ],
        },
        {
          id: "cookie-inventory",
          title: "Cookie inventory",
          body: [
            "Exact cookie names, purposes and lifetimes should be verified before commercial launch. Current known necessary/preference storage includes authentication/session behavior, protected share-link verification where used, cookie consent settings, guided-tour state and interface preferences such as admin theme.",
            "Analytics is not currently active. If introduced, it will be used only in accordance with consent settings and this Policy. Vercel Web Analytics is the recommended future option to evaluate, but it is not installed or loaded in this step.",
          ],
        },
        {
          id: "preferences",
          title: "Preference cookies",
          body: [
            "Preference cookies may remember interface choices such as language, display preferences or onboarding state.",
            "Preference cookies are optional and should be used only after the user enables this category.",
          ],
        },
        {
          id: "analytics",
          title: "Analytics cookies",
          body: [
            "Analytics is not currently active. If introduced, analytics may help understand product usage and improve the application.",
            "No optional analytics script should load before analytics consent. If analytics are added later, it must be gated by the cookie consent helper and reflected in this policy.",
          ],
        },
        {
          id: "marketing",
          title: "Marketing cookies",
          body: [
            "Marketing cookies are not currently active. They may be used for campaigns or advertising measurement only if such tools are introduced later.",
            "No marketing pixel or campaign tracking should load before marketing consent.",
          ],
        },
        {
          id: "manage",
          title: "How to manage preferences",
          body: [
            "You can accept all optional categories, reject optional categories, or choose individual categories in the cookie settings panel.",
            "You can reopen cookie settings at any time from the legal footer or the floating cookie settings control after a decision is saved.",
          ],
        },
        {
          id: "changes",
          title: "Changes to this policy",
          body: [
            "We may update this Cookie Policy as the application or cookie categories change. The latest version will show the last updated date.",
          ],
        },
        {
          id: "contact",
          title: "Contact",
          body: ["For cookie or privacy questions, contact deweb.eu@gmail.com."],
        },
      ],
    },
    hr: {
      effectiveDate: "Zadnje ažurirano: 24.5.2026.",
      hero: {
        action: {
          label: "Otvorite postavke kolačića",
          type: "cookieSettings",
        },
        eyebrow: "Postavke kolačića",
        reviewNote:
          "Ova Politika kolačića je nacrt za pravnu spremnost i treba je pregledati prije komercijalne uporabe.",
        summary:
          "Ova stranica objašnjava koje vrste kolačića i sličnih tehnologija koristimo, zašto ih koristimo i kako možete upravljati postavkama.",
        title: "Politika kolačića",
      },
      placeholders: [
        "Potreban pravni pregled",
        "Točan produkcijski inventar kolačića treba provjeriti prije komercijalnog lansiranja",
      ],
      tocTitle: "Na ovoj stranici",
      sections: [
        {
          id: "what-are-cookies",
          title: "Što su kolačići",
          body: [
            "Kolačići i slične tehnologije pohrane u pregledniku pomažu web stranicama i aplikacijama zapamtiti informacije, održati sesije sigurnima i podržati korisničke postavke.",
            "Supplier Passport koristi centar za postavke kolačića tako da su neobavezne kategorije isključene prema zadanim postavkama dok korisnik ne da privolu.",
          ],
        },
        {
          id: "necessary",
          title: "Nužni kolačići",
          body: [
            "Nužni kolačići i povezana pohrana potrebni su za prijavu, sigurnost, lozinkom zaštićene linkove za dijeljenje, pristup organizaciji i osnovni rad aplikacije.",
            "Koriste se bez neobavezne privole jer usluga bez njih ne može sigurno funkcionirati.",
          ],
        },
        {
          id: "cookie-inventory",
          title: "Inventar kolačića",
          body: [
            "Točne nazive kolačića, svrhe i trajanja treba provjeriti prije komercijalnog lansiranja. Trenutno poznata nužna/preferencijska pohrana uključuje autentikacijsko/sesijsko ponašanje, provjeru zaštićenih share linkova gdje se koristi, postavke cookie privole, stanje vođene ture i postavke sučelja kao što je admin tema.",
            "Analitika trenutno nije aktivna. Ako se uvede, koristit će se samo u skladu s postavkama privole i ovom Politikom. Vercel Web Analytics je preporučena buduća opcija za razmotriti, ali nije instaliran niti učitan u ovom koraku.",
          ],
        },
        {
          id: "preferences",
          title: "Preferencijski kolačići",
          body: [
            "Preferencijski kolačići mogu pamtiti odabire sučelja poput jezika, prikaza ili stanja uvođenja.",
            "Preferencijski kolačići su neobavezni i trebaju se koristiti samo nakon što korisnik omogući ovu kategoriju.",
          ],
        },
        {
          id: "analytics",
          title: "Analitički kolačići",
          body: [
            "Analitika trenutno nije aktivna. Ako se uvede, analitika može pomoći razumjeti korištenje proizvoda i poboljšati aplikaciju.",
            "Nijedna neobavezna analitička skripta ne smije se učitati prije privole za analitiku. Ako se analitika doda kasnije, mora biti ograničena pomoćnom funkcijom za privolu kolačića i opisana u ovoj politici.",
          ],
        },
        {
          id: "marketing",
          title: "Marketinški kolačići",
          body: [
            "Marketinški kolačići trenutno nisu aktivni. Mogu se koristiti za kampanje ili mjerenje oglašavanja samo ako se takvi alati uvedu kasnije.",
            "Marketinški piksel ili praćenje kampanja ne smije se učitati prije privole za marketing.",
          ],
        },
        {
          id: "manage",
          title: "Kako upravljati postavkama",
          body: [
            "Možete prihvatiti sve neobavezne kategorije, odbiti neobavezne kategorije ili odabrati pojedinačne kategorije u panelu postavki kolačića.",
            "Postavke kolačića možete ponovno otvoriti u bilo kojem trenutku iz pravnog podnožja ili plutajuće kontrole nakon spremanja odluke.",
          ],
        },
        {
          id: "changes",
          title: "Promjene politike kolačića",
          body: [
            "Ovu Politiku kolačića možemo ažurirati kako se aplikacija ili kategorije kolačića mijenjaju. Najnovija verzija prikazuje datum zadnjeg ažuriranja.",
          ],
        },
        {
          id: "contact",
          title: "Kontakt",
          body: ["Za pitanja o kolačićima ili privatnosti kontaktirajte deweb.eu@gmail.com."],
        },
      ],
    },
  },
  dpa: {
    en: {
      effectiveDate: "Last updated: 24 May 2026",
      hero: {
        eyebrow: "B2B data protection",
        reviewNote:
          "This document is a working draft and should be reviewed by legal counsel before commercial use.",
        summary:
          "This overview explains the intended data processing terms for B2B customers using Supplier Passport.",
        title: "Data Processing Agreement",
      },
      placeholders: [
        "Legal counsel review required",
        "DPA execution/status should be confirmed before commercial launch",
        "Nhost region and Hasura setup should be verified before commercial launch",
      ],
      tocTitle: "On this page",
      sections: [
        {
          id: "purpose",
          title: "Purpose of the DPA",
          body: [
            "This DPA overview describes how deweb j.d.o.o., Prvča 58, 35400 Prvča, Croatia, VAT/OIB: 24631103366, may process personal data on behalf of B2B customers when providing Supplier Passport and related services.",
            "This is a working draft / overview, not a signed agreement. DPA execution/status should be confirmed before commercial launch and reviewed by legal counsel.",
          ],
        },
        {
          id: "roles",
          title: "Roles of the parties",
          body: [
            "The customer is generally expected to act as controller for the organization workspace data it submits. deweb j.d.o.o. may act as processor for personal data processed to provide Supplier Passport.",
            "For its own account administration, support, security and commercial operations, deweb j.d.o.o. may act as an independent controller; this must be finalized in legal review.",
            "Role allocation may vary by customer and must be confirmed in the final agreement.",
          ],
        },
        {
          id: "subject-duration",
          title: "Subject matter and duration",
          body: [
            "Processing covers account access, organization profile data, questionnaire answers, document metadata, evidence links, public sharing workflows and support operations.",
            "Processing continues while the customer uses the service, subject to deletion, return and retention rules agreed in the final DPA.",
          ],
        },
        {
          id: "personal-data",
          title: "Types of personal data",
          body: [
            "Personal data may include names, email addresses, user roles, support messages, technical logs and personal data contained in customer-uploaded content.",
          ],
        },
        {
          id: "data-subjects",
          title: "Categories of data subjects",
          body: [
            "Data subjects may include customer users, supplier users, organization contacts, support contacts and individuals referenced in uploaded customer content.",
          ],
        },
        {
          id: "instructions",
          title: "Customer instructions",
          body: [
            "Supplier Passport should process customer personal data only on documented customer instructions, including instructions expressed through application configuration and user actions.",
          ],
        },
        {
          id: "confidentiality",
          title: "Confidentiality",
          body: [
            "Personnel with access to customer data should be subject to confidentiality obligations or equivalent professional obligations.",
          ],
        },
        {
          id: "security-measures",
          title: "Security measures",
          body: [
            "Security measures include authentication, access controls, organization scoping, private document handling and operational safeguards appropriate to the service stage.",
          ],
        },
        {
          id: "subprocessors",
          title: "Subprocessors",
          body: [
            "Supplier Passport may use Vercel, Nhost, Hasura and Google/Gmail for hosting, backend, authentication, storage, email and operational services. The current overview is listed on the Subprocessors page.",
            "DPA execution/status with these providers should be confirmed before commercial launch.",
          ],
        },
        {
          id: "rights",
          title: "Assistance with data subject rights",
          body: [
            "Where required by applicable law and agreed terms, Supplier Passport should provide reasonable assistance for customer responses to data subject rights requests.",
          ],
        },
        {
          id: "breach",
          title: "Personal data breach",
          body: [
            "Personal data breach notification obligations, timelines and contact channels must be finalized in the signed DPA.",
          ],
        },
        {
          id: "deletion-return",
          title: "Deletion or return of data",
          body: [
            "Deletion or return of customer data should follow the customer's instructions, the service's technical capabilities and agreed retention requirements.",
          ],
        },
        {
          id: "audits",
          title: "Audits and information",
          body: [
            "Audit and information rights should be documented in the final DPA. This draft overview does not grant a standalone audit right.",
          ],
        },
        {
          id: "transfers",
          title: "International transfers",
          body: [
            "Data may be transferred to the United States and other countries outside the EEA depending on provider infrastructure.",
            "Such transfers should be protected by appropriate safeguards such as the EU-U.S. Data Privacy Framework, Standard Contractual Clauses, or equivalent provider DPA safeguards where applicable. International transfer safeguards and provider locations must be confirmed before commercial launch.",
          ],
        },
        {
          id: "contact",
          title: "Contact",
          body: ["For DPA questions, contact deweb.eu@gmail.com. DPA version: 1.0. Date: 24 May 2026."],
        },
      ],
    },
    hr: {
      effectiveDate: "Zadnje ažurirano: 24.5.2026.",
      hero: {
        eyebrow: "B2B zaštita podataka",
        reviewNote:
          "Ovaj dokument je radni nacrt i treba ga pregledati pravni savjetnik prije komercijalne uporabe.",
        summary:
          "Ovaj pregled objašnjava predviđene uvjete obrade podataka za B2B korisnike koji koriste Supplier Passport.",
        title: "Ugovor o obradi podataka",
      },
      placeholders: [
        "Potreban pravni pregled",
        "Status DPA ugovora potrebno je potvrditi prije komercijalnog lansiranja",
        "Nhost regiju i Hasura setup treba provjeriti prije komercijalnog lansiranja",
      ],
      tocTitle: "Na ovoj stranici",
      sections: [
        {
          id: "purpose",
          title: "Svrha DPA",
          body: [
            "Ovaj DPA pregled opisuje kako deweb j.d.o.o., Prvča 58, 35400 Prvča, Hrvatska, OIB: 24631103366, može obrađivati osobne podatke u ime B2B korisnika pri pružanju Supplier Passport aplikacije i povezanih usluga.",
            "Ovo je radni nacrt / pregled, a ne potpisani ugovor. Status DPA ugovora potrebno je potvrditi prije komercijalnog lansiranja i pregledati s pravnim savjetnikom.",
          ],
        },
        {
          id: "roles",
          title: "Uloge strana",
          body: [
            "Korisnik se u pravilu očekuje kao voditelj obrade za podatke organizacijskog radnog prostora koje dostavlja. deweb j.d.o.o. može djelovati kao izvršitelj obrade za osobne podatke obrađene radi pružanja Supplier Passporta.",
            "Za vlastitu administraciju računa, podršku, sigurnost i komercijalne operacije deweb j.d.o.o. može djelovati kao samostalni voditelj obrade; to treba finalizirati u pravnom pregledu.",
            "Raspodjela uloga može se razlikovati po korisniku i mora se potvrditi u finalnom ugovoru.",
          ],
        },
        {
          id: "subject-duration",
          title: "Predmet i trajanje obrade",
          body: [
            "Obrada obuhvaća pristup računu, podatke profila organizacije, odgovore u upitniku, metapodatke dokumenata, povezivanje dokaza, tijekove javnog dijeljenja i podršku.",
            "Obrada traje dok korisnik koristi uslugu, uz pravila brisanja, povrata i čuvanja dogovorena u finalnom DPA.",
          ],
        },
        {
          id: "personal-data",
          title: "Vrste osobnih podataka",
          body: [
            "Osobni podaci mogu uključivati imena, e-mail adrese, korisničke uloge, poruke podršci, tehničke logove i osobne podatke sadržane u korisnički učitanom sadržaju.",
          ],
        },
        {
          id: "data-subjects",
          title: "Kategorije ispitanika",
          body: [
            "Ispitanici mogu uključivati korisnike kupca, korisnike dobavljača, kontakte organizacije, kontakte podrške i osobe navedene u korisnički učitanom sadržaju.",
          ],
        },
        {
          id: "instructions",
          title: "Upute korisnika",
          body: [
            "Supplier Passport treba obrađivati osobne podatke korisnika samo prema dokumentiranim uputama korisnika, uključujući upute izražene kroz konfiguraciju aplikacije i korisničke radnje.",
          ],
        },
        {
          id: "confidentiality",
          title: "Povjerljivost",
          body: [
            "Osobe s pristupom korisničkim podacima trebaju biti obvezane povjerljivošću ili jednakovrijednim profesionalnim obvezama.",
          ],
        },
        {
          id: "security-measures",
          title: "Sigurnosne mjere",
          body: [
            "Sigurnosne mjere uključuju autentikaciju, kontrole pristupa, organizacijsko razgraničenje, privatno postupanje s dokumentima i operativne zaštitne mjere primjerene fazi usluge.",
          ],
        },
        {
          id: "subprocessors",
          title: "Podizvršitelji obrade",
          body: [
            "Supplier Passport može koristiti Vercel, Nhost, Hasura i Google/Gmail za hosting, pozadinsku infrastrukturu, autentikaciju, pohranu, e-mail i operativne usluge. Trenutni pregled naveden je na stranici Podizvršitelji obrade.",
            "Status DPA ugovora s tim pružateljima potrebno je potvrditi prije komercijalnog lansiranja.",
          ],
        },
        {
          id: "rights",
          title: "Pomoć kod prava ispitanika",
          body: [
            "Gdje je potrebno prema primjenjivom pravu i dogovorenim uvjetima, Supplier Passport treba pružiti razumnu pomoć korisniku pri odgovorima na zahtjeve ispitanika.",
          ],
        },
        {
          id: "breach",
          title: "Povreda osobnih podataka",
          body: [
            "Obveze obavještavanja o povredi osobnih podataka, rokove i kontakt kanale potrebno je finalizirati u potpisanom DPA.",
          ],
        },
        {
          id: "deletion-return",
          title: "Brisanje ili povrat podataka",
          body: [
            "Brisanje ili povrat korisničkih podataka treba slijediti upute korisnika, tehničke mogućnosti usluge i dogovorene zahtjeve čuvanja.",
          ],
        },
        {
          id: "audits",
          title: "Revizije i informacije",
          body: [
            "Prava revizije i informiranja treba dokumentirati u finalnom DPA. Ovaj nacrt pregleda ne daje samostalno pravo revizije.",
          ],
        },
        {
          id: "transfers",
          title: "Međunarodni prijenosi",
          body: [
            "Podaci se mogu prenositi u Sjedinjene Američke Države i druge države izvan EGP-a ovisno o infrastrukturi pružatelja.",
            "Takvi prijenosi trebaju biti zaštićeni odgovarajućim zaštitnim mjerama kao što su EU-U.S. Data Privacy Framework, standardne ugovorne klauzule ili ekvivalentne DPA zaštitne mjere pružatelja gdje je primjenjivo. Zaštitne mjere za međunarodne prijenose i lokacije pružatelja potrebno je potvrditi prije komercijalnog lansiranja.",
          ],
        },
        {
          id: "contact",
          title: "Kontakt",
          body: ["Za DPA pitanja kontaktirajte deweb.eu@gmail.com. DPA verzija: 1.0. Datum: 24.5.2026."],
        },
      ],
    },
  },
  security: {
    en: {
      effectiveDate: "Last updated: 24 May 2026",
      hero: {
        eyebrow: "Security overview",
        reviewNote:
          "This page is a security overview, not a certification or independent assurance report.",
        summary:
          "This page explains the security posture of Supplier Passport in supplier- and buyer-friendly language.",
        title: "Security",
      },
      placeholders: ["Legal counsel review required", "Security process review required as the product grows"],
      tocTitle: "On this page",
      sections: [
        {
          id: "access-authentication",
          title: "Access and authentication",
          body: [
            "Supplier Passport uses authenticated access for supplier and admin workspaces. Password reset and protected share-link verification are handled through controlled application flows.",
            "Admin access is intended to be restricted through admin access controls and allowlist-style checks where configured.",
          ],
        },
        {
          id: "organization-isolation",
          title: "Organization-level data isolation",
          body: [
            "We work to keep organization data separated and access-controlled. Workspace data should be resolved server-side through organization membership and scoped loaders.",
          ],
        },
        {
          id: "evidence-privacy",
          title: "Evidence document privacy",
          body: [
            "Private evidence documents are not publicly downloadable by default. Public pages and PDFs should show buyer-safe summaries and evidence availability, not private document URLs or storage IDs.",
          ],
        },
        {
          id: "public-links",
          title: "Public links and buyer-safe view",
          body: [
            "Public Passport links are intended to show a buyer-safe summary. Share links may include expiry and password protection where configured.",
          ],
        },
        {
          id: "admin-access",
          title: "Admin access",
          body: [
            "Admin workspaces are intended for internal operational support and customer success workflows. Admin notes and support details must not appear on supplier, public, buyer or PDF surfaces.",
          ],
        },
        {
          id: "logs-support",
          title: "Logs and support",
          body: [
            "Operational logs and support workflows should avoid recording secrets, JWTs, cookies, share tokens, passwords, private URLs or document contents.",
          ],
        },
        {
          id: "user-recommendations",
          title: "User security recommendations",
          body: ["Users should protect account credentials, share public links carefully and avoid uploading unnecessary sensitive personal data."],
        },
        {
          id: "limitations",
          title: "Limitations",
          body: [
            "No system can guarantee absolute security. Supplier Passport does not currently claim SOC 2, ISO 27001 or other security certifications unless separately documented by a final legal/security review.",
          ],
        },
        {
          id: "contact",
          title: "Security contact",
          body: ["For security questions, contact deweb.eu@gmail.com."],
        },
      ],
    },
    hr: {
      effectiveDate: "Zadnje ažurirano: 24.5.2026.",
      hero: {
        eyebrow: "Pregled sigurnosti",
        reviewNote:
          "Ova stranica je pregled sigurnosti, a ne certifikacija ili izvješće s neovisnim uvjerenjem.",
        summary:
          "Ova stranica objašnjava sigurnosni pristup Supplier Passporta jezikom razumljivim dobavljačima i kupcima.",
        title: "Sigurnost",
      },
      placeholders: ["Potreban pravni pregled", "Pregled sigurnosnih procesa potreban je kako proizvod raste"],
      tocTitle: "Na ovoj stranici",
      sections: [
        {
          id: "access-authentication",
          title: "Pristup i autentikacija",
          body: [
            "Supplier Passport koristi autentificirani pristup za dobavljačke i administratorske radne prostore. Resetiranje lozinke i provjera zaštićenih linkova za dijeljenje odvijaju se kroz kontrolirane aplikacijske tijekove.",
            "Administratorski pristup namijenjen je ograničavanju kroz kontrole administratorskog pristupa i allowlist provjere gdje su konfigurirane.",
          ],
        },
        {
          id: "organization-isolation",
          title: "Organizacijsko razgraničenje podataka",
          body: [
            "Radimo na sigurnom razdvajanju organizacijskih podataka i kontroli pristupa. Podaci radnog prostora trebaju se dohvaćati na poslužitelju kroz članstvo u organizaciji i učitavanje ograničeno organizacijom.",
          ],
        },
        {
          id: "evidence-privacy",
          title: "Privatnost dokazne dokumentacije",
          body: [
            "Privatni dokazni dokumenti nisu javno dostupni za preuzimanje prema zadanim postavkama. Javne stranice i PDF-ovi trebaju prikazivati sažetke sigurne za kupce i dostupnost dokaza, a ne privatne URL-ove dokumenata ili ID-eve pohrane.",
          ],
        },
        {
          id: "public-links",
          title: "Javni linkovi i prikaz siguran za kupce",
          body: [
            "Javni Supplier Passport linkovi namijenjeni su prikazu sažetka sigurnog za kupce. Linkovi za dijeljenje mogu uključivati istek i zaštitu lozinkom gdje je konfigurirano.",
          ],
        },
        {
          id: "admin-access",
          title: "Admin pristup",
          body: [
            "Administratorski radni prostori namijenjeni su internim operativnim tijekovima i korisničkom uspjehu. Administratorske bilješke i detalji podrške ne smiju se prikazivati na dobavljačkim, javnim, kupčevim ili PDF površinama.",
          ],
        },
        {
          id: "logs-support",
          title: "Evidencija i podrška",
          body: [
            "Operativni logovi i tijekovi podrške trebaju izbjegavati zapisivanje tajni, JWT-ova, kolačića, tokena za dijeljenje, lozinki, privatnih URL-ova ili sadržaja dokumenata.",
          ],
        },
        {
          id: "user-recommendations",
          title: "Sigurnosne preporuke za korisnike",
          body: ["Korisnici trebaju čuvati vjerodajnice računa, pažljivo dijeliti javne linkove i izbjegavati učitavanje nepotrebnih osjetljivih osobnih podataka."],
        },
        {
          id: "limitations",
          title: "Ograničenja",
          body: [
            "Nijedan sustav ne može jamčiti apsolutnu sigurnost. Supplier Passport trenutno ne tvrdi SOC 2, ISO 27001 ili druge sigurnosne certifikacije osim ako su zasebno dokumentirane finalnim pravnim/sigurnosnim pregledom.",
          ],
        },
        {
          id: "contact",
          title: "Kontakt za sigurnosna pitanja",
          body: ["Za sigurnosna pitanja kontaktirajte deweb.eu@gmail.com."],
        },
      ],
    },
  },
  subprocessors: {
    en: {
      effectiveDate: "Last updated: 24 May 2026",
      hero: {
        eyebrow: "Provider overview",
        reviewNote:
          "This subprocessor overview is a draft. Provider legal entities, regions and contractual safeguards must be verified before commercial launch.",
        summary:
          "This page lists infrastructure and service providers used or planned for Supplier Passport.",
        title: "Subprocessors",
      },
      placeholders: [
        "[VERIFY NHOST REGION IN CONFIGURATION]",
        "[VERIFY DEPENDING ON NHOST/HASURA SETUP]",
        "DPA execution/status should be confirmed before commercial launch",
      ],
      tocTitle: "On this page",
      sections: [
        {
          id: "overview",
          title: "Subprocessor overview",
          body: [
            "The following list describes providers used or expected for hosting, backend, authentication, storage, email, communication and operational services.",
            "Data may be transferred to the United States and other countries outside the EEA depending on provider infrastructure. Such transfers should be protected by appropriate safeguards such as the EU-U.S. Data Privacy Framework, Standard Contractual Clauses, or equivalent provider DPA safeguards where applicable.",
            "DPA execution/status should be confirmed before commercial launch.",
          ],
          table: {
            headers: ["Provider", "Purpose", "Location / region", "Data type", "Status"],
            rows: [
              ["Vercel", "Hosting frontend application, deployment, edge/CDN infrastructure and security protection", "Global infrastructure; possible transfers outside the EEA, including the United States", "Technical request data, IP addresses in security/log records, public pages and application traffic", "Active; DPA/safeguards status should be confirmed before commercial launch"],
              ["Nhost", "Authentication, database, storage and backend infrastructure", "[VERIFY NHOST REGION IN CONFIGURATION]", "User accounts, organizations, questionnaire, documents, share links and support requests", "Active; DPA should be confirmed/executed before commercial launch"],
              ["Hasura", "GraphQL/API layer and data access", "[VERIFY DEPENDING ON NHOST/HASURA SETUP]", "Application data available through the GraphQL layer", "Active or part of Nhost infrastructure; verify contractual status"],
              ["Google/Gmail", "Mailbox for privacy, security and support communication", "Global Google infrastructure; possible transfers outside the EEA", "Email addresses and communication content sent by the user to the contact address", "Active for communication"],
              ["Vercel Web Analytics", "Recommended future web analytics", "Vercel infrastructure", "Aggregated/anonymized web analytics data according to Vercel documentation", "Not active in the application; planned/consider later"],
            ],
          },
        },
        {
          id: "updates",
          title: "Updates to this list",
          body: [
            "This list should be updated before adding a provider that processes customer personal data. Customers should receive notice where required by the final DPA.",
          ],
        },
        {
          id: "contact",
          title: "Contact",
          body: ["For subprocessor questions, contact deweb.eu@gmail.com."],
        },
      ],
    },
    hr: {
      effectiveDate: "Zadnje ažurirano: 24.5.2026.",
      hero: {
        eyebrow: "Pregled pružatelja",
        reviewNote:
          "Ovaj pregled podizvršitelja obrade je nacrt. Pravne osobe pružatelja, regije i ugovorne zaštitne mjere treba provjeriti prije komercijalnog lansiranja.",
        summary:
          "Ova stranica navodi infrastrukturne i uslužne pružatelje koji se koriste ili planiraju za Supplier Passport.",
        title: "Podizvršitelji obrade",
      },
      placeholders: [
        "[PROVJERITI REGIJU U NHOST KONFIGURACIJI]",
        "[PROVJERITI OVISNO O KORIŠTENOM NHOST/HASURA SETUPU]",
        "Status DPA ugovora potrebno je potvrditi prije komercijalnog lansiranja",
      ],
      tocTitle: "Na ovoj stranici",
      sections: [
        {
          id: "overview",
          title: "Pregled podizvršitelja obrade",
          body: [
            "Sljedeći popis opisuje pružatelje koji se koriste ili očekuju za hosting, pozadinsku infrastrukturu, autentikaciju, pohranu, e-mail, komunikaciju i operativne usluge.",
            "Podaci se mogu prenositi u Sjedinjene Američke Države i druge države izvan EGP-a ovisno o infrastrukturi pružatelja. Takvi prijenosi trebaju biti zaštićeni odgovarajućim zaštitnim mjerama kao što su EU-U.S. Data Privacy Framework, standardne ugovorne klauzule ili ekvivalentne DPA zaštitne mjere pružatelja gdje je primjenjivo.",
            "Status DPA ugovora potrebno je potvrditi prije komercijalnog lansiranja.",
          ],
          table: {
            headers: ["Naziv", "Svrha", "Lokacija / regija", "Vrsta podataka", "Status"],
            rows: [
              ["Vercel", "hosting frontend aplikacije, deployment, edge/CDN infrastruktura i sigurnosna zaštita", "globalna infrastruktura; mogući prijenosi izvan EGP-a, uključujući SAD", "tehnički podaci o zahtjevima, IP adrese u sigurnosnim/log zapisima, javne stranice i aplikacijski promet", "aktivan; DPA/status zaštitnih mjera potvrditi prije komercijalnog lansiranja"],
              ["Nhost", "autentikacija, baza podataka, storage, backend infrastruktura", "[PROVJERITI REGIJU U NHOST KONFIGURACIJI]", "korisnički računi, organizacije, upitnik, dokumenti, share linkovi, support upiti", "aktivan; DPA potrebno potvrditi/potpisati prije komercijalnog lansiranja"],
              ["Hasura", "GraphQL/API sloj i pristup podacima", "[PROVJERITI OVISNO O KORIŠTENOM NHOST/HASURA SETUPU]", "aplikacijski podaci dostupni kroz GraphQL sloj", "aktivan ili dio Nhost infrastrukture; provjeriti ugovorni status"],
              ["Google/Gmail", "mailbox za privacy, security i support komunikaciju", "globalna Google infrastruktura; mogući prijenosi izvan EGP-a", "e-mail adrese, sadržaj komunikacije koju korisnik pošalje na kontakt adresu", "aktivan za komunikaciju"],
              ["Vercel Web Analytics", "preporučena buduća web analitika", "Vercel infrastruktura", "agregirani/anonymized web analytics podaci prema Vercel dokumentaciji", "nije aktivno u aplikaciji, planirano/razmotriti kasnije"],
            ],
          },
        },
        {
          id: "updates",
          title: "Ažuriranje popisa",
          body: [
            "Ovaj popis treba ažurirati prije dodavanja pružatelja koji obrađuje osobne podatke korisnika. Korisnici trebaju dobiti obavijest gdje je to potrebno prema finalnom DPA.",
          ],
        },
        {
          id: "contact",
          title: "Kontakt",
          body: ["Za pitanja o podizvršiteljima obrade kontaktirajte deweb.eu@gmail.com."],
        },
      ],
    },
  },
};
