import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function DashboardRouteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
