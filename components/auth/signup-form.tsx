"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { AuthStatusMessage } from "@/components/auth/auth-status-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBrowserNhostClient } from "@/lib/nhost/client";

type MessageState = {
  tone: "info" | "success" | "error";
  text: string;
};

export function SignupForm() {
  const locale = useLocale();
  const t = useTranslations("auth.signup");
  const [message, setMessage] = useState<MessageState | null>(() =>
    getBrowserNhostClient()
      ? null
      : {
          tone: "info",
          text: t("notConfigured"),
        },
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nhost = getBrowserNhostClient();

    if (!nhost) {
      setMessage({
        tone: "info",
        text: t("previewMode"),
      });
      return;
    }

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const companyName = String(formData.get("companyName") ?? "");
    const redirectTo = `${window.location.origin}/${locale}/onboarding`;

    setIsSubmitting(true);
    setMessage(null);
    window.sessionStorage.setItem("supplier-passport:onboarding-company", companyName);

    try {
      const response = await nhost.auth.signUpEmailPassword({
        email,
        password,
        options: {
          displayName: fullName.slice(0, 32),
          metadata: {
            companyName,
            signupSource: "supplier-passport-web",
          },
          redirectTo,
        },
      });

      if (response.body.session) {
        setMessage({
          tone: "success",
          text: t("success"),
        });
        window.sessionStorage.setItem("supplier-passport:onboarding-company", companyName);
        window.location.assign(`/${locale}/onboarding`);
        return;
      }

      setMessage({
        tone: "success",
        text: t("received"),
      });
    } catch (error) {
      console.error("Signup failed", error);
      setMessage({ tone: "error", text: t("error") });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      {message ? <AuthStatusMessage tone={message.tone} message={message.text} /> : null}

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        {t("fullName")}
        <Input
          required
          name="fullName"
          placeholder="Anna Muller"
          className="h-12 rounded-xl bg-slate-50 px-4"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        {t("workEmail")}
        <Input
          required
          name="email"
          type="email"
          placeholder="anna@acme-manufacturing.com"
          className="h-12 rounded-xl bg-slate-50 px-4"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        {t("password")}
        <Input
          required
          name="password"
          type="password"
          minLength={8}
          placeholder={t("passwordPlaceholder")}
          className="h-12 rounded-xl bg-slate-50 px-4"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        {t("companyName")}
        <Input
          required
          name="companyName"
          placeholder="Acme Manufacturing GmbH"
          className="h-12 rounded-xl bg-slate-50 px-4"
        />
      </label>

      <Button disabled={isSubmitting} className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700">
        {isSubmitting ? t("submitting") : t("submit")}
        <ArrowRight data-icon="inline-end" />
      </Button>

      <p className="text-center text-sm text-slate-500">
        {t("existingAccount")}{" "}
        <Link href={`/${locale}/login`} className="font-semibold text-blue-700 hover:text-blue-800">
          {t("signIn")}
        </Link>
      </p>
    </form>
  );
}
