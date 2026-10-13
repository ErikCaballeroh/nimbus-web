'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Input, Modal, Textarea } from "@/components/ui";
import { apiFetch, ApiClientError, fieldErrorsFromDetails } from "@/lib/apiClient";
import type { ProjectListItem } from "@/features/projects/types";

const palette = ["#4f46e5", "#0891b2", "#db2777", "#16a34a", "#ea580c", "#7c3aed"];

export function ProjectFormModal({
  open,
  onClose,
  project,
}: {
  open: boolean;
  onClose: () => void;
  project?: ProjectListItem;
}) {
  const router = useRouter();
  const [name, setName] = useState(project?.name ?? "");
  const [desc, setDesc] = useState(project?.description ?? "");
  const [start, setStart] = useState(project?.startDate?.slice(0, 10) ?? "");
  const [end, setEnd] = useState(project?.endDate?.slice(0, 10) ?? "");
  const [color, setColor] = useState(project?.color ?? palette[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setErrors({});
    setSaving(true);
    try {
      const body = {
        name,
        description: desc || undefined,
        color,
        startDate: start || undefined,
        endDate: end || undefined,
      };
      if (project) await apiFetch(`/api/projects/${project.id}`, { method: "PATCH", body: JSON.stringify(body) });
      else await apiFetch("/api/projects", { method: "POST", body: JSON.stringify(body) });
      router.refresh();
      onClose();
    } catch (err) {
      if (err instanceof ApiClientError) {
        const fieldErrors = fieldErrorsFromDetails(err.details);
        setErrors(Object.keys(fieldErrors).length ? fieldErrors : { name: err.message });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={project ? "Editar proyecto" : "Crear proyecto"}
      subtitle={project ? "Actualiza los detalles del proyecto." : "Organiza el trabajo de tu equipo en un nuevo proyecto."}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>{project ? "Guardar cambios" : "Crear proyecto"}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Nombre del proyecto" error={errors.name}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sitio Web Corporativo" error={!!errors.name} />
        </Field>
        <Field label="Descripción">
          <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="¿Cuál es el objetivo de este proyecto?" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Fecha de inicio"><Input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></Field>
          <Field label="Fecha de entrega" error={errors.endDate}><Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} error={!!errors.endDate} /></Field>
        </div>
        <Field label="Color">
          <div className="flex gap-2">
            {palette.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`h-8 w-8 rounded-lg transition-transform active:scale-90 ${color === c ? "ring-2 ring-offset-2 ring-offset-card" : ""}`}
                style={{ background: c, boxShadow: color === c ? `0 0 0 2px ${c}` : undefined }}
              />
            ))}
          </div>
        </Field>
      </div>
    </Modal>
  );
}
