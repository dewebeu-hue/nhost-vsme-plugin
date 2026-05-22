import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import type { AppLocale } from "@/i18n/routing";

export const metadata: Metadata = {
  title: "Reset Password | Supplier Passport",
  description: "Request a Supplier Passport password reset link.",
};

type ForgotPasswordPageProps = {
  params: Promise<{
    locale: AppLocale;
  }>;
};

export default async function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.forgotPassword");

  return (
    <AuthShell eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")}>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
