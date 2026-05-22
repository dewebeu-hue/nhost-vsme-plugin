import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import type { AppLocale } from "@/i18n/routing";

export const metadata: Metadata = {
  title: "Set New Password | Supplier Passport",
  description: "Set a new password for your Supplier Passport account.",
};

type ResetPasswordPageProps = {
  params: Promise<{
    locale: AppLocale;
  }>;
};

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.resetPassword");

  return (
    <AuthShell eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")}>
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
