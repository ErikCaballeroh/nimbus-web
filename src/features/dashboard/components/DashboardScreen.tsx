'use client';

import { Icon } from "../../../components/ui";
import { useTheme } from "../../../components/providers/ThemeProvider";
import { isOverdue } from "../../../lib/utils";
import { useStore } from "../../../store";
import { ProjectsProgressChart } from "./ProjectsProgressChart";
import { RecentActivityCard } from "./RecentActivityCard";
import { SprintBurndownChart } from "./SprintBurndownChart";
import { StatCard } from "./StatCard";
import { UpcomingTasksCard } from "./UpcomingTasksCard";

export function DashboardScreen() {
  const { tasks, projects, members, notifications } = useStore();
  const { theme } = useTheme();
  const done = tasks.filter((t) => t.status === "done").length;
  const overdue = tasks.filter((t) => t.status !== "done" && isOverdue(t.due)).length;

  const kpis = [
    { label: "Proyectos activos", value: projects.length, delta: "+2", up: true, icon: Icon.projects, tone: "var(--primary)" },
    { label: "Tareas totales", value: tasks.length, delta: "+8", up: true, icon: Icon.board, tone: "var(--info)" },
    { label: "Completadas", value: done, delta: "+5", up: true, icon: Icon.check_circle, tone: "var(--success)" },
    { label: "Atrasadas", value: overdue, delta: overdue > 0 ? `${overdue}` : "0", up: false, icon: Icon.alert, tone: "var(--danger)" },
  ];

  const perProject = projects.map((p) => {
    const t = tasks.filter((x) => x.projectId === p.id);
    const d = t.filter((x) => x.status === "done").length;
    return { name: p.name.split(" ")[0], total: t.length, done: d };
  });

  const upcoming = [...tasks]
    .filter((t) => t.status !== "done")
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => <StatCard key={k.label} {...k} />)}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <SprintBurndownChart theme={theme} />
        <RecentActivityCard notifications={notifications} members={members} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <ProjectsProgressChart data={perProject} theme={theme} />
        <UpcomingTasksCard tasks={upcoming} />
      </div>
    </div>
  );
}
