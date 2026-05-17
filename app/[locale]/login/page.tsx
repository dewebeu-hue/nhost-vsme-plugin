import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import type { AppLocale } from "@/i18n/routing";

export const metadata: Metadata = {
  title: "Login | Supplier Passport",
  description: "Sign in to your Supplier Passport workspace.",
};

type LoginPageProps = {
  params: Promise<{
    locale: AppLocale;
  }>;
};

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.login");

  return (
    <AuthShell
      eyebrow={t("eyebrow")}
      title={t("title")}
      subtitle={t("subtitle")}
    >
      <LoginForm />
    </AuthShell>
  );
}
