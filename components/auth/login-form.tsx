"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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

    logLoginInfo("submit started");

    const nhost = getBrowserNhostClient();
    logLoginInfo("nhost configured", Boolean(nhost));

    if (!nhost) {
      setMessage({
        tone: "info",
        text: t("nhostNotConfigured"),
      });
      return;
    }

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setMessage({ tone: "error", text: t("requiredFields") });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      logLoginInfo("validation passed");
      logLoginInfo("request sent");

      const response = await nhost.auth.signInEmailPassword({ email, password });

      if (response.body.session) {
        logLoginInfo("success");
        const destination = await getPostLoginDestination(locale, response.body.session);

        if (destination.error) {
          console.error("Post-login routing failed", destination.diagnostics);
          setMessage({ tone: "error", text: t("error") });
          return;
        }

        setMessage({ tone: "success", text: t("success") });
        router.replace(destination.href);
        return;
      }

      setMessage({
        tone: "error",
        text: t("emailNotVerified"),
      });
    } catch (error) {
      const safeError = readSafeAuthError(error);
      logLoginWarn("failed", safeError.code ?? safeError.message);
      console.error("Login failed", {
        diagnostics: getPublicDiagnostics(),
        authError: safeError,
      });
      setMessage({ tone: "error", text: t(getLoginErrorKey(safeError)) });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-5" noValidate onSubmit={handleSubmit}>
      {message ? <AuthStatusMessage tone={message.tone} message={message.text} /> : null}

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        {t("email")}
        <Input
          required
          name="email"
          type="email"
          placeholder="name@company.com"
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

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700"
      >
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
    body?: unknown;
  };
  const body =
    value.body && typeof value.body === "object" ? (value.body as Record<string, unknown>) : null;

  return {
    message: typeof value.message === "string" ? value.message : "unknown",
    status:
      typeof value.status === "number"
        ? value.status
        : typeof value.statusCode === "number"
          ? value.statusCode
          : undefined,
    code:
      typeof value.error === "string"
        ? value.error
        : typeof body?.error === "string"
          ? body.error
          : undefined,
  };
}

type SafeAuthError = ReturnType<typeof readSafeAuthError>;

function getLoginErrorKey(error: SafeAuthError) {
  const code = error.code?.toLowerCase() ?? "";
  const message = error.message.toLowerCase();

  if (code.includes("invalid-email-password") || message.includes("invalid email")) {
    return "invalidEmailOrPassword";
  }

  if (code.includes("unverified-user") || message.includes("unverified")) {
    return "emailNotVerified";
  }

  if (
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("cors")
  ) {
    return "authNetworkError";
  }

  return "unknownAuthError";
}

function logLoginInfo(message: string, value?: boolean | string) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const details = value === undefined ? "" : ` ${value}`;
  console.info(`[login] ${message}${details}`);
}

function logLoginWarn(message: string, value: string) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.warn(`[login] ${message}: ${value}`);
}
