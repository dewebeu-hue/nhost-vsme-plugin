export const landingPageCopy = {
  heroTitlePrefix: "Prepare your VSME profile once. Share it with",
  heroTitleEmphasis: "every buyer.",
  heroDescription:
    "Build your VSME / ESG profile, organize evidence documents, track readiness, and share a secure passport link with EU buyers—instantly.",
  primaryCta: "Start Passport Sprint",
  secondaryCta: "See Sample Passport",
  trustChips: [
    "EU-aligned & VSME-ready",
    "Secure & permissioned",
    "Organized evidence",
  ],
} as const;

export const featureDescriptions = [
  {
    title: "VSME Readiness Questionnaire",
    description:
      "Guide teams through VSME profile completion with clear module progress, evidence prompts, and review-ready answers.",
  },
  {
    title: "Evidence Data Room",
    description:
      "Centralize policies, certificates, reports, and registers in one secure workspace mapped to buyer questions.",
  },
  {
    title: "Missing Data Dashboard",
    description:
      "See unanswered fields, expiring evidence, and buyer follow-ups before they slow down procurement.",
  },
  {
    title: "Secure Buyer Share Link",
    description:
      "Publish a controlled passport link with read-only access, expiry dates, and buyer-friendly summaries.",
  },
] as const;

export const howItWorksSteps = [
  {
    title: "Complete profile",
    description: "Answer structured VSME questions once with clear ownership and progress.",
  },
  {
    title: "Upload evidence",
    description: "Attach policies, certificates, reports, and registers to the right disclosures.",
  },
  {
    title: "Generate passport",
    description: "Turn completed answers and selected evidence into a polished buyer view.",
  },
  {
    title: "Share with buyer",
    description: "Send a secure, read-only link with permissions and expiry controls.",
  },
] as const;

export const socialProofCopy = {
  logos: [
    "Lumen Technologies",
    "GreenParts Industries",
    "Nova Packaging",
    "Metaline Solutions",
    "EcoTextile Group",
  ],
  quote:
    "Supplier Passport helped us prepare our VSME profile in weeks, not months. Buyers love the clarity and the secure access.",
  person: "Supplier team",
  role: "Product example",
} as const;

export const ctaLabels = {
  startPassport: "Start Passport Sprint",
  seeSamplePassport: "See Sample Passport",
  bookDemo: "Book a Demo",
  login: "Login",
  continueQuestionnaire: "Continue questionnaire",
  uploadEvidence: "Upload evidence",
  reviewMissingData: "Review missing data",
  shareWithBuyer: "Share with buyer",
  copySecureLink: "Copy secure link",
  openAdminReview: "Open admin review",
} as const;

export const emptyStateCopy = {
  buyerRequests: {
    title: "No buyer requests yet",
    description: "When a buyer asks for evidence or clarification, requests will appear here.",
    action: "Create sample request",
  },
  documents: {
    title: "No evidence documents uploaded",
    description: "Upload policies, certificates, reports, and registers to connect them with VSME answers.",
    action: "Upload first document",
  },
  tasks: {
    title: "No open tasks",
    description: "Tasks will appear when answers need evidence, review, or follow-up.",
    action: "Add task",
  },
  shareLinks: {
    title: "No active share links",
    description: "Create a secure buyer link once your passport is ready to share.",
    action: "Create share link",
  },
} as const;

export const legalDisclaimerSnippets = {
  notAssurance:
    "Supplier Passport helps organize ESG and VSME information but does not provide audit, assurance, or legal certification.",
  supplierResponsibility:
    "Suppliers remain responsible for the accuracy, completeness, and legal use of all uploaded information and shared evidence.",
  buyerUse:
    "Buyer access links are intended for review and procurement collaboration and should not be treated as public disclosures.",
  dataRoom:
    "Only upload documents that your organization is authorized to store and share with selected recipients.",
} as const;
