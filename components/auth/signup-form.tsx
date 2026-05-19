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

type SafeAuthError = {
  message: string;
  status?: number;
  code?: string;
};

export function SignupForm() {
  const locale = useLocale();
  const t = useTranslations("auth.signup");
  const [message, setMessage] = useState<MessageState | null>(() =>
    getBrowserNhostClient() && isAuthEndpointConfigured()
      ? null
      : {
          tone: "info",
          text: t("authNotConfigured"),
        },
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nhost = getBrowserNhostClient();
    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const companyName = String(formData.get("companyName") ?? "").trim();

    logSignupDiagnostic("submit started");

    if (!fullName || !email || !password || !companyName) {
      setMessage({ tone: "error", text: t("requiredFields") });
      return;
    }

    if (!isValidEmail(email)) {
      setMessage({ tone: "error", text: t("invalidEmail") });
      return;
    }

    if (password.length < 9) {
      setMessage({ tone: "error", text: t("passwordTooShort") });
      return;
    }

    if (!nhost || !isAuthEndpointConfigured()) {
      logSignupDiagnostic("nhost configured: false");
      setMessage({
        tone: "error",
        text: t("authNotConfigured"),
      });
      return;
    }

    const redirectTo = `${window.location.origin}/${locale}/onboarding`;

    setIsSubmitting(true);
    setMessage(null);
    window.sessionStorage.setItem("supplier-passport:onboarding-company", companyName);

    try {
      logSignupDiagnostic("validation passed");
      logSignupDiagnostic("nhost configured: true");
      logSignupDiagnostic("request sent");

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

      const responseError = readSafeAuthError(response);
      if (hasReadableAuthError(responseError)) {
        logSignupDiagnostic("failed", responseError);
        setMessage({ tone: "error", text: t(getSignupErrorKey(responseError)) });
        return;
      }

      if (response.body.session) {
        logSignupDiagnostic("success");
        setMessage({
          tone: "success",
          text: t("success"),
        });
        window.sessionStorage.setItem("supplier-passport:onboarding-company", companyName);
        window.location.assign(`/${locale}/onboarding`);
        return;
      }

      logSignupDiagnostic("success", { code: "email_verification_required" });
      setMessage({
        tone: "success",
        text: t("checkEmailVerification"),
      });
    } catch (error) {
      const authError = readSafeAuthError(error);
      logSignupDiagnostic("failed", authError);
      setMessage({ tone: "error", text: t(getSignupErrorKey(authError)) });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-5" noValidate onSubmit={handleSubmit}>
      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        {t("fullName")}
        <Input
          required
          name="fullName"
          placeholder="Your name"
          className="h-12 rounded-xl bg-slate-50 px-4"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        {t("workEmail")}
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
          minLength={9}
          placeholder={t("passwordPlaceholder")}
          className="h-12 rounded-xl bg-slate-50 px-4"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        {t("companyName")}
        <Input
          required
          name="companyName"
          placeholder="Your company name"
          className="h-12 rounded-xl bg-slate-50 px-4"
        />
      </label>

      <Button
        disabled={isSubmitting}
        type="submit"
        className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700"
      >
        {isSubmitting ? t("submitting") : t("submit")}
        <ArrowRight data-icon="inline-end" />
      </Button>

      {message ? (
        <div aria-live="polite">
          <AuthStatusMessage tone={message.tone} message={message.text} />
        </div>
      ) : null}

      <p className="text-center text-sm text-slate-500">
        {t("existingAccount")}{" "}
        <Link href={`/${locale}/login`} className="font-semibold text-blue-700 hover:text-blue-800">
          {t("signIn")}
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

function logSignupDiagnostic(event: string, authError?: Partial<SafeAuthError>) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.info(`[signup] ${event}`, {
    diagnostics: getPublicDiagnostics(),
    authError,
  });
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

function getSignupErrorKey(error: SafeAuthError) {
  const haystack = `${error.code ?? ""} ${error.message}`.toLowerCase();

  if (error.status === 409 || /already|exists|duplicate|conflict/.test(haystack)) {
    return "emailAlreadyExists";
  }

  if (/password/.test(haystack) && /short|least|min|length|weak/.test(haystack)) {
    return "passwordTooShort";
  }

  if (/not allowed|not permitted|disabled|domain|signup.*closed|signup.*disabled/.test(haystack)) {
    return "emailNotAllowed";
  }

  if (/fetch|network|cors|failed to fetch|load failed|connection/.test(haystack)) {
    return "authNetworkError";
  }

  if (error.message === "unknown") {
    return "unknownAuthError";
  }

  return "signupFailed";
}
