"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ArrowRight, Building2 } from "lucide-react";
import { AuthStatusMessage } from "@/components/auth/auth-status-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBrowserNhostClient } from "@/lib/nhost/client";
import { defaultOnboardingLabels, type OnboardingLabels } from "@/lib/operational-labels";

type MessageState = {
  tone: "info" | "success" | "error";
  text: string;
};

const employeeRanges = ["1-49", "50-249", "250-499", "500-999", "1000+"];

export function OnboardingForm({
  labels = defaultOnboardingLabels,
}: {
  labels?: OnboardingLabels;
}) {
  const router = useRouter();
  const locale = useLocale();
  const [prefilledCompanyName] = useState(() =>
    typeof window === "undefined"
      ? ""
      : window.sessionStorage.getItem("supplier-passport:onboarding-company") ?? "",
  );
  const [message, setMessage] = useState<MessageState | null>(() =>
    getBrowserNhostClient()
      ? null
      : {
          tone: "info",
          text: labels.mockModeNotice,
        },
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nhost = getBrowserNhostClient();
    const session = nhost?.getUserSession();

    if (!nhost || !session?.user?.id) {
      setMessage({
        tone: "info",
        text: labels.authRequired,
      });
      return;
    }

    const formData = new FormData(event.currentTarget);
    const legalName = String(formData.get("legalName") ?? "");

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          legalName,
          companyName: legalName,
          vatId: String(formData.get("vatId") ?? ""),
          industry: String(formData.get("industry") ?? ""),
          employeeCountRange: String(formData.get("employeeCountRange") ?? ""),
          headquartersCity: String(formData.get("headquartersCity") ?? ""),
          headquartersCountry: String(formData.get("headquartersCountry") ?? ""),
          website: String(formData.get("website") ?? ""),
        }),
      });

      if (!response.ok) {
        const fallbackText =
          response.status === 503
            ? labels.mockModeNotice
            : response.status === 401
              ? labels.authRequired
              : labels.onboardingError;

        setMessage({
          tone: response.status === 503 ? "info" : "error",
          text: fallbackText,
        });
        return;
      }

      setMessage({ tone: "success", text: labels.workspaceCreated });
      window.sessionStorage.removeItem("supplier-passport:onboarding-company");
      router.push(`/${locale}/dashboard`);
    } catch (error) {
      console.error("Onboarding failed", error);
      setMessage({
        tone: "error",
        text: labels.onboardingError,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      {message ? <AuthStatusMessage tone={message.tone} message={message.text} /> : null}

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label={labels.companyLegalName}
          name="legalName"
          placeholder="Acme Manufacturing GmbH"
          defaultValue={prefilledCompanyName}
        />
        <Field label={labels.vatId} name="vatId" placeholder="DE123456789" />
        <Field label={labels.industry} name="industry" placeholder="Industrial Manufacturing" />
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
          {labels.employeeCountRange}
          <select
            name="employeeCountRange"
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none focus-visible:border-blue-500 focus-visible:ring-3 focus-visible:ring-blue-100"
            defaultValue="250-499"
          >
            {employeeRanges.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
        </label>
        <Field label={labels.headquartersCity} name="headquartersCity" placeholder="Munich" />
        <Field label={labels.headquartersCountry} name="headquartersCountry" placeholder="Germany" />
        <div className="md:col-span-2">
          <Field label={labels.website} name="website" placeholder="https://acme-manufacturing.com" />
        </div>
      </div>

      <Button
        disabled={isSubmitting}
        className="h-12 w-full rounded-xl bg-blue-600 hover:bg-blue-700 sm:w-fit sm:px-6"
      >
        <Building2 data-icon="inline-start" />
        {isSubmitting ? labels.creatingWorkspace : labels.createWorkspace}
        <ArrowRight data-icon="inline-end" />
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  placeholder: string;
  defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
      {label}
      <Input
        required={name === "legalName"}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="h-12 rounded-xl bg-slate-50 px-4"
      />
    </label>
  );
}
