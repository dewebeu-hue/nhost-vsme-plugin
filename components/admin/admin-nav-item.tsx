"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  Building2,
  AlertTriangle,
  FileCheck2,
  FileText,
  Link2,
  NotebookText,
  Settings,
  ShieldCheck,
  LifeBuoy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminNavIcon =
  | "building"
  | "alert"
  | "file-check"
  | "file-text"
  | "link"
  | "notes"
  | "settings"
  | "shield"
  | "support";

const iconMap: Record<AdminNavIcon, LucideIcon> = {
  building: Building2,
  alert: AlertTriangle,
  "file-check": FileCheck2,
  "file-text": FileText,
  link: Link2,
  notes: NotebookText,
  settings: Settings,
  shield: ShieldCheck,
  support: LifeBuoy,
};

type AdminNavItemProps = {
  href: string;
  label: string;
  icon: AdminNavIcon;
  badge?: ReactNode;
  onClick?: () => void;
};

export function AdminNavItem({ href, label, icon, badge, onClick }: AdminNavItemProps) {
  const pathname = usePathname();
  const Icon = iconMap[icon];
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      prefetch
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-slate-950 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
      )}
    >
      <Icon aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {badge}
    </Link>
  );
}
