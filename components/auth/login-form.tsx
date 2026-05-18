"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { AuthStatusMessage } from "@/components/auth/auth-status-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPublicDiagnostics } from "@/lib/diagnostics/public-env";
import { getBrowserNhostClient } from "@/lib/nhost/client";

type MessageState = {
  tone: "info" | "success" | "error";
  text: string;
};

type AuthSession = {
  accessToken?: string;
  user?: {
    id?: string;
  };
};

export function LoginForm() {
  const locale = useLocale();
  const t = useTranslations("auth.login");
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
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await nhost.auth.signInEmailPassword({ email, password });

      if (response.body.session) {
        const destination = await getPostLoginDestination(locale, response.body.session);

        if (destination.error) {
          console.error("Post-login routing failed", destination.diagnostics);
          setMessage({ tone: "error", text: t("error") });
          return;
        }

        setMessage({ tone: "success", text: t("success") });
        window.location.assign(destination.href);
        return;
      }

      setMessage({
        tone: "error",
        text: t("needsStep"),
      });
    } catch (error) {
      console.error("Login failed", {
        diagnostics: getPublicDiagnostics(),
        authError: readSafeAuthError(error),
      });
      setMessage({ tone: "error", text: t("error") });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      {message ? <AuthStatusMessage tone={message.tone} message={message.text} /> : null}

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        {t("email")}
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
          placeholder={t("passwordPlaceholder")}
          className="h-12 rounded-xl bg-slate-50 px-4"
        />
      </label>

      <Button disabled={isSubmitting} className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700">
        {isSubmitting ? t("submitting") : t("submit")}
        <ArrowRight data-icon="inline-end" />
      </Button>

      <p className="text-center text-sm text-slate-500">
        {t("newAccount")}{" "}
        <Link href={`/${locale}/signup`} className="font-semibold text-blue-700 hover:text-blue-800">
          {t("createAccount")}
        </Link>
      </p>
    </form>
  );
}

type PostLoginDestination =
  | { href: string; error?: never; diagnostics?: never }
  | { error: true; diagnostics: Record<string, unknown>; href?: never };

async function getPostLoginDestination(
  locale: string,
  session: AuthSession,
): Promise<PostLoginDestination> {
  if (!session.accessToken || !session.user?.id) {
    return { href: `/${locale}/onboarding` };
  }

  try {
    const response = await fetch("/api/organizations/current", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({}),
    });

    if (response.status === 404) {
      return { href: `/${locale}/onboarding` };
    }

    if (response.ok) {
      const payload = (await response.json()) as {
        configured?: boolean;
        organization?: { id: string } | null;
      };

      if (payload.configured === false) {
        return { href: `/${locale}/dashboard` };
      }

      return { href: payload.organization ? `/${locale}/dashboard` : `/${locale}/onboarding` };
    }

    const payload = (await response.json().catch(() => ({}))) as { category?: string };

    return {
      error: true,
      diagnostics: {
        ...getPublicDiagnostics(),
        status: response.status,
        category: payload.category ?? "organization_lookup_failed",
      },
    };
  } catch (error) {
    return {
      error: true,
      diagnostics: {
        ...getPublicDiagnostics(),
        authError: readSafeAuthError(error),
      },
    };
  }
}

function readSafeAuthError(error: unknown) {
  if (!error || typeof error !== "object") {
    return { message: "unknown" };
  }

  const value = error as {
    message?: unknown;
    status?: unknown;
    statusCode?: unknown;
    error?: unknown;
  };

  return {
    message: typeof value.message === "string" ? value.message : "unknown",
    status:
      typeof value.status === "number"
        ? value.status
        : typeof value.statusCode === "number"
          ? value.statusCode
          : undefined,
    code: typeof value.error === "string" ? value.error : undefined,
  };
}
