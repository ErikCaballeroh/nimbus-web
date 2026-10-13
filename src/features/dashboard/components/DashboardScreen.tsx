'use client';

import { Icon } from "@/components/ui";
import { useTheme } from "@/components/providers/ThemeProvider";
import type { Notification } from "@/features/notifications/types";
import type { DashboardSummary } from "@/features/dashboard/types";
import { ProjectsProgressChart } from "./ProjectsProgressChart";
import { RecentActivityCard } from "./RecentActivityCard";
import { SprintBurndownChart } from "./SprintBurndownChart";
import { StatCard } from "./StatCard";
import { UpcomingTasksCard } from "./UpcomingTasksCard";

export function DashboardScreen({
  summary,
  recentActivity,
}: {
  summary: DashboardSummary;
  recentActivity: Notification[];
}) {
  const { theme } = useTheme();

  const kpis = [
    { label: "Proyectos activos", value: summary.activeProjects, icon: Icon.projects, tone: "var(--primary)" },
    { label: "Tareas totales", value: summary.totalTasks, icon: Icon.board, tone: "var(--info)" },
    { label: "Completadas", value: summary.doneTasks, icon: Icon.check_circle, tone: "var(--success)" },
    { label: "Atrasadas", value: summary.overdueTasks, icon: Icon.alert, tone: "var(--danger)" },
  ];

  const perProject = summary.projectsProgress.map((p) => ({
    name: p.name.split(" ")[0],
    total: p.total,
    done: p.done,
  }));

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => <StatCard key={k.label} {...k} />)}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <SprintBurndownChart theme={theme} />
        <RecentActivityCard notifications={recentActivity} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <ProjectsProgressChart data={perProject} theme={theme} />
        <UpcomingTasksCard tasks={summary.upcomingTasks} />
      </div>
    </div>
  );
}
