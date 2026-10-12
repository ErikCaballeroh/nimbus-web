'use client';

import { useState } from "react";
import { Icon } from "../components/icons";
import { Avatar, Button, Card, IconButton, useClickOutside } from "../components/ui";
import { AddMemberModal } from "../components/Modals";
import { useStore } from "../store";
import type { Role } from "../lib/data";

const roleTone: Record<Role, string> = {
  Propietario: "var(--primary)",
  Administrador: "var(--info)",
  Editor: "var(--success)",
  Lector: "var(--muted-foreground)",
};

export function Members({ projectId }: { projectId: string }) {
  const { projects, members, updateProject } = useStore();
  const project = projects.find((p) => p.id === projectId);
  const [adding, setAdding] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const menuRef = useClickOutside<HTMLDivElement>(() => setMenu(null));
  if (!project) return null;
  const projMembers = members.filter((m) => project.memberIds.includes(m.id));

  const remove = (id: string) => {
    updateProject(project.id, { memberIds: project.memberIds.filter((x) => x !== id) });
    setMenu(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-6 sm:px-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">Miembros del proyecto</h2>
          <p className="text-[13px] text-muted-foreground">{projMembers.length} personas con acceso a {project.name}</p>
        </div>
        <Button onClick={() => setAdding(true)}><Icon.plus width={17} height={17} /> Añadir miembro</Button>
      </div>

      <Card className="divide-y divide-border">
        {projMembers.map((m) => (
          <div key={m.id} className="flex items-center gap-3.5 px-4 py-3.5">
            <Avatar member={m} size={40} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-foreground">{m.name}</div>
              <div className="truncate text-[13px] text-muted-foreground">{m.email}</div>
            </div>
            <span
              className="hidden rounded-md px-2 py-1 text-xs font-medium sm:inline-block"
              style={{ color: roleTone[m.role], background: `color-mix(in srgb, ${roleTone[m.role]} 12%, transparent)` }}
            >
              {m.role}
            </span>
            <div className="relative" ref={menu === m.id ? menuRef : undefined}>
              <IconButton onClick={() => setMenu(menu === m.id ? null : m.id)} disabled={m.role === "Propietario"}>
                <Icon.dots width={18} height={18} />
              </IconButton>
              {menu === m.id && (
                <div className="animate-dropdown absolute right-0 top-10 z-40 w-52 rounded-lg border border-border bg-popover p-1.5 shadow-[var(--shadow-lg)]">
                  <div className="px-2 pb-1.5 pt-1 text-xs font-medium text-muted-foreground">Cambiar rol</div>
                  {(["Administrador", "Editor", "Lector"] as Role[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => { updateProject(project.id, {}); setMenu(null); }}
                      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[13px] text-foreground hover:bg-secondary"
                    >
                      {r} {m.role === r && <Icon.check width={15} height={15} className="text-primary" />}
                    </button>
                  ))}
                  <div className="my-1 border-t border-border" />
                  <button onClick={() => remove(m.id)} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-danger hover:bg-danger/8">
                    <Icon.trash width={15} height={15} /> Quitar del proyecto
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </Card>

      {adding && <AddMemberModal open onClose={() => setAdding(false)} projectId={projectId} />}
    </div>
  );
}
