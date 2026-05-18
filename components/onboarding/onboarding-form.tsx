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
    const formData = new FormData(event.currentTarget);
    const legalName = String(formData.get("legalName") ?? "").trim();

    logOnboardingInfo("submit started");

    if (!legalName) {
      setMessage({
        tone: "error",
        text: labels.organizationCreateFailed,
      });
      return;
    }

    if (!nhost || !session?.user?.id) {
      logOnboardingWarn("failed", "auth_required");
      setMessage({
        tone: "info",
        text: labels.authRequired,
      });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      logOnboardingInfo("validation passed");
      logOnboardingInfo("request sent");

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
        const payload = await readSafeOnboardingResponse(response);
        logOnboardingWarn("failed", payload.category ?? payload.error ?? `http_${response.status}`);

        setMessage({
          tone: response.status === 503 ? "info" : "error",
          text: getOnboardingErrorMessage(response.status, payload, labels),
        });
        return;
      }

      logOnboardingInfo("organization created");
      logOnboardingInfo("success");
      setMessage({ tone: "success", text: labels.workspaceCreated });
      window.sessionStorage.removeItem("supplier-passport:onboarding-company");
      router.push(`/${locale}/dashboard`);
    } catch (error) {
      logOnboardingWarn(
        "failed",
        error instanceof Error ? error.message : "unknown_onboarding_error",
      );
      setMessage({
        tone: "error",
        text: labels.networkError,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-5" noValidate onSubmit={handleSubmit}>
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
        type="submit"
        className="h-12 w-full rounded-xl bg-blue-600 hover:bg-blue-700 sm:w-fit sm:px-6"
      >
        <Building2 data-icon="inline-start" />
        {isSubmitting ? labels.creatingWorkspace : labels.createWorkspace}
        <ArrowRight data-icon="inline-end" />
      </Button>

      {message ? (
        <div aria-live="polite">
          <AuthStatusMessage tone={message.tone} message={message.text} />
        </div>
      ) : null}
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

type OnboardingErrorPayload = {
  error?: string;
  category?: string;
};

async function readSafeOnboardingResponse(response: Response): Promise<OnboardingErrorPayload> {
  try {
    const payload = (await response.json()) as OnboardingErrorPayload;
    return {
      error: typeof payload.error === "string" ? payload.error : undefined,
      category: typeof payload.category === "string" ? payload.category : undefined,
    };
  } catch {
    return {};
  }
}

function getOnboardingErrorMessage(
  status: number,
  payload: OnboardingErrorPayload,
  labels: OnboardingLabels,
) {
  const category = payload.category ?? payload.error ?? "";

  if (status === 401 || category === "auth_required") {
    return labels.authRequired;
  }

  if (status === 503 || category === "env_missing") {
    return labels.serverConfigMissing;
  }

  if (category === "duplicate_workspace_slug") {
    return labels.duplicateWorkspaceSlug;
  }

  if (category === "membership_create_failed") {
    return labels.membershipCreateFailed;
  }

  if (category === "profile_create_failed") {
    return labels.profileCreateFailed;
  }

  if (category === "organization_create_failed") {
    return labels.organizationCreateFailed;
  }

  return labels.onboardingError || labels.unknownOnboardingError;
}

function logOnboardingInfo(event: string) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[onboarding] ${event}`);
  }
}

function logOnboardingWarn(event: string, category: string) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[onboarding] ${event}`, { category });
  }
}
