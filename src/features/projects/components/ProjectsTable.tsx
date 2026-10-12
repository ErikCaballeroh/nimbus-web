'use client';

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { AvatarStack, Card, Icon, IconButton, Progress } from "../../../components/ui";
import { useClickOutside } from "../../../hooks/useClickOutside";
import { fmtDate } from "../../../lib/utils";
import type { Member } from "../../members/types";
import type { Project } from "../types";
import { ProjectRowMenu } from "./ProjectRowMenu";

export type SortKey = "name" | "progress" | "end";
export type ProjectRow = { p: Project; taskCount: number; progress: number; mem: Member[] };

function Th({ children, onClick, active, asc }: { children: ReactNode; onClick: () => void; active: boolean; asc: boolean }) {
  return (
    <th className="px-4 py-3 font-medium">
      <button onClick={onClick} className={`inline-flex items-center gap-1 transition-colors hover:text-foreground ${active ? "text-foreground" : ""}`}>
        {children}
        {active && <Icon.chevronDown width={13} height={13} className={asc ? "rotate-180 transition-transform" : "transition-transform"} />}
      </button>
    </th>
  );
}

export function ProjectsTable({
  rows,
  sort,
  asc,
  onToggleSort,
  onEdit,
}: {
  rows: ProjectRow[];
  sort: SortKey;
  asc: boolean;
  onToggleSort: (k: SortKey) => void;
  onEdit: (p: Project) => void;
}) {
  const router = useRouter();
  const [menu, setMenu] = useState<string | null>(null);
  const menuRef = useClickOutside<HTMLDivElement>(() => setMenu(null));

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <Th onClick={() => onToggleSort("name")} active={sort === "name"} asc={asc}>Proyecto</Th>
              <th className="px-4 py-3 font-medium">Miembros</th>
              <th className="px-4 py-3 font-medium">Tareas</th>
              <Th onClick={() => onToggleSort("progress")} active={sort === "progress"} asc={asc}>Progreso</Th>
              <Th onClick={() => onToggleSort("end")} active={sort === "end"} asc={asc}>Entrega</Th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ p, taskCount, progress, mem }) => (
              <tr
                key={p.id}
                onClick={() => router.push(`/projects/${p.id}/board`)}
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
                <td className="px-4 py-3.5"><AvatarStack people={mem} size={28} /></td>
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
                      <ProjectRowMenu projectId={p.id} onEdit={() => onEdit(p)} onClose={() => setMenu(null)} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
