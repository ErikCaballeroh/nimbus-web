'use client';

import { useState } from "react";
import { Button, Field, Input, Modal, Textarea } from "../../../components/ui";
import { useStore } from "../../../store";
import type { Project } from "../types";

const palette = ["#4f46e5", "#0891b2", "#db2777", "#16a34a", "#ea580c", "#7c3aed"];

export function ProjectFormModal({
  open,
  onClose,
  project,
}: {
  open: boolean;
  onClose: () => void;
  project?: Project;
}) {
  const { addProject, updateProject } = useStore();
  const [name, setName] = useState(project?.name ?? "");
  const [desc, setDesc] = useState(project?.description ?? "");
  const [start, setStart] = useState(project?.start ?? "2026-09-01");
  const [end, setEnd] = useState(project?.end ?? "2026-12-01");
  const [color, setColor] = useState(project?.color ?? palette[0]);
  const [err, setErr] = useState("");

  const save = () => {
    if (name.trim().length < 3) return setErr("El nombre debe tener al menos 3 caracteres");
    if (project) updateProject(project.id, { name, description: desc, start, end, color });
    else addProject({ name, description: desc, start, end, color, memberIds: ["u1"] });
    onClose();
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
          <Button onClick={save}>{project ? "Guardar cambios" : "Crear proyecto"}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Nombre del proyecto" error={err}>
          <Input value={name} onChange={(e) => { setName(e.target.value); setErr(""); }} placeholder="Sitio Web Corporativo" error={!!err} />
        </Field>
        <Field label="Descripción">
          <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="¿Cuál es el objetivo de este proyecto?" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Fecha de inicio"><Input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></Field>
          <Field label="Fecha de entrega"><Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></Field>
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
