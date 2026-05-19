"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { ArrowLeft, Copy, ExternalLink, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  buyerRequestSectionCodes,
  buyerRequestStatuses,
  type BuyerRequest,
  type BuyerRequestInput,
  type BuyerRequestResponsePackage,
  type BuyerRequestSectionCode,
  type BuyerRequestSectionReadiness,
  type BuyerRequestStatus,
} from "@/lib/buyer-requests";
import {
  forceRefreshBrowserNhostSession,
  getFreshBrowserNhostSession,
} from "@/lib/nhost/client";
import {
  defaultBuyerRequestLabels,
  formatBuyerRequestLabel,
  type BuyerRequestLabels,
} from "@/components/buyer-requests/buyer-request-labels";

type BuyerRequestDetailPayload = {
  ok?: boolean;
  request?: BuyerRequest;
  sectionReadiness?: BuyerRequestSectionReadiness[];
  responsePackage?: BuyerRequestResponsePackage;
};

type MessageState = {
  tone: "info" | "success" | "error";
  text: string;
};

type BuyerRequestDetailClientProps = {
  requestId: string;
  labels?: BuyerRequestLabels;
};

export function BuyerRequestDetailClient({
  requestId,
  labels = defaultBuyerRequestLabels,
}: BuyerRequestDetailClientProps) {
  const locale = useLocale();
  const [request, setRequest] = useState<BuyerRequest | null>(null);
  const [sectionReadiness, setSectionReadiness] = useState<BuyerRequestSectionReadiness[]>([]);
  const [responsePackage, setResponsePackage] = useState<BuyerRequestResponsePackage | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<BuyerRequestStatus>("draft");
  const [selectedSections, setSelectedSections] = useState<BuyerRequestSectionCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<MessageState | null>(null);
  const currentStatus = status;
  const readinessSummary = useMemo(
    () => calculateReadinessSummary(sectionReadiness, currentStatus, labels),
    [currentStatus, labels, sectionReadiness],
  );
  const missingActions = useMemo(
    () => buildMissingActions(sectionReadiness, labels),
    [labels, sectionReadiness],
  );
  const linkedEvidenceForRequestedSections = useMemo(
    () => sectionReadiness.reduce((sum, section) => sum + section.evidenceLinked, 0),
    [sectionReadiness],
  );
  const requestedSectionsComplete = useMemo(
    () =>
      sectionReadiness.length > 0 &&
      sectionReadiness.every(
        (section) => section.totalQuestions > 0 && section.answeredQuestions >= section.totalQuestions,
      ),
    [sectionReadiness],
  );
  const responseChecklist = useMemo(
    () =>
      buildResponseChecklist({
        labels,
        requestedSectionsComplete,
        hasLinkedEvidence: linkedEvidenceForRequestedSections > 0,
        hasActiveShareLink: Boolean(responsePackage?.hasActiveShareLink),
        hasPdfDraft: true,
        status,
      }),
    [
      labels,
      linkedEvidenceForRequestedSections,
      requestedSectionsComplete,
      responsePackage?.hasActiveShareLink,
      status,
    ],
  );
  const dueLabel = request?.due_date
    ? formatDueLabel(request.due_date, status, locale, labels)
    : labels.noDueDate;
  const hasRemainingGaps = missingActions.length > 0 || !responsePackage?.hasActiveShareLink;
  const requestLooksReady =
    !hasRemainingGaps && linkedEvidenceForRequestedSections > 0 && readinessSummary.percent >= 80;

  useEffect(() => {
    let cancelled = false;

    async function loadRequest() {
      const response = await fetchWithAuth(`/api/buyer-requests/${requestId}`, { method: "GET" });

      if (cancelled) {
        return;
      }

      if (!response) {
        setMessage({ tone: "error", text: labels.loadError });
        setIsLoading(false);
        return;
      }

      const payload = (await response.json()) as BuyerRequestDetailPayload;

      if (!response.ok || !payload.request) {
        setMessage({ tone: "error", text: labels.loadError });
        setIsLoading(false);
        return;
      }

      setRequest(payload.request);
      setStatus(payload.request.status);
      setNotes(payload.request.notes ?? "");
      setSelectedSections(payload.request.requested_sections);
      setSectionReadiness(payload.sectionReadiness ?? []);
      setResponsePackage(payload.responsePackage ?? null);
      setMessage(null);
      setIsLoading(false);
    }

    loadRequest();

    return () => {
      cancelled = true;
    };
  }, [labels.loadError, requestId]);

  async function handleSave() {
    await updateRequest({
      status,
      requestedSections: selectedSections,
      notes,
    });
  }

  async function handleSaveNotes() {
    await updateRequest({ notes }, labels.notesSaved);
  }

  async function handleMarkReadyToShare() {
    await updateRequest({
      status: "ready_to_share",
      requestedSections: selectedSections,
      notes,
    });
  }

  async function handleCopyResponseNote() {
    if (!request) {
      return;
    }

    const publicUrl =
      responsePackage?.publicPassportPath && typeof window !== "undefined"
        ? new URL(`/${locale}${responsePackage.publicPassportPath}`, window.location.origin).toString()
        : null;
    const note = buildResponseNote({
      labels,
      buyerName: request.buyer_name,
      organizationName: responsePackage?.organizationName ?? labels.notProvidedYet,
      publicUrl,
    });

    try {
      await navigator.clipboard.writeText(note);
      setMessage({ tone: "success", text: labels.responseNoteCopied });
    } catch {
      setMessage({ tone: "error", text: labels.updateError });
    }
  }

  async function updateRequest(input: BuyerRequestInput, successMessage = labels.saveRequest) {
    setIsSaving(true);
    setMessage(null);

    const response = await fetchWithAuth(`/api/buyer-requests/${requestId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });

    setIsSaving(false);

    if (!response) {
      setMessage({ tone: "error", text: labels.updateError });
      return;
    }

    const payload = (await response.json()) as BuyerRequestDetailPayload;

    if (!response.ok || !payload.request) {
      setMessage({ tone: "error", text: labels.updateError });
      return;
    }

    setRequest(payload.request);
    setStatus(payload.request.status);
    setSectionReadiness(payload.sectionReadiness ?? sectionReadiness);
    setResponsePackage(payload.responsePackage ?? responsePackage);
    setMessage({ tone: "success", text: successMessage });
  }

  if (isLoading) {
    return <div className="text-sm font-medium text-slate-500">{labels.loadError}</div>;
  }

  if (!request) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        {labels.loadError}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="ghost"
        className="w-fit"
        render={<Link href={`/${locale}/dashboard/buyer-requests`} />}
      >
        <ArrowLeft data-icon="inline-start" />
        {labels.backToList}
      </Button>

      {message ? <BuyerRequestMessage message={message} /> : null}

      <header className="supplier-surface rounded-2xl border-0 p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
              {labels.buyerName}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {request.request_title}
            </h1>
            <p className="mt-2 text-base leading-7 text-slate-600">
              {request.buyer_name}
              {request.buyer_contact_name ? ` - ${request.buyer_contact_name}` : ""}
            </p>
          </div>
          <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
            {labels.statuses[status]}
          </span>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard
          label={labels.requestReadiness}
          value={`${readinessSummary.percent}%`}
          detail={readinessSummary.label}
        />
        <SummaryCard
          label={labels.missingActions}
          value={String(missingActions.length)}
          detail={missingActions.length ? labels.needsAttention : labels.noObviousGaps}
        />
        <SummaryCard
          label={labels.evidenceLinked}
          value={String(linkedEvidenceForRequestedSections)}
          detail={labels.evidenceAvailableOnRequest}
        />
        <SummaryCard
          label={labels.dueDate}
          value={dueLabel}
          detail={formatBuyerRequestLabel(labels.lastUpdated, {
            date: formatDate(request.updated_at.slice(0, 10), locale),
          })}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <main className="flex flex-col gap-6">
          <section className="supplier-surface rounded-2xl border-0 p-5">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              {labels.requestDetails}
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem label={labels.buyerContactEmail} value={request.buyer_contact_email ?? labels.notProvidedYet} />
              <DetailItem label={labels.dueDate} value={dueLabel} />
              <DetailItem label={labels.requestDescription} value={request.request_description ?? labels.notProvidedYet} />
              <DetailItem label={labels.requestedSections} value={request.requested_sections.length ? request.requested_sections.map((code) => labels.sections[code]).join(", ") : labels.noRequestedSections} />
            </dl>
          </section>

          <section className="supplier-surface rounded-2xl border-0 p-5">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              {labels.readinessSummary}
            </h2>
            <div className="mt-4 grid gap-3">
              {sectionReadiness.length ? (
                sectionReadiness.map((section) => (
                  <article key={section.code} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <div>
                        <h3 className="font-semibold text-slate-950">
                          {labels.sections[section.code] ?? section.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatBuyerRequestLabel(labels.answeredQuestions, {
                            answered: section.answeredQuestions,
                            total: section.totalQuestions,
                          })}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-blue-700">
                        {formatBuyerRequestLabel(labels.completion, { percent: section.completion })}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      {formatBuyerRequestLabel(labels.evidenceLinked, {
                        linked: section.evidenceLinked,
                      })}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {getEvidenceStatus(section, labels)}
                      </span>
                      {section.expiredCertificates || section.expiringSoonCertificates ? (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          {labels.certificateExpiryWarning}
                        </span>
                      ) : null}
                    </div>
                  </article>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  {labels.noRequestedSections}
                </p>
              )}
            </div>
          </section>

          <section className="supplier-surface rounded-2xl border-0 p-5">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              {labels.missingActions}
            </h2>
            {missingActions.length ? (
              <ul className="mt-4 grid gap-3">
                {missingActions.map((action) => (
                  <li
                    key={action}
                    className="rounded-xl border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-600"
                  >
                    {action}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {labels.noObviousGaps}
              </p>
            )}
          </section>

          <section className="supplier-surface rounded-2xl border-0 p-5">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              {labels.prepareResponse}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {requestLooksReady
                ? labels.requestLooksReady
                : labels.completeRemainingActionsBeforeSharing}
            </p>
            <div className="mt-4 grid gap-3">
              {responseChecklist.map((item) => (
                <ChecklistItem key={item.label} label={item.label} done={item.done} labels={labels} />
              ))}
            </div>
            <Button
              type="button"
              className="mt-5"
              variant="outline"
              disabled={isSaving || status === "ready_to_share" || status === "shared" || status === "closed"}
              onClick={handleMarkReadyToShare}
            >
              {labels.markReadyToShare}
            </Button>
          </section>

          <section className="supplier-surface rounded-2xl border-0 p-5">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              {labels.internalNotes}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {labels.internalNotesDescription}
            </p>
            <Textarea
              name="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={2000}
              className="mt-4 min-h-32 bg-white"
            />
            <Button type="button" className="mt-4" disabled={isSaving} onClick={handleSaveNotes}>
              <Save data-icon="inline-start" />
              {isSaving ? labels.saving : labels.saveNotes}
            </Button>
          </section>
        </main>

        <aside className="flex flex-col gap-6">
          <section className="supplier-surface rounded-2xl border-0 p-5">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              {labels.status}
            </h2>
            <Select
              value={status}
              onValueChange={(value) => {
                if (buyerRequestStatuses.includes(value as BuyerRequestStatus)) {
                  setStatus(value as BuyerRequestStatus);
                }
              }}
            >
              <SelectTrigger className="mt-4 w-full bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {buyerRequestStatuses.map((item) => (
                    <SelectItem key={item} value={item}>
                      {labels.statuses[item]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
              {labels.statusDescriptions[status]}
            </p>
            <div className="mt-5">
              <p className="mb-3 text-sm font-semibold text-slate-700">
                {labels.requestedSections}
              </p>
              <div className="grid gap-2">
                {buyerRequestSectionCodes.map((code) => (
                  <label key={code} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-600">
                    <Checkbox
                      name="requestedSections"
                      checked={selectedSections.includes(code)}
                      onCheckedChange={(checked) => {
                        setSelectedSections((current) =>
                          checked ? [...current, code] : current.filter((item) => item !== code),
                        );
                      }}
                    />
                    {labels.sections[code]}
                  </label>
                ))}
              </div>
            </div>
            <Button className="mt-5 w-full" disabled={isSaving} onClick={handleSave}>
              <Save data-icon="inline-start" />
              {isSaving ? labels.saving : labels.saveRequest}
            </Button>
          </section>

          <section className="supplier-surface rounded-2xl border-0 p-5">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              {labels.requestActivity}
            </h2>
            <dl className="mt-4 grid gap-3">
              <DetailItem label={labels.created} value={formatDate(request.created_at.slice(0, 10), locale)} />
              <DetailItem label={stripDatePlaceholder(labels.lastUpdated)} value={formatDate(request.updated_at.slice(0, 10), locale)} />
              <DetailItem label={labels.currentStatus} value={labels.statuses[status]} />
              <DetailItem label={labels.evidenceLinkedLabel} value={String(linkedEvidenceForRequestedSections)} />
              <DetailItem label={labels.missingSteps} value={String(missingActions.length)} />
              <DetailItem label={labels.dueDate} value={dueLabel} />
            </dl>
          </section>

          <section className="supplier-surface rounded-2xl border-0 p-5">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              {labels.responsePackage}
            </h2>
            <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-600">
              <DetailItem
                label={labels.requestedSections}
                value={formatBuyerRequestLabel(labels.requestedSectionsSummary, {
                  count: sectionReadiness.length,
                  percent: readinessSummary.percent,
                })}
              />
              <DetailItem
                label={labels.evidenceAvailable}
                value={formatBuyerRequestLabel(labels.evidenceSummary, {
                  linked: linkedEvidenceForRequestedSections,
                })}
              />
              <DetailItem
                label={labels.missingActions}
                value={formatBuyerRequestLabel(labels.missingActionsSummary, {
                  count: missingActions.length,
                })}
              />
              <p>
                {responsePackage?.hasActiveShareLink
                  ? labels.activeShareLinkAvailable
                  : labels.noActiveShareLink}
              </p>
              {!responsePackage?.hasActiveShareLink ? (
                <p className="font-semibold text-amber-700">{labels.createPublicLinkFirst}</p>
              ) : null}
              <p>{labels.pdfDraftAvailable}</p>
              <p>{labels.evidenceAvailableOnRequest}</p>
              <p>
                {labels.currentRequestStatus}: {labels.statuses[status]}
              </p>
            </div>
          </section>

          <section className="supplier-surface rounded-2xl border-0 p-5">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              {labels.actionsTitle}
            </h2>
            <div className="mt-4 grid gap-2">
              <ActionLink href={`/${locale}/dashboard/questionnaire`} label={labels.reviewQuestionnaire} />
              <ActionLink href={`/${locale}/dashboard/documents`} label={labels.uploadLinkEvidence} />
              <ActionLink href={`/${locale}/dashboard/passport`} label={labels.openPassport} />
              <ActionLink href={`/${locale}/dashboard/share`} label={labels.openSharePage} />
              <ActionLink href={`/${locale}/dashboard/passport`} label={labels.downloadPdfDraft} />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-500">{labels.downloadPdfHint}</p>
            <Button type="button" variant="outline" className="mt-4 w-full bg-white" onClick={handleCopyResponseNote}>
              <Copy data-icon="inline-start" />
              {labels.copyResponseNote}
            </Button>
          </section>
        </aside>
      </div>
    </div>
  );
}

function ChecklistItem({
  label,
  done,
  labels,
}: {
  label: string;
  done: boolean;
  labels: BuyerRequestLabels;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <span
        className={
          done
            ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
            : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
        }
      >
        {done ? labels.done : labels.incomplete}
      </span>
    </div>
  );
}

function SummaryCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="supplier-surface rounded-2xl border-0 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-slate-700">{value}</dd>
    </div>
  );
}

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Button variant="outline" className="justify-between bg-white" render={<Link href={href} />}>
      {label}
      <ExternalLink data-icon="inline-end" />
    </Button>
  );
}

function calculateReadinessSummary(
  sections: BuyerRequestSectionReadiness[],
  status: BuyerRequest["status"],
  labels: BuyerRequestLabels,
) {
  if (status === "shared" || status === "closed") {
    return { percent: 100, label: labels.statuses[status] };
  }

  const percent = sections.length
    ? Math.round(sections.reduce((sum, section) => sum + section.completion, 0) / sections.length)
    : 0;

  if (percent >= 80) {
    return { percent, label: labels.readyToShare };
  }

  if (percent >= 40) {
    return { percent, label: labels.statuses.in_progress };
  }

  return { percent, label: labels.needsAttention };
}

function buildMissingActions(
  sections: BuyerRequestSectionReadiness[],
  labels: BuyerRequestLabels,
) {
  const actions: string[] = [];

  for (const section of sections) {
    const sectionLabel = labels.sections[section.code] ?? section.title;

    if (section.totalQuestions > section.answeredQuestions) {
      actions.push(formatBuyerRequestLabel(labels.completeSectionQuestions, { section: sectionLabel }));
    }

    if (section.evidenceRequired > section.evidenceLinked) {
      actions.push(formatBuyerRequestLabel(labels.uploadOrLinkEvidence, { section: sectionLabel }));
    }

    if (section.expiredCertificates || section.expiringSoonCertificates) {
      actions.push(labels.reviewCertificateExpiry);
    }
  }

  return [...new Set(actions)].slice(0, 8);
}

function getEvidenceStatus(section: BuyerRequestSectionReadiness, labels: BuyerRequestLabels) {
  if (section.evidenceLinked > 0) {
    return labels.evidenceAvailable;
  }

  if (section.evidenceRequired > 0) {
    return labels.evidenceRecommended;
  }

  return labels.noEvidenceYet;
}

function buildResponseChecklist({
  labels,
  requestedSectionsComplete,
  hasLinkedEvidence,
  hasActiveShareLink,
  hasPdfDraft,
  status,
}: {
  labels: BuyerRequestLabels;
  requestedSectionsComplete: boolean;
  hasLinkedEvidence: boolean;
  hasActiveShareLink: boolean;
  hasPdfDraft: boolean;
  status: BuyerRequestStatus;
}) {
  const readyStatus = status === "ready_to_share" || status === "shared" || status === "closed";

  return [
    { label: labels.checklistCompleteRequestedSections, done: requestedSectionsComplete },
    { label: labels.checklistLinkEvidence, done: hasLinkedEvidence },
    { label: labels.checklistReviewPassport, done: readyStatus },
    { label: labels.checklistConfirmPublicLink, done: hasActiveShareLink },
    { label: labels.checklistDownloadPdf, done: hasPdfDraft },
    { label: labels.checklistMarkReady, done: readyStatus },
  ];
}

function buildResponseNote({
  labels,
  buyerName,
  organizationName,
  publicUrl,
}: {
  labels: BuyerRequestLabels;
  buyerName: string;
  organizationName: string;
  publicUrl: string | null;
}) {
  if (!publicUrl) {
    return formatBuyerRequestLabel(labels.responseNoteWithoutLink, {
      buyer: buyerName,
      organization: organizationName,
    });
  }

  return formatBuyerRequestLabel(labels.responseNoteWithLink, {
    buyer: buyerName,
    organization: organizationName,
    link: publicUrl,
  });
}

function formatDueLabel(
  value: string,
  status: BuyerRequestStatus,
  locale: string,
  labels: BuyerRequestLabels,
) {
  const dueState = getDueState(value, status);

  if (dueState.state === "overdue") {
    return formatBuyerRequestLabel(labels.overdueByDays, { count: dueState.days });
  }

  if (dueState.state === "today") {
    return labels.dueToday;
  }

  if (dueState.state === "dueSoon") {
    return formatBuyerRequestLabel(labels.dueInDays, { count: dueState.days });
  }

  return formatDate(value, locale);
}

function getDueState(value: string | null, status: BuyerRequestStatus) {
  if (!value) {
    return { state: "none", days: 0 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${value}T00:00:00`);

  if (Number.isNaN(due.getTime())) {
    return { state: "none", days: 0 };
  }

  if (status === "closed") {
    return { state: "ok", days: 0 };
  }

  const dayDifference = Math.round((due.getTime() - today.getTime()) / 86_400_000);

  if (dayDifference === 0) {
    return { state: "today", days: 0 };
  }

  if (due < today) {
    return { state: "overdue", days: Math.abs(dayDifference) };
  }

  return dayDifference <= 7
    ? { state: "dueSoon", days: dayDifference }
    : { state: "ok", days: dayDifference };
}

function stripDatePlaceholder(template: string) {
  return template.replace("{date}", "").trim();
}

function BuyerRequestMessage({ message }: { message: MessageState }) {
  const styles = {
    info: "border-blue-100 bg-blue-50 text-blue-800",
    success: "border-emerald-100 bg-emerald-50 text-emerald-800",
    error: "border-red-100 bg-red-50 text-red-800",
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${styles[message.tone]}`}>
      {message.text}
    </div>
  );
}

async function fetchWithAuth(input: string, init: RequestInit) {
  const session = await getFreshBrowserNhostSession();

  if (!session?.accessToken) {
    return null;
  }

  let response = await fetch(input, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (response.status === 401) {
    const refreshed = await forceRefreshBrowserNhostSession();

    if (refreshed?.accessToken) {
      response = await fetch(input, {
        ...init,
        headers: {
          ...(init.headers ?? {}),
          authorization: `Bearer ${refreshed.accessToken}`,
        },
      });
    }
  }

  return response;
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
