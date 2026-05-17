import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import type { AppLocale } from "@/i18n/routing";

export const metadata: Metadata = {
  title: "Signup | Supplier Passport",
  description: "Create a Supplier Passport workspace for your company.",
};

type SignupPageProps = {
  params: Promise<{
    locale: AppLocale;
  }>;
};

export default async function SignupPage({ params }: SignupPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.signup");

  return (
    <AuthShell
      eyebrow={t("eyebrow")}
      title={t("title")}
      subtitle={t("subtitle")}
    >
      <SignupForm />
    </AuthShell>
  );
}
