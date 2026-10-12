'use client';

import { useState } from "react";
import { Button, Field, Input, Modal, Select, Spinner, Textarea } from "../../../components/ui";
import { es } from "../../../lib/i18n/es";
import { useStore } from "../../../store";
import type { Project } from "../../projects/types";
import { statusOrder, type Priority, type Status } from "../types";

export function TaskFormModal({
  open,
  onClose,
  project,
  initialStatus = "todo",
}: {
  open: boolean;
  onClose: () => void;
  project: Project;
  initialStatus?: Status;
}) {
  const { addTask, members } = useStore();
  const projMembers = members.filter((m) => project.memberIds.includes(m.id));
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [status, setStatus] = useState<Status>(initialStatus);
  const [assignee, setAssignee] = useState<string>(projMembers[0]?.id ?? "");
  const [due, setDue] = useState("2026-09-20");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const save = () => {
    if (title.trim().length < 3) return setErr("El título es obligatorio");
    setSaving(true);
    setTimeout(() => {
      addTask({ title, description: desc, priority, status, assigneeId: assignee || null, due, projectId: project.id, tags: [] });
      setSaving(false);
      onClose();
    }, 500);
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
        <Field label="Título" error={err}>
          <Input value={title} onChange={(e) => { setTitle(e.target.value); setErr(""); }} placeholder="Implementar autenticación" error={!!err} />
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
          <Field label="Asignado a">
            <Select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              <option value="">Sin asignar</option>
              {projMembers.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Fecha límite"><Input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></Field>
        </div>
      </div>
    </Modal>
  );
}
