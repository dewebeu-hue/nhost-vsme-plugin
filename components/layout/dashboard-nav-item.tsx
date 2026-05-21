"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Building2,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Link2,
  Settings,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type DashboardNavIcon =
  | "activity"
  | "building"
  | "clipboard-check"
  | "file-text"
  | "layout"
  | "link"
  | "settings"
  | "shield";

const iconMap: Record<DashboardNavIcon, LucideIcon> = {
  activity: Activity,
  building: Building2,
  "clipboard-check": ClipboardCheck,
  "file-text": FileText,
  layout: LayoutDashboard,
  link: Link2,
  settings: Settings,
  shield: ShieldCheck,
};

type DashboardNavItemProps = {
  href: string;
  label: string;
  icon: DashboardNavIcon;
};

export function DashboardNavItem({ href, label, icon: Icon }: DashboardNavItemProps) {
  const pathname = usePathname();
  const NavIcon = iconMap[Icon];
  const isActive =
    href.endsWith("/dashboard")
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      prefetch
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
      )}
    >
      <NavIcon aria-hidden="true" className="size-4" />
      <span className="min-w-0 truncate">{label}</span>
    </Link>
  );
}
