'use client';

import { useMemo, useState } from "react";
import { Button, EmptyState, Icon } from "@/components/ui";
import type { ProjectListItem } from "@/features/projects/types";
import { DeleteProjectModal } from "./DeleteProjectModal";
import { ProjectFormModal } from "./ProjectFormModal";
import { ProjectsTable, type SortKey } from "./ProjectsTable";

export function ProjectsScreen({ projects }: { projects: ProjectListItem[] }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("name");
  const [asc, setAsc] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ProjectListItem | null>(null);
  const [deleting, setDeleting] = useState<ProjectListItem | null>(null);

  const rows = useMemo(() => {
    const mapped = projects.map((p) => ({
      p,
      taskCount: p.taskCount,
      progress: p.taskCount ? Math.round((p.doneTaskCount / p.taskCount) * 100) : 0,
      mem: p.members,
    }));
    const filtered = mapped.filter((r) => r.p.name.toLowerCase().includes(q.toLowerCase()));
    filtered.sort((a, b) => {
      let d = 0;
      if (sort === "name") d = a.p.name.localeCompare(b.p.name);
      if (sort === "progress") d = a.progress - b.progress;
      if (sort === "end") d = (a.p.endDate ?? "").localeCompare(b.p.endDate ?? "");
      return asc ? d : -d;
    });
    return filtered;
  }, [projects, q, sort, asc]);

  const toggleSort = (k: SortKey) => {
    if (sort === k) setAsc((a) => !a);
    else { setSort(k); setAsc(true); }
  };

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
        <ProjectsTable rows={rows} sort={sort} asc={asc} onToggleSort={toggleSort} onEdit={setEditing} onDelete={setDeleting} />
      )}

      {creating && <ProjectFormModal open onClose={() => setCreating(false)} />}
      {editing && <ProjectFormModal open onClose={() => setEditing(null)} project={editing} />}
      {deleting && <DeleteProjectModal open onClose={() => setDeleting(null)} project={deleting} />}
    </div>
  );
}
