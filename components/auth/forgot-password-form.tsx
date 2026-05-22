"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import { AuthStatusMessage } from "@/components/auth/auth-status-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPublicDiagnostics } from "@/lib/diagnostics/public-env";
import { getBrowserNhostClient } from "@/lib/nhost/client";

type MessageState = {
  tone: "info" | "success" | "error";
  text: string;
};

type SafeAuthError = {
  message: string;
  status?: number;
  code?: string;
};

export function ForgotPasswordForm() {
  const locale = useLocale();
  const t = useTranslations("auth.forgotPassword");
  const [message, setMessage] = useState<MessageState | null>(() =>
    getBrowserNhostClient() && isAuthEndpointConfigured()
      ? null
      : {
          tone: "info",
          text: t("nhostNotConfigured"),
        },
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nhost = getBrowserNhostClient();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    if (!email) {
      setMessage({ tone: "error", text: t("emailRequired") });
      return;
    }

    if (!isValidEmail(email)) {
      setMessage({ tone: "error", text: t("invalidEmail") });
      return;
    }

    if (!nhost || !isAuthEndpointConfigured()) {
      setMessage({ tone: "error", text: t("nhostNotConfigured") });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const redirectTo = `${window.location.origin}/${locale}/reset-password`;

      await nhost.auth.sendPasswordResetEmail({
        email,
        options: {
          redirectTo,
        },
      });

      setMessage({ tone: "success", text: t("success") });
    } catch (error) {
      const safeError = readSafeAuthError(error);
      if (isAccountExistenceError(safeError)) {
        setMessage({ tone: "success", text: t("success") });
        return;
      }
      setMessage({ tone: "error", text: t(getForgotPasswordErrorKey(safeError)) });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-5" noValidate onSubmit={handleSubmit}>
      {message ? (
        <div aria-live="polite">
          <AuthStatusMessage tone={message.tone} message={message.text} />
        </div>
      ) : null}

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        {t("email")}
        <Input
          required
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@company.com"
          className="h-12 rounded-xl bg-slate-50 px-4"
        />
      </label>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700"
      >
        {isSubmitting ? t("submitting") : t("submit")}
        <Mail data-icon="inline-end" />
      </Button>

      <p className="text-center text-sm text-slate-500">
        <Link href={`/${locale}/login`} className="font-semibold text-blue-700 hover:text-blue-800">
          {t("backToLogin")}
        </Link>
      </p>
    </form>
  );
}

function isAuthEndpointConfigured() {
  const diagnostics = getPublicDiagnostics();
  return (
    diagnostics.authUrlConfigured ||
    (diagnostics.nhostSubdomainConfigured && diagnostics.nhostRegionConfigured)
  );
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function readSafeAuthError(error: unknown): SafeAuthError {
  if (!error || typeof error !== "object") {
    return { message: "unknown" };
  }

  const value = error as {
    body?: unknown;
    message?: unknown;
    status?: unknown;
    statusCode?: unknown;
    error?: unknown;
  };

  const bodyError = readSafeAuthBody(value.body);
  if (hasReadableAuthError(bodyError)) {
    return {
      ...bodyError,
      status:
        typeof value.status === "number"
          ? value.status
          : typeof value.statusCode === "number"
            ? value.statusCode
            : bodyError.status,
    };
  }

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

function readSafeAuthBody(body: unknown): SafeAuthError {
  if (!body || typeof body !== "object") {
    return { message: "unknown" };
  }

  const value = body as {
    message?: unknown;
    status?: unknown;
    statusCode?: unknown;
    error?: unknown;
    errors?: unknown;
  };

  if (typeof value.error === "object" && value.error !== null) {
    const nested = value.error as { message?: unknown; code?: unknown };
    if (typeof nested.message === "string") {
      return {
        message: nested.message,
        code: typeof nested.code === "string" ? nested.code : undefined,
      };
    }
  }

  if (Array.isArray(value.errors)) {
    const firstError = value.errors.find(
      (entry): entry is { message: string; code?: string } =>
        typeof entry === "object" &&
        entry !== null &&
        "message" in entry &&
        typeof (entry as { message?: unknown }).message === "string",
    );

    if (firstError) {
      return {
        message: firstError.message,
        code: typeof firstError.code === "string" ? firstError.code : undefined,
      };
    }
  }

  return {
    message:
      typeof value.message === "string"
        ? value.message
        : typeof value.error === "string"
          ? value.error
          : "unknown",
    status:
      typeof value.status === "number"
        ? value.status
        : typeof value.statusCode === "number"
          ? value.statusCode
          : undefined,
  };
}

function hasReadableAuthError(error: SafeAuthError) {
  return error.message !== "unknown" || typeof error.code === "string";
}

function getForgotPasswordErrorKey(error: SafeAuthError) {
  const haystack = `${error.code ?? ""} ${error.message}`.toLowerCase();

  if (/redirectto-not-allowed|redirect.*allowed/.test(haystack)) {
    return "redirectNotAllowed";
  }

  if (/fetch|network|cors|failed to fetch|load failed|connection/.test(haystack)) {
    return "authNetworkError";
  }

  return "safeError";
}

function isAccountExistenceError(error: SafeAuthError) {
  const haystack = `${error.code ?? ""} ${error.message}`.toLowerCase();

  return (
    error.status === 404 ||
    /user.*not.*found|not.*found|account.*not.*found|does.*not.*exist|unknown.*email/.test(
      haystack,
    )
  );
}
