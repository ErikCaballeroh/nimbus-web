'use client';

import { useMemo, useState } from "react";
import { Button, Field, Icon, Input, Modal, Select } from "../../../components/ui";
import { es } from "../../../lib/i18n/es";
import { useStore } from "../../../store";
import type { Role } from "../types";

const directory = [
  { name: "Diego Torres", email: "diego.torres@nimbus.io", color: "#0d9488" },
  { name: "Marta Sánchez", email: "marta.sanchez@nimbus.io", color: "#9333ea" },
  { name: "Pablo Navarro", email: "pablo.navarro@nimbus.io", color: "#e11d48" },
  { name: "Elena Castro", email: "elena.castro@nimbus.io", color: "#2563eb" },
];

const assignableRoles: Role[] = ["admin", "editor", "viewer"];

export function AddMemberModal({ open, onClose, projectId }: { open: boolean; onClose: () => void; projectId: string }) {
  const { addMember } = useStore();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<(typeof directory)[0] | null>(null);
  const [role, setRole] = useState<Role>("editor");
  const results = useMemo(
    () => directory.filter((d) => d.name.toLowerCase().includes(q.toLowerCase()) || d.email.includes(q.toLowerCase())),
    [q]
  );

  const invite = () => {
    if (!sel) return;
    addMember({ name: sel.name, email: sel.email, role, color: sel.color }, projectId);
    onClose();
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
          <Button onClick={invite} disabled={!sel}>Enviar invitación</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Icon.search width={16} height={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o correo…" className="pl-9" />
        </div>
        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
          {results.map((d) => (
            <button
              key={d.email}
              onClick={() => setSel(d)}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${sel?.email === d.email ? "border-primary bg-accent" : "border-transparent hover:bg-secondary"
                }`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold text-white" style={{ background: d.color }}>
                {d.name.split(" ").map((n) => n[0]).join("")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-foreground">{d.name}</div>
                <div className="truncate text-xs text-muted-foreground">{d.email}</div>
              </div>
              {sel?.email === d.email && <Icon.check width={18} height={18} className="text-primary" />}
            </button>
          ))}
          {results.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No se encontraron resultados.</p>}
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
