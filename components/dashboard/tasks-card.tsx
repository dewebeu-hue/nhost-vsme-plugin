import { CheckCircle2, Circle } from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";
import { DashboardStatusPill } from "@/components/dashboard/dashboard-status-pill";
import { defaultDashboardOverviewLabels, type DashboardOverviewLabels } from "@/lib/dashboard-labels";

type DashboardTask = {
  title: string;
  category: string;
  due: string;
  completed: boolean;
};

type TasksCardProps = {
  tasks: DashboardTask[];
  labels?: DashboardOverviewLabels;
};

export function TasksCard({ tasks, labels = defaultDashboardOverviewLabels }: TasksCardProps) {
  return (
    <SectionCard
      title={labels.yourTasks}
      description={labels.tasksDescription}
      className="h-full"
    >
      <div className="flex flex-col gap-3">
        {tasks.map((task) => (
          <div key={task.title} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
            {task.completed ? (
              <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-emerald-500" />
            ) : (
              <Circle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-slate-300" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-950">{task.title}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {labels.modules[task.category] ?? task.category}
              </p>
            </div>
            <DashboardStatusPill tone={task.completed ? "green" : "amber"}>
              {task.due}
            </DashboardStatusPill>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
