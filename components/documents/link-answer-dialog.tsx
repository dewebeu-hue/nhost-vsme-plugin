"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Link2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StateCard } from "@/components/shared/state-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnswerStatusPill } from "@/components/questionnaire/answer-status-pill";
import type { QuestionnaireAnswerStatus } from "@/lib/mock-data";
import { defaultDocumentsLabels, type DocumentsLabels } from "@/lib/workspace-labels";

export type LinkableAnswer = {
  id: string;
  answerId?: string;
  code: string;
  title: string;
  section: string;
  status: QuestionnaireAnswerStatus;
};

type LinkAnswerDialogProps = {
  open: boolean;
  answers: LinkableAnswer[];
  linkedAnswerIds: string[];
  isSaving: boolean;
  labels?: DocumentsLabels;
  onOpenChange: (open: boolean) => void;
  onLink: (questionItemIds: string[]) => Promise<boolean>;
};

export function LinkAnswerDialog({
  open,
  answers,
  linkedAnswerIds,
  isSaving,
  labels = defaultDocumentsLabels,
  onOpenChange,
  onLink,
}: LinkAnswerDialogProps) {
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const sections = useMemo(
    () => ["all", ...Array.from(new Set(answers.map((answer) => answer.section)))],
    [answers],
  );

  const filteredAnswers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return answers.filter((answer) => {
      const matchesSection = section === "all" || answer.section === section;
      const matchesQuery =
        !normalizedQuery ||
        `${answer.code} ${answer.title}`.toLowerCase().includes(normalizedQuery);

      return matchesSection && matchesQuery;
    });
  }, [answers, query, section]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const linked = await onLink(selectedIds);

    if (linked) {
      setSelectedIds([]);
      setQuery("");
      setSection("all");
    }
  }

  function toggleAnswer(answerId: string) {
    setSelectedIds((currentIds) =>
      currentIds.includes(answerId)
        ? currentIds.filter((id) => id !== answerId)
        : [...currentIds, answerId],
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl shadow-slate-950/10">
        <form onSubmit={handleSubmit}>
          {selectedIds.map((selectedId) => (
            <input key={selectedId} type="hidden" name="questionItemIds" value={selectedId} />
          ))}
          <DialogHeader className="border-b border-slate-100 px-6 py-5">
            <DialogTitle className="text-xl font-semibold tracking-tight text-slate-950">
              {labels.linkDialogTitle}
            </DialogTitle>
            <DialogDescription className="leading-6 text-slate-600">
              {labels.linkDialogDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 px-6 py-5">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                />
                <Input
                  aria-label={labels.searchAnswers}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={labels.searchAnswersPlaceholder}
                  className="h-11 rounded-xl bg-slate-50 pl-9"
                />
              </div>
              <Select
                value={section}
                onValueChange={(value) => {
                  if (value) {
                    setSection(value);
                  }
                }}
              >
                <SelectTrigger
                  aria-label={labels.filterAnswersBySection}
                  className="h-11 w-full rounded-xl bg-white"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {sections.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item === "all" ? labels.allSections : labels.sections[item] ?? item}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-2">
              {filteredAnswers.length ? (
                <div className="flex flex-col gap-2">
                  {filteredAnswers.map((answer) => {
                    const alreadyLinked = linkedAnswerIds.includes(answer.id);
                    const selected = selectedIds.includes(answer.id) || alreadyLinked;

                    return (
                      <div
                        key={answer.id}
                        role="checkbox"
                        aria-checked={selected}
                        aria-disabled={alreadyLinked}
                        tabIndex={alreadyLinked ? -1 : 0}
                        className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left shadow-sm transition ${
                          selected
                            ? "border-blue-300 bg-blue-50"
                            : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"
                        } ${alreadyLinked ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                        onClick={() => {
                          if (!alreadyLinked) {
                            toggleAnswer(answer.id);
                          }
                        }}
                        onKeyDown={(event) => {
                          if (alreadyLinked) {
                            return;
                          }

                          if (event.key === " " || event.key === "Enter") {
                            event.preventDefault();
                            toggleAnswer(answer.id);
                          }
                        }}
                      >
                        <Checkbox
                          checked={selected}
                          disabled={alreadyLinked}
                          aria-label={`Select ${answer.code}`}
                          className="mt-1"
                          onClick={(event) => event.stopPropagation()}
                          onCheckedChange={() => {
                            if (!alreadyLinked) {
                              toggleAnswer(answer.id);
                            }
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-blue-700">
                              {answer.code}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">
                              {labels.sections[answer.section] ?? answer.section}
                            </span>
                            <AnswerStatusPill
                              status={answer.status}
                              label={labels.answerStatuses[answer.status] ?? answer.status}
                            />
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            {labels.questionTitles[answer.title] ?? answer.title}
                          </p>
                          {alreadyLinked ? (
                            <p className="mt-1 text-xs font-semibold text-emerald-600">
                              {labels.alreadyLinked}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <StateCard
                  title={answers.length ? labels.noMatchingAnswers : labels.noAnswersYet}
                  description={
                    answers.length
                      ? labels.noMatchingAnswersDescription
                      : labels.noAnswersYetDescription
                  }
                  className="border-0 shadow-none"
                />
              )}
            </div>
          </div>

          <DialogFooter className="rounded-b-2xl border-t border-slate-100 bg-slate-50 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="bg-white"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              {labels.cancel}
            </Button>
            <Button type="submit" disabled={isSaving || selectedIds.length === 0}>
              <Link2 data-icon="inline-start" />
              {isSaving ? labels.linking : labels.linkSelectedAnswers}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
