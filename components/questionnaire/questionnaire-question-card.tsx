"use client";

import { CalendarDays, FileCheck2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentStatusBadge } from "@/components/documents/document-status-badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AnswerStatusPill } from "@/components/questionnaire/answer-status-pill";
import { QuestionHelp } from "@/components/questionnaire/question-help";
import type { QuestionnaireEnergyQuestion } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  defaultQuestionnaireLabels,
  type QuestionnaireLabels,
} from "@/lib/workspace-labels";

type QuestionnaireQuestionCardProps = {
  question: QuestionnaireEnergyQuestion;
  index: number;
  onValueChange?: (questionId: string, value: string | string[] | boolean) => void;
  onAttachEvidence?: (question: QuestionnaireEnergyQuestion) => void;
  labels?: QuestionnaireLabels;
};

export function QuestionnaireQuestionCard({
  question,
  index,
  onValueChange,
  onAttachEvidence,
  labels = defaultQuestionnaireLabels,
}: QuestionnaireQuestionCardProps) {
  const requiresEvidence =
    question.evidenceRequired ||
    question.status === "Needs evidence" ||
    Boolean(question.linkedDocuments?.length);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="flex gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
            {index + 1}
          </span>
          <div className="flex items-start gap-2">
            <h3 className="text-base font-semibold leading-7 text-slate-950">
              {labels.questionPrompts[question.id] ?? question.prompt}
            </h3>
            <QuestionHelp
              label={labels.questionHelpLabel}
              closeLabel={labels.questionHelpCloseLabel}
              text={resolveQuestionHelpText(question, labels)}
              className="mt-0.5"
            />
          </div>
        </div>
        <AnswerStatusPill
          status={question.status}
          label={labels.statuses[question.status] ?? question.status}
        />
      </div>

      <div className="mt-5 pl-0 sm:pl-11">
        {renderAnswerControl(
          question,
          labels,
          question.type === "yes-no" ? question.value : "Yes",
          (value) => {
            onValueChange?.(question.id, value === "Yes");
          },
          question.type === "chips" ? question.values : [],
          (value) => {
            onValueChange?.(question.id, value);
          },
          onValueChange,
        )}
        {requiresEvidence ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-slate-950">{labels.evidence}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {labels.evidenceSupportText}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="bg-white"
                onClick={() => onAttachEvidence?.(question)}
              >
                <Link2 data-icon="inline-start" />
                {labels.attachEvidence}
              </Button>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {question.linkedDocuments?.length ? (
                question.linkedDocuments.map((document) => (
                  <div
                    key={document.id}
                    className="flex flex-col justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                        <FileCheck2 aria-hidden="true" className="size-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {document.fileName}
                        </p>
                        <p className="text-xs font-medium text-slate-500">
                          {labels.documentTypes[
                            document.documentType as keyof typeof labels.documentTypes
                          ] ?? document.documentType}
                        </p>
                      </div>
                    </div>
                    <DocumentStatusBadge
                      status={document.status}
                      label={labels.documentStatuses[document.status] ?? document.status}
                    />
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/70 p-3 text-sm font-medium text-amber-800">
                  {labels.evidenceRequired}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function resolveQuestionHelpText(
  question: QuestionnaireEnergyQuestion,
  labels: QuestionnaireLabels,
) {
  const metadataHelp = question.helpText?.trim();
  const localizedHelp =
    labels.helperTexts[question.id]?.trim() ??
    (question.code ? labels.helperTexts[question.code]?.trim() : undefined);

  return metadataHelp ?? localizedHelp ?? labels.questionHelpFallback;
}

function renderAnswerControl(
  question: QuestionnaireEnergyQuestion,
  labels: QuestionnaireLabels,
  yesNoValue: string,
  setYesNoValue: (value: "Yes" | "No") => void,
  selectedChips: string[],
  setSelectedChips: (value: string[]) => void,
  onValueChange?: (questionId: string, value: string | string[] | boolean) => void,
) {
  if (question.type === "input") {
    const unit = question.unit?.trim();

    if (!unit) {
      return (
        <Input
          value={question.value}
          onChange={(event) => onValueChange?.(question.id, event.target.value)}
          readOnly={!onValueChange}
          className="h-12 w-full max-w-md rounded-xl border-slate-200 bg-slate-50 px-4 text-base font-semibold shadow-sm"
        />
      );
    }

    return (
      <div className="flex max-w-md overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
        <Input
          value={question.value}
          onChange={(event) => onValueChange?.(question.id, event.target.value)}
          readOnly={!onValueChange}
          className="h-12 border-0 bg-transparent px-4 text-base font-semibold shadow-none"
        />
        <div className="flex min-w-28 items-center justify-center border-l border-slate-200 px-4 text-sm font-semibold text-slate-500">
          {unit}
        </div>
      </div>
    );
  }

  if (question.type === "select") {
    const selectedValue = resolveCanonicalSelectValue(question.value, question.options, labels);
    const selectedLabel = resolveQuestionOptionLabel(selectedValue || question.value, labels);

    return (
      <Select
        value={selectedValue}
        onValueChange={(value) => {
          if (typeof value === "string") {
            onValueChange?.(question.id, value);
          }
        }}
      >
        <SelectTrigger className="h-12 w-full max-w-md rounded-xl bg-slate-50 px-4">
          <SelectValue>{selectedLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {question.options.map((option) => (
              <SelectItem key={option} value={option}>
                {resolveQuestionOptionLabel(option, labels)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  }

  if (question.type === "yes-no") {
    return (
      <div className="flex max-w-sm gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
        {(["Yes", "No"] as const).map((option) => (
          <Button
            key={option}
            type="button"
            variant={yesNoValue === option ? "default" : "ghost"}
            className={cn("h-10 flex-1", yesNoValue === option && "shadow-md shadow-blue-600/15")}
            onClick={() => setYesNoValue(option)}
          >
            {resolveQuestionOptionLabel(option, labels)}
          </Button>
        ))}
      </div>
    );
  }

  if (question.type === "date") {
    return (
      <div className="flex max-w-md items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
        <CalendarDays aria-hidden="true" className="size-4 text-blue-600" />
        <Input
          type="date"
          value={question.value}
          onChange={(event) => onValueChange?.(question.id, event.target.value)}
          readOnly={!onValueChange}
          className="h-auto border-0 bg-transparent p-0 text-sm font-semibold shadow-none"
        />
      </div>
    );
  }

  if (question.type === "chips") {
    return (
      <div className="flex flex-wrap gap-2">
        {question.options.map((option) => {
          const selected = selectedChips.includes(option);

          return (
            <button
              key={option}
              type="button"
              className={cn(
                "rounded-full border px-3 py-2 text-sm font-semibold transition-colors",
                selected
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
              )}
              onClick={() =>
                setSelectedChips(
                  selected
                    ? selectedChips.filter((chip) => chip !== option)
                    : [...selectedChips, option],
                )
              }
            >
              {resolveQuestionOptionLabel(option, labels)}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <Textarea
      value={question.value}
      onChange={(event) => onValueChange?.(question.id, event.target.value)}
      readOnly={!onValueChange}
      className="min-h-28 resize-none rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6"
    />
  );
}

function resolveQuestionOptionLabel(value: string, labels: QuestionnaireLabels) {
  return labels.questionOptions[value] ?? value;
}

function resolveCanonicalSelectValue(
  value: string,
  options: string[],
  labels: QuestionnaireLabels,
) {
  if (!value) {
    return "";
  }

  if (options.includes(value)) {
    return value;
  }

  const normalizedValue = normalizeSelectValue(value);
  const matchedOption = options.find((option) => {
    const localizedLabel = resolveQuestionOptionLabel(option, labels);

    return (
      normalizeSelectValue(option) === normalizedValue ||
      normalizeSelectValue(localizedLabel) === normalizedValue
    );
  });

  return matchedOption ?? value;
}

function normalizeSelectValue(value: string) {
  return value.trim().toLocaleLowerCase();
}
