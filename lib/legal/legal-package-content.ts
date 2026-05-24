import type { LegalPageContent } from "@/lib/legal/privacy-policy-content";

type LegalPageKey = "cookies" | "dpa" | "security" | "subprocessors";

export const legalPackageContent: Record<LegalPageKey, Record<"en" | "hr", LegalPageContent>> = {
  cookies: {
    en: {
      effectiveDate: "Last updated: [DATE]",
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
        "[LEGAL ENTITY NAME]",
        "[PRIVACY CONTACT EMAIL]",
        "[DATE]",
        "[ADD ACTUAL COOKIES BEFORE COMMERCIAL LAUNCH]",
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
            "Exact cookie names, purposes and lifetimes must be verified before commercial launch: [ADD ACTUAL COOKIES BEFORE COMMERCIAL LAUNCH].",
            "Do not invent cookie names in this policy. Update this section only after the production cookie inventory is confirmed.",
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
            "Analytics cookies may help understand product usage and improve the application.",
            "No optional analytics script should load before analytics consent. If analytics are added later, they must be gated by the cookie consent helper.",
          ],
        },
        {
          id: "marketing",
          title: "Marketing cookies",
          body: [
            "Marketing cookies may be used for campaigns or advertising measurement if such tools are introduced later.",
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
          body: ["For cookie or privacy questions, contact [PRIVACY CONTACT EMAIL]."],
        },
      ],
    },
    hr: {
      effectiveDate: "Zadnje ažurirano: [DATUM]",
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
        "[NAZIV PRAVNE OSOBE]",
        "[KONTAKT E-MAIL ZA PRIVATNOST]",
        "[DATUM]",
        "[DODATI STVARNE KOLAČIĆE PRIJE KOMERCIJALNOG LANSIRANJA]",
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
            "Točne nazive kolačića, svrhe i trajanja potrebno je provjeriti prije komercijalnog lansiranja: [DODATI STVARNE KOLAČIĆE PRIJE KOMERCIJALNOG LANSIRANJA].",
            "Nemojte izmišljati nazive kolačića u ovoj politici. Ažurirajte ovaj odjeljak tek nakon potvrde produkcijskog inventara kolačića.",
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
            "Analitički kolačići mogu pomoći razumjeti korištenje proizvoda i poboljšati aplikaciju.",
            "Nijedna neobavezna analitička skripta ne smije se učitati prije privole za analitiku. Ako se analitika doda kasnije, mora biti ograničena pomoćnom funkcijom za privolu kolačića.",
          ],
        },
        {
          id: "marketing",
          title: "Marketinški kolačići",
          body: [
            "Marketinški kolačići mogu se koristiti za kampanje ili mjerenje oglašavanja ako se takvi alati uvedu kasnije.",
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
          body: ["Za pitanja o kolačićima ili privatnosti kontaktirajte [KONTAKT E-MAIL ZA PRIVATNOST]."],
        },
      ],
    },
  },
  dpa: {
    en: {
      effectiveDate: "Last updated: [DATE]",
      hero: {
        eyebrow: "B2B data protection",
        reviewNote:
          "This document is a working draft and should be reviewed by legal counsel before commercial use.",
        summary:
          "This overview explains the intended data processing terms for B2B customers using Supplier Passport.",
        title: "Data Processing Agreement",
      },
      placeholders: ["[LEGAL ENTITY NAME]", "[CONTACT EMAIL]", "[DPA VERSION]", "[DATE]"],
      tocTitle: "On this page",
      sections: [
        {
          id: "purpose",
          title: "Purpose of the DPA",
          body: [
            "This DPA overview describes how Supplier Passport may process personal data on behalf of B2B customers when providing the application and related services.",
            "A final signed DPA may be required for commercial use and should be reviewed by legal counsel.",
          ],
        },
        {
          id: "roles",
          title: "Roles of the parties",
          body: [
            "The customer is generally expected to act as controller for the organization workspace data it submits. [LEGAL ENTITY NAME] may act as processor for personal data processed to provide Supplier Passport.",
            "For its own account administration, support, security and commercial operations, the provider may act as an independent controller; this must be finalized in legal review.",
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
            "Supplier Passport may use subprocessors for hosting, backend, authentication, storage, email and operational services. The current overview is listed on the Subprocessors page.",
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
            "International transfer safeguards and provider locations must be confirmed before commercial launch.",
          ],
        },
        {
          id: "contact",
          title: "Contact",
          body: ["For DPA questions, contact [CONTACT EMAIL]. DPA version: [DPA VERSION]. Date: [DATE]."],
        },
      ],
    },
    hr: {
      effectiveDate: "Zadnje ažurirano: [DATUM]",
      hero: {
        eyebrow: "B2B zaštita podataka",
        reviewNote:
          "Ovaj dokument je radni nacrt i treba ga pregledati pravni savjetnik prije komercijalne uporabe.",
        summary:
          "Ovaj pregled objašnjava predviđene uvjete obrade podataka za B2B korisnike koji koriste Supplier Passport.",
        title: "Ugovor o obradi podataka",
      },
      placeholders: ["[NAZIV PRAVNE OSOBE]", "[KONTAKT E-MAIL]", "[DPA VERZIJA]", "[DATUM]"],
      tocTitle: "Na ovoj stranici",
      sections: [
        {
          id: "purpose",
          title: "Svrha DPA",
          body: [
            "Ovaj DPA pregled opisuje kako Supplier Passport može obrađivati osobne podatke u ime B2B korisnika pri pružanju aplikacije i povezanih usluga.",
            "Za komercijalnu upotrebu može biti potreban finalni potpisani DPA koji treba pregledati pravni savjetnik.",
          ],
        },
        {
          id: "roles",
          title: "Uloge strana",
          body: [
            "Korisnik se u pravilu očekuje kao voditelj obrade za podatke organizacijskog radnog prostora koje dostavlja. [NAZIV PRAVNE OSOBE] može djelovati kao izvršitelj obrade za osobne podatke obrađene radi pružanja Supplier Passporta.",
            "Za vlastitu administraciju računa, podršku, sigurnost i komercijalne operacije pružatelj može djelovati kao samostalni voditelj obrade; to treba finalizirati u pravnom pregledu.",
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
            "Supplier Passport može koristiti podizvršitelje za hosting, pozadinsku infrastrukturu, autentikaciju, pohranu, e-mail i operativne usluge. Trenutni pregled naveden je na stranici Podizvršitelji obrade.",
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
            "Zaštitne mjere za međunarodne prijenose i lokacije pružatelja potrebno je potvrditi prije komercijalnog lansiranja.",
          ],
        },
        {
          id: "contact",
          title: "Kontakt",
          body: ["Za DPA pitanja kontaktirajte [KONTAKT E-MAIL]. DPA verzija: [DPA VERZIJA]. Datum: [DATUM]."],
        },
      ],
    },
  },
  security: {
    en: {
      effectiveDate: "Last updated: [DATE]",
      hero: {
        eyebrow: "Security overview",
        reviewNote:
          "This page is a security overview, not a certification or independent assurance report.",
        summary:
          "This page explains the security posture of Supplier Passport in supplier- and buyer-friendly language.",
        title: "Security",
      },
      placeholders: ["[SECURITY CONTACT EMAIL]", "[DATE]"],
      tocTitle: "On this page",
      sections: [
        {
          id: "access-authentication",
          title: "Access and authentication",
          body: [
            "Supplier Passport uses authenticated access for supplier and admin workspaces. Password reset and protected share-link verification are handled through controlled application flows.",
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
          body: ["For security questions, contact [SECURITY CONTACT EMAIL]."],
        },
      ],
    },
    hr: {
      effectiveDate: "Zadnje ažurirano: [DATUM]",
      hero: {
        eyebrow: "Pregled sigurnosti",
        reviewNote:
          "Ova stranica je pregled sigurnosti, a ne certifikacija ili izvješće s neovisnim uvjerenjem.",
        summary:
          "Ova stranica objašnjava sigurnosni pristup Supplier Passporta jezikom razumljivim dobavljačima i kupcima.",
        title: "Sigurnost",
      },
      placeholders: ["[KONTAKT E-MAIL ZA SIGURNOST]", "[DATUM]"],
      tocTitle: "Na ovoj stranici",
      sections: [
        {
          id: "access-authentication",
          title: "Pristup i autentikacija",
          body: [
            "Supplier Passport koristi autentificirani pristup za dobavljačke i administratorske radne prostore. Resetiranje lozinke i provjera zaštićenih linkova za dijeljenje odvijaju se kroz kontrolirane aplikacijske tijekove.",
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
          body: ["Za sigurnosna pitanja kontaktirajte [KONTAKT E-MAIL ZA SIGURNOST]."],
        },
      ],
    },
  },
  subprocessors: {
    en: {
      effectiveDate: "Last updated: [DATE]",
      hero: {
        eyebrow: "Provider overview",
        reviewNote:
          "This subprocessor overview is a draft. Provider legal entities, regions and contractual safeguards must be verified before commercial launch.",
        summary:
          "This page lists infrastructure and service providers used or planned for Supplier Passport.",
        title: "Subprocessors",
      },
      placeholders: [
        "[VERIFY LEGAL ENTITY / REGION]",
        "[VERIFY PROVIDER]",
        "[ADD BEFORE COMMERCIAL LAUNCH]",
      ],
      tocTitle: "On this page",
      sections: [
        {
          id: "overview",
          title: "Subprocessor overview",
          body: [
            "The following list describes providers used or expected for hosting, backend, authentication, storage, email and operational services.",
            "Exact provider legal entities, data regions and contractual safeguards must be verified before commercial launch.",
          ],
          table: {
            headers: ["Provider", "Purpose", "Location / region", "Data type", "Status"],
            rows: [
              ["Vercel", "Hosting and frontend deployment", "[VERIFY LEGAL ENTITY / REGION]", "Application pages and operational logs", "Used / verify contract"],
              ["Nhost", "Authentication, backend, database and storage infrastructure", "[VERIFY LEGAL ENTITY / REGION]", "Account, organization, questionnaire and document metadata", "Used / verify contract"],
              ["Hasura / GraphQL", "API and data access layer where configured", "[VERIFY LEGAL ENTITY / REGION]", "Application data accessed through GraphQL", "Used / verify deployment model"],
              ["Email provider", "Password reset and transactional email if configured", "[VERIFY PROVIDER]", "Email address and transactional message metadata", "Verify before commercial launch"],
              ["Analytics provider", "None currently unless later enabled with consent", "Not applicable", "No analytics data currently loaded by default", "Not enabled"],
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
          body: ["For subprocessor questions, contact [PRIVACY CONTACT EMAIL]."],
        },
      ],
    },
    hr: {
      effectiveDate: "Zadnje ažurirano: [DATUM]",
      hero: {
        eyebrow: "Pregled pružatelja",
        reviewNote:
          "Ovaj pregled podizvršitelja obrade je nacrt. Pravne osobe pružatelja, regije i ugovorne zaštitne mjere treba provjeriti prije komercijalnog lansiranja.",
        summary:
          "Ova stranica navodi infrastrukturne i uslužne pružatelje koji se koriste ili planiraju za Supplier Passport.",
        title: "Podizvršitelji obrade",
      },
      placeholders: [
        "[PROVJERITI PRAVNI NAZIV / REGIJU]",
        "[PROVJERITI PROVIDERA]",
        "[DODATI PRIJE KOMERCIJALNOG LANSIRANJA]",
      ],
      tocTitle: "Na ovoj stranici",
      sections: [
        {
          id: "overview",
          title: "Pregled podizvršitelja obrade",
          body: [
            "Sljedeći popis opisuje pružatelje koji se koriste ili očekuju za hosting, pozadinsku infrastrukturu, autentikaciju, pohranu, e-mail i operativne usluge.",
            "Točne pravne osobe pružatelja, podatkovne regije i ugovorne zaštitne mjere potrebno je provjeriti prije komercijalnog lansiranja.",
          ],
          table: {
            headers: ["Naziv", "Svrha", "Lokacija / regija", "Vrsta podataka", "Status"],
            rows: [
              ["Vercel", "Hosting i frontend implementacija", "[PROVJERITI PRAVNI NAZIV / REGIJU]", "Aplikacijske stranice i operativni logovi", "Koristi se / provjeriti ugovor"],
              ["Nhost", "Autentikacija, pozadinska infrastruktura, baza podataka i infrastruktura pohrane", "[PROVJERITI PRAVNI NAZIV / REGIJU]", "Račun, organizacija, upitnik i metapodaci dokumenata", "Koristi se / provjeriti ugovor"],
              ["Hasura / GraphQL", "API i podatkovni pristupni sloj gdje je konfigurirano", "[PROVJERITI PRAVNI NAZIV / REGIJU]", "Aplikacijski podaci dostupni kroz GraphQL", "Koristi se / provjeriti model implementacije"],
              ["Pružatelj e-mail usluge", "Reset lozinke i transakcijski e-mail ako je konfigurirano", "[PROVJERITI PROVIDERA]", "E-mail adresa i metapodaci transakcijskih poruka", "Provjeriti prije komercijalnog lansiranja"],
              ["Pružatelj analitike", "Trenutno nema, osim ako se kasnije omogući uz privolu", "Nije primjenjivo", "Analitički podaci se trenutno ne učitavaju prema zadanim postavkama", "Nije omogućeno"],
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
          body: ["Za pitanja o podizvršiteljima obrade kontaktirajte [KONTAKT E-MAIL ZA PRIVATNOST]."],
        },
      ],
    },
  },
};
