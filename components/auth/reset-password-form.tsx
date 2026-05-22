"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { KeyRound } from "lucide-react";
import { AuthStatusMessage } from "@/components/auth/auth-status-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function ResetPasswordForm() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("auth.resetPassword");
  const ticket = useMemo(() => readPasswordResetTicket(searchParams), [searchParams]);
  const [message, setMessage] = useState<MessageState | null>(() =>
    getBrowserNhostClient()
      ? null
      : {
          tone: "info",
          text: t("nhostNotConfigured"),
        },
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nhost = getBrowserNhostClient();
    if (!nhost) {
      setMessage({ tone: "error", text: t("nhostNotConfigured") });
      return;
    }

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    const session = nhost.getUserSession();

    if (!password || !confirmPassword) {
      setMessage({ tone: "error", text: t("requiredFields") });
      return;
    }

    if (password.length < 9) {
      setMessage({ tone: "error", text: t("passwordTooShort") });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ tone: "error", text: t("passwordMismatch") });
      return;
    }

    if (!ticket && !session?.accessToken) {
      setMessage({ tone: "error", text: t("missingTicket") });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await nhost.auth.changeUserPassword({
        newPassword: password,
        ...(ticket ? { ticket } : {}),
      });

      setIsComplete(true);
      setMessage({ tone: "success", text: t("success") });
      window.setTimeout(() => {
        router.replace(`/${locale}/login`);
      }, 1600);
    } catch (error) {
      const safeError = readSafeAuthError(error);
      setMessage({ tone: "error", text: t(getResetPasswordErrorKey(safeError)) });
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
        {t("password")}
        <Input
          required
          name="password"
          type="password"
          minLength={9}
          autoComplete="new-password"
          placeholder={t("passwordPlaceholder")}
          className="h-12 rounded-xl bg-slate-50 px-4"
          disabled={isComplete}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        {t("confirmPassword")}
        <Input
          required
          name="confirmPassword"
          type="password"
          minLength={9}
          autoComplete="new-password"
          placeholder={t("confirmPasswordPlaceholder")}
          className="h-12 rounded-xl bg-slate-50 px-4"
          disabled={isComplete}
        />
      </label>

      <Button
        type="submit"
        disabled={isSubmitting || isComplete}
        className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700"
      >
        {isSubmitting ? t("submitting") : t("submit")}
        <KeyRound data-icon="inline-end" />
      </Button>

      <p className="text-center text-sm text-slate-500">
        <Link href={`/${locale}/login`} className="font-semibold text-blue-700 hover:text-blue-800">
          {t("backToLogin")}
        </Link>
      </p>
    </form>
  );
}

function readPasswordResetTicket(searchParams: URLSearchParams) {
  const ticket = searchParams.get("ticket");

  if (ticket?.startsWith("passwordReset:")) {
    return ticket;
  }

  return null;
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

function getResetPasswordErrorKey(error: SafeAuthError) {
  const haystack = `${error.code ?? ""} ${error.message}`.toLowerCase();

  if (/invalid-ticket|expired|ticket/.test(haystack)) {
    return "missingTicket";
  }

  if (/password/.test(haystack) && /short|least|min|length|weak/.test(haystack)) {
    return "passwordTooShort";
  }

  if (/fetch|network|cors|failed to fetch|load failed|connection/.test(haystack)) {
    return "authNetworkError";
  }

  return "safeError";
}
