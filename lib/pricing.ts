export type PricingCategory = "supplier" | "partner" | "buyer";

export type BillingType = "positioning" | "future";

export type PricingPlan = {
  id: string;
  name: string;
  audience: string;
  billingType?: BillingType;
  priceMonthly?: string;
  priceAnnual?: string;
  oneTimePrice?: string;
  pricePrefix?: string;
  displayLabel?: string;
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

export const commercialPlanIds = [
  "starter",
  "supplier-pro",
  "partner",
  "buyer-pilot",
  "buyer-pro",
] as const;

export type CommercialPlanId = (typeof commercialPlanIds)[number];

const demoCtaHref =
  "mailto:hello@supplierpassport.app?subject=Supplier%20Passport%20demo";

export const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    displayLabel: "Request demo",
    audience: "Suppliers preparing a first buyer-ready Supplier Passport.",
    billingType: "positioning",
    description:
      "A focused workspace for getting the core Supplier Passport flow into shape.",
    features: [
      "Supplier Passport workspace",
      "Questionnaire readiness flow",
      "Evidence document upload",
      "Public share link",
      "PDF draft export",
    ],
    setup: "Commercial label only. Billing and limits are not enabled in this version.",
    ctaLabel: "Request a demo",
    ctaHref: demoCtaHref,
    category: "supplier",
  },
  {
    id: "supplier-pro",
    name: "Supplier Pro",
    displayLabel: "Request demo",
    audience: "Suppliers managing recurring buyer requests and evidence readiness.",
    billingType: "positioning",
    description:
      "Positioned for suppliers that need stronger response preparation and operational follow-up.",
    features: [
      "Buyer Request Workspace",
      "Requested-section readiness",
      "Evidence linking and missing actions",
      "Certificate expiry tracking",
      "Response package preparation",
      "Concierge support positioning",
    ],
    setup: "Commercial label only. No plan limits are enforced.",
    badge: "Supplier growth",
    ctaLabel: "Request a demo",
    ctaHref: demoCtaHref,
    highlighted: true,
    category: "supplier",
  },
  {
    id: "partner",
    name: "Partner",
    displayLabel: "Request demo",
    audience: "Consultants, agencies and partner teams assisting multiple supplier clients.",
    billingType: "positioning",
    description:
      "Positioned for assisted onboarding, portfolio management and client handoff workflows.",
    features: [
      "Assisted portfolio grouping",
      "Multi-client concierge dashboard",
      "Internal onboarding notes",
      "Follow-up tracking",
      "Internal handoff summary",
      "Admin risk overview",
    ],
    setup: "Partner accounts and partner login are deferred.",
    ctaLabel: "Request a partner demo",
    ctaHref: demoCtaHref,
    category: "partner",
  },
  {
    id: "buyer-pilot",
    name: "Buyer Pilot",
    displayLabel: "Request demo",
    audience: "Buyer-side discovery conversations and pilot scoping.",
    billingType: "positioning",
    description:
      "Positioned for buyers exploring supplier readiness visibility without buyer portal access yet.",
    features: [
      "Buyer request tracking concept",
      "Supplier readiness summaries",
      "Evidence-on-request positioning",
      "Public Supplier Passport review",
      "Pilot workflow scoping",
    ],
    setup: "Buyer portal, buyer login and email sending are not included yet.",
    ctaLabel: "Request a buyer pilot",
    ctaHref: demoCtaHref,
    category: "buyer",
  },
  {
    id: "buyer-pro",
    name: "Buyer Pro",
    displayLabel: "Future",
    audience: "Future buyer-side supplier network workspace.",
    billingType: "future",
    description:
      "Deferred plan positioning for larger buyer networks and supplier portfolio monitoring.",
    features: [
      "Buyer-side dashboard future",
      "Supplier list future",
      "Buyer request coordination future",
      "Network reporting future",
    ],
    setup: "Future/deferred. Not implemented in this version.",
    ctaLabel: "Talk to us",
    ctaHref: demoCtaHref,
    category: "buyer",
  },
];

export const landingPricingPlanIds = [
  "starter",
  "supplier-pro",
  "partner",
] as const;

export const pricingFaqItems = [
  {
    question: "Is billing enabled?",
    answer:
      "No. These plans are commercial positioning labels for sales and demo conversations. Stripe, billing, checkout and invoices are not implemented.",
  },
  {
    question: "Are plan limits enforced?",
    answer:
      "No. Starter, Supplier Pro, Partner, Buyer Pilot and Buyer Pro are labels only in this version. They do not change product access or enforce limits.",
  },
  {
    question: "Is Buyer Pro available now?",
    answer:
      "No. Buyer Pro is a future/deferred buyer-side concept. This version does not include buyer accounts, buyer login or a buyer portal.",
  },
  {
    question: "Is Supplier Passport a certification?",
    answer:
      "No. Supplier Passport structures supplier-provided sustainability information and supporting evidence. It is not a certification, assurance report, or legal compliance opinion.",
  },
];

export const comparisonRows = [
  {
    feature: "Supplier Passport profile",
    starter: "Included",
    pro: "Included",
    partner: "Client overview",
    buyer: "Public review",
  },
  {
    feature: "VSME-aligned questionnaire",
    starter: "Included",
    pro: "Included",
    partner: "Client overview",
    buyer: "Standardized summary",
  },
  {
    feature: "Evidence Data Room",
    starter: "Included",
    pro: "Included",
    partner: "Client overview",
    buyer: "Evidence on request",
  },
  {
    feature: "Document evidence linking",
    starter: "Available",
    pro: "Included",
    partner: "Client overview",
    buyer: "Summary only",
  },
  {
    feature: "Certificate expiry tracking",
    starter: "Available",
    pro: "Included",
    partner: "Portfolio triage",
    buyer: "Summary only",
  },
  {
    feature: "Public Passport link",
    starter: "Included",
    pro: "Included",
    partner: "Client overview",
    buyer: "Review link",
  },
  {
    feature: "PDF draft export",
    starter: "Included",
    pro: "Included",
    partner: "Client overview",
    buyer: "Supplier-provided",
  },
  {
    feature: "Buyer Request Workspace",
    starter: "Available",
    pro: "Included",
    partner: "Client overview",
    buyer: "Pilot workflow",
  },
  {
    feature: "Admin/Concierge Workspace",
    starter: "Not included",
    pro: "Assisted option",
    partner: "Included",
    buyer: "Not included",
  },
  {
    feature: "Assisted onboarding",
    starter: "Contact us",
    pro: "Contact us",
    partner: "Included",
    buyer: "Pilot scoping",
  },
  {
    feature: "Portfolio grouping",
    starter: "Not included",
    pro: "Not included",
    partner: "Included",
    buyer: "Future",
  },
  {
    feature: "Internal handoff summaries",
    starter: "Not included",
    pro: "Assisted option",
    partner: "Included",
    buyer: "Not included",
  },
  {
    feature: "Buyer-side dashboard",
    starter: "Not included",
    pro: "Not included",
    partner: "Not included",
    buyer: "Future",
  },
  {
    feature: "Billing and limits",
    starter: "Not enabled",
    pro: "Not enabled",
    partner: "Not enabled",
    buyer: "Not enabled",
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
    displayLabel: t.has(`${namespace}.displayLabel`) ? t(`${namespace}.displayLabel`) : plan.displayLabel,
  };
}

export function getPricingDisplay(plan: PricingPlan): PricingDisplay {
  return {
    price: plan.displayLabel ?? (plan.billingType === "future" ? "Future" : "Request demo"),
    cadence: "",
    prefix: plan.pricePrefix,
    subtext: undefined,
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

export function formatCommercialPlanLabel(planKey?: string | null) {
  const normalized = normalizeCommercialPlanKey(planKey);
  const plan = getPricingPlan(normalized);

  return plan?.name ?? "Starter";
}

export function normalizeCommercialPlanKey(planKey?: string | null): CommercialPlanId {
  const normalized = (planKey ?? "")
    .trim()
    .toLowerCase()
    .replaceAll("_", "-");

  if (normalized === "supplierpro") {
    return "supplier-pro";
  }

  if (commercialPlanIds.includes(normalized as CommercialPlanId)) {
    return normalized as CommercialPlanId;
  }

  return "starter";
}
