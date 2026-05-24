export type PassportChecklistProgress = {
  passportViewed: boolean;
  pdfDownloaded: boolean;
};

const progressKeyPrefix = "supplierPassport:firstChecklist:v1";
const progressChangedEvent = "supplier-passport-checklist-progress:changed";

export function subscribePassportChecklistProgress(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(progressChangedEvent, listener);

  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(progressChangedEvent, listener);
  };
}

export function getPassportChecklistProgressSnapshot(organizationId: string | null | undefined) {
  if (typeof window === "undefined") {
    return "loading";
  }

  if (!organizationId) {
    return "";
  }

  return window.localStorage.getItem(createPassportChecklistProgressKey(organizationId)) ?? "";
}

export function readPassportChecklistProgress(organizationId: string | null | undefined) {
  if (!organizationId) {
    return createEmptyPassportChecklistProgress();
  }

  try {
    const rawValue = window.localStorage.getItem(createPassportChecklistProgressKey(organizationId));
    const parsed = rawValue ? (JSON.parse(rawValue) as Partial<PassportChecklistProgress>) : null;

    return {
      passportViewed: parsed?.passportViewed === true,
      pdfDownloaded: parsed?.pdfDownloaded === true,
    };
  } catch {
    return createEmptyPassportChecklistProgress();
  }
}

export function markPassportChecklistProgress(
  organizationId: string | null | undefined,
  update: Partial<PassportChecklistProgress>,
) {
  if (!organizationId) {
    return;
  }

  const current = readPassportChecklistProgress(organizationId);
  const next = {
    ...current,
    ...update,
  };

  window.localStorage.setItem(createPassportChecklistProgressKey(organizationId), JSON.stringify(next));
  window.dispatchEvent(new Event(progressChangedEvent));
}

export function createEmptyPassportChecklistProgress(): PassportChecklistProgress {
  return {
    passportViewed: false,
    pdfDownloaded: false,
  };
}

function createPassportChecklistProgressKey(organizationId: string) {
  return `${progressKeyPrefix}:${organizationId}`;
}
