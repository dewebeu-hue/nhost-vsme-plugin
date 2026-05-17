export type PricingCategory =
  | "sme"
  | "setup"
  | "one_time"
  | "partner"
  | "buyer"
  | "founding";

export type BillingCycle = "monthly" | "annual";

export type BillingType = "monthly" | "annual" | "one_time" | "custom";

export type PricingPlan = {
  id: string;
  name: string;
  audience: string;
  priceMonthly?: string;
  priceAnnual?: string;
  oneTimePrice?: string;
  annualEquivalentMonthly?: string;
  billingType?: BillingType;
  monthlySubtext?: string;
  annualSubtext?: string;
  pricePrefix?: string;
  description: string;
  features: string[];
  limitations?: string[];
  setup?: string;
  badge?: string;
  ctaLabel: string;
  ctaHref: string;
  highlighted?: boolean;
  category: PricingCategory;
};

export const pricingPlans: PricingPlan[] = [
  {
    id: "supplier-passport-setup",
    name: "Supplier Passport Setup",
    audience: "Companies that want expert help preparing their first buyer-ready passport.",
    billingType: "one_time",
    oneTimePrice: "499 €",
    pricePrefix: "",
    description:
      "Assisted setup for companies that want help preparing their first Supplier Passport.",
    features: [
      "Review of existing documents",
      "Initial company profile structuring",
      "Mapping documents to VSME sections",
      "Missing data checklist",
      "First Supplier Passport link",
      "Basic review before sending to buyer",
    ],
    setup: "Can be added to Starter. Required/recommended for Supplier Pro. One-time fee.",
    ctaLabel: "Add assisted setup",
    ctaHref: "/contact",
    category: "setup",
  },
  {
    id: "starter",
    name: "Starter",
    audience: "Micro suppliers and companies with one EU buyer.",
    annualEquivalentMonthly: "79 €",
    billingType: "monthly",
    monthlySubtext: "or 950 €/year",
    annualSubtext: "equivalent to 79 €/month, billed annually",
    priceMonthly: "99 €",
    priceAnnual: "950 €",
    description: "For micro suppliers and companies with one EU buyer.",
    features: [
      "1 company",
      "1 user",
      "1 active Supplier Passport link",
      "Basic VSME readiness profile",
      "Up to 15 documents",
      "Basic PDF export",
      "Email support",
    ],
    limitations: [
      "No unlimited share links",
      "No Excel export",
      "No priority support",
      "No automatic certificate expiry reminders",
      "No buyer questionnaire workspace",
      "No audit trail",
      "No annual profile review",
    ],
    setup: "Optional assisted setup — 499 €.",
    ctaLabel: "Start with Starter",
    ctaHref: "/contact",
    category: "sme",
  },
  {
    id: "supplier-pro",
    name: "Supplier Pro",
    audience:
      "SME exporters, manufacturers, logistics companies, packaging companies, metal/plastic suppliers, automotive suppliers, and serious B2B suppliers.",
    annualEquivalentMonthly: "199 €",
    billingType: "monthly",
    monthlySubtext: "or 2.390 €/year",
    annualSubtext: "equivalent to 199 €/month, billed annually",
    priceMonthly: "249 €",
    priceAnnual: "2.390 €",
    description:
      "Main package for serious B2B suppliers managing buyer readiness, evidence, and recurring compliance requests.",
    features: [
      "Up to 5 users",
      "Unlimited Supplier Passport links",
      "Up to 100 documents",
      "Document Vault",
      "Link documents to VSME questions",
      "Certificate expiry reminders",
      "PDF export",
      "Excel export",
      "Buyer questionnaire workspace",
      "Missing data dashboard",
      "Audit trail",
      "Priority support",
    ],
    setup: "Supplier Passport Setup — 499 € one-time.",
    badge: "Most popular",
    ctaLabel: "Start Supplier Pro",
    ctaHref: "/contact",
    highlighted: true,
    category: "sme",
  },
  {
    id: "starter-annual",
    name: "Starter annual",
    audience: "Annual Starter plan with approximately 20% discount.",
    annualEquivalentMonthly: "79 €",
    billingType: "annual",
    annualSubtext: "equivalent to 79 €/month, billed annually",
    priceAnnual: "950 €",
    description:
      "Annual Starter for micro suppliers that want one buyer-ready passport workspace at a lower yearly cost.",
    features: [
      "1 company",
      "1 user",
      "1 active Supplier Passport link",
      "Basic VSME readiness profile",
      "Up to 15 documents",
      "Basic PDF export",
      "Email support",
    ],
    setup: "Self-service. Optional Supplier Passport Setup — 499 €.",
    badge: "Annual discount",
    ctaLabel: "Start with Starter",
    ctaHref: "/contact",
    category: "sme",
  },
  {
    id: "supplier-pro-annual",
    name: "Supplier Pro annual",
    audience:
      "Annual version of the main Pro package with approximately 20% discount.",
    annualEquivalentMonthly: "199 €",
    billingType: "annual",
    annualSubtext: "equivalent to 199 €/month, billed annually",
    priceAnnual: "2.390 €",
    description:
      "Annual Supplier Pro for companies that want price stability and a yearly passport review.",
    features: [
      "Up to 5 users",
      "Unlimited Supplier Passport links",
      "Up to 100 documents",
      "Document Vault",
      "Link documents to VSME questions",
      "Certificate expiry reminders",
      "PDF export",
      "Excel export",
      "Buyer questionnaire workspace",
      "Missing data dashboard",
      "Audit trail",
      "Priority support",
      "1 annual Supplier Passport profile review",
      "Price lock for the annual contract period",
    ],
    setup: "Supplier Passport Setup — 499 €.",
    badge: "Annual value",
    ctaLabel: "Start Supplier Pro",
    ctaHref: "/contact",
    category: "sme",
  },
  {
    id: "vsme-passport-sprint",
    name: "VSME Passport Sprint",
    audience:
      "Companies that do not want a subscription yet, but need to handle one concrete buyer request.",
    billingType: "one_time",
    oneTimePrice: "990 €",
    description:
      "A focused one-time path to prepare a first Supplier Passport for a specific buyer request.",
    features: [
      "Profile setup",
      "Review of existing documents",
      "Basic VSME readiness profile",
      "Mapping documents to sections",
      "Missing data checklist",
      "First Supplier Passport PDF/link",
      "Basic review before sending to buyer",
      "30 days of platform access",
    ],
    setup: "After 30 days, move to Starter — 99 €/month or Supplier Pro — 249 €/month.",
    ctaLabel: "Book Passport Sprint",
    ctaHref: "/contact",
    category: "one_time",
  },
  {
    id: "partner-consultant",
    name: "Partner / Consultant",
    audience:
      "ESG consultants, ISO consultants, accountants, advisors, and agencies managing multiple SME clients.",
    priceMonthly: "499 €",
    billingType: "monthly",
    annualSubtext: "custom annual contract",
    pricePrefix: "from",
    description:
      "For advisors and consulting teams managing Supplier Passport workflows across multiple clients.",
    features: [
      "Multiple clients",
      "Client dashboard",
      "Status overview by company",
      "Reusable templates",
      "Internal notes",
      "Consultant review workflow",
      "Basic admin / concierge panel",
      "Generate Supplier Passports for clients",
      "White-label option",
      "Custom branding",
      "Partner reporting",
      "Team permissions",
      "API access",
    ],
    ctaLabel: "Book partner demo",
    ctaHref: "/contact",
    category: "partner",
  },
  {
    id: "buyer-pilot",
    name: "Buyer Pilot",
    audience: "Larger buyers who want to monitor up to 25 suppliers.",
    priceMonthly: "599 €",
    billingType: "monthly",
    annualSubtext: "annual contract recommended",
    pricePrefix: "from",
    description:
      "Pilot buyer workspace for monitoring supplier readiness and missing data across up to 25 suppliers.",
    features: [
      "Buyer dashboard",
      "Invite suppliers",
      "Supplier completion status",
      "Basic supplier risk overview",
      "Missing data status overview",
      "Data export",
      "Basic reporting",
      "Up to 25 suppliers",
      "Prefer annual contract or at least quarterly commitment",
    ],
    ctaLabel: "Book buyer pilot",
    ctaHref: "/contact",
    category: "buyer",
  },
  {
    id: "buyer-pro",
    name: "Buyer Pro",
    audience: "Larger buyers with 50+ suppliers.",
    priceMonthly: "1.200 €",
    billingType: "monthly",
    annualSubtext: "annual contract recommended",
    pricePrefix: "from",
    description:
      "Buyer-side supplier tracking for larger procurement teams and supplier networks.",
    features: [
      "50+ suppliers",
      "Multiple internal teams",
      "Custom questionnaires",
      "Supplier reminders",
      "Buyer reporting",
      "Supplier status dashboard",
      "Priority support",
      "Supplier onboarding",
      "Custom branding",
      "For 50–150 suppliers, realistic range is 1.200–2.500 €/month",
      "For larger systems, custom enterprise pricing",
    ],
    ctaLabel: "Contact sales",
    ctaHref: "/contact",
    category: "buyer",
  },
  {
    id: "founding-partner-program",
    name: "Founding Partner Program",
    audience: "First 10 partner companies from Croatia or the region.",
    billingType: "custom",
    priceMonthly: "99 €",
    oneTimePrice: "0 € setup",
    description:
      "Selective early partner program for companies willing to shape Supplier Passport around real EU buyer requirements.",
    features: [
      "Free setup",
      "Basic Supplier Pro workflow",
      "Supplier Passport link",
      "Document Vault",
      "Missing data checklist",
      "Feedback collaboration",
      "Customer provides concrete feedback",
      "Customer participates in 2–3 short product calls",
      "Customer allows the product to be shaped around real EU buyer requirements",
    ],
    badge: "First 10 companies",
    ctaLabel: "Apply as founding partner",
    ctaHref: "/contact",
    category: "founding",
  },
];

export const landingPricingPlanIds = [
  "starter",
  "supplier-pro",
  "vsme-passport-sprint",
] as const;

export const pricingFaqItems = [
  {
    question: "Do I need the Supplier Passport Setup?",
    answer:
      "Starter can be self-service, but assisted setup helps companies structure their first profile, map evidence, and prepare a buyer-ready passport faster. It is required/recommended for Supplier Pro.",
  },
  {
    question: "Can I start with the VSME Passport Sprint only?",
    answer:
      "Yes. The Sprint is designed for one concrete buyer request when you are not ready for a subscription yet.",
  },
  {
    question: "What is the difference between Supplier Passport Setup and VSME Passport Sprint?",
    answer:
      "Supplier Passport Setup is an assisted setup add-on for Starter or Supplier Pro subscriptions. It helps structure your company profile, documents, and first Passport workspace. VSME Passport Sprint is a standalone one-time package for companies that need to respond to one concrete buyer request, including setup, document review, first Passport PDF/link, and 30 days of platform access.",
  },
  {
    question: "What happens after the 30-day Sprint access?",
    answer:
      "You can move to Starter at 99 €/month or Supplier Pro at 249 €/month to keep managing documents, links, and future buyer requests.",
  },
  {
    question: "What is the difference between Starter and Supplier Pro?",
    answer:
      "Starter covers one user, one active passport link, and up to 15 documents. Supplier Pro adds unlimited passport links, up to 100 documents, Document Vault, document-question linking, reminders, exports, buyer questionnaire workspace, audit trail, and priority support.",
  },
  {
    question: "Is this a certification or assurance report?",
    answer:
      "No. This product structures supplier-provided sustainability information and supporting evidence. It is not a certification, assurance report, or legal compliance opinion.",
  },
  {
    question: "Can buyers access my documents?",
    answer:
      "Yes, but only through controlled Supplier Passport links that are designed for read-only, permissioned buyer review.",
  },
  {
    question: "Can consultants manage multiple clients?",
    answer:
      "Yes. The Partner / Consultant plan is designed for consultants, advisors, and agencies managing several SME supplier clients.",
  },
  {
    question: "Do you support buyer-side supplier tracking?",
    answer:
      "Yes. Buyer Pilot and Buyer Pro support supplier invitations, status tracking, missing data overviews, exports, reporting, and larger supplier networks.",
  },
];

export const comparisonRows = [
  {
    feature: "Supplier Passport Setup",
    starter: "Optional, 499 €",
    pro: "Recommended, 499 €",
    sprint: "Included",
    partner: "Client-based",
  },
  {
    feature: "Active Supplier Passport links",
    starter: "1",
    pro: "Unlimited",
    sprint: "First PDF/link",
    partner: "Multiple clients",
  },
  {
    feature: "Document capacity",
    starter: "15 documents",
    pro: "100 documents",
    sprint: "Buyer request package",
    partner: "Client-based",
  },
  {
    feature: "Evidence management",
    starter: "Basic",
    pro: "Document Vault + linking",
    sprint: "Mapped once",
    partner: "Reusable templates",
  },
  {
    feature: "Exports",
    starter: "PDF",
    pro: "PDF + Excel",
    sprint: "PDF/link",
    partner: "Client reporting",
  },
  {
    feature: "Operational controls",
    starter: "Email support",
    pro: "Reminders + audit trail",
    sprint: "30 days access",
    partner: "Admin / concierge workflow",
  },
];

export type PricingDisplay = {
  price: string;
  cadence: string;
  prefix?: string;
  subtext?: string;
};

type PricingTranslator = {
  (key: string): string;
  raw: (key: string) => unknown;
  has: (key: string) => boolean;
};

export function localizePricingPlan(plan: PricingPlan, t: PricingTranslator): PricingPlan {
  const namespace = `plans.${plan.id}`;

  return {
    ...plan,
    name: t.has(`${namespace}.name`) ? t(`${namespace}.name`) : plan.name,
    audience: t.has(`${namespace}.audience`) ? t(`${namespace}.audience`) : plan.audience,
    description: t.has(`${namespace}.description`)
      ? t(`${namespace}.description`)
      : plan.description,
    features: t.has(`${namespace}.features`)
      ? (t.raw(`${namespace}.features`) as string[])
      : plan.features,
    limitations:
      plan.limitations && t.has(`${namespace}.limitations`)
        ? (t.raw(`${namespace}.limitations`) as string[])
        : plan.limitations,
    setup: t.has(`${namespace}.setup`) ? t(`${namespace}.setup`) : plan.setup,
    badge: plan.badge && t.has(`${namespace}.badge`) ? t(`${namespace}.badge`) : plan.badge,
    ctaLabel: t.has(`${namespace}.ctaLabel`) ? t(`${namespace}.ctaLabel`) : plan.ctaLabel,
    monthlySubtext: t.has(`${namespace}.monthlySubtext`)
      ? t(`${namespace}.monthlySubtext`)
      : plan.monthlySubtext,
    annualSubtext: t.has(`${namespace}.annualSubtext`)
      ? t(`${namespace}.annualSubtext`)
      : plan.annualSubtext,
  };
}

export function getPricingDisplay(
  plan: PricingPlan,
  billingCycle: BillingCycle,
): PricingDisplay {
  if (plan.oneTimePrice && plan.billingType !== "custom") {
    return {
      price: plan.oneTimePrice,
      cadence: "one-time",
      prefix: plan.pricePrefix,
      subtext: plan.monthlySubtext,
    };
  }

  if (billingCycle === "annual" && plan.priceAnnual) {
    return {
      price: plan.priceAnnual,
      cadence: "year",
      prefix: plan.pricePrefix,
      subtext: plan.annualSubtext,
    };
  }

  if (plan.priceMonthly) {
    return {
      price: plan.priceMonthly,
      cadence: "month",
      prefix: plan.pricePrefix,
      subtext: billingCycle === "annual" ? plan.annualSubtext : plan.monthlySubtext,
    };
  }

  if (plan.priceAnnual) {
    return {
      price: plan.priceAnnual,
      cadence: "year",
      prefix: plan.pricePrefix,
      subtext: plan.annualSubtext,
    };
  }

  return {
    price: plan.oneTimePrice ?? "Custom",
    cadence: plan.oneTimePrice ? "one-time" : "",
    prefix: plan.pricePrefix,
    subtext: billingCycle === "annual" ? plan.annualSubtext : plan.monthlySubtext,
  };
}

export function getPricingPlan(id: PricingPlan["id"]) {
  return pricingPlans.find((plan) => plan.id === id);
}

export function getLandingPricingPlans() {
  return landingPricingPlanIds
    .map((id) => getPricingPlan(id))
    .filter((plan): plan is PricingPlan => Boolean(plan));
}

export function getPricingPlansByCategory(category: PricingCategory) {
  return pricingPlans.filter((plan) => plan.category === category);
}
