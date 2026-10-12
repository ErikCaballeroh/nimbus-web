'use client';

import { useMemo, useState } from "react";
import { Icon } from "../components/icons";
import { AvatarStack, Button, Card, EmptyState, IconButton, Progress, Skeleton, useClickOutside } from "../components/ui";
import { ProjectModal } from "../components/Modals";
import { useStore } from "../store";
import { fmtDate } from "../lib/data";
import type { Project } from "../lib/data";
import type { Route } from "../components/Shell";

type SortKey = "name" | "progress" | "end";

export function Projects({ loading, go }: { loading: boolean; go: (r: Route) => void }) {
  const { projects, tasks, members } = useStore();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("name");
  const [asc, setAsc] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const menuRef = useClickOutside<HTMLDivElement>(() => setMenu(null));

  const rows = useMemo(() => {
    const mapped = projects.map((p) => {
      const t = tasks.filter((x) => x.projectId === p.id);
      const done = t.filter((x) => x.status === "done").length;
      const progress = t.length ? Math.round((done / t.length) * 100) : 0;
      return { p, taskCount: t.length, progress, mem: members.filter((m) => p.memberIds.includes(m.id)) };
    });
    const filtered = mapped.filter((r) => r.p.name.toLowerCase().includes(q.toLowerCase()));
    filtered.sort((a, b) => {
      let d = 0;
      if (sort === "name") d = a.p.name.localeCompare(b.p.name);
      if (sort === "progress") d = a.progress - b.progress;
      if (sort === "end") d = a.p.end.localeCompare(b.p.end);
      return asc ? d : -d;
    });
    return filtered;
  }, [projects, tasks, members, q, sort, asc]);

  const toggleSort = (k: SortKey) => {
    if (sort === k) setAsc((a) => !a);
    else { setSort(k); setAsc(true); }
  };

  if (loading) return <ProjectsSkeleton />;

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Icon.search width={16} height={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar proyectos…"
            className="h-9.5 w-full rounded-lg border border-border-strong bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md"><Icon.filter width={16} height={16} /> Filtrar</Button>
          <Button size="md" onClick={() => setCreating(true)}><Icon.plus width={17} height={17} /> Nuevo proyecto</Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={<Icon.projects width={26} height={26} />}
          title={q ? "Sin resultados" : "Aún no hay proyectos"}
          body={q ? "Prueba con otro término de búsqueda." : "Crea tu primer proyecto para empezar a organizar el trabajo de tu equipo."}
          action={!q && <Button onClick={() => setCreating(true)}><Icon.plus width={17} height={17} /> Crear proyecto</Button>}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <Th onClick={() => toggleSort("name")} active={sort === "name"} asc={asc}>Proyecto</Th>
                  <th className="px-4 py-3 font-medium">Miembros</th>
                  <th className="px-4 py-3 font-medium">Tareas</th>
                  <Th onClick={() => toggleSort("progress")} active={sort === "progress"} asc={asc}>Progreso</Th>
                  <Th onClick={() => toggleSort("end")} active={sort === "end"} asc={asc}>Entrega</Th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map(({ p, taskCount, progress, mem }) => (
                  <tr
                    key={p.id}
                    onClick={() => go({ name: "board", projectId: p.id })}
                    className="group cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-secondary/50"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: p.color }}>
                          <Icon.projects width={17} height={17} />
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium text-foreground">{p.name}</div>
                          <div className="truncate text-xs text-muted-foreground max-w-xs">{p.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><AvatarStack members={mem} size={28} /></td>
                    <td className="px-4 py-3.5 text-muted-foreground">{taskCount} tareas</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Progress value={progress} color={p.color} />
                        <span className="w-9 text-right text-xs font-medium tabular-nums text-muted-foreground">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground">{fmtDate(p.end)}</td>
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block" ref={menu === p.id ? menuRef : undefined}>
                        <IconButton className="opacity-0 group-hover:opacity-100" onClick={() => setMenu(menu === p.id ? null : p.id)}>
                          <Icon.dots width={18} height={18} />
                        </IconButton>
                        {menu === p.id && (
                          <div className="animate-dropdown absolute right-0 top-10 z-40 w-44 rounded-lg border border-border bg-popover py-1 shadow-[var(--shadow-lg)]">
                            <MenuItem icon={Icon.board} onClick={() => go({ name: "board", projectId: p.id })}>Abrir tablero</MenuItem>
                            <MenuItem icon={Icon.team} onClick={() => go({ name: "members", projectId: p.id })}>Miembros</MenuItem>
                            <MenuItem icon={Icon.edit} onClick={() => { setEditing(p); setMenu(null); }}>Editar</MenuItem>
                            <div className="my-1 border-t border-border" />
                            <MenuItem icon={Icon.trash} danger onClick={() => setMenu(null)}>Eliminar</MenuItem>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {creating && <ProjectModal open onClose={() => setCreating(false)} />}
      {editing && <ProjectModal open onClose={() => setEditing(null)} project={editing} />}
    </div>
  );
}

function Th({ children, onClick, active, asc }: { children: React.ReactNode; onClick: () => void; active: boolean; asc: boolean }) {
  return (
    <th className="px-4 py-3 font-medium">
      <button onClick={onClick} className={`inline-flex items-center gap-1 transition-colors hover:text-foreground ${active ? "text-foreground" : ""}`}>
        {children}
        {active && <Icon.chevronDown width={13} height={13} className={asc ? "rotate-180 transition-transform" : "transition-transform"} />}
      </button>
    </th>
  );
}

function MenuItem({ icon: I, children, onClick, danger }: { icon: typeof Icon.user; children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-2.5 px-3 py-2 text-[13px] transition-colors ${danger ? "text-danger hover:bg-danger/8" : "text-foreground hover:bg-secondary"}`}>
      <I width={15} height={15} className={danger ? "" : "text-muted-foreground"} /> {children}
    </button>
  );
}

function ProjectsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6">
      <Skeleton className="mb-5 h-9.5 w-64" />
      <Card className="p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border py-4 last:border-0">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="ml-auto h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </Card>
    </div>
  );
}
