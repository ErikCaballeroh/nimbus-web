'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Icon, Input, Modal, Select } from "../../../components/ui";
import { es } from "../../../lib/i18n/es";
import { apiFetch, ApiClientError } from "../../../lib/apiClient";
import type { UserSummary } from "../../users/types";
import type { Role } from "../types";

const assignableRoles: Exclude<Role, "owner">[] = ["admin", "editor", "viewer"];

export function AddMemberModal({
  open,
  onClose,
  projectId,
  existingUserIds,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  existingUserIds: string[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<UserSummary[]>([]);
  const [sel, setSel] = useState<UserSummary | null>(null);
  const [role, setRole] = useState<Role>("editor");
  const [error, setError] = useState("");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    const query = q.trim();
    if (!query) return;
    const timeout = setTimeout(async () => {
      try {
        const users = await apiFetch<UserSummary[]>(`/api/users?search=${encodeURIComponent(query)}`);
        setResults(users.filter((u) => !existingUserIds.includes(u.id)));
      } catch {
        setResults([]);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [q, existingUserIds]);

  const displayResults = q.trim() ? results : [];

  const invite = async () => {
    if (!sel) return;
    setInviting(true);
    setError("");
    try {
      await apiFetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        body: JSON.stringify({ userId: sel.id, role }),
      });
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Ha ocurrido un error inesperado.");
    } finally {
      setInviting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Añadir miembro"
      subtitle="Busca personas de tu organización para invitarlas."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={invite} disabled={!sel || inviting}>Enviar invitación</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Icon.search width={16} height={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setSel(null); }} placeholder="Buscar por nombre o correo…" className="pl-9" />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
          {displayResults.map((u) => (
            <button
              key={u.id}
              onClick={() => setSel(u)}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${sel?.id === u.id ? "border-primary bg-accent" : "border-transparent hover:bg-secondary"
                }`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold text-white" style={{ background: u.avatarColor }}>
                {u.name.split(" ").map((n) => n[0]).join("")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-foreground">{u.name}</div>
                <div className="truncate text-xs text-muted-foreground">{u.email}</div>
              </div>
              {sel?.id === u.id && <Icon.check width={18} height={18} className="text-primary" />}
            </button>
          ))}
          {q.trim() && displayResults.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No se encontraron resultados.</p>}
        </div>
        {sel && (
          <Field label="Rol">
            <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
              {assignableRoles.map((r) => <option key={r} value={r}>{es.enums.role[r]}</option>)}
            </Select>
          </Field>
        )}
      </div>
    </Modal>
  );
}
