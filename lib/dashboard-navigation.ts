export const dashboardNavigation = [
  { href: "/dashboard", labelKey: "dashboard", icon: "layout" },
  { href: "/dashboard/company", labelKey: "companyProfile", icon: "building" },
  { href: "/dashboard/buyer-requests", labelKey: "buyerRequests", icon: "clipboard-check" },
  { href: "/dashboard/questionnaire", labelKey: "questionnaire", icon: "clipboard-check" },
  { href: "/dashboard/documents", labelKey: "evidenceRoom", icon: "file-text" },
  { href: "/dashboard/passport", labelKey: "passport", icon: "shield" },
  { href: "/dashboard/share", labelKey: "share", icon: "link" },
  { href: "/dashboard/activity", labelKey: "activity", icon: "activity" },
  { href: "/dashboard/settings", labelKey: "settings", icon: "settings" },
] as const;
