"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import type { QuestionnaireEnergyQuestion } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type QuestionnaireQuestionCardProps = {
  question: QuestionnaireEnergyQuestion;
  index: number;
};

export function QuestionnaireQuestionCard({
  question,
  index,
}: QuestionnaireQuestionCardProps) {
  const [yesNoValue, setYesNoValue] = useState(
    question.type === "yes-no" ? question.value : "Yes",
  );
  const [selectedChips, setSelectedChips] = useState(
    question.type === "chips" ? question.values : [],
  );

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="flex gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
            {index + 1}
          </span>
          <h3 className="text-base font-semibold leading-7 text-slate-950">
            {question.prompt}
          </h3>
        </div>
        <AnswerStatusPill status={question.status} />
      </div>

      <div className="mt-5 pl-0 sm:pl-11">{renderAnswerControl(question, yesNoValue, setYesNoValue, selectedChips, setSelectedChips)}</div>
    </article>
  );
}

function renderAnswerControl(
  question: QuestionnaireEnergyQuestion,
  yesNoValue: string,
  setYesNoValue: (value: "Yes" | "No") => void,
  selectedChips: string[],
  setSelectedChips: (value: string[]) => void,
) {
  if (question.type === "input") {
    return (
      <div className="flex max-w-md overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
        <Input
          defaultValue={question.value}
          className="h-12 border-0 bg-transparent px-4 text-base font-semibold shadow-none"
        />
        <div className="flex min-w-28 items-center justify-center border-l border-slate-200 px-4 text-sm font-semibold text-slate-500">
          {question.unit}
        </div>
      </div>
    );
  }

  if (question.type === "select") {
    return (
      <Select defaultValue={question.value}>
        <SelectTrigger className="h-12 w-full max-w-md rounded-xl bg-slate-50 px-4">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {question.options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
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
            {option}
          </Button>
        ))}
      </div>
    );
  }

  if (question.type === "date") {
    return (
      <div className="flex max-w-md items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
        <CalendarDays aria-hidden="true" className="size-4 text-blue-600" />
        {question.value}
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
              {option}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <Textarea
      defaultValue={question.value}
      className="min-h-28 resize-none rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6"
    />
  );
}
