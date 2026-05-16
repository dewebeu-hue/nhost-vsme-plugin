import { MoreHorizontal, Send, Save, ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { QuestionnaireHelperPanel } from "@/components/questionnaire/questionnaire-helper-panel";
import { QuestionnaireQuestionCard } from "@/components/questionnaire/questionnaire-question-card";
import { QuestionnaireSectionList } from "@/components/questionnaire/questionnaire-section-list";
import {
  questionnaireEnergyQuestions,
  questionnaireOverviewMock,
  questionnaireSectionProgress,
} from "@/lib/mock-data";

export default function QuestionnairePage() {
  const activeSection = questionnaireOverviewMock.activeSection;

  return (
    <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-6">
      <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {questionnaireOverviewMock.title}
            </h1>
            <Badge
              variant="outline"
              className="rounded-full border-slate-200 bg-white px-3 py-1 text-slate-600"
            >
              {questionnaireOverviewMock.status}
            </Badge>
          </div>
          <p className="mt-2 text-base leading-7 text-slate-600">
            {questionnaireOverviewMock.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline">
            <Send data-icon="inline-start" />
            Share progress
          </Button>
          <Button className="shadow-lg shadow-blue-600/15">
            <Save data-icon="inline-start" />
            Save & Continue
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
              <MoreHorizontal />
              <span className="sr-only">More actions</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem>Export draft</DropdownMenuItem>
                <DropdownMenuItem>Assign section owner</DropdownMenuItem>
                <DropdownMenuItem>Reset section</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_340px]">
        <QuestionnaireSectionList
          completion={questionnaireOverviewMock.completion}
          completedQuestions={questionnaireOverviewMock.completedQuestions}
          totalQuestions={questionnaireOverviewMock.totalQuestions}
          sections={questionnaireSectionProgress}
        />

        <main className="flex min-w-0 flex-col gap-5">
          <section className="supplier-surface rounded-2xl border-0 p-6">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                  Active section
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  {activeSection.name}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  {activeSection.subtitle}
                </p>
              </div>

              <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 md:w-64">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Section completion</p>
                    <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                      {activeSection.completion}%
                    </p>
                  </div>
                  <p className="pb-1 text-sm font-semibold text-slate-500">
                    {activeSection.completedQuestions} of {activeSection.totalQuestions}
                  </p>
                </div>
                <Progress value={activeSection.completion} className="mt-4 h-2" />
                <p className="mt-2 text-xs font-medium text-slate-500">
                  questions completed
                </p>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-4">
            {questionnaireEnergyQuestions.map((question, index) => (
              <QuestionnaireQuestionCard
                key={question.id}
                question={question}
                index={index}
              />
            ))}
          </div>

          <footer className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
            <Button variant="outline">
              <ArrowLeft data-icon="inline-start" />
              Previous section
            </Button>
            <Button className="shadow-lg shadow-blue-600/15">
              Save & Continue
              <ArrowRight data-icon="inline-end" />
            </Button>
          </footer>
        </main>

        <QuestionnaireHelperPanel
          guidance={questionnaireOverviewMock.helper.guidance}
          learnMoreLabel={questionnaireOverviewMock.helper.learnMoreLabel}
          evidenceRecommendations={
            questionnaireOverviewMock.helper.evidenceRecommendations
          }
          relatedDocuments={questionnaireOverviewMock.helper.relatedDocuments}
        />
      </div>
    </div>
  );
}
