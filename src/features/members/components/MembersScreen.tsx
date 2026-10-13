'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, Button, Card, Icon, IconButton } from "@/components/ui";
import { useClickOutside } from "@/hooks/useClickOutside";
import { es } from "@/lib/i18n/es";
import { apiFetch, ApiClientError } from "@/lib/apiClient";
import { hasRole, type Role } from "@/lib/roles";
import { useCurrentUser } from "@/features/auth/CurrentUserContext";
import type { Project } from "@/features/projects/types";
import type { ProjectMember } from "@/features/members/types";
import { AddMemberModal } from "./AddMemberModal";

const roleTone: Record<Role, string> = {
  owner: "var(--primary)",
  admin: "var(--info)",
  editor: "var(--success)",
  viewer: "var(--muted-foreground)",
};

const assignableRoles: Role[] = ["admin", "editor", "viewer"];

export function MembersScreen({ project, members }: { project: Project; members: ProjectMember[] }) {
  const router = useRouter();
  const me = useCurrentUser();
  const [adding, setAdding] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [error, setError] = useState("");
  const menuRef = useClickOutside<HTMLDivElement>(() => setMenu(null));
  const canManage = hasRole(project.myRole, "admin");

  const changeRole = async (userId: string, role: Role) => {
    setMenu(null);
    setError("");
    try {
      await apiFetch(`/api/projects/${project.id}/members/${userId}`, { method: "PATCH", body: JSON.stringify({ role }) });
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Ha ocurrido un error inesperado.");
    }
  };

  const remove = async (userId: string) => {
    setMenu(null);
    setError("");
    try {
      await apiFetch(`/api/projects/${project.id}/members/${userId}`, { method: "DELETE" });
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Ha ocurrido un error inesperado.");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-6 sm:px-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">Miembros del proyecto</h2>
          <p className="text-[13px] text-muted-foreground">{members.length} personas con acceso a {project.name}</p>
        </div>
        {canManage && <Button onClick={() => setAdding(true)}><Icon.plus width={17} height={17} /> Añadir miembro</Button>}
      </div>

      {error && <p className="mb-3 text-sm text-danger">{error}</p>}

      <Card className="divide-y divide-border">
        {members.map((m) => {
          const canManageThisRow = canManage && m.role !== "owner" && m.userId !== me.id;
          return (
            <div key={m.userId} className="flex items-center gap-3.5 px-4 py-3.5">
              <Avatar name={m.name} color={m.avatarColor} size={40} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground">{m.name}</div>
                <div className="truncate text-[13px] text-muted-foreground">{m.email}</div>
              </div>
              <span
                className="hidden rounded-md px-2 py-1 text-xs font-medium sm:inline-block"
                style={{ color: roleTone[m.role], background: `color-mix(in srgb, ${roleTone[m.role]} 12%, transparent)` }}
              >
                {es.enums.role[m.role]}
              </span>
              {canManageThisRow && (
                <div className="relative" ref={menu === m.userId ? menuRef : undefined}>
                  <IconButton onClick={() => setMenu(menu === m.userId ? null : m.userId)}>
                    <Icon.dots width={18} height={18} />
                  </IconButton>
                  {menu === m.userId && (
                    <div className="animate-dropdown absolute right-0 top-10 z-40 w-52 rounded-lg border border-border bg-popover p-1.5 shadow-[var(--shadow-lg)]">
                      <div className="px-2 pb-1.5 pt-1 text-xs font-medium text-muted-foreground">Cambiar rol</div>
                      {assignableRoles.map((r) => (
                        <button
                          key={r}
                          onClick={() => changeRole(m.userId, r)}
                          className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[13px] text-foreground hover:bg-secondary"
                        >
                          {es.enums.role[r]} {m.role === r && <Icon.check width={15} height={15} className="text-primary" />}
                        </button>
                      ))}
                      <div className="my-1 border-t border-border" />
                      <button onClick={() => remove(m.userId)} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-danger hover:bg-danger/8">
                        <Icon.trash width={15} height={15} /> Quitar del proyecto
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </Card>

      {adding && <AddMemberModal open onClose={() => setAdding(false)} projectId={project.id} existingUserIds={members.map((m) => m.userId)} />}
    </div>
  );
}
