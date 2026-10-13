'use client';

import { useState } from "react";
import { Button, Field, Input, Modal, Select, Spinner, Textarea } from "@/components/ui";
import { es } from "@/lib/i18n/es";
import { apiFetch, ApiClientError, fieldErrorsFromDetails } from "@/lib/apiClient";
import type { Project } from "@/features/projects/types";
import type { ProjectMember } from "@/features/members/types";
import { statusOrder, type Priority, type Status } from "@/features/tasks/types";

export function TaskFormModal({
  open,
  onClose,
  project,
  members,
  initialStatus = "todo",
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  project: Project;
  members: ProjectMember[];
  initialStatus?: Status;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [status, setStatus] = useState<Status>(initialStatus);
  const [assignee, setAssignee] = useState<string>("");
  const [due, setDue] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setErrors({});
    setSaving(true);
    try {
      await apiFetch(`/api/projects/${project.id}/tasks`, {
        method: "POST",
        body: JSON.stringify({
          title,
          description: desc || undefined,
          priority,
          status,
          assigneeId: assignee || undefined,
          dueDate: due || undefined,
        }),
      });
      onSaved();
      onClose();
    } catch (err) {
      if (err instanceof ApiClientError) {
        const fieldErrors = fieldErrorsFromDetails(err.details);
        setErrors(Object.keys(fieldErrors).length ? fieldErrors : { title: err.message });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Crear tarea"
      subtitle={`En ${project.name}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>{saving ? <Spinner /> : "Crear tarea"}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Título" error={errors.title}>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Implementar autenticación" error={!!errors.title} />
        </Field>
        <Field label="Descripción">
          <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Detalles, criterios de aceptación…" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Prioridad">
            <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              {(Object.keys(es.enums.priority) as Priority[]).map((p) => (
                <option key={p} value={p}>{es.enums.priority[p]}</option>
              ))}
            </Select>
          </Field>
          <Field label="Estado">
            <Select value={status} onChange={(e) => setStatus(e.target.value as Status)}>
              {statusOrder.map((s) => (
                <option key={s} value={s}>{es.enums.status[s]}</option>
              ))}
            </Select>
          </Field>
          <Field label="Asignado a" error={errors.assigneeId}>
            <Select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              <option value="">Sin asignar</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>{m.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Fecha límite"><Input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></Field>
        </div>
      </div>
    </Modal>
  );
}
