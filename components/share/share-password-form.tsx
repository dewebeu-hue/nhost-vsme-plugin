"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LockKeyhole } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SharePasswordFormProps = {
  token: string;
};

export function SharePasswordForm({ token }: SharePasswordFormProps) {
  const t = useTranslations("share");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsVerifying(true);

    try {
      const response = await fetch(`/api/share/${encodeURIComponent(token)}/verify-password`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        setError(
          payload.error === "incorrect" || payload.error === "incorrect_password"
            ? t("incorrectPassword")
            : t("passwordVerificationFailed"),
        );
        return;
      }

      router.refresh();
    } catch {
      setError(t("passwordVerificationFailed"));
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <Logo />
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <p className="hidden text-sm font-medium text-slate-500 sm:block">
              {t("poweredBy")}
            </p>
          </div>
        </div>
      </header>
      <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-5 py-12 lg:px-8">
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8"
        >
          <div className="flex size-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700">
            <LockKeyhole aria-hidden="true" />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
            {t("protectedPassport")}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {t("passwordTitle")}
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            {t("passwordText")}
          </p>
          <div className="mt-6 grid gap-2">
            <label htmlFor="share-password" className="text-sm font-semibold text-slate-700">
              {t("enterPassword")}
            </label>
            <Input
              id="share-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 rounded-xl bg-white"
              required
            />
          </div>
          {error ? (
            <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            className="mt-6 h-12 w-full rounded-xl bg-blue-600 hover:bg-blue-700"
            disabled={isVerifying || !password}
          >
            {isVerifying ? t("verifyingPassword") : t("unlockPassport")}
          </Button>
        </form>
      </main>
    </div>
  );
}
