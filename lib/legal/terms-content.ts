import type { LegalPageContent } from "@/lib/legal/privacy-policy-content";

export const termsContent: Record<"en" | "hr", LegalPageContent> = {
  en: {
    effectiveDate: "Last updated: [DATE]",
    hero: {
      eyebrow: "Legal readiness draft",
      reviewNote:
        "These terms are a legal readiness draft for Supplier Passport and should be reviewed by legal counsel before commercial use.",
      summary: "These terms govern access to and use of the Supplier Passport application and related services.",
      title: "Terms and Conditions",
    },
    placeholders: [
      "[LEGAL ENTITY NAME]",
      "[ADDRESS]",
      "[REGISTRATION / TAX ID]",
      "[CONTACT EMAIL]",
      "[GOVERNING LAW AND JURISDICTION]",
    ],
    tocTitle: "On this page",
    sections: [
      {
        id: "introduction",
        title: "Introduction",
        body: [
          "These Terms and Conditions govern access to and use of Supplier Passport, including the application, public pages, share links, PDF summaries and related support services.",
          "By using the service, the user confirms that they are authorized to use Supplier Passport for their organization and to provide the information submitted through the workspace.",
        ],
      },
      {
        id: "provider",
        title: "Service provider",
        body: [
          "Supplier Passport is provided by [LEGAL ENTITY NAME], [ADDRESS], [REGISTRATION / TAX ID].",
          "For contractual or service questions, contact [CONTACT EMAIL]. These placeholders must be replaced with final legal entity details before commercial launch.",
        ],
      },
      {
        id: "service-description",
        title: "Description of the service",
        body: [
          "Supplier Passport is a SaaS application for preparing a supplier readiness profile, completing a VSME-aligned questionnaire, organizing supporting evidence metadata, creating buyer-safe public summaries, downloading PDF summaries and supporting onboarding/admin workflows where applicable.",
          "The service helps structure supplier information. It does not certify, audit, approve or legally validate a supplier.",
        ],
      },
      {
        id: "account-access",
        title: "User account and access",
        body: [
          "Users are responsible for keeping account credentials secure, providing accurate information and protecting access to their workspace.",
          "Password reset may be available through the application. Access may be suspended if misuse, unauthorized access, security risk or violation of these terms is suspected.",
        ],
      },
      {
        id: "organizations-users",
        title: "Organizations and users",
        body: [
          "Supplier Passport uses an organization/workspace model. Users may act on behalf of an organization when their account is associated with that workspace.",
          "The organization is responsible for the content submitted by its users and for ensuring that users have appropriate permissions to access, upload, link and share information.",
        ],
      },
      {
        id: "user-content",
        title: "User content",
        body: [
          "User content may include questionnaire answers, company profile data, uploaded documents, logos, support requests, buyer request data and related metadata.",
          "Users and their organizations retain responsibility for their content. The service provider receives a limited right to process, store, display and transmit that content only as needed to provide, secure and support Supplier Passport.",
        ],
      },
      {
        id: "evidence-documents",
        title: "Supporting evidence and documents",
        body: [
          "Suppliers upload supporting evidence voluntarily and must have the right to upload and share the documents they provide.",
          "Suppliers should not upload unnecessary sensitive personal data or documents they are not authorized to process. Public links do not automatically expose private evidence files unless a specific feature or setting allows access.",
          "Document access rules may depend on share-link settings, workspace configuration and future document-access workflows.",
        ],
      },
      {
        id: "public-links",
        title: "Public links and sharing",
        body: [
          "Suppliers control creation of public or buyer-specific links. Anyone with a valid link may access the buyer-safe view unless password protection, expiry or deactivation applies.",
          "Suppliers are responsible for sharing links only with intended recipients. Public summaries are not full audits, certificates or assurance reports.",
        ],
      },
      {
        id: "password-links",
        title: "Password-protected links",
        body: [
          "Password protection may limit access to a shared link, but it does not replace the supplier's responsibility to share the link and password securely.",
          "Unless buyer accounts or identity verification are implemented separately, the service does not guarantee the identity of the person who enters a valid password.",
        ],
      },
      {
        id: "acceptable-use",
        title: "Acceptable use restrictions",
        body: ["Users must not misuse Supplier Passport or use it in a way that harms the service, other users or third parties."],
        bullets: [
          "unlawful use or fraudulent activity",
          "uploading malicious files or code",
          "uploading or sharing data without the required rights",
          "attempts to bypass authentication, authorization or security controls",
          "scraping, abuse, excessive automated requests or service disruption",
          "impersonation or misleading representation",
          "use for illegal discrimination, sanctions evasion or other prohibited purposes",
        ],
      },
      {
        id: "plans-pilots-billing",
        title: "Plans, pilots and billing",
        body: [
          "Online billing is not enabled in this version. Pilot, commercial or partner terms may be agreed separately in writing.",
          "No payment obligation arises from using this draft/pilot version unless a separate written agreement states otherwise.",
        ],
      },
      {
        id: "availability",
        title: "Availability and changes",
        body: [
          "The service may change over time as features are improved, added, removed or reconfigured.",
          "Supplier Passport is provided without a guarantee of uninterrupted availability. Maintenance, updates, hosting issues or security work may affect availability.",
        ],
      },
      {
        id: "no-certification",
        title: "Accuracy of data and no certification/audit",
        body: [
          "Supplier Passport is based on data provided by the user/supplier. The service does not constitute an audit, certification, independent assurance report, legal opinion, or guarantee of compliance.",
          "Buyers and other recipients should conduct their own review where required and should not rely solely on a Supplier Passport summary for regulated, legal, procurement or risk decisions.",
        ],
      },
      {
        id: "liability",
        title: "Liability",
        body: [
          "To the extent allowed by applicable law, the service provider is not responsible for incorrect, incomplete or unauthorized user-uploaded data, or for buyer decisions made solely on the basis of a Supplier Passport summary.",
          "Liability terms, exclusions and caps should be reviewed and finalized by legal counsel before commercial launch.",
        ],
      },
      {
        id: "confidentiality-security",
        title: "Confidentiality and security",
        body: [
          "Supplier Passport uses access controls, authentication, organization scoping and private document handling to protect workspace content.",
          "Private documents are not public by default. No system can guarantee absolute security, and users remain responsible for protecting credentials and sharing links carefully.",
        ],
      },
      {
        id: "privacy-data",
        title: "Privacy and data",
        body: [
          "Personal data processing is described in the Privacy Policy. The Privacy Policy is available at /en/privacy.",
        ],
      },
      {
        id: "support",
        title: "Support",
        body: [
          "Support requests may be submitted through the application where available. Response times are not guaranteed unless separately agreed in writing.",
        ],
      },
      {
        id: "termination",
        title: "Termination",
        body: [
          "A user or organization may stop using the service. Account, workspace, document and retention handling is subject to the applicable agreement and privacy retention rules.",
        ],
      },
      {
        id: "governing-law",
        title: "Governing law and disputes",
        body: [
          "Governing law and jurisdiction must be defined before commercial launch: [GOVERNING LAW AND JURISDICTION].",
        ],
      },
      {
        id: "contact",
        title: "Contact",
        body: ["For questions about these terms, contact [CONTACT EMAIL]."],
      },
    ],
  },
  hr: {
    effectiveDate: "Zadnje ažurirano: [DATUM]",
    hero: {
      eyebrow: "Legal readiness nacrt",
      reviewNote:
        "Ovi uvjeti su nacrt za pravnu spremnost Supplier Passporta i treba ih pregledati pravni savjetnik prije komercijalne upotrebe.",
      summary: "Ovi uvjeti uređuju korištenje Supplier Passport aplikacije i povezanih usluga.",
      title: "Uvjeti korištenja",
    },
    placeholders: [
      "[NAZIV PRAVNE OSOBE]",
      "[ADRESA]",
      "[OIB / REGISTRACIJSKI BROJ]",
      "[KONTAKT E-MAIL]",
      "[NADLEŽNO PRAVO I SUD]",
    ],
    tocTitle: "Na ovoj stranici",
    sections: [
      {
        id: "introduction",
        title: "Uvod",
        body: [
          "Ovi Uvjeti korištenja uređuju pristup i korištenje Supplier Passporta, uključujući aplikaciju, javne stranice, share linkove, PDF sažetke i povezane usluge podrške.",
          "Korištenjem usluge korisnik potvrđuje da je ovlašten koristiti Supplier Passport za svoju organizaciju i dostaviti podatke unesene u radni prostor.",
        ],
      },
      {
        id: "provider",
        title: "Tko pruža uslugu",
        body: [
          "Supplier Passport pruža [NAZIV PRAVNE OSOBE], [ADRESA], [OIB / REGISTRACIJSKI BROJ].",
          "Za pitanja o ugovoru ili usluzi kontaktirajte [KONTAKT E-MAIL]. Ove oznake potrebno je zamijeniti finalnim podacima pravne osobe prije komercijalnog lansiranja.",
        ],
      },
      {
        id: "service-description",
        title: "Opis usluge",
        body: [
          "Supplier Passport je SaaS aplikacija za pripremu profila spremnosti dobavljača, ispunjavanje VSME-aligned upitnika, organizaciju metapodataka dokazne dokumentacije, izradu sažetaka sigurnih za kupce, preuzimanje PDF sažetaka i podršku onboarding/admin tijekovima gdje je primjenjivo.",
          "Usluga pomaže strukturirati informacije o dobavljaču. Ona ne certificira, ne revidira, ne odobrava i ne pravno validira dobavljača.",
        ],
      },
      {
        id: "account-access",
        title: "Korisnički račun i pristup",
        body: [
          "Korisnici su odgovorni za čuvanje vjerodajnica računa, unos točnih podataka i zaštitu pristupa svojem radnom prostoru.",
          "Resetiranje lozinke može biti dostupno kroz aplikaciju. Pristup može biti suspendiran ako postoji sumnja na zloupotrebu, neovlašten pristup, sigurnosni rizik ili kršenje ovih uvjeta.",
        ],
      },
      {
        id: "organizations-users",
        title: "Organizacije i korisnici",
        body: [
          "Supplier Passport koristi model organizacije/radnog prostora. Korisnici mogu djelovati u ime organizacije kada je njihov račun povezan s tim radnim prostorom.",
          "Organizacija je odgovorna za sadržaj koji unose njezini korisnici i za to da korisnici imaju odgovarajuće ovlasti za pristup, učitavanje, povezivanje i dijeljenje informacija.",
        ],
      },
      {
        id: "user-content",
        title: "Korisnički sadržaj",
        body: [
          "Korisnički sadržaj može uključivati odgovore u upitniku, podatke o tvrtki, učitane dokumente, logotipe, support upite, podatke o zahtjevima kupaca i povezane metapodatke.",
          "Korisnici i njihove organizacije zadržavaju odgovornost za svoj sadržaj. Pružatelj usluge dobiva ograničeno pravo obrade, pohrane, prikaza i prijenosa tog sadržaja samo koliko je potrebno za pružanje, sigurnost i podršku Supplier Passport usluge.",
        ],
      },
      {
        id: "evidence-documents",
        title: "Dokazna dokumentacija i dokumenti",
        body: [
          "Dobavljači dobrovoljno učitavaju dokaznu dokumentaciju i moraju imati pravo učitati i dijeliti dokumente koje dostavljaju.",
          "Dobavljači ne bi trebali učitavati nepotrebne osjetljive osobne podatke ili dokumente koje nisu ovlašteni obrađivati. Javni linkovi ne izlažu automatski privatne dokazne dokumente osim ako određena funkcionalnost ili postavka dopušta pristup.",
          "Pravila pristupa dokumentima mogu ovisiti o postavkama share linka, konfiguraciji radnog prostora i budućim tijekovima pristupa dokumentima.",
        ],
      },
      {
        id: "public-links",
        title: "Javni linkovi i dijeljenje",
        body: [
          "Dobavljači upravljaju izradom javnih ili buyer-specific linkova. Svatko s važećim linkom može pristupiti prikazu sigurnom za kupce, osim ako se primjenjuje zaštita lozinkom, istek ili deaktivacija.",
          "Dobavljači su odgovorni dijeliti linkove samo s namijenjenim primateljima. Javni sažeci nisu potpune revizije, certifikati ili izvješća s neovisnim uvjerenjem.",
        ],
      },
      {
        id: "password-links",
        title: "Lozinkom zaštićeni linkovi",
        body: [
          "Zaštita lozinkom može ograničiti pristup dijeljenom linku, ali ne zamjenjuje odgovornost dobavljača da link i lozinku dijeli sigurno.",
          "Ako buyer računi ili zasebna provjera identiteta nisu implementirani, usluga ne jamči identitet osobe koja unese ispravnu lozinku.",
        ],
      },
      {
        id: "acceptable-use",
        title: "Ograničenja korištenja",
        body: ["Korisnici ne smiju zloupotrebljavati Supplier Passport niti ga koristiti na način koji šteti usluzi, drugim korisnicima ili trećim osobama."],
        bullets: [
          "nezakonito korištenje ili prijevarne aktivnosti",
          "učitavanje zlonamjernih datoteka ili koda",
          "učitavanje ili dijeljenje podataka bez potrebnih prava",
          "pokušaji zaobilaženja autentikacije, autorizacije ili sigurnosnih kontrola",
          "scraping, zloupotreba, prekomjerni automatizirani zahtjevi ili ometanje usluge",
          "lažno predstavljanje ili zavaravajuće prikazivanje",
          "korištenje za nezakonitu diskriminaciju, zaobilaženje sankcija ili druge zabranjene svrhe",
        ],
      },
      {
        id: "plans-pilots-billing",
        title: "Planovi, piloti i naplata",
        body: [
          "Online naplata nije omogućena u ovoj verziji. Pilot, komercijalni ili partnerski uvjeti mogu biti dogovoreni zasebno u pisanom obliku.",
          "Korištenjem ove draft/pilot verzije ne nastaje obveza plaćanja osim ako zaseban pisani dogovor ne navodi drugačije.",
        ],
      },
      {
        id: "availability",
        title: "Dostupnost i promjene usluge",
        body: [
          "Usluga se može mijenjati tijekom vremena kako se funkcionalnosti poboljšavaju, dodaju, uklanjaju ili ponovno konfiguriraju.",
          "Supplier Passport se pruža bez jamstva neprekinute dostupnosti. Održavanje, ažuriranja, poteškoće hostinga ili sigurnosni radovi mogu utjecati na dostupnost.",
        ],
      },
      {
        id: "no-certification",
        title: "Točnost podataka i odricanje od certifikacije",
        body: [
          "Supplier Passport se temelji na podacima koje dostavlja korisnik/dobavljač. Usluga ne predstavlja reviziju, certifikaciju, neovisno uvjerenje, pravno mišljenje niti jamstvo usklađenosti.",
          "Kupci i drugi primatelji trebaju provesti vlastitu provjeru gdje je potrebno i ne bi se trebali oslanjati isključivo na Supplier Passport sažetak za regulirane, pravne, nabavne ili rizične odluke.",
        ],
      },
      {
        id: "liability",
        title: "Odgovornost",
        body: [
          "U mjeri dopuštenoj primjenjivim pravom, pružatelj usluge nije odgovoran za netočne, nepotpune ili neovlašteno učitane podatke korisnika, niti za odluke kupaca donesene isključivo na temelju Supplier Passport sažetka.",
          "Odredbe o odgovornosti, izuzećima i ograničenjima potrebno je pregledati i finalizirati s pravnim savjetnikom prije komercijalnog lansiranja.",
        ],
      },
      {
        id: "confidentiality-security",
        title: "Povjerljivost i sigurnost",
        body: [
          "Supplier Passport koristi kontrole pristupa, autentikaciju, organizacijsko razgraničenje i privatno postupanje s dokumentima radi zaštite sadržaja radnog prostora.",
          "Privatni dokumenti nisu javni prema zadanim postavkama. Nijedan sustav ne može jamčiti apsolutnu sigurnost, a korisnici ostaju odgovorni za zaštitu vjerodajnica i pažljivo dijeljenje linkova.",
        ],
      },
      {
        id: "privacy-data",
        title: "Privatnost i podaci",
        body: [
          "Obrada osobnih podataka opisana je u Politici privatnosti. Politika privatnosti dostupna je na /hr/privacy.",
        ],
      },
      {
        id: "support",
        title: "Podrška",
        body: [
          "Support upiti mogu se slati kroz aplikaciju gdje je dostupno. Rokovi odgovora nisu zajamčeni osim ako su zasebno dogovoreni u pisanom obliku.",
        ],
      },
      {
        id: "termination",
        title: "Prestanak korištenja",
        body: [
          "Korisnik ili organizacija mogu prestati koristiti uslugu. Postupanje s računom, radnim prostorom, dokumentima i rokovima čuvanja podliježe primjenjivom ugovoru i pravilima čuvanja iz Politike privatnosti.",
        ],
      },
      {
        id: "governing-law",
        title: "Mjerodavno pravo i sporovi",
        body: [
          "Mjerodavno pravo i nadležnost potrebno je definirati prije komercijalnog lansiranja: [DEFINIRATI MJERODAVNO PRAVO I NADLEŽNOST].",
        ],
      },
      {
        id: "contact",
        title: "Kontakt",
        body: ["Za pitanja o ovim uvjetima kontaktirajte [KONTAKT E-MAIL]."],
      },
    ],
  },
};
