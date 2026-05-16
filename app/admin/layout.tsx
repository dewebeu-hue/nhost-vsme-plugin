import type { ReactNode } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";

export default function AdminRouteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <AdminLayout>{children}</AdminLayout>;
}
