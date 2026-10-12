'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Icon } from "../components/icons";
import { Avatar, Card, PriorityBadge, Skeleton } from "../components/ui";
import { useStore } from "../store";
import { fmtDateShort, isOverdue, relTime, statusMeta } from "../lib/data";
import type { Route } from "../components/Shell";

const burndown = [
  { d: "L", plan: 42, real: 42 },
  { d: "M", plan: 38, real: 40 },
  { d: "X", plan: 34, real: 36 },
  { d: "J", plan: 30, real: 33 },
  { d: "V", plan: 26, real: 27 },
  { d: "S", plan: 22, real: 21 },
  { d: "D", plan: 18, real: 16 },
];

export function Dashboard({ loading, go }: { loading: boolean; go: (r: Route) => void }) {
  const { tasks, projects, members, notifications, theme } = useStore();
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
    return { name: p.name.split(" ")[0], total: t.length, done: d, color: p.color };
  });

  const upcoming = [...tasks]
    .filter((t) => t.status !== "done")
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 5);

  const grid = theme === "dark" ? "#262a31" : "#e6e8ec";
  const axis = theme === "dark" ? "#8b909a" : "#6b7280";

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="animate-rise p-5" >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `color-mix(in srgb, ${k.tone} 14%, transparent)`, color: k.tone }}>
                <k.icon width={20} height={20} />
              </div>
              <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${k.up ? "text-success" : "text-danger"}`}>
                {k.up ? <Icon.trend width={14} height={14} /> : <Icon.trendDown width={14} height={14} />}
                {k.delta}
              </span>
            </div>
            <div className="mt-4 text-3xl font-semibold tracking-tight text-foreground">{k.value}</div>
            <div className="mt-0.5 text-[13px] text-muted-foreground">{k.label}</div>
          </Card>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {/* Burndown line chart */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-foreground">Progreso del sprint</h3>
              <p className="text-[13px] text-muted-foreground">Tareas restantes: planificado vs. real</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--primary)]" /> Real</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--border-strong)]" /> Plan</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={burndown} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
              <XAxis dataKey="d" stroke={axis} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={axis} fontSize={12} tickLine={false} axisLine={false} />
              <RTooltip contentStyle={tooltipStyle(theme)} />
              <Line type="monotone" dataKey="plan" stroke="var(--border-strong)" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="real" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--primary)" }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Activity */}
        <Card className="flex flex-col p-5">
          <h3 className="mb-4 text-[15px] font-semibold text-foreground">Actividad reciente</h3>
          <div className="flex flex-1 flex-col gap-4">
            {notifications.slice(0, 5).map((n) => {
              const actor = members.find((m) => m.id === n.actorId)!;
              return (
                <div key={n.id} className="flex gap-3">
                  <Avatar member={actor} size={30} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] leading-snug text-foreground">
                      <span className="font-medium">{actor.name}</span> {n.text}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{relTime(n.time)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={() => go({ name: "notifications" })} className="mt-4 text-[13px] font-medium text-primary hover:underline">
            Ver todo el historial
          </button>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {/* Progress by project */}
        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-4 text-[15px] font-semibold text-foreground">Tareas por proyecto</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={perProject} margin={{ top: 8, right: 8, bottom: 0, left: -18 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
              <XAxis dataKey="name" stroke={axis} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={axis} fontSize={12} tickLine={false} axisLine={false} />
              <RTooltip contentStyle={tooltipStyle(theme)} cursor={{ fill: "color-mix(in srgb, var(--muted-foreground) 8%, transparent)" }} />
              <Bar dataKey="total" fill="var(--border-strong)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="done" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Upcoming */}
        <Card className="p-5">
          <h3 className="mb-4 text-[15px] font-semibold text-foreground">Tareas próximas</h3>
          <div className="flex flex-col gap-1">
            {upcoming.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-secondary">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: statusMeta[t.status].accent }} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-foreground">{t.title}</div>
                  <div className={`text-xs ${isOverdue(t.due) ? "text-danger" : "text-muted-foreground"}`}>
                    {isOverdue(t.due) ? "Atrasada · " : ""}{fmtDateShort(t.due)}
                  </div>
                </div>
                <PriorityBadge priority={t.priority} dot />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function tooltipStyle(theme: string) {
  return {
    background: theme === "dark" ? "#1a1d23" : "#fff",
    border: `1px solid ${theme === "dark" ? "#262a31" : "#e6e8ec"}`,
    borderRadius: 10,
    fontSize: 12,
    boxShadow: "0 8px 24px -8px rgb(16 24 40 / 0.2)",
    color: theme === "dark" ? "#e7e9ee" : "#1a1d21",
  };
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="mt-4 h-8 w-20" />
            <Skeleton className="mt-2 h-4 w-28" />
          </Card>
        ))}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2"><Skeleton className="h-4 w-40" /><Skeleton className="mt-6 h-56 w-full" /></Card>
        <Card className="p-5"><Skeleton className="h-4 w-40" />{Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="mt-4 flex gap-3"><Skeleton className="h-8 w-8 rounded-full" /><div className="flex-1"><Skeleton className="h-3 w-full" /><Skeleton className="mt-2 h-3 w-16" /></div></div>
        ))}</Card>
      </div>
    </div>
  );
}
